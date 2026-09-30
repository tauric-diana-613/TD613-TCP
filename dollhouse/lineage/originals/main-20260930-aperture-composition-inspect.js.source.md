import { authorizeAuthorityAction, verifyAuthorityContext } from './ash-constitutional-convergence.js';
import { verifyChoirCalibrationBinding } from './ash-keep-choir-calibration-binding.js';
import { verifyHushInterventionReceipt } from './hush-intervention-receipt.js';
import { verifyControlledSource } from './aperture-v31-controlled-source.js';
import { verifyDomeExperimentRun } from './aperture-v31-experiment-contract.js';
import { verifyInstrumentEnsemble } from './aperture-v31-instrument-ensemble.js';
import { verifyTomographyReceipt } from './aperture-v31-reconstruction.js';
import { verifySnapshotLattice } from './aperture-v31-snapshot-lattice.js';
import { exactCompositionOrder } from './aperture-composition-common.js';
import { verifyApertureCompositionPlan } from './aperture-composition-plan.js';

export function compositionLayerReferences(input) {
  return {
    plan: { reference: input.plan?.plan_id || null, digest: input.plan?.plan_digest || null },
    authority_context: { reference: input.authorityContext?.receipt_id || null, digest: input.authorityContext?.authority_context_digest || null },
    controlled_source: { reference: input.source?.source_id || null, digest: input.source?.source_digest || null },
    instrument_ensemble: { reference: input.ensemble?.ensemble_id || null, digest: input.ensemble?.ensemble_digest || null },
    snapshot_lattice: { reference: input.lattice?.lattice_id || null, digest: input.lattice?.lattice_digest || null },
    experiment_run: { reference: input.experimentRun?.experiment_id || null, digest: input.experimentRun?.run_digest || null },
    tomography_receipt: { reference: input.tomographyReceipt?.receipt_id || null, digest: input.tomographyReceipt?.receipt_digest || null },
    choir_calibration_binding: { reference: input.choirBinding?.binding_id || null, digest: input.choirBinding?.binding_digest || null },
    hush_intervention_receipt: { reference: input.hushReceipt?.receipt_id || null, digest: input.hushReceipt?.receipt_digest || null }
  };
}

export function missingCompositionLayers(input) {
  return [
    ['plan', input.plan],
    ['authority_context', input.authorityContext],
    ['controlled_source', input.source],
    ['instrument_ensemble', input.ensemble],
    ['snapshot_lattice', input.lattice],
    ['experiment_run', input.experimentRun],
    ['tomography_receipt', input.tomographyReceipt],
    ['choir_calibration_binding', input.choirBinding],
    ['hush_intervention_receipt', input.hushReceipt]
  ].filter(([, value]) => !value).map(([name]) => name);
}

export function deriveCompositionState({ missing, verified, checks }) {
  if (missing.length) return 'MISSING_LAYER_HOLD';
  if (!Object.values(verified).every(Boolean)) return 'TAMPER_HOLD';
  if (!checks.current_authority || !checks.aperture_permission) return 'STALE_AUTHORITY_HOLD';
  if (!checks.layer_order) return 'LAYER_ORDER_HOLD';
  if (!checks.source_binding) return 'SOURCE_BINDING_HOLD';
  if (!checks.experiment_binding) return 'EXPERIMENT_BINDING_HOLD';
  if (!checks.tomography_ready) return 'TOMOGRAPHY_HOLD';
  if (!checks.choir_binding) return 'CHOIR_BINDING_HOLD';
  if (!checks.hush_binding) return 'HUSH_BINDING_HOLD';
  if (!checks.presentation_boundary) return 'PRESENTATION_BOUNDARY_HOLD';
  return 'COMPOSITION_ELIGIBLE';
}

