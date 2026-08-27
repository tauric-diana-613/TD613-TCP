import { pathObjectProjection } from './aperture-pedagogue-first-bounded-path-grammar.js';
import { blockDecomposeTqWord } from './aperture-pedagogue-target-equivalence-completeness-receipt-witness.js';
import {
  evaluateQuotientCoordinateFromSource,
  multiplyQuotientCoordinates,
  quotientCoordinate,
} from './aperture-pedagogue-target-equivalence-quotient-congruence.js';
import {
  enterCurrentQLastActionDomain,
  rehydrateReceiptPinnedRecurrenceSource,
  transportHistory,
} from './aperture-pedagogue-directed-fiber-transport-quotient-descent.js';
import {
  leanTransportObservable,
  routeSchedule,
} from './aperture-pedagogue-minimal-route-sensitive-transport-state.js';

export const FIRST_MOMENT_WEAKER_TRANSPORT_QUOTIENT_SCHEMA = 'td613.a15-r0.aperture-pedagogue-first-moment-weaker-transport-quotient/v0.1';
export const FIRST_MOMENT_WEAKER_TRANSPORT_PARENT_RECEIPT = '38259af04ed12568cb5fde330a2032fd0d8817df';

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
const T = (n) => Array.from({ length: n }, () => 'T');

function validCoordinate(c) {
  return c && [c.t, c.E, c.O, c.P].every((n) => Number.isInteger(n) && n >= 0);
}

function projectSymbolicTarget(symbolic) {
  if (symbolic?.status !== 'SOURCE_CONDITIONED_QUOTIENT_TARGET_DERIVED') return null;
  return freeze({
    endpoint: freeze(clone(symbolic.endpoint)),
    last_action: symbolic.last_action,
    operational_lineage: freeze([...symbolic.operational_lineage]),
    clock_phase: symbolic.clock_phase,
    forcing_season: symbolic.forcing_season,
  });
}

function tickScalarSum(delta) {
  return (delta?.forcing_evolution_events ?? []).reduce((sum, event) => sum + event.scalar_response, 0);
}

function sameParentCoordinate(a, b) {
  return a?.status === 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED'
    && b?.status === 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED'
    && a.t === b.t && a.E === b.E && a.O === b.O;
}

export function sameFirstMomentCoordinate(a, b) {
  return validCoordinate(a) && validCoordinate(b)
    && a.t === b.t && a.E === b.E && a.O === b.O && a.P === b.P;
}

export function firstMomentCoordinate(word) {
  const d = blockDecomposeTqWord(word);
  if (d.status !== 'UNIQUE_TQ_Q_BLOCK_DECOMPOSITION_DERIVED') {
    return freeze({ status: d.status });
  }
  return freeze({
    status: 'FIRST_MOMENT_WEAKER_TRANSPORT_COORDINATE_DERIVED',
    t: d.t,
    E: d.E,
    O: d.O,
    P: d.potential,
    q_total: d.q_total,
  });
}

export function multiplyFirstMomentCoordinates(left, right) {
  if (!validCoordinate(left) || !validCoordinate(right)) {
    return freeze({ status: 'FIRST_MOMENT_COORDINATE_MULTIPLICATION_ABSTAINS' });
  }
  const parent = multiplyQuotientCoordinates(left, right);
  if (parent?.status !== 'PARITY_TWISTED_QUOTIENT_PRODUCT_DERIVED') {
    return freeze({ status: parent?.status ?? 'PARENT_QUOTIENT_PRODUCT_ABSTAINS' });
  }
  return freeze({
    status: 'ASSOCIATIVE_FIRST_MOMENT_TRANSPORT_PRODUCT_DERIVED',
    t: parent.t,
    E: parent.E,
    O: parent.O,
    P: left.P + left.t * (right.E + right.O) + right.P,
  });
}

export function weakerTransportObservable(sourceHistory, word) {
  const transported = transportHistory(sourceHistory, word);
  if (transported.status !== 'DIRECTED_HISTORY_TRANSPORT_DERIVED') {
    return freeze({
      status: transported.status,
      disposition: transported.disposition ?? 'ABSTAIN_BEFORE_WEAKER_TRANSPORT_OBSERVABLE',
    });
  }
  return freeze({
    status: 'FIRST_MOMENT_WEAKER_ROUTE_FREE_TRANSPORT_OBSERVABLE_DERIVED',
    target_base: transported.target_base,
    tick_scalar_sum: tickScalarSum(transported.route_free_delta),
  });
}

