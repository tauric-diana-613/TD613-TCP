import assert from 'node:assert/strict';

import { finalizeSafeHarborPacket } from '../app/safe-harbor/app/safe-harbor-native-finalizer.js';
import {
  expectedV2BadgeNumber,
  verifySafeHarborPacketAuthority
} from '../app/safe-harbor/app/safe-harbor-authority-verifier.js';
import {
  buildCountersignatoryIntake,
  buildEoHookAuthority,
  buildOperatorReceipt,
  buildOutsideWitnessAlignment,
  buildRendererAuthorityV2,
  buildSignatureOverlayAuthority,
  buildStep1Countersignature,
  buildSvgAuthorityMetadata,
  buildTcpHookAuthority
} from '../app/safe-harbor/app/safe-harbor-outside-witness-alignment.js';
import {
  applyPublicDefaultGate,
  buildPublicDefaultGate,
  buildPhase8RendererPolicy,
  buildPhase8SvgPolicy,
  verifyPublicDefaultGate
} from '../app/safe-harbor/app/safe-harbor-public-default-gate.js';

const laneText = (label) => [
  `${label} begins with a deliberate covenant sentence that carries enough language for the stylometric engine to read signal rather than noise.`,
  'The voice keeps faith with the triad while allowing syntax, rhythm, and register to show their own pressure.',
  'This passage avoids raw identity claims and focuses on packet-internal custody, replay, divergence, and authored topology.',
  'It gives the harbor sufficient words to measure structure, function words, character texture, and cross-lane difference without exposing sealed text later.'
].join(' ');
const segments = {
  future_self: laneText('Future self will carry route and projection'),
  past_self: laneText('Past self remembers residue and recovery'),
  higher_self: laneText('Higher self names pattern and witness')
};
function thinLane(key, text) {
  const words = text.trim().split(/\s+/u).filter(Boolean);
  return {
    source: 'safe-harbor.local',
    lane: key,
    char_count: text.length,
    word_count: words.length,
    sentence_count: text.split(/[.!?]+/u).filter(Boolean).length,
    avg_word_length: 5.5,
    avg_sentence_length: 13,
    punctuation_density: 0.02,
    line_break_density: 0,
    unique_ratio: 0.72,
    punctuation_mix: { comma: 0.2, dash: 0.2, colon: 0.1, semicolon: 0, exclamation: 0, question: 0 },
    dominant_axes: ['signal', 'covenant'],
    temporal_posture: key === 'future_self' ? 'forward' : key === 'past_self' ? 'backward' : 'orthogonal',
    dominant_operator: 'F',
    governed_exposure_depth: 0.5,
    closure_class: 'closed',
    frame_alignment: 'aligned',
    frame_alignment_note: null
  };
}
function stableFingerprint(signatures) {
  return Object.keys(signatures).sort().map((key) => `${key}:${signatures[key].word_count}:${signatures[key].temporal_posture}`).join('|');
}
function basePacket() {
  const signatures = Object.fromEntries(Object.entries(segments).map(([key, value]) => [key, thinLane(key, value)]));
  const packet = {
    schema_version: 'td613.safe-harbor.packet/v1',
    packet_id: 'SH-PHASE8-GATE-001',
    created_at: '2026-06-20T00:00:00Z',
    canon: { principal: 'tauric.diana.613', binding_fragment: '#9B07D8B', sac: 'SAC[X6ZNK5NO51]' },
    intake: { ts_utc: '2026-06-20T00:00:00Z', status: 'issued' },
    analysis: { segment_cadence_signatures: signatures, triad_resonance: 0.81, cross_lane_stability: 0.79, cross_lane_spread: 0.21 },
    issuance: {
      badge_number: null,
      stylometric_fingerprint: stableFingerprint(signatures),
      triad_word_counts: Object.fromEntries(Object.entries(signatures).map(([key, lane]) => [key, lane.word_count])),
      triad_shortfalls: { future_self: 0, past_self: 0, higher_self: 0 },
      stylometric_provenance: { divergence_signature: { compact: 'legacy divergence' } }
    },
    signature: { status: 'declared', sig: null, attached_at: null },
    bridge: { covenant_gate: { confirmed: true }, export_gate: { ready: true, state: 'harbor-eligible', blockers: [] } }
  };
  packet.issuance.badge_number = expectedV2BadgeNumber(packet);
  return packet;
}
async function nativePacket() {
  const packet = await finalizeSafeHarborPacket(basePacket(), { mode: 'native', segments, includePhase5: true, includeTamperFixtures: false });
  return attachWitnesses(packet);
}
async function exportPacket() {
  const packet = await finalizeSafeHarborPacket(basePacket(), { mode: 'export-normalized', segments, includePhase5: true, includeTamperFixtures: false });
  return attachWitnesses(packet);
}
async function attachWitnesses(packet) {
  const out = JSON.parse(JSON.stringify(packet));
  const renderer = buildRendererAuthorityV2(out);
  const svg = buildSvgAuthorityMetadata(out);
  const signature = await buildSignatureOverlayAuthority(out, { renderer_authority_metadata: renderer, signature_status: 'attached' });
  const tcp = buildTcpHookAuthority(out);
  const eo = buildEoHookAuthority(out);
  const step1 = await buildStep1Countersignature(out, { renderer_authority_metadata: renderer, tcp_hook_authority: tcp, eo_hook_authority: eo });
  const intake = await buildCountersignatoryIntake(out, { signature_overlay_authority: signature, tcp_hook_authority: tcp, eo_hook_authority: eo });
  const receipt = buildOperatorReceipt(out, { hash_replay: step1.hash_replay, step1_status: step1.can_countersign ? 'aligned' : 'refused', renderer_status: 'aligned', svg_status: 'aligned', signature_overlay_status: signature.signature_can_bind ? 'aligned' : 'refused', tcp_hook_status: tcp.status, eo_hook_status: eo.status });
  Object.assign(out, { step1_countersignature: step1, countersignatory_intake: intake, renderer_authority_metadata: renderer, svg_authority_metadata: svg, signature_overlay_authority: signature, tcp_hook_authority: tcp, eo_hook_authority: eo, outside_witness_receipt: receipt });
  out.outside_witness_alignment = await buildOutsideWitnessAlignment(out, { step1_envelope: step1, countersignatory_intake: intake, renderer_authority_metadata: renderer, svg_metadata: svg, signature_overlay_authority: signature, tcp_hook_authority: tcp, eo_hook_authority: eo, operator_receipt: receipt });
  return out;
}
function assertNoRawText(value, label) {
  const body = JSON.stringify(value);
  assert.equal(body.includes(segments.future_self), false, `${label} leaked future lane`);
  assert.equal(body.includes(segments.past_self), false, `${label} leaked past lane`);
  assert.equal(body.includes(segments.higher_self), false, `${label} leaked higher lane`);
  assert.equal(body.includes('raw_text'), false, `${label} carried raw_text key`);
}

