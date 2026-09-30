import { digest, freeze, randomId, recordDigest, text, verifyRecord } from './aperture-v31-core.js';

export const CONTROLLED_SOURCE_SCHEMA = 'td613.aperture.controlled-source/v0.1';
export const CONTROLLED_SOURCE_DOMAIN = 'TD613:V31:CONTROLLED-SOURCE:v1';

export async function compileControlledSource(input, options = {}) {
  const source = {
    schema: CONTROLLED_SOURCE_SCHEMA,
    source_id: input.sourceId || randomId('atsrc_', options.cryptoImpl || globalThis.crypto),
    source_receipt_reference: text(input.sourceReceiptReference, 'Source receipt reference'),
    source_commitment: digest(input.sourceCommitment, 'Source commitment'),
    source_status: input.sourceStatus || 'SUPPLIED',
    invariance_rule: 'exact-commitment-match',
    raw_source_present: false,
    evidence_basis: ['Ash source receipt reference', 'exact source commitment'],
    observations: ['Source invariance is tested by exact commitment comparison.'],
    missingness: [], alternatives: [], open_questions: [], operator_notes: [], closure: { required: true, status: 'OPEN' },
    source_digest: null
  };
  source.source_digest = await recordDigest(CONTROLLED_SOURCE_DOMAIN, source, 'source_digest', options);
  return freeze(source);
}

export function auditSourceInvariance(source, commitments = []) {
  const observed = commitments.map(value => value == null ? null : String(value));
  const unresolved = observed.filter(value => value == null).length;
  const drifted = observed.filter(value => value != null && value !== source.source_commitment).length;
  return freeze({
    schema: 'td613.aperture.source-invariance-audit/v0.1',
    status: drifted ? 'SOURCE_DRIFT_DETECTED' : unresolved ? 'SOURCE_UNVERIFIABLE' : 'SOURCE_HELD',
    checked_count: observed.length,
    unresolved_count: unresolved,
    drifted_count: drifted,
    expected_commitment: source.source_commitment,
    automatic_exclusion: false
  });
}

export const verifyControlledSource = (value, options = {}) => verifyRecord(CONTROLLED_SOURCE_DOMAIN, value, 'source_digest', CONTROLLED_SOURCE_SCHEMA, options);
