import { canonicalDigest } from './ash/canonical-json.js';
import { computeRelationDigest, RELATION_ENVELOPE_SCHEMA } from '../engine/phase5-relation-envelope.js';

export const MARROWLINE_RELATION_CARRIER_SCHEMA = 'td613.marrowline.relation-carrier/v0.1';
const CARRIER_DOMAIN = 'TD613:PHASE5:MARROWLINE-CARRIER:v1';
function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function subject(packet) { const out = clone(packet); delete out.carrier_digest; return out; }
export async function computeMarrowlineCarrierDigest(packet, options = {}) {
  return canonicalDigest(CARRIER_DOMAIN, subject(packet), options);
}
export function createMarrowlineRelationCarrier(envelope, { carrierId = null, createdAt = null } = {}) {
  if (!envelope || envelope.schema !== RELATION_ENVELOPE_SCHEMA) throw new TypeError('Marrowline carrier requires a Relation Envelope.');
  const packet = {
    schema: MARROWLINE_RELATION_CARRIER_SCHEMA,
    carrier_id: carrierId || `marrel_${envelope.relation_id.slice(4)}`,
    relation_id: envelope.relation_id,
    relation_digest: envelope.relation_digest,
    created_at: createdAt || new Date().toISOString(),
    time_posture: 'local-clock-not-trusted-time',
    envelope: clone(envelope),
    marrowline_created_relation: false,
    marrowline_confirmed_relation: false,
    marrowline_holds_key: false,
    marrowline_withdrawal_authority: false,
    marrowline_supersession_authority: false,
    closure_authority: false,
    network_required: false,
    server_persistence: false,
    seal: '⟐'
  };
  return packet;
}
export async function sealMarrowlineRelationCarrier(packet, options = {}) {
  const sealed = clone(packet);
  sealed.carrier_digest = await computeMarrowlineCarrierDigest(sealed, options);
  return Object.freeze(sealed);
}
export async function inspectMarrowlineRelationCarrier(packet, options = {}) {
  const reasons = [];
  if (!packet || packet.schema !== MARROWLINE_RELATION_CARRIER_SCHEMA) reasons.push('unsupported_carrier_schema');
  if (packet?.envelope?.schema !== RELATION_ENVELOPE_SCHEMA) reasons.push('unsupported_relation_envelope');
  if (packet?.relation_id !== packet?.envelope?.relation_id) reasons.push('relation_id_mismatch');
  if (packet?.relation_digest !== packet?.envelope?.relation_digest) reasons.push('declared_relation_digest_mismatch');
  if (packet?.envelope) {
    const expected = await computeRelationDigest(packet.envelope, options);
    if (expected !== packet.envelope.relation_digest) reasons.push('envelope_mutated');
  }
  for (const field of [
    'marrowline_created_relation', 'marrowline_confirmed_relation', 'marrowline_holds_key',
    'marrowline_withdrawal_authority', 'marrowline_supersession_authority', 'closure_authority',
    'network_required', 'server_persistence'
  ]) if (packet?.[field] !== false) reasons.push(`${field}_must_remain_false`);
  if (packet?.carrier_digest) {
    const expectedCarrier = await computeMarrowlineCarrierDigest(packet, options);
    if (expectedCarrier !== packet.carrier_digest) reasons.push('carrier_digest_mismatch');
  }
  return Object.freeze({
    schema: 'td613.marrowline.relation-carrier-inspection/v0.1',
    carrier_id: packet?.carrier_id || null,
    relation_id: packet?.relation_id || null,
    outcome: reasons.length ? 'HOLD_CARRIER_MUTATION' : 'CARRIER_INTEGRITY_PRESERVED',
    reasons: Object.freeze(reasons),
    marrowline_confirmation_authority: false,
    key_access: false,
    closure_authority: false,
    network_called: false,
    storage_mutated: false,
    seal: '⟐'
  });
}
