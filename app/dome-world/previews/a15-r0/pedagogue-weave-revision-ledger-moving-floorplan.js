import {
  evaluateWarrantWeave
} from './pedagogue-warrant-weave-two-staircases.js';
import {
  canonicalRuleSignature,
  makeSyntheticReplayWitness
} from './pedagogue-warrant-genealogy-ghost-house.js';

export const PEDAGOGUE_WEAVE_REVISION_CUSTODY_SCHEMA =
  'td613.pedagogue.weave-revision-custody-hostile/v0.1';

const freeze = value => Object.freeze(value);
const freezeArray = values => freeze([...values]);
const freezeRecord = value => freeze({ ...value });

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function evidence(evidence_id, warrants) {
  return freezeRecord({ evidence_id, warrants: freezeArray(warrants) });
}

function witnessedRule(rule_id, requires, produces) {
  const base = {
    rule_id,
    requires: freezeArray(requires),
    produces,
    predeclared: true,
    admissible: true,
    replayable: true
  };
  return freezeRecord({
    ...base,
    replay_witness: makeSyntheticReplayWitness(base, `MOVING_FLOORPLAN:${canonicalRuleSignature(base)}`)
  });
}

function semanticEventMap(events) {
  const map = new Map();
  const labels = new Set();
  for (const event of events ?? []) {
    const label = event.semantic_label ?? event.event_id;
    if (typeof label !== 'string' || !label) throw new TypeError('every event requires semantic identity');
    if (labels.has(label)) throw new Error(`duplicate semantic event identity: ${label}`);
    labels.add(label);
    map.set(event.event_id, label);
  }
  return map;
}

function semanticSerializations(weaveReceipt, events) {
  if (weaveReceipt.status !== 'PARTIAL_ORDER_REPLAY_COMPLETE') return [];
  const semantics = semanticEventMap(events);
  return weaveReceipt.serializations
    .map(serialization => serialization.map(eventId => semantics.get(eventId)).join('>'))
    .sort();
}

function relationFingerprint(weaveReceipt, events) {
  if (weaveReceipt.status !== 'PARTIAL_ORDER_REPLAY_COMPLETE') return null;
  return stable(semanticSerializations(weaveReceipt, events));
}

function postureOf(weaveReceipt) {
  if (weaveReceipt.status !== 'PARTIAL_ORDER_REPLAY_COMPLETE') return null;
  return freezeRecord({
    final_presence: weaveReceipt.final_presence,
    final_snapshot_identified: weaveReceipt.final_snapshot_identified,
    transient_support_continuity: weaveReceipt.transient_support_continuity,
    contradiction_history: weaveReceipt.contradiction_history,
    contradiction_resolution_history: weaveReceipt.contradiction_resolution_history
  });
}

function semanticEpochDigest(epochReceipt) {
  return freezeRecord({
    accepted: epochReceipt.accepted,
    status: epochReceipt.status,
    relation_fingerprint: epochReceipt.relation_fingerprint,
    posture: epochReceipt.posture
  });
}

export function sealPrecedenceEpochDeclaration(epoch) {
  if (!epoch || typeof epoch.epoch_id !== 'string' || !epoch.epoch_id) {
    throw new TypeError('epoch_id required');
  }
  return deepFreeze(clone({
    epoch_id: epoch.epoch_id,
    precedence_edges: epoch.precedence_edges ?? []
  }));
}

export function requestSealedPrecedenceEpochMutation(sealedEpoch, replacementEdges) {
  if (!Object.isFrozen(sealedEpoch)) {
    return freezeRecord({
      status: 'REJECT_UNSEALED_PRECEDENCE_EPOCH_MUTATION_TARGET',
      mutated: false
    });
  }
  return freezeRecord({
    status: 'SEALED_PRECEDENCE_EPOCH_IMMUTABLE',
    mutated: false,
    existing_edges: freezeArray(clone(sealedEpoch.precedence_edges ?? [])),
    requested_replacement_edges: freezeArray(clone(replacementEdges ?? []))
  });
}

