import { canonicalDigest } from '../../app/dome-world/ash/canonical-json.js';
import {
  compileCaseMap,
  compileReaderProfile,
  compileRebuildTest,
  compileRouteMemory
} from '../../app/engine/ash-keep-core.js';
import { compileAuthorityContext } from '../../app/engine/ash-constitutional-convergence.js';
import {
  HUSH_INTERVENTION_DOMAINS
} from '../../app/engine/hush-intervention-common.js';
import { compileHushInterventionEnsemble } from '../../app/engine/hush-intervention-ensemble.js';

export const FIXED_TIME = '2026-07-16T07:00:00.000Z';
export const SOURCE_TEXT = 'The synthetic archive index changed between two public revisions. Which revision introduced the new heading?';
export const CANDIDATE_BODY = 'Please provide the public index and identify which revision introduced the new heading.';

export async function buildHushInterventionFixture() {
  const caseMap = await compileCaseMap({
    profile: 'archive',
    caseId: 'case_hush_fixture',
    title: 'Synthetic Hush fixture',
    createdAt: FIXED_TIME,
    updatedAt: FIXED_TIME,
    custodyReference: 'ashc_hush_fixture',
    rooms: [{ id: 'room_public', label: 'Public record', color: '#76ead4' }],
    nodes: [
      { id: 'node_index', type: 'artifact', label: 'Synthetic archive index', room_id: 'room_public', chronology_index: 0 },
      { id: 'node_question', type: 'claim', label: 'Revision question', room_id: 'room_public', chronology_index: 1 }
    ],
    relationships: [{ id: 'edge_revision', from: 'node_index', to: 'node_question', type: 'raises', room_id: 'room_public' }],
    privateChronology: ['revision one', 'revision two'],
    intendedActions: ['request public index'],
    evidenceBasis: ['synthetic validation fixture']
  });
  const routeMemory = await compileRouteMemory({
    caseId: caseMap.case_id,
    createdAt: FIXED_TIME,
    entries: [],
    evidenceBasis: ['empty local route memory fixture']
  });
  const reader = await compileReaderProfile({
    readerId: 'reader_hush_fixture',
    label: 'Synthetic deterministic reader',
    readerClass: 'deterministic-baseline',
    version: '1',
    repeatCount: 2,
    seeded: true,
    sourceStatus: 'SIMULATED',
    createdAt: FIXED_TIME
  });
  const rebuildReceipt = await compileRebuildTest({
    testId: 'rebuild_hush_fixture',
    caseMap,
    routeMemory,
    reader,
    createdAt: FIXED_TIME,
    sourceDriftState: 'SOURCE_HELD',
    trials: [
      { trial_id: 'rebuild_trial_1', seed: 1, state: 'OBSERVED', benign_control: true, before: {}, after: { node_ids: ['node_index'] } },
      { trial_id: 'rebuild_trial_2', seed: 2, state: 'OBSERVED', held_out: true, before: {}, after: { node_ids: ['node_index', 'node_question'], relationship_ids: ['edge_revision'] } }
    ],
    evidenceBasis: ['synthetic current Rebuild fixture']
  });
  const authorityContext = await compileAuthorityContext({
    lifecycleRank: 'REBUILD_ELIGIBLE',
    readinessReceiptReference: 'ready_hush_fixture',
    custodyRootReceiptReference: 'ashc_hush_fixture',
    caseId: caseMap.case_id,
    caseMapDigest: caseMap.case_map_digest,
    routeMemoryDigest: routeMemory.route_memory_digest,
    rebuildReceiptReference: rebuildReceipt.test_id,
    compiledAt: FIXED_TIME,
    evidenceBasis: ['synthetic current Authority Context']
  });
  const ensemble = await compileHushInterventionEnsemble({
    ensembleId: 'hush_ensemble_fixture',
    createdAt: FIXED_TIME,
    caseId: caseMap.case_id,
    caseMapDigest: caseMap.case_map_digest,
    routeMemoryDigest: routeMemory.route_memory_digest,
    authorityContext,
    rebuildReceipt,
    sourceText: SOURCE_TEXT,
    discourseMode: 'NEUTRAL_RECORDS_REQUEST',
    propositions: [
      { propositionId: 'p_index_changed', text: 'The public index changed between revisions.', obligation: 'PRESERVE_MEANING' },
      { propositionId: 'p_revision_question', text: 'Which revision introduced the new heading?', obligation: 'QUESTION_ONLY' }
    ],
    protectedLiterals: [
      { literalId: 'literal_internal_alias', literal: 'node_private_source', policy: 'KEEP_LOCAL' }
    ],
    interventions: [{
      interventionId: 'intervention_full_vector',
      label: 'Full declared transformation vector',
      routeClass: 'LOCAL_ONLY',
      dimensions: {
        REGISTER: 'neutral public-record register',
        SYNTAX: 'declarative request plus bounded question',
        CADENCE: 'shortened clauses',
        LEXICON: 'general public-record terms',
        FORMATTING: 'plain paragraphs',
        LINE_BREAKS: 'single paragraph',
        NAMING: 'keep internal alias local',
        NORMALIZATION: 'preserve punctuation and uncertainty'
      }
    }]
  });
  const candidateDigest = await canonicalDigest(
    HUSH_INTERVENTION_DOMAINS.candidate,
    { body: CANDIDATE_BODY }
  );
  const trials = [
    {
      trialId: 'hush_trial_local', readerClass: 'LOCAL_DETERMINISTIC', readerDigest: `sha256:${'1'.repeat(64)}`,
      sourceTextDigest: ensemble.source_text_digest, candidateDigest, state: 'OBSERVED', benignControl: true,
      matchedReaderSet: true, componentwiseReconstruction: { propositions: 2, protected_literals: 0 }
    },
    {
      trialId: 'hush_trial_synthetic', readerClass: 'SYNTHETIC_DECLARED', readerDigest: `sha256:${'2'.repeat(64)}`,
      sourceTextDigest: ensemble.source_text_digest, candidateDigest, state: 'OBSERVED', heldOut: true,
      matchedReaderSet: true, componentwiseReconstruction: { propositions: 2, protected_literals: 0 }
    }
  ];
  const receiptInput = {
    ensemble,
    authorityContext,
    rebuildReceipt,
    interventionId: 'intervention_full_vector',
    candidateBody: CANDIDATE_BODY,
    propositionFindings: [
      { propositionId: 'p_index_changed', status: 'PRESERVED_MEANING' },
      { propositionId: 'p_revision_question', status: 'QUESTION_PRESERVED' }
    ],
    literalFindings: [{ literalId: 'literal_internal_alias', status: 'ABSENT_FROM_CANDIDATE' }],
    transformationHistory: [{ intervention_id: 'intervention_full_vector', candidate_digest: candidateDigest }],
    trials,
    componentwiseComparison: {
      source: 'MATCHED_READER_TRIALS',
      propositions: { local: 2, synthetic: 2 },
      protected_literals: { local: 0, synthetic: 0 }
    },
    sourceDriftState: 'SOURCE_HELD',
    promptInjectionState: 'CLEAR',
    providerDraftUsed: false
  };
  return { caseMap, routeMemory, reader, rebuildReceipt, authorityContext, ensemble, candidateDigest, trials, receiptInput };
}
