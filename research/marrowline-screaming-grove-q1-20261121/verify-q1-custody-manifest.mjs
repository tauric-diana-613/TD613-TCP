#!/usr/bin/env node
// TD613 · Marrowline / Screaming Grove Q1 — Portable Emergence HQ Custody Manifest Generator & Verifier
//
// Usage:
//   node research/marrowline-screaming-grove-q1-20261121/verify-q1-custody-manifest.mjs --generate
//   node research/marrowline-screaming-grove-q1-20261121/verify-q1-custody-manifest.mjs --verify
//
// Proves that:
// 1. Every PUBLISHED_IN_GIT entry in Q1_COMPLETE_WORK_PRODUCT_CUSTODY_MANIFEST.json exists in the
//    repository tree with exact matching byte length and SHA-256 digest.
// 2. Every relative markdown link in Q1_EMERGENCE_HQ_RETRIEVAL_NAVIGATOR.md resolves to a real file.
// 3. Every EXCLUDED_WITH_SAFE_CUSTODY_RECORD entry includes all 6 mandatory custody fields.
// 4. Every DEFERRED_PENDING_EXACT_HEAD_LIVE_AUTH entry explicitly marks generated=false.
// 5. Zero secret tokens or raw local Windows user-home paths leak into Q1 committed files.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const Q1_DIR = __dirname;
const MANIFEST_PATH = path.join(Q1_DIR, 'Q1_COMPLETE_WORK_PRODUCT_CUSTODY_MANIFEST.json');
const NAVIGATOR_PATH = path.join(Q1_DIR, 'Q1_EMERGENCE_HQ_RETRIEVAL_NAVIGATOR.md');

