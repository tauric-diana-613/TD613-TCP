import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { WAVE_B_ASSETS } from '../scripts/safe-harbor-gen3-wave-b-production-assets.mjs';

const probe = readFileSync(new URL('../scripts/safe-harbor-gen3-wave-b-production-probe.mjs', import.meta.url), 'utf8');
const assetPaths = new Set(WAVE_B_ASSETS.map((asset) => asset.path));

for (const path of [
  '/safe-harbor/',
  '/safe-harbor/app/safe-harbor-gen3-evidence-contract.js',
  '/safe-harbor/app/safe-harbor-gen3-authorship-maturity.js',
  '/safe-harbor/app/safe-harbor-gen3-stage2-controls.js',
  '/safe-harbor/app/safe-harbor-gen3-presentation-core.js',
  '/safe-harbor/app/safe-harbor-temporal-bloom.js',
  '/safe-harbor/app/safe-harbor-temporal-bloom.css',
  '/safe-harbor/renderers/10_TD613_PUA_Badge_Provenance_Attestation_Renderer_v7_2_1.user.js'
]) assert.ok(assetPaths.has(path), `Wave B asset manifest missing ${path}`);

for (const marker of [
  "schema_version: 'td613.safe-harbor.gen3-wave-b-production-observation/v1'",
  "status: 'PASS'",
  "'desktop-1440x1000'",
  "'mobile-390x844'",
  "count: 119",
  "count: 120",
  "count: 239",
  "count: 240",
  "count: 359",
  "count: 360",
  "copy: 'A Future Has Noticed You'",
  "copy: 'The Message Is Carrying'",
  "copy: 'The Next Self Can Hear You'",
  "progressPillDisplay, 'none'",
  "pseudoAnimationName, 'none'",
  "inputFontSize >= 16",
  "horizontalOverflow, false",
  "td613.safe-harbor.temporal-bloom/v1",
  "td613.safe-harbor.provenance-presentation/v1",
  "td613.safe-harbor.pua-provenance-attestation/v1",
  "TD613-SH-9B07D8B-A1B2C3D4",
  "mismatch_reason, 'shi-mismatch'",
  "invalid_signed_reason, 'invalid-countersignature'",
  "binding_timestamp, '2025-08-11T03:58:39Z'",
  "historical_date, '2025-10-17'",
  "deterministic_svg, true",
  "AI IMITATION COLLISION: PRESENT",
  "AUTHORITY CLAIM REDUCED",
  "INDEPENDENT IDENTITY ADJUDICATION: NOT CLAIMED",
  "raw_text_included, false",
  "presentation_telemetry_collected, false",
  "authorizes_research_track_r_promotion: false",
  "authorizes_future_release: false"
]) assert.ok(probe.includes(marker), `Wave B production probe marker missing: ${marker}`);

assert.match(probe, /page\.fill\('#ingressStepInput', syntheticWords\(expected\.count\)\)/u);
assert.match(probe, /getComputedStyle\(line, '::after'\)\.animationName/u);
assert.match(probe, /window\.TD613ProvenanceAttestationRenderer/u);
assert.match(probe, /api\.validate_attestation_inputs\(meta\)/u);
assert.match(probe, /api\.build_attestation_svg\(meta\)/u);
assert.match(probe, /core\.validateShiSurfaces/u);
assert.match(probe, /core\.validateAttestationMetadata/u);
assert.match(probe, /core\.buildDeterministicAttestationSvg/u);
assert.match(probe, /safe-harbor-gen3-wave-b-production-observation\.json/u);
assert.match(probe, /safe-harbor-wave-b-\$\{label\}\.png/u);
assert.match(probe, /safe-harbor-wave-b-provenance\.png/u);

assert.doesNotMatch(probe, /TD613-SH-9B07D8B-(?!A1B2C3D4|FFEEDDCC)[0-9A-F]{8}/gu, 'Wave B probe must not contain an unrecognized concrete SHI');
assert.doesNotMatch(probe, /keystroke_timing\s*:/u);
assert.doesNotMatch(probe, /pause_timing\s*:/u);
assert.doesNotMatch(probe, /cursor_trajectory\s*:/u);
assert.doesNotMatch(probe, /identity_probability\s*:\s*(?!null)/u);
assert.doesNotMatch(probe, /authorizes_research_track_r_promotion:\s*true/u);
assert.doesNotMatch(probe, /authorizes_future_release:\s*true/u);

console.log('safe-harbor-gen3-wave-b-production-probe-contract: ok');