import {
  canonicalRuleSignature,
  makeSyntheticReplayWitness
} from './pedagogue-warrant-genealogy-ghost-house.js';
import {
  sealWarrantEpisode
} from './pedagogue-warrant-episode-ledger-after-midnight.js';

export const PEDAGOGUE_WARRANT_WEAVE_PARTIAL_ORDER_SCHEMA =
  'td613.pedagogue.warrant-weave-partial-order-hostile/v0.1';

const MAX_EVENTS = 8;
const freeze = value => Object.freeze(value);
const freezeArray = values => freeze([...values]);
const freezeRecord = value => freeze({ ...value });

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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
    replay_witness: makeSyntheticReplayWitness(base, `WITNESS:${canonicalRuleSignature(base)}`)
  });
}

function normalizeEvidence(input) {
  const byId = new Map();
  for (const item of input ?? []) {
    if (!item || typeof item.evidence_id !== 'string' || !item.evidence_id) {
      throw new TypeError('every evidence item requires evidence_id');
    }
    byId.set(item.evidence_id, {
      evidence_id: item.evidence_id,
      warrants: [...(item.warrants ?? [])].sort()
    });
  }
  return [...byId.values()].sort((a, b) => a.evidence_id.localeCompare(b.evidence_id));
}

function normalizeEvents(events) {
  if (!Array.isArray(events) || events.length === 0) throw new TypeError('events required');
  if (events.length > MAX_EVENTS) throw new RangeError(`event ceiling exceeded: ${events.length} > ${MAX_EVENTS}`);
  const ids = new Set();
  return events.map(event => {
    if (!event || typeof event.event_id !== 'string' || !event.event_id) throw new TypeError('event_id required');
    if (ids.has(event.event_id)) throw new Error(`duplicate event_id: ${event.event_id}`);
    ids.add(event.event_id);
    const kind = event.kind;
    if (!['ADD_EVIDENCE', 'REMOVE_EVIDENCE', 'NOOP'].includes(kind)) {
      throw new Error(`unsupported event kind: ${kind}`);
    }
    return freezeRecord({
      event_id: event.event_id,
      kind,
      add_evidence: freezeArray(normalizeEvidence(event.add_evidence ?? [])),
      remove_evidence_ids: freezeArray([...(event.remove_evidence_ids ?? [])].sort()),
      semantic_label: event.semantic_label ?? null
    });
  });
}

function normalizeEdges(edges, eventIds) {
  const seen = new Set();
  const normalized = [];
  for (const edge of edges ?? []) {
    if (!Array.isArray(edge) || edge.length !== 2) throw new TypeError('precedence edge must be [before, after]');
    const [before, after] = edge;
    if (!eventIds.has(before) || !eventIds.has(after)) {
      return freezeRecord({ status: 'REJECT_UNKNOWN_PRECEDENCE_EVENT', edges: freezeArray([]) });
    }
    if (before === after) {
      return freezeRecord({ status: 'REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE', edges: freezeArray([]) });
    }
    const key = `${before}\u0000${after}`;
    if (!seen.has(key)) {
      seen.add(key);
      normalized.push(freezeArray([before, after]));
    }
  }
  normalized.sort((a, b) => stable(a).localeCompare(stable(b)));
  return freezeRecord({ status: 'PRECEDENCE_ACCEPTED_FOR_ENUMERATION', edges: freezeArray(normalized) });
}

function enumerateSerializations(events, edges) {
  const byId = new Map(events.map(event => [event.event_id, event]));
  const prerequisites = new Map(events.map(event => [event.event_id, new Set()]));
  for (const [before, after] of edges) prerequisites.get(after).add(before);

  const serializations = [];
  const visit = (prefix, remaining) => {
    if (remaining.size === 0) {
      serializations.push(freezeArray(prefix));
      return;
    }
    const available = [...remaining]
      .filter(id => [...prerequisites.get(id)].every(required => !remaining.has(required)))
      .sort();
    for (const id of available) {
      const next = new Set(remaining);
      next.delete(id);
      visit([...prefix, id], next);
    }
  };
  visit([], new Set(byId.keys()));
  return freezeArray(serializations);
}

function applyEvent(currentEvidence, event) {
  const byId = new Map(normalizeEvidence(currentEvidence).map(item => [item.evidence_id, clone(item)]));
  if (event.kind === 'REMOVE_EVIDENCE') {
    for (const id of event.remove_evidence_ids) byId.delete(id);
  }
  if (event.kind === 'ADD_EVIDENCE') {
    for (const item of event.add_evidence) byId.set(item.evidence_id, clone(item));
  }
  return normalizeEvidence([...byId.values()]);
}

