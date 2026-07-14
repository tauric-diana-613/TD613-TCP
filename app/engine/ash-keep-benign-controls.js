import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId } from './aperture-v31-core.js';
import {
  MOIRE_REBUILD_ASSAY_SCHEMA,
  verifyMoireRebuildAssay
} from './ash-keep-moire.js';
import {
  READER_RESULT_PROVENANCE_SCHEMA,
  verifyReaderResultProvenance
} from './ash-keep-reader-adapters.js';
import {
  READER_DISAGREEMENT_LEDGER_SCHEMA,
  verifyReaderDisagreementLedger
} from './ash-keep-reader-disagreement.js';

export const MATCHED_BENIGN_CONTROL_BANK_SCHEMA = 'td613.aperture.matched-benign-control-bank/v0.1';
export const MATCHED_BENIGN_CONTROL_REPLAY_SCHEMA = 'td613.aperture.matched-benign-control-bank-replay/v0.1';

const BANK_DOMAIN = 'TD613:ASH-KEEP:MATCHED-BENIGN-CONTROL-BANK:v1';
const FIXTURE_DOMAIN = 'TD613:ASH-KEEP:MATCHED-BENIGN-CONTROL-FIXTURE:v1';
const REPLAY_DOMAIN = 'TD613:ASH-KEEP:MATCHED-BENIGN-CONTROL-REPLAY:v1';
const SHA256 = /^sha256:[0-9a-f]{64}$/;
const OPAQUE_ID = /^[a-z][a-z0-9_]{2,127}$/;
const SET_COMPONENTS = Object.freeze([
  'node_ids',
  'relationship_ids',
  'room_bridge_ids',
  'hypothesis_ids',
  'next_action_ids'
]);
const NUMERIC_COMPONENTS = Object.freeze([
  'chronology_millipoints',
  'source_style_linkage_millipoints'
]);
const MATCH_DIMENSIONS = Object.freeze([
  'topic',
  'genre',
  'template',
  'register',
  'approximate_length_band',
  'source_conditions'
]);
const RAW_CONTENT_KEYS = new Set([
  'raw_document', 'raw_text', 'text', 'body', 'content', 'document_body', 'reader_input', 'reader_result'
]);

function now(value) {
  return value || new Date().toISOString();
}

function without(value, field) {
  const output = clone(value);
  delete output[field];
  return output;
}

function uniqueSorted(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))].sort();
}

function requireDigest(value, label) {
  const output = String(value || '');
  if (!SHA256.test(output)) throw new Error(`${label} must be SHA-256.`);
  return output;
}

function requireOpaqueId(value, label) {
  const output = String(value || '').trim();
  if (!OPAQUE_ID.test(output)) throw new Error(`${label} must be an opaque identifier.`);
  return output;
}

function requireText(value, label) {
  const output = String(value || '').trim();
  if (!output) throw new Error(`${label} is required.`);
  return output;
}

function rejectRawContent(value, label) {
  for (const key of Object.keys(value || {})) {
    if (RAW_CONTENT_KEYS.has(key)) throw new Error(`${label} must not carry raw document or Reader content (${key}).`);
  }
}

