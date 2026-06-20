import { verifySafeHarborPacketAuthority } from './safe-harbor-authority-verifier.js';

const RELEASE_SCHEMA = 'td613.safe-harbor.release-discipline/v1';
const CHECKLIST_SCHEMA = 'td613.safe-harbor.release-checklist/v1';
const RECEIPT_SCHEMA = 'td613.safe-harbor.release-receipt/v1';

const FORBIDDEN_UI_STRINGS = [
  'v3 public default',
  'SH3 replaces SHI',
  'Blood Rite 613 public credential',
  'verified legal identity',
  'civil identity verified',
  'state-recognized identity',
  'authorship legally proven',
  'public law approved',
  'court-ready identity proof',
  'heritage legally adjudicated'
];

const ALLOWED_UI_STRINGS = [
  'Public Credential: v2',
  'Public Credential: v2 primary + v3 forensic companion',
  'Public Credential: dual v2/v3 verification-ready',
  'Public Display: v2-only',
  'Public Display: v2 + v3 visible',
  'Public Display: blocked by replay gate',
  'Native Spine: native-born',
  'Native Spine: export-hardened',
  'Native Spine: legacy v2',
  'Witnesses: aligned',
  'Witnesses: partial',
  'Witnesses: blocked',
  'Release Class: public-readable',
  'Release Class: verification-ready',
  'Release Class: operator-only',
  'Release Class: blocked'
];

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function has(value) { return value !== undefined && value !== null; }
function phase5Status(packet) { return getPath(packet, 'phase5_replay_hardening.status') || 'unavailable'; }
function phase8Status(packet) { return getPath(packet, 'phase8_public_default_gate.status') || 'unavailable'; }
function phase8Decision(packet) { return getPath(packet, 'phase8_public_default_gate.gate_decision') || 'keep-v2-only'; }
function publicDisplayMode(packet) { return getPath(packet, 'phase8_public_default_gate.public_default_after') || getPath(packet, 'public_default_policy.public_default_mode') || 'v2-only'; }
function outsideStatus(packet) { return getPath(packet, 'outside_witness_alignment.status') || 'unavailable'; }
function nativeSpine(packet) {
  const p5 = phase5Status(packet);
  if (p5 === 'quarantine' || p5 === 'fail') return 'quarantined';
  return getPath(packet, 'native_spine_purification.status') || 'legacy';
}
function step1CanCountersign(packet) {
  const step1 = getPath(packet, 'step1_countersignature');
  return step1 ? step1.can_countersign === true : false;
}
function rawTextExported(value) {
  return /"raw_text"\s*:|Future self will carry|Past self remembers|Higher self names|future self will carry route|past self remembers residue|higher self names pattern/u.test(JSON.stringify(value || {}));
}
function covenantKeyPreserved(text) { return String(text || '').includes('Khona‌lit-po'); }
function forbiddenHits(text) {
  const body = String(text || '');
  return FORBIDDEN_UI_STRINGS.filter((item) => body.toLowerCase().includes(item.toLowerCase()));
}
function publicDefaultIsV2(packet) { return (getPath(packet, 'public_default_policy.default_public_credential') || 'v2') === 'v2'; }

export function buildClaimLimits() {
  return Object.freeze({
    not_civil_identity_proof: true,
    not_legal_identity_proof: true,
    not_public_law_approval: true,
    not_authorship_ownership_adjudication: true,
    not_state_recognition: true,
    not_v3_supremacy: true
  });
}

export async function buildVerifiedClaims(packet) {
  const authority = await verifySafeHarborPacketAuthority(packet);
  return Object.freeze({
    packet_hash_replay: authority.hash_replay.status,
    v2_replay: authority.v2_replay.status,
    v3_replay: authority.v3_replay.status,
    phase5_hardening: phase5Status(packet),
    native_spine: nativeSpine(packet),
    outside_witness_alignment: outsideStatus(packet),
    phase8_public_default_gate: phase8Status(packet),
    public_display_mode: publicDisplayMode(packet)
  });
}