const packet = await nativePacket();
assert.equal(packet.phase5_replay_hardening.status, 'pass');
assert.equal(packet.native_spine_purification.status, 'native');
assert.equal(packet.outside_witness_alignment.status, 'aligned');

const defaultGate = await buildPublicDefaultGate(packet);
assert.ok(['review', 'pass'].includes(defaultGate.status));
assert.equal(defaultGate.gate_decision, 'keep-v2-only');
assert.equal(defaultGate.public_default_after, 'v2-only');
assert.equal(defaultGate.public_display_roles.v2, 'public-default');
assert.equal(defaultGate.public_display_roles.v3, 'hidden');

const visibleGate = await buildPublicDefaultGate(packet, { phase8Policy: { allowV3Visible: true } });
assert.equal(visibleGate.status, 'pass');
assert.equal(visibleGate.gate_decision, 'allow-v3-visible');
assert.equal(visibleGate.public_default_after, 'v2-primary-v3-visible');
assert.equal(visibleGate.public_display_roles.v2, 'primary');
assert.equal(visibleGate.public_display_roles.v3, 'forensic-secondary-visible');

const dualCandidate = JSON.parse(JSON.stringify(packet));
dualCandidate.public_default_policy.v3_public_ready = true;
const dualGate = await buildPublicDefaultGate(dualCandidate, { phase8Policy: { allowDualDisplay: true } });
assert.equal(dualGate.status, 'pass');
assert.equal(dualGate.gate_decision, 'allow-dual-display');
assert.equal(dualGate.public_default_after, 'dual-v2-v3');
assert.equal(dualGate.public_display_roles.v3, 'dual-verification-companion');