const REPO_URL = 'https://github.com/tauric-diana-613/TD613-TCP';
const BRANCH = 'research/marrowline-screaming-grove-q1-preflight-20261121';

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

  const q1Files = listFilesRecursive(Q1_DIR)
    .filter((f) => path.resolve(f) !== path.resolve(MANIFEST_PATH))
    .map((absPath) => {
      const rp = relRepo(absPath);
      const stats = sha256File(absPath);
      let category = 'Q1_PRIMARY_ARTIFACT';
      if (rp.includes('/live-acquisition/raw-sse/')) category = 'Q1_LIVE_RAW_SSE_WIRE_BYTES';
      else if (rp.includes('/live-acquisition/raw-text/')) category = 'Q1_LIVE_RAW_UTF8_TEXT';
      else if (rp.includes('/live-acquisition/browser-witness/') && rp.endsWith('.png')) category = 'Q1_LIVE_CHROME_VISUAL_WITNESS_PNG';
      else if (rp.includes('/live-acquisition/')) category = 'Q1_LIVE_ACQUISITION_REPORT_OR_INDEX';
      else if (rp.includes('/evidence/')) category = 'Q1_EVIDENCE_RECEIPT';
      return {
        path: rp,
        category,
        custody_status: 'PUBLISHED_IN_GIT',
        branch: BRANCH,
        github_blob_url: `${REPO_URL}/blob/${BRANCH}/${rp}`,
        bytes: stats.bytes,
        sha256: stats.sha256
      };
    });

  const coreRuntimeAndTestPaths = [
    { path: 'tests/marrowline-q1-live-discriminator.test.mjs', category: 'Q1_ZERO_NETWORK_NEGATIVE_CONTROLS' },
    { path: 'tests/marrowline-screaming-grove-restoration.test.mjs', category: 'MARROWLINE_RESTORATION_REGRESSION_TESTS' },
    { path: 'research/marrowline-screaming-grove-restoration-20261120/BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md', category: 'PRESERVED_PREREGISTRATION' },
    { path: 'research/marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs', category: 'REGISTERED_TASK_CORPUS_AND_OFFLINE_PARITY' },
    { path: 'server/khonapolit-quality.js', category: 'CANONICAL_RUNTIME_SSE_AND_REQUEST_PIPELINE' },
    { path: 'server/marrowline-completion.js', category: 'CANONICAL_COMPLETION_CLASSIFIER' },
    { path: 'server/gemini-generation-envelope.js', category: 'MATCHED_GENERATION_PROFILE' },
    { path: 'app/dome-world/khonapolit-covenant.js', category: 'COVENANT_INVOCATION_PACKET' },
    { path: 'app/dome-world/marrowline-historical-grove.js', category: 'ARM_C_PR1545_RECONCILED_CONSTRUCTOR' },
    { path: 'app/dome-world/khonapolit-relay.js', category: 'RELAY_PARSER_AND_PROSODY_OBSERVER' },
    { path: 'app/engine/aperture-v3-task-intent.js', category: 'APERTURE_DISCOURSE_ROUTER' }
  ];

  const coreEntries = coreRuntimeAndTestPaths.map(({ path: rp, category }) => {
    const absPath = path.join(REPO_ROOT, rp);
    const stats = sha256File(absPath);
    return {
      path: rp,
      category,
      custody_status: 'PUBLISHED_IN_GIT',
      branch: BRANCH,
      github_blob_url: `${REPO_URL}/blob/${BRANCH}/${rp}`,
      bytes: stats.bytes,
      sha256: stats.sha256
    };
  });

  // Inherited #1759 visual-parity estate (already committed in this branch's exact tree!)
  const visualParityDir = path.join(REPO_ROOT, 'research/marrowline-screaming-grove-visual-parity-20261121');
  const visualParityFiles = fs.existsSync(visualParityDir) ? listFilesRecursive(visualParityDir) : [];
  const visualParityManifestHash = crypto.createHash('sha256');
  let visualParityTotalBytes = 0;
  const visualParityEntries = visualParityFiles.map((absPath) => {
    const rp = relRepo(absPath);
    const stats = sha256File(absPath);
    visualParityTotalBytes += stats.bytes;
    visualParityManifestHash.update(`${stats.sha256}  ${rp}\n`);
    return {
      path: rp,
      category: rp.includes('01_OPERATOR_ACCEPTED_MARROWLINE') || rp.includes('reference_corpus')
        ? 'OPERATOR_ACCEPTED_VISUAL_REFERENCE_CORPUS'
        : rp.endsWith('.png')
          ? 'CHROME_RENDERED_VISUAL_PARITY_SCREENSHOT'
          : 'VISUAL_PARITY_FORENSIC_ARTIFACT',
      custody_status: 'PUBLISHED_IN_GIT',
      branch: BRANCH,
      github_blob_url: `${REPO_URL}/blob/${BRANCH}/${rp}`,
      bytes: stats.bytes,
      sha256: stats.sha256
    };
  });

  const predecessorPullRequests = [
    {
      pr_number: 1759,
      head_sha: '026ac4636eba782364eab46404dfcadd9414e9e0',
      ci_run_url: `${REPO_URL}/actions/runs/44873359129`,
      ci_conclusion: 'success',
      github_pr_url: `${REPO_URL}/pull/1759`,
      github_tree_url: `${REPO_URL}/tree/026ac4636eba782364eab46404dfcadd9414e9e0`,
      role: 'Direct parent visual-parity estate (119 visual-parity files, 22 lossless reference images, 72 Chrome PNGs, blinded synthetic specimens, H8 falsification). Fully inherited in #1764 tree.'
    },
    {
      pr_number: 1746,
      head_sha: 'fe2e8bed3bd0923ae7c146524d8832531cbe837e',
      github_pr_url: `${REPO_URL}/pull/1746`,
      github_tree_url: `${REPO_URL}/tree/fe2e8bed3bd0923ae7c146524d8832531cbe837e`,
      role: 'Immutable predecessor Emergence HQ complete engineering & six-role Dollhouse adjudication dossier (96 changed files, 168 manifest entries covering all scratch scripts, intermediate patches, Dollhouse specialist reports, and provider-free desktop/mobile browser witness PNGs).'
    },
    {
      pr_number: 1745,
      head_sha: '4a481e44f3f6f2b3c0f2fda74b6eafe1610de6d8',
      github_pr_url: `${REPO_URL}/pull/1745`,
      github_tree_url: `${REPO_URL}/tree/4a481e44f3f6f2b3c0f2fda74b6eafe1610de6d8`,
      role: 'Immutable earliest draft precursor (deterministic repair ancestor bc5467246f12b0598f89d681e4a4450c4733eace).'
    },
    {
      pr_number: 1751,
      head_sha: '627d0a5ce85c0200b7baa033e4ed5e6912c46894',
      github_pr_url: `${REPO_URL}/pull/1751`,
      role: 'Merged governance workflow repair retiring superseded vixen-a0-corpus-rebuild.yml (already in origin/main f1288ec69).'
    }
  ];

  const liveReceiptPath = path.join(Q1_DIR, 'live-acquisition/Q1_LIVE_ACQUISITION_RECEIPT.json');
  const liveReceiptExists = fs.existsSync(liveReceiptPath);
  const liveReceiptObj = liveReceiptExists ? JSON.parse(fs.readFileSync(liveReceiptPath, 'utf8')) : null;
  const paidCallsExecuted = liveReceiptObj ? Number(liveReceiptObj.calls_executed || 0) : 0;

  const deferredLiveAcquisitionArtifacts = liveReceiptExists ? [] : [
    {
      planned_path: 'research/marrowline-screaming-grove-q1-20261121/live-acquisition/Q1_LIVE_ACQUISITION_RECEIPT.json',
      custody_status: 'DEFERRED_PENDING_EXACT_HEAD_LIVE_AUTH',
      generated: false,
      reason: 'PAID_EXECUTION_HELD_PENDING_EXACT_HEAD_AUTHORIZATION',
      description: 'Master 8-slot live acquisition receipt.'
    }
  ];

  const excludedArtifacts = [
    {
      custody_status: 'EXCLUDED_WITH_SAFE_CUSTODY_RECORD',
      original_identity_and_purpose: 'Local operator .env file carrying GEMINI_API_KEY used solely for read-only GET /v1beta/models catalog check and staged for future authorized Q1 execution.',
      source_episode: 'TD613-MARROWLINE-SCREAMING-GROVE-Q1 preflight (2026-11-21)',
      reason_for_exclusion: 'Secret API credential; TD613 custody law strictly prohibits committing, hashing raw secret material, or publishing credentials.',
      safe_digest_or_reference: 'REDACTED_CREDENTIAL_REF:env:GEMINI_API_KEY (verified live via read-only GET /v1beta/models HTTP 200)',
      recoverable: true,
      authorized_retrieval_route: 'Local operator environment custody only; never exported to GitHub.'
    },
    {
      custody_status: 'EXCLUDED_WITH_SAFE_CUSTODY_RECORD',
      original_identity_and_purpose: 'Antigravity host harness conversation transcripts and ephemeral task stdout logs under internal agent appData directory.',
      source_episode: 'TD613-MARROWLINE-SCREAMING-GROVE restoration and Q1 hardening session (2026-11-20..2026-11-21)',
      reason_for_exclusion: 'Contains private internal chain-of-thought reasoning and local host filesystem paths; all substantive test results, CI logs, and source decisions are published cleanly in Git.',
      safe_digest_or_reference: 'CONVERSATION_REF:3cc40de8-dc77-4540-a38b-0d7a12e39cd0 (substantive test/CI receipts published in research/marrowline-screaming-grove-q1-20261121/evidence/CI_AND_TEST_RECEIPTS_LOG.md)',
      recoverable: true,
      authorized_retrieval_route: 'Operator local Antigravity host; sanitized test and CI receipts retrievable via GitHub PR #1764.'
    },
    {
      custody_status: 'EXCLUDED_WITH_SAFE_CUSTODY_RECORD',
      original_identity_and_purpose: 'Operator-uploaded companion ZIP archive TD613_Marrowline_Screaming_Grove_Expanded_Visual_References.zip containing the 22 reference visual files (13 Operator-Accepted Marrowline + 9 companion references).',
      source_episode: 'TD613-MARROWLINE-SCREAMING-GROVE visual-parity commission PR #1759 (2026-11-21)',
      reason_for_exclusion: 'Raw outer ZIP container redundant because all 22/22 lossless extracted original reference images and manifest are already committed verbatim in Git under research/marrowline-screaming-grove-visual-parity-20261121/.',
      safe_digest_or_reference: 'INHERITED_EXTRACTED_TREE:research/marrowline-screaming-grove-visual-parity-20261121/ (22/22 lossless originals verified in PR #1759 @ 026ac4636 and inherited in PR #1764)',
      recoverable: true,
      authorized_retrieval_route: `${REPO_URL}/tree/${BRANCH}/research/marrowline-screaming-grove-visual-parity-20261121`
    },
    {
      custody_status: 'EXCLUDED_WITH_SAFE_CUSTODY_RECORD',
      original_identity_and_purpose: 'Stage I/II scratch scripts, intermediate diffs, Dollhouse specialist raw outputs, and provider-free desktop/mobile browser witness screenshots from the initial restoration audit.',
      source_episode: 'TD613-MARROWLINE-SCREAMING-GROVE Stage I & II commissions (2026-11-20)',
      reason_for_exclusion: 'Already published immutably in predecessor PR #1746 (105 committed files / 168 manifest entries); not duplicated into #1764 to preserve clean git history and exact predecessor custody.',
      safe_digest_or_reference: 'PREDECESSOR_PR_1746_HEAD:fe2e8bed3bd0923ae7c146524d8832531cbe837e',
      recoverable: true,
      authorized_retrieval_route: `${REPO_URL}/tree/fe2e8bed3bd0923ae7c146524d8832531cbe837e`
    }
  ];

  return {
    schema: 'td613.marrowline.q1-complete-work-product-custody-manifest/v1.0',
    generated_at_utc: new Date().toISOString(),
    repository: 'tauric-diana-613/TD613-TCP',
    active_pr: 1764,
    active_branch: BRANCH,
    generated_against_git_head: headSha,
    authorized_live_execution_source_head: liveReceiptObj?.source_head_sha || null,
    paid_provider_calls_executed: paidCallsExecuted,
    q2_status: 'HELD',
    experiment_b_status: 'CLOSED',
    human_artistic_closure: 'RESERVED',
    summary_counts: {
      q1_estate_files_published_in_git: q1Files.length,
      core_runtime_and_test_files_verified: coreEntries.length,
      inherited_visual_parity_files_verified: visualParityEntries.length,
      inherited_visual_parity_total_bytes: visualParityTotalBytes,
      inherited_visual_parity_tree_sha256: visualParityManifestHash.digest('hex'),
      total_published_in_git_entries: q1Files.length + coreEntries.length + visualParityEntries.length,
      predecessor_prs_linked: predecessorPullRequests.length,
      deferred_live_acquisition_entries: deferredLiveAcquisitionArtifacts.length,
      excluded_with_safe_custody_entries: excludedArtifacts.length
    },
    published_in_git: {
      q1_estate: q1Files,
      core_runtime_and_tests: coreEntries,
      inherited_pr1759_visual_parity_estate: visualParityEntries
    },
    predecessor_pull_requests: predecessorPullRequests,
    deferred_live_acquisition_artifacts: deferredLiveAcquisitionArtifacts,
    excluded_artifacts_with_safe_custody: excludedArtifacts
  };
}

