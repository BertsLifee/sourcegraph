package reposource

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParseNpmDependency(t *testing.T) {
	table := []struct {
		testName string
		expect   bool
	}{
		{"@scope/package@1.2.3-abc", true},
		{"package@latest", true},
		{"@scope/package@latest", true},
		{"package@1.2.3", true},
		{"package.js@1.2.3", true},
		{"package-1.2.3", false},
		{"@scope/package", false},
		{"@weird.scope/package@1.2.3", true},
		{"@scope/package.js@1.2.3", true},
		{"package@1$%", false},
		{"@scope-package@1.2.3", false},
		{"@/package@1.2.3", false},
		{"@scope/@1.2.3", false},
		{"@dashed-scope/abc@0", true},
		{"@a.b-c.d-e/f.g--h.ijk-l@0.1-abc", true},
		{"@A.B-C.D-E/F.G--H.IJK-L@0.1-ABC", true},
	}
	for _, entry := range table {
		dep, err := ParseNpmDependency(entry.testName)
		if entry.expect && (err != nil) {
			t.Errorf("expected success but got error '%s' when parsing %s",
				err.Error(), entry.testName)
		} else if !entry.expect && err == nil {
			t.Errorf("expected error but successfully parsed %s into %+v", entry.testName, dep)
		}
	}
}

func TestSortNpmDependencies(t *testing.T) {
	dependencies := []*NpmDependency{
		parseNpmDependencyOrPanic(t, "ac@1.2.0"),
		parseNpmDependencyOrPanic(t, "ab@1.2.0.Final"),
		parseNpmDependencyOrPanic(t, "aa@1.2.0"),
		parseNpmDependencyOrPanic(t, "ab@1.2.0"),
		parseNpmDependencyOrPanic(t, "ab@1.11.0"),
		parseNpmDependencyOrPanic(t, "ab@1.2.0-M11"),
		parseNpmDependencyOrPanic(t, "ab@1.2.0-M1"),
		parseNpmDependencyOrPanic(t, "ab@1.2.0-RC11"),
		parseNpmDependencyOrPanic(t, "ab@1.2.0-RC1"),
		parseNpmDependencyOrPanic(t, "ab@1.1.0"),
	}
	expected := []*NpmDependency{
		parseNpmDependencyOrPanic(t, "ac@1.2.0"),
		parseNpmDependencyOrPanic(t, "ab@1.11.0"),
		parseNpmDependencyOrPanic(t, "ab@1.2.0"),
		parseNpmDependencyOrPanic(t, "ab@1.2.0.Final"),
		parseNpmDependencyOrPanic(t, "ab@1.2.0-RC11"),
		parseNpmDependencyOrPanic(t, "ab@1.2.0-RC1"),
		parseNpmDependencyOrPanic(t, "ab@1.2.0-M11"),
		parseNpmDependencyOrPanic(t, "ab@1.2.0-M1"),
		parseNpmDependencyOrPanic(t, "ab@1.1.0"),
		parseNpmDependencyOrPanic(t, "aa@1.2.0"),
	}
	SortNpmDependencies(dependencies)
	assert.Equal(t, expected, dependencies)
}

func parseNpmDependencyOrPanic(t *testing.T, value string) *NpmDependency {
	dependency, err := ParseNpmDependency(value)
	if err != nil {
		t.Fatalf("error=%s", err)
	}
	return dependency
}
