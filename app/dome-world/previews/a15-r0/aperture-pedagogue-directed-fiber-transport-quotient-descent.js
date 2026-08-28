import {
  applyPathGenerator,
  pathObjectProjection,
} from './aperture-pedagogue-first-bounded-path-grammar.js';
import {
  evaluateQuotientCoordinateFromSource,
  quotientCoordinate,
} from './aperture-pedagogue-target-equivalence-quotient-congruence.js';

export const DIRECTED_FIBER_TRANSPORT_QUOTIENT_DESCENT_SCHEMA = 'td613.a15-r0.aperture-pedagogue-directed-fiber-transport-quotient-descent/v0.1';
export const DIRECTED_FIBER_TRANSPORT_PARENT_RECEIPT = 'bd33fc4010604dc9a0a84ba10ba4d721632ac4ef';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const clone = (value) => JSON.parse(JSON.stringify(value));
const keyOf = (value) => JSON.stringify(value);

const SEASONS = freeze(['S0', 'S1', 'S2', 'S3']);
const CLOCK_BY_SEASON = freeze({ S0: 'P0', S1: 'P1', S2: 'P0', S3: 'P1' });
const ALLOWED_GENERATORS = freeze(new Set(['T', 'Q']));
const FIBER_DELTA_KEYS = freeze(['custody_events', 'evolution_events', 'forcing_evolution_events']);
const FORBIDDEN_COMPARATOR_FIELDS = freeze([
  'word',
  'word_label',
  'history_id',
  'parent_history_id',
  'temporal_parent_history_id',
  'recurrence_parent_history_id',
  'source_key',
  'target_key',
]);

const baseProjectionFromSymbolic = (symbolic) => {
  if (symbolic?.status !== 'SOURCE_CONDITIONED_QUOTIENT_TARGET_DERIVED') return null;
  return freeze({
    endpoint: symbolic.endpoint,
    last_action: symbolic.last_action,
    operational_lineage: symbolic.operational_lineage,
    clock_phase: symbolic.clock_phase,
    forcing_season: symbolic.forcing_season,
  });
};

const ledger = (history, key) => Array.isArray(history?.[key]) ? history[key] : [];

export function rehydrateReceiptPinnedRecurrenceSource(season, receiptVariant = 'R1') {
  if (!SEASONS.includes(season) || !['R1', 'R1_DUP'].includes(receiptVariant)) {
    return freeze({
      status: 'RECEIPT_PINNED_RECURRENCE_SOURCE_REHYDRATION_ABSTAINS',
      season,
      receipt_variant: receiptVariant,
    });
  }

  const duplicate = receiptVariant === 'R1_DUP';
  return freeze({
    id: duplicate ? `R_AB_DUP_${season}` : `R_AB_${season}`,
    parent_record_id: 'AB',
    endpoint: freeze([freeze([3, 1]), freeze([1, 4])]),
    cumulative: 6,
    last_action: 'B',
    operational_lineage: freeze(['A', 'B']),
    receipt_variant: receiptVariant,
    custody_events: freeze([
      freeze({ action_id: 'A', scalar_response: 2, source: 'DERIVED_FROM_PARENT_CUSTODY' }),
      freeze({ action_id: 'B', scalar_response: 4, source: 'DERIVED_FROM_PARENT_CUSTODY' }),
    ]),
    temporal_source_history_id: duplicate ? 'H_AB_DUP' : 'H_AB',
    clock_phase: CLOCK_BY_SEASON[season],
    evolution_events: freeze([]),
    recurrence_source_history_id: duplicate ? `T_AB_DUP_${CLOCK_BY_SEASON[season]}` : `T_AB_${CLOCK_BY_SEASON[season]}`,
    forcing_season: season,
    forcing_evolution_events: freeze([]),
  });
}

export function enterCurrentQLastActionDomain(history) {
  const entered = applyPathGenerator(history, 'Q');
  if (entered?.status) return entered;
  return freeze(entered);
}

export function routeFreeTransportDelta(sourceHistory, targetHistory) {
  if (!sourceHistory || !targetHistory) {
    return freeze({ status: 'ROUTE_FREE_TRANSPORT_DELTA_ABSTAINS' });
  }

  const result = {};
  for (const key of FIBER_DELTA_KEYS) {
    const before = ledger(sourceHistory, key);
    const after = ledger(targetHistory, key);
    if (after.length < before.length) {
      return freeze({
        status: 'TRANSPORT_LEDGER_SHRANK_ABSTAINS',
        ledger: key,
        before_length: before.length,
        after_length: after.length,
      });
    }
    result[key] = freeze(clone(after.slice(before.length)));
  }
  return freeze(result);
}

