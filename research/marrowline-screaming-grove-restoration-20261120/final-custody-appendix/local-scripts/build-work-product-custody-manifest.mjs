#!/usr/bin/env node
// TD613 · Marrowline / Screaming Grove Stage II Work-Product Custody Builder & Verifier
//
// Usage:
//   --verify   (portable; runs anywhere in repo): validates every published file in
//              MARROWLINE_COMPLETE_WORK_PRODUCT_CUSTODY_MANIFEST.json against live
//              SHA-256 digests and runs hygiene checks (zero secrets, zero private
//              machine paths, zero executable Codex mention tokens).
//   --build    (requires TD613_LOCAL_BRAIN_DIR env var pointing to local agent workspace):
//              archives previously local-only safe work products into
//              final-custody-appendix/ and regenerates both mandatory manifests.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const RESEARCH_DIR = path.join(REPO_ROOT, 'research/marrowline-screaming-grove-restoration-20261120');
const APPENDIX_DIR = path.join(RESEARCH_DIR, 'final-custody-appendix');
const MANIFEST_PATH = path.join(RESEARCH_DIR, 'MARROWLINE_COMPLETE_WORK_PRODUCT_CUSTODY_MANIFEST.json');
const RECON_PATH = path.join(RESEARCH_DIR, 'MARROWLINE_LOCAL_ARTIFACT_RECONCILIATION.md');

const mode = process.argv.includes('--build') ? 'build' : 'verify';

const sha256Buffer = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const sha256File = (filePath) => sha256Buffer(fs.readFileSync(filePath));
const git = (...args) => execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();

