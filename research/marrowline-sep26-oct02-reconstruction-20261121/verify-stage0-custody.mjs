#!/usr/bin/env node
// TD613 · Marrowline / Screaming Grove Stage 0 — Portable Emergence HQ Custody Manifest Generator & Verifier
//
// Usage:
//   node research/marrowline-sep26-oct02-reconstruction-20261121/verify-stage0-custody.mjs --generate
//   node research/marrowline-sep26-oct02-reconstruction-20261121/verify-stage0-custody.mjs --verify

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const STAGE0_DIR = __dirname;
const MANIFEST_PATH = path.join(STAGE0_DIR, 'STAGE0_EMERGENCE_HQ_CUSTODY_MANIFEST.json');
const NAVIGATOR_PATH = path.join(STAGE0_DIR, 'STAGE0_EMERGENCE_HQ_RETRIEVAL_NAVIGATOR.md');

const REPO_URL = 'https://github.com/tauric-diana-613/TD613-TCP';
const BRANCH = 'research/marrowline-sep26-oct02-stage0-reconstruction-20261121';

function sha256File(absPath) {
  const buf = fs.readFileSync(absPath);
  return {
    bytes: buf.length,
    sha256: crypto.createHash('sha256').update(buf).digest('hex')
  };
}

function listFilesRecursive(absDir) {
  const out = [];
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const full = path.join(absDir, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRecursive(full));
    else if (entry.isFile()) out.push(full);
  }
  return out.sort();
}

function relRepo(absPath) {
  return path.relative(REPO_ROOT, absPath).replace(/\\/g, '/');
}

function buildManifest() {
  const headSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  const stage0Files = listFilesRecursive(STAGE0_DIR)
    .filter((f) => path.resolve(f) !== path.resolve(MANIFEST_PATH))
    .map((absPath) => {
      const rp = relRepo(absPath);
      const stats = sha256File(absPath);
      return {
        path: rp,
        custody_status: 'PUBLISHED_IN_GIT',
        branch: BRANCH,
        github_blob_url: `${REPO_URL}/blob/${BRANCH}/${rp}`,
        bytes: stats.bytes,
        sha256: stats.sha256
      };
    });

  const linkedRepoFiles = [
    'tests/marrowline-sep26-oct02-stage0.test.mjs',
    'tests/marrowline-q1-live-discriminator.test.mjs',
    'research/marrowline-screaming-grove-q1-20261121/run-q1-live-discriminator.mjs',
    'research/marrowline-screaming-grove-q1-20261121/live-acquisition/Q1_LIVE_ACQUISITION_RECEIPT.json',
    'research/marrowline-native-authorship-rest-20261014/README.md',
    'research/marrowline-unicode-capability-20261015/LIVE-RESULT-20261015.md',
    'docs/research/2026-09-24-native-prosody-atlas/atlas.json',
    'docs/research/2026-09-26-marrowline-red-deer-mission/PROVENANCE-AND-ASSAY.md',
    'docs/research/2026-09-26-marrowline-red-deer-mission/HORNANI-0613-42-SOURCE-NOTE.md'
  ].map((rp) => {
    const absPath = path.join(REPO_ROOT, rp);
    const stats = sha256File(absPath);
    return {
      path: rp,
      custody_status: 'PUBLISHED_IN_GIT',
      branch: BRANCH,
      github_blob_url: `${REPO_URL}/blob/${BRANCH}/${rp}`,
      bytes: stats.bytes,
      sha256: stats.sha256
    };
  });

  const excludedRecords = [
    {
      custody_status: 'EXCLUDED_WITH_SAFE_CUSTODY_RECORD',
      original_identity_and_purpose: 'Local operator .env credential file (unused in Stage 0; zero paid calls executed).',
      source_episode: 'TD613-MARROWLINE-SEP26-OCT02-STAGE0 (2026-11-21)',
      reason_for_exclusion: 'Secret API credential; prohibited from repository custody.',
      safe_digest_or_reference: 'REDACTED_CREDENTIAL_REF:env:GEMINI_API_KEY (not loaded during Stage 0)',
      recoverable: true,
      authorized_retrieval_route: 'Local operator environment custody only; never exported to GitHub.'
    },
    {
      custody_status: 'EXCLUDED_WITH_SAFE_CUSTODY_RECORD',
      original_identity_and_purpose: 'Ephemeral scratch copies of PR #1765 activation markdowns and Antigravity agent internal logs.',
      source_episode: 'TD613-MARROWLINE-SEP26-OCT02-STAGE0 (2026-11-21)',
      reason_for_exclusion: 'Scratch copies are exact duplicates of committed 01c3b9e48 files; internal agent logs contain private host harness metadata.',
      safe_digest_or_reference: 'COMMIT_SOURCE_REF:01c3b9e48391a79472369695b64481b19614f9fa',
      recoverable: true,
      authorized_retrieval_route: `${REPO_URL}/tree/01c3b9e48391a79472369695b64481b19614f9fa/research/marrowline-sep26-oct02-reconstruction-20261121`
    }
  ];

  return {
    schema: 'td613.marrowline.sep26-oct02-stage0-custody-manifest/v1.0',
    generated_at_utc: new Date().toISOString(),
    repository: 'tauric-diana-613/TD613-TCP',
    branch: BRANCH,
    base_activation_commit: '01c3b9e48391a79472369695b64481b19614f9fa',
    parent_q1_evidence_commit: '2836e636e4b5eb485b12f73a2596ea3889b173d4',
    generated_against_git_head: headSha,
    new_paid_provider_calls_executed: 0,
    q1_operator_artistic_verdict: 'REJECTED_PRIOR_TO_UNBLINDING',
    q1_unblinding_key_opened: false,
    q2_status: 'HELD',
    experiment_b_status: 'CLOSED',
    merge_and_release_authority: false,
    human_artistic_closure: 'RESERVED',
    summary_counts: {
      stage0_directory_files: stage0Files.length,
      linked_repository_files: linkedRepoFiles.length,
      total_published_in_git_entries: stage0Files.length + linkedRepoFiles.length,
      excluded_with_safe_custody_entries: excludedRecords.length
    },
    published_in_git: {
      stage0_estate: stage0Files,
      linked_repository_witnesses_and_tests: linkedRepoFiles
    },
    excluded_artifacts_with_safe_custody: excludedRecords
  };
}