for (const [name, mutate, expectedReason] of [
  ['v2 replay failure', (p) => { p.issuance.badge_number = 'TD613-SH-9B07D8B-BADBAD00'; }, /v2 replay failed/u],
  ['v3 replay failure', (p) => { p.issuance.v3.stylometric_fingerprint_v3 = 'sha256:' + '0'.repeat(64); }, /v3 replay failed/u],
  ['hash replay failure', (p) => { p.packet_hash_sha256 = 'sha256:' + 'f'.repeat(64); }, /hash replay failed/u],
  ['Phase 5 quarantine', (p) => { p.phase5_replay_hardening.status = 'quarantine'; }, /Phase 5 status/u],
  ['outside witness blocked', (p) => { p.outside_witness_alignment.status = 'blocked'; }, /outside witnesses blocked/u],
  ['Step 1 refusal', (p) => { p.step1_countersignature.can_countersign = false; }, /Step 1 cannot countersign/u],
  ['renderer mismatch', (p) => { p.renderer_authority_metadata.packet_hash_sha256 = 'sha256:' + 'e'.repeat(64); }, /renderer authority mismatch/u],
  ['SVG mismatch', (p) => { p.svg_authority_metadata['data-td613-public-default'] = 'dual'; }, /SVG authority mismatch/u],
  ['signature refusal', (p) => { p.signature_overlay_authority.signature_can_bind = false; }, /signature overlay refused/u],
  ['TCP mismatch', (p) => { p.tcp_hook_authority.public_default = 'dual'; }, /TCP hook/u],
  ['EO mismatch', (p) => { p.eo_hook_authority.observed_public_default = 'dual'; }, /EO hook/u],
  ['raw text leak', (p) => { p.outside_witness_receipt.raw_text = segments.future_self; }, /raw text/u]
]) {
  const dirty = JSON.parse(JSON.stringify(packet));
  mutate(dirty);
  const gate = await buildPublicDefaultGate(dirty, { phase8Policy: { allowV3Visible: true } });
  assert.equal(gate.status, 'blocked', name);
  assert.equal(gate.gate_decision, 'block', name);
  assert.match(gate.refusal_reasons.join(' | '), expectedReason, name);
}

const missingSpine = JSON.parse(JSON.stringify(packet));
delete missingSpine.native_spine_purification;
missingSpine.packet_authority_surface.rich_profile_promotion = 'legacy';
const missingSpineGate = await buildPublicDefaultGate(missingSpine, { phase8Policy: { allowV3Visible: true } });
assert.notEqual(missingSpineGate.gate_decision, 'allow-v3-visible');
assert.equal(missingSpineGate.public_default_after, 'v2-only');

const exported = await exportPacket();
const exportedGate = await buildPublicDefaultGate(exported, { phase8Policy: { allowV3Visible: true } });
assert.equal(exported.native_spine_purification.status, 'export-hardened');
assert.equal(exportedGate.gate_decision, 'keep-v2-only');
assert.equal(exportedGate.public_default_after, 'v2-only');

