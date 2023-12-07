"""
Load external dependencies for base images
"""

load("@rules_oci//oci:pull.bzl", "oci_pull")

# Quick script to get the latest tags for each of the base images from GCR:
#
# grep 'image = ' ./dev/oci_deps.bzl | while read -r str ; do
#   str_no_spaces="${str#"${str%%[![:space:]]*}"}"  # remove leading spaces
#   url="${str_no_spaces#*\"}"  # remove prefix until first quote
#   url="${url%%\"*}"  # remove suffix from first quote
#
#   IMAGE_DETAILS=$(gcloud container images list-tags $url --limit=1 --sort-by=~timestamp --format=json)
#   TAG=$(echo $IMAGE_DETAILS | jq -r '.[0].tags[0]')
#   DIGEST=$(echo $IMAGE_DETAILS | jq -r '.[0].digest')
#
#   echo $url
#   echo $DIGEST
# done
#
#
# Quick script to get the latest tags for each of the base images from Dockerhub:
# grep 'image = ' ./dev/oci_deps.bzl | while read -r str ; do
#   str_no_spaces="${str#"${str%%[![:space:]]*}"}"  # remove leading spaces
#   url="${str_no_spaces#*\"}"  # remove prefix until first quote
#   url="${url%%\"*}"  # remove suffix from first quote

#     TOKEN=$(curl -s "https://auth.docker.io/token?service=registry.docker.io&scope=repository:${url}:pull" | jq -r .token)

#   DIGEST=$(curl -I -s -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.docker.distribution.manifest.v2+json" \
#     https://registry-1.docker.io/v2/${url}/manifests/latest \
#     | grep -i Docker-Content-Digest | awk '{print $2}')

#   echo -e "$url\n$DIGEST\n\n"
# done

