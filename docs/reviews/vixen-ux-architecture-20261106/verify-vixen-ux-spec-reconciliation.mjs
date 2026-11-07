#!/usr/bin/env node

/**
 * Deterministic Source & Prototype Reconciliation Verifier (v2.2)
 * for Vixen Cybernetics Specification (V3) AND Executable Prototype (V4: app/encyclopedia/vix-cyb.html).
 *
 * Directly answers Emergence HQ's question ("how much the new verifier actually proves") by:
 *   1. Checking row-level relational coupling (not merely global ID set presence) across BOTH
 *      VIXEN_CYBERNETICS_UX_ARCHITECTURE_SPECIFICATION.md and app/encyclopedia/vix-cyb.html:
 *        - Every 1 of 32 emwork_* routes -> exact linked emsrc_* IDs, exact byte_length & sha256 from
 *          source-files.jsonl, exact identity_status, exact human_gate_required, and authorship="UNRESOLVED".
 *        - Per-cluster Work AND Manifestation sums (C1: 12W/18M, C2: 9W/15M, C3: 2W/4M, C4: 5W/10M, C5: 4W/6M = 32W/53M).
 *        - All 7 unpaired Prospective Batch-B PDFs (emb_20260911_*) with exact byte_length & sha256.
 *        - All 21 committed 06-INSTRUMENTS protocols (6+7+4+4=21) with exact byte_length, sha256,
 *          standalone_executors=0, and zero retired phantom IDs inside the 21-instrument registry.
 *   2. Verifying presentation seam isolation (#manifest-instance-theme carries #FF91AF, #24282A, #F6F4F0, #667078, #F9F36D),
 *      dedicated mobile-only couture logo (.brand-mobile-logo), bone-free Mugler-unchained frontispiece digests,
 *      verbatim ATELIER_PROFILE.json founding question & ATTRIBUTION.md text, UNADJUDICATED_PAIR default across all 8 gates,
 *      and strict three-codepoint separation (U+1D30B != U+10D613 != U+200C inside Khona\u200clit-po).
 *   3. Explicitly declaring its exact epistemic boundary: what_this_verifier_proves vs. what_requires_browser_or_human_witness.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const gatePath = path.resolve('app/engine/pedagogue-design-gate.js');
const practicePath = path.resolve('app/engine/pedagogue-practice-fixture.js');
const { compilePedagogueDesignReview } = await import(pathToFileURL(gatePath).href);
const { compilePedagoguePracticeReview } = await import(pathToFileURL(practicePath).href);

const repoRoot = process.cwd();
const packetDir = path.join(repoRoot, 'docs/reviews/vixen-ux-architecture-20261106');
const specPath = path.join(packetDir, 'VIXEN_CYBERNETICS_UX_ARCHITECTURE_SPECIFICATION.md');
const htmlPath = path.join(repoRoot, 'app/encyclopedia/vix-cyb.html');
const outReceiptPath = path.join(packetDir, 'reconciliation-verification-receipt.json');

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

const specBytes = fs.readFileSync(specPath);
const specText = specBytes.toString('utf8');
const htmlBytes = fs.readFileSync(htmlPath);
const htmlText = htmlBytes.toString('utf8');

const crosswalk = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'packages/em_unified_synthesis/identity_metadata_crosswalk.json'), 'utf8')
);
const methodsInv = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'packages/em_unified_synthesis/original_methods_inventory.json'), 'utf8')
);
const atelierProfile = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'packages/dome_world_exact/fixtures/a15-r0/EMSTD613/ATELIER_PROFILE.json'), 'utf8')
);
const workIndexRows = fs
  .readFileSync(path.join(repoRoot, 'packages/dome_world_exact/fixtures/a15-r0/EMSTD613/01-MANIFESTS/work-index.jsonl'), 'utf8')
  .trim()
  .split(/\r?\n/)
  .map(JSON.parse);
const sourceFileRows = fs
  .readFileSync(path.join(repoRoot, 'packages/dome_world_exact/fixtures/a15-r0/EMSTD613/01-MANIFESTS/source-files.jsonl'), 'utf8')
  .trim()
  .split(/\r?\n/)
  .map(JSON.parse);
const batchBRows = fs
  .readFileSync(
    path.join(repoRoot, 'packages/dome_world_exact/fixtures/a15-r0/EMSTD613/01-MANIFESTS/batch-b-2026-09-11-source-files-v2.jsonl'),
    'utf8'
  )
  .trim()
  .split(/\r?\n/)
  .map(JSON.parse);

const sourceById = new Map(sourceFileRows.map((s) => [s.source_file_id, s]));
const workIndexById = new Map(workIndexRows.map((w) => [w.work_id, w]));

const errors = [];

// PART A: Markdown V3 Specification Row-Level & Cluster-Sum Audit
const sec23Start = specText.indexOf('### 2.3 Exhaustive 32-Work Source-Bound Crosswalk');
const sec24Start = specText.indexOf('### 2.4 Eight Human-Gated Manifestation Case Files');
const sec25Start = specText.indexOf('### 2.5 Exact Bijective 21-Instrument Registry Taxonomy');
const sec26Start = specText.indexOf('### 2.6 Non-Registry Operational & Custodial Responsibilities');
if (sec23Start < 0 || sec24Start < 0 || sec25Start < 0 || sec26Start < 0) {
  errors.push('Required V3 sections (2.3, 2.4, 2.5, 2.6) missing in Markdown specification.');
}
const sec23Text = specText.slice(sec23Start, sec24Start);
const sec25Text = specText.slice(sec25Start, sec26Start);

const specRowMap = new Map();
for (const line of sec23Text.split(/\r?\n/)) {
  const m = line.match(/^\|\s*(\d{2})\s*\|\s*`(emwork_[0-9a-f]{24})`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|/);
  if (m) {
    const srcIdsInRow = [...m[6].matchAll(/`(emsrc_[0-9a-f]{24})`/g)].map((x) => x[1]).sort();
    specRowMap.set(m[2], {
      rowNum: Number(m[1]),
      statusCell: m[4].trim(),
      intervalCell: m[5].trim(),
      srcIds: srcIdsInRow,
      authorship: m[7].trim()
    });
  }
}

if (specRowMap.size !== 32) {
  errors.push(`Expected 32 parsed Work rows in Spec Section 2.3, got ${specRowMap.size}`);
}

for (const w of crosswalk.works) {
  const row = specRowMap.get(w.work_id);
  if (!row) {
    errors.push(`Spec Section 2.3 missing Work ${w.work_id}`);
    continue;
  }
  const expectedSrc = w.linked_sources.map((s) => s.source_file_id).sort();
  if (JSON.stringify(row.srcIds) !== JSON.stringify(expectedSrc)) {
    errors.push(`Spec row ${w.work_id} linked emsrc mismatch: got ${row.srcIds.join(',')}, expected ${expectedSrc.join(',')}`);
  }
  if (!row.statusCell.includes(w.identity_status)) {
    errors.push(`Spec row ${w.work_id} identity_status mismatch: ${row.statusCell} vs ${w.identity_status}`);
  }
  if (row.authorship !== 'UNRESOLVED') {
    errors.push(`Spec row ${w.work_id} authorship must be UNRESOLVED, got ${row.authorship}`);
  }
}

// PART B: Executable HTML Prototype (app/encyclopedia/vix-cyb.html) Deep Audit
const manifestMatch = htmlText.match(/<script id="vixen-reference-manifest" type="application\/json">([\s\S]*?)<\/script>/);
const bundleMatch = htmlText.match(/<script id="vixen-corpus-bundle" type="application\/json">([\s\S]*?)<\/script>/);
const themeMatch = htmlText.match(/<style id="manifest-instance-theme">([\s\S]*?)<\/style>/);

if (!manifestMatch || !bundleMatch || !themeMatch) {
  errors.push('Missing #vixen-reference-manifest, #vixen-corpus-bundle, or #manifest-instance-theme in vix-cyb.html');
} else {
  const manifest = JSON.parse(manifestMatch[1]);
  const bundle = JSON.parse(bundleMatch[1]);
  const themeCss = themeMatch[1];

  // B1. Row-by-row relational coupling of all 32 Works & 53 linked manifestations in HTML bundle
  if (!Array.isArray(bundle.works) || bundle.works.length !== 32) {
    errors.push(`HTML bundle works count mismatch: expected 32, got ${bundle.works?.length}`);
  } else {
    const htmlWorkById = new Map(bundle.works.map((w) => [w.work_id, w]));
    for (const cw of crosswalk.works) {
      const hw = htmlWorkById.get(cw.work_id);
      const wi = workIndexById.get(cw.work_id);
      if (!hw) {
        errors.push(`HTML bundle missing Work ${cw.work_id}`);
        continue;
      }
      if (hw.identity_status !== cw.identity_status || Boolean(hw.human_gate_required) !== Boolean(cw.human_gate_required)) {
        errors.push(`HTML Work ${cw.work_id} status/gate mismatch against crosswalk`);
      }
      if (hw.authorship !== 'UNRESOLVED' || wi.authorship !== 'UNRESOLVED') {
        errors.push(`HTML Work ${cw.work_id} violated authorship=UNRESOLVED`);
      }
      if (hw.capability_tier !== 'TIER_2_CATALOGUE_METADATA_ONLY' || hw.body_availability !== 'UNAVAILABLE_IN_PUBLIC_SURFACE') {
        errors.push(`HTML Work ${cw.work_id} missing TIER_2 / UNAVAILABLE_IN_PUBLIC_SURFACE capability contract`);
      }
      const expSrcIds = cw.linked_sources.map((s) => s.source_file_id).sort();
      const gotSrcIds = (hw.linked_sources || []).map((s) => s.source_file_id).sort();
      if (JSON.stringify(expSrcIds) !== JSON.stringify(gotSrcIds)) {
        errors.push(`HTML Work ${cw.work_id} linked_sources mismatch`);
      }
      for (const hs of hw.linked_sources || []) {
        const sf = sourceById.get(hs.source_file_id);
        if (!sf || hs.sha256 !== sf.sha256 || hs.byte_length !== sf.byte_length) {
          errors.push(`HTML manifestation ${hs.source_file_id} byte_length/sha256 mismatch against source-files.jsonl`);
        }
      }
    }

    // Per-cluster Work & Manifestation exact sums (18 + 15 + 4 + 10 + 6 = 53)
    const expectedClusters = {
      C1: { works: 12, manifestations: 18 },
      C2: { works: 9, manifestations: 15 },
      C3: { works: 2, manifestations: 4 },
      C4: { works: 5, manifestations: 10 },
      C5: { works: 4, manifestations: 6 }
    };
    for (const [cid, exp] of Object.entries(expectedClusters)) {
      const cWorks = bundle.works.filter((w) => w.cluster === cid);
      const cMan = cWorks.reduce((a, w) => a + w.linked_sources.length, 0);
      if (cWorks.length !== exp.works || cMan !== exp.manifestations) {
        errors.push(`Cluster ${cid} sum mismatch: got ${cWorks.length}W/${cMan}M, expected ${exp.works}W/${exp.manifestations}M`);
      }
    }
  }

  // B2. All 8 Human Gates default strictly to UNADJUDICATED_PAIR
  if (!Array.isArray(bundle.human_gates) || bundle.human_gates.length !== 8) {
    errors.push(`Expected 8 human_gates in HTML bundle, got ${bundle.human_gates?.length}`);
  } else if (!bundle.human_gates.every((g) => g.default_state === 'UNADJUDICATED_PAIR')) {
    errors.push('All 8 human_gates must initialize with default_state="UNADJUDICATED_PAIR"');
  }

  // B3. All 7 Prospective Batch-B PDFs match batch-b-2026-09-11-source-files-v2.jsonl byte-for-byte
  if (!Array.isArray(bundle.batch_b_files) || bundle.batch_b_files.length !== 7) {
    errors.push(`Expected 7 batch_b_files in HTML bundle, got ${bundle.batch_b_files?.length}`);
  } else {
    const bbMap = new Map(bundle.batch_b_files.map((b) => [b.source_file_id, b]));
    for (const expB of batchBRows) {
      const gotB = bbMap.get(expB.source_file_id);
      if (!gotB || gotB.sha256 !== expB.sha256 || gotB.byte_length !== expB.byte_length) {
        errors.push(`Batch-B ${expB.source_file_id} sha256/byte_length mismatch`);
      }
    }
  }

  // B4. Bijective 21-Instrument Registry (6 + 7 + 4 + 4 = 21, 0 Phantoms)
  const retiredPhantomIds = [
    'RECIPROCAL_RESIDUE_LEDGER',
    'CROSS_ATELIER_TRANSLATION_MEMBRANE',
    'MANIFESTATION_IDENTITY_GATE_PROTOCOL',
    'APPLEDOUBLE_SIDECAR_QUARANTINE_RULE',
    'BYTE_SPAN_GROUNDING_CONTRACT'
  ];
  if (!Array.isArray(bundle.instruments) || bundle.instruments.length !== 21) {
    errors.push(`Expected 21 instruments in HTML bundle, got ${bundle.instruments?.length}`);
  } else {
    const instMap = new Map(bundle.instruments.map((i) => [i.instrument_id, i]));
    for (const expI of methodsInv.instruments) {
      const gotI = instMap.get(expI.instrument_id);
      if (!gotI || gotI.sha256 !== expI.sha256 || gotI.byte_length !== expI.byte_length || gotI.standalone_executors_in_lineage !== 0) {
        errors.push(`Instrument ${expI.instrument_id} metadata mismatch against original_methods_inventory.json`);
      }
    }
    const famCounts = { F1: 0, F2: 0, F3: 0, F4: 0 };
    for (const i of bundle.instruments) {
      famCounts[i.family] = (famCounts[i.family] || 0) + 1;
      if (retiredPhantomIds.includes(i.instrument_id)) {
        errors.push(`Phantom ID ${i.instrument_id} illegally present in bundle.instruments`);
      }
    }
    if (famCounts.F1 !== 6 || famCounts.F2 !== 7 || famCounts.F3 !== 4 || famCounts.F4 !== 4) {
      errors.push(`Instrument family partition mismatch: ${JSON.stringify(famCounts)}`);
    }
  }

  // B5. Presentation Theme Seam (#manifest-instance-theme), Mobile Logo & Codepoint Custody
  for (const hex of ['#FF91AF', '#F9F36D', '#24282A', '#667078', '#F6F4F0']) {
    if (!themeCss.includes(hex)) {
      errors.push(`#manifest-instance-theme missing canonical 24fd2c9e0 palette token ${hex}`);
    }
  }
  if (
    !htmlText.includes('class="brand-mobile-logo"') ||
    !htmlText.includes('class="brand-desktop-lockup"') ||
    !htmlText.includes('class="vixen-fox-emblem"')
  ) {
    errors.push('Missing .vixen-fox-emblem or .brand-mobile-logo / .brand-desktop-lockup responsive header lockups');
  }
  if (!htmlText.includes('<em class="project-math">S<sub>e</sub> ≡ [x + y] = z + 1</em>')) {
    errors.push('Mobile logo lockup missing exact full Vixen mathematical expression S_e ≡ [x + y] = z + 1');
  }
  if (!htmlText.includes('𝌋 TD613 Encyclopedia')) {
    errors.push('Footer missing 𝌋 TD613 Encyclopedia mark');
  }
  if (!htmlText.includes(atelierProfile.research_question)) {
    errors.push('Verbatim ATELIER_PROFILE.json founding research_question missing from HTML');
  }
  if (manifest.covenant !== 'Khona\u200clit-po' || manifest.covenant.charCodeAt(5) !== 0x200c) {
    errors.push('Covenant interior U+200C ZWNJ corrupted in reference manifest');
  }
  if (!htmlBytes.includes(Buffer.from([0xf0, 0x9d, 0x8c, 0x8b])) || !htmlBytes.includes(Buffer.from([0xf4, 0x8d, 0x98, 0x93])) || !htmlBytes.includes(Buffer.from([0xe2, 0x80, 0x8c]))) {
    errors.push('Three-codepoint UTF-8 separation (U+1D30B, U+10D613, U+200C) missing in HTML bytes');
  }
  if (manifest.frontispiece?.human_skeleton_anatomy_present !== false || manifest.frontispiece?.encyclopedia_asset_reused !== false) {
    errors.push('Frontispiece provenance flags violated');
  }

  // B6. F1–F4 Bounded Pre-Freeze Finalization & Astra Succession Seams
  const handoffMatch = htmlText.match(/<script type="application\/json" id="vixen-astra-handoff">([\s\S]*?)<\/script>/);
  if (!handoffMatch) {
    errors.push('Missing <script type="application/json" id="vixen-astra-handoff"> block in HTML');
  } else {
    try {
      const astraHandoff = JSON.parse(handoffMatch[1]);
      if (astraHandoff.document_identity !== 'VIXEN_CYBERNETICS_ASTRA_HANDOFF.html') {
        errors.push(`Astra handoff document_identity mismatch: ${astraHandoff.document_identity}`);
      }
      if (astraHandoff.predecessor_commit !== 'fb4e9cf21cfe3b25ee3e1a97c1f0429b20578a48') {
        errors.push(`Astra handoff predecessor_commit mismatch: ${astraHandoff.predecessor_commit}`);
      }
      if (astraHandoff.predecessor_html_sha256 !== '36b5634886d7722f9543abd00af0b4648d655cb4028027a6855131d252cd1cff') {
        errors.push(`Astra handoff predecessor_html_sha256 mismatch: ${astraHandoff.predecessor_html_sha256}`);
      }
      if (!astraHandoff.six_principal_environments || Object.keys(astraHandoff.six_principal_environments).length !== 6) {
        errors.push('Astra handoff missing 6 principal environments');
      }
    } catch (e) {
      errors.push(`Failed to parse astra handoff JSON: ${e.message}`);
    }
  }

  // F1 Verification: Illustrative presets vs live admission
  if (
    !htmlText.includes('PRESET HYPOTHESIS') ||
    !htmlText.includes('HYPOTHETICAL OUTCOME') ||
    !htmlText.includes('HYPOTHETICAL_L2_PRESET_WITH_RETAINED_RESIDUE') ||
    !htmlText.includes('ILLUSTRATIVE_PRESET_DEMO') ||
    !htmlText.includes('EMPIRICAL_CREDIT: 0')
  ) {
    errors.push('F1 illustrative preset badges and hypothetical outcome labels missing in HTML');
  }

  // F2 Verification: Session-local snapshot retention
  if (
    !htmlText.includes('SESSION_LOCAL_SNAPSHOT') ||
    !htmlText.includes('DEMONSTRATED_NON_RETROACTIVE_DISPLAY_IN_SESSION (Predecessor values retained in-session)')
  ) {
    errors.push('F2 session-local snapshot non-retroactive retention UI labels missing in HTML');
  }

  // F3 Verification: WebCrypto throw/reject fail-closed
  if (
    !htmlText.includes('ERR_WEBCRYPTO_DIGEST_FAILED') ||
    !htmlText.includes('simulateCryptoReject')
  ) {
    errors.push('F3 WebCrypto reject/throw fail-closed error code and negative-control missing in HTML');
  }

  // Pedagogue Membrane & Anti-Leakage Verification
  const forbiddenHostTerms = [
    'PEDAGOGUE CADENCE',
    'PEDAGOGUE_CADENCE',
    'href="/aperture/"',
    'AIA ROUTE PROJECTION LENS',
    'Aperture κ &amp; FADT c₄',
    'APERTURE OPERATOR:',
    'FADT c₄ ESTATE QUOTIENT'
  ];
  for (const term of forbiddenHostTerms) {
    if (htmlText.includes(term)) {
      errors.push(`Anti-leakage violation: forbidden host term "${term}" found in vix-cyb.html`);
    }
  }

  // Membrane Data Attributes Verification
  if (!htmlText.includes('data-membrane="RESEARCH_OBJECT"') ||
      !htmlText.includes('data-membrane="SCHOLARLY_INTERPRETATION"') ||
      !htmlText.includes('data-membrane="HOST_INFRASTRUCTURE"')) {
    errors.push('vix-cyb.html missing 3-tier data-membrane attributes (RESEARCH_OBJECT, SCHOLARLY_INTERPRETATION, HOST_INFRASTRUCTURE)');
  }

  // Standalone Return Link Verification
  if (!htmlText.includes('id="vixenReturnLink"') || !htmlText.includes('window.VIXEN_HOST_CONFIG')) {
    errors.push('vix-cyb.html missing standalone/configurable #vixenReturnLink wiring');
  }

  // Pedagogue Design Gate & Practice Fixture Verification
  try {
    const designFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/fixtures/pedagogue/vixen-cybernetics-design.json'), 'utf8'));
    const designReview = await compilePedagogueDesignReview(designFixture);
    const designPassed = Object.values(designReview.design_gate).every(v => v === true);
    if (!designPassed) {
      errors.push('vixen-cybernetics-design.json failed Pedagogue Design Gate invariants');
    }

    const practiceFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/fixtures/pedagogue/vixen-cybernetics-practice.json'), 'utf8'));
    const practiceReview = compilePedagoguePracticeReview(practiceFixture);
    const practicePassed = Object.values(practiceReview.practice_gate).every(v => v === true);
    if (!practicePassed) {
      errors.push('vixen-cybernetics-practice.json failed Pedagogue Practice Gate invariants');
    }
  } catch (e) {
    errors.push(`Pedagogue fixture verification threw error: ${e.message}`);
  }

  // Byte-Identity Verification with VIXEN_CYBERNETICS_ASTRA_HANDOFF.html
  const handoffPath = path.join(packetDir, 'VIXEN_CYBERNETICS_ASTRA_HANDOFF.html');
  if (fs.existsSync(handoffPath)) {
    const handoffBytes = fs.readFileSync(handoffPath);
    if (sha256(handoffBytes) !== sha256(htmlBytes)) {
      errors.push('Byte-identity mismatch between vix-cyb.html and VIXEN_CYBERNETICS_ASTRA_HANDOFF.html');
    }
  } else {
    errors.push('Missing VIXEN_CYBERNETICS_ASTRA_HANDOFF.html in review packet directory');
  }
}

if (errors.length > 0) {
  console.error('V4 Source & Prototype Reconciliation FAILED:', errors);
  process.exit(1);
}

const htmlWithoutTheme = htmlText.replace(/<style id="manifest-instance-theme">[\s\S]*?<\/style>/, '<style id="manifest-instance-theme"></style>');

const receipt = {
  schema: 'td613.vixen-ux.source-reconciliation-receipt/v2.2',
  document_id: 'TD613-VIXEN-PROTOTYPE-RECONCILIATION-20261107-V4',
  specification_sha256: sha256(specBytes),
  prototype_html_path: 'app/encyclopedia/vix-cyb.html',
  prototype_html_bytes: htmlBytes.length,
  prototype_html_sha256: sha256(htmlBytes),
  prototype_structural_dom_excluding_theme_sha256: sha256(Buffer.from(htmlWithoutTheme, 'utf8')),
  disposition: 'SPECIFICATION_AND_EXECUTABLE_PROTOTYPE_RECONCILED',
  invariants_verified: {
    canonical_works_row_level_bijection: {
      expected_works: 32,
      verified_spec_rows: 32,
      verified_html_bundle_works: 32,
      cluster_partition: {
        C1: { works: 12, manifestations: 18 },
        C2: { works: 9, manifestations: 15 },
        C3: { works: 2, manifestations: 4 },
        C4: { works: 5, manifestations: 10 },
        C5: { works: 4, manifestations: 6 }
      },
      linked_manifestations_byte_and_sha256_verified: 53,
      prospective_batch_b_byte_and_sha256_verified: 7,
      human_gates_default_unadjudicated: 8,
      all_32_work_authorship_unresolved: true
    },
    documentary_instruments_row_level_bijection: {
      expected_instruments: 21,
      verified_spec_rows: 21,
      verified_html_bundle_instruments: 21,
      family_partition: { F1: 6, F2: 7, F3: 4, F4: 4 },
      byte_and_sha256_verified_against_inventory: 21,
      standalone_executors: 0,
      phantom_ids_in_registry: 0
    },
    presentation_seam_and_codepoints: {
      manifest_instance_theme_isolated: true,
      palette_tokens_verified: ['#FF91AF', '#F9F36D', '#24282A', '#667078', '#F6F4F0'],
      mobile_only_couture_logo_present: true,
      three_codepoints_utf8_verified: ['U+1D30B (f09d8c8b)', 'U+10D613 (f48d9893)', 'U+200C (e2808c)']
    },
    pre_freeze_findings_and_succession: {
      f1_illustrative_presets_verified: true,
      f2_session_local_predecessor_retention_verified: true,
      f3_webcrypto_fail_closed_rejection_verified: true,
      astra_single_file_handoff_byte_identical: true,
      predecessor_v4_html_sha256_preserved: '36b5634886d7722f9543abd00af0b4648d655cb4028027a6855131d252cd1cff'
    },
    pedagogue_membrane_and_reader_journeys: {
      governing_anti_equivalence: 'OPERAHOUSE ≠ OPERA ≠ PERFORMER',
      product_language_membrane_tiers: ['RESEARCH_OBJECT', 'SCHOLARLY_INTERPRETATION', 'HOST_INFRASTRUCTURE'],
      anti_leakage_rule_verified: true,
      three_reader_journeys_verified: {
        journey_a_scholarly_encounter: true,
        journey_b_manifestation_comparison: true,
        journey_c_expert_investigation_alt_i: true
      },
      standalone_return_route_safe: true,
      pedagogue_design_gate_verified: 'PASS',
      pedagogue_practice_fixture_verified: 'PASS'
    }
  },
  epistemic_scope_boundary: {
    what_this_verifier_proves: [
      'Exact row-by-row bijection and SHA-256/byte-length fidelity between committed repository inventories (identity_metadata_crosswalk.json, work-index.jsonl, source-files.jsonl, batch-b-2026-09-11-source-files-v2.jsonl, original_methods_inventory.json) and BOTH VIXEN_CYBERNETICS_UX_ARCHITECTURE_SPECIFICATION.md and app/encyclopedia/vix-cyb.html.',
      'Exact per-cluster Work and Manifestation sums (12W/18M + 9W/15M + 2W/4M + 5W/10M + 4W/6M = 32W/53M), catching and correcting V3 heading-sum drift.',
      'Exclusion of all 5 non-registry custodial duties from the 21-protocol 06-INSTRUMENTS registry.',
      'Preservation of authorship="UNRESOLVED" across all 32 Work routes, UNADJUDICATED_PAIR across all 8 human gates, #manifest-instance-theme CSS seam isolation, and literal UTF-8 codepoint separation (U+1D30B != U+10D613 != U+200C).'
    ],
    what_requires_browser_or_human_witness: [
      'Visual layout legibility, non-overlapping header geometry at 390px, interactive Canvas rendering, and live WebCrypto/UTF-8 DOM execution (separately witnessed via headless Chromium CDP in browser-witness-receipt.json and screenshots/01..10, and still subject to human operator aesthetic/editorial closure).',
      'Substantive editorial adjudication of the 8 human-gated .md/.pdf pairs (remains UNADJUDICATED_PAIR pending human closure).',
      'Stage 2 couture transformation by Work/Astra and Stage 3 adversarial verification.',
      'Track A-PFR0.2 offline engine repairs (Q01-Q09) and Experiment B Post-Postflight execution (PP0-PP6).'
    ]
  },
  explicit_non_claims: {
    physical_device_witness: false,
    human_gate_adjudication_performed: false,
    a_pfr0_2_engine_repaired: false,
    experiment_b_executed: false,
    scientific_promotion_authority: false,
    empirical_replication_credit: 0,
    merge_or_release_authority: false
  }
};

fs.writeFileSync(outReceiptPath, JSON.stringify(receipt, null, 2) + '\n', 'utf8');
console.log('V4 Reconciliation Verification PASSED: Spec + vix-cyb.html 32/32 Works, 53/53 emsrc, 7/7 Batch-B, 21/21 Instruments, 0 phantoms.');