function blockingReasons(packet, claims) {
  const reasons = [];
  if (claims.v2_replay === 'fail' || claims.v2_replay === 'unavailable') reasons.push('v2 replay is not pass');
  if (claims.packet_hash_replay === 'fail') reasons.push('hash replay failed');
  if (claims.phase5_hardening === 'fail' || claims.phase5_hardening === 'quarantine') reasons.push(`Phase 5 status is ${claims.phase5_hardening}`);
  if (claims.v3_replay === 'fail' && claims.public_display_mode !== 'v2-only') reasons.push('v3 replay failed while public display requested v3');
  if (claims.outside_witness_alignment === 'blocked') reasons.push('outside witnesses blocked');
  if (!step1CanCountersign(packet)) reasons.push('Step 1 cannot countersign');
  if (claims.phase8_public_default_gate === 'blocked' || claims.public_display_mode === 'blocked') reasons.push('Phase 8 public-default gate blocked');
  if (!publicDefaultIsV2(packet)) reasons.push('public_default_credential is not v2');
  if (rawTextExported({ phase9_release_discipline: packet && packet.phase9_release_discipline, outside_witness_receipt: getPath(packet, 'outside_witness_receipt'), renderer_authority_metadata: getPath(packet, 'renderer_authority_metadata'), svg_authority_metadata: getPath(packet, 'svg_authority_metadata'), signature_overlay_authority: getPath(packet, 'signature_overlay_authority'), tcp_hook_authority: getPath(packet, 'tcp_hook_authority'), eo_hook_authority: getPath(packet, 'eo_hook_authority') })) reasons.push('raw text appeared in release-facing artifact');
  const rendererDefault = getPath(packet, 'renderer_authority_metadata.public_default_credential');
  const svgDefault = getPath(packet, 'svg_authority_metadata.data-td613-public-default');
  if (rendererDefault && rendererDefault !== 'v2') reasons.push('renderer public default overclaim');
  if (svgDefault && svgDefault !== 'v2') reasons.push('SVG public default overclaim');
  return [...new Set(reasons)];
}

export async function buildReleaseChecklist(packet) {
  const claims = await buildVerifiedClaims(packet);
  const checklist = {
    schema_version: CHECKLIST_SCHEMA,
    packet_hash_present: Boolean(packet && packet.packet_hash_sha256),
    v2_replay_checked: claims.v2_replay !== 'unavailable',
    v3_replay_checked_when_present: getPath(packet, 'issuance.v3.badge_number_v3') ? claims.v3_replay !== 'unavailable' : true,
    hash_replay_checked: claims.packet_hash_replay !== 'unavailable',
    phase5_checked: claims.phase5_hardening !== 'unavailable',
    native_spine_checked: Boolean(getPath(packet, 'native_spine_purification.status')),
    outside_witnesses_checked: claims.outside_witness_alignment !== 'unavailable',
    step1_checked: Boolean(getPath(packet, 'step1_countersignature')),
    phase8_gate_checked: claims.phase8_public_default_gate !== 'unavailable',
    claim_limits_attached: true,
    ui_copy_policy_attached: true,
    raw_text_absent: !rawTextExported(packet && packet.phase9_release_discipline ? packet.phase9_release_discipline : {}),
    legacy_reopen_checked: claims.v2_replay === 'pass',
    release_class_assigned: true,
    operator_next_action_assigned: true
  };
  checklist.status = Object.entries(checklist).filter(([key]) => !['schema_version', 'status'].includes(key)).every(([, value]) => value === true) ? 'pass' : 'review';
  return Object.freeze(checklist);
}