def oci_deps():
    """
    The image definitions and their digests
    """
    oci_pull(
        name = "wolfi_base",
        digest = "sha256:2e62fb94371e2c000248687365d6f45d66a57ecd4b3d053b807c4af8e17e63a3",
        image = "index.docker.io/sourcegraph/wolfi-sourcegraph-base",
    )

    oci_pull(
        name = "wolfi_cadvisor_base",
        digest = "sha256:995179ff3475e678d674cbd16b8ffab259d64e85cb6e96307acb2c92f725cbbb",
        image = "index.docker.io/sourcegraph/wolfi-cadvisor-base",
    )

    oci_pull(
        name = "wolfi_symbols_base",
        digest = "sha256:1ee84ba791b266be0f116eed954ce4ab3aee54e54fae07cde73958e4f01744c8",
        image = "index.docker.io/sourcegraph/wolfi-symbols-base",
    )

    oci_pull(
        name = "wolfi_server_base",
        digest = "sha256:6346c60cfba238324c39ed79abe60a2443e423ed9df419ab9800759b261e9fad",
        image = "index.docker.io/sourcegraph/wolfi-server-base",
    )

    oci_pull(
        name = "wolfi_gitserver_base",
        digest = "sha256:4a0074cdcab78aa8603d671414bf14684df6e5adbd23f979ade0860199475d30",
        image = "index.docker.io/sourcegraph/wolfi-gitserver-base",
    )

    oci_pull(
        name = "wolfi_grafana_base",
        digest = "sha256:461ef0c0233c20716398a0ad1a38dc2df955e26ec091400f64a18fa7de9d2621",
        image = "us.gcr.io/sourcegraph-dev/wolfi-grafana",
    )

    oci_pull(
        name = "wolfi_postgres_exporter_base",
        digest = "sha256:daf7691fe11f7db72aeea92b700d7a611bc916eea7aec4627da4bebb668bcf57",
        image = "index.docker.io/sourcegraph/wolfi-postgres-exporter-base",
    )

    oci_pull(
        name = "wolfi_jaeger_all_in_one_base",
        digest = "sha256:d833b8fc28233539d11c1ffbf675d33cd60e70b70e53cd71dc2cce74918e07ee",
        image = "index.docker.io/sourcegraph/wolfi-jaeger-all-in-one-base",
    )

    oci_pull(
        name = "wolfi_jaeger_agent_base",
        digest = "sha256:d50d1dc95284b0c0223cbbcf05945f1cea49e33f668b79bd16fa536f2c83ccee",
        image = "index.docker.io/sourcegraph/wolfi-jaeger-agent-base",
    )

    oci_pull(
        name = "wolfi_redis_base",
        digest = "sha256:d9ea2b26e5b172faee3a5cf5184f7f0c6a11d684a5c97a0b417ee495b16a3b42",
        image = "index.docker.io/sourcegraph/wolfi-redis-base",
    )

    oci_pull(
        name = "wolfi_redis_exporter_base",
        digest = "sha256:df3fdd95d3a0a845b32d81e59ef6b5f4b72769db1a7d4777bd0ff055b358e6c6",
        image = "index.docker.io/sourcegraph/wolfi-redis-exporter-base",
    )

    oci_pull(
        name = "wolfi_syntax_highlighter_base",
        digest = "sha256:4fbbe0dd47185fa0cd7da93ac354fbfe2842425f89658334c010cd37bfe3c5ab",
        image = "index.docker.io/sourcegraph/wolfi-syntax-highlighter-base",
    )

    oci_pull(
        name = "wolfi_search_indexer_base",
        digest = "sha256:c351974669f37458221f2965de2c95ee71cae6357baad7435163fc3291247944",
        image = "index.docker.io/sourcegraph/wolfi-search-indexer-base",
    )

    oci_pull(
        name = "wolfi_repo_updater_base",
        digest = "sha256:996daf71d40972ce6365938b3350c4a7d6ecdc51fa8a91339ceca28396513961",
        image = "index.docker.io/sourcegraph/wolfi-repo-updater-base",
    )

    oci_pull(
        name = "wolfi_searcher_base",
        digest = "sha256:3fdb041d2ce737d121b68a187825598b884faaec16b54e13216ebada963610a0",
        image = "index.docker.io/sourcegraph/wolfi-searcher-base",
    )

    oci_pull(
        name = "wolfi_executor_base",
        digest = "sha256:dcac24555b5a6ce162c32c67a037817753648ba4b6a69d8c09fc52d36ad3cb2c",
        image = "index.docker.io/sourcegraph/wolfi-executor-base",
    )

    # ???
    oci_pull(
        name = "wolfi_bundled_executor_base",
        digest = "sha256:330dce3f0a7b004500414b04e80cf88fdb133819075847c9a5e08d192e9b65e3",
        image = "index.docker.io/sourcegraph/wolfi-bundled-executor-base",
    )

    oci_pull(
        name = "wolfi_executor_kubernetes_base",
        digest = "sha256:7919f575b6c379448950a0269413a4b0dbfaff48cc9cd20da6dff9611e72a092",
        image = "index.docker.io/sourcegraph/wolfi-executor-kubernetes-base",
    )

    oci_pull(
        name = "wolfi_batcheshelper_base",
        digest = "sha256:474720dea5ca0f0e0b00ff4fffef48b2150298eac26f92dd7e8251679c25ac7d",
        image = "index.docker.io/sourcegraph/wolfi-batcheshelper-base",
    )

    oci_pull(
        name = "wolfi_prometheus_base",
        digest = "sha256:b64caa3300dd89a1059e931f76ae1a454291a76874288ed51a7ff1e2d9c32e9c",
        image = "index.docker.io/sourcegraph/wolfi-prometheus-base",
    )

    oci_pull(
        name = "wolfi_prometheus_gcp_base",
        digest = "sha256:d8d03b6062c181f6ebb5a39491d00e24391b888287e82a16a85422d1d7bd38e3",
        image = "index.docker.io/sourcegraph/wolfi-prometheus-gcp-base",
    )

    oci_pull(
        name = "wolfi_postgresql-12_base",
        digest = "sha256:38bf0584e18106a69dcde3a9044258bdcc293913e8c0418c525da24e6c502a9c",
        image = "index.docker.io/sourcegraph/wolfi-postgresql-12-base",
    )

    oci_pull(
        name = "wolfi_postgresql-12-codeinsights_base",
        digest = "sha256:f6ebb3556ee7f8fe091ddfe2ec9ebe8efd6345ab5db826a98e65f03d03b668fb",
        image = "index.docker.io/sourcegraph/wolfi-postgresql-12-codeinsights-base",
    )

    oci_pull(
        name = "wolfi_node_exporter_base",
        digest = "sha256:905e87a8b34a26e6c744719902e4bbb0c02aa6ce93bd94ad961a65a699d87040",
        image = "index.docker.io/sourcegraph/wolfi-node-exporter-base",
    )

    oci_pull(
        name = "wolfi_opentelemetry_collector_base",
        digest = "sha256:baa31718158c2dc709ecd45d8ab32f43e16d6de42708556d2e2983e9068afe8f",
        image = "index.docker.io/sourcegraph/wolfi-opentelemetry-collector-base",
    )

    oci_pull(
        name = "wolfi_searcher_base",
        digest = "sha256:3fdb041d2ce737d121b68a187825598b884faaec16b54e13216ebada963610a0",
        image = "index.docker.io/sourcegraph/wolfi-searcher-base",
    )

    oci_pull(
        name = "wolfi_s3proxy_base",
        digest = "sha256:ee0c391f29149aee806e226adab80846f8fe3cee0fbe95b7814976f5b174d395",
        image = "index.docker.io/sourcegraph/wolfi-blobstore-base",
    )

    oci_pull(
        name = "wolfi_qdrant_base",
        digest = "sha256:3eebc4173f7012b6fc5479beea2c33eb999e3261cb79134ee4f5bfca5b87ef77",
        image = "index.docker.io/sourcegraph/wolfi-qdrant-base",
    )

    # The following image digests are from tag 252535_2023-11-28_5.2-82b5f4f5d73f. sg wolfi update-hashes DOES NOT update these digests.
    # To rebuild these legacy images using docker and outside of bazel you can either push a branch to:
    # - docker-images-candidates-notest/<your banch name here>
    # or you can run `sg ci build docker-images-candidates-notest`
    oci_pull(
        name = "legacy_alpine-3.14_base",
        digest = "sha256:581afabd476b4918b14295ae6dd184f4a3783c64bab8bde9ad7b11ea984498a8",
        image = "index.docker.io/sourcegraph/alpine-3.14",
    )

    oci_pull(
        name = "legacy_dind_base",
        digest = "sha256:0893c2e6103cde39b609efea0ebd6423c7af8dafdf19d613debbc12b05fefd54",
        image = "index.docker.io/sourcegraph/dind",
    )

    oci_pull(
        name = "legacy_executor-vm_base",
        digest = "sha256:4b23a8bbfa9e1f5c80b167e59c7f0d07e40b4af52494c22da088a1c97925a3e2",
        image = "index.docker.io/sourcegraph/executor-vm",
    )

    oci_pull(
        name = "legacy_codeinsights-db_base",
        digest = "sha256:c2384743265457f816d83358d8fb4810b9aac9f049fd462d1f630174076e0d94",
        image = "index.docker.io/sourcegraph/codeinsights-db",
    )

    oci_pull(
        name = "legacy_codeintel-db_base",
        digest = "sha256:dcc32a6d845356288186f2ced62346cf7e0120977ff1a0d6758f4e11120401f7",
        image = "index.docker.io/sourcegraph/codeintel-db",
    )

    oci_pull(
        name = "legacy_postgres-12-alpine_base",
        digest = "sha256:dcc32a6d845356288186f2ced62346cf7e0120977ff1a0d6758f4e11120401f7",
        image = "index.docker.io/sourcegraph/postgres-12-alpine",
    )