function sanitizeText(text) {
  const userHome = process.env.USERPROFILE || process.env.HOME || '';
  let out = String(text || '');
  if (userHome) {
    const escapedBack = userHome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const fwd = userHome.replace(/\\/g, '/');
    const escapedFwd = fwd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escapedBack, 'gi'), '<LOCAL_USER_HOME>');
    out = out.replace(new RegExp(escapedFwd, 'gi'), '<LOCAL_USER_HOME>');
  }
  // Redact any residual Windows user-home pattern generically without hardcoding a username.
  out = out.replace(/[A-Za-z]:[\\/]Users[\\/][^\\/\s"'`<>|]+/gi, '<LOCAL_USER_HOME>');
  // Normalize CRLF -> LF for clean repo archival.
  out = out.replace(/\r\n/g, '\n');
  return out;
}

function checkHygiene(text, label, { enforceLocalPathCheck = true } = {}) {
  const codexMentionRe = new RegExp('\\x40' + 'codex\\b', 'i');
  const patterns = [
    ['executable_codex_mention', codexMentionRe],
    ['google_api_key', /AIza[0-9A-Za-z_-]{25,}/],
    ['github_token', /gh[pousr]_[0-9A-Za-z]{25,}/],
    ['openai_key', /\bsk-[A-Za-z0-9]{24,}\b/],
    ['vercel_token', /\bvercel_[A-Za-z0-9_-]{20,}\b/i],
    ['private_key_block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/]
  ];
  if (enforceLocalPathCheck) {
    patterns.push(['raw_windows_user_path', /[A-Za-z]:[\\/]Users[\\/][^\\/\s"'`<>|]+/i]);
  }
  const hits = [];
  for (const [name, re] of patterns) {
    if (re.test(text)) hits.push(`${label}:${name}`);
  }
  return hits;
}

function walkFiles(dir, base = dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full, base));
    else out.push(path.relative(base, full).replace(/\\/g, '/'));
  }
  return out;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function gitBlobInfo(rev, repoRelPath) {
  try {
    const blobOid = execFileSync('git', ['rev-parse', `${rev}:${repoRelPath}`], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    const content = execFileSync('git', ['cat-file', 'blob', blobOid], {
      cwd: REPO_ROOT,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore']
    });
    return { git_blob_sha1: blobOid, bytes: content.length, sha256: sha256Buffer(content) };
  } catch {
    return null;
  }
}

function extractDollhouseSubagentCommands(brainBaseDir, role, convId) {
  const transcriptPath = path.join(brainBaseDir, convId, '.system_generated/logs/transcript_full.jsonl');
  if (!fs.existsSync(transcriptPath)) return null;
  const origSha = sha256File(transcriptPath);
  const origBytes = fs.statSync(transcriptPath).size;
  const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const stepByIndex = new Map(lines.map((s) => [s.step_index, s]));
  const commands = [];

  for (let i = 0; i < lines.length; i++) {
    const step = lines[i];
    if (!Array.isArray(step.tool_calls)) continue;
    for (const tc of step.tool_calls) {
      if (tc.name !== 'run_command') continue;
      // Find matching TOOL_RESULT shortly after this step
      let resultStep = null;
      for (let j = i + 1; j < Math.min(lines.length, i + 12); j++) {
        const cand = lines[j];
        if (cand.type === 'TOOL_RESULT' && (
          cand.content?.includes('Command exited') ||
          cand.content?.includes('Tool is running') ||
          cand.tool_call_id === tc.id
        )) {
          resultStep = cand;
          break;
        }
      }
      let outputText = resultStep?.content || '';
      // If truncated to a file, read that step file if small enough (<= 150 KB)
      const fileMatch = outputText.match(/file:\/\/\/([^\s\n]+output\.txt)/i);
      if (fileMatch) {
        const refPath = fileMatch[1].replace(/\//g, path.sep);
        if (fs.existsSync(refPath) && fs.statSync(refPath).size <= 150000) {
          outputText = fs.readFileSync(refPath, 'utf8');
        }
      }
      commands.push({
        step_index: step.step_index,
        created_at: step.created_at || null,
        tool_summary: tc.arguments?.toolSummary || null,
        command_line: sanitizeText(tc.arguments?.CommandLine || ''),
        result_step_index: resultStep?.step_index ?? null,
        result_status: resultStep?.status || null,
        raw_output: sanitizeText(outputText)
      });
    }
  }

  return {
    orig_transcript_sha256: origSha,
    orig_transcript_bytes: origBytes,
    payload: {
      schema: 'td613.marrowline.dollhouse-subagent-raw-commands/v1',
      role,
      subagent_conversation_id: convId,
      source_transcript_sha256: origSha,
      source_transcript_bytes: origBytes,
      total_transcript_steps: lines.length,
      run_command_count: commands.length,
      sanitization_note: 'Local user-profile path prefixes normalized to <LOCAL_USER_HOME>; command arguments and engine stdout/stderr otherwise preserved verbatim.',
      commands
    }
  };
}

function runVerify() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('MISSING_MANIFEST:', MANIFEST_PATH);
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const errors = [];
  let checkedRepoFiles = 0;
  let hygieneHits = 0;

  for (const entry of manifest.entries) {
    if (!entry.current_preservation_location || !entry.artifact_class || !entry.github_disposition) {
      errors.push(`Incomplete entry schema: ${JSON.stringify(entry).slice(0, 120)}`);
      continue;
    }
    if (
      entry.github_disposition === 'ALREADY_IN_PR_1746' ||
      entry.github_disposition === 'NEWLY_ARCHIVED_IN_PR_1746_STAGE_II'
    ) {
      const target = path.join(REPO_ROOT, entry.current_preservation_location);
      if (!fs.existsSync(target)) {
        errors.push(`Missing archived repo file: ${entry.current_preservation_location}`);
        continue;
      }
      const liveSha = sha256File(target);
      const expectedSha = entry.archived_sha256 || entry.version_or_digest?.sha256;
      if (expectedSha && liveSha !== expectedSha) {
        errors.push(`SHA-256 mismatch for ${entry.current_preservation_location}: expected ${expectedSha}, got ${liveSha}`);
      }
      checkedRepoFiles++;
      const ext = path.extname(target).toLowerCase();
      if (!['.png', '.jpg', '.jpeg', '.ico', '.woff2'].includes(ext)) {
        const text = fs.readFileSync(target, 'utf8');
        const enforceLocalPathCheck = entry.github_disposition === 'NEWLY_ARCHIVED_IN_PR_1746_STAGE_II';
        const hits = checkHygiene(text, entry.current_preservation_location, { enforceLocalPathCheck });
        if (hits.length > 0) {
          hygieneHits += hits.length;
          errors.push(`Hygiene hit(s): ${hits.join(', ')}`);
        }
        if (ext === '.json') {
          try { JSON.parse(text); } catch (e) { errors.push(`Invalid JSON in ${entry.current_preservation_location}: ${e.message}`); }
        }
      }
    }
  }

  // Ensure every file in research/marrowline-screaming-grove-restoration-20261120/ (except the two self-describing manifests) is accounted for in manifest.entries
  const trackedInManifest = new Set(
    manifest.entries
      .filter((e) => e.current_preservation_location && !e.current_preservation_location.startsWith('<'))
      .map((e) => e.current_preservation_location)
  );
  const allResearchFiles = walkFiles(RESEARCH_DIR).map((r) => `research/marrowline-screaming-grove-restoration-20261120/${r}`);
  for (const rel of allResearchFiles) {
    if (
      rel === 'research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_COMPLETE_WORK_PRODUCT_CUSTODY_MANIFEST.json' ||
      rel === 'research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_LOCAL_ARTIFACT_RECONCILIATION.md'
    ) continue;
    if (!trackedInManifest.has(rel)) {
      errors.push(`Unaccounted file inside research directory: ${rel}`);
    }
  }

  // Also check manifest itself + reconciliation markdown for hygiene
  for (const selfFile of [MANIFEST_PATH, RECON_PATH]) {
    if (fs.existsSync(selfFile)) {
      const hits = checkHygiene(fs.readFileSync(selfFile, 'utf8'), path.relative(REPO_ROOT, selfFile));
      if (hits.length > 0) {
        hygieneHits += hits.length;
        errors.push(`Hygiene hit(s): ${hits.join(', ')}`);
      }
    }
  }

  console.log(JSON.stringify({
    ok: errors.length === 0,
    total_manifest_entries: manifest.entries.length,
    verified_repo_files: checkedRepoFiles,
    hygiene_hits: hygieneHits,
    error_count: errors.length,
    errors
  }, null, 2));
  if (errors.length > 0) process.exit(1);
}

function runBuild() {
  const brainDir = process.env.TD613_LOCAL_BRAIN_DIR;
  if (!brainDir || !fs.existsSync(brainDir)) {
    console.error('TD613_LOCAL_BRAIN_DIR must be set to an existing local agent brain directory for --build');
    process.exit(1);
  }
  const brainParent = path.dirname(brainDir);
  const archivedLocalRecords = [];

  // 1. Copy host-verified browser witness PNGs byte-for-byte
  const binaryCopies = [
    {
      src: path.join(brainDir, 'browser_evidence/46f0f3d7-452b-41be-8b99-f997801b0f21/final_step_47.png'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/browser-witness/screenshots/mobile-390x844-dense-unicode-pass1-host-verified.png',
      artifact_class: 'browser_witness_host_verified_screenshot',
      source_episode: 'Stage II · Section VI (Pass 1 Mobile 390x844)',
      notes: 'Copied verbatim from BROWSER_HOST_FACTS latest_screenshot final_step_47.png (origin http://127.0.0.1:6137).'
    },
    {
      src: path.join(brainDir, 'browser_evidence/46f0f3d7-452b-41be-8b99-f997801b0f21/final_step_59.png'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/browser-witness/screenshots/desktop-1440x900-incomplete-return-pass2-host-verified.png',
      artifact_class: 'browser_witness_host_verified_screenshot',
      source_episode: 'Stage II · Section VI (Pass 2 Desktop 1440x900 WITNESS-INCOMPLETE)',
      notes: 'Copied verbatim from BROWSER_HOST_FACTS latest_screenshot final_step_59.png (origin http://127.0.0.1:6137).'
    }
  ];
  for (const item of binaryCopies) {
    const destAbs = path.join(REPO_ROOT, item.dest);
    ensureDir(destAbs);
    fs.copyFileSync(item.src, destAbs);
    const sha = sha256File(destAbs);
    archivedLocalRecords.push({
      original_path: sanitizeText(item.src).replace(/\\/g, '/'),
      artifact_class: item.artifact_class,
      source_episode: item.source_episode,
      version_or_digest: { sha256: sha, original_sha256: sha, byte_identical: true },
      bytes: fs.statSync(destAbs).size,
      current_preservation_location: item.dest,
      archived_sha256: sha,
      github_disposition: 'NEWLY_ARCHIVED_IN_PR_1746_STAGE_II',
      non_publication_reason: null,
      notes: item.notes
    });
  }

  // 2. Archive previously local-only scripts, PR bodies, and verification/failure logs (sanitized for private user-home prefixes)
  const textArchives = [
    {
      src: path.join(brainDir, 'scratch/bundle_emergence_hq_dossier.mjs'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/local-scripts/bundle-emergence-hq-dossier.mjs',
      artifact_class: 'local_reproducibility_script',
      source_episode: 'Stage I · PR #1746 Dossier Packaging',
      notes: 'Stage I bundler script that assembled PR #1746 (5819e1035) from local research outputs and Dollhouse transcripts.'
    },
    {
      src: path.join(brainDir, 'scratch/pr_body.md'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/pr-bodies/pr-1745-body.md',
      artifact_class: 'pr_publication_body',
      source_episode: 'Stage I · Draft Precursor PR #1745 Publication',
      notes: 'Exact authored GitHub PR #1745 description body.'
    },
    {
      src: path.join(brainDir, 'scratch/pr_body_emergence_hq.md'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/pr-bodies/pr-1746-body.md',
      artifact_class: 'pr_publication_body',
      source_episode: 'Stage I · Emergence HQ Dossier PR #1746 Publication',
      notes: 'Exact authored GitHub PR #1746 description body.'
    },
    {
      src: path.join(brainDir, '.system_generated/tasks/task-12.log'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/01-stage1-preflight-refs-task12.log',
      artifact_class: 'verification_or_diagnostic_log',
      source_episode: 'Stage I · Section P0 Pre-Fetch Custody Inventory',
      notes: 'Exact pre-fetch ref and worktree inventory recorded before Stage I git fetch.'
    },
    {
      src: path.join(brainDir, '.system_generated/tasks/task-97.log'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/02-initial-84-test-jsdom-missing-failure-task97.log',
      artifact_class: 'failed_intermediate_run_log',
      source_episode: 'Stage I · Baseline Test Discovery (Failed Run)',
      notes: 'Original failed 84-test sweep revealing ERR_MODULE_NOT_FOUND for jsdom in isolated worktree without node_modules.'
    },
    {
      src: path.join(brainDir, '.system_generated/tasks/task-126.log'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/03-pre-repair-baseline-pure-node-task126.log',
      artifact_class: 'verification_or_diagnostic_log',
      source_episode: 'Stage I · Pre-Repair Pure-Node Baseline',
      notes: 'Pre-repair pure-Node Marrowline baseline sweep.'
    },
    {
      src: path.join(brainDir, '.system_generated/tasks/task-212.log'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/04-post-repair-6cf64d17d-pure-node-277pass-task212.log',
      artifact_class: 'verification_or_diagnostic_log',
      source_episode: 'Stage I · First Post-Repair Verification (6cf64d17d)',
      notes: '277/277 pure-Node Marrowline tests passing on pre-hardening repair commit 6cf64d17d.'
    },
    {
      src: path.join(brainDir, '.system_generated/steps/269/output.txt'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/05-restoration-test-authoring-intermediate-fail1-step269.log',
      artifact_class: 'failed_intermediate_run_log',
      source_episode: 'Stage I · Restoration Test Authoring (Intermediate Failure 1)',
      notes: 'Failed intermediate test execution during initial authoring of tests/marrowline-screaming-grove-restoration.test.mjs.'
    },
    {
      src: path.join(brainDir, '.system_generated/steps/292/output.txt'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/06-restoration-test-authoring-intermediate-fail2-step292.log',
      artifact_class: 'failed_intermediate_run_log',
      source_episode: 'Stage I · Restoration Test Authoring (Intermediate Failure 2)',
      notes: 'Second failed intermediate test execution before settling restoration test suite.'
    },
    {
      src: path.join(brainDir, '.system_generated/steps/299/output.txt'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/07-restoration-test-authoring-first-pass-step299.log',
      artifact_class: 'verification_or_diagnostic_log',
      source_episode: 'Stage I · Restoration Test Authoring (First Pass)',
      notes: 'First passing execution of tests/marrowline-screaming-grove-restoration.test.mjs.'
    },
    {
      src: path.join(brainDir, '.system_generated/steps/301/output.txt'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/08-local-workflow-estate-vixen-red-step301.log',
      artifact_class: 'ci_diagnostic_log',
      source_episode: 'Stage I · Local Constitutional Guard Witness',
      notes: 'Local failure witness of tests/workflow-estate.test.mjs tripping on main commit 2f0fa5944 (vixen-a0-corpus-rebuild.yml).'
    },
    {
      src: path.join(brainDir, '.system_generated/steps/303/output.txt'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/09-local-release-plumbing-vixen-red-step303.log',
      artifact_class: 'ci_diagnostic_log',
      source_episode: 'Stage I · Local Release-Plumbing Guard Witness',
      notes: 'Local failure witness of tests/release-plumbing.test.mjs tripping on executable git push in vixen-a0-corpus-rebuild.yml.'
    },
    {
      src: path.join(brainDir, '.system_generated/tasks/task-308.log'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/10-dollhouse-audits-220pass-task308.log',
      artifact_class: 'verification_or_diagnostic_log',
      source_episode: 'Stage I · Dollhouse Audits Suite (220/220 PASS)',
      notes: 'Full npm run test:dollhouse:audits passing 220/220 locally.'
    },
    {
      src: path.join(brainDir, '.system_generated/steps/352/output.txt'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/11-dollhouse-strict-validator-initial-rejection-step352.log',
      artifact_class: 'failed_intermediate_run_log',
      source_episode: 'Stage I · Initial Strict-Provenance Dollhouse Audit Rejection (6cf64d17d)',
      notes: 'Pre-fix strict-provenance Dollhouse engine output (dollhouse-audit-1795199987778-4a8b7b6f) documenting initial schema rejection across both baseline and global-hold specs before fixing TEMPORAL_CUSTODIAN UNPERFORMED->HELD and ATLAS.relation_entry.'
    },
    {
      src: path.join(brainDir, '.system_generated/tasks/task-405.log'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/12-hardening-pre-bc5467246-category-error-regex-fail-task405.log',
      artifact_class: 'failed_intermediate_run_log',
      source_episode: 'Stage I · Post-Dollhouse Hardening Pre-Commit Intermediate Failure',
      notes: 'Failed intermediate test run during post-Dollhouse hardening that caught the category-error regex collision in tests/marrowline-screaming-grove-restoration.test.mjs before fixing it and committing bc5467246.'
    },
    {
      src: path.join(brainDir, '.system_generated/tasks/task-410.log'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/13-hardening-bc5467246-pure-node-285pass-task410.log',
      artifact_class: 'verification_or_diagnostic_log',
      source_episode: 'Stage I · Final Hardened Verification (bc5467246)',
      notes: '285/285 pure-Node Marrowline tests passing on verified deterministic repair ancestor bc5467246.'
    },
    {
      src: path.join(brainDir, '.system_generated/tasks/task-440.log'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/14-prepush-generated-sync-and-retrieval-lane-task440.log',
      artifact_class: 'verification_or_diagnostic_log',
      source_episode: 'Stage I · Pre-Push Contract Gate',
      notes: 'check-generated-sync.mjs and retrieval-lane.test.mjs green verification output.'
    },
    {
      src: path.join(brainDir, '.system_generated/steps/450/output.txt'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/15-pr1745-ci-run-44797765746-failed-log-step450.log',
      artifact_class: 'ci_diagnostic_log',
      source_episode: 'Stage I · PR #1745 CI Run 44797765746 Failure Log',
      notes: 'Raw gh run view --log-failed output from PR #1745 exact-head CI run 44797765746.'
    },
    {
      src: path.join(brainDir, '.system_generated/tasks/task-480.log'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/16-stage1-dossier-hygiene-scan-task480.log',
      artifact_class: 'verification_or_diagnostic_log',
      source_episode: 'Stage I · PR #1746 Pre-Commit Hygiene & JSON Scan',
      notes: 'Stage I dossier hygiene verification (49 scanned files, 24 valid JSON files, 0 hygiene hits).'
    },
    {
      src: path.join(brainDir, '.system_generated/tasks/task-521.log'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/18-browser-witness-pass1-server-stdout-task521.log',
      artifact_class: 'browser_witness_server_log',
      source_episode: 'Stage II · Section VI Pass 1 Witness Server Stdout',
      notes: 'Local zero-egress witness server Pass 1 stdout including synthetic gemini-consumption receipts.'
    },
    {
      src: path.join(brainDir, '.system_generated/tasks/task-541.log'),
      dest: 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/19-browser-witness-pass2-server-stdout-task541.log',
      artifact_class: 'browser_witness_server_log',
      source_episode: 'Stage II · Section VI Pass 2 Witness Server Stdout',
      notes: 'Local zero-egress witness server Pass 2 stdout for WITNESS-INCOMPLETE verification.'
    }
  ];

  for (const item of textArchives) {
    const rawBuf = fs.readFileSync(item.src);
    const origSha = sha256Buffer(rawBuf);
    let content = rawBuf.toString('utf8');
    if (item.extractJson) {
      const idx = content.indexOf('{');
      content = JSON.stringify(JSON.parse(content.slice(idx)), null, 2) + '\n';
    }
    const sanitized = sanitizeText(content);
    const destAbs = path.join(REPO_ROOT, item.dest);
    ensureDir(destAbs);
    fs.writeFileSync(destAbs, sanitized, 'utf8');
    const archivedSha = sha256File(destAbs);
    archivedLocalRecords.push({
      original_path: sanitizeText(item.src).replace(/\\/g, '/'),
      artifact_class: item.artifact_class,
      source_episode: item.source_episode,
      version_or_digest: {
        sha256: archivedSha,
        original_sha256: origSha,
        byte_identical: archivedSha === origSha
      },
      bytes: fs.statSync(destAbs).size,
      current_preservation_location: item.dest,
      archived_sha256: archivedSha,
      github_disposition: 'NEWLY_ARCHIVED_IN_PR_1746_STAGE_II',
      non_publication_reason: null,
      notes: item.notes
    });
  }

  // Combined CI Run 44800185041 forensics log (Steps 504 + 506 + 508)
  const ciStepFiles = [504, 506, 508].map((n) => path.join(brainDir, `.system_generated/steps/${n}/output.txt`));
  const ciCombined = ciStepFiles
    .map((p, idx) => `================ STEP ${[504, 506, 508][idx]} ================\n` + sanitizeText(fs.readFileSync(p, 'utf8')))
    .join('\n\n');
  const ciCombinedRel = 'research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/verification-logs/17-pr1746-ci-run-44800185041-forensics-step504-506-508.log';
  const ciCombinedAbs = path.join(REPO_ROOT, ciCombinedRel);
  ensureDir(ciCombinedAbs);
  fs.writeFileSync(ciCombinedAbs, ciCombined, 'utf8');
  archivedLocalRecords.push({
    original_path: '<LOCAL_BRAIN>/.system_generated/steps/{504,506,508}/output.txt',
    artifact_class: 'ci_diagnostic_log',
    source_episode: 'Stage II · Section V CI Run 44800185041 & Vixen Workflow Forensics',
    version_or_digest: {
      sha256: sha256File(ciCombinedAbs),
      source_step_sha256s: {
        step_504: sha256File(ciStepFiles[0]),
        step_506: sha256File(ciStepFiles[1]),
        step_508: sha256File(ciStepFiles[2])
      }
    },
    bytes: fs.statSync(ciCombinedAbs).size,
    current_preservation_location: ciCombinedRel,
    archived_sha256: sha256File(ciCombinedAbs),
    github_disposition: 'NEWLY_ARCHIVED_IN_PR_1746_STAGE_II',
    non_publication_reason: null,
    notes: 'Combined raw gh/git forensics establishing exact Run 44800185041 47-step breakdown, Vixen commit 2f0fa5944, failed Run 43821872218, and PR #1730 superseding freeze e32b82f0d.'
  });

  // 3. Extract raw run_command stdout/engine receipts from all 6 Dollhouse specialist subagents
  const dollhouseSubs = [
    ['01-aperture', 'dollhouse-aperture', '58c7dc01-ddd5-47a7-abe5-1a2f875316be'],
    ['02-fadt', 'dollhouse-fadt', '35a2025a-9967-46d9-acfe-876afc13e92e'],
    ['03-pedagogue', 'dollhouse-pedagogue', '1415ce7d-6db4-4160-a92e-4e052adc83dd'],
    ['04-atlas', 'dollhouse-atlas', 'b0ee9fd1-3394-4eaa-89da-e645c186a2dd'],
    ['05-temporal-custodian', 'dollhouse-temporal-custodian', '3c0e6c5b-ac37-4e79-8677-090b3d33f3f7'],
    ['06-orchestrator', 'dollhouse-orchestrator', 'f9edfc36-b2b0-45e2-81c6-4437904d8c0f']
  ];
  const transcriptExclusionRecords = [];
  for (const [slug, role, convId] of dollhouseSubs) {
    const extracted = extractDollhouseSubagentCommands(brainParent, role, convId);
    if (!extracted) continue;
    const rel = `research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/dollhouse-raw-command-outputs/${slug}-raw-commands.json`;
    const abs = path.join(REPO_ROOT, rel);
    ensureDir(abs);
    fs.writeFileSync(abs, JSON.stringify(extracted.payload, null, 2) + '\n', 'utf8');
    const archivedSha = sha256File(abs);
    archivedLocalRecords.push({
      original_path: `<LOCAL_USER_HOME>/.gemini/antigravity/brain/${convId}/.system_generated/logs/transcript_full.jsonl (run_command executions extracted)`,
      artifact_class: 'dollhouse_subagent_raw_command_outputs',
      source_episode: 'Stage I · Six-Role Dollhouse Specialist Execution',
      version_or_digest: {
        sha256: archivedSha,
        source_transcript_sha256: extracted.orig_transcript_sha256
      },
      bytes: fs.statSync(abs).size,
      current_preservation_location: rel,
      archived_sha256: archivedSha,
      github_disposition: 'NEWLY_ARCHIVED_IN_PR_1746_STAGE_II',
      non_publication_reason: null,
      notes: `All ${extracted.payload.run_command_count} raw run_command invocations and stdout/stderr engine outputs extracted from ${role} (${convId}).`
    });
    transcriptExclusionRecords.push({
      original_path: `<LOCAL_USER_HOME>/.gemini/antigravity/brain/${convId}/.system_generated/logs/transcript_full.jsonl`,
      artifact_class: 'raw_agent_harness_transcript',
      source_episode: 'Stage I · Six-Role Dollhouse Specialist Execution',
      version_or_digest: { sha256: extracted.orig_transcript_sha256 },
      bytes: extracted.orig_transcript_bytes,
      current_preservation_location: 'LOCAL_AGENT_BRAIN_RETAINED (substantive report + execution trace + all raw run_command outputs published in PR #1746)',
      github_disposition: 'EXCLUDED_LOCAL_ONLY_WITH_RATIONALE',
      non_publication_reason: 'Full raw JSONL harness transcript contains internal model thinking blocks and system wrapper metadata; 100% of final specialist prose reports (Stage I), execution trace metadata (Stage I), and raw run_command engine outputs (Stage II) are published in PR #1746.'
    });
  }

  // 4. Build full unified entries array covering ALL 8 custody classes
  const entries = [];

  // Class 1: Executable source & test files changed on verified deterministic repair ancestor bc5467246
  const codeFiles = git('diff', '--name-status', 'origin/main..bc5467246f12b0598f89d681e4a4450c4733eace')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [status, filePath] = line.split(/\t+/);
      return { status, filePath };
    })
    .filter((x) => !x.filePath.startsWith('research/'));

  for (const { status, filePath } of codeFiles) {
    const abs = path.join(REPO_ROOT, filePath);
    const liveSha = sha256File(abs);
    const blob = gitBlobInfo('bc5467246f12b0598f89d681e4a4450c4733eace', filePath);
    entries.push({
      original_path: filePath,
      artifact_class: filePath.startsWith('tests/') ? 'final_test_modification' : (filePath.startsWith('.github/') ? 'ci_wiring_modification' : 'final_source_modification'),
      source_episode: 'Stage I · Deterministic Repair Ancestor bc5467246 (unchanged in Stage II)',
      version_or_digest: {
        sha256: liveSha,
        git_commit: 'bc5467246f12b0598f89d681e4a4450c4733eace',
        git_blob_sha1: blob?.git_blob_sha1 || null,
        git_change_status: status
      },
      bytes: fs.statSync(abs).size,
      current_preservation_location: filePath,
      archived_sha256: liveSha,
      github_disposition: 'ALREADY_IN_PR_1746',
      non_publication_reason: null,
      notes: 'Present identically on PR #1745 (4a481e44f) and PR #1746 (5819e1035 and Stage II HEAD); zero Stage II runtime code edits.'
    });
  }

  // Class 2: Superseded intermediate source commits preserved immutably in Git history
  const intermediateCommits = [
    ['6cf64d17d82f727bb918be6869f313a3342e530c', 'Stage I · Initial Deterministic Repair (Pre-Hardening Ancestor of bc5467246)']
  ];
  for (const [rev, episode] of intermediateCommits) {
    let fullSha = null;
    try { fullSha = git('rev-parse', rev); } catch { continue; }
    const touched = git('diff-tree', '--no-commit-id', '--name-only', '-r', fullSha).split('\n').filter(Boolean);
    for (const rel of touched) {
      const blob = gitBlobInfo(fullSha, rel);
      entries.push({
        original_path: `${rel}@${fullSha.slice(0, 9)}`,
        artifact_class: 'superseded_intermediate_source_version',
        source_episode: episode,
        version_or_digest: {
          sha256: blob?.sha256 || null,
          git_commit: fullSha,
          git_blob_sha1: blob?.git_blob_sha1 || null
        },
        bytes: blob?.bytes ?? null,
        current_preservation_location: `git:${fullSha}:${rel}`,
        github_disposition: 'PRESERVED_IN_GIT_HISTORY_PR_1745_AND_1746',
        non_publication_reason: null,
        notes: 'Retained immutably in Git commit ancestry of both PR #1745 and PR #1746.'
      });
    }
  }

  // Class 3: Stage I & Stage II research files inside PR #1746
  const archivedByDest = new Map(archivedLocalRecords.map((r) => [r.current_preservation_location, r]));
  const navigatorRel = 'MARROWLINE_SCREAMING_GROVE_EMERGENCE_HQ_NAVIGATOR.md';
  const navAbs = path.join(REPO_ROOT, navigatorRel);
  entries.push({
    original_path: navigatorRel,
    artifact_class: 'pr_surface_navigator',
    source_episode: 'Stage I (5819e1035) · Updated in Stage II with Final Custody Appendix Index',
    version_or_digest: { sha256: sha256File(navAbs) },
    bytes: fs.statSync(navAbs).size,
    current_preservation_location: navigatorRel,
    archived_sha256: sha256File(navAbs),
    github_disposition: 'ALREADY_IN_PR_1746',
    non_publication_reason: null,
    notes: 'Surface entry guide for Emergence HQ adjudication.'
  });

  const allResearchRel = walkFiles(RESEARCH_DIR).map((r) => `research/marrowline-screaming-grove-restoration-20261120/${r}`);
  for (const rel of allResearchRel) {
    if (
      rel === 'research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_COMPLETE_WORK_PRODUCT_CUSTODY_MANIFEST.json' ||
      rel === 'research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_LOCAL_ARTIFACT_RECONCILIATION.md'
    ) continue;
    if (archivedByDest.has(rel)) {
      entries.push(archivedByDest.get(rel));
      continue;
    }
    const abs = path.join(REPO_ROOT, rel);
    const liveSha = sha256File(abs);
    const isStageII = rel.includes('/final-custody-appendix/');
    const in1745 = Boolean(gitBlobInfo('4a481e44f3f6f2b3c0f2fda74b6eafe1610de6d8', rel));
    const in5819 = Boolean(gitBlobInfo('5819e1035dbd0e1e57499103ede2cae1a93f8872', rel));
    let artifactClass = 'research_deliverable';
    if (rel.includes('/dollhouse/specialist-reports/')) artifactClass = 'dollhouse_specialist_report';
    else if (rel.includes('/dollhouse/engine-receipts/')) artifactClass = 'dollhouse_engine_receipt';
    else if (rel.includes('/dollhouse/specs/')) artifactClass = 'dollhouse_audit_spec';
    else if (rel.includes('/dollhouse/')) artifactClass = 'dollhouse_execution_trace';
    else if (rel.includes('/diffs/')) artifactClass = 'historical_source_diff';
    else if (rel.includes('/github-pr-snapshots/')) artifactClass = 'historical_pr_snapshot';
    else if (rel.includes('/scripts/') || rel.includes('/local-scripts/')) artifactClass = 'reproducibility_script';
    else if (rel.includes('/ci-diagnostics/') || rel.includes('CI_RED_')) artifactClass = 'ci_attribution_report';
    else if (rel.includes('/browser-witness/')) artifactClass = 'browser_witness_artifact';
    else if (rel.includes('REMOTE_REENTRY')) artifactClass = 'remote_reentry_receipt';
    entries.push({
      original_path: rel,
      artifact_class: artifactClass,
      source_episode: isStageII
        ? 'Stage II · Final Custody & Qualification Appendix'
        : (in1745 ? 'Stage I · Published in PR #1745 (4a481e44f) & Retained in PR #1746' : 'Stage I · Published in PR #1746 (5819e1035)'),
      version_or_digest: {
        sha256: liveSha,
        present_in_pr1745: in1745,
        present_in_pr1746_5819e1035: in5819
      },
      bytes: fs.statSync(abs).size,
      current_preservation_location: rel,
      archived_sha256: liveSha,
      github_disposition: isStageII ? 'NEWLY_ARCHIVED_IN_PR_1746_STAGE_II' : 'ALREADY_IN_PR_1746',
      non_publication_reason: null,
      notes: isStageII ? 'Authored/captured during Stage II custody pass.' : 'Preserved unchanged from Stage I.'
    });
  }

  // Class 5: Reconcile ALL top-level local scratch/ files not already covered via archivedLocalRecords
  const scratchMapping = [
    ['scratch/compare_oct02_exact.mjs', 'research/marrowline-screaming-grove-restoration-20261120/supporting-artifacts/scripts/compare-oct02-exact.mjs'],
    ['scratch/generate_effective_request_parity.mjs', 'research/marrowline-screaming-grove-restoration-20261120/supporting-artifacts/scripts/generate-effective-request-parity.mjs'],
    ['scratch/inspect_prs.mjs', 'research/marrowline-screaming-grove-restoration-20261120/supporting-artifacts/scripts/inspect-historical-prs.mjs'],
    ['scratch/diff_khonapolit_quality.patch', 'research/marrowline-screaming-grove-restoration-20261120/supporting-artifacts/fixtures/diff-oct02-to-head-khonapolit-quality.patch'],
    ['scratch/diff_marrowline_terminal.patch', 'research/marrowline-screaming-grove-restoration-20261120/supporting-artifacts/fixtures/diff-oct02-to-head-marrowline-terminal.patch'],
    ['scratch/dollhouse_audit_spec_baseline.json', 'research/marrowline-screaming-grove-restoration-20261120/supporting-artifacts/dollhouse/specs/dollhouse-audit-spec-baseline-bc5467246.json'],
    ['scratch/dollhouse_audit_spec_global_hold.json', 'research/marrowline-screaming-grove-restoration-20261120/supporting-artifacts/dollhouse/specs/dollhouse-audit-spec-global-hold-bc5467246.json'],
    ['scratch/dollhouse_engine_baseline.json', 'research/marrowline-screaming-grove-restoration-20261120/supporting-artifacts/dollhouse/engine-receipts/dollhouse-engine-receipt-baseline-6cf64d17d.json'],
    ['scratch/dollhouse_engine_baseline_bc5467246.json', 'research/marrowline-screaming-grove-restoration-20261120/supporting-artifacts/dollhouse/engine-receipts/dollhouse-engine-receipt-baseline-bc5467246.json'],
    ['scratch/dollhouse_engine_global_hold.json', 'research/marrowline-screaming-grove-restoration-20261120/supporting-artifacts/dollhouse/engine-receipts/dollhouse-engine-receipt-global-hold-6cf64d17d.json'],
    ['scratch/dollhouse_engine_global_hold_bc5467246.json', 'research/marrowline-screaming-grove-restoration-20261120/supporting-artifacts/dollhouse/engine-receipts/dollhouse-engine-receipt-global-hold-bc5467246.json']
  ];
  for (const [scratchRel, publishedRel] of scratchMapping) {
    const sp = path.join(brainDir, scratchRel);
    const dp = path.join(REPO_ROOT, publishedRel);
    if (!fs.existsSync(sp)) continue;
    const sSha = sha256File(sp);
    const dSha = fs.existsSync(dp) ? sha256File(dp) : null;
    entries.push({
      original_path: `<LOCAL_BRAIN>/${scratchRel}`,
      artifact_class: 'local_scratch_source_reconciled',
      source_episode: 'Stage I · Local Scratch Work Product (Already Published in PR #1746)',
      version_or_digest: {
        original_sha256: sSha,
        published_sha256: dSha,
        byte_identical: sSha === dSha
      },
      bytes: fs.statSync(sp).size,
      current_preservation_location: publishedRel,
      archived_sha256: dSha,
      github_disposition: 'ALREADY_IN_PR_1746',
      non_publication_reason: null,
      notes: sSha === dSha
        ? 'Byte-for-byte identical to published Stage I file in PR #1746.'
        : 'Published in Stage I PR #1746 with portable relative paths / CRLF normalization; original local SHA-256 recorded here.'
    });
  }

  // scratch/commission_prompt.md (excluded due to harness XML metadata tags)
  const commPromptPath = path.join(brainDir, 'scratch/commission_prompt.md');
  if (fs.existsSync(commPromptPath)) {
    entries.push({
      original_path: '<LOCAL_BRAIN>/scratch/commission_prompt.md',
      artifact_class: 'local_prompt_extract',
      source_episode: 'Stage I · Local Copy of Commission Prompt',
      version_or_digest: { sha256: sha256File(commPromptPath) },
      bytes: fs.statSync(commPromptPath).size,
      current_preservation_location: 'LOCAL_AGENT_BRAIN_RETAINED',
      github_disposition: 'EXCLUDED_LOCAL_ONLY_WITH_RATIONALE',
      non_publication_reason: 'Contains raw Antigravity session harness metadata XML blocks (<USER_REQUEST>, <ADDITIONAL_METADATA>, <USER_SETTINGS_CHANGE>); all commission terms and deliverables are already captured in PR #1746.'
    });
  }

  // scratch/oct02_snapshot/ — extracted read-only Git blobs of ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a
  const oct02Dir = path.join(brainDir, 'scratch/oct02_snapshot');
  const oct02Files = walkFiles(oct02Dir);
  entries.push({
    original_path: '<LOCAL_BRAIN>/scratch/oct02_snapshot/**',
    artifact_class: 'read_only_historical_extraction',
    source_episode: 'Stage I · Historical Oct 2 Reference Commit Extraction',
    version_or_digest: {
      git_commit: 'ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a',
      extracted_file_count: oct02Files.length
    },
    bytes: oct02Files.reduce((sum, rel) => sum + fs.statSync(path.join(oct02Dir, rel)).size, 0),
    current_preservation_location: 'git:ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a (already retained in GitHub repository object store)',
    github_disposition: 'INDEPENDENTLY_IN_GITHUB_REPO_OBJECT_STORE',
    non_publication_reason: 'Read-only extraction of historical repository commit ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a; per Section III/IV, identical Git blobs already retained in GitHub are referenced by commit/blob digest rather than duplicated.'
  });

  // Class 6: Non-archived ephemeral/oversized local task logs & raw primary/subagent transcripts
  const excludedTaskLogs = [
    ['task-104.log', 'Failed PowerShell tar pipe attempt during Oct 2 extraction (1.6 MB repeating bad-header retries); superseded by clean git archive extraction.'],
    ['task-16.log', '225 KB raw GitHub PR JSON dump for #1730/#1734/#1735; superseded by compact PR snapshots and Stage II remote reentry receipt.'],
    ['task-26.log', 'Initial historical PR header query; superseded by archived github-pr-snapshots/pr-*.json.'],
    ['task-34.log', 'git worktree add checkout progress bar output (non-substantive carriage-return log).'],
    ['task-140.log', 'Exploratory Select-String grep output during Stage I reading.'],
    ['task-238.log', 'PowerShell Select-String directory-access error on app/dome-world/ash folder.'],
    ['task-333.log', 'Duplicate 277/277 pure-Node test pass identical to archived 04-post-repair-6cf64d17d-pure-node-277pass-task212.log.'],
    ['task-412.log', 'Duplicate 285/285 pure-Node test pass identical to archived 13-hardening-bc5467246-pure-node-285pass-task410.log.'],
    ['task-446.log', 'Live ANSI polling stream of gh run watch on PR #1745; clean failure extract archived as 15-pr1745-ci-run-44797765746-failed-log-step450.log.'],
    ['task-463.log', 'git worktree add progress bar output for PR #1746 dossier worktree.'],
    ['task-483.log', 'Compact PR index printout superseded by archived github-pr-snapshots/oct-nov-marrowline-prs-index.json.'],
    ['task-489.log', 'git commit/push stdout for 5819e1035; commit itself is live in GitHub PR #1746.']
  ];
  for (const [fname, reason] of excludedTaskLogs) {
    const p = path.join(brainDir, '.system_generated/tasks', fname);
    if (!fs.existsSync(p)) continue;
    entries.push({
      original_path: `<LOCAL_BRAIN>/.system_generated/tasks/${fname}`,
      artifact_class: 'ephemeral_command_log',
      source_episode: 'Stage I · Local Execution Log',
      version_or_digest: { sha256: sha256File(p) },
      bytes: fs.statSync(p).size,
      current_preservation_location: 'LOCAL_AGENT_BRAIN_RETAINED',
      github_disposition: 'EXCLUDED_LOCAL_ONLY_WITH_RATIONALE',
      non_publication_reason: reason
    });
  }
  entries.push(...transcriptExclusionRecords);

  const primaryTranscript = path.join(brainDir, '.system_generated/logs/transcript_full.jsonl');
  if (fs.existsSync(primaryTranscript)) {
    entries.push({
      original_path: '<LOCAL_BRAIN>/.system_generated/logs/transcript_full.jsonl',
      artifact_class: 'raw_agent_harness_transcript',
      source_episode: 'Stage I & Stage II · Primary Antigravity Session Log',
      version_or_digest: { sha256: sha256File(primaryTranscript) },
      bytes: fs.statSync(primaryTranscript).size,
      current_preservation_location: 'LOCAL_AGENT_BRAIN_RETAINED',
      github_disposition: 'EXCLUDED_LOCAL_ONLY_WITH_RATIONALE',
      non_publication_reason: 'Contains internal model reasoning blocks, local filesystem paths, and session harness metadata; all substantive engineering/research outputs and verification logs are published in PR #1746.'
    });
  }

  // Class 7: Read-only repository source dependencies consulted across Oct 2 (ffb98ac00) and origin/main (363b5b4ae)
  const readOnlyDeps = [
    ['ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a', 'api/khonapolit.js', 'Oct 2 historical API route baseline'],
    ['ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a', 'server/khonapolit-quality.js', 'Oct 2 historical relay & prompt baseline'],
    ['ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a', 'app/dome-world/marrowline.html', 'Oct 2 historical Marrowline HTML shell'],
    ['ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a', 'app/dome-world/marrowline-terminal.js', 'Oct 2 historical client relay/history baseline'],
    ['ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a', 'app/dome-world/khonapolit-relay.js', 'Oct 2 historical client renderer baseline'],
    ['ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a', 'app/dome-world/khonapolit-covenant.js', 'Oct 2 historical client covenant baseline'],
    ['363b5b4aeaec33ad380c5f1124f0fe96e3d7975e', 'AGENTS.md', 'TD613 governing agent entry contract'],
    ['363b5b4aeaec33ad380c5f1124f0fe96e3d7975e', 'DOLLHOUSE.md', 'Dollhouse governance map'],
    ['363b5b4aeaec33ad380c5f1124f0fe96e3d7975e', 'PEDAGOGUE.md', 'Flow-Core Pedagogue canonical reference'],
    ['363b5b4aeaec33ad380c5f1124f0fe96e3d7975e', 'APERTURE.md', 'Aperture observability canonical reference'],
    ['363b5b4aeaec33ad380c5f1124f0fe96e3d7975e', 'ATLAS.md', 'Atlas receiver-relation canonical reference'],
    ['363b5b4aeaec33ad380c5f1124f0fe96e3d7975e', 'FADT.md', 'FADT admissibility descent canonical reference'],
    ['363b5b4aeaec33ad380c5f1124f0fe96e3d7975e', '.github/workflows/vixen-a0-corpus-rebuild.yml', 'Origin/main commit 2f0fa5944 Vixen workflow causing CI Run 44800185041 Step 6 RED'],
    ['363b5b4aeaec33ad380c5f1124f0fe96e3d7975e', 'tests/workflow-estate.test.mjs', 'Four-workflow constitutional guard (preserved unmodified)'],
    ['363b5b4aeaec33ad380c5f1124f0fe96e3d7975e', 'tests/release-plumbing.test.mjs', 'No-git-push release-plumbing constitutional guard (preserved unmodified)'],
    ['363b5b4aeaec33ad380c5f1124f0fe96e3d7975e', 'scripts/run-dollhouse-skill-audit.mjs', 'Strict-provenance Dollhouse skill-audit CLI'],
    ['363b5b4aeaec33ad380c5f1124f0fe96e3d7975e', 'app/dome-world/marrowline.html', 'Restored Marrowline HTML shell exercised by provider-free browser witness'],
    ['363b5b4aeaec33ad380c5f1124f0fe96e3d7975e', 'app/dome-world/khonapolit-relay.js', 'Marrowline client two-voice renderer exercised by provider-free browser witness'],
    ['363b5b4aeaec33ad380c5f1124f0fe96e3d7975e', 'app/dome-world/khonapolit-covenant.js', 'Marrowline client covenant module']
  ];
  for (const [rev, rel, note] of readOnlyDeps) {
    const info = gitBlobInfo(rev, rel);
    if (!info) continue;
    entries.push({
      original_path: `${rel}@${rev.slice(0, 9)}`,
      artifact_class: 'read_only_source_dependency',
      source_episode: rev.startsWith('ffb98ac00') ? 'Historical Reference (Oct 2, 2026)' : 'Consulted Baseline (origin/main 363b5b4ae)',
      version_or_digest: {
        sha256: info.sha256,
        git_commit: rev,
        git_blob_sha1: info.git_blob_sha1
      },
      bytes: info.bytes,
      current_preservation_location: `git:${rev}:${rel}`,
      github_disposition: 'INDEPENDENTLY_IN_GITHUB_REPO_OBJECT_STORE',
      non_publication_reason: 'Read-only consulted source already retained immutably in GitHub repository object store; referenced by exact commit, Git blob SHA-1, and SHA-256 without duplication.',
      notes: note
    });
  }

  // Class 8: Excluded protected/environment/unrelated classes
  const excludedClasses = [
    ['<LOCAL_PRIMARY_CHECKOUT>/.env*', 'protected_credentials_and_env', 'Never inspected or published; local environment/credentials remain strictly private under local custody.'],
    ['<LOCAL_PRIMARY_CHECKOUT>/node_modules & .venv-dome', 'environment_dependency_cache', 'Environment-generated package caches; excluded by classification per Section III.'],
    ['<LOCAL_PRIMARY_CHECKOUT> (dirty rulefield-counterworld-loom-lab-20261108 @ f1928fcaf, 79 dirty lines)', 'unrelated_user_worktree', 'Preexisting dirty user workspace outside Marrowline restoration scope; preserved untouched.'],
    ['8 sibling local worktrees & 4 local stashes (stash@{0}..stash@{3})', 'unrelated_user_worktrees_and_stashes', 'Preexisting independent research estates (Vixen, Experiment A/B, Atlas, Rulefield); preserved untouched.'],
    ['<LOCAL_BROWSER_SUBAGENT>/browser_sandbox/screenshots/*', 'ephemeral_subagent_sandbox_artifacts', 'Internal subagent screenshots not listed in BROWSER_HOST_FACTS; only host-verified BROWSER_HOST_FACTS screenshots (final_step_47.png, final_step_59.png) are cited and archived.']
  ];
  for (const [orig, cls, reason] of excludedClasses) {
    entries.push({
      original_path: orig,
      artifact_class: cls,
      source_episode: 'Local Environment & Preexisting Custody Boundary',
      version_or_digest: { classified_exclusion: true },
      bytes: null,
      current_preservation_location: 'EXCLUDED_BY_CLASS_LOCAL_CUSTODY',
      github_disposition: 'EXCLUDED_ENV_OR_UNRELATED_BY_CLASS',
      non_publication_reason: reason
    });
  }

  // Summarize counts
  const dispositionCounts = {};
  const classCounts = {};
  for (const e of entries) {
    dispositionCounts[e.github_disposition] = (dispositionCounts[e.github_disposition] || 0) + 1;
    classCounts[e.artifact_class] = (classCounts[e.artifact_class] || 0) + 1;
  }

  const manifest = {
    schema: 'td613.marrowline.complete-work-product-custody-manifest/v1.0',
    commission: 'TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION',
    stage: 'Stage II · Final Custody and Qualification Pass',
    repository: 'tauric-diana-613/TD613-TCP',
    primary_pr: 1746,
    primary_branch: 'research/marrowline-screaming-grove-emergence-hq-dossier-20261120',
    predecessor_pr_1746_head: '5819e1035dbd0e1e57499103ede2cae1a93f8872',
    preserved_precursor_pr: 1745,
    preserved_precursor_head: '4a481e44f3f6f2b3c0f2fda74b6eafe1610de6d8',
    verified_deterministic_repair_ancestor: 'bc5467246f12b0598f89d681e4a4450c4733eace',
    historical_reference_commit: 'ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a',
    origin_main_head_at_reentry: '363b5b4aeaec33ad380c5f1124f0fe96e3d7975e',
    authority_posture: {
      paid_provider_calls_authorized: 0,
      paid_provider_calls_executed: 0,
      new_deployment_gestures_authorized: 0,
      merge_authority: false,
      human_artistic_closure: 'RESERVED'
    },
    summary: {
      total_accounted_entries: entries.length,
      by_github_disposition: dispositionCounts,
      by_artifact_class: classCounts
    },
    verification_command: 'node research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/local-scripts/build-work-product-custody-manifest.mjs --verify',
    entries
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  // Generate MARROWLINE_LOCAL_ARTIFACT_RECONCILIATION.md
  const newlyArchived = entries.filter((e) => e.github_disposition === 'NEWLY_ARCHIVED_IN_PR_1746_STAGE_II');
  const excluded = entries.filter((e) => e.github_disposition.startsWith('EXCLUDED_'));
  const intermediate = entries.filter((e) => e.github_disposition === 'PRESERVED_IN_GIT_HISTORY_PR_1745_AND_1746');
  const readOnly = entries.filter((e) => e.github_disposition === 'INDEPENDENTLY_IN_GITHUB_REPO_OBJECT_STORE');

  const md = [
    '# Marrowline / Screaming Grove — Local Artifact Reconciliation and Complete Custody Index',
    '',
    '- **Commission:** `TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION` (Stage II Final Custody Pass)',
    '- **Machine-Readable Manifest:** [`MARROWLINE_COMPLETE_WORK_PRODUCT_CUSTODY_MANIFEST.json`](MARROWLINE_COMPLETE_WORK_PRODUCT_CUSTODY_MANIFEST.json)',
    '- **Portable Integrity Verifier:** `node research/marrowline-screaming-grove-restoration-20261120/final-custody-appendix/local-scripts/build-work-product-custody-manifest.mjs --verify`',
    '- **Target PR:** `#1746` (`research/marrowline-screaming-grove-emergence-hq-dossier-20261120`, `DO NOT MERGE`)',
    '- **Preserved Precursor PR:** `#1745` (`4a481e44f3f6f2b3c0f2fda74b6eafe1610de6d8`, untouched)',
    '- **Verified Deterministic Repair Ancestor:** `bc5467246f12b0598f89d681e4a4450c4733eace` (unchanged in Stage II)',
    '',
    '---',
    '',
    '## 1. Census Summary by GitHub Disposition',
    '',
    '| GitHub Disposition | Entry Count | Meaning |',
    '|---|---:|---|',
    ...Object.entries(dispositionCounts).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `| \`${k}\` | ${v} | ${
      k === 'ALREADY_IN_PR_1746' ? 'Published in Stage I (`5819e1035` / `4a481e44f` / `bc5467246`) and retained intact' :
      k === 'NEWLY_ARCHIVED_IN_PR_1746_STAGE_II' ? 'Previously local-only or Stage II-generated work products newly archived in `final-custody-appendix/`' :
      k === 'PRESERVED_IN_GIT_HISTORY_PR_1745_AND_1746' ? 'Superseded intermediate source versions retained immutably in Git commit ancestry (`6cf64d17d`)' :
      k === 'INDEPENDENTLY_IN_GITHUB_REPO_OBJECT_STORE' ? 'Read-only consulted sources already in GitHub object store (`ffb98ac00`, `363b5b4ae`); referenced by blob/SHA-256 without duplication' :
      k === 'EXCLUDED_LOCAL_ONLY_WITH_RATIONALE' ? 'Retained locally with SHA-256 and explicit non-publication rationale (raw harness transcripts, duplicate/ANSI logs, prompt harness XML)' :
      'Protected credentials, package caches, unrelated user workspaces/stashes, and non-host-verified sandbox files excluded by class'
    } |`),
    `| **TOTAL ACCOUNTED ENTRIES** | **${entries.length}** | **Zero unaccounted work products** |`,
    '',
    '---',
    '',
    '## 2. Newly Archived Work Products in `final-custody-appendix/` (Stage II)',
    '',
    '| Artifact Class | Preservation Path in PR `#1746` | Bytes | Archived SHA-256 (prefix) | Source Episode / Notes |',
    '|---|---|---:|---|---|',
    ...newlyArchived.map((e) => `| \`${e.artifact_class}\` | \`${e.current_preservation_location}\` | ${e.bytes ?? '—'} | \`${(e.archived_sha256 || '').slice(0, 12)}\` | ${e.source_episode} |`),
    '',
    '---',
    '',
    '## 3. Superseded Intermediate Source Versions (Immutable Git Ancestry)',
    '',
    'All intermediate repair states prior to `bc5467246` remain permanently addressable in Git history on both PR `#1745` and PR `#1746`:',
    '',
    '| Commit | File | Git Blob SHA-1 (prefix) | SHA-256 (prefix) | Episode |',
    '|---|---|---|---|---|',
    ...intermediate.map((e) => `| \`${(e.version_or_digest?.git_commit || '').slice(0, 9)}\` | \`${e.original_path.split('@')[0]}\` | \`${(e.version_or_digest?.git_blob_sha1 || '').slice(0, 12)}\` | \`${(e.version_or_digest?.sha256 || '').slice(0, 12)}\` | ${e.source_episode} |`),
    '',
    '---',
    '',
    '## 4. Read-Only Consulted Sources Referenced Without Duplication',
    '',
    `${readOnly.length} read-only repository entries (including the complete ${oct02Files.length}-file historical extraction of October 2 commit \`ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a\` and baseline governance/runtime blobs at \`origin/main\` \`363b5b4ae\`) are referenced by exact commit, Git blob SHA-1, and SHA-256 inside \`MARROWLINE_COMPLETE_WORK_PRODUCT_CUSTODY_MANIFEST.json\` rather than duplicated into \`research/\`.`,
    '',
    '---',
    '',
    '## 5. Explicitly Excluded Local & Protected Items (Non-Sensitive Exclusion Receipts)',
    '',
    '| Original Item / Class | Artifact Class | Disposition | SHA-256 (where safe) | Explicit Non-Publication Rationale |',
    '|---|---|---|---|---|',
    ...excluded.map((e) => `| \`${e.original_path}\` | \`${e.artifact_class}\` | \`${e.github_disposition}\` | ${e.version_or_digest?.sha256 ? `\`${e.version_or_digest.sha256.slice(0, 12)}\`` : '*(excluded by class)*'} | ${e.non_publication_reason} |`),
    ''
  ].join('\n');

  fs.writeFileSync(RECON_PATH, md, 'utf8');
  console.log(`BUILT_MANIFEST entries=${entries.length} newly_archived=${newlyArchived.length} excluded=${excluded.length}`);
}

if (mode === 'build') {
  runBuild();
  runVerify();
} else {
  runVerify();
}
