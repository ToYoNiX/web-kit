// Redeploys every toyonix site (spec §8.3). Run by .github/workflows/sync-sites.yml.
//
//   GH_TOKEN     fine-grained PAT with Actions read/write on the site repos (required)
//   OWNER        GitHub user/org that owns the sites (required)
//   KIT_VERSION  wait until this kit version is on npm before dispatching (optional)
//   TOPIC        repo topic marking a site (default: toyonix-site)
//   WORKFLOW     workflow file to dispatch in each site (default: deploy.yml)
//
// Root (<owner>.github.io) deploys first and alone, so /registry.json is fresh before the other
// sites bake their build-time snapshot. Then all other sites deploy in parallel.
import { appendFile } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";

const { GH_TOKEN, OWNER, KIT_VERSION, GITHUB_STEP_SUMMARY } = process.env;
const TOPIC = process.env.TOPIC || "toyonix-site";
const WORKFLOW = process.env.WORKFLOW || "deploy.yml";
const RUN_TIMEOUT_MS = 30 * 60_000;
const NPM_TIMEOUT_MS = 10 * 60_000;

if (!GH_TOKEN) fail("GH_TOKEN is not set. Add the SITES_DISPATCH_TOKEN secret to web-kit.");
if (!OWNER) fail("OWNER is not set.");

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

async function gh(path, init = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${GH_TOKEN}`,
      "x-github-api-version": "2022-11-28",
      ...init.headers,
    },
  });
  return response;
}

async function ghJson(path) {
  const response = await gh(path);
  if (!response.ok) throw new Error(`GET ${path}: ${response.status} ${await response.text()}`);
  return response.json();
}

async function waitForNpm(version) {
  const url = `https://registry.npmjs.org/@toyonix%2fweb-kit/${encodeURIComponent(version)}`;
  const deadline = Date.now() + NPM_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const response = await fetch(url);
    if (response.ok) {
      console.log(`@toyonix/web-kit@${version} is on npm.`);
      return;
    }
    console.log(`Waiting for @toyonix/web-kit@${version} on npm…`);
    await sleep(15_000);
  }
  fail(`@toyonix/web-kit@${version} did not appear on npm within ${NPM_TIMEOUT_MS / 60_000} minutes.`);
}

async function listSites() {
  const query = encodeURIComponent(`topic:${TOPIC} user:${OWNER}`);
  const repos = [];
  for (let page = 1; ; page++) {
    const body = await ghJson(`/search/repositories?q=${query}&per_page=100&page=${page}`);
    repos.push(...body.items);
    if (body.items.length < 100 || repos.length >= body.total_count) break;
  }
  const isRoot = (repo) => repo.name.toLowerCase().endsWith(".github.io");
  const active = repos.filter((repo) => !repo.archived && !repo.fork);

  let root = active.find(isRoot);
  if (!root) {
    // Root may not carry the topic; it's a site regardless.
    const response = await gh(`/repos/${OWNER}/${OWNER.toLowerCase()}.github.io`);
    if (response.ok) root = await response.json();
  }
  return { root, others: active.filter((repo) => !isRoot(repo)) };
}

async function dispatch(repo) {
  const startedAt = new Date(Date.now() - 5_000);
  const response = await gh(`/repos/${OWNER}/${repo.name}/actions/workflows/${WORKFLOW}/dispatches`, {
    method: "POST",
    body: JSON.stringify({ ref: repo.default_branch, return_run_details: true }),
  });
  if (response.status === 404) throw new Error(`no ${WORKFLOW} workflow (or the token can't see it)`);
  if (!response.ok) throw new Error(`dispatch failed: ${response.status} ${await response.text()}`);

  if (response.status === 200) {
    const body = await response.json().catch(() => ({}));
    if (body.workflow_run_id) return body.workflow_run_id;
  }

  // Older API behaviour (204, no body): find the run we just created.
  const created = encodeURIComponent(`>=${startedAt.toISOString()}`);
  for (let attempt = 0; attempt < 20; attempt++) {
    await sleep(3_000);
    const { workflow_runs: runs } = await ghJson(
      `/repos/${OWNER}/${repo.name}/actions/workflows/${WORKFLOW}/runs?event=workflow_dispatch&created=${created}&per_page=5`,
    );
    if (runs.length) return runs[0].id;
  }
  throw new Error("dispatched, but couldn't find the run");
}

async function waitForRun(repo, runId) {
  const deadline = Date.now() + RUN_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const run = await ghJson(`/repos/${OWNER}/${repo.name}/actions/runs/${runId}`);
    if (run.status === "completed") return { conclusion: run.conclusion, url: run.html_url };
    await sleep(15_000);
  }
  return { conclusion: "timed_out", url: `https://github.com/${OWNER}/${repo.name}/actions/runs/${runId}` };
}

async function deploy(repo) {
  try {
    const runId = await dispatch(repo);
    console.log(`${repo.name}: dispatched run ${runId}`);
    const result = await waitForRun(repo, runId);
    console.log(`${repo.name}: ${result.conclusion}`);
    return { repo: repo.name, ...result };
  } catch (error) {
    console.log(`${repo.name}: ${error.message}`);
    return { repo: repo.name, conclusion: "error", detail: error.message };
  }
}

if (KIT_VERSION) await waitForNpm(KIT_VERSION);

const { root, others } = await listSites();
console.log(
  `Sites: ${[root?.name, ...others.map((repo) => repo.name)].filter(Boolean).join(", ") || "none"}`,
);

const results = [];
if (root) results.push(await deploy(root));
results.push(...(await Promise.all(others.map(deploy))));

const failed = results.filter((result) => result.conclusion !== "success");
const rows = results.map(
  (r) =>
    `| ${r.repo} | ${r.conclusion === "success" ? "✅" : "❌"} ${r.conclusion} | ${r.url ? `[run](${r.url})` : (r.detail ?? "")} |`,
);
const summary = [
  `## Site redeploys${KIT_VERSION ? ` for @toyonix/web-kit@${KIT_VERSION}` : ""}`,
  "",
  "| Site | Result | Details |",
  "| --- | --- | --- |",
  ...(rows.length ? rows : ["| (no sites found) | | |"]),
  "",
].join("\n");
if (GITHUB_STEP_SUMMARY) await appendFile(GITHUB_STEP_SUMMARY, summary);
console.log(summary);

if (failed.length) fail(`${failed.length} of ${results.length} site deploys did not succeed.`);