function validWord(word) {
  return Array.isArray(word) && word.every((generator) => ALLOWED_GENERATORS.has(generator));
}

export function transportHistory(sourceHistory, word) {
  if (!sourceHistory || !validWord(word)) {
    return freeze({
      status: 'DIRECTED_HISTORY_TRANSPORT_ABSTAINS',
      disposition: 'ABSTAIN_BEFORE_DIRECTED_HISTORY_TRANSPORT',
    });
  }

  const sourceBase = pathObjectProjection(sourceHistory);
  let current = sourceHistory;
  for (let index = 0; index < word.length; index += 1) {
    const generator = word[index];
    const next = applyPathGenerator(current, generator);
    if (next?.status) {
      return freeze({
        status: next.status,
        disposition: next.disposition ?? 'ABSTAIN_BEFORE_DIRECTED_HISTORY_TRANSPORT',
        failed_index: index,
        generator,
      });
    }
    current = next;
  }

  const targetBase = pathObjectProjection(current);
  const coordinate = quotientCoordinate(word);
  const symbolic = evaluateQuotientCoordinateFromSource(sourceBase, coordinate);
  const symbolicBase = baseProjectionFromSymbolic(symbolic);
  const quotientCompatibleSource = sourceBase.last_action === 'Q_PHASE_PULSE';

  return freeze({
    status: 'DIRECTED_HISTORY_TRANSPORT_DERIVED',
    source_history: freeze(clone(sourceHistory)),
    final_history: current,
    source_base: sourceBase,
    target_base: targetBase,
    coordinate,
    route_free_delta: routeFreeTransportDelta(sourceHistory, current),
    quotient_compatibility: freeze({
      source_in_current_q_last_action_domain: quotientCompatibleSource,
      symbolic_status: symbolic?.status ?? null,
      target_matches_parent_quotient: quotientCompatibleSource
        && symbolicBase !== null
        && keyOf(targetBase) === keyOf(symbolicBase),
    }),
  });
}

export function composeTransportSegments(first, second) {
  if (first?.status !== 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
    || second?.status !== 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
    || keyOf(first.final_history) !== keyOf(second.source_history)) {
    return freeze({
      status: 'DIRECTED_TRANSPORT_TYPE_MISMATCH_ABSTAINS',
      disposition: 'ABSTAIN_BEFORE_DIRECTED_TRANSPORT_COMPOSITION',
    });
  }

  const composedDelta = freeze({
    custody_events: freeze([...first.route_free_delta.custody_events, ...second.route_free_delta.custody_events]),
    evolution_events: freeze([...first.route_free_delta.evolution_events, ...second.route_free_delta.evolution_events]),
    forcing_evolution_events: freeze([
      ...first.route_free_delta.forcing_evolution_events,
      ...second.route_free_delta.forcing_evolution_events,
    ]),
  });

  return freeze({
    status: 'DIRECTED_TRANSPORT_COMPOSITION_DERIVED',
    source_history: first.source_history,
    final_history: second.final_history,
    source_base: first.source_base,
    middle_base: first.target_base,
    target_base: second.target_base,
    route_free_delta: composedDelta,
  });
}

function compositionControl(source, u, v) {
  const direct = transportHistory(source, [...u, ...v]);
  const first = transportHistory(source, u);
  const second = first.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
    ? transportHistory(first.final_history, v)
    : freeze({ status: 'FIRST_TRANSPORT_FAILED' });
  const composed = composeTransportSegments(first, second);

  return freeze({
    u: freeze([...u]),
    v: freeze([...v]),
    direct,
    first,
    second,
    composed,
    exact_final_history_equal: direct.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
      && second.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
      && keyOf(direct.final_history) === keyOf(second.final_history),
    route_free_delta_equal: direct.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
      && composed.status === 'DIRECTED_TRANSPORT_COMPOSITION_DERIVED'
      && keyOf(direct.route_free_delta) === keyOf(composed.route_free_delta),
    target_base_equal: direct.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
      && second.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
      && keyOf(direct.target_base) === keyOf(second.target_base),
  });
}

function compositionCertificate() {
  const source = enterCurrentQLastActionDomain(rehydrateReceiptPinnedRecurrenceSource('S0', 'R1'));
  const controls = freeze([
    compositionControl(source, [], []),
    compositionControl(source, [], ['T']),
    compositionControl(source, ['Q'], []),
    compositionControl(source, ['T'], ['Q']),
    compositionControl(source, ['Q'], ['T', 'Q']),
    compositionControl(source, ['T', 'Q'], ['Q', 'T']),
    compositionControl(source, ['T', 'T'], ['Q', 'T', 'Q']),
  ]);

  const passed = controls.every((row) => row.exact_final_history_equal
    && row.route_free_delta_equal
    && row.target_base_equal);

  const identity = transportHistory(source, []);
  return freeze({
    passed: passed
      && identity.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
      && keyOf(identity.final_history) === keyOf(source)
      && FIBER_DELTA_KEYS.every((key) => identity.route_free_delta[key].length === 0),
    identity,
    controls,
    statement: 'tau_(uv)(h)=tau_v(tau_u(h)) for the fixed exact controls, with direct and sequential full histories plus route-free ledger deltas equal.',
  });
}