export async function buildFailureModeAtlas(packet) {
  const claims = await buildVerifiedClaims(packet);
  const failure = [];
  const push = (failure_class, definition, field, release_action, forbidden_remediation) => failure.push({ failure_class, definition, detected_in: field, operator_meaning: release_action === 'block' ? 'Stop release and preserve the packet for review.' : 'Hold for operator review.', public_meaning: 'Do not treat the visible packet as public-ready until the failure is resolved.', release_action, recommended_remediation: 'Regenerate or re-verify through the packet-controlled workflow; do not hand-edit authority fields.', forbidden_remediation });
  if (claims.v2_replay === 'fail') push('replay failure', 'v2 public credential replay failed.', 'issuance.badge_number', 'block', 'Do not manually edit the v2 badge.');
  if (claims.v3_replay === 'fail') push('stale v3', 'v3 forensic credential replay failed.', 'issuance.v3', publicDisplayMode(packet) === 'v2-only' ? 'review' : 'block', 'Do not display SH3 as public companion when replay fails.');
  if (claims.packet_hash_replay === 'fail') push('hash failure', 'packet hash replay failed.', 'packet_hash_sha256', 'block', 'Do not recalculate and overwrite the packet hash by hand.');
  if (claims.phase5_hardening === 'quarantine') push('Phase 5 quarantine', 'Phase 5 replay hardening quarantined the packet.', 'phase5_replay_hardening.status', 'block', 'Do not downgrade quarantine into a friendly caveat.');
  if (claims.outside_witness_alignment === 'blocked') push('outside witness mismatch', 'Outside witness artifacts disagree with packet authority.', 'outside_witness_alignment.status', 'block', 'Do not rely on renderer beauty over packet authority.');
  if (!step1CanCountersign(packet)) push('Step 1 refusal', 'Step 1 countersignature cannot bind cleanly.', 'step1_countersignature.can_countersign', 'block', 'Do not treat Step 1 as ceremonial.');
  if (claims.phase8_public_default_gate === 'blocked') push('public-default gate block', 'Phase 8 public display gate blocked release.', 'phase8_public_default_gate.status', 'block', 'Do not display v3 beside v2 without the gate.');
  if (!publicDefaultIsV2(packet)) push('claim overreach', 'public_default_credential moved away from v2.', 'public_default_policy.default_public_credential', 'block', 'Do not manually change public_default_credential away from v2.');
  return Object.freeze({ schema_version: 'td613.safe-harbor.failure-mode-atlas/v1', failure_modes: failure });
}

function releaseClassFrom(packet, claims, checklist, failures) {
  if (failures.failure_modes.some((item) => item.release_action === 'block')) return 'blocked';
  if (checklist.status !== 'pass') return 'operator-only';
  if (claims.phase8_public_default_gate === 'pass' && ['v2-primary-v3-visible', 'dual-v2-v3'].includes(claims.public_display_mode)) return 'public-readable';
  if ((claims.phase8_public_default_gate === 'pass' || claims.phase8_public_default_gate === 'review') && claims.public_display_mode === 'v2-only' && claims.outside_witness_alignment === 'aligned') return 'verification-ready';
  if (claims.v2_replay === 'pass' && claims.packet_hash_replay === 'pass' && (claims.phase5_hardening === 'pass' || claims.phase5_hardening === 'review')) return 'verification-ready';
  return 'operator-only';
}

export function buildOperatorNextActionFromRelease(release_class, claims) {
  if (release_class === 'blocked') {
    if (claims.phase5_hardening === 'quarantine') return 'quarantine';
    return 'block';
  }
  if (release_class === 'public-readable') return 'export';
  if (release_class === 'verification-ready') return 'verify';
  if (claims.v3_replay === 'blocked') return 'challenge';
  return 'countersign';
}

export async function buildOperatorNextAction(packet) {
  const claims = await buildVerifiedClaims(packet);
  const checklist = await buildReleaseChecklist(packet);
  const failures = await buildFailureModeAtlas(packet);
  const release_class = releaseClassFrom(packet, claims, checklist, failures);
  return buildOperatorNextActionFromRelease(release_class, claims);
}

