import { canonicalDigest } from '../../app/dome-world/ash/canonical-json.js';
import {
  compileReaderProfile,
  compileRebuildTest
} from '../../app/engine/ash-keep-core.js';
import { compileAuthorityContext } from '../../app/engine/ash-constitutional-convergence.js';
import { compileChoirCalibrationBinding } from '../../app/engine/ash-keep-choir-calibration.js';
import { compileHushInterventionEnsemble } from '../../app/engine/hush-intervention-ensemble.js';
import { compileHushInterventionReceipt } from '../../app/engine/hush-intervention-receipt.js';
import { HUSH_INTERVENTION_DOMAINS } from '../../app/engine/hush-intervention-common.js';
import { compileControlledSource } from '../../app/engine/aperture-v31-controlled-source.js';
import { compileInstrumentEnsemble } from '../../app/engine/aperture-v31-instrument-ensemble.js';
import { compileSnapshotLattice } from '../../app/engine/aperture-v31-snapshot-lattice.js';
import { estimateReferenceLayers } from '../../app/engine/aperture-v31-reference-layer.js';
import { estimateRegistryDynamics } from '../../app/engine/aperture-v31-registry-dynamics.js';
import { estimateSharedLayerBurden } from '../../app/engine/aperture-v31-shared-layer.js';
import { estimatePhasonSusceptibility } from '../../app/engine/aperture-v31-phason-susceptibility.js';
import { estimateTemporalRoute } from '../../app/engine/aperture-v31-temporal-tomography.js';
import { compileSignedResidualLedger } from '../../app/engine/aperture-v31-residual-ledger.js';
import { compileTomographyReceipt } from '../../app/engine/aperture-v31-reconstruction.js';
import { compileDomeExperimentRun } from '../../app/engine/aperture-v31-experiment-contract.js';
import { compileApertureCompositionPlan } from '../../app/engine/aperture-composition-plan.js';
import { bindingInput, targetBundle } from '../choir-calibration/suite.mjs';

export const FIXED_TIME = '2026-07-16T13:00:00.000Z';
export const SOURCE_TEXT = 'The synthetic public archive changed between two declared revisions. Which revision introduced the additional heading?';
export const CANDIDATE_BODY = 'Please provide the public revision index and identify which revision introduced the additional heading.';

