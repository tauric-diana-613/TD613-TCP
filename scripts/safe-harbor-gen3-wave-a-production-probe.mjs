import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = String(process.env.TD613_BASE_URL || 'https://td613.com').replace(/\/+$/u, '');
const sourceCommit = String(process.env.TD613_SOURCE_PACKET_COMMIT || '').trim();
const artifactDir = String(process.env.TD613_ARTIFACT_DIR || 'artifacts/safe-harbor-gen3-wave-a-production').replace(/\/+$/u, '');

if (!/^[0-9a-f]{40}$/u.test(sourceCommit)) {
  throw new Error('TD613_SOURCE_PACKET_COMMIT must be the exact authorized 40-character SHA.');
}

const fs = await import('node:fs/promises');
await fs.mkdir(artifactDir, { recursive: true });

const assets = [
  {
    path: '/safe-harbor/',
    markers: ['TD613 Safe Harbor', 'ingressStepInput', 'mintStagedPacket'],
    cache: /no-store/u
  },
  {
    path: '/safe-harbor/app/safe-harbor-gen3-evidence-contract.js',
    markers: ['td613.safe-harbor.authorship-evidence/v1', 'validateGen3ShiExactMatch', 'historical_example'],
    cache: /max-age=0/u
  },
  {
    path: '/safe-harbor/app/safe-harbor-gen3-authorship-maturity.js',
    markers: ['td613.safe-harbor.authorship-maturity/v1', 'buildStage2AuthorshipMaturity', 'prompt_vocabulary_excluded_from_authorship_features'],
    cache: /max-age=0/u
  },
  {
    path: '/safe-harbor/app/safe-harbor-gen3-stage2-controls.js',
    markers: ['td613.safe-harbor.stage2-control-receipt/v1', 'chronology_destruction', 'adverse_results_preserved'],
    cache: /max-age=0/u
  },
  {
    path: '/safe-harbor/app/safe-harbor-native-finalizer.js',
    markers: ['applyControlledGen3Stage2Prehash', 'includeGen3Stage2', 'authorship_evidence'],
    cache: /max-age=0/u
  },
  {
    path: '/safe-harbor/app/safe-harbor-packet-pipeline.js',
    markers: ['attachStage2InterpretiveReport', 'attachStage2ControlReport', 'includeGen3Stage2: true'],
    cache: /max-age=0/u
  }
];

const assetObservations = [];
for (const asset of assets) {
  const response = await fetch(`${baseUrl}${asset.path}?td613-wave-a=${sourceCommit}`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' }
  });
  const text = await response.text();
  assert.equal(response.status, 200, `${asset.path} must return HTTP 200`);
  for (const marker of asset.markers) assert.ok(text.includes(marker), `${asset.path} missing marker: ${marker}`);
  const cacheControl = response.headers.get('cache-control') || '';
  assert.match(cacheControl, asset.cache, `${asset.path} cache policy drifted: ${cacheControl}`);
  const concreteShis = text.match(/TD613-SH-9B07D8B-[0-9A-F]{8}/gu) || [];
  assert.ok(concreteShis.every((value) => value === 'TD613-SH-9B07D8B-A1B2C3D4'), `${asset.path} exposed a non-synthetic concrete SHI`);
  assetObservations.push({ path: asset.path, status: response.status, cache_control: cacheControl, bytes: Buffer.byteLength(text), markers: asset.markers });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error)));