function evaluateEpoch(baseSpecimen, epoch) {
  const sealed = sealPrecedenceEpochDeclaration(epoch);
  const weave = evaluateWarrantWeave({
    ...clone(baseSpecimen),
    case_id: `${baseSpecimen.case_id ?? 'MOVING_FLOORPLAN'}:${sealed.epoch_id}`,
    precedence_edges: clone(sealed.precedence_edges)
  });
  const accepted = weave.status === 'PARTIAL_ORDER_REPLAY_COMPLETE';
  return freezeRecord({
    epoch_id: sealed.epoch_id,
    accepted,
    status: weave.status,
    declared_precedence_edges: freezeArray(clone(sealed.precedence_edges)),
    relation_fingerprint: accepted ? relationFingerprint(weave, baseSpecimen.events) : null,
    semantic_serializations: accepted ? freezeArray(semanticSerializations(weave, baseSpecimen.events)) : freezeArray([]),
    posture: accepted ? postureOf(weave) : null,
    weave
  });
}

export function evaluateWeaveRevisionLedger({
  case_id = 'WEAVE_REVISION_LEDGER_CASE',
  base_specimen,
  epochs = []
} = {}) {
  if (!base_specimen || typeof base_specimen !== 'object') throw new TypeError('base_specimen required');
  if (!Array.isArray(epochs) || epochs.length === 0) throw new TypeError('epochs required');
  semanticEventMap(base_specimen.events ?? []);

  const epochReceipts = [];
  const acceptedEpochs = [];
  const rejectedEpochs = [];
  const seenIds = new Map();
  let currentAccepted = null;

  for (const rawEpoch of epochs) {
    const epoch = sealPrecedenceEpochDeclaration(rawEpoch);
    const evaluated = evaluateEpoch({ ...clone(base_specimen), case_id }, epoch);

    if (seenIds.has(epoch.epoch_id)) {
      const prior = seenIds.get(epoch.epoch_id);
      const sameRelation = prior.relation_fingerprint === evaluated.relation_fingerprint &&
        prior.status === evaluated.status;
      const rejection = freezeRecord({
        epoch_id: epoch.epoch_id,
        accepted: false,
        status: sameRelation
          ? 'REJECT_DUPLICATE_EPOCH_IDENTIFIER'
          : 'REJECT_EPOCH_IDENTIFIER_REUSE_WITH_DIFFERENT_RELATION',
        relation_fingerprint: evaluated.relation_fingerprint,
        posture: evaluated.posture,
        attempted_epoch: evaluated
      });
      epochReceipts.push(rejection);
      rejectedEpochs.push(rejection);
      continue;
    }

    seenIds.set(epoch.epoch_id, evaluated);

    if (!evaluated.accepted) {
      const rejection = freezeRecord({
        ...evaluated,
        current_accepted_epoch_preserved: currentAccepted?.epoch_id ?? null
      });
      epochReceipts.push(rejection);
      rejectedEpochs.push(rejection);
      continue;
    }

    const priorMatches = acceptedEpochs
      .filter(item => item.relation_fingerprint === evaluated.relation_fingerprint)
      .map(item => item.epoch_id);
    const previousAccepted = acceptedEpochs.at(-1) ?? null;
    const enriched = freezeRecord({
      ...evaluated,
      relation_matches_prior_epoch_ids: freezeArray(priorMatches),
      current_relation_matches_prior_relation: priorMatches.length > 0,
      semantic_relation_changed_from_previous_accepted: previousAccepted
        ? previousAccepted.relation_fingerprint !== evaluated.relation_fingerprint
        : false,
      posture_changed_from_previous_accepted: previousAccepted
        ? stable(previousAccepted.posture) !== stable(evaluated.posture)
        : false
    });
    epochReceipts.push(enriched);
    acceptedEpochs.push(enriched);
    currentAccepted = enriched;
  }

  const semanticHistory = freezeArray(epochReceipts.map(semanticEpochDigest));
  const acceptedPostureTrace = freezeArray(acceptedEpochs.map(item => item.posture));
  const acceptedRelationTrace = freezeArray(acceptedEpochs.map(item => item.relation_fingerprint));

  return freezeRecord({
    schema: PEDAGOGUE_WEAVE_REVISION_CUSTODY_SCHEMA,
    candidate: 'C5_WEAVE_REVISION_LEDGER',
    case_id,
    status: rejectedEpochs.length
      ? 'WEAVE_REVISION_LEDGER_COMPLETE_WITH_REJECTIONS'
      : 'WEAVE_REVISION_LEDGER_COMPLETE',
    epoch_count: epochs.length,
    accepted_epoch_count: acceptedEpochs.length,
    rejected_epoch_count: rejectedEpochs.length,
    epochs: freezeArray(epochReceipts),
    accepted_epochs: freezeArray(acceptedEpochs),
    rejected_epochs: freezeArray(rejectedEpochs),
    accepted_posture_trace: acceptedPostureTrace,
    accepted_relation_fingerprint_trace: acceptedRelationTrace,
    semantic_revision_history_fingerprint: stable(semanticHistory),
    current_epoch_id: currentAccepted?.epoch_id ?? null,
    current_relation_fingerprint: currentAccepted?.relation_fingerprint ?? null,
    current_posture: currentAccepted?.posture ?? null,
    precedence_revision_history_preserved: true,
    historical_posture_compacted_into_current: false,
    latest_state_only_history_authority: false,
    promotion_authority: false,
    scalar_aggregation_used: false
  });
}