function verifyManifest() {
  const errors = [];
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const all = [
    ...(manifest.published_in_git?.stage0_estate || []),
    ...(manifest.published_in_git?.linked_repository_witnesses_and_tests || [])
  ];
  let verifiedFiles = 0;
  for (const entry of all) {
    const abs = path.join(REPO_ROOT, entry.path);
    if (!fs.existsSync(abs)) {
      errors.push(`MISSING_FILE: ${entry.path}`);
      continue;
    }
    const actual = sha256File(abs);
    if (actual.bytes !== entry.bytes) errors.push(`BYTE_MISMATCH: ${entry.path}`);
    if (actual.sha256 !== entry.sha256) errors.push(`SHA256_MISMATCH: ${entry.path}`);
    verifiedFiles++;
  }

  // Ensure every file in STAGE0_DIR except manifest itself is indexed
  const listed = new Set((manifest.published_in_git?.stage0_estate || []).map((e) => e.path));
  for (const abs of listFilesRecursive(STAGE0_DIR)) {
    if (path.resolve(abs) === path.resolve(MANIFEST_PATH)) continue;
    const rp = relRepo(abs);
    if (!listed.has(rp)) errors.push(`UNINDEXED_STAGE0_FILE: ${rp}`);
  }

  // Verify every relative markdown link in STAGE0_EMERGENCE_HQ_RETRIEVAL_NAVIGATOR.md resolves
  if (!fs.existsSync(NAVIGATOR_PATH)) {
    errors.push('MISSING_NAVIGATOR');
  } else {
    const navText = fs.readFileSync(NAVIGATOR_PATH, 'utf8');
    const linkRe = /\[[^\]]+\]\(([^)]+)\)/g;
    let m;
    let resolvedLinks = 0;
    while ((m = linkRe.exec(navText)) !== null) {
      const target = m[1].split('#')[0].trim();
      if (!target || /^https?:\/\//i.test(target) || /^mailto:/i.test(target)) continue;
      const resolved = path.resolve(path.dirname(NAVIGATOR_PATH), target);
      if (!fs.existsSync(resolved)) errors.push(`BROKEN_NAVIGATOR_LINK: ${target}`);
      else resolvedLinks++;
    }
    if (resolvedLinks === 0) errors.push('NAVIGATOR_HAS_ZERO_LOCAL_LINKS');
  }

  // Secret & local Windows user-path hygiene scan
  const secretPatterns = [
    /AIza[0-9A-Za-z_-]{20,}/,
    /ghp_[0-9A-Za-z]{20,}/,
    /github_pat_[0-9A-Za-z_]{20,}/,
    /sk-[0-9A-Za-z]{20,}/,
    /C:[\\/\\\\]Users[\\/\\\\]/i,
    new RegExp('\\u0040' + 'codex\\b', 'i')
  ];
  const scanFiles = [...listFilesRecursive(STAGE0_DIR), path.join(REPO_ROOT, 'tests/marrowline-sep26-oct02-stage0.test.mjs')];
  for (const abs of scanFiles) {
    const txt = fs.readFileSync(abs, 'utf8');
    for (const re of secretPatterns) {
      if (re.test(txt)) errors.push(`HYGIENE_VIOLATION: ${relRepo(abs)} matched ${re}`);
    }
  }

  const report = {
    ok: errors.length === 0,
    verified_published_files: verifiedFiles,
    excluded_custody_records: (manifest.excluded_artifacts_with_safe_custody || []).length,
    error_count: errors.length,
    errors
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exit(1);
}

const args = process.argv.slice(2);
if (args.includes('--generate')) {
  const manifest = buildManifest();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({ generated: true, summary_counts: manifest.summary_counts }, null, 2));
} else {
  verifyManifest();
}