export async function buildApertureCompositionFixture() {
  const caseMap = targetBundle.caseMap;
  const routeMemory = targetBundle.routeMemory;
  const reader = await compileReaderProfile({
    readerId: 'reader_aperture_composition',
    label: 'Aperture composition deterministic reader',
    readerClass: 'deterministic-baseline',
    version: '1',
    repeatCount: 2,
    seeded: true,
    sourceStatus: 'SIMULATED',
    createdAt: FIXED_TIME
  });
  const rebuildReceipt = await compileRebuildTest({
    testId: 'rebuild_aperture_composition',
    caseMap,
    routeMemory,
    reader,
    createdAt: FIXED_TIME,
    sourceDriftState: 'SOURCE_HELD',
    trials: [
      { trial_id: 'apcomp_rebuild_1', seed: 1, state: 'OBSERVED', benign_control: true, before: {}, after: { node_ids: ['node_shared'] } },
      { trial_id: 'apcomp_rebuild_2', seed: 2, state: 'OBSERVED', held_out: true, before: {}, after: { node_ids: ['node_shared', 'node_right'], relationship_ids: ['edge_bridge'] } }
    ],
    evidenceBasis: ['synthetic Stretch 5 Rebuild fixture']
  });
  const authorityContext = await compileAuthorityContext({
    lifecycleRank: 'REBUILD_ELIGIBLE',
    readinessReceiptReference: 'ready_aperture_composition',
    custodyRootReceiptReference: 'ashc_aperture_composition',
    caseId: caseMap.case_id,
    caseMapDigest: caseMap.case_map_digest,
    routeMemoryDigest: routeMemory.route_memory_digest,
    rebuildReceiptReference: rebuildReceipt.test_id,
    compiledAt: FIXED_TIME,
    evidenceBasis: ['synthetic current Stretch 5 Authority Context']
  });

  const choirBinding = await compileChoirCalibrationBinding({
    ...bindingInput,
    bindingId: 'choircal_aperture_composition',
    createdAt: FIXED_TIME
  });

  const hushEnsemble = await compileHushInterventionEnsemble({
    ensembleId: 'hush_ensemble_aperture_composition',
    createdAt: FIXED_TIME,
    caseId: caseMap.case_id,
    caseMapDigest: caseMap.case_map_digest,
    routeMemoryDigest: routeMemory.route_memory_digest,
    authorityContext,
    rebuildReceipt,
    sourceText: SOURCE_TEXT,
    discourseMode: 'QUESTION_PRESERVING_BRIEF',
    propositions: [
      { propositionId: 'p_archive_changed', text: 'The public archive changed between revisions.', obligation: 'PRESERVE_MEANING' },
      { propositionId: 'p_heading_question', text: 'Which revision introduced the additional heading?', obligation: 'QUESTION_ONLY' }
    ],
    protectedLiterals: [
      { literalId: 'literal_private_alias', literal: 'node_private_source', policy: 'KEEP_LOCAL' }
    ],
    interventions: [{
      interventionId: 'intervention_aperture_composition',
      label: 'Bounded composition intervention',
      routeClass: 'LOCAL_ONLY',
      dimensions: {
        REGISTER: 'neutral public-record register',
        SYNTAX: 'bounded request plus preserved question',
        CADENCE: 'short clauses',
        LEXICON: 'public archive terms',
        FORMATTING: 'plain paragraph',
        LINE_BREAKS: 'single paragraph',
        NAMING: 'keep private alias local',
        NORMALIZATION: 'preserve uncertainty'
      }
    }]
  });
  const candidateDigest = await canonicalDigest(
    HUSH_INTERVENTION_DOMAINS.candidate,
    { body: CANDIDATE_BODY }
  );
  const hushReceiptInput = {
    ensemble: hushEnsemble,
    authorityContext,
    rebuildReceipt,
    receiptId: 'hush_intervention_aperture_composition',
    createdAt: FIXED_TIME,
    interventionId: 'intervention_aperture_composition',
    candidateBody: CANDIDATE_BODY,
    propositionFindings: [
      { propositionId: 'p_archive_changed', status: 'PRESERVED_MEANING' },
      { propositionId: 'p_heading_question', status: 'QUESTION_PRESERVED' }
    ],
    literalFindings: [{ literalId: 'literal_private_alias', status: 'ABSENT_FROM_CANDIDATE' }],
    transformationHistory: [{ intervention_id: 'intervention_aperture_composition', candidate_digest: candidateDigest }],
    trials: [
      {
        trialId: 'apcomp_hush_local',
        readerClass: 'LOCAL_DETERMINISTIC',
        readerDigest: `sha256:${'7'.repeat(64)}`,
        sourceTextDigest: hushEnsemble.source_text_digest,
        candidateDigest,
        state: 'OBSERVED',
        benignControl: true,
        matchedReaderSet: true,
        componentwiseReconstruction: { propositions: 2, protected_literals: 0 }
      },
      {
        trialId: 'apcomp_hush_synthetic',
        readerClass: 'SYNTHETIC_DECLARED',
        readerDigest: `sha256:${'8'.repeat(64)}`,
        sourceTextDigest: hushEnsemble.source_text_digest,
        candidateDigest,
        state: 'OBSERVED',
        heldOut: true,
        matchedReaderSet: true,
        componentwiseReconstruction: { propositions: 2, protected_literals: 0 }
      }
    ],
    componentwiseComparison: {
      source: 'MATCHED_READER_TRIALS',
      propositions: { local: 2, synthetic: 2 },
      protected_literals: { local: 0, synthetic: 0 }
    },
    sourceDriftState: 'SOURCE_HELD',
    promptInjectionState: 'CLEAR',
    providerDraftUsed: false
  };
  const hushReceipt = await compileHushInterventionReceipt(hushReceiptInput);

  const sourceCommitment = `sha256:${'4'.repeat(64)}`;
  const source = await compileControlledSource({
    sourceId: 'atsrc_aperture_composition',
    sourceReceiptReference: authorityContext.custody_root_receipt_reference,
    sourceCommitment
  });
  const ensemble = await compileInstrumentEnsemble({
    ensembleId: 'atens_aperture_composition',
    instruments: [
      {
        instrumentId: 'apcomp-route',
        version: '1',
        interventionDimensions: ['route', 'time'],
        projection: 'observable surface',
        controlledVariables: ['source'],
        uncontrolledVariables: ['latency'],
        environment: 'composition-lab',
        operatorAuthorized: true
      },
      {
        instrumentId: 'apcomp-registry',
        version: '1',
        interventionDimensions: ['route', 'time'],
        projection: 'registered event',
        controlledVariables: ['source'],
        uncontrolledVariables: ['retrieval'],
        environment: 'composition-lab',
        operatorAuthorized: true
      }
    ]
  });
  const snapshots = [];
  for (const instrumentId of ['apcomp-route', 'apcomp-registry']) {
    for (const timeIndex of [0, 1]) {
      for (const replicate of [1, 2]) {
        snapshots.push({
          snapshotId: `atsnap_${instrumentId}_${timeIndex}_${replicate}`,
          sourceCommitment,
          instrumentId,
          instrumentVersion: '1',
          timeIndex,
          replicate,
          condition: `${instrumentId}-${timeIndex}`,
          environment: 'composition-lab',
          interventionValues: { route: instrumentId === 'apcomp-route' ? 0 : 1, time: timeIndex },
          observedValue: 100 + timeIndex * 10 + (instrumentId === 'apcomp-registry' ? 20 : 0) + replicate,
          heldOut: instrumentId === 'apcomp-registry' && timeIndex === 1 && replicate === 2,
          benignControl: instrumentId === 'apcomp-route' && timeIndex === 0
        });
      }
    }
  }
  const lattice = await compileSnapshotLattice({
    source,
    ensemble,
    snapshots,
    declaredVariableCount: 2,
    designRank: 2,
    latticeId: 'atlattice_aperture_composition'
  });
  const residualLedger = compileSignedResidualLedger(snapshots.map(value => ({
    snapshotId: value.snapshotId,
    instrumentId: value.instrumentId,
    timeIndex: value.timeIndex,
    replicate: value.replicate,
    observed: value.observedValue,
    predicted: value.observedValue,
    heldOut: value.heldOut
  })));
  const experimentId = 'atx_aperture_composition';
  const tomographyParts = {
    referenceLayers: estimateReferenceLayers({
      pairs: [{ referenceStratum: 'apcomp-route', variedStratum: 'apcomp-registry', deltaInput: 20, deltaOutput: 10 }]
    }),
    registryModel: estimateRegistryDynamics({
      globalConfiguration: 'declared',
      orientations: [1, -1],
      localRegistries: [0, 10]
    }),
    sharedLayerRelaxation: estimateSharedLayerBurden({
      sharedLayer: 'composition adapter',
      adjustments: [
        { stratumId: 'apcomp-route', adjustment: 10 },
        { stratumId: 'apcomp-registry', adjustment: 20 }
      ],
      normalizer: 100
    }),
    phasonSusceptibility: estimatePhasonSusceptibility({
      trials: [
        { deltaCoordinate: 10, deltaObservation: 5 },
        { deltaCoordinate: 10, deltaObservation: 6 }
      ],
      shamResponse: 2
    }),
    temporalRouteObject: estimateTemporalRoute(lattice),
    residualLedger
  };
  const tomographyReceipt = await compileTomographyReceipt({
    experimentId,
    receiptId: 'attomo_aperture_composition',
    createdAt: FIXED_TIME,
    source,
    ensemble,
    lattice,
    ...tomographyParts,
    heldoutValidation: {
      status: 'PASS',
      error: { numerator: 1, denominator: 10 },
      target: { numerator: 1, denominator: 5 }
    },
    alternativeModels: ['linear response', 'finite-state transition'],
    benignControls: ['no-op route']
  });
  const experimentRun = await compileDomeExperimentRun({
    experimentId,
    createdAt: FIXED_TIME,
    sourceReceiptReference: source.source_receipt_reference,
    preRegistrationDigest: `sha256:${'5'.repeat(64)}`,
    instrumentEnsembleReference: ensemble.ensemble_id,
    snapshotBatchReference: 'ashsnap_aperture_composition',
    tomographyReceiptReference: tomographyReceipt.receipt_id
  });
  const plan = await compileApertureCompositionPlan({
    planId: 'apcomp_plan_fixture',
    createdAt: FIXED_TIME
  });
  const currentCase = {
    caseId: caseMap.case_id,
    caseMapDigest: caseMap.case_map_digest,
    routeMemoryDigest: routeMemory.route_memory_digest
  };
  return {
    caseMap,
    routeMemory,
    reader,
    rebuildReceipt,
    authorityContext,
    choirBinding,
    hushEnsemble,
    hushReceiptInput,
    hushReceipt,
    source,
    ensemble,
    lattice,
    tomographyParts,
    tomographyReceipt,
    experimentRun,
    plan,
    currentCase
  };
}
