
export interface GitHubStats {
    totalContributions: number;
    weeks: {
        contributionDays: {
            contributionCount: number;
            date: string;
        }[];
    }[];
}

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

// Mock data to use when no token is present
const MOCK_DATA: GitHubStats = {
    totalContributions: 1337,
    weeks: Array.from({ length: 53 }, (_, w) => ({
        contributionDays: Array.from({ length: 7 }, (_, d) => ({
            contributionCount: Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0,
            date: new Date(Date.now() - (52 - w) * 7 * 24 * 60 * 60 * 1000 - d * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })),
    })),
};

export async function fetchGitHubStats(username: string): Promise<GitHubStats> {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        console.warn("GITHUB_TOKEN not found, returning mock data");
        return MOCK_DATA;
    }

    const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

    try {
        const res = await fetch(GITHUB_GRAPHQL_API, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
                variables: { username },
            }),
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`GitHub API error: ${res.status} ${res.statusText}`, errorText);
            // Fallback to mock data on error to keep UI alive
            return MOCK_DATA;
        }

        const json = await res.json();

        if (json.errors) {
            console.error("GitHub GraphQL errors:", json.errors);
            return MOCK_DATA;
        }

        return json.data.user.contributionsCollection.contributionCalendar;
    } catch (error) {
        console.error("Failed to fetch GitHub stats:", error);
        return MOCK_DATA;
    }
}