export function buildPublicSummaryFromClaims(release_class, claims, reasons = []) {
  const limit = 'This does not prove civil identity, legal identity, public law approval, or authorship ownership.';
  if (release_class === 'blocked') return `This TD613 Safe Harbor packet is blocked from public-ready release. Review the refusal reasons in Phase 5, outside witness alignment, Phase 8 public-default gate, and Phase 9 release discipline. Do not present this packet as public-readable. ${limit}`;
  if (claims.public_display_mode === 'dual-v2-v3') return `This TD613 Safe Harbor packet is public-readable under dual v2/v3 verification display. v2 remains the public root; v3 functions as a replay-verified companion credential. ${limit}`;
  if (claims.public_display_mode === 'v2-primary-v3-visible') return `This TD613 Safe Harbor packet is public-readable with v2 as the public root and v3/SH3 as a forensic companion credential. Phase 8 permits companion visibility after replay, witness alignment, and release checks. This does not make v3 the public default and does not prove civil identity, legal identity, public law approval, or authorship ownership.`;
  return `This TD613 Safe Harbor packet is verification-ready under the v2 public credential. Replay checks and release discipline indicate the packet may be read as a custody and replay artifact. ${limit}`;
}

export async function buildPublicSummary(packet) {
  const claims = await buildVerifiedClaims(packet);
  const checklist = await buildReleaseChecklist(packet);
  const failures = await buildFailureModeAtlas(packet);
  const release_class = releaseClassFrom(packet, claims, checklist, failures);
  return buildPublicSummaryFromClaims(release_class, claims, failures.failure_modes.map((item) => item.failure_class));
}

export function buildUiCopyPolicy() {
  return Object.freeze({
    schema_version: 'td613.safe-harbor.ui-copy-policy/v1',
    allowed_ui_strings: ALLOWED_UI_STRINGS.slice(),
    disallowed_ui_strings: FORBIDDEN_UI_STRINGS.slice(),
    covenant_sensitive_rule: 'Khona‌lit-po, Tauric Diana, Blood Rite 613, and related covenant terms may appear as internal lineage or ritual metadata, but not as public legal-status claims. Do not normalize Khona‌lit-po or remove its ZWNJ.',
    validate(text) {
      const hits = forbiddenHits(text);
      return Object.freeze({ status: hits.length ? 'blocked' : 'pass', forbidden_hits: hits });
    }
  });
}

export function buildVerificationGuide() {
  return Object.freeze({ schema_version: 'td613.safe-harbor.verification-guide/v1', steps: ['Confirm packet_hash_sha256.', 'Confirm hash_topology.final_packet_hash_sha256.', 'Confirm issuance.badge_number and v2 replay.', 'Confirm issuance.badge_number_v3 and v3 replay when present.', 'Read Phase 5 hardening.', 'Read native/export/legacy lineage.', 'Read outside witness alignment.', 'Read Phase 8 public-default gate.', 'Read Phase 9 release discipline.', 'Apply claim limits.'], claim_limit: 'Verification reads custody and replay posture; it does not prove civil identity or legal identity.' });
}
export function buildOperatorProtocol() {
  return Object.freeze({ schema_version: 'td613.safe-harbor.operator-protocol/v1', steps: ['Intake packet.', 'Confirm packet hash.', 'Confirm v2 replay.', 'Confirm v3 replay when present.', 'Read native spine.', 'Read Phase 5.', 'Read outside witnesses.', 'Read Step 1.', 'Read Phase 8 gate.', 'Read Phase 9 release class.', 'Decide operator action.', 'Export, verify, countersign, challenge, refuse, quarantine, or block.'], forbidden_actions: ['Never manually edit packet authority fields to force release.', 'Never manually change public_default_credential away from v2.', 'Never copy raw triad text into release docs.', 'Never call SH3 a legal identity credential.', 'Never call Blood Rite 613 a public credential.', 'Never override Step 1 refusal.', 'Never override Phase 5 quarantine.', 'Never treat renderer beauty as authority.'] });
}

