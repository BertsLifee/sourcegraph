package main

import (
	"context"
	"io"
	"log"
	"strconv"
	"time"

	logger "github.com/sourcegraph/log"
	"github.com/sourcegraph/sourcegraph/internal/grpc/defaults"
	pb "github.com/sourcegraph/sourcegraph/internal/grpc/example/weather/v1"
	"github.com/sourcegraph/sourcegraph/lib/errors"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func main() {
	l := logger.Scoped("weather-client")

	conn, err := defaults.Dial("localhost:50051", l)
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	client := pb.NewWeatherServiceClient(conn)

	// Unary RPC: Normal case - get weather for a specific location

	weather, err := client.GetCurrentWeather(context.Background(), &pb.LocationRequest{Location: "New York"})
	if err != nil {
		log.Fatalf("Could not get weather: %v", err)
	}

	// We use the generated getter method to safety access the location
	// since there are no required fields in Protobuf messages:
	// The getters return the zero value for the type if the field is not set.
	//
	// See https://protobuf.dev/programming-guides/field_presence/ and https://stackoverflow.com/a/42634681 for more information.
	w, t := weather.GetDescription(), weather.GetTemperature()
	log.Printf("Weather in NYC - description: %s, temp: %f", w, t)

	// Unary RPC: Error case - get weather for a specific location (that doesn't exist for didactic purposes)
	weather, err = client.GetCurrentWeather(context.Background(), &pb.LocationRequest{Location: "Ravenholm"})

	log.Printf("This is what a gRPC status error looks like: %v", err)

	if status.Code(err) != codes.InvalidArgument { // You can extract the error code from the error object using the status.Code function, and then assert on it.
		log.Fatalf("Expected InvalidArgument error for going to Ravenholm, got %v, code: %s", err, status.Code(err))
	}

	// Server Streaming RPC: get weather alerts for a specific region
	ctx, cancel := context.WithDeadline(context.Background(), time.Now().Add(5*time.Second)) // Set a deadline for the RPC
	defer cancel()

	alertStream, err := client.SubscribeWeatherAlerts(ctx, &pb.AlertRequest{Region: "Midwest"})
	if err != nil {
		log.Fatalf("Error on subscribe weather alerts: %v", err)
	}

	for {
		select {
		case <-ctx.Done():
			goto clientstreaming

		default:
			alert, err := alertStream.Recv()
			if errors.Is(err, io.EOF) {
				goto clientstreaming // The server closed the stream
			}

			if ctx.Err() != nil {
				goto clientstreaming // We canceled the RPC ourselves
			}

			if err != nil {
				log.Fatalf("Error while receiving alert: %v", err)
			}
			log.Printf("Alert: %v", alert)
		}
	}

clientstreaming:

	// Client Streaming RPC: upload fake weather data
	dataStream, err := client.UploadWeatherData(context.Background())
	if err != nil {
		log.Fatalf("Error on upload weather data: %v", err)
	}
	for i := 0; i < 5; i++ {
		err := dataStream.Send(&pb.SensorData{
			SensorId:    "sensor-123",
			Temperature: 26.5,
			Humidity:    80.0,
		})
		if err != nil {
			log.Fatalf("Error while sending data: %v", err)
		}
		time.Sleep(time.Second)
	}
	uploadStatus, err := dataStream.CloseAndRecv() // CloseAndRecv closes our end of the stream (indicating that we're doing sending) and returns the response from the server.
	if err != nil {
		log.Fatalf("Error while receiving upload status: %v", err)
	}
	log.Printf("Upload status: %s", uploadStatus.GetMessage())

	// Bidirectional Streaming RPC
	biStream, err := client.RealTimeWeather(context.Background())
	if err != nil {
		log.Fatalf("Error on real-time weather: %v", err)
	}

	go func() { // Receive messages from the server in a separate goroutine
		for {
			weather, err := biStream.Recv()
			if errors.Is(err, io.EOF) {
				return
			}
			if err != nil {
				log.Fatalf("Error while receiving weather: %v", err)
				return
			}
			log.Printf("Real-time weather: %v", weather)
		}
	}()

	for i := 0; i < 5; i++ { // send location information to the server
		err := biStream.Send(&pb.LocationUpdate{
			Location: "Location " + strconv.Itoa(i),
		})
		if err != nil {
			log.Fatalf("Error while sending location update: %v", err)
		}
		time.Sleep(2 * time.Second)
	}

	err = biStream.CloseSend()
	if err != nil {
		log.Fatalf("Error while closing client end of bidirectional stream: %v", err)
	}
}
