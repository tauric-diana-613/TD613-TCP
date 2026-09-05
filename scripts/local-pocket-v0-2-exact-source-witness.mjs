import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const browser = String(process.env.TD613_BROWSER || 'chromium').toLowerCase();
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/local-pocket-v0-2';
await fs.mkdir(artifactDir, { recursive: true });

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

async function eventPayload() {
  const eventPath = String(process.env.GITHUB_EVENT_PATH || '').trim();
  if (!eventPath) return null;
  try { return JSON.parse(await fs.readFile(eventPath, 'utf8')); }
  catch { return null; }
}

const event = await eventPayload();
const checkoutCommit = git('rev-parse', 'HEAD');
const checkoutTree = git('rev-parse', 'HEAD^{tree}');
const eventHead = String(event?.pull_request?.head?.sha || '').trim();
let headCommit = eventHead || checkoutCommit;
let headTree = checkoutTree;
let rawHeadFetched = false;
let wholeTreeEqual = true;
let error = null;

try {
  if (eventHead) {
    git('fetch', '--no-tags', '--depth=1', 'origin', eventHead);
    rawHeadFetched = true;
    headCommit = git('rev-parse', eventHead);
    headTree = git('rev-parse', `${eventHead}^{tree}`);
    wholeTreeEqual = checkoutTree === headTree;
  }
} catch (failure) {
  wholeTreeEqual = false;
  error = String(failure?.stderr || failure?.message || failure).trim().slice(0, 1200);
}

const custody = Object.freeze({
  schema: 'td613.local-pocket.source-custody/v0.2-whole-tree-parity',
  browser,
  custody_mode: eventHead ? 'pull-request-whole-tree-parity' : 'non-pr-checkout-tree',
  tested_checkout_commit: checkoutCommit,
  tested_checkout_tree: checkoutTree,
  event_raw_head_commit: headCommit,
  event_raw_head_tree: headTree,
  raw_head_fetched: rawHeadFetched,
  whole_tree_equal: wholeTreeEqual,
  source_bytes_equivalent_to_raw_head: wholeTreeEqual,
  raw_head_commit_checked_out: checkoutCommit === headCommit,
  commit_identity_equivalence_claimed: false,
  tree_byte_equivalence_claimed: wholeTreeEqual,
  provider_call_performed: false,
  production_mutation: false,
  deployment_authorized: false,
  human_closure_required: true,
  error,
  seal: '⟐'
});

await fs.writeFile(path.join(artifactDir, `local-pocket-${browser}-source-custody.json`), `${JSON.stringify(custody, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(custody, null, 2));
if (!wholeTreeEqual) throw new Error(`Local Pocket source custody held: tested tree ${checkoutTree} != raw head tree ${headTree}`);

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const browserWitness = path.join(scriptsDir, 'local-pocket-v0-2-browser-witness.mjs');
await import(`${pathToFileURL(browserWitness).href}?td613_local_pocket_exact_tree=${headTree}&t=${Date.now()}`);