function presence(episode) {
  return episode.disposition.closure_warrants.includes(episode.requested_warrant);
}

function conflict(episode) {
  return episode.disposition.status === 'ABSTAIN_CONTRADICTORY_DERIVATIONAL_SUPPORT';
}

function replaySerialization({ case_id, baseline_evidence, rules, contradiction_families, requested_warrant, events }, serialization) {
  const byId = new Map(events.map(event => [event.event_id, event]));
  let currentEvidence = normalizeEvidence(baseline_evidence);
  const episodes = [sealWarrantEpisode({
    episode_id: `${case_id}:BASELINE`,
    evidence: currentEvidence,
    rules,
    contradiction_families,
    requested_warrant
  })];

  for (let index = 0; index < serialization.length; index += 1) {
    const eventId = serialization[index];
    currentEvidence = applyEvent(currentEvidence, byId.get(eventId));
    episodes.push(sealWarrantEpisode({
      episode_id: `${case_id}:STEP:${index + 1}:${eventId}`,
      evidence: currentEvidence,
      rules,
      contradiction_families,
      requested_warrant
    }));
  }

  const support = episodes.map(presence);
  const conflicts = episodes.map(conflict);
  const firstConflict = conflicts.findIndex(Boolean);
  const contradictionResolvedAfterEntry = firstConflict >= 0 && conflicts.slice(firstConflict + 1).some(value => value === false);
  const finalEpisode = episodes.at(-1);

  return freezeRecord({
    serialization: freezeArray(serialization),
    support_trace: freezeArray(support),
    conflict_trace: freezeArray(conflicts),
    continuously_supported: support.every(Boolean),
    ever_unsupported: support.some(value => value === false),
    ever_contradiction: conflicts.some(Boolean),
    contradiction_resolved_after_entry: contradictionResolvedAfterEntry,
    final_present: presence(finalEpisode),
    final_status: finalEpisode.disposition.status,
    final_snapshot_fingerprint: finalEpisode.current_snapshot_fingerprint,
    final_semantic_lineages: finalEpisode.disposition.semantic_lineage_fingerprints[requested_warrant] ?? freezeArray([])
  });
}

function unanimousBoolean(profiles, field, onTrue, onFalse, onMixed) {
  const values = [...new Set(profiles.map(profile => profile[field]))];
  if (values.length === 1) return values[0] ? onTrue : onFalse;
  return onMixed;
}

function semanticSummary(receipt) {
  return freezeRecord({
    status: receipt.status,
    final_presence: receipt.final_presence,
    final_snapshot_identified: receipt.final_snapshot_identified,
    transient_support_continuity: receipt.transient_support_continuity,
    contradiction_history: receipt.contradiction_history,
    contradiction_resolution_history: receipt.contradiction_resolution_history,
    selected_serialization: receipt.selected_serialization,
    lexical_tiebreak_used: receipt.lexical_tiebreak_used,
    partial_order_preserved: receipt.partial_order_preserved
  });
}