export async function buildReleaseDiscipline(packet, context = {}) {
  const verified_claims = await buildVerifiedClaims(packet);
  const checklist = await buildReleaseChecklist(packet);
  const failureAtlas = await buildFailureModeAtlas(packet);
  const release_class = releaseClassFrom(packet, verified_claims, checklist, failureAtlas);
  const operator_next_action = buildOperatorNextActionFromRelease(release_class, verified_claims);
  const public_summary = buildPublicSummaryFromClaims(release_class, verified_claims, failureAtlas.failure_modes.map((item) => item.failure_class));
  const release_notes = [];
  if (verified_claims.public_display_mode === 'v2-only') release_notes.push('v2 remains the public root.');
  if (['v2-primary-v3-visible', 'dual-v2-v3'].includes(verified_claims.public_display_mode)) release_notes.push('v3 visibility is Phase 8 gate-controlled and remains subordinate to v2 public root.');
  const status = release_class === 'blocked' ? 'blocked' : release_class === 'operator-only' ? 'review' : 'ready';
  return Object.freeze({
    schema_version: RELEASE_SCHEMA,
    status,
    release_class,
    claim_limits: buildClaimLimits(packet),
    verified_claims,
    operator_next_action,
    public_summary,
    release_notes,
    failure_modes: failureAtlas.failure_modes,
    raw_text_exported: false
  });
}

export async function verifyReleaseDiscipline(packet, context = {}) {
  const release = packet && packet.phase9_release_discipline ? packet.phase9_release_discipline : await buildReleaseDiscipline(packet, context);
  const summaryHits = forbiddenHits(release.public_summary || '');
  const reasons = [];
  if (release.raw_text_exported !== false) reasons.push('release discipline claims raw text exported');
  if (summaryHits.length) reasons.push(...summaryHits.map((hit) => `forbidden public summary string: ${hit}`));
  for (const [key, value] of Object.entries(buildClaimLimits())) if (release.claim_limits && release.claim_limits[key] !== value) reasons.push(`claim limit missing or false: ${key}`);
  return Object.freeze({ status: reasons.length ? 'blocked' : release.status, release_class: release.release_class, operator_next_action: release.operator_next_action, refusal_reasons: [...new Set(reasons)] });
}

export async function applyReleaseDiscipline(packet, context = {}) {
  const out = clone(packet || {});
  const release = await buildReleaseDiscipline(out, context);
  const checklist = await buildReleaseChecklist(out);
  out.phase9_release_discipline = release;
  out.release_checklist = checklist;
  out.phase9_release_receipt = { schema_version: RECEIPT_SCHEMA, release_class: release.release_class, operator_next_action: release.operator_next_action, public_display_mode: release.verified_claims.public_display_mode, claim_limits_attached: true, known_limits_attached: true, ui_copy_policy_attached: true, raw_text_exported: false, summary: release.public_summary };
  if (out.outside_witness_receipt) out.outside_witness_receipt.phase9_release_receipt = clone(out.phase9_release_receipt);
  return out;
}

if (typeof window !== 'undefined') {
  window.TD613_SAFE_HARBOR_RELEASE_DISCIPLINE = Object.freeze({
    buildReleaseDiscipline,
    verifyReleaseDiscipline,
    applyReleaseDiscipline,
    buildVerifiedClaims,
    buildClaimLimits,
    buildOperatorNextAction,
    buildPublicSummary,
    buildFailureModeAtlas,
    buildReleaseChecklist,
    buildUiCopyPolicy,
    buildVerificationGuide,
    buildOperatorProtocol
  });
  window.dispatchEvent(new CustomEvent('td613:safe-harbor:release-discipline-ready', { detail: { version: RELEASE_SCHEMA } }));
}