function centralSpecimen() {
  return {
    case_id: 'MOVING_FLOORPLAN_CENTRAL',
    baseline_evidence: [
      evidence('A', ['MEASUREMENT:A']),
      evidence('B', ['MEASUREMENT:B'])
    ],
    rules: [
      witnessedRule('MF_AB', ['MEASUREMENT:A', 'MEASUREMENT:B'], 'IDENTIFIABILITY:W'),
      witnessedRule('MF_CD', ['MEASUREMENT:C', 'MEASUREMENT:D'], 'IDENTIFIABILITY:W')
    ],
    contradiction_families: [],
    requested_warrant: 'IDENTIFIABILITY:W',
    events: [
      {
        event_id: 'PINK',
        semantic_label: 'WITHDRAW_PRIMARY_LINEAGE',
        kind: 'REMOVE_EVIDENCE',
        remove_evidence_ids: ['A']
      },
      {
        event_id: 'BLUE',
        semantic_label: 'ADD_REPLACEMENT_LINEAGE',
        kind: 'ADD_EVIDENCE',
        add_evidence: [
          evidence('C', ['MEASUREMENT:C']),
          evidence('D', ['MEASUREMENT:D'])
        ]
      }
    ]
  };
}

function mf01MovingFloorplan() {
  const full = evaluateWeaveRevisionLedger({
    case_id: 'MF01_MOVING_FLOORPLAN_RESOLVE_THEN_REOPEN',
    base_specimen: centralSpecimen(),
    epochs: [
      { epoch_id: 'K0_OPEN_LANDING', precedence_edges: [] },
      { epoch_id: 'K1_PINK_FIRST', precedence_edges: [['PINK', 'BLUE']] },
      { epoch_id: 'K2_LOCK_REMOVED', precedence_edges: [] }
    ]
  });
  const compacted = evaluateWeaveRevisionLedger({
    case_id: 'MF01_COMPACTED_CURRENT_ONLY',
    base_specimen: centralSpecimen(),
    epochs: [{ epoch_id: 'K2_ONLY', precedence_edges: [] }]
  });
  return freezeRecord({
    case_id: 'MF01_MOVING_FLOORPLAN_RESOLVE_THEN_REOPEN',
    full,
    compacted,
    current_relation_equal: full.current_relation_fingerprint === compacted.current_relation_fingerprint,
    current_posture_equal: stable(full.current_posture) === stable(compacted.current_posture),
    revision_history_equal: full.semantic_revision_history_fingerprint === compacted.semantic_revision_history_fingerprint
  });
}