function receiptDistinctFiberControl() {
  const a = rehydrateReceiptPinnedRecurrenceSource('S0', 'R1');
  const b = rehydrateReceiptPinnedRecurrenceSource('S0', 'R1_DUP');
  const word = freeze(['T', 'Q']);
  const ta = transportHistory(a, word);
  const tb = transportHistory(b, word);

  return freeze({
    passed: keyOf(pathObjectProjection(a)) === keyOf(pathObjectProjection(b))
      && ta.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
      && tb.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
      && keyOf(ta.target_base) === keyOf(tb.target_base)
      && keyOf(ta.route_free_delta) === keyOf(tb.route_free_delta)
      && ta.final_history.receipt_variant === 'R1'
      && tb.final_history.receipt_variant === 'R1_DUP',
    source_base_equal: keyOf(pathObjectProjection(a)) === keyOf(pathObjectProjection(b)),
    target_base_equal: keyOf(ta.target_base) === keyOf(tb.target_base),
    appended_payloads_equal: keyOf(ta.route_free_delta) === keyOf(tb.route_free_delta),
    receipt_variants: freeze([ta.final_history.receipt_variant, tb.final_history.receipt_variant]),
    receipt_distinction_preserved: ta.final_history.receipt_variant !== tb.final_history.receipt_variant,
  });
}

function quotientDescentObstruction() {
  const u = freeze(['T', 'T', 'T', 'T', 'Q']);
  const v = freeze(['Q', 'T', 'T', 'T', 'T']);
  const cu = quotientCoordinate(u);
  const cv = quotientCoordinate(v);

  const rows = SEASONS.map((season) => {
    const recurrenceSource = rehydrateReceiptPinnedRecurrenceSource(season, 'R1');
    const source = enterCurrentQLastActionDomain(recurrenceSource);
    const tu = transportHistory(source, u);
    const tv = transportHistory(source, v);
    const sameCoordinate = cu.t === cv.t && cu.E === cv.E && cu.O === cv.O;
    const sameTarget = tu.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
      && tv.status === 'DIRECTED_HISTORY_TRANSPORT_DERIVED'
      && keyOf(tu.target_base) === keyOf(tv.target_base);
    const deltaDistinct = sameTarget && keyOf(tu.route_free_delta) !== keyOf(tv.route_free_delta);

    return freeze({
      season,
      same_coordinate: sameCoordinate,
      coordinate: freeze({ t: cu.t, E: cu.E, O: cu.O }),
      u_transport: tu,
      v_transport: tv,
      same_target_base: sameTarget,
      both_match_parent_quotient: tu.quotient_compatibility.target_matches_parent_quotient
        && tv.quotient_compatibility.target_matches_parent_quotient,
      route_free_transport_distinct: deltaDistinct,
      receipt_variant_same: tu.final_history?.receipt_variant === tv.final_history?.receipt_variant,
    });
  });

  const obstructionCount = rows.filter((row) => row.same_coordinate
    && row.same_target_base
    && row.both_match_parent_quotient
    && row.route_free_transport_distinct
    && row.receipt_variant_same).length;

  return freeze({
    passed: cu.t === 4 && cu.E === 1 && cu.O === 0
      && cv.t === 4 && cv.E === 1 && cv.O === 0
      && obstructionCount >= 1,
    u,
    v,
    coordinate_u: cu,
    coordinate_v: cv,
    rows: freeze(rows),
    obstruction_count: obstructionCount,
    all_four_seasons_obstruct: obstructionCount === SEASONS.length,
    descent_status: obstructionCount >= 1
      ? 'TARGET_EQUIVALENCE_QUOTIENT_DESCENT_OBSTRUCTED_BY_ROUTE_FREE_CUSTODY_TRANSPORT'
      : 'NO_QUOTIENT_DESCENT_OBSTRUCTION_FOUND_IN_PREREGISTERED_PAIR',
  });
}

