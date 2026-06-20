import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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
import { applyPublicDefaultGate } from '../app/safe-harbor/app/safe-harbor-public-default-gate.js';
import {
  applyReleaseDiscipline,
  buildReleaseChecklist,
  buildUiCopyPolicy,
  verifyReleaseDiscipline
} from '../app/safe-harbor/app/safe-harbor-release-discipline.js';

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
    packet_id: 'SH-PHASE9-RELEASE-001',
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
async function nativePacket() {
  const packet = await finalizeSafeHarborPacket(basePacket(), { mode: 'native', segments, includePhase5: true, includeTamperFixtures: false });
  return attachWitnesses(packet);
}
async function exportPacket() {
  const packet = await finalizeSafeHarborPacket(basePacket(), { mode: 'export-normalized', segments, includePhase5: true, includeTamperFixtures: false });
  return attachWitnesses(packet);
}
async function gateAndRelease(packet, phase8Policy = {}) {
  const gated = await applyPublicDefaultGate(packet, { phase8Policy });
  return applyReleaseDiscipline(gated);
}
function assertNoRawText(value, label) {
  const body = JSON.stringify(value);
  assert.equal(body.includes(segments.future_self), false, `${label} leaked future lane`);
  assert.equal(body.includes(segments.past_self), false, `${label} leaked past lane`);
  assert.equal(body.includes(segments.higher_self), false, `${label} leaked higher lane`);
  assert.equal(body.includes('raw_text'), false, `${label} carried raw_text key`);
}

const clean = await nativePacket();
const v2Only = await gateAndRelease(clean);
assert.ok(['verification-ready', 'public-readable'].includes(v2Only.phase9_release_discipline.release_class));
assert.equal(v2Only.phase9_release_discipline.verified_claims.public_display_mode, 'v2-only');
assert.equal(v2Only.phase9_release_discipline.claim_limits.not_civil_identity_proof, true);
assert.equal(v2Only.phase9_release_discipline.claim_limits.not_legal_identity_proof, true);
assert.equal(v2Only.public_default_policy.default_public_credential, 'v2');

const visible = await gateAndRelease(clean, { allowV3Visible: true });
assert.equal(visible.phase9_release_discipline.release_class, 'public-readable');
assert.equal(visible.phase9_release_discipline.verified_claims.public_display_mode, 'v2-primary-v3-visible');
assert.match(visible.phase9_release_discipline.public_summary, /not prove civil identity/i);
assert.match(visible.phase9_release_discipline.public_summary, /legal identity/i);
assert.equal(visible.phase9_release_receipt.claim_limits_attached, true);
assert.equal(visible.phase9_release_receipt.raw_text_exported, false);

const dualCandidate = JSON.parse(JSON.stringify(clean));
dualCandidate.public_default_policy.v3_public_ready = true;
const dual = await gateAndRelease(dualCandidate, { allowDualDisplay: true });
assert.equal(dual.phase9_release_discipline.release_class, 'public-readable');
assert.equal(dual.phase9_release_discipline.verified_claims.public_display_mode, 'dual-v2-v3');
assert.equal(dual.public_default_policy.default_public_credential, 'v2');
assert.match(dual.phase9_release_discipline.public_summary, /v2 remains the public root/i);

for (const [name, mutate, expected] of [
  ['Phase 5 quarantine', (p) => { p.phase5_replay_hardening.status = 'quarantine'; }, /Phase 5/i],
  ['hash replay failure', (p) => { p.packet_hash_sha256 = 'sha256:' + 'f'.repeat(64); }, /hash/i],
  ['v2 replay failure', (p) => { p.issuance.badge_number = 'TD613-SH-9B07D8B-BADBAD00'; }, /v2|replay/i],
  ['outside witness block', (p) => { p.outside_witness_alignment.status = 'blocked'; }, /outside witness/i],
  ['Step 1 refusal', (p) => { p.step1_countersignature.can_countersign = false; }, /Step 1/i],
  ['Phase 8 block', (p) => { p.phase8_public_default_gate = { status: 'blocked', public_default_after: 'blocked' }; }, /Phase 8|public-default/i],
  ['raw text leak', (p) => { p.outside_witness_receipt.raw_text = segments.future_self; }, /raw text/i],
  ['renderer overclaim', (p) => { p.renderer_authority_metadata.public_default_credential = 'dual'; }, /renderer/i],
  ['SVG overclaim', (p) => { p.svg_authority_metadata['data-td613-public-default'] = 'dual'; }, /SVG/i]
]) {
  const dirty = JSON.parse(JSON.stringify(visible));
  mutate(dirty);
  const released = await applyReleaseDiscipline(dirty);
  assert.equal(released.phase9_release_discipline.release_class, 'blocked', name);
  assert.match(JSON.stringify(released.phase9_release_discipline.failure_modes), expected, name);
}