await page.goto(`${baseUrl}/safe-harbor/?td613-wave-a=${sourceCommit}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('#ingressStepInput', { state: 'attached', timeout: 30000 });

const accessibilitySurface = await page.evaluate(() => ({
  title: document.title,
  heading: document.querySelector('h1')?.textContent?.trim() || null,
  textarea_present: Boolean(document.querySelector('#ingressStepInput')),
  continue_button_present: Boolean(document.querySelector('#ingressContinue')),
  mint_button_present: Boolean(document.querySelector('#mintStagedPacket')),
  bypass_file_input_present: Boolean(document.querySelector('#bypassSealedPacketFile')),
  reduced_motion: matchMedia('(prefers-reduced-motion: reduce)').matches
}));
assert.equal(accessibilitySurface.title, 'TD613 Safe Harbor');
assert.equal(accessibilitySurface.heading, 'TD613 Safe Harbor');
assert.equal(accessibilitySurface.textarea_present, true);
assert.equal(accessibilitySurface.continue_button_present, true);
assert.equal(accessibilitySurface.mint_button_present, true);
assert.equal(accessibilitySurface.bypass_file_input_present, true);
assert.equal(accessibilitySurface.reduced_motion, true);

const runtime = await page.evaluate(async ({ sourceCommit }) => {
  const version = encodeURIComponent(sourceCommit);
  const moduleUrl = (name) => new URL(`app/${name}?td613-wave-a=${version}`, location.href).href;
  const finalizer = await import(moduleUrl('safe-harbor-native-finalizer.js'));
  const verifier = await import(moduleUrl('safe-harbor-authority-verifier.js'));
  const evidence = await import(moduleUrl('safe-harbor-gen3-evidence-contract.js'));
  const maturity = await import(moduleUrl('safe-harbor-gen3-authorship-maturity.js'));
  const controls = await import(moduleUrl('safe-harbor-gen3-stage2-controls.js'));

  const sentence = (label, index) => `The ${label} lane returns through measured sentence ${index}, carrying declared limits, recurrent function words, bounded punctuation, qualification, contrast, and traceable structure.`;
  const laneText = (label) => Array.from({ length: 34 }, (_, index) => sentence(label, index + 1)).join(' ');
  const segments = {
    future_self: laneText('future'),
    past_self: laneText('past'),
    higher_self: laneText('higher')
  };

  const thinLane = (key, value) => {
    const words = value.trim().split(/\s+/u);
    return {
      source: 'safe-harbor.production-probe.synthetic',
      lane: key,
      char_count: value.length,
      word_count: words.length,
      sentence_count: 34,
      avg_word_length: 6,
      avg_sentence_length: 15,
      punctuation_density: 0.02,
      line_break_density: 0,
      unique_ratio: 0.6,
      punctuation_mix: { comma: 0.5, dash: 0, colon: 0, semicolon: 0, exclamation: 0, question: 0 },
      dominant_axes: ['bounded', 'recurrent'],
      temporal_posture: key === 'future_self' ? 'forward' : key === 'past_self' ? 'backward' : 'orthogonal',
      dominant_operator: 'F',
      governed_exposure_depth: 0.5,
      closure_class: 'closed',
      frame_alignment: 'aligned',
      frame_alignment_note: null
    };
  };

  const signatures = Object.fromEntries(Object.entries(segments).map(([key, value]) => [key, thinLane(key, value)]));
  const packet = {
    schema_version: 'td613.safe-harbor.packet/v1',
    packet_id: 'GEN3-WAVE-A-PRODUCTION-PROBE-SYNTHETIC',
    created_at: '2026-07-22T00:00:00Z',
    canon: {
      principal: 'tauric.diana.613',
      badge_id: 'bdg_glyph_U10D613',
      claimed_pua: 'U+10D613',
      canonical_phrase: 'Tauric Diana - Crimean heritage custodianship',
      display_phrase: 'Covenant: Blood Rite 613',
      binding_fragment: '#9B07D8B',
      sac: 'SAC[X6ZNK5NO51]',
      footer_mode: 'legacy-compat'
    },
    binding_provenance: {
      schema_version: 'td613.safe-harbor.binding-provenance/v1',
      principal: 'tauric.diana.613',
      claim: {},
      canonical_declaration: {},
      binding_event: { recorded_ts_utc: '2025-08-11T03:58:39Z' },
      legacy_corpus_root: {},
      symbol_roles: {},
      evidence_status: {},
      claim_ceiling: 'Synthetic production probe; packet-internal custody only.'
    },
    intake: { ts_utc: '2026-07-22T00:00:00Z', status: 'issued' },
    analysis: {
      segment_cadence_signatures: signatures,
      triad_resonance: 0.8,
      cross_lane_stability: 0.75,
      cross_lane_spread: 0.25
    },
    issuance: {
      badge_number: null,
      stylometric_fingerprint: 'synthetic-wave-a-production-fingerprint',
      triad_word_counts: Object.fromEntries(Object.entries(signatures).map(([key, item]) => [key, item.word_count])),
      triad_shortfalls: { future_self: 0, past_self: 0, higher_self: 0 },
      stylometric_provenance: { divergence_signature: { compact: 'synthetic production probe' } }
    },
    signature: { status: 'declared', sig: null, attached_at: null },
    bridge: { covenant_gate: { confirmed: true }, export_gate: { ready: true, state: 'harbor-eligible', blockers: [], scrub_passed: true } }
  };
  packet.issuance.badge_number = verifier.expectedV2BadgeNumber(packet);

  const baseline = await finalizer.finalizeSafeHarborPacket(structuredClone(packet), {
    mode: 'native',
    segments,
    includePhase5: true,
    includeTamperFixtures: false
  });
  const finalized = await finalizer.finalizeSafeHarborPacket(structuredClone(packet), {
    mode: 'native',
    segments,
    includePhase5: true,
    includeTamperFixtures: false,
    includeGen3Stage1: true,
    includeGen3Stage2: true,
    gen3Context: {
      promptSetVersion: 'temporal-triad/v2',
      promptVocabularyByLane: {
        future_self: ['future'],
        past_self: ['past'],
        higher_self: ['higher']
      },
      promptControlSegments: segments,
      entrantSwapProfile: null,
      controlProfiles: {}
    }
  });
  const overlaid = evidence.finalizeGen3Stage1Overlay(finalized);
  const shi = evidence.validateGen3ShiExactMatch(overlaid);
  const replayHash = await finalizer.computePacketHash(overlaid);
  const serialized = JSON.stringify(overlaid);
  const restored = JSON.parse(serialized);
  const restoredShi = evidence.validateGen3ShiExactMatch(restored);
  const restoredHash = await finalizer.computePacketHash(restored);

  const directMaturity = await maturity.buildStage2AuthorshipMaturity({}, {
    segments,
    promptVocabularyByLane: {
      future_self: ['future'],
      past_self: ['past'],
      higher_self: ['higher']
    }
  });
  const controlled = await controls.buildControlledStage2AuthorshipMaturity({}, {
    segments,
    promptVocabularyByLane: {
      future_self: ['future'],
      past_self: ['past'],
      higher_self: ['higher']
    },
    promptControlSegments: segments,
    entrantSwapProfile: { profile: directMaturity, provenance: 'unmistakably synthetic production control' }
  });

  return {
    packet_schema: restored.schema_version,
    evidence_schema: restored.authorship_evidence?.schema_version || null,
    maturity_schema: restored.authorship_evidence?.authorship_maturity?.schema_version || null,
    report_schema: restored.forensic_authorship?.gen3_report_contract?.schema_version || null,
    stability_digest: restored.authorship_evidence?.stability_receipt?.stability_digest || null,
    null_controls_digest: restored.authorship_evidence?.stability_receipt?.null_controls_digest || null,
    shi_status: shi.status,
    restored_shi_status: restoredShi.status,
    packet_hash_matches: replayHash === restored.packet_hash_sha256,
    restored_hash_matches: restoredHash === restored.packet_hash_sha256,
    sh3_fingerprint_stable: finalized.issuance?.stylometric_fingerprint_v3 === baseline.issuance?.stylometric_fingerprint_v3,
    sh3_credential_stable: finalized.issuance?.badge_number_v3 === baseline.issuance?.badge_number_v3,
    raw_future_text_absent: !serialized.includes(segments.future_self.slice(0, 120)),
    raw_past_text_absent: !serialized.includes(segments.past_self.slice(0, 120)),
    raw_higher_text_absent: !serialized.includes(segments.higher_self.slice(0, 120)),
    prompt_collision_preserved: controlled.null_and_adversarial_posture?.control_receipt?.prompt_only_control?.collision_state === 'prompt-only-collision',
    entrant_swap_collision_preserved: controlled.null_and_adversarial_posture?.control_receipt?.entrant_swap_audit?.status === 'collision',
    adverse_results_preserved: controlled.null_and_adversarial_posture?.control_receipt?.adverse_results_preserved === true,
    chronology_claimed: controlled.null_and_adversarial_posture?.chronology_claimed,
    identity_probability: controlled.stability_receipt?.identity_probability,
    psychological_inference_performed: controlled.stability_receipt?.psychological_inference_performed,
    demographic_inference_performed: controlled.stability_receipt?.demographic_inference_performed,
    concrete_shi: restored.issuance?.badge_number || null
  };
}, { sourceCommit });

assert.equal(runtime.packet_schema, 'td613.safe-harbor.packet/v1');
assert.equal(runtime.evidence_schema, 'td613.safe-harbor.authorship-evidence/v1');
assert.equal(runtime.maturity_schema, 'td613.safe-harbor.authorship-maturity/v1');
assert.match(runtime.stability_digest || '', /^sha256:[0-9a-f]{64}$/u);
assert.match(runtime.null_controls_digest || '', /^sha256:[0-9a-f]{64}$/u);
assert.equal(runtime.shi_status, 'pass');
assert.equal(runtime.restored_shi_status, 'pass');
assert.equal(runtime.packet_hash_matches, true);
assert.equal(runtime.restored_hash_matches, true);
assert.equal(runtime.sh3_fingerprint_stable, true);
assert.equal(runtime.sh3_credential_stable, true);
assert.equal(runtime.raw_future_text_absent, true);
assert.equal(runtime.raw_past_text_absent, true);
assert.equal(runtime.raw_higher_text_absent, true);
assert.equal(runtime.prompt_collision_preserved, true);
assert.equal(runtime.entrant_swap_collision_preserved, true);
assert.equal(runtime.adverse_results_preserved, true);
assert.equal(runtime.chronology_claimed, false);
assert.equal(runtime.identity_probability, null);
assert.equal(runtime.psychological_inference_performed, false);
assert.equal(runtime.demographic_inference_performed, false);
assert.match(runtime.concrete_shi || '', /^TD613-SH-9B07D8B-[0-9A-F]{8}$/u);

await page.screenshot({ path: `${artifactDir}/safe-harbor-wave-a-production.png`, fullPage: true });
await browser.close();
assert.deepEqual(pageErrors, [], `Safe Harbor production page emitted page errors:\n${pageErrors.join('\n')}`);

const receipt = {
  schema_version: 'td613.safe-harbor.gen3-wave-a-production-observation/v1',
  status: 'PASS',
  observed_at_utc: new Date().toISOString(),
  source_packet_commit: sourceCommit,
  production_url: baseUrl,
  asset_observations: assetObservations,
  accessibility_surface: accessibilitySurface,
  runtime_observation: runtime,
  authority: {
    production_bytes_observed: true,
    synthetic_packet_created: true,
    packet_restore_replayed: true,
    counts_as_identity_adjudication: false,
    counts_as_external_authorship_adjudication: false,
    authorizes_research_track_r_promotion: false,
    authorizes_wave_b: false
  }
};

await fs.writeFile(`${artifactDir}/safe-harbor-gen3-wave-a-production-observation.json`, `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify(receipt, null, 2));