function mf02OppositeLock() {
  const receipt = evaluateWeaveRevisionLedger({
    case_id: 'MF02_OPPOSITE_LOCK_REPLACED_RESOLUTION',
    base_specimen: centralSpecimen(),
    epochs: [
      { epoch_id: 'K0_AMBIGUOUS', precedence_edges: [] },
      { epoch_id: 'K1_BLUE_FIRST', precedence_edges: [['BLUE', 'PINK']] },
      { epoch_id: 'K2_PINK_FIRST', precedence_edges: [['PINK', 'BLUE']] }
    ]
  });
  return freezeRecord({ case_id: 'MF02_OPPOSITE_LOCK_REPLACED_RESOLUTION', receipt });
}

function mf03EpochIdRenaming() {
  const a = evaluateWeaveRevisionLedger({
    case_id: 'MF03_ID_RENAME_A',
    base_specimen: centralSpecimen(),
    epochs: [
      { epoch_id: 'ALPHA', precedence_edges: [] },
      { epoch_id: 'BETA', precedence_edges: [['PINK', 'BLUE']] },
      { epoch_id: 'GAMMA', precedence_edges: [] }
    ]
  });
  const b = evaluateWeaveRevisionLedger({
    case_id: 'MF03_ID_RENAME_B',
    base_specimen: centralSpecimen(),
    epochs: [
      { epoch_id: 'ZZZ', precedence_edges: [] },
      { epoch_id: 'AAA', precedence_edges: [['PINK', 'BLUE']] },
      { epoch_id: 'MMM', precedence_edges: [] }
    ]
  });
  return freezeRecord({
    case_id: 'MF03_EPOCH_ID_RENAMING_INVARIANCE',
    a,
    b,
    semantic_posture_trace_invariant: stable(a.accepted_posture_trace) === stable(b.accepted_posture_trace),
    semantic_relation_trace_invariant: stable(a.accepted_relation_fingerprint_trace) === stable(b.accepted_relation_fingerprint_trace),
    semantic_revision_history_invariant: a.semantic_revision_history_fingerprint === b.semantic_revision_history_fingerprint
  });
}

function transitiveSpecimen() {
  return {
    case_id: 'MF04_TRANSITIVE_SPECIMEN',
    baseline_evidence: [evidence('SUPPORT', ['IDENTIFIABILITY:W'])],
    rules: [],
    contradiction_families: [],
    requested_warrant: 'IDENTIFIABILITY:W',
    events: [
      { event_id: 'A', semantic_label: 'SEM_A', kind: 'NOOP' },
      { event_id: 'B', semantic_label: 'SEM_B', kind: 'NOOP' },
      { event_id: 'C', semantic_label: 'SEM_C', kind: 'NOOP' }
    ]
  };
}

function mf04RedundantTransitiveEdge() {
  const reduced = evaluateWeaveRevisionLedger({
    case_id: 'MF04_REDUCED',
    base_specimen: transitiveSpecimen(),
    epochs: [{ epoch_id: 'R1', precedence_edges: [['A', 'B'], ['B', 'C']] }]
  });
  const explicitClosure = evaluateWeaveRevisionLedger({
    case_id: 'MF04_EXPLICIT_CLOSURE',
    base_specimen: transitiveSpecimen(),
    epochs: [{ epoch_id: 'R2', precedence_edges: [['A', 'B'], ['B', 'C'], ['A', 'C']] }]
  });
  return freezeRecord({
    case_id: 'MF04_REDUNDANT_TRANSITIVE_EDGE_EQUIVALENCE',
    reduced,
    explicit_closure: explicitClosure,
    relation_equivalent: reduced.current_relation_fingerprint === explicitClosure.current_relation_fingerprint,
    posture_equivalent: stable(reduced.current_posture) === stable(explicitClosure.current_posture)
  });
}