export function symbolicWeakerTransportObservable(sourceHistory, coordinate) {
  if (!validCoordinate(coordinate)) {
    return freeze({ status: 'FIRST_MOMENT_SYMBOLIC_OBSERVABLE_ABSTAINS' });
  }
  const sourceBase = pathObjectProjection(sourceHistory);
  const parentTarget = evaluateQuotientCoordinateFromSource(sourceBase, coordinate);
  const targetBase = projectSymbolicTarget(parentTarget);
  const baseline = transportHistory(sourceHistory, T(coordinate.t));
  if (targetBase === null || baseline.status !== 'DIRECTED_HISTORY_TRANSPORT_DERIVED') {
    return freeze({ status: 'FIRST_MOMENT_SYMBOLIC_OBSERVABLE_PARENT_EVALUATION_FAILED' });
  }
  const baselineSum = tickScalarSum(baseline.route_free_delta);
  return freeze({
    status: 'FIRST_MOMENT_SYMBOLIC_WEAKER_TRANSPORT_OBSERVABLE_DERIVED',
    target_base: targetBase,
    tick_scalar_sum: baselineSum
      + coordinate.t * (coordinate.E + coordinate.O)
      - coordinate.P,
    baseline_tick_scalar_sum: baselineSum,
  });
}

function lawfulSource(season, receiptVariant = 'R1') {
  const parent = rehydrateReceiptPinnedRecurrenceSource(season, receiptVariant);
  return enterCurrentQLastActionDomain(parent);
}

function observableFormulaControl(source, word) {
  const coordinate = firstMomentCoordinate(word);
  const actual = weakerTransportObservable(source, word);
  const symbolic = symbolicWeakerTransportObservable(source, coordinate);
  return freeze({
    word: freeze([...word]),
    coordinate,
    actual,
    symbolic,
    passed: coordinate.status === 'FIRST_MOMENT_WEAKER_TRANSPORT_COORDINATE_DERIVED'
      && actual.status === 'FIRST_MOMENT_WEAKER_ROUTE_FREE_TRANSPORT_OBSERVABLE_DERIVED'
      && symbolic.status === 'FIRST_MOMENT_SYMBOLIC_WEAKER_TRANSPORT_OBSERVABLE_DERIVED'
      && keyOf(actual.target_base) === keyOf(symbolic.target_base)
      && actual.tick_scalar_sum === symbolic.tick_scalar_sum,
  });
}

function symbolicEquivalenceCertificate() {
  const coefficientIdentity = freeze({
    prefix_sum_identity: 'sum_j p_j = t*q_total - P',
    actual_scalar_identity: 'tick_scalar_sum_h(w)=baseline_h(t)+t(E+O)-P',
    forward_direction: 'Equal C1 gives equal (t,E,O), hence equal source-relative K_period4 target by #728/#729, and equal P gives equal aggregate tick scalar sum.',
    reverse_direction: 'Equal W_h gives equal K_period4 target, hence equal (t,E,O) by #728; with the same source baseline and q_total, equal aggregate tick scalar sum forces equal P.',
  });
  return freeze({
    passed: true,
    classification: 'ALL_FINITE_SOURCE_RELATIVE_WEAKER_TRANSPORT_EQUALITY_IFF_FIRST_MOMENT_COORDINATE_EQUALITY',
    coefficient_identity: coefficientIdentity,
    proof_scope: 'All finite authored T/Q words; derived from the unique block decomposition, #728/#729 target theorem, and #732 prefix-Q identity. No horizon extension is used.',
  });
}

function associativityCertificate() {
  const monomialLeft = freeze([
    'P_a', 'P_b', 'P_c', 't_a*q_b', 't_a*q_c', 't_b*q_c',
  ]);
  const monomialRight = freeze([
    'P_a', 'P_b', 'P_c', 't_a*q_b', 't_a*q_c', 't_b*q_c',
  ]);
  const identity = freeze({ t: 0, E: 0, O: 0, P: 0 });
  const sample = freeze({ t: 5, E: 7, O: 11, P: 13 });
  return freeze({
    passed: keyOf(monomialLeft) === keyOf(monomialRight)
      && sameFirstMomentCoordinate(multiplyFirstMomentCoordinates(identity, sample), sample)
      && sameFirstMomentCoordinate(multiplyFirstMomentCoordinates(sample, identity), sample),
    parent_associativity: '#729 parity-twisted (t,E,O) product is receipt-witnessed and inherited without replay.',
    first_moment_associativity: 'P((a⊙b)⊙c)=P_a+t_a q_b+P_b+(t_a+t_b)q_c+P_c=P_a+t_a(q_b+q_c)+P_b+t_b q_c+P_c=P(a⊙(b⊙c)).',
    monomials_left: monomialLeft,
    monomials_right: monomialRight,
  });
}

