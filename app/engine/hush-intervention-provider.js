import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, text } from './aperture-v31-core.js';
import {
  PROVIDER_PACKET_DOMAIN,
  compileProviderPacket,
  verifyProviderPacket
} from './ash-keep-provider.js';
import { HUSH_INTERVENTION_DOMAINS } from './hush-intervention-common.js';
import { verifyHushInterventionEnsemble } from './hush-intervention-ensemble.js';

function withoutDigest(value) {
  const output = clone(value);
  delete output.packet_digest;
  return output;
}

export async function compileHushInterventionProviderPacket(input = {}, options = {}) {
  if (input.operatorProviderDraftGesture !== true) {
    throw new Error('Hush intervention provider use requires an explicit provider-draft gesture.');
  }
  const ensemble = input.ensemble;
  if (!(await verifyHushInterventionEnsemble(ensemble, options))) {
    throw new Error('Provider Packet requires an untampered Hush intervention ensemble.');
  }
  const sourceText = text(input.sourceText, 'Provider packet text');
  const sourceDigest = await canonicalDigest(
    HUSH_INTERVENTION_DOMAINS.source,
    { source_text: sourceText },
    options
  );
  if (sourceDigest !== ensemble.source_text_digest) {
    throw new Error('Provider packet source is bound to a different Hush intervention ensemble.');
  }
  const base = await compileProviderPacket({
    ...input,
    sourceText,
    screenReviewed: true,
    operatorConfirmed: true
  }, options);
  const packet = {
    ...clone(base),
    intervention_ensemble_reference: ensemble.ensemble_id,
    intervention_ensemble_digest: ensemble.ensemble_digest,
    intervention_vocabulary_version: ensemble.vocabulary_version,
    intervention_authority_context_reference: ensemble.authority_context_reference,
    intervention_authority_context_digest: ensemble.authority_context_digest,
    intervention_rebuild_receipt_reference: ensemble.rebuild_receipt_reference,
    intervention_rebuild_receipt_digest: ensemble.rebuild_receipt_digest,
    intervention_candidate_return_posture: 'UNKEPT_REQUIRES_LOCAL_REBUILD_REVIEW_RELEASE',
    provider_draft_gesture_observed: true,
    packet_digest: null
  };
  packet.packet_digest = await canonicalDigest(PROVIDER_PACKET_DOMAIN, withoutDigest(packet), options);
  return freeze(packet);
}

export async function verifyHushInterventionProviderPacket(packet, options = {}) {
  return Boolean(
    await verifyProviderPacket(packet, options)
    && packet?.provider_draft_gesture_observed === true
    && packet?.intervention_candidate_return_posture === 'UNKEPT_REQUIRES_LOCAL_REBUILD_REVIEW_RELEASE'
    && packet?.complete_case_map_present === false
    && packet?.room_keys_present === false
    && packet?.route_memory_present === false
    && packet?.private_alias_table_present === false
    && packet?.attachment_present === false
    && packet?.recipient_transport === false
    && packet?.server_persistence_requested === false
  );
}