function verifyManifest() {
  const errors = [];
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Missing manifest: ${MANIFEST_PATH}`);
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  const allPublished = [
    ...(manifest.published_in_git?.q1_estate || []),
    ...(manifest.published_in_git?.core_runtime_and_tests || []),
    ...(manifest.published_in_git?.inherited_pr1759_visual_parity_estate || [])
  ];

  let verifiedFiles = 0;
  for (const entry of allPublished) {
    const abs = path.join(REPO_ROOT, entry.path);
    if (!fs.existsSync(abs)) {
      errors.push(`MISSING_PUBLISHED_FILE: ${entry.path}`);
      continue;
    }
    const actual = sha256File(abs);
    if (actual.bytes !== entry.bytes) {
      errors.push(`BYTE_MISMATCH: ${entry.path} expected=${entry.bytes} actual=${actual.bytes}`);
    }
    if (actual.sha256 !== entry.sha256) {
      errors.push(`SHA256_MISMATCH: ${entry.path} expected=${entry.sha256} actual=${actual.sha256}`);
    }
    verifiedFiles++;
  }

  // Verify every file inside Q1_DIR (except the manifest itself) is listed in q1_estate
  const listedQ1Paths = new Set((manifest.published_in_git?.q1_estate || []).map((e) => e.path));
  for (const abs of listFilesRecursive(Q1_DIR)) {
    if (path.resolve(abs) === path.resolve(MANIFEST_PATH)) continue;
    const rp = relRepo(abs);
    if (!listedQ1Paths.has(rp)) {
      errors.push(`UNINDEXED_Q1_FILE: ${rp}`);
    }
  }

  // Verify every relative markdown link in Q1_EMERGENCE_HQ_RETRIEVAL_NAVIGATOR.md resolves
  if (!fs.existsSync(NAVIGATOR_PATH)) {
    errors.push('MISSING_NAVIGATOR: Q1_EMERGENCE_HQ_RETRIEVAL_NAVIGATOR.md');
  } else {
    const navText = fs.readFileSync(NAVIGATOR_PATH, 'utf8');
    const linkRe = /\[[^\]]+\]\(([^)]+)\)/g;
    let match;
    let resolvedLinks = 0;
    while ((match = linkRe.exec(navText)) !== null) {
      const target = match[1].split('#')[0].trim();
      if (!target || /^https?:\/\//i.test(target) || /^mailto:/i.test(target)) continue;
      const resolved = path.resolve(path.dirname(NAVIGATOR_PATH), target);
      if (!fs.existsSync(resolved)) {
        errors.push(`BROKEN_NAVIGATOR_LINK: ${target}`);
      } else {
        resolvedLinks++;
      }
    }
    if (resolvedLinks === 0) errors.push('NAVIGATOR_HAS_ZERO_LOCAL_LINKS');
  }

  // Verify all 6 required fields on excluded artifacts
  const requiredExcludedFields = [
    'original_identity_and_purpose',
    'source_episode',
    'reason_for_exclusion',
    'safe_digest_or_reference',
    'recoverable',
    'authorized_retrieval_route'
  ];
  for (const ex of manifest.excluded_artifacts_with_safe_custody || []) {
    for (const f of requiredExcludedFields) {
      if (ex[f] === undefined || ex[f] === null || ex[f] === '') {
        errors.push(`EXCLUDED_MISSING_FIELD: ${f}`);
      }
    }
  }

  // Verify deferred live acquisition entries are honestly marked not yet generated
  for (const def of manifest.deferred_live_acquisition_artifacts || []) {
    if (def.generated !== false) errors.push(`DEFERRED_UNEXPECTED_GENERATED: ${def.planned_path}`);
  }

  // Secret & local Windows user-path hygiene scan across Q1 estate + new test file
  const secretPatterns = [
    /AIza[0-9A-Za-z_-]{20,}/,
    /ghp_[0-9A-Za-z]{20,}/,
    /github_pat_[0-9A-Za-z_]{20,}/,
    /sk-[0-9A-Za-z]{20,}/,
    /C:[\\/\\\\]Users[\\/\\\\]/i,
    new RegExp('\\u0040' + 'codex\\b', 'i')
  ];
  const scanPaths = [...listFilesRecursive(Q1_DIR), path.join(REPO_ROOT, 'tests/marrowline-q1-live-discriminator.test.mjs')]
    .filter((p) => !p.toLowerCase().endsWith('.png'));
  for (const abs of scanPaths) {
    const txt = fs.readFileSync(abs, 'utf8');
    for (const re of secretPatterns) {
      if (re.test(txt)) {
        errors.push(`HYGIENE_VIOLATION: ${relRepo(abs)} matched ${re}`);
      }
    }
  }

  // Verify blinding integrity of Q1_BLINDED_OPERATOR_ARTISTIC_REVIEW_PACKET.md when present
  const blindedPath = path.join(Q1_DIR, 'live-acquisition/Q1_BLINDED_OPERATOR_ARTISTIC_REVIEW_PACKET.md');
  if (fs.existsSync(blindedPath)) {
    const blindedText = fs.readFileSync(blindedPath, 'utf8');
    const specimenSections = blindedText.split(/^## SPECIMEN-/m).slice(1).join('\n');
    const leakChecks = [
      /\bS0[1-8]\b/,
      /CURRENT_RESTORED_DEFAULT_PR1549/,
      /OCT02_DRAMATURGY_CANDIDATE/,
      /\bArm [AC]\b/,
      /uniformPlanarDepthOne/,
      /combiningMarks/
    ];
    for (const re of leakChecks) {
      if (re.test(specimenSections)) {
        errors.push(`BLINDING_LEAK_IN_REVIEW_PACKET: matched ${re}`);
      }
    }
  }

  const report = {
    ok: errors.length === 0,
    verified_published_files: verifiedFiles,
    excluded_custody_records: (manifest.excluded_artifacts_with_safe_custody || []).length,
    deferred_live_records: (manifest.deferred_live_acquisition_artifacts || []).length,
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
  console.log(JSON.stringify({
    generated: true,
    manifest: relRepo(MANIFEST_PATH),
    summary_counts: manifest.summary_counts
  }, null, 2));
} else {
  verifyManifest();
}