export function evaluateWarrantWeave({
  case_id = 'WARRANT_WEAVE_CASE',
  baseline_evidence = [],
  rules = [],
  contradiction_families = [],
  requested_warrant,
  events = [],
  precedence_edges = []
} = {}) {
  const normalizedEvents = normalizeEvents(events);
  const eventIds = new Set(normalizedEvents.map(event => event.event_id));
  const edgeReceipt = normalizeEdges(precedence_edges, eventIds);
  if (edgeReceipt.status !== 'PRECEDENCE_ACCEPTED_FOR_ENUMERATION') {
    return freezeRecord({
      candidate: 'C4_WARRANT_WEAVE',
      case_id,
      status: edgeReceipt.status,
      serializations: freezeArray([]),
      profiles: freezeArray([]),
      selected_serialization: null,
      lexical_tiebreak_used: false,
      partial_order_preserved: false,
      promotion_authority: false,
      scalar_aggregation_used: false
    });
  }

  const serializations = enumerateSerializations(normalizedEvents, edgeReceipt.edges);
  if (serializations.length === 0) {
    return freezeRecord({
      candidate: 'C4_WARRANT_WEAVE',
      case_id,
      status: 'REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE',
      serializations,
      profiles: freezeArray([]),
      selected_serialization: null,
      lexical_tiebreak_used: false,
      partial_order_preserved: false,
      promotion_authority: false,
      scalar_aggregation_used: false
    });
  }

  const profiles = freezeArray(serializations.map(serialization => replaySerialization({
    case_id,
    baseline_evidence,
    rules,
    contradiction_families,
    requested_warrant,
    events: normalizedEvents
  }, serialization)));

  const finalFingerprints = [...new Set(profiles.map(profile => profile.final_snapshot_fingerprint))];
  const finalPresence = unanimousBoolean(
    profiles,
    'final_present',
    'IDENTIFIED_PRESENT',
    'IDENTIFIED_ABSENT',
    'ABSTAIN_FINAL_STATE_NOT_IDENTIFIED_BY_PARTIAL_ORDER'
  );
  const transientSupport = unanimousBoolean(
    profiles,
    'continuously_supported',
    'IDENTIFIED_CONTINUOUS_SUPPORT',
    'IDENTIFIED_SUPPORT_INTERRUPTION',
    'ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER'
  );
  const contradictionHistory = unanimousBoolean(
    profiles,
    'ever_contradiction',
    'IDENTIFIED_CONTRADICTION_ENTERED',
    'IDENTIFIED_NO_CONTRADICTION_ENTERED',
    'ABSTAIN_CONTRADICTION_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER'
  );
  const contradictionResolutionHistory = unanimousBoolean(
    profiles,
    'contradiction_resolved_after_entry',
    'IDENTIFIED_CONTRADICTION_RESOLVED_AFTER_ENTRY',
    'IDENTIFIED_NO_RESOLUTION_AFTER_ENTRY',
    'ABSTAIN_CONTRADICTION_RESOLUTION_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER'
  );

  return freezeRecord({
    candidate: 'C4_WARRANT_WEAVE',
    case_id,
    status: 'PARTIAL_ORDER_REPLAY_COMPLETE',
    declared_event_count: normalizedEvents.length,
    declared_precedence_edges: edgeReceipt.edges,
    admissible_serialization_count: serializations.length,
    serializations,
    profiles,
    final_presence: finalPresence,
    final_snapshot_identified: finalFingerprints.length === 1,
    final_snapshot_fingerprints: freezeArray(finalFingerprints.sort()),
    transient_support_continuity: transientSupport,
    contradiction_history: contradictionHistory,
    contradiction_resolution_history: contradictionResolutionHistory,
    selected_serialization: null,
    lexical_tiebreak_used: false,
    deterministic_serialization_display_sort_only: true,
    partial_order_preserved: true,
    historical_authority_from_unidentified_precedence: false,
    promotion_authority: false,
    scalar_aggregation_used: false
  });
}

function centralFixture({ pinkId = 'PINK', blueId = 'BLUE', edges = [] } = {}) {
  return {
    case_id: 'TS01_TWO_STAIRCASES',
    baseline_evidence: [evidence('A', ['MEASUREMENT:A']), evidence('B', ['MEASUREMENT:B'])],
    rules: [
      witnessedRule('TS_AB', ['MEASUREMENT:A', 'MEASUREMENT:B'], 'IDENTIFIABILITY:W'),
      witnessedRule('TS_CD', ['MEASUREMENT:C', 'MEASUREMENT:D'], 'IDENTIFIABILITY:W')
    ],
    requested_warrant: 'IDENTIFIABILITY:W',
    events: [
      { event_id: pinkId, kind: 'REMOVE_EVIDENCE', remove_evidence_ids: ['A'] },
      { event_id: blueId, kind: 'ADD_EVIDENCE', add_evidence: [evidence('C', ['MEASUREMENT:C']), evidence('D', ['MEASUREMENT:D'])] }
    ],
    precedence_edges: edges.map(([before, after]) => [before, after])
  };
}

function ts02RenamingInvariance() {
  const original = evaluateWarrantWeave(centralFixture());
  const renamed = evaluateWarrantWeave(centralFixture({ pinkId: 'ZZZ_WITHDRAW', blueId: 'AAA_ADD' }));
  return freezeRecord({
    case_id: 'TS02_IDENTIFIER_RENAMING_INVARIANCE',
    original,
    renamed,
    semantic_summary_invariant: stable(semanticSummary(original)) === stable(semanticSummary(renamed))
  });
}

function ts03WithdrawThenAdd() {
  return freezeRecord({
    case_id: 'TS03_PRECEDENCE_WITHDRAW_THEN_ADD',
    receipt: evaluateWarrantWeave(centralFixture({ edges: [['PINK', 'BLUE']] }))
  });
}

function ts04AddThenWithdraw() {
  return freezeRecord({
    case_id: 'TS04_PRECEDENCE_ADD_THEN_WITHDRAW',
    receipt: evaluateWarrantWeave(centralFixture({ edges: [['BLUE', 'PINK']] }))
  });
}

