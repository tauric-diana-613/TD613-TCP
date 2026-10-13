import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import {
  DEFAULT_ASSET_ATTEMPTS,
  DEFAULT_ASSET_DELAY_MS,
  WAVE_B_ASSETS
} from './safe-harbor-gen3-wave-b-production-assets.mjs';

const baseUrl = String(process.env.TD613_BASE_URL || 'https://td613.com').replace(/\/+$/u, '');
const sourceCommit = String(process.env.TD613_SOURCE_PACKET_COMMIT || '').trim();
const artifactDir = String(process.env.TD613_ARTIFACT_DIR || 'artifacts/safe-harbor-gen3-wave-b-production').replace(/\/+$/u, '');
const assetAttempts = Math.max(1, Number.parseInt(process.env.TD613_SAFE_HARBOR_ASSET_ATTEMPTS || String(DEFAULT_ASSET_ATTEMPTS), 10));
const assetDelayMs = Math.max(0, Number.parseInt(process.env.TD613_SAFE_HARBOR_ASSET_DELAY_MS || String(DEFAULT_ASSET_DELAY_MS), 10));

if (!/^[0-9a-f]{40}$/u.test(sourceCommit)) {
  throw new Error('TD613_SOURCE_PACKET_COMMIT must be the exact authorized 40-character SHA.');
}