export async function inspectApertureComposition(input = {}, options = {}) {
  const current = input.currentCase || {};
  const missing = missingCompositionLayers(input);
  const verified = {
    plan: input.plan ? await verifyApertureCompositionPlan(input.plan, options) : false,
    authority_context: input.authorityContext ? await verifyAuthorityContext(input.authorityContext, {}, options) : false,
    controlled_source: input.source ? await verifyControlledSource(input.source, options) : false,
    instrument_ensemble: input.ensemble ? await verifyInstrumentEnsemble(input.ensemble, options) : false,
    snapshot_lattice: input.lattice ? await verifySnapshotLattice(input.lattice, options) : false,
    experiment_run: input.experimentRun ? await verifyDomeExperimentRun(input.experimentRun, options) : false,
    tomography_receipt: input.tomographyReceipt ? await verifyTomographyReceipt(input.tomographyReceipt, options) : false,
    choir_calibration_binding: input.choirBinding ? await verifyChoirCalibrationBinding(input.choirBinding, options) : false,
    hush_intervention_receipt: input.hushReceipt ? await verifyHushInterventionReceipt(input.hushReceipt, options) : false
  };
  const permission = input.authorityContext
    ? authorizeAuthorityAction(input.authorityContext, 'APERTURE_REBUILD')
    : { authorized: false };
  const checks = {
    current_authority: input.authorityContext ? await verifyAuthorityContext(input.authorityContext, current, options) : false,
    aperture_permission: permission.authorized === true,
    layer_order: exactCompositionOrder(input.plan?.layer_order),
    source_binding: Boolean(
      input.lattice?.source_id === input.source?.source_id
      && input.lattice?.source_commitment === input.source?.source_commitment
      && input.lattice?.ensemble_id === input.ensemble?.ensemble_id
      && input.lattice?.ensemble_digest === input.ensemble?.ensemble_digest
      && input.experimentRun?.source_receipt_reference === input.source?.source_receipt_reference
      && input.experimentRun?.instrument_ensemble_reference === input.ensemble?.ensemble_id
    ),
    experiment_binding: Boolean(
      input.tomographyReceipt?.experiment_id === input.experimentRun?.experiment_id
      && input.experimentRun?.tomography_receipt_reference === input.tomographyReceipt?.receipt_id
    ),
    tomography_ready: Boolean(
      ['TOMOGRAPHY_READY', 'TOMOGRAPHY_READY_WITH_WARNINGS'].includes(input.tomographyReceipt?.status)
      && input.tomographyReceipt?.source_commitment?.source_id === input.source?.source_id
      && input.tomographyReceipt?.source_commitment?.source_digest === input.source?.source_digest
      && input.tomographyReceipt?.instrument_ensemble?.ensemble_id === input.ensemble?.ensemble_id
      && input.tomographyReceipt?.instrument_ensemble?.ensemble_digest === input.ensemble?.ensemble_digest
      && input.tomographyReceipt?.snapshot_lattice?.lattice_id === input.lattice?.lattice_id
      && input.tomographyReceipt?.snapshot_lattice?.lattice_digest === input.lattice?.lattice_digest
    ),
    choir_binding: Boolean(
      input.choirBinding?.calibration_eligible === true
      && input.choirBinding?.binding_state === 'CALIBRATION_ELIGIBLE'
      && input.choirBinding?.case_id === current.caseId
      && input.choirBinding?.case_map_digest === current.caseMapDigest
      && input.choirBinding?.route_memory_digest === current.routeMemoryDigest
    ),
    hush_binding: Boolean(
      input.hushReceipt?.intervention_state === 'INTERVENTION_ELIGIBLE'
      && input.hushReceipt?.candidate_status === 'UNKEPT_CANDIDATE'
      && input.hushReceipt?.candidate_kept === false
      && input.hushReceipt?.case_id === current.caseId
      && input.hushReceipt?.case_map_digest === current.caseMapDigest
      && input.hushReceipt?.route_memory_digest === current.routeMemoryDigest
    ),
    presentation_boundary: Boolean(
      input.presentationBoundaryReviewed !== false
      && input.plan?.read_only_projection_required === true
      && input.plan?.provenance_visible_required === true
      && input.plan?.warning_collapse_allowed === false
      && input.plan?.raw_source_allowed === false
      && input.plan?.candidate_body_allowed === false
      && input.plan?.case_map_body_allowed === false
      && input.plan?.route_memory_body_allowed === false
      && input.plan?.provider_log_allowed === false
      && input.plan?.reader_result_body_allowed === false
      && input.plan?.ui_mount_authorized === false
    )
  };
  return Object.freeze({
    current,
    missing,
    verified,
    checks,
    state: deriveCompositionState({ missing, verified, checks })
  });
}
