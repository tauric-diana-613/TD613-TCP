import { verifyCaseMap, verifyRouteMemory } from './ash-keep-core.js';
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
import {
  MATCHED_BENIGN_CONTROL_BANK_SCHEMA,
  verifyMatchedBenignControlBank
} from './ash-keep-benign-controls.js';

const FREE_CALIBRATION_KEYS = Object.freeze([
  'calibration',
  'preregisteredFixture',
  'benignControl',
  'heldOut',
  'sourceDriftCheck',
  'alternativeReader',
  'exactThresholds'
]);

export function uniqueSorted(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))].sort();
}

export function sameStrings(left = [], right = []) {
  const a = uniqueSorted(left);
  const b = uniqueSorted(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function rejectFreeCalibrationClaims(input = {}) {
  const present = FREE_CALIBRATION_KEYS.filter(key => Object.hasOwn(input, key));
  if (present.length) {
    throw new Error(`Choir calibration binding rejects free calibration claims: ${present.join(', ')}.`);
  }
}

function receiptReferences(input = {}) {
  return {
    moire_assay_digests: uniqueSorted((input.moireAssays || []).map(value => value?.assay_digest)),
    reader_provenance_digests: uniqueSorted((input.provenances || []).map(value => value?.provenance_digest)),
    disagreement_ledger_digest: input.disagreementLedger?.ledger_digest || null,
    matched_control_bank_digest: input.controlBank?.bank_digest || null
  };
}

function readerSets(input = {}) {
  const assays = uniqueSorted((input.moireAssays || []).map(value => value?.reader?.reader_id));
  const provenances = uniqueSorted((input.provenances || []).map(value => value?.reader?.reader_id));
  const disagreement = uniqueSorted((input.disagreementLedger?.entries || []).map(value => value?.reader_id));
  const controlBank = uniqueSorted(input.controlBank?.reader_ids || []);
  return { assays, provenances, disagreement, control_bank: controlBank };
}

export async function inspectChoirCalibrationReceiptSet(input = {}, options = {}) {
  const caseMap = input.caseMap || null;
  const routeMemory = input.routeMemory || null;
  const moireAssays = input.moireAssays || [];
  const provenances = input.provenances || [];
  const disagreementLedger = input.disagreementLedger || null;
  const controlBank = input.controlBank || null;
  const activeCaseId = input.activeCaseId || caseMap?.case_id || null;
  const activeCaseMapDigest = input.activeCaseMapDigest || caseMap?.case_map_digest || null;
  const activeRouteMemoryDigest = input.activeRouteMemoryDigest || routeMemory?.route_memory_digest || null;

  const verified = {
    case_map: Boolean(caseMap && await verifyCaseMap(caseMap, options)),
    route_memory: Boolean(routeMemory && await verifyRouteMemory(routeMemory, options)),
    moire_assays: moireAssays.length >= 2 && (await Promise.all(moireAssays.map(async value => Boolean(
      value
      && value.schema === MOIRE_REBUILD_ASSAY_SCHEMA
      && await verifyMoireRebuildAssay(value, options)
    )))).every(Boolean),
    reader_provenances: provenances.length >= 2 && (await Promise.all(provenances.map(async value => Boolean(
      value
      && value.schema === READER_RESULT_PROVENANCE_SCHEMA
      && await verifyReaderResultProvenance(value, options)
    )))).every(Boolean),
    disagreement_ledger: Boolean(
      disagreementLedger
      && disagreementLedger.schema === READER_DISAGREEMENT_LEDGER_SCHEMA
      && await verifyReaderDisagreementLedger(disagreementLedger, options)
    ),
    matched_control_bank: Boolean(
      controlBank
      && controlBank.schema === MATCHED_BENIGN_CONTROL_BANK_SCHEMA
      && await verifyMatchedBenignControlBank(controlBank, options)
    )
  };

  const references = receiptReferences(input);
  const targetReferences = controlBank?.target?.receipt_references || {};
  const readers = readerSets(input);
  const matchedContext = disagreementLedger?.matched_context || {};
  const target = controlBank?.target || {};

  const checks = {
    verified_receipts: Object.values(verified).every(Boolean),
    current_case_binding: Boolean(
      activeCaseId
      && activeCaseMapDigest
      && activeRouteMemoryDigest
      && caseMap?.case_id === activeCaseId
      && caseMap?.case_map_digest === activeCaseMapDigest
      && routeMemory?.case_id === activeCaseId
      && routeMemory?.route_memory_digest === activeRouteMemoryDigest
    ),
    receipt_case_binding: Boolean(
      moireAssays.every(value => value.case_id === activeCaseId && value.case_map_digest === activeCaseMapDigest && value.route_memory_reference === activeRouteMemoryDigest)
      && provenances.every(value => value.case_id === activeCaseId && value.case_map_digest === activeCaseMapDigest && value.route_memory_digest === activeRouteMemoryDigest)
      && matchedContext.case_id === activeCaseId
      && matchedContext.case_map_digest === activeCaseMapDigest
      && matchedContext.route_memory_digest === activeRouteMemoryDigest
      && target.case_id === activeCaseId
      && target.case_map_digest === activeCaseMapDigest
      && target.route_memory_digest === activeRouteMemoryDigest
    ),
    exact_moire_references: sameStrings(references.moire_assay_digests, targetReferences.moire_assay_digests || []),
    exact_provenance_references: sameStrings(references.reader_provenance_digests, targetReferences.reader_provenance_digests || []),
    exact_disagreement_reference: Boolean(
      references.disagreement_ledger_digest
      && references.disagreement_ledger_digest === targetReferences.disagreement_ledger_digest
    ),
    reader_set_binding: sameStrings(readers.assays, readers.provenances)
      && sameStrings(readers.assays, readers.disagreement)
      && sameStrings(readers.assays, readers.control_bank),
    disagreement_provenance_binding: sameStrings(
      references.reader_provenance_digests,
      (disagreementLedger?.entries || []).map(value => value.provenance_digest)
    ),
    source_drift_held: moireAssays.length >= 2 && moireAssays.every(value => value.source_drift_state === 'SOURCE_HELD'),
    observations_complete: moireAssays.length >= 2 && moireAssays.every(value => (
      value.unresolved_pair_count === 0
      && value.calibration?.all_required_observations_observed === true
    )),
    provenances_bound: provenances.length >= 2 && provenances.every(value => value.provenance_state === 'PROVENANCE_BOUND'),
    disagreement_observed: disagreementLedger?.comparison_state === 'OBSERVED_READER_DISAGREEMENT'
      && disagreementLedger?.unresolved_result_count === 0,
    control_bank_eligible: Boolean(
      controlBank?.calibration_eligible === true
      && ['CALIBRATED_MATCHED_CONTROL_BANK', 'PARTIAL_MATCHED_CONTROL_BANK'].includes(controlBank?.bank_state)
    )
  };

  const exactReferences = checks.exact_moire_references
    && checks.exact_provenance_references
    && checks.exact_disagreement_reference
    && checks.reader_set_binding
    && checks.disagreement_provenance_binding;
  const evidenceComplete = checks.observations_complete
    && checks.provenances_bound
    && checks.disagreement_observed
    && checks.control_bank_eligible;

  let state = 'CALIBRATION_ELIGIBLE';
  if (!checks.verified_receipts) state = 'TAMPER_HOLD';
  else if (!checks.current_case_binding || !checks.receipt_case_binding) state = 'STALE_CASE_HOLD';
  else if (!checks.source_drift_held) state = 'SOURCE_DRIFT_HOLD';
  else if (!exactReferences) state = 'RECEIPT_REFERENCE_HOLD';
  else if (!evidenceComplete) state = 'NOT_ENOUGH_TEST_DATA';

  const failedChecks = Object.entries(checks)
    .filter(([, value]) => value !== true)
    .map(([key]) => key)
    .sort();

  return {
    controlBank,
    activeCaseId,
    activeCaseMapDigest,
    activeRouteMemoryDigest,
    verified,
    references,
    readers,
    checks,
    state,
    failedChecks
  };
}