const fs = await import('node:fs/promises');
await fs.mkdir(artifactDir, { recursive: true });

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchReadyAsset(asset) {
  let last = null;
  for (let attempt = 1; attempt <= assetAttempts; attempt += 1) {
    const response = await fetch(`${baseUrl}${asset.path}?td613-wave-b=${sourceCommit}&attempt=${attempt}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const text = await response.text();
    const missingMarkers = asset.markers.filter((marker) => !text.includes(marker));
    const cacheControl = response.headers.get('cache-control') || '';
    const cacheMatches = asset.cache.test(cacheControl);
    last = { response, text, missingMarkers, cacheControl, cacheMatches, attempt };
    if (response.status === 200 && missingMarkers.length === 0 && cacheMatches) return last;
    if (attempt < assetAttempts) await sleep(assetDelayMs);
  }
  assert.equal(last.response.status, 200, `${asset.path} must return HTTP 200 after ${assetAttempts} propagation attempts`);
  assert.deepEqual(last.missingMarkers, [], `${asset.path} missing markers after ${assetAttempts} propagation attempts: ${last.missingMarkers.join(', ')}`);
  assert.match(last.cacheControl, asset.cache, `${asset.path} cache policy drifted after ${assetAttempts} propagation attempts: ${last.cacheControl}`);
  return last;
}

const assetObservations = [];
for (const asset of WAVE_B_ASSETS) {
  const observed = await fetchReadyAsset(asset);
  const concreteShis = observed.text.match(/TD613-SH-9B07D8B-[0-9A-F]{8}/gu) || [];
  assert.ok(concreteShis.every((value) => value === 'TD613-SH-9B07D8B-A1B2C3D4'), `${asset.path} exposed a non-synthetic concrete SHI`);
  assetObservations.push({
    path: asset.path,
    source_file: asset.source_file,
    status: observed.response.status,
    cache_control: observed.cacheControl,
    bytes: Buffer.byteLength(observed.text),
    markers: Array.from(asset.markers),
    propagation_attempts: observed.attempt
  });
}

function syntheticWords(count) {
  return Array.from({ length: count }, (_, index) => `signal${index + 1}`).join(' ');
}

const expectedTemporalStates = Object.freeze([
  Object.freeze({ count: 119, band: 'waiting', color: 'grey', copy: 'This page is waiting with you.', continueVisible: false }),
  Object.freeze({ count: 120, band: 'noticed', color: 'magenta', copy: 'A Future Has Noticed You', continueVisible: false }),
  Object.freeze({ count: 239, band: 'noticed', color: 'magenta', copy: 'A Future Has Noticed You', continueVisible: false }),
  Object.freeze({ count: 240, band: 'carrying', color: 'yellow', copy: 'The Message Is Carrying', continueVisible: false }),
  Object.freeze({ count: 359, band: 'carrying', color: 'yellow', copy: 'The Message Is Carrying', continueVisible: false }),
  Object.freeze({ count: 360, band: 'receiving', color: 'cyan', copy: 'The Next Self Can Hear You', continueVisible: true })
]);

async function observeTemporalBloom(browser, label, viewport, mobile) {
  const context = await browser.newContext({
    viewport,
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error)));
  await page.goto(`${baseUrl}/safe-harbor/?td613-wave-b=${sourceCommit}&surface=${label}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await page.waitForSelector('#ingressStepInput', { state: 'attached', timeout: 30000 });
  await page.waitForFunction(() => Boolean(window.TD613_SAFE_HARBOR_TEMPORAL_BLOOM), null, { timeout: 30000 });

  const observations = [];
  for (const expected of expectedTemporalStates) {
    await page.fill('#ingressStepInput', syntheticWords(expected.count));
    await page.waitForFunction(({ copy, band, color }) => {
      const shell = document.querySelector('#temporalBloom');
      const recognition = document.querySelector('#temporalBloomRecognition');
      return shell?.dataset.band === band
        && shell?.dataset.color === color
        && recognition?.textContent?.trim() === copy;
    }, { copy: expected.copy, band: expected.band, color: expected.color }, { timeout: 15000 });
    const observed = await page.evaluate(() => {
      const shell = document.querySelector('#temporalBloom');
      const recognition = document.querySelector('#temporalBloomRecognition');
      const continueButton = document.querySelector('#ingressContinue');
      return {
        band: shell?.dataset.band || null,
        color: shell?.dataset.color || null,
        mature: shell?.dataset.mature || null,
        recognition: recognition?.textContent?.trim() || null,
        recognitionContainsDigit: /\d/u.test(recognition?.textContent || ''),
        continueHidden: Boolean(continueButton?.hidden),
        continueDisplay: continueButton ? getComputedStyle(continueButton).display : null
      };
    });
    assert.equal(observed.band, expected.band);
    assert.equal(observed.color, expected.color);
    assert.equal(observed.recognition, expected.copy);
    assert.equal(observed.recognitionContainsDigit, false);
    assert.equal(!observed.continueHidden && observed.continueDisplay !== 'none', expected.continueVisible);
    observations.push({ count: expected.count, ...observed });
  }

  const surface = await page.evaluate(() => {
    const line = document.querySelector('#temporalBloomLine');
    const input = document.querySelector('#ingressStepInput');
    const progressPill = document.querySelector('#ingressProgressPill');
    const consoleBlocks = Array.from(document.querySelectorAll('.ingress-console-block'));
    const liveRegion = document.querySelector('#temporalBloom');
    return {
      title: document.title,
      heading: document.querySelector('h1')?.textContent?.trim() || null,
      publicMode: document.body.dataset.temporalPublic,
      progressPillDisplay: progressPill ? getComputedStyle(progressPill).display : null,
      consoleBlocksHidden: consoleBlocks.every((node) => getComputedStyle(node).display === 'none'),
      progressBarRoleCount: document.querySelectorAll('[role="progressbar"]').length,
      liveRegionRole: liveRegion?.getAttribute('role') || null,
      liveRegionPoliteness: liveRegion?.getAttribute('aria-live') || null,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      pseudoAnimationName: line ? getComputedStyle(line, '::after').animationName : null,
      inputFontSize: input ? Number.parseFloat(getComputedStyle(input).fontSize) : null,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      viewportWidth: window.innerWidth,
      rendererBridgePresent: Boolean(document.documentElement.dataset.td613Renderer)
    };
  });

  assert.equal(surface.title, 'TD613 Safe Harbor');
  assert.equal(surface.heading, 'TD613 Safe Harbor');
  assert.equal(surface.publicMode, 'true');
  assert.equal(surface.progressPillDisplay, 'none');
  assert.equal(surface.consoleBlocksHidden, true);
  assert.equal(surface.progressBarRoleCount, 0);
  assert.equal(surface.liveRegionRole, 'status');
  assert.equal(surface.liveRegionPoliteness, 'polite');
  assert.equal(surface.reducedMotion, true);
  assert.equal(surface.pseudoAnimationName, 'none');
  assert.equal(surface.horizontalOverflow, false);
  if (mobile) assert.ok(surface.inputFontSize >= 16, 'mobile textarea must remain at least 16px to prevent iOS zoom churn');

  await page.screenshot({ path: `${artifactDir}/safe-harbor-wave-b-${label}.png`, fullPage: true });
  assert.deepEqual(pageErrors, [], `${label} Safe Harbor page emitted page errors:\n${pageErrors.join('\n')}`);
  await context.close();
  return { label, viewport, mobile, states: observations, surface };
}

const browser = await chromium.launch({ headless: true });
const desktopObservation = await observeTemporalBloom(browser, 'desktop-1440x1000', { width: 1440, height: 1000 }, false);
const mobileObservation = await observeTemporalBloom(browser, 'mobile-390x844', { width: 390, height: 844 }, true);

const runtimePage = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const runtimeErrors = [];
runtimePage.on('pageerror', (error) => runtimeErrors.push(String(error?.stack || error)));
await runtimePage.goto(`${baseUrl}/safe-harbor/?td613-wave-b=${sourceCommit}&surface=provenance`, {
  waitUntil: 'domcontentloaded',
  timeout: 60000
});
await runtimePage.waitForSelector('#stage3ProvenancePanel', { state: 'attached', timeout: 30000 });

const presentationCore = await runtimePage.evaluate(async ({ sourceCommit }) => {
  const version = encodeURIComponent(sourceCommit);
  const core = await import(new URL(`app/safe-harbor-gen3-presentation-core.js?td613-wave-b=${version}`, location.href).href);
  const shi = 'TD613-SH-9B07D8B-A1B2C3D4';
  const signedSummary = {
    principal: 'tauric.diana.613',
    badge_id: 'bdg_glyph_U10D613',
    claimed_pua: 'U+10D613',
    canonical_phrase: 'Tauric Diana — Crimean heritage custodianship',
    binding_fragment: '#9B07D8B',
    sac: 'SAC[X6ZNK5NO51]',
    shi_number: shi,
    canon_shi: shi,
    binding_shi: shi,
    packet_hash_sha256: `sha256:${'a'.repeat(64)}`,
    stylometric_fingerprint: 'synthetic-wave-b-production-fingerprint',
    stability_digest: `sha256:${'b'.repeat(64)}`,
    blind_challenge_precommitment_digest: `sha256:${'c'.repeat(64)}`,
    blind_challenge_result_digest: `sha256:${'d'.repeat(64)}`,
    restoration_receipt_digest: `sha256:${'e'.repeat(64)}`,
    genuine_holdout_rank: 1,
    nearest_impostor_margin: 0.42,
    entrant_intake_ts: '2026-07-22T21:00:00Z',
    countersignature: {
      status: 'countersigned',
      signed_at_utc: '2026-07-22T21:30:00Z',
      signature_digest: `sha256:${'f'.repeat(64)}`
    },
    temporal_lineage: {
      root_binding_authority: { recorded_ts_utc: '2025-08-11T03:58:39Z' },
      badge_protocol_history: {
        recorded_date: '2025-10-17',
        historical_example: core.HISTORICAL_EXAMPLE
      },
      entrant_credential_authority: { recorded_ts_utc: '2026-07-22T21:00:00Z' },
      entrant_countersignature_authority: { recorded_ts_utc: '2026-07-22T21:30:00Z' }
    },
    blind_challenge: { outcome: 'PASSED', imitation_collision: false },
    claim_ceiling: 'Synthetic packet-scoped custody evidence only.'
  };
  const presentationTimestamp = '2026-07-22T22:00:00Z';
  const presentation = core.buildProvenancePresentation(signedSummary, shi, presentationTimestamp);
  const metadata = core.buildAttestationMetadata(presentation);
  const validation = core.validateAttestationMetadata(metadata);
  const svgA = core.buildDeterministicAttestationSvg(metadata);
  const svgB = core.buildDeterministicAttestationSvg(JSON.parse(JSON.stringify(metadata)));
  const mismatch = core.validateShiSurfaces({
    packet_shi: shi,
    canon_shi: shi,
    binding_shi: shi,
    dom_shi: 'TD613-SH-9B07D8B-FFEEDDCC',
    svg_shi: shi
  });
  const collisionPresentation = core.buildProvenancePresentation({
    ...signedSummary,
    blind_challenge: { outcome: 'IMITATION-COLLISION', imitation_collision: true }
  }, shi, presentationTimestamp);
  const collisionMetadata = core.buildAttestationMetadata(collisionPresentation);
  const collisionSvg = core.buildDeterministicAttestationSvg(collisionMetadata);
  const unsignedMetadata = core.buildAttestationMetadata(core.buildProvenancePresentation({
    ...signedSummary,
    countersignature: { status: 'unsigned', signed_at_utc: null, signature_digest: null },
    temporal_lineage: {
      ...signedSummary.temporal_lineage,
      entrant_countersignature_authority: { recorded_ts_utc: null }
    }
  }, shi, presentationTimestamp));
  const invalidSigned = JSON.parse(JSON.stringify(metadata));
  invalidSigned.countersignature_status = 'COUNTERSIGNED';
  invalidSigned.countersignature_digest = null;
  return {
    temporal_schema: core.TEMPORAL_BLOOM_SCHEMA,
    presentation_schema: presentation.schema_version,
    metadata_schema: metadata.schema_version,
    validation_status: validation.status,
    shi_status: presentation.shi_exact_match.status,
    mismatch_status: mismatch.status,
    mismatch_reason: mismatch.reason,
    countersignature_status: metadata.countersignature_status,
    unsigned_validation_status: core.validateAttestationMetadata(unsignedMetadata).status,
    invalid_signed_reason: core.validateAttestationMetadata(invalidSigned).reason,
    binding_timestamp: metadata.authority_chronology.binding_authority.timestamp,
    historical_date: metadata.authority_chronology.badge_protocol_history.date,
    intake_timestamp: metadata.authority_chronology.entrant_credential_authority.timestamp,
    countersignature_timestamp: metadata.authority_chronology.entrant_countersignature_authority.timestamp,
    presentation_timestamp: metadata.authority_chronology.presentation_authority.timestamp,
    deterministic_svg: svgA === svgB,
    svg_contains_shi: svgA.includes(shi),
    svg_contains_claim_ceiling: svgA.includes('INDEPENDENT IDENTITY ADJUDICATION: NOT CLAIMED'),
    svg_raw_payload_absent: !/&quot;(?:raw_text|source_text|entrant_text|window_text|prompt_text)&quot;\s*:/u.test(svgA),
    collision_state: collisionMetadata.imitation_collision_state,
    collision_authority_reduced: collisionMetadata.authority_claim_reduced,
    collision_svg_discloses_collision: collisionSvg.includes('AI IMITATION COLLISION: PRESENT'),
    collision_svg_reduces_authority: collisionSvg.includes('AUTHORITY CLAIM REDUCED'),
    raw_text_included: metadata.raw_text_included,
    presentation_telemetry_collected: presentation.telemetry_collected
  };
}, { sourceCommit });

assert.equal(presentationCore.temporal_schema, 'td613.safe-harbor.temporal-bloom/v1');
assert.equal(presentationCore.presentation_schema, 'td613.safe-harbor.provenance-presentation/v1');
assert.equal(presentationCore.metadata_schema, 'td613.safe-harbor.pua-provenance-attestation/v1');
assert.equal(presentationCore.validation_status, 'pass');
assert.equal(presentationCore.shi_status, 'pass');
assert.equal(presentationCore.mismatch_status, 'hold');
assert.equal(presentationCore.mismatch_reason, 'shi-mismatch');
assert.equal(presentationCore.countersignature_status, 'COUNTERSIGNED');
assert.equal(presentationCore.unsigned_validation_status, 'pass');
assert.equal(presentationCore.invalid_signed_reason, 'invalid-countersignature');
assert.equal(presentationCore.binding_timestamp, '2025-08-11T03:58:39Z');
assert.equal(presentationCore.historical_date, '2025-10-17');
assert.equal(presentationCore.intake_timestamp, '2026-07-22T21:00:00Z');
assert.equal(presentationCore.countersignature_timestamp, '2026-07-22T21:30:00Z');
assert.equal(presentationCore.presentation_timestamp, '2026-07-22T22:00:00Z');
assert.equal(presentationCore.deterministic_svg, true);
assert.equal(presentationCore.svg_contains_shi, true);
assert.equal(presentationCore.svg_contains_claim_ceiling, true);
assert.equal(presentationCore.svg_raw_payload_absent, true);
assert.equal(presentationCore.collision_state, 'PRESENT');
assert.equal(presentationCore.collision_authority_reduced, true);
assert.equal(presentationCore.collision_svg_discloses_collision, true);
assert.equal(presentationCore.collision_svg_reduces_authority, true);
assert.equal(presentationCore.raw_text_included, false);
assert.equal(presentationCore.presentation_telemetry_collected, false);

await runtimePage.addScriptTag({
  url: `${baseUrl}/safe-harbor/renderers/10_TD613_PUA_Badge_Provenance_Attestation_Renderer_v7_2_1.user.js?td613-wave-b=${sourceCommit}`
});
await runtimePage.waitForFunction(() => Boolean(window.TD613ProvenanceAttestationRenderer), null, { timeout: 30000 });

const rendererObservation = await runtimePage.evaluate(() => {
  const shi = 'TD613-SH-9B07D8B-A1B2C3D4';
  const panel = document.querySelector('#stage3ProvenancePanel');
  const principal = document.querySelector('[data-td613-principal="true"]') || document.body;
  Object.assign(panel.dataset, {
    td613Shi: shi,
    td613PacketShi: shi,
    td613CanonShi: shi,
    td613BindingShi: shi,
    td613PacketHash: `sha256:${'a'.repeat(64)}`,
    td613StylometricFingerprint: 'synthetic-wave-b-production-fingerprint',
    td613StabilityDigest: `sha256:${'b'.repeat(64)}`,
    td613BlindPrecommitmentDigest: `sha256:${'c'.repeat(64)}`,
    td613BlindResultDigest: `sha256:${'d'.repeat(64)}`,
    td613RestorationDigest: `sha256:${'e'.repeat(64)}`,
    td613HoldoutRank: '1',
    td613NearestImpostorMargin: '0.42',
    td613ImitationCollision: 'PRESENT',
    td613CountersignatureStatus: 'COUNTERSIGNED',
    td613CountersignatureDigest: `sha256:${'f'.repeat(64)}`,
    td613BindingTimestamp: '2025-08-11T03:58:39Z',
    td613HistoricalDate: '2025-10-17',
    td613HistoricalExample: 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐',
    td613EntrantIntakeTimestamp: '2026-07-22T21:00:00Z',
    td613CountersignatureTimestamp: '2026-07-22T21:30:00Z',
    td613PresentationTimestamp: '2026-07-22T22:00:00Z',
    td613ClaimCeiling: 'Synthetic packet-scoped custody evidence only.',
    td613AuthorityReduced: 'true'
  });
  principal.dataset.td613Shi = shi;
  principal.dataset.td613PacketHash = panel.dataset.td613PacketHash;
  principal.dataset.td613StylometricFingerprint = panel.dataset.td613StylometricFingerprint;
  const api = window.TD613ProvenanceAttestationRenderer;
  const meta = api.read_badge_meta(panel);
  const validation = api.validate_attestation_inputs(meta);
  const svgA = api.build_attestation_svg(meta);
  const svgB = api.build_attestation_svg({ ...meta });
  const metadata = api.build_attestation_metadata(meta);
  const mismatch = api.validate_attestation_inputs({ ...meta, dom_shi: 'TD613-SH-9B07D8B-FFEEDDCC' });
  const unsigned = api.validate_attestation_inputs({ ...meta, countersignature_status: 'UNSIGNED', countersignature_digest: null });
  const invalidSigned = api.validate_attestation_inputs({ ...meta, countersignature_status: 'COUNTERSIGNED', countersignature_digest: null });
  return {
    renderer_version: api.version,
    extension: api.gen3_extension,
    schema: api.attestation_schema,
    validation_status: validation.status,
    mismatch_reason: mismatch.reason,
    unsigned_status: unsigned.status,
    invalid_signed_reason: invalidSigned.reason,
    deterministic_svg: svgA === svgB,
    svg_contains_shi: svgA.includes(shi),
    svg_discloses_collision: svgA.includes('AI IMITATION COLLISION: PRESENT'),
    svg_reduces_authority: svgA.includes('AUTHORITY CLAIM REDUCED'),
    svg_claim_ceiling: svgA.includes('INDEPENDENT IDENTITY ADJUDICATION: NOT CLAIMED'),
    svg_raw_payload_absent: !/&quot;(?:raw_text|source_text|entrant_text|window_text|prompt_text)&quot;\s*:/u.test(svgA),
    metadata_collision_state: metadata.imitation_collision_state,
    metadata_authority_reduced: metadata.authority_claim_reduced,
    metadata_raw_text_included: metadata.raw_text_included,
    binding_timestamp: metadata.authority_chronology.binding_authority.timestamp,
    historical_date: metadata.authority_chronology.badge_protocol_history.date
  };
});

assert.equal(rendererObservation.renderer_version, '7.2.1');
assert.equal(rendererObservation.extension, 'stage3-temporal-bloom-provenance/v1');
assert.equal(rendererObservation.schema, 'td613.safe-harbor.pua-provenance-attestation/v1');
assert.equal(rendererObservation.validation_status, 'pass');
assert.equal(rendererObservation.mismatch_reason, 'shi-mismatch');
assert.equal(rendererObservation.unsigned_status, 'pass');
assert.equal(rendererObservation.invalid_signed_reason, 'invalid-countersignature');
assert.equal(rendererObservation.deterministic_svg, true);
assert.equal(rendererObservation.svg_contains_shi, true);
assert.equal(rendererObservation.svg_discloses_collision, true);
assert.equal(rendererObservation.svg_reduces_authority, true);
assert.equal(rendererObservation.svg_claim_ceiling, true);
assert.equal(rendererObservation.svg_raw_payload_absent, true);
assert.equal(rendererObservation.metadata_collision_state, 'PRESENT');
assert.equal(rendererObservation.metadata_authority_reduced, true);
assert.equal(rendererObservation.metadata_raw_text_included, false);
assert.equal(rendererObservation.binding_timestamp, '2025-08-11T03:58:39Z');
assert.equal(rendererObservation.historical_date, '2025-10-17');

await runtimePage.screenshot({ path: `${artifactDir}/safe-harbor-wave-b-provenance.png`, fullPage: true });
assert.deepEqual(runtimeErrors, [], `Wave B provenance page emitted page errors:\n${runtimeErrors.join('\n')}`);
await browser.close();

const receipt = {
  schema_version: 'td613.safe-harbor.gen3-wave-b-production-observation/v1',
  status: 'PASS',
  observed_at_utc: new Date().toISOString(),
  source_packet_commit: sourceCommit,
  production_url: baseUrl,
  asset_observations: assetObservations,
  desktop_temporal_bloom: desktopObservation,
  mobile_temporal_bloom: mobileObservation,
  presentation_core: presentationCore,
  renderer_observation: rendererObservation,
  authority: {
    production_bytes_observed: true,
    temporal_bloom_runtime_observed: true,
    provenance_runtime_observed: true,
    countersignature_states_observed: true,
    deterministic_svg_observed: true,
    adverse_authority_reduction_observed: true,
    counts_as_identity_adjudication: false,
    counts_as_external_authorship_adjudication: false,
    authorizes_research_track_r_promotion: false,
    authorizes_future_release: false
  }
};

await fs.writeFile(
  `${artifactDir}/safe-harbor-gen3-wave-b-production-observation.json`,
  `${JSON.stringify(receipt, null, 2)}\n`
);
console.log(JSON.stringify(receipt, null, 2));