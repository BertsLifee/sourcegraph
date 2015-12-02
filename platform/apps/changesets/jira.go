/*
This package contains a basic integration between JIRA and Changesets. This
should eventually be factored into its own app.
*/
package changesets

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"regexp"

	"golang.org/x/net/context"

	approuter "src.sourcegraph.com/sourcegraph/app/router"
	"src.sourcegraph.com/sourcegraph/conf"
	"src.sourcegraph.com/sourcegraph/go-sourcegraph/sourcegraph"
)

const sgIconURL = "https://sourcegraph.com/images/favicon.png"
const acceptIconURL = "http://www.openwebgraphics.com/resources/data/47/accept.png"

type jiraIcon struct {
	URL   string `json:"url16x16"`
	Title string `json:"title"`
}

type jiraStatus struct {
	Resolved bool      `json:"resolved"`
	Icon     *jiraIcon `json:"icon,omitempty"`
}

type jiraRemoteLink struct {
	URL    string      `json:"url"`
	Title  string      `json:"title"`
	Icon   *jiraIcon   `json:"icon"`
	Status *jiraStatus `json:"status"`
}

func jiraOnChangesetUpdate(ctx context.Context, cs *sourcegraph.Changeset) {
	sg := sourcegraph.NewClientFromContext(ctx)

	delta, err := sg.Deltas.Get(ctx, &sourcegraph.DeltaSpec{
		Base: cs.DeltaSpec.Base,
		Head: cs.DeltaSpec.Head,
	})
	if err != nil {
		return
	}

	commitList, err := sg.Repos.ListCommits(ctx, &sourcegraph.ReposListCommitsOp{
		Repo: cs.DeltaSpec.Base.RepoSpec,
		Opt: &sourcegraph.RepoListCommitsOptions{
			Base:        string(delta.BaseCommit.ID),
			Head:        string(delta.HeadCommit.ID),
			ListOptions: sourcegraph.ListOptions{PerPage: -1},
		},
	})
	if err != nil {
		return
	}

	// Parse any mentioned JIRA issues from the changeset and message of each
	// commit.
	issueIDs := make(map[string]bool)
	ids := make([]string, 0)
	for _, commit := range commitList.Commits {
		ids = append(ids, parseJIRAIssues(commit.Message)...)
	}
	if cs.Description != "" {
		ids = append(ids, parseJIRAIssues(cs.Description)...)
	}
	for _, id := range ids {
		issueIDs[id] = true
	}

	for id := range issueIDs {
		// Manually contrust the changeset URL (as opposed to using urlToChangeset)
		// since BaseURI only works on request contexts.
		url := fmt.Sprintf("%s%s/.changes/%d", conf.AppURL(ctx).String(), approuter.Rel.URLToRepo(cs.DeltaSpec.Base.RepoSpec.URI).String(), cs.ID)
		title := fmt.Sprintf("Sourcegraph Changeset #%d", cs.ID)
		postJIRARemoteLink(id, url, title, cs.ClosedAt != nil)
	}
}

// parseJIRAIssues parses any IDs corresponding to a JIRA issue out of a string.
func parseJIRAIssues(body string) []string {
	re := regexp.MustCompile("JIRA Issues:(.*)")
	issuesLine := re.FindStringSubmatch(body)
	if len(issuesLine) < 1 {
		return nil
	}

	re = regexp.MustCompile("\\b[A-Z]+-[1-9]+\\b")
	return re.FindAllString(issuesLine[0], -1)
}

// postJIRARemoteLink posts a new remote link to a specified JIRA issue.
func postJIRARemoteLink(issue string, linkURL string, title string, resolved bool) error {
	auth := flags.JiraCredentials
	if auth == "" {
		auth = os.Getenv("SG_JIRA_CREDENTIALS")
	}

	if flags.JiraURL == "" || auth == "" {
		return errors.New("JIRA URL and credentials not configured")
	}

	var statusIcon *jiraIcon
	if resolved {
		statusIcon = &jiraIcon{
			URL:   acceptIconURL,
			Title: "Closed",
		}
	}

	jiraURL, err := url.Parse(flags.JiraURL)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s://%s@%s/rest/api/2/issue/%s/remotelink", jiraURL.Scheme, auth, jiraURL.Host, issue)
	payload := struct {
		GlobalID       string `json:"globalId"`
		jiraRemoteLink `json:"object"`
	}{
		GlobalID: linkURL,
		jiraRemoteLink: jiraRemoteLink{
			URL:   linkURL,
			Title: title,
			Icon: &jiraIcon{
				URL:   sgIconURL,
				Title: "Sourcegraph",
			},
			Status: &jiraStatus{
				Resolved: resolved,
				Icon:     statusIcon,
			},
		},
	}

	b, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	_, err = http.Post(url, "application/json", bytes.NewReader(b))
	if err != nil {
		return err
	}

	return nil
}