function sameStrings(left = [], right = []) {
  const a = uniqueSorted(left);
  const b = uniqueSorted(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function median(values = []) {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function positionFor(target, values = []) {
  if (!values.length) return 'UNRESOLVED';
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (target < minimum) return 'BELOW_CONTROL_RANGE';
  if (target > maximum) return 'ABOVE_CONTROL_RANGE';
  return 'WITHIN_CONTROL_RANGE';
}

function normalizeMatchProfile(value = {}, label) {
  return {
    topic: requireText(value.topic, `${label} topic`).toLowerCase(),
    genre: requireText(value.genre, `${label} genre`).toLowerCase(),
    template: requireText(value.template, `${label} template`).toLowerCase(),
    register: requireText(value.register, `${label} register`).toLowerCase(),
    approximate_length_band: requireText(value.approximate_length_band, `${label} approximate length band`).toLowerCase(),
    source_conditions: uniqueSorted(value.source_conditions || []).map(condition => condition.toLowerCase())
  };
}

function matchingFailures(target, control) {
  const failures = [];
  for (const field of MATCH_DIMENSIONS) {
    const matched = field === 'source_conditions'
      ? sameStrings(target[field], control[field])
      : target[field] === control[field];
    if (!matched) failures.push(`MATCH_MISMATCH:${field}`);
  }
  return failures;
}

function receiptReferenceSet(fixture) {
  return {
    moire_assay_digests: fixture.moire_assays.map(assay => assay.assay_digest).sort(),
    reader_provenance_digests: fixture.provenances.map(provenance => provenance.provenance_digest).sort(),
    disagreement_ledger_digest: fixture.disagreement_ledger.ledger_digest
  };
}

async function normalizeFixture(source, expectedClass, index, options = {}) {
  const label = `${expectedClass === 'TARGET' ? 'Target' : 'Control'} fixture ${index}`;
  rejectRawContent(source, label);
  const fixtureId = requireOpaqueId(source?.fixture_id, `${label} ID`);
  const fixtureClass = String(source?.fixture_class || expectedClass).toUpperCase();
  if (fixtureClass !== expectedClass) throw new Error(`${label} must declare fixture class ${expectedClass}.`);
  const documentDigest = requireDigest(source?.document_digest, `${label} document digest`);
  const sourceProvenanceDigest = requireDigest(source?.source_provenance_digest, `${label} source provenance digest`);
  const inputContractDigest = requireDigest(source?.input_contract_digest, `${label} input contract digest`);
  const matchProfile = normalizeMatchProfile(source?.match_profile, label);
  const disagreementLedger = source?.disagreement_ledger;
  if (!disagreementLedger
    || disagreementLedger.schema !== READER_DISAGREEMENT_LEDGER_SCHEMA
    || !await verifyReaderDisagreementLedger(disagreementLedger, options)) {
    throw new Error(`${label} requires a verified Reader Disagreement Ledger.`);
  }
  const moireAssays = source?.moire_assays || [];
  if (moireAssays.length < 2) throw new Error(`${label} requires at least two verified Moiré assays.`);
  for (const assay of moireAssays) {
    if (!assay || assay.schema !== MOIRE_REBUILD_ASSAY_SCHEMA || !await verifyMoireRebuildAssay(assay, options)) {
      throw new Error(`${label} contains an unverified Moiré assay.`);
    }
  }
  const provenances = source?.provenances || [];
  if (provenances.length < 2) throw new Error(`${label} requires at least two verified Reader-result provenance receipts.`);
  for (const provenance of provenances) {
    if (!provenance
      || provenance.schema !== READER_RESULT_PROVENANCE_SCHEMA
      || !await verifyReaderResultProvenance(provenance, options)) {
      throw new Error(`${label} contains an unverified Reader-result provenance receipt.`);
    }
  }

  const readerIds = disagreementLedger.entries.map(entry => entry.reader_id).sort();
  const provenanceReaderIds = provenances.map(provenance => provenance.reader.reader_id).sort();
  const assayReaderIds = moireAssays.map(assay => assay.reader.reader_id).sort();
  if (!sameStrings(readerIds, provenanceReaderIds)) throw new Error(`${label} provenance Reader set does not match disagreement Reader set.`);
  if (!sameStrings(readerIds, assayReaderIds)) throw new Error(`${label} Moiré Reader set does not match disagreement Reader set.`);
  if (new Set(provenanceReaderIds).size !== provenanceReaderIds.length) throw new Error(`${label} provenance Reader IDs must be unique.`);
  if (new Set(assayReaderIds).size !== assayReaderIds.length) throw new Error(`${label} Moiré Reader IDs must be unique.`);

  const disagreementProvenanceDigests = disagreementLedger.entries.map(entry => entry.provenance_digest).sort();
  const provenanceDigests = provenances.map(provenance => provenance.provenance_digest).sort();
  if (!sameStrings(disagreementProvenanceDigests, provenanceDigests)) {
    throw new Error(`${label} provenance receipt set does not match disagreement ledger references.`);
  }

  for (const provenance of provenances) {
    if (provenance.case_id !== disagreementLedger.matched_context.case_id
      || provenance.case_map_digest !== disagreementLedger.matched_context.case_map_digest
      || provenance.route_memory_digest !== disagreementLedger.matched_context.route_memory_digest
      || provenance.reader_input_digest !== disagreementLedger.matched_context.reader_input_digest
      || provenance.result_schema !== disagreementLedger.matched_context.result_schema
      || provenance.registry_reference !== disagreementLedger.registry_reference) {
      throw new Error(`${label} provenance context does not match disagreement ledger context.`);
    }
  }
  for (const assay of moireAssays) {
    if (assay.case_id !== disagreementLedger.matched_context.case_id
      || assay.case_map_digest !== disagreementLedger.matched_context.case_map_digest
      || assay.route_memory_reference !== disagreementLedger.matched_context.route_memory_digest) {
      throw new Error(`${label} Moiré context does not match disagreement ledger context.`);
    }
  }

  const receiptReferences = receiptReferenceSet({
    moire_assays: moireAssays,
    provenances,
    disagreement_ledger: disagreementLedger
  });
  const receiptBundleDigest = await canonicalDigest(FIXTURE_DOMAIN, {
    fixture_id: fixtureId,
    document_digest: documentDigest,
    source_provenance_digest: sourceProvenanceDigest,
    input_contract_digest: inputContractDigest,
    reader_ids: readerIds,
    registry_reference: disagreementLedger.registry_reference,
    result_schema: disagreementLedger.matched_context.result_schema,
    receipt_references: receiptReferences
  }, options);

  const provenanceBound = provenances.every(provenance => provenance.provenance_state === 'PROVENANCE_BOUND');
  const resultsObserved = disagreementLedger.comparison_state === 'OBSERVED_READER_DISAGREEMENT'
    && disagreementLedger.unresolved_result_count === 0;
  const moireObserved = moireAssays.every(assay => assay.unresolved_pair_count === 0
    && assay.calibration?.all_required_observations_observed === true);

  return {
    fixture_id: fixtureId,
    fixture_class: fixtureClass,
    document_digest: documentDigest,
    source_provenance_digest: sourceProvenanceDigest,
    source_status: String(source?.source_status || 'SUPPLIED').toUpperCase(),
    input_contract_digest: inputContractDigest,
    match_profile: matchProfile,
    reader_ids: readerIds,
    registry_reference: disagreementLedger.registry_reference,
    result_schema: disagreementLedger.matched_context.result_schema,
    case_id: disagreementLedger.matched_context.case_id,
    case_map_digest: disagreementLedger.matched_context.case_map_digest,
    route_memory_digest: disagreementLedger.matched_context.route_memory_digest,
    reader_input_digest: disagreementLedger.matched_context.reader_input_digest,
    receipt_references: receiptReferences,
    receipt_bundle_digest: receiptBundleDigest,
    disagreement_state: disagreementLedger.comparison_state,
    provenance_bound: provenanceBound,
    reader_results_observed: resultsObserved,
    moire_observations_observed: moireObserved,
    residual_confounds: uniqueSorted(source?.residual_confounds || []),
    operator_notes: uniqueSorted(source?.operator_notes || []),
    _disagreement_ledger: disagreementLedger
  };
}

function componentValue(fixture, field, kind) {
  const ledger = fixture._disagreement_ledger;
  if (kind === 'set') return ledger.set_components[field].disagreement_ids.length;
  if (kind === 'numeric') return ledger.numeric_components[field].spread;
  if (kind === 'pairwise') return ledger.pairwise.filter(row => row.comparison_state === 'OBSERVED' && row.disagreement_detected).length;
  return 0;
}

function comparisonRow(target, controls, field, kind) {
  const targetValue = componentValue(target, field, kind);
  const controlValues = controls.map(control => ({
    fixture_id: control.fixture_id,
    value: componentValue(control, field, kind)
  }));
  const values = controlValues.map(row => row.value);
  const minimum = values.length ? Math.min(...values) : null;
  const maximum = values.length ? Math.max(...values) : null;
  return {
    target_value: targetValue,
    control_values: controlValues,
    eligible_control_count: controls.length,
    minimum,
    maximum,
    median: median(values),
    target_position: positionFor(targetValue, values),
    controls_below_target: values.filter(value => value < targetValue).length,
    controls_at_or_above_target: values.filter(value => value >= targetValue).length
  };
}

function publicFixture(fixture, additions = {}) {
  const output = { ...fixture, ...additions };
  delete output._disagreement_ledger;
  return output;
}

export async function compileMatchedBenignControlBank(input = {}, options = {}) {
  const minimumEligibleControls = Math.max(3, Number.isFinite(Number(input.minimumEligibleControls))
    ? Math.trunc(Number(input.minimumEligibleControls))
    : 3);
  const target = await normalizeFixture(input.target, 'TARGET', 0, options);
  const sourceControls = input.controls || [];
  if (sourceControls.length < 3) throw new Error('Matched benign control bank requires at least three benign controls.');
  const controls = [];
  for (let index = 0; index < sourceControls.length; index += 1) {
    controls.push(await normalizeFixture(sourceControls[index], 'BENIGN_CONTROL', index, options));
  }
  if (new Set([target.fixture_id, ...controls.map(control => control.fixture_id)]).size !== controls.length + 1) {
    throw new Error('Matched benign control fixture IDs must be unique.');
  }

  const publicControls = [];
  const eligibleControls = [];
  for (const control of controls) {
    const failures = matchingFailures(target.match_profile, control.match_profile);
    if (control.input_contract_digest !== target.input_contract_digest) failures.push('MATCH_MISMATCH:input_contract_digest');
    if (!sameStrings(control.reader_ids, target.reader_ids)) failures.push('MATCH_MISMATCH:reader_set');
    if (control.registry_reference !== target.registry_reference) failures.push('MATCH_MISMATCH:registry_reference');
    if (control.result_schema !== target.result_schema) failures.push('MATCH_MISMATCH:result_schema');
    if (!control.provenance_bound) failures.push('UNUSABLE:provenance_incomplete');
    if (!control.reader_results_observed) failures.push('UNUSABLE:reader_results_unresolved');
    if (!control.moire_observations_observed) failures.push('UNUSABLE:moire_observations_unresolved');
    const eligible = failures.length === 0;
    if (eligible) eligibleControls.push(control);
    publicControls.push(publicFixture(control, {
      matching_failures: uniqueSorted(failures),
      control_eligible: eligible
    }));
  }

  const targetFailures = [];
  if (!target.provenance_bound) targetFailures.push('TARGET_UNUSABLE:provenance_incomplete');
  if (!target.reader_results_observed) targetFailures.push('TARGET_UNUSABLE:reader_results_unresolved');
  if (!target.moire_observations_observed) targetFailures.push('TARGET_UNUSABLE:moire_observations_unresolved');
  if (targetFailures.length) throw new Error(`Matched benign control target is not admissible: ${targetFailures.join(', ')}`);

  const calibrationEligible = eligibleControls.length >= minimumEligibleControls;
  const bankState = calibrationEligible
    ? (eligibleControls.length === controls.length ? 'CALIBRATED_MATCHED_CONTROL_BANK' : 'PARTIAL_MATCHED_CONTROL_BANK')
    : 'CONTROL_BANK_HELD';
  const setComponentComparisons = Object.fromEntries(SET_COMPONENTS.map(field => [
    field,
    comparisonRow(target, eligibleControls, field, 'set')
  ]));
  const numericComponentComparisons = Object.fromEntries(NUMERIC_COMPONENTS.map(field => [
    field,
    comparisonRow(target, eligibleControls, field, 'numeric')
  ]));
  const pairwiseDisagreementComparison = comparisonRow(target, eligibleControls, 'pairwise_disagreement_count', 'pairwise');
  const excludedControls = publicControls.filter(control => !control.control_eligible);
  const residualConfounds = uniqueSorted([
    ...(input.residualConfounds || []),
    ...target.residual_confounds,
    ...publicControls.flatMap(control => control.residual_confounds),
    ...excludedControls.flatMap(control => control.matching_failures.map(failure => `${control.fixture_id}:${failure}`))
  ]);

  const record = {
    schema: MATCHED_BENIGN_CONTROL_BANK_SCHEMA,
    version: 'v0.1',
    bank_id: input.bankId || randomId('controlbank_', options.cryptoImpl || globalThis.crypto),
    created_at: now(input.createdAt),
    mode: 'MATCHED_BENIGN_ADJACENT_DOCUMENT_CONTROLS',
    bank_state: bankState,
    calibration_eligible: calibrationEligible,
    minimum_eligible_controls: minimumEligibleControls,
    eligible_control_count: eligibleControls.length,
    excluded_control_count: controls.length - eligibleControls.length,
    reader_ids: target.reader_ids,
    registry_reference: target.registry_reference,
    result_schema: target.result_schema,
    input_contract_digest: target.input_contract_digest,
    target: publicFixture(target),
    controls: publicControls.sort((left, right) => left.fixture_id.localeCompare(right.fixture_id)),
    set_component_comparisons: setComponentComparisons,
    numeric_component_comparisons: numericComponentComparisons,
    pairwise_disagreement_comparison: pairwiseDisagreementComparison,
    matching_failures: excludedControls.flatMap(control => control.matching_failures.map(failure => `${control.fixture_id}:${failure}`)).sort(),
    residual_confounds: residualConfounds,
    universal_control_score: null,
    real_surveillance_probability: null,
    raw_document_present: false,
    raw_reader_input_present: false,
    raw_reader_result_present: false,
    readers_executed_by_bank: false,
    provider_call_performed: false,
    network_called: false,
    storage_mutated: false,
    transport_authorized: false,
    release_authorized: false,
    identity_inference_authorized: false,
    authorship_attribution_authorized: false,
    ownership_inference_authorized: false,
    truth_adjudication_authorized: false,
    prediction_authorized: false,
    automatic_hold: false,
    recommendation_not_command: true,
    source_status: String(input.sourceStatus || 'DERIVED').toUpperCase(),
    evidence_basis: uniqueSorted(input.evidenceBasis || [
      'verified Moiré assay receipts',
      'verified Reader-result provenance receipts',
      'verified Reader Disagreement Ledgers',
      'declared matched-control metadata'
    ]),
    missingness: uniqueSorted([
      ...(input.missingness || []),
      ...(!calibrationEligible ? [`Eligible controls ${eligibleControls.length}/${minimumEligibleControls}`] : [])
    ]),
    alternatives: uniqueSorted(input.alternatives || [
      'ordinary variation among benign adjacent documents',
      'residual topic or register mismatch',
      'Reader-specific extraction thresholds',
      'fixture construction effects',
      'source-provenance incompleteness'
    ]),
    open_questions: uniqueSorted(input.openQuestions || []),
    operator_notes: uniqueSorted(input.operatorNotes || []),
    closure: { required: true, status: String(input.closureStatus || 'OPEN') },
    bank_digest: null
  };
  record.bank_digest = await canonicalDigest(BANK_DOMAIN, without(record, 'bank_digest'), options);
  return freeze(record);
}

export async function verifyMatchedBenignControlBank(value, options = {}) {
  return Boolean(value
    && value.schema === MATCHED_BENIGN_CONTROL_BANK_SCHEMA
    && SHA256.test(String(value.bank_digest || ''))
    && value.bank_digest === await canonicalDigest(BANK_DOMAIN, without(value, 'bank_digest'), options));
}

function replayFixtureReferences(fixture) {
  return {
    fixture_id: fixture.fixture_id,
    receipt_bundle_digest: fixture.receipt_bundle_digest,
    receipt_references: fixture.receipt_references
  };
}

export async function replayMatchedBenignControlBank(value, input = {}, options = {}) {
  const bankVerified = await verifyMatchedBenignControlBank(value, options);
  const suppliedFixtures = [input.target, ...(input.controls || [])].filter(Boolean);
  const fixtureById = new Map();
  let receiptSetVerified = suppliedFixtures.length === 1 + (value?.controls?.length || 0);
  for (let index = 0; index < suppliedFixtures.length; index += 1) {
    const expectedClass = index === 0 ? 'TARGET' : 'BENIGN_CONTROL';
    try {
      const fixture = await normalizeFixture(suppliedFixtures[index], expectedClass, index, options);
      fixtureById.set(fixture.fixture_id, fixture);
    } catch {
      receiptSetVerified = false;
    }
  }
  const expectedFixtures = [value?.target, ...(value?.controls || [])].filter(Boolean);
  const referenceSetVerified = expectedFixtures.every(expected => {
    const supplied = fixtureById.get(expected.fixture_id);
    return supplied
      && supplied.receipt_bundle_digest === expected.receipt_bundle_digest
      && JSON.stringify(replayFixtureReferences(supplied)) === JSON.stringify(replayFixtureReferences(expected));
  });
  const verified = bankVerified && receiptSetVerified && referenceSetVerified;
  const record = {
    schema: MATCHED_BENIGN_CONTROL_REPLAY_SCHEMA,
    version: 'v0.1',
    replay_id: input.replayId || randomId('controlbankreplay_', options.cryptoImpl || globalThis.crypto),
    created_at: now(input.createdAt),
    source_bank_id: value?.bank_id || null,
    source_bank_digest: value?.bank_digest || null,
    status: verified ? 'MATCHED_CONTROL_REPLAY_VERIFIED' : 'MATCHED_CONTROL_REPLAY_HELD',
    bank_digest_verified: bankVerified,
    receipt_set_verified: receiptSetVerified,
    receipt_references_verified: referenceSetVerified,
    control_distribution_recomputed: false,
    raw_documents_restored: false,
    raw_reader_inputs_restored: false,
    raw_reader_results_restored: false,
    readers_reexecuted: false,
    provider_called: false,
    network_called: false,
    storage_mutated: false,
    transport_authorized: false,
    release_authorized: false,
    identity_inference_authorized: false,
    authorship_attribution_authorized: false,
    ownership_inference_authorized: false,
    truth_adjudication_authorized: false,
    prediction_authorized: false,
    automatic_hold: false,
    recommendation_not_command: true,
    observations: verified
      ? ['Matched benign control bank and all referenced receipts verified without Reader re-execution.']
      : ['Matched benign control replay held for bank or receipt-reference repair.'],
    missingness: [],
    alternatives: [],
    open_questions: verified ? [] : ['Which bank or receipt reference changed after sealing?'],
    closure: { required: true, status: 'OPEN' },
    replay_digest: null
  };
  record.replay_digest = await canonicalDigest(REPLAY_DOMAIN, without(record, 'replay_digest'), options);
  return freeze(record);
}

export async function verifyMatchedBenignControlReplay(value, options = {}) {
  return Boolean(value
    && value.schema === MATCHED_BENIGN_CONTROL_REPLAY_SCHEMA
    && SHA256.test(String(value.replay_digest || ''))
    && value.replay_digest === await canonicalDigest(REPLAY_DOMAIN, without(value, 'replay_digest'), options));
}