function mf05DuplicateEpochIdChangedRelation() {
  const receipt = evaluateWeaveRevisionLedger({
    case_id: 'MF05_DUPLICATE_EPOCH_ID_CHANGED_RELATION',
    base_specimen: centralSpecimen(),
    epochs: [
      { epoch_id: 'SAME_FOLDER', precedence_edges: [] },
      { epoch_id: 'SAME_FOLDER', precedence_edges: [['PINK', 'BLUE']] }
    ]
  });
  return freezeRecord({ case_id: 'MF05_DUPLICATE_EPOCH_ID_CHANGED_RELATION', receipt });
}

function mf06InvalidRelationUpdate() {
  const receipt = evaluateWeaveRevisionLedger({
    case_id: 'MF06_INVALID_CYCLIC_RELATION_UPDATE',
    base_specimen: centralSpecimen(),
    epochs: [
      { epoch_id: 'VALID_FIRST', precedence_edges: [['PINK', 'BLUE']] },
      { epoch_id: 'BROKEN_BANISTER', precedence_edges: [['PINK', 'BLUE'], ['BLUE', 'PINK']] }
    ]
  });
  return freezeRecord({ case_id: 'MF06_INVALID_CYCLIC_RELATION_UPDATE', receipt });
}

function mf07LatestStateCompaction() {
  const full = mf01MovingFloorplan().full;
  const compacted = mf01MovingFloorplan().compacted;
  return freezeRecord({
    case_id: 'MF07_LATEST_STATE_COMPACTION',
    current_relation_equal: full.current_relation_fingerprint === compacted.current_relation_fingerprint,
    current_posture_equal: stable(full.current_posture) === stable(compacted.current_posture),
    revision_history_equal: full.semantic_revision_history_fingerprint === compacted.semantic_revision_history_fingerprint,
    compacted_prior_posture_authority: false
  });
}

function mf08SemanticallyUnchangedReadmission() {
  const receipt = evaluateWeaveRevisionLedger({
    case_id: 'MF08_SEMANTICALLY_UNCHANGED_READMISSION',
    base_specimen: transitiveSpecimen(),
    epochs: [
      { epoch_id: 'FIRST_DECLARATION', precedence_edges: [['A', 'B'], ['B', 'C']] },
      { epoch_id: 'SECOND_DECLARATION', precedence_edges: [['A', 'B'], ['B', 'C'], ['A', 'C']] }
    ]
  });
  return freezeRecord({ case_id: 'MF08_SEMANTICALLY_UNCHANGED_READMISSION', receipt });
}

function mf09SealedEpochMutation() {
  const sealed = sealPrecedenceEpochDeclaration({ epoch_id: 'SEALED_K0', precedence_edges: [] });
  const mutation = requestSealedPrecedenceEpochMutation(sealed, [['PINK', 'BLUE']]);
  return freezeRecord({
    case_id: 'MF09_SEALED_PRIOR_EPOCH_MUTATION',
    sealed,
    mutation,
    sealed_still_empty: sealed.precedence_edges.length === 0
  });
}

