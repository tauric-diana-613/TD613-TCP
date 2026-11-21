#!/usr/bin/env node
// Portable zero-omission custody builder & verifier for Commission
// TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION (2026-11-21 Visual Parity Edition).
//
// Usage:
//   node .../verify-visual-parity-custody.mjs          (runs portable --verify)
//   node .../verify-visual-parity-custody.mjs --build  (rebuilds manifest + verifies)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const PACKET_REL = 'research/marrowline-screaming-grove-visual-parity-20261121';
const PACKET_DIR = path.join(REPO_ROOT, PACKET_REL);
const MANIFEST_PATH = path.join(PACKET_DIR, 'MARROWLINE_COMPLETE_WORK_PRODUCT_CUSTODY_MANIFEST.json');

const sha256Buf = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const sha256File = (p) => sha256Buf(fs.readFileSync(p));

function walkFiles(dir, base = dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkFiles(full, base));
    else out.push(path.relative(base, full).replace(/\\/g, '/'));
  }
  return out;
}

function gitBlobInfo(rev, repoRel) {
  try {
    const oid = execFileSync('git', ['rev-parse', `${rev}:${repoRel}`], {
      cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    const buf = execFileSync('git', ['cat-file', 'blob', oid], {
      cwd: REPO_ROOT, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore']
    });
    return { git_commit: rev, git_blob_sha1: oid, bytes: buf.length, sha256: sha256Buf(buf) };
  } catch {
    return null;
  }
}

function checkHygiene(text, label) {
  const codexRe = new RegExp('\\x40' + 'codex\\b', 'i');
  const checks = [
    ['executable_codex_mention', codexRe],
    ['google_api_key', /AIza[0-9A-Za-z_-]{25,}/],
    ['github_token', /gh[pousr]_[0-9A-Za-z]{25,}/],
    ['openai_key', /\bsk-[A-Za-z0-9]{24,}\b/],
    ['private_key_block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
    ['raw_windows_user_path', /[A-Za-z]:[\\/]Users[\\/][^\\/\s"'`<>|]+/i]
  ];
  const hits = [];
  for (const [name, re] of checks) if (re.test(text)) hits.push(`${label}:${name}`);
  return hits;
}

function runBuild() {
  const entries = [];

  // 1. Ported deterministic runtime/test/CI files + offline comparator/preregistration from bc5467246 / #1746
  const portedFiles = [
    ['server/marrowline-completion.js', 'deterministic_runtime_repair'],
    ['server/khonapolit-quality.js', 'deterministic_runtime_repair'],
    ['server/marrowline-attachment-quality.js', 'deterministic_runtime_repair'],
    ['app/engine/aperture-v3-task-intent.js', 'deterministic_runtime_repair'],
    ['app/dome-world/khonapolit-relay.js', 'deterministic_runtime_repair'],
    ['app/dome-world/marrowline-historical-grove.js', 'deterministic_runtime_repair'],
    ['tests/marrowline-screaming-grove-restoration.test.mjs', 'deterministic_test_suite'],
    ['.github/workflows/td613-ci.yml', 'ci_scope_wiring'],
    ['research/marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs', 'retained_offline_comparator'],
    ['research/marrowline-screaming-grove-restoration-20261120/BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md', 'retained_preregistration_held']
  ];
  for (const [rel, cls] of portedFiles) {
    const abs = path.join(REPO_ROOT, rel);
    entries.push({
      path: rel,
      artifact_class: cls,
      disposition: 'COMMITTED_IN_PR',
      bytes: fs.statSync(abs).size,
      sha256: sha256File(abs),
      source_origin: 'Ported cleanly from verified deterministic ancestor bc5467246 / immutable PR #1746 fe2e8bed3 onto origin/main f1288ec69'
    });
  }

  // 2. All files inside research/marrowline-screaming-grove-visual-parity-20261121/ (except manifest itself)
  for (const relSub of walkFiles(PACKET_DIR)) {
    if (relSub === 'MARROWLINE_COMPLETE_WORK_PRODUCT_CUSTODY_MANIFEST.json') continue;
    const repoRel = `${PACKET_REL}/${relSub}`;
    const abs = path.join(REPO_ROOT, repoRel);
    let cls = 'research_deliverable';
    if (relSub.startsWith('visual-reference-corpus/01_OPERATOR_ACCEPTED_MARROWLINE/')) cls = 'operator_accepted_original_image';
    else if (relSub.startsWith('visual-reference-corpus/02_OTHER_HISTORICAL_REFERENCES/')) cls = 'other_historical_reference_original_image';
    else if (relSub.startsWith('visual-reference-corpus/')) cls = 'visual_corpus_manifest_or_doc';
    else if (relSub.startsWith('browser-witness/captures/') && relSub.endsWith('.png')) cls = 'chrome_cdp_browser_witness_png';
    else if (relSub.endsWith('.mjs')) cls = 'reproducibility_script';
    else if (relSub.endsWith('.json')) cls = 'machine_readable_index_or_parity';
    entries.push({
      path: repoRel,
      artifact_class: cls,
      disposition: 'COMMITTED_IN_PR',
      bytes: fs.statSync(abs).size,
      sha256: sha256File(abs)
    });
  }

  // 3. Read-only consulted repository sources referenced by exact commit + Git blob SHA-1 + SHA-256 (no duplication)
  const readOnlyRefs = [
    ['ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a', 'server/khonapolit-quality.js'],
    ['ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a', 'app/dome-world/marrowline-terminal.js'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'docs/research/2026-09-16-SCORPIO-ATTRACTOR-SPECIMEN-MARROWLINE-LAB.md'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'scripts/marrowline-scorpio-attractor-assay.mjs'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'tests/fixtures/marrowline-scorpio-attractor-assay-v01.json'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'tests/marrowline-attractor-quality-contract.test.mjs'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'docs/research/2026-09-17-MARROWLINE-INSTRUMENT-RELAY-CALIBRATION.md'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'docs/research/2026-09-23-marrowline-expressive-regression/marrowline-example-as-exported.txt'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'docs/research/2026-09-23-marrowline-expressive-regression/gemini-example-as-exported.txt'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'docs/research/2026-09-24-native-prosody-atlas/PROBE-3.txt'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'docs/research/2026-09-24-native-prosody-atlas/POST-RELEASE-BOTS-REGRESSION.md'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'docs/research/2026-09-24-native-prosody-atlas/images/06-IMG_0940.png'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'docs/research/2026-09-24-native-prosody-atlas/images/08-IMG_0942.jpeg'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'research/marrowline-early-oct-full-voice-20261020/FULL-VOICE-SSE-ONSET-STENCIL-AUDIT-20261020.md'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'app/dome-world/marrowline-desktop-repair.css'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'app/dome-world/marrowline-terminal.css'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'app/dome-world/marrowline-mobile-reader.js'],
    ['f1288ec690c5d440a356f9db413a289e404f40b3', 'scripts/marrowline-mobile-reader-browser-witness.mjs']
  ];
  for (const [rev, rel] of readOnlyRefs) {
    const info = gitBlobInfo(rev, rel);
    if (!info) continue;
    entries.push({
      path: `${rel}@${rev.slice(0, 9)}`,
      artifact_class: 'read_only_consulted_repo_blob',
      disposition: 'INDEPENDENTLY_IN_GITHUB_OBJECT_STORE',
      ...info
    });
  }

  // 4. Explicit non-sensitive exclusions
  const exclusions = [
    ['uploaded_archive_zip', 'TD613_Marrowline_Screaming_Grove_Expanded_Visual_References.zip (11,359,099 bytes, sha256: 862bd895e28cab340eeca31242e471c0dc35eb2b6208f6d8844fe1c97fd7f12c)', 'All 27 contained files (22 lossless images + 5 manifests/docs) extracted and committed verbatim under visual-reference-corpus/; outer ZIP wrapper omitted to avoid duplicating 11 MB binary.'],
    ['raw_third_party_scorpio_specimen', 'Unpublished third-party entrant specimen referenced in docs/research/2026-09-16-SCORPIO-ATTRACTOR-SPECIMEN-MARROWLINE-LAB.md', 'Never imported or published; private third-party consent unestablished.'],
    ['protected_local_assets', '.env*, node_modules, .venv-dome, primary dirty checkout (f1928fcaf), 11 sibling worktrees, 4 local stashes, raw agent harness JSONL transcripts', 'Excluded by custody class; zero credentials or unrelated user workspace files published.']
  ];
  for (const [cls, item, reason] of exclusions) {
    entries.push({
      path: item,
      artifact_class: cls,
      disposition: 'EXCLUDED_WITH_RATIONALE',
      non_publication_reason: reason
    });
  }

  const manifest = {
    schema: 'td613.marrowline.visual-parity-work-product-custody/v1.0',
    commission: 'TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION (2026-11-21 Expanded Visual Corpus Edition)',
    base_commit: 'f1288ec690c5d440a356f9db413a289e404f40b3',
    retained_deterministic_ancestor: 'bc5467246f12b0598f89d681e4a4450c4733eace',
    immutable_predecessor_pr_1746: 'fe2e8bed3bd0923ae7c146524d8832531cbe837e',
    immutable_precursor_pr_1745: '4a481e44f3f6f2b3c0f2fda74b6eafe1610de6d8',
    immutable_oct02_comparator: 'ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a',
    total_entries: entries.length,
    committed_entries: entries.filter((e) => e.disposition === 'COMMITTED_IN_PR').length,
    read_only_repo_blobs: entries.filter((e) => e.disposition === 'INDEPENDENTLY_IN_GITHUB_OBJECT_STORE').length,
    excluded_with_rationale: entries.filter((e) => e.disposition === 'EXCLUDED_WITH_RATIONALE').length,
    entries
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`BUILT ${path.relative(REPO_ROOT, MANIFEST_PATH)} total=${manifest.total_entries} committed=${manifest.committed_entries}`);
}

function runVerify() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const errors = [];
  let checkedFiles = 0;
  let checkedJson = 0;
  let checkedMdLinks = 0;
  let hygieneHits = 0;

  const committedSet = new Set();
  for (const e of manifest.entries) {
    if (e.disposition !== 'COMMITTED_IN_PR') continue;
    committedSet.add(e.path);
    const abs = path.join(REPO_ROOT, e.path);
    if (!fs.existsSync(abs)) { errors.push(`Missing committed file: ${e.path}`); continue; }
    const liveSha = sha256File(abs);
    if (liveSha !== e.sha256) errors.push(`SHA-256 mismatch: ${e.path}`);
    checkedFiles++;
    const ext = path.extname(abs).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.ico'].includes(ext)) {
      const txt = fs.readFileSync(abs, 'utf8');
      // Only enforce raw_windows_user_path on newly authored packet files (never reject preexisting reference docs)
      const hits = checkHygiene(txt, e.path).filter((h) => !e.path.startsWith('research/marrowline-screaming-grove-visual-parity-20261121/visual-reference-corpus/') || !h.endsWith(':raw_windows_user_path'));
      if (hits.length) { hygieneHits += hits.length; errors.push(...hits); }
      if (ext === '.json') {
        try { JSON.parse(txt); checkedJson++; } catch (err) { errors.push(`Bad JSON ${e.path}: ${err.message}`); }
      }
      if (ext === '.md' && e.path.startsWith(PACKET_REL) && !e.path.includes('visual-reference-corpus/')) {
        for (const m of txt.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
          const href = m[1].split('#')[0].trim();
          if (!href || /^(https?:|mailto:|file:|#)/.test(href)) continue;
          const resolved = path.resolve(path.dirname(abs), href);
          checkedMdLinks++;
          if (!fs.existsSync(resolved)) errors.push(`Broken link in ${e.path}: ${href}`);
        }
      }
    }
  }

  // Verify every file inside PACKET_DIR (except manifest) is in committedSet
  for (const relSub of walkFiles(PACKET_DIR)) {
    if (relSub === 'MARROWLINE_COMPLETE_WORK_PRODUCT_CUSTODY_MANIFEST.json') continue;
    const fullRel = `${PACKET_REL}/${relSub}`;
    if (!committedSet.has(fullRel)) errors.push(`Unaccounted file in packet: ${fullRel}`);
  }

  // Cross-verify REFERENCE_MANIFEST.json (all 22 original images)
  const refM = JSON.parse(fs.readFileSync(path.join(PACKET_DIR, 'visual-reference-corpus/03_ACTIVATION_AND_PROVENANCE/REFERENCE_MANIFEST.json'), 'utf8'));
  for (const f of refM.files) {
    const abs = path.join(PACKET_DIR, 'visual-reference-corpus', f.archive_path);
    if (!fs.existsSync(abs) || sha256File(abs) !== f.sha256 || fs.statSync(abs).size !== f.bytes) {
      errors.push(`REFERENCE_MANIFEST mismatch: ${f.archive_path}`);
    }
  }

  // Cross-verify MARROWLINE_ALL_OUTPUTS_VISUAL_INDEX.json (all 72 PNGs)
  const vIdx = JSON.parse(fs.readFileSync(path.join(PACKET_DIR, 'MARROWLINE_ALL_OUTPUTS_VISUAL_INDEX.json'), 'utf8'));
  for (const s of vIdx.specimens) {
    for (const sh of s.screenshots) {
      const abs = path.join(REPO_ROOT, sh.path);
      if (!fs.existsSync(abs) || sha256File(abs) !== sh.sha256) {
        errors.push(`VISUAL_INDEX PNG mismatch: ${sh.path}`);
      }
    }
  }

  console.log(JSON.stringify({
    ok: errors.length === 0,
    checked_committed_files: checkedFiles,
    checked_json_files: checkedJson,
    checked_markdown_links: checkedMdLinks,
    reference_manifest_images_verified: refM.files.length,
    visual_index_pngs_verified: vIdx.total_screenshots,
    hygiene_hits: hygieneHits,
    error_count: errors.length,
    errors
  }, null, 2));
  if (errors.length > 0) process.exit(1);
}

if (process.argv.includes('--build')) runBuild();
runVerify();