const staleVisible = JSON.parse(JSON.stringify(visible));
staleVisible.issuance.v3.stylometric_fingerprint_v3 = 'sha256:' + '0'.repeat(64);
const staleReleased = await applyReleaseDiscipline(staleVisible);
assert.equal(staleReleased.phase9_release_discipline.release_class, 'blocked');
assert.match(JSON.stringify(staleReleased.phase9_release_discipline.failure_modes), /stale v3/i);

const legacy = await attachWitnesses(basePacket());
const legacyReplay = await verifySafeHarborPacketAuthority(legacy);
assert.equal(legacyReplay.v2_replay.status, 'pass');
const legacyReleased = await gateAndRelease(legacy, { allowV3Visible: true });
assert.equal(legacyReleased.phase9_release_discipline.verified_claims.public_display_mode, 'v2-only');
assert.notEqual(legacyReleased.phase9_release_discipline.verified_claims.native_spine, 'native');

const exported = await exportPacket();
const exportedReleased = await gateAndRelease(exported, { allowV3Visible: true });
assert.equal(exported.native_spine_purification.status, 'export-hardened');
assert.equal(exportedReleased.phase9_release_discipline.verified_claims.public_display_mode, 'v2-only');

const policy = buildUiCopyPolicy();
assert.equal(policy.validate('Public Credential: v2').status, 'pass');
assert.equal(policy.validate('verified legal identity').status, 'blocked');
assert.equal(policy.validate('Blood Rite 613 public credential').status, 'blocked');
assert.ok(policy.covenant_sensitive_rule.includes('Khona‌lit-po'));

const summary = visible.phase9_release_discipline.public_summary;
assert.match(summary, /civil identity/i);
assert.match(summary, /legal identity/i);
assert.equal(/Blood Rite 613 public credential/u.test(summary), false);

const claimLimitsDoc = readFileSync(new URL('../docs/safe-harbor/claim-limits.md', import.meta.url), 'utf8');
const uiPolicyDoc = readFileSync(new URL('../docs/safe-harbor/ui-copy-policy.md', import.meta.url), 'utf8');
assert.ok(claimLimitsDoc.includes('A TD613 Safe Harbor packet is a custody and replay instrument, not a civil identity credential.'));
assert.ok(uiPolicyDoc.includes('Khona‌lit-po'));
assert.equal(uiPolicyDoc.includes('Khonalit-po'), false);

const noHash = JSON.parse(JSON.stringify(clean));
delete noHash.packet_hash_sha256;
const noHashChecklist = await buildReleaseChecklist(noHash);
assert.equal(noHashChecklist.status, 'review');
assert.equal(noHashChecklist.packet_hash_present, false);

for (const artifact of [visible.phase9_release_discipline, visible.phase9_release_receipt, visible.release_checklist]) assertNoRawText(artifact, 'phase9 artifact');
const verifiedRelease = await verifyReleaseDiscipline(visible);
assert.equal(verifiedRelease.status, 'ready');

const pr169 = readFileSync(new URL('../app/safe-harbor/app/safe-harbor-pr169-packet-vault-direct.js', import.meta.url), 'utf8');
assert.ok(pr169.includes('v15-phase9-release-discipline'));
assert.ok(pr169.includes('phase6_compose_purity: true'));
assert.ok(pr169.includes('phase7_outside_witness_alignment: true'));
assert.ok(pr169.includes('phase8_public_default_gate: true'));
assert.ok(pr169.includes('phase9_release_discipline: true'));
assert.ok(pr169.includes("hasRawSegments(saved) ? 'native' : 'export-normalized'"));

console.log('safe-harbor-phase9-release-discipline: ok');