function mf10SameCurrentDifferentHistories() {
  const timelineA = evaluateWeaveRevisionLedger({
    case_id: 'MF10_TIMELINE_A',
    base_specimen: centralSpecimen(),
    epochs: [{ epoch_id: 'ONLY', precedence_edges: [] }]
  });
  const timelineB = evaluateWeaveRevisionLedger({
    case_id: 'MF10_TIMELINE_B',
    base_specimen: centralSpecimen(),
    epochs: [
      { epoch_id: 'START', precedence_edges: [] },
      { epoch_id: 'RESOLVED', precedence_edges: [['BLUE', 'PINK']] },
      { epoch_id: 'REOPENED', precedence_edges: [] }
    ]
  });
  return freezeRecord({
    case_id: 'MF10_SAME_CURRENT_RELATION_DIFFERENT_HISTORIES',
    timeline_a: timelineA,
    timeline_b: timelineB,
    current_relation_equivalent: timelineA.current_relation_fingerprint === timelineB.current_relation_fingerprint,
    current_posture_equivalent: stable(timelineA.current_posture) === stable(timelineB.current_posture),
    revision_history_equivalent: timelineA.semantic_revision_history_fingerprint === timelineB.semantic_revision_history_fingerprint
  });
}

export function runPedagogueMovingFloorplanGauntlet() {
  const mf01 = mf01MovingFloorplan();
  const mf02 = mf02OppositeLock();
  const mf03 = mf03EpochIdRenaming();
  const mf04 = mf04RedundantTransitiveEdge();
  const mf05 = mf05DuplicateEpochIdChangedRelation();
  const mf06 = mf06InvalidRelationUpdate();
  const mf07 = mf07LatestStateCompaction();
  const mf08 = mf08SemanticallyUnchangedReadmission();
  const mf09 = mf09SealedEpochMutation();
  const mf10 = mf10SameCurrentDifferentHistories();

  const expectedTrace01 = [
    'ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER',
    'IDENTIFIED_SUPPORT_INTERRUPTION',
    'ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER'
  ];
  const expectedTrace02 = [
    'ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER',
    'IDENTIFIED_CONTINUOUS_SUPPORT',
    'IDENTIFIED_SUPPORT_INTERRUPTION'
  ];

  const actualTrace01 = mf01.full.accepted_posture_trace.map(item => item.transient_support_continuity);
  const actualTrace02 = mf02.receipt.accepted_posture_trace.map(item => item.transient_support_continuity);

  const defeatConditions = [];
  if (!mf01.current_relation_equal || !mf01.current_posture_equal || mf01.revision_history_equal) {
    defeatConditions.push('CURRENT_STATE_COMPACTION_NOT_DISTINGUISHED_FROM_REVISION_HISTORY');
  }
  if (stable(actualTrace01) !== stable(expectedTrace01)) {
    defeatConditions.push('RESOLVE_THEN_REOPEN_POSTURE_TRACE_NOT_PRESERVED');
  }
  if (stable(actualTrace02) !== stable(expectedTrace02)) {
    defeatConditions.push('OPPOSITE_RESOLUTION_REPLACEMENT_TRACE_NOT_PRESERVED');
  }
  if (!mf03.semantic_posture_trace_invariant || !mf03.semantic_relation_trace_invariant || !mf03.semantic_revision_history_invariant) {
    defeatConditions.push('EPOCH_IDENTIFIER_RENAMING_CHANGED_SEMANTIC_CUSTODY');
  }
  if (!mf04.relation_equivalent || !mf04.posture_equivalent) {
    defeatConditions.push('REDUNDANT_TRANSITIVE_EDGE_CHANGED_SEMANTIC_RELATION');
  }
  if (!mf05.receipt.rejected_epochs.some(item => item.status === 'REJECT_EPOCH_IDENTIFIER_REUSE_WITH_DIFFERENT_RELATION')) {
    defeatConditions.push('DUPLICATE_EPOCH_IDENTIFIER_SEMANTIC_DISCONTINUITY_NOT_REFUSED');
  }
  const mf06Rejected = mf06.receipt.rejected_epochs.find(item => item.status === 'REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE');
  if (!mf06Rejected || mf06.receipt.current_epoch_id !== 'VALID_FIRST') {
    defeatConditions.push('INVALID_RELATION_UPDATE_OVERWROTE_LAST_ACCEPTED_WEAVE');
  }
  if (!mf07.current_relation_equal || !mf07.current_posture_equal || mf07.revision_history_equal || mf07.compacted_prior_posture_authority) {
    defeatConditions.push('LATEST_STATE_COMPACTION_ACQUIRED_HISTORICAL_AUTHORITY');
  }
  const mf08Epochs = mf08.receipt.accepted_epochs;
  if (mf08Epochs.length !== 2 || mf08Epochs[1].semantic_relation_changed_from_previous_accepted || mf08Epochs[1].posture_changed_from_previous_accepted) {
    defeatConditions.push('SEMANTICALLY_EQUIVALENT_READMISSION_MISCLASSIFIED_AS_RELATION_CHANGE');
  }
  if (mf09.mutation.status !== 'SEALED_PRECEDENCE_EPOCH_IMMUTABLE' || !mf09.sealed_still_empty) {
    defeatConditions.push('SEALED_PRECEDENCE_EPOCH_RETROACTIVELY_MUTATED');
  }
  if (!mf10.current_relation_equivalent || !mf10.current_posture_equivalent || mf10.revision_history_equivalent) {
    defeatConditions.push('SAME_CURRENT_RELATION_DIFFERENT_HISTORY_COLLAPSED');
  }

  const inheritedC4OverclaimEstablished =
    mf01.current_relation_equal &&
    mf01.current_posture_equal &&
    !mf01.revision_history_equal &&
    stable(actualTrace01) === stable(expectedTrace01);

  return freezeRecord({
    ok: true,
    schema: PEDAGOGUE_WEAVE_REVISION_CUSTODY_SCHEMA,
    inherited_c4_one_relation_result_preserved: true,
    inherited_c4_revision_custody_verdict: inheritedC4OverclaimEstablished
      ? 'WARRANT_WEAVE_C4_FALSIFIED_AS_PRECEDENCE_REVISION_CUSTODY_SUFFICIENT_FORM'
      : 'C4_PRECEDENCE_REVISION_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN',
    candidate: 'C5_WEAVE_REVISION_LEDGER',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: defeatConditions.length === 0
      ? 'WEAVE_REVISION_LEDGER_CANDIDATE_SURVIVES_BOUNDED_MOVING_FLOORPLAN'
      : 'WEAVE_REVISION_LEDGER_CANDIDATE_FALSIFIED_IN_BOUNDED_MOVING_FLOORPLAN',
    defeat_conditions: freezeArray(defeatConditions),
    rooms: freezeRecord({ mf01, mf02, mf03, mf04, mf05, mf06, mf07, mf08, mf09, mf10 }),
    learned_distinctions: freezeArray([
      'current precedence relation != precedence-revision history',
      'current identifiability posture != historical identifiability posture',
      'raw edge-list difference != semantic relation difference',
      'epoch identifier != precedence authority',
      'rejected relation update != current accepted relation',
      'return to prior relation != erasure of intervening custody epochs'
    ]),
    next_learning_action: defeatConditions.length === 0
      ? 'ATTACK_PRECEDENCE_REVISION_LEDGER_EDGE_ADMISSION_PROVENANCE_EVENT_SET_REVISION_AND_RELATION_SCOPE_BEFORE_FORMALISM_PROMOTION'
      : 'INSPECT_PREREGISTERED_C5_DEFEAT_WITHOUT_POSTHOC_REDEFINITION',
    H2: 'HELD_NOT_TESTED_HERE',
    H3: 'HELD_NOT_TESTED_HERE',
    intersections: 'HELD_NOT_OPENED_HERE',
    APERTURE_V32_REPLAY_STABILITY: 'HELD_NOT_YET_WITNESSED',
    promotion_authority: false,
    shared_pedagogue_engine_mutation: false,
    browser_execution: false,
    workflow_mutation: false,
    merge_performed: false,
    deployment_performed: false,
    release_authority: false,
    vercel_release_requires_issue_405_and_new_explicit_operator_gesture: true,
    scalar_aggregation_used: false
  });
}
