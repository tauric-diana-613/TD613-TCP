#!/usr/bin/env node
// TD613 · Marrowline / Screaming Grove Option 1 (20-Slot Preflight) — Portable Custody Manifest Generator & Verifier
//
// Usage:
//   node research/marrowline-option1-20slot-preflight-20261122/verify-option1-preflight-custody.mjs --generate
//   node research/marrowline-option1-20slot-preflight-20261122/verify-option1-preflight-custody.mjs --verify

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const OPT1_DIR = __dirname;
const MANIFEST_PATH = path.join(OPT1_DIR, 'OPTION1_EMERGENCE_HQ_CUSTODY_MANIFEST.json');
const NAVIGATOR_PATH = path.join(OPT1_DIR, 'OPTION1_EMERGENCE_HQ_RETRIEVAL_NAVIGATOR.md');

const REPO_URL = 'https://github.com/tauric-diana-613/TD613-TCP';
const BRANCH = 'research/marrowline-option1-20slot-preflight-20261122';

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
  const opt1Files = listFilesRecursive(OPT1_DIR)
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
    'tests/marrowline-option1-20slot-preflight.test.mjs',
    'tests/marrowline-sep26-oct02-stage0.test.mjs',
    'tests/marrowline-q1-live-discriminator.test.mjs',
    'research/marrowline-sep26-oct02-reconstruction-20261121/MISSION_ENVELOPE_EFFECTIVE_REQUEST_MATRIX.json',
    'research/marrowline-sep26-oct02-reconstruction-20261121/STAGE0_EMERGENCE_HQ_RETRIEVAL_NAVIGATOR.md',
    'research/marrowline-screaming-grove-q1-20261121/run-q1-live-discriminator.mjs',
    'research/marrowline-screaming-grove-q1-20261121/live-acquisition/Q1_LIVE_ACQUISITION_RECEIPT.json',
    'research/marrowline-multipart-repair-20261015/README.md',
    'research/marrowline-unicode-capability-20261015/LIVE-RESULT-20261015.md',
    'research/marrowline-native-authorship-rest-20261014/README.md'
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
      original_identity_and_purpose: 'Local operator .env Gemini API key used strictly for read-only HTTP GET /v1beta/models catalog check (0 paid generation calls).',
      source_episode: 'TD613-MARROWLINE-OPTION1-20SLOT-PREFLIGHT (2026-11-22)',
      reason_for_exclusion: 'Secret API credential; prohibited from repository custody.',
      safe_digest_or_reference: 'REDACTED_CREDENTIAL_REF:env:GEMINI_API_KEY',
      recoverable: true,
      authorized_retrieval_route: 'Local operator environment custody only; never exported to GitHub.'
    },
    {
      custody_status: 'EXCLUDED_WITH_SAFE_CUSTODY_RECORD',
      original_identity_and_purpose: 'Ephemeral scratch helper script for read-only catalog query and raw Antigravity tool logs.',
      source_episode: 'TD613-MARROWLINE-OPTION1-20SLOT-PREFLIGHT (2026-11-22)',
      reason_for_exclusion: 'Scratch helper and harness logs contain private local machine paths; complete sanitized catalog payload is committed in OPTION1_MODEL_CATALOG_AND_ALIASING_RECEIPT.json.',
      safe_digest_or_reference: 'PUBLISHED_REPLACEMENT:research/marrowline-option1-20slot-preflight-20261122/OPTION1_MODEL_CATALOG_AND_ALIASING_RECEIPT.json',
      recoverable: true,
      authorized_retrieval_route: `${REPO_URL}/blob/${BRANCH}/research/marrowline-option1-20slot-preflight-20261122/OPTION1_MODEL_CATALOG_AND_ALIASING_RECEIPT.json`
    }
  ];

  return {
    schema: 'td613.marrowline.option1-preflight-custody-manifest/v1.2',
    generated_at_utc: new Date().toISOString(),
    repository: 'tauric-diana-613/TD613-TCP',
    branch: BRANCH,
    git_head_provenance: {
      authorized_executable_head_sha_episode2: '2e1046a44d38983f5f44fe3853f5182ac05a03ba',
      authorized_executable_head_sha_episode1: 'c67e64363a436607722f1a943311c5ed9a73a906',
      immutable_episode1_archive_commit: '51c1f420cfaa1792c25a5b517d253bf0c079ad86',
      construction_parent_head_sha: headSha,
      evidence_publication_head_sha: 'DETERMINED_EXTERNALLY_BY_GIT_REV_PARSE_HEAD_ON_COMMITTED_PR',
      git_self_reference_note: 'A manifest committed inside commit C cannot embed commit C\'s own SHA; authorized executable HEAD for Episode 2 (2e1046a44d38983f5f44fe3853f5182ac05a03ba) and Episode 1 (c67e64363a436607722f1a943311c5ed9a73a906) are preserved distinctly from the subsequent evidence-publication HEAD verified externally via git rev-parse HEAD.',
      prior_preflight_pr1769_initial_commit: 'ade1d537904f8aaff96355658ae396734c43e340',
      stacked_on_pr1766_commit: '5cec27f0727c17ce1d2ac825736a1027293b8849',
      base_activation_pr1765_commit: '01c3b9e48391a79472369695b64481b19614f9fa',
      immutable_q1_pr1764_commit: '2836e636e4b5eb485b12f73a2596ea3889b173d4'
    },
    live_episode2_execution_summary: {
      episode_id: 'EP2',
      study_id: 'TD613-MARROWLINE-OPTION1-20SLOT-EP2-20261122',
      authorized_executable_head_sha: '2e1046a44d38983f5f44fe3853f5182ac05a03ba',
      calls_planned: 20,
      calls_attempted: 8,
      calls_unattempted: 12,
      calls_completed_stop: 4,
      calls_http_503_unavailable: 4,
      recoverable_specimens: 4,
      chrome_rendered_specimens: 4,
      rendered_png_count: 59,
      terminal_status: 'HALTED_BY_STOP_RULE',
      stop_triggered: 'STOP_3_CONSECUTIVE_TRANSPORT_FAILURES',
      unblinding_key_opened: false
    },
    live_episode1_execution_summary: {
      authorized_executable_head_sha: 'c67e64363a436607722f1a943311c5ed9a73a906',
      calls_planned: 20,
      calls_attempted: 1,
      calls_unattempted: 19,
      calls_completed_stop: 0,
      recoverable_specimens: 0,
      terminal_status: 'FAILED_WITH_TERMINAL_ERROR',
      stop_triggered: 'FATAL_HARNESS_EXCEPTION',
      cause_code: 'UND_ERR_HEADERS_TIMEOUT'
    },
    model_identity_gate_verdict: 'MODEL_IDENTITY_STOP_3_7_ALIAS_TO_3_8',
    q1_operator_artistic_verdict: 'REJECTED_PRIOR_TO_UNBLINDING',
    q1_unblinding_key_opened: false,
    q2_status: 'HELD',
    experiment_b_status: 'CLOSED',
    merge_and_release_authority: false,
    human_artistic_closure: 'RESERVED',
    summary_counts: {
      option1_directory_files: opt1Files.length,
      linked_repository_files: linkedRepoFiles.length,
      total_published_in_git_entries: opt1Files.length + linkedRepoFiles.length,
      excluded_with_safe_custody_entries: excludedRecords.length
    },
    published_in_git: {
      option1_preflight_estate: opt1Files,
      linked_repository_witnesses_and_tests: linkedRepoFiles
    },
    excluded_artifacts_with_safe_custody: excludedRecords
  };
}