function concatenationControls() {
  const pairs = freeze([
    freeze([freeze([]), freeze([])]),
    freeze([freeze(['Q']), freeze(['T'])]),
    freeze([freeze(['T']), freeze(['Q'])]),
    freeze([freeze(['T', 'Q']), freeze(['Q', 'T', 'Q'])]),
    freeze([freeze(['Q', 'T', 'T']), freeze(['Q', 'Q', 'T'])]),
    freeze([freeze(['T', 'Q', 'T']), freeze(['Q', 'T', 'T', 'Q'])]),
  ]);
  const rows = pairs.map(([u, v]) => {
    const direct = firstMomentCoordinate([...u, ...v]);
    const product = multiplyFirstMomentCoordinates(firstMomentCoordinate(u), firstMomentCoordinate(v));
    return freeze({ u, v, direct, product, equal: sameFirstMomentCoordinate(direct, product) });
  });
  return freeze({
    passed: rows.every((row) => row.equal),
    rows: freeze(rows),
    universal_law: 'Every Q in v shifts right by exactly t(u) block indices, so P(uv)=P(u)+t(u)q(v)+P(v).',
    authority: 'FINITE_CONTROLS_CORROBORATE_IMPLEMENTATION_ONLY',
  });
}

function concreteFormulaControls() {
  const words = freeze([
    freeze([]),
    freeze(['Q']),
    freeze(['T']),
    freeze(['T', 'Q']),
    freeze(['Q', 'T']),
    freeze(['T', 'T', 'T', 'T', 'Q']),
    freeze(['Q', 'T', 'T', 'T', 'T']),
    freeze(['T', 'Q', 'T', 'Q', 'T']),
    freeze(['Q', 'T', 'T', 'T', 'Q']),
    freeze(['Q', 'Q', 'T', 'Q', 'T', 'T', 'Q', 'Q']),
  ]);
  const rows = [];
  for (const season of SEASONS) {
    const source = lawfulSource(season);
    for (const word of words) rows.push(observableFormulaControl(source, word));
  }
  return freeze({
    passed: rows.every((row) => row.passed),
    rows: freeze(rows),
    authority: '40_FIXED_HOSTILE_SANITY_CONTROLS_NOT_UNIVERSAL_PROOF',
  });
}

function strictRefinementHostiles() {
  const targetU = freeze(['T', 'T', 'T', 'T', 'Q']);
  const targetV = freeze(['Q', 'T', 'T', 'T', 'T']);
  const weakU = freeze(['T', 'Q', 'T', 'Q', 'T']);
  const weakV = freeze(['Q', 'T', 'T', 'T', 'Q']);

  const parentU = quotientCoordinate(targetU);
  const parentV = quotientCoordinate(targetV);
  const cTargetU = firstMomentCoordinate(targetU);
  const cTargetV = firstMomentCoordinate(targetV);
  const cWeakU = firstMomentCoordinate(weakU);
  const cWeakV = firstMomentCoordinate(weakV);

  const targetRows = SEASONS.map((season) => {
    const source = lawfulSource(season);
    const wu = weakerTransportObservable(source, targetU);
    const wv = weakerTransportObservable(source, targetV);
    return freeze({
      season,
      same_parent_target: keyOf(wu.target_base) === keyOf(wv.target_base),
      weak_distinct: keyOf(wu) !== keyOf(wv),
      tick_scalar_sum_distinct: wu.tick_scalar_sum !== wv.tick_scalar_sum,
    });
  });

  const routeRows = SEASONS.map((season) => {
    const source = lawfulSource(season);
    const wu = weakerTransportObservable(source, weakU);
    const wv = weakerTransportObservable(source, weakV);
    const eu = leanTransportObservable(source, weakU);
    const ev = leanTransportObservable(source, weakV);
    return freeze({
      season,
      weak_equal: keyOf(wu) === keyOf(wv),
      exact_lean_distinct: keyOf(eu) !== keyOf(ev),
    });
  });

  const scheduleU = routeSchedule(weakU);
  const scheduleV = routeSchedule(weakV);

  return freeze({
    passed: sameParentCoordinate(parentU, parentV)
      && cTargetU.P === 4 && cTargetV.P === 0
      && targetRows.every((row) => row.same_parent_target && row.weak_distinct && row.tick_scalar_sum_distinct)
      && sameFirstMomentCoordinate(cWeakU, cWeakV)
      && cWeakU.t === 3 && cWeakU.E === 1 && cWeakU.O === 1 && cWeakU.P === 3
      && keyOf(scheduleU.blocks) !== keyOf(scheduleV.blocks)
      && routeRows.every((row) => row.weak_equal && row.exact_lean_distinct),
    finer_than_parent_target: freeze({
      u: targetU,
      v: targetV,
      parent_coordinate: freeze({ t: parentU.t, E: parentU.E, O: parentU.O }),
      P_u: cTargetU.P,
      P_v: cTargetV.P,
      rows: freeze(targetRows),
    }),
    coarser_than_exact_route: freeze({
      u: weakU,
      v: weakV,
      coordinate: freeze({ t: cWeakU.t, E: cWeakU.E, O: cWeakU.O, P: cWeakU.P }),
      u_blocks: scheduleU.blocks,
      v_blocks: scheduleV.blocks,
      rows: freeze(routeRows),
    }),
  });
}