function ts05Cycle() {
  return freezeRecord({
    case_id: 'TS05_CYCLIC_PRECEDENCE',
    receipt: evaluateWarrantWeave(centralFixture({ edges: [['PINK', 'BLUE'], ['BLUE', 'PINK']] }))
  });
}

function ts06UnrelatedConcurrency() {
  const receipt = evaluateWarrantWeave({
    case_id: 'TS06_UNRELATED_CONCURRENT_EVENT',
    baseline_evidence: [evidence('A', ['MEASUREMENT:A']), evidence('B', ['MEASUREMENT:B'])],
    rules: [witnessedRule('TS06_AB', ['MEASUREMENT:A', 'MEASUREMENT:B'], 'IDENTIFIABILITY:W')],
    requested_warrant: 'IDENTIFIABILITY:W',
    events: [
      { event_id: 'UNRELATED_Z', kind: 'ADD_EVIDENCE', add_evidence: [evidence('Z', ['MEASUREMENT:Z'])] },
      { event_id: 'UNRELATED_Q', kind: 'ADD_EVIDENCE', add_evidence: [evidence('Q', ['MEASUREMENT:Q'])] }
    ],
    precedence_edges: []
  });
  return freezeRecord({ case_id: 'TS06_UNRELATED_CONCURRENT_EVENT', receipt });
}

function ts07ContradictionHistory() {
  const receipt = evaluateWarrantWeave({
    case_id: 'TS07_CONTRADICTION_HISTORY_AMBIGUITY',
    baseline_evidence: [evidence('A', ['MEASUREMENT:A'])],
    rules: [
      witnessedRule('TS07_ALLOW', ['MEASUREMENT:A'], 'DECISION:ALLOW'),
      witnessedRule('TS07_DENY', ['MEASUREMENT:B'], 'DECISION:DENY')
    ],
    contradiction_families: [['DECISION:ALLOW', 'DECISION:DENY']],
    requested_warrant: 'DECISION:ALLOW',
    events: [
      { event_id: 'ADD_DENY', kind: 'ADD_EVIDENCE', add_evidence: [evidence('B', ['MEASUREMENT:B'])] },
      { event_id: 'REMOVE_ALLOW', kind: 'REMOVE_EVIDENCE', remove_evidence_ids: ['A'] }
    ],
    precedence_edges: []
  });
  return freezeRecord({ case_id: 'TS07_CONTRADICTION_HISTORY_AMBIGUITY', receipt });
}

function ts08ReplaySupportHandoff() {
  const receipt = evaluateWarrantWeave({
    ...centralFixture({ pinkId: 'WITHDRAW_WITNESSED_AB', blueId: 'ADD_WITNESSED_CD' }),
    case_id: 'TS08_REPLAY_SUPPORT_HANDOFF'
  });
  return freezeRecord({ case_id: 'TS08_REPLAY_SUPPORT_HANDOFF', receipt });
}

function ts09Noop() {
  const receipt = evaluateWarrantWeave({
    case_id: 'TS09_SEMANTIC_NOOP',
    baseline_evidence: [evidence('A', ['MEASUREMENT:A'])],
    rules: [witnessedRule('TS09_A', ['MEASUREMENT:A'], 'IDENTIFIABILITY:W')],
    requested_warrant: 'IDENTIFIABILITY:W',
    events: [{ event_id: 'NOOP', kind: 'NOOP' }],
    precedence_edges: []
  });
  return freezeRecord({ case_id: 'TS09_SEMANTIC_NOOP', receipt });
}

function ts10Compaction() {
  const full = evaluateWarrantWeave(centralFixture());
  const finalEvidence = [evidence('B', ['MEASUREMENT:B']), evidence('C', ['MEASUREMENT:C']), evidence('D', ['MEASUREMENT:D'])];
  const compacted = sealWarrantEpisode({
    episode_id: 'TS10_COMPACTED_FINAL_ONLY',
    evidence: finalEvidence,
    rules: centralFixture().rules,
    requested_warrant: 'IDENTIFIABILITY:W'
  });
  return freezeRecord({
    case_id: 'TS10_FINAL_STATE_COMPACTION_ATTACK',
    full,
    compacted_final_snapshot_fingerprint: compacted.current_snapshot_fingerprint,
    final_state_equal: full.final_snapshot_fingerprints.length === 1
      && full.final_snapshot_fingerprints[0] === compacted.current_snapshot_fingerprint,
    compacted_transient_history_authority: false,
    final_state_equivalence_implies_transient_history_equivalence: false
  });
}

