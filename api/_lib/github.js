/**
 * Minimal GitHub Contents API client for reading and committing the
 * Selected Work data file. Server-side only — the token never reaches the
 * browser. Committing the file is what triggers Vercel's auto-deploy.
 *
 * Required env:
 *   GITHUB_TOKEN     - PAT (fine-grained: Contents read/write on the repo)
 *   GITHUB_REPO      - "owner/repo" of the frontend repository
 *   GITHUB_BRANCH    - target branch (default "main")
 *   GITHUB_FILE_PATH - path to the data file IN THE REPO
 *                      (default "src/data/selectedWork.json")
 */
const API = "https://api.github.com";

export function githubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const path = process.env.GITHUB_FILE_PATH || "src/data/selectedWork.json";
  const missing = [];
  if (!token) missing.push("GITHUB_TOKEN");
  if (!repo) missing.push("GITHUB_REPO");
  return { token, repo, branch, path, missing };
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "athion-portfolio-admin",
  };
}

/** Read the data file. Returns { items, sha } (sha is null if not found). */
export async function readDataFile() {
  const { token, repo, branch, path } = githubConfig();
  const url = `${API}/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, { headers: headers(token) });

  if (res.status === 404) return { items: [], sha: null };
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub read failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  const decoded = Buffer.from(json.content, "base64").toString("utf8");
  let items = [];
  try {
    items = JSON.parse(decoded);
  } catch {
    throw new Error("Existing data file is not valid JSON");
  }
  return { items, sha: json.sha };
}

/** Commit the new items array. Re-reads the latest sha to avoid conflicts. */
export async function writeDataFile(items, message) {
  const { token, repo, branch, path } = githubConfig();
  const { sha } = await readDataFile();

  const body = {
    message: message || "chore(admin): update selected work",
    content: Buffer.from(JSON.stringify(items, null, 2) + "\n", "utf8").toString("base64"),
    branch,
  };
  if (sha) body.sha = sha;

  const url = `${API}/repos/${repo}/contents/${encodeURIComponent(path)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub commit failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  return {
    commitSha: json.commit?.sha,
    commitUrl: json.commit?.html_url,
  };
}