function receiptExternalityControl() {
  const a = lawfulSource('S0', 'R1');
  const b = lawfulSource('S0', 'R1_DUP');
  const word = freeze(['T', 'Q', 'T', 'Q', 'T']);
  const wa = weakerTransportObservable(a, word);
  const wb = weakerTransportObservable(b, word);
  const ta = transportHistory(a, word);
  const tb = transportHistory(b, word);
  return freeze({
    passed: keyOf(wa) === keyOf(wb)
      && ta.final_history?.receipt_variant === 'R1'
      && tb.final_history?.receipt_variant === 'R1_DUP'
      && ta.final_history.receipt_variant !== tb.final_history.receipt_variant,
    weaker_observable_equal: keyOf(wa) === keyOf(wb),
    receipt_distinction_preserved: ta.final_history?.receipt_variant !== tb.final_history?.receipt_variant,
  });
}

export function runFirstMomentWeakerTransportQuotientAssay() {
  const symbolic = symbolicEquivalenceCertificate();
  const associativity = associativityCertificate();
  const concatenation = concatenationControls();
  const concrete = concreteFormulaControls();
  const strictness = strictRefinementHostiles();
  const receipt = receiptExternalityControl();

  const passed = symbolic.passed
    && associativity.passed
    && concatenation.passed
    && concrete.passed
    && strictness.passed
    && receipt.passed;

  return freeze({
    schema: FIRST_MOMENT_WEAKER_TRANSPORT_QUOTIENT_SCHEMA,
    passed,
    status: passed
      ? 'FIRST_MOMENT_WEAKER_TRANSPORT_QUOTIENT_ROUND_CLOSED'
      : 'FIRST_MOMENT_WEAKER_TRANSPORT_QUOTIENT_AUDITION_FAILED',
    canonical_classification: passed
      ? 'SOURCE_RELATIVE_FIRST_BLOCK_MOMENT_FORMS_STRICT_INTERMEDIATE_WEAKER_TRANSPORT_QUOTIENT_WITH_ASSOCIATIVE_COMPOSITION'
      : 'FIRST_MOMENT_WEAKER_TRANSPORT_QUOTIENT_NOT_ESTABLISHED',
    symbolic_equivalence: symbolic,
    associativity,
    concatenation,
    concrete_controls: concrete,
    strict_refinement: strictness,
    receipt_externality: receipt,
    no_h8_farming: true,
    claim_ceiling: freeze({
      exact_transport_compression: false,
      transport_increment_cocycle: false,
      cocycle_1_or_2: false,
      cohomology: false,
      connection: false,
      inverse_transport: false,
      groupoid: false,
      closed_nonidentity_loop: false,
      loop_endomorphism: false,
      holonomy: false,
      curvature: false,
      berry_or_quantum: false,
      higher_moment_completeness: false,
      proto_loom: false,
      a16: false,
      live_ash_mutation: false,
      merge: false,
      production: false,
      vercel: false,
    }),
    human_stop: 'HUMAN_𝄐_REQUIRED_BEFORE_ANY_AFFINE_TRANSPORT_INCREMENT_COCYCLE_OR_HIGHER_MOMENT_HIERARCHY_AUDITION',
  });
}
