import { CANONICAL_JSON_PROFILE, canonicalBytes, canonicalDigest, canonicalJson } from '../dome-world/ash/canonical-json.js';
import { TD613_NAMESPACE_SCALAR, TD613_NAMESPACE_UTF16, WRITERLY_LANE, ZWNJ } from '../dome-world/data/flowcore-glyph-semantics-v01.js';
import { PEDAGOGUE_RECEIPT_SCHEMA, RECEIPT_DOMAIN, SEED_DOMAIN } from './flowcore-pedagogue-law.js';
import { clone, deterministic, deterministicId, freeze, object, strings } from './flowcore-pedagogue-utils.js';
import { validateScene, validateSequence, validateTransition } from './flowcore-pedagogue-validators.js';

function receiptSubject(receipt) { const subject = clone(receipt); delete subject.receipt_digest; return subject; }

export async function compilePedagogueReceipt(scene, transitions = [], options = {}) {
  validateScene(scene);
  if (!Array.isArray(transitions) || !transitions.length) throw new Error('Receipt requires transitions.');
  transitions.forEach(validateTransition);
  if (transitions.some(item => item.scene_reference !== scene.scene_id)) throw new Error('Transition scene mismatch.');
  validateSequence(transitions);
  const d = deterministic(options);
  const transfer_encounters = Array.isArray(options.transferEncounters) ? options.transferEncounters.map(clone) : [];
  const seedDigest = await canonicalDigest(SEED_DOMAIN, { id_seed: d.idSeed }, d);
  const receipt = {
    schema: PEDAGOGUE_RECEIPT_SCHEMA,
    receipt_id: await deterministicId('flowped_receipt_', 'TD613:FLOWCORE:PEDAGOGUE-RECEIPT-ID:v1', {
      scene_reference: scene.scene_id,
      transition_references: transitions.map(item => item.transition_id),
      transfer_references: transfer_encounters.map(item => item.transfer_id)
    }, d),
    created_at: d.frozenClock,
    scene: clone(scene),
    transitions: transitions.map(clone),
    transfer_encounters,
    determinism: {
      serializer_profile: CANONICAL_JSON_PROFILE,
      frozen_clock: d.frozenClock,
      id_seed_digest: seedDigest,
      unicode_normalization: 'NONE',
      protected_sequences: {
        namespace_scalar: TD613_NAMESPACE_SCALAR,
        namespace_utf16_pair: TD613_NAMESPACE_UTF16,
        writerly_lane: WRITERLY_LANE,
        zwnj: ZWNJ
      }
    },
    station_ownership: strings([scene.station_owner, ...scene.provenance.station_owners, ...scene.available_affordances.map(item => item.authorized_by_station)], 'station_ownership'),
    authority: {
      receipts_may_cross: true,
      authority_may_cross: false,
      automatic_ash_action: false,
      release_authorized: false,
      human_closure_required: true
    },
    claim_ceiling: clone(scene.claim_ceiling),
    closure: { required: true, status: 'OPEN', closed_by: null },
    receipt_digest: null,
    seal: '⟐'
  };
  receipt.receipt_digest = await canonicalDigest(RECEIPT_DOMAIN, receiptSubject(receipt), d);
  canonicalJson(receipt);
  return freeze(receipt);
}

export async function verifyPedagogueReceipt(receipt, options = {}) {
  try {
    object(receipt, 'receipt');
    if (receipt.schema !== PEDAGOGUE_RECEIPT_SCHEMA) return freeze({ valid: false, reason: 'schema' });
    validateScene(receipt.scene);
    receipt.transitions.forEach(validateTransition);
    validateSequence(receipt.transitions);
    if (receipt.closure?.status !== 'OPEN' || receipt.authority?.human_closure_required !== true) return freeze({ valid: false, reason: 'closure-authority' });
    const expected_receipt_digest = await canonicalDigest(RECEIPT_DOMAIN, receiptSubject(receipt), options);
    return freeze({ valid: expected_receipt_digest === receipt.receipt_digest, expected_receipt_digest, receipt_digest: receipt.receipt_digest, serializer_profile: receipt.determinism?.serializer_profile, unicode_normalization: receipt.determinism?.unicode_normalization });
  } catch (error) {
    return freeze({ valid: false, reason: error.message });
  }
}

export function serializePedagogueReceipt(receipt, options = {}) {
  return freeze({ canonical_json: canonicalJson(receipt), canonical_bytes: canonicalBytes(receipt, options) });
}