export function runPedagogueWarrantWeaveTwoStaircasesGauntlet() {
  const ts01 = freezeRecord({ case_id: 'TS01_TWO_STAIRCASES', receipt: evaluateWarrantWeave(centralFixture()) });
  const ts02 = ts02RenamingInvariance();
  const ts03 = ts03WithdrawThenAdd();
  const ts04 = ts04AddThenWithdraw();
  const ts05 = ts05Cycle();
  const ts06 = ts06UnrelatedConcurrency();
  const ts07 = ts07ContradictionHistory();
  const ts08 = ts08ReplaySupportHandoff();
  const ts09 = ts09Noop();
  const ts10 = ts10Compaction();

  const c3DefeatedAsPartialOrderSufficient =
    ts01.receipt.admissible_serialization_count === 2
    && ts01.receipt.final_presence === 'IDENTIFIED_PRESENT'
    && ts01.receipt.final_snapshot_identified === true
    && ts01.receipt.transient_support_continuity === 'ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER';

  const defeatConditions = [];
  if (!c3DefeatedAsPartialOrderSufficient) defeatConditions.push('CENTRAL_PARTIAL_ORDER_ALIAS_NOT_EXPOSED');
  if (ts01.receipt.selected_serialization !== null || ts01.receipt.lexical_tiebreak_used !== false) defeatConditions.push('SERIALIZATION_CROWN_USED');
  if (!ts02.semantic_summary_invariant) defeatConditions.push('EVENT_IDENTIFIER_RENAMING_CHANGED_SEMANTIC_DISPOSITION');
  if (ts03.receipt.transient_support_continuity !== 'IDENTIFIED_SUPPORT_INTERRUPTION') defeatConditions.push('EXPLICIT_WITHDRAW_BEFORE_ADD_PRECEDENCE_NOT_HONORED');
  if (ts04.receipt.transient_support_continuity !== 'IDENTIFIED_CONTINUOUS_SUPPORT') defeatConditions.push('EXPLICIT_ADD_BEFORE_WITHDRAW_PRECEDENCE_NOT_HONORED');
  if (ts05.receipt.status !== 'REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE') defeatConditions.push('CYCLIC_PRECEDENCE_NOT_REJECTED');
  if (ts06.receipt.transient_support_continuity !== 'IDENTIFIED_CONTINUOUS_SUPPORT') defeatConditions.push('UNRELATED_CONCURRENCY_CREATED_FALSE_WARRANT_AMBIGUITY');
  if (ts07.receipt.contradiction_history !== 'ABSTAIN_CONTRADICTION_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER') defeatConditions.push('CONTRADICTION_HISTORY_AMBIGUITY_NOT_PRESERVED');
  if (ts08.receipt.transient_support_continuity !== 'ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER') defeatConditions.push('WITNESSED_SUPPORT_HANDOFF_AMBIGUITY_NOT_PRESERVED');
  if (ts09.receipt.transient_support_continuity !== 'IDENTIFIED_CONTINUOUS_SUPPORT') defeatConditions.push('NOOP_INVENTED_TRANSIENT_CHANGE');
  if (!ts10.final_state_equal || ts10.compacted_transient_history_authority !== false) defeatConditions.push('FINAL_STATE_COMPACTION_LAUNDERED_HISTORY_AUTHORITY');

  const candidateSurvives = defeatConditions.length === 0;
  return freezeRecord({
    schema: PEDAGOGUE_WARRANT_WEAVE_PARTIAL_ORDER_SCHEMA,
    inherited_c3_serial_result_preserved: true,
    c3_partial_order_verdict: c3DefeatedAsPartialOrderSufficient
      ? 'WARRANT_EPISODE_LEDGER_C3_FALSIFIED_AS_PARTIAL_ORDER_CUSTODY_SUFFICIENT_FORM'
      : 'C3_PARTIAL_ORDER_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN',
    candidate: 'C4_WARRANT_WEAVE',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: candidateSurvives
      ? 'WARRANT_WEAVE_CANDIDATE_SURVIVES_BOUNDED_TWO_STAIRCASES'
      : 'WARRANT_WEAVE_CANDIDATE_FALSIFIED_IN_BOUNDED_TWO_STAIRCASES',
    defeat_conditions: freezeArray(defeatConditions),
    rooms: freezeRecord({ ts01, ts02, ts03, ts04, ts05, ts06, ts07, ts08, ts09, ts10 }),
    learned_distinctions: freezeArray([
      'declared episode order != identified precedence',
      'serial replay != concurrency fidelity',
      'current-state identifiability != transient-history identifiability',
      'final-state equivalence != transient-history equivalence',
      'deterministic display order != historical authority'
    ]),
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