function verifyManifest() {
  const errors = [];
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const all = [
    ...(manifest.published_in_git?.option1_preflight_estate || []),
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

  const listed = new Set((manifest.published_in_git?.option1_preflight_estate || []).map((e) => e.path));
  for (const abs of listFilesRecursive(OPT1_DIR)) {
    if (path.resolve(abs) === path.resolve(MANIFEST_PATH)) continue;
    const rp = relRepo(abs);
    if (!listed.has(rp)) errors.push(`UNINDEXED_OPTION1_FILE: ${rp}`);
  }

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

  const secretPatterns = [
    /AIza[0-9A-Za-z_-]{20,}/,
    /ghp_[0-9A-Za-z]{20,}/,
    /github_pat_[0-9A-Za-z_]{20,}/,
    /sk-[0-9A-Za-z]{20,}/,
    /C:[\\/\\\\]Users[\\/\\\\]/i,
    new RegExp('\\u0040' + 'codex\\b', 'i')
  ];
  const scanFiles = [
    ...listFilesRecursive(OPT1_DIR),
    path.join(REPO_ROOT, 'tests/marrowline-option1-20slot-preflight.test.mjs')
  ];
  for (const abs of scanFiles) {
    if (abs.toLowerCase().endsWith('.png')) continue;
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