const legacy = await attachWitnesses(basePacket());
const legacyReplay = await verifySafeHarborPacketAuthority(legacy);
const legacyGate = await buildPublicDefaultGate(legacy, { phase8Policy: { allowV3Visible: true } });
assert.equal(legacyReplay.v2_replay.status, 'pass');
assert.equal(legacyGate.gate_decision, 'keep-v2-only');
assert.equal(legacyGate.public_default_after, 'v2-only');
assert.notEqual(legacyGate.gate_inputs.native_spine_status, 'native');

const appliedVisible = await applyPublicDefaultGate(packet, { phase8Policy: { allowV3Visible: true } });
assert.equal(appliedVisible.phase8_public_default_gate.gate_decision, 'allow-v3-visible');
assert.equal(appliedVisible.public_default_policy.default_public_credential, 'v2');
assert.equal(appliedVisible.public_default_policy.public_shi, 'v2+v3');
assert.equal(appliedVisible.public_default_policy.v3_public_visible, true);
assert.equal(appliedVisible.renderer_authority_metadata.schema_version, 'td613.safe-harbor.renderer-authority/v3');
assert.equal(appliedVisible.renderer_authority_metadata.public_default_credential, 'v2');
assert.equal(appliedVisible.renderer_authority_metadata.public_display_mode, 'v2-primary-v3-visible');
assert.equal(appliedVisible.renderer_authority_metadata.v3_role, 'forensic-secondary-visible');
assert.equal(appliedVisible.svg_authority_metadata['data-td613-public-default'], 'v2');
assert.equal(appliedVisible.svg_authority_metadata['data-td613-public-display-mode'], 'v2-primary-v3-visible');
assert.equal(appliedVisible.svg_authority_metadata['data-td613-v3-role'], 'forensic-secondary-visible');
assert.equal(appliedVisible.phase8_receipt_policy.public_default, 'v2');
assert.equal(appliedVisible.phase8_receipt_policy.public_display_mode, 'v2-primary-v3-visible');
assertNoRawText(appliedVisible.phase8_public_default_gate, 'phase8 gate');
assertNoRawText(appliedVisible.renderer_authority_metadata, 'renderer v3');
assertNoRawText(appliedVisible.svg_authority_metadata, 'svg v2');
assertNoRawText(appliedVisible.phase8_receipt_policy, 'phase8 receipt');
assert.equal(JSON.stringify(appliedVisible).includes('Blood Rite 613 public credential'), false);

const appliedDefault = await applyPublicDefaultGate(packet);
assert.equal(appliedDefault.public_default_policy.default_public_credential, 'v2');
assert.equal(appliedDefault.public_default_policy.public_default_mode, 'v2-only');
assert.equal(appliedDefault.renderer_authority_metadata.v3_role, 'hidden');
assert.equal(appliedDefault.svg_authority_metadata['data-td613-public-default'], 'v2');

const overclaim = JSON.parse(JSON.stringify(packet));
overclaim.public_default_policy.default_public_credential = 'dual';
const overclaimGate = await verifyPublicDefaultGate(overclaim, { phase8Policy: { allowV3Visible: true } });
assert.equal(overclaimGate.status, 'blocked');
assert.match(overclaimGate.refusal_reasons.join(' | '), /public_default_credential/u);

const pr169 = await import('node:fs').then((fs) => fs.readFileSync(new URL('../app/safe-harbor/app/safe-harbor-pr169-packet-vault-direct.js', import.meta.url), 'utf8'));
assert.ok(pr169.includes('v14-phase8-gate-compose-purity'));
assert.ok(pr169.includes('phase6_compose_purity'));
assert.ok(pr169.includes('phase7_outside_witness_alignment'));
assert.ok(pr169.includes('phase8_public_default_gate'));
assert.ok(pr169.includes("hasRawSegments(saved) ? 'native' : 'export-normalized'"));

console.log('safe-harbor-phase8-public-default-gate: ok');