function hostileControls(obstruction) {
  const deltaTopLevelKeys = Object.keys(obstruction.rows[0]?.u_transport?.route_free_delta ?? {});
  const routeLeakageExcluded = keyOf([...deltaTopLevelKeys].sort()) === keyOf([...FIBER_DELTA_KEYS].sort());
  const firstObstruction = obstruction.rows.find((row) => row.route_free_transport_distinct) ?? null;

  const source0 = enterCurrentQLastActionDomain(rehydrateReceiptPinnedRecurrenceSource('S0', 'R1'));
  const source1 = enterCurrentQLastActionDomain(rehydrateReceiptPinnedRecurrenceSource('S1', 'R1'));
  const first = transportHistory(source0, ['T']);
  const wrongSecond = transportHistory(source1, ['Q']);
  const mistyped = composeTransportSegments(first, wrongSecond);

  return freeze({
    passed: routeLeakageExcluded
      && firstObstruction !== null
      && firstObstruction.same_target_base
      && firstObstruction.route_free_transport_distinct
      && firstObstruction.receipt_variant_same
      && mistyped.status === 'DIRECTED_TRANSPORT_TYPE_MISMATCH_ABSTAINS',
    route_label_leakage_excluded: routeLeakageExcluded,
    comparator_top_level_keys: freeze(deltaTopLevelKeys),
    forbidden_comparator_fields: FORBIDDEN_COMPARATOR_FIELDS,
    base_only_collapse_rejected: firstObstruction
      ? firstObstruction.same_target_base && firstObstruction.route_free_transport_distinct
      : false,
    receipt_only_distinction_rejected: firstObstruction
      ? firstObstruction.receipt_variant_same && firstObstruction.route_free_transport_distinct
      : false,
    quotient_coordinate_only_transport_rejected: firstObstruction
      ? firstObstruction.same_coordinate && firstObstruction.route_free_transport_distinct
      : false,
    mistyped_continuation_abstains: mistyped,
    inverse_fabrication_authorized: false,
    loop_fabrication_authorized: false,
  });
}

export function runDirectedFiberTransportQuotientDescentAssay() {
  const composition = compositionCertificate();
  const representative = receiptDistinctFiberControl();
  const obstruction = quotientDescentObstruction();
  const hostile = hostileControls(obstruction);
  const passed = composition.passed && representative.passed && obstruction.passed && hostile.passed;

  return freeze({
    schema: DIRECTED_FIBER_TRANSPORT_QUOTIENT_DESCENT_SCHEMA,
    parent_receipt: DIRECTED_FIBER_TRANSPORT_PARENT_RECEIPT,
    passed,
    status: passed
      ? 'DIRECTED_HISTORY_FIBER_TRANSPORT_QUOTIENT_DESCENT_ROUND_CLOSED'
      : 'DIRECTED_HISTORY_FIBER_TRANSPORT_QUOTIENT_DESCENT_OBLIGATION_FAILED',
    canonical_classification: passed
      ? 'DIRECTED_HISTORY_LIFT_COMPOSES_EXACTLY_AND_TARGET_EQUIVALENT_ROUTES_CAN_TRANSPORT_DISTINCT_CUSTODY_PAYLOADS'
      : null,
    base_projection: 'pi(h)=K_period4(h)',
    transport_assignment: 'tau_w(h)=left-to-right application of the existing authored T/Q history lifts',
    transport_composition: composition,
    receipt_distinct_source_fiber: representative,
    quotient_descent_obstruction: obstruction,
    hostile,
    anti_equivalences: freeze([
      'TARGET_EQUALITY_IS_NOT_TRANSPORT_EQUALITY',
      'QUOTIENT_COORDINATE_EQUALITY_IS_NOT_ROUTE_FREE_CUSTODY_DELTA_EQUALITY',
      'REPRESENTATIVE_INDEPENDENT_BASE_TRANSPORT_IS_NOT_RECEIPT_ERASURE',
      'DIRECTED_TRANSPORT_IS_NOT_INVERSE_TRANSPORT',
      'PATH_DEPENDENCE_IS_NOT_HOLONOMY_WITHOUT_A_CLOSED_LOOP',
    ]),
    claim_ceiling: freeze({
      universal_quotient_descent: false,
      minimal_route_sensitive_transport_state: false,
      cocycle: false,
      cohomology: false,
      connection: false,
      inverse_transport: false,
      inverse_morphisms: false,
      groupoid: false,
      closed_nonidentity_loop: false,
      loop_endomorphism: false,
      holonomy: false,
      curvature: false,
      berry_or_quantum: false,
      manifold_fiber_bundle: false,
      proto_loom: false,
      a16: false,
      live_ash_mutation: false,
      merge: false,
      production: false,
      vercel: false,
    }),
    no_h8_farming: true,
    human_stop: passed
      ? 'HUMAN_𝄐_REQUIRED_BEFORE_ANY_MINIMAL_ROUTE_SENSITIVE_TRANSPORT_STATE_OR_COCYCLE_AUDITION'
      : 'PRESERVE_OBSTRUCTION_OR_FAILURE_AND_STOP',
  });
}
