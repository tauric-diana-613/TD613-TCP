import { applyPathGenerator, pathObjectProjection } from './aperture-pedagogue-first-bounded-path-grammar.js';
import { blockDecomposeTqWord } from './aperture-pedagogue-target-equivalence-completeness-receipt-witness.js';

export const TARGET_EQUIVALENCE_QUOTIENT_CONGRUENCE_SCHEMA = 'td613.a15-r0.aperture-pedagogue-target-equivalence-quotient-congruence/v0.1';
export const TARGET_EQUIVALENCE_QUOTIENT_PARENT_RECEIPT = 'b08fab1ca7786a3f70c5e1816f41c1bc9f856723';

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
const SEASON_INDEX = freeze({ S0: 0, S1: 1, S2: 2, S3: 3 });
const CLOCK_BY_SEASON = freeze({ S0: 'P0', S1: 'P1', S2: 'P0', S3: 'P1' });
const D_Q = freeze({
  S0: freeze([0, 0, 0, 1]),
  S1: freeze([1, 0, 0, 0]),
  S2: freeze([0, 0, 0, 1]),
  S3: freeze([1, 0, 0, 0]),
});
const F_Q = freeze({
  S0: freeze([1, 1, 0, 0]),
  S1: freeze([0, 0, 1, 1]),
  S2: freeze([2, 2, 0, 0]),
  S3: freeze([0, 0, 2, 2]),
});

const addSeason = (season, amount) => SEASONS[(SEASON_INDEX[season] + amount) % 4];
const addV = (a, b) => a.map((value, i) => value + b[i]);
const scaleV = (a, n) => a.map((value) => value * n);
const vector = (matrix) => [matrix[0][0], matrix[0][1], matrix[1][0], matrix[1][1]];
const matrix = (v) => freeze([freeze([v[0], v[1]]), freeze([v[2], v[3]])]);
const Q = (n) => Array.from({ length: n }, () => 'Q');
const T = (n) => Array.from({ length: n }, () => 'T');

export function quotientCoordinate(word) {
  const d = blockDecomposeTqWord(word);
  if (d.status !== 'UNIQUE_TQ_Q_BLOCK_DECOMPOSITION_DERIVED') return freeze({ status: d.status });
  return freeze({ status: 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED', t: d.t, E: d.E, O: d.O });
}

function validCoordinate(c) {
  return c && [c.t, c.E, c.O].every((n) => Number.isInteger(n) && n >= 0);
}

export function parityTwistPair(t, E, O) {
  if (![t, E, O].every((n) => Number.isInteger(n) && n >= 0)) return null;
  return t % 2 === 0 ? freeze([E, O]) : freeze([O, E]);
}

export function multiplyQuotientCoordinates(left, right) {
  if (!validCoordinate(left) || !validCoordinate(right)) {
    return freeze({ status: 'QUOTIENT_COORDINATE_MULTIPLICATION_ABSTAINS' });
  }
  const [rE, rO] = parityTwistPair(left.t, right.E, right.O);
  return freeze({
    status: 'PARITY_TWISTED_QUOTIENT_PRODUCT_DERIVED',
    t: left.t + right.t,
    E: left.E + rE,
    O: left.O + rO,
  });
}

export function canonicalWordFromCoordinate(c) {
  if (!validCoordinate(c)) return freeze({ status: 'CANONICAL_QUOTIENT_WORD_ABSTAINS' });
  const word = c.t === 0 ? Q(c.E) : [...Q(c.E), 'T', ...Q(c.O), ...T(c.t - 1)];
  return freeze({ status: 'CANONICAL_QUOTIENT_WORD_DERIVED', coordinate: freeze({ t: c.t, E: c.E, O: c.O }), word: freeze(word) });
}

function sameCoordinate(a, b) {
  return validCoordinate(a) && validCoordinate(b) && a.t === b.t && a.E === b.E && a.O === b.O;
}

function swapPair([x, y]) { return [y, x]; }
function sigmaPower(parity, pair) { return parity % 2 === 0 ? [...pair] : swapPair(pair); }

function parityActionCertificate() {
  const basis = [[1, 0], [0, 1], [2, 3]];
  const rows = [];
  for (const p of [0, 1]) {
    for (const q of [0, 1]) {
      for (const pair of basis) {
        const lhs = sigmaPower((p + q) % 2, pair);
        const rhs = sigmaPower(p, sigmaPower(q, pair));
        rows.push(freeze({ p, q, pair: freeze(pair), lhs: freeze(lhs), rhs: freeze(rhs), equal: keyOf(lhs) === keyOf(rhs) }));
      }
    }
  }
  return freeze({
    passed: rows.every((row) => row.equal),
    finite_control: 'C2_PARITY_ACTION',
    universal_reduction: 'sigma^(t+u)=sigma^t o sigma^u because only t mod 2 and u mod 2 act on the coordinate pair',
    rows: freeze(rows),
  });
}

function algebraCertificate() {
  const parity = parityActionCertificate();
  const identity = freeze({ t: 0, E: 0, O: 0 });
  const leftIdentity = multiplyQuotientCoordinates(identity, freeze({ t: 5, E: 7, O: 11 }));
  const rightIdentity = multiplyQuotientCoordinates(freeze({ t: 5, E: 7, O: 11 }), identity);
  return freeze({
    passed: parity.passed
      && sameCoordinate(leftIdentity, { t: 5, E: 7, O: 11 })
      && sameCoordinate(rightIdentity, { t: 5, E: 7, O: 11 }),
    identity,
    parity_action: parity,
    associativity_proof: 'For a=(t,x), b=(u,y), c=(v,z), (a★b)★c has pair x+sigma^t(y)+sigma^(t+u)(z), while a★(b★c) has x+sigma^t(y)+sigma^t(sigma^u(z)); the C2 parity-action certificate identifies the final terms for all nonnegative t,u.',
    classification: parity.passed ? 'ASSOCIATIVE_PARITY_TWISTED_N_SEMIDIRECT_N2_COORDINATE_LAW' : 'PARITY_ACTION_CERTIFICATE_FAILED',
  });
}

function tickDepartureCounts(sourceSeason, t) {
  const counts = [0, 0, 0, 0];
  for (let i = 0; i < t; i += 1) counts[SEASON_INDEX[addSeason(sourceSeason, i)]] += 1;
  return counts;
}

function coordinateEndpointIncrement(sourceSeason, c) {
  let delta = [0, 0, 0, 0];
  const ticks = tickDepartureCounts(sourceSeason, c.t);
  for (const season of SEASONS) {
    delta = addV(delta, scaleV(F_Q[season], ticks[SEASON_INDEX[season]]));
  }
  delta = addV(delta, scaleV(D_Q[sourceSeason], c.E));
  delta = addV(delta, scaleV(D_Q[addSeason(sourceSeason, 1)], c.O));
  return delta;
}

function validSourceState(state) {
  return state
    && state.last_action === 'Q_PHASE_PULSE'
    && SEASONS.includes(state.forcing_season)
    && state.clock_phase === CLOCK_BY_SEASON[state.forcing_season]
    && Array.isArray(state.endpoint)
    && Array.isArray(state.operational_lineage);
}

export function evaluateQuotientCoordinateFromSource(sourceState, c) {
  if (!validSourceState(sourceState) || !validCoordinate(c)) {
    return freeze({ status: 'SOURCE_CONDITIONED_QUOTIENT_EVALUATION_ABSTAINS' });
  }
  const finalSeason = addSeason(sourceState.forcing_season, c.t);
  const qTotal = c.E + c.O;
  return freeze({
    status: 'SOURCE_CONDITIONED_QUOTIENT_TARGET_DERIVED',
    endpoint: matrix(addV(vector(sourceState.endpoint), coordinateEndpointIncrement(sourceState.forcing_season, c))),
    last_action: 'Q_PHASE_PULSE',
    operational_lineage: freeze([...sourceState.operational_lineage, ...Array.from({ length: qTotal }, () => 'Q_PHASE_PULSE')]),
    clock_phase: CLOCK_BY_SEASON[finalSeason],
    forcing_season: finalSeason,
  });
}

function quotientTargetProjection(symbolic) {
  if (symbolic?.status !== 'SOURCE_CONDITIONED_QUOTIENT_TARGET_DERIVED') return null;
  return freeze({
    endpoint: symbolic.endpoint,
    last_action: symbolic.last_action,
    operational_lineage: symbolic.operational_lineage,
    clock_phase: symbolic.clock_phase,
    forcing_season: symbolic.forcing_season,
  });
}

function minimalHistoryForSeason(season, index = 0) {
  return freeze({
    id: `Q729_${season}_${index}`,
    endpoint: freeze([freeze([10 + index, 20]), freeze([30, 40 + index])]),
    last_action: 'Q_PHASE_PULSE',
    operational_lineage: freeze(['A', 'B', 'Q_PHASE_PULSE']),
    clock_phase: CLOCK_BY_SEASON[season],
    forcing_season: season,
    custody_events: freeze([]),
    evolution_events: freeze([]),
    forcing_evolution_events: freeze([]),
  });
}

function evaluateWord(history, word) {
  let current = history;
  for (const generator of word) {
    const next = applyPathGenerator(current, generator);
    if (next?.status) return freeze({ passed: false, status: next.status });
    current = next;
  }
  return freeze({ passed: true, status: 'WORD_EVALUATED_FOR_QUOTIENT_HOSTILE', target: freeze(pathObjectProjection(current)), final_history: current });
}

function transitionLocalityControls() {
  const words = freeze([
    freeze([]), freeze(['Q']), freeze(['T']), freeze(['T', 'Q']),
    freeze(['Q', 'T', 'Q']), freeze(['T', 'T', 'Q', 'T']),
    freeze(['Q', 'T', 'T', 'T', 'T']), freeze(['T', 'T', 'T', 'T', 'Q']),
  ]);
  const rows = [];
  for (const season of SEASONS) {
    const history = minimalHistoryForSeason(season);
    const sourceState = pathObjectProjection(history);
    for (const word of words) {
      const actual = evaluateWord(history, word);
      const c = quotientCoordinate(word);
      const symbolic = evaluateQuotientCoordinateFromSource(sourceState, c);
      const symbolicTarget = quotientTargetProjection(symbolic);
      rows.push(freeze({ season, word, coordinate: c, actual: actual.target, symbolic, equal: actual.passed && symbolicTarget !== null && keyOf(actual.target) === keyOf(symbolicTarget) }));
    }
  }
  return freeze({
    passed: rows.every((row) => row.equal),
    rows: freeze(rows),
    symbolic_scope: 'The executable controls corroborate the field-local transition formula; universality follows from the declared additive T/Q update laws plus finite season/parity control, not from extending a word horizon.',
  });
}

function concatenationControls() {
  const pairs = freeze([
    freeze([freeze([]), freeze([])]),
    freeze([freeze(['Q']), freeze(['Q', 'T'])]),
    freeze([freeze(['T']), freeze(['Q'])]),
    freeze([freeze(['T', 'Q']), freeze(['Q', 'T', 'Q'])]),
    freeze([freeze(['Q', 'T', 'T']), freeze(['Q', 'Q', 'T'])]),
  ]);
  const rows = pairs.map(([u, v]) => {
    const direct = quotientCoordinate([...u, ...v]);
    const product = multiplyQuotientCoordinates(quotientCoordinate(u), quotientCoordinate(v));
    return freeze({ u, v, direct, product, equal: sameCoordinate(direct, product) });
  });
  return freeze({
    passed: rows.every((row) => row.equal),
    rows: freeze(rows),
    universal_proof: 'Every Q in v belonging to local block j lands in global block t(u)+j after concatenation. Therefore its parity is preserved when t(u) is even and swapped when t(u) is odd; T counts add.',
  });
}

export function quotientArrow(sourceState, c, routeWord = null) {
  const target = evaluateQuotientCoordinateFromSource(sourceState, c);
  if (target.status !== 'SOURCE_CONDITIONED_QUOTIENT_TARGET_DERIVED') {
    return freeze({ status: target.status, disposition: 'ABSTAIN_BEFORE_QUOTIENT_ARROW' });
  }
  return freeze({
    status: 'TYPED_QUOTIENT_ARROW_DERIVED',
    source_state: freeze(clone(sourceState)),
    source_key: keyOf(sourceState),
    coordinate: freeze({ t: c.t, E: c.E, O: c.O }),
    target_state: target,
    target_key: keyOf(target),
    route_word_custody: routeWord ? freeze([...routeWord]) : null,
  });
}

export function composeTypedQuotientArrows(first, second) {
  if (first?.status !== 'TYPED_QUOTIENT_ARROW_DERIVED' || second?.status !== 'TYPED_QUOTIENT_ARROW_DERIVED' || first.target_key !== second.source_key) {
    return freeze({
      status: 'QUOTIENT_PATH_TYPE_MISMATCH_ABSTAINS',
      disposition: 'ABSTAIN_BEFORE_TYPED_QUOTIENT_COMPOSITION',
      first_target_key: first?.target_key ?? null,
      second_source_key: second?.source_key ?? null,
    });
  }
  const product = multiplyQuotientCoordinates(first.coordinate, second.coordinate);
  const composed = quotientArrow(first.source_state, product);
  return freeze({
    status: 'TYPED_QUOTIENT_COMPOSITION_DERIVED',
    passed: composed.status === 'TYPED_QUOTIENT_ARROW_DERIVED' && composed.target_key === second.target_key,
    coordinate: product,
    source_key: first.source_key,
    middle_key: first.target_key,
    target_key: composed.target_key,
    second_target_key: second.target_key,
  });
}

function congruenceCertificate() {
  const u = freeze(['T', 'T', 'T', 'T', 'Q']);
  const v = freeze(['Q', 'T', 'T', 'T', 'T']);
  const q = freeze(['T', 'T', 'Q']);
  const r = freeze(['Q', 'T', 'T']);
  const cu = quotientCoordinate(u);
  const cv = quotientCoordinate(v);
  const cq = quotientCoordinate(q);
  const cr = quotientCoordinate(r);
  const rightSame = sameCoordinate(cu, cv)
    && sameCoordinate(multiplyQuotientCoordinates(cu, cq), multiplyQuotientCoordinates(cv, cq));
  const typedSame = sameCoordinate(cu, cv)
    && sameCoordinate(cq, cr)
    && sameCoordinate(multiplyQuotientCoordinates(cu, cq), multiplyQuotientCoordinates(cv, cr));
  return freeze({
    passed: rightSame && typedSame,
    right_congruence_symbolic: 'c(u)=c(v) implies c(uq)=c(u)★c(q)=c(v)★c(q)=c(vq); #728 converts coordinate equality back to complete target equality for every retained source.',
    typed_composition_symbolic: 'If first-route classes and second-route classes agree in quotient coordinates and the middle object is typed, the ★ product is representative-independent; source/target typing is checked separately rather than replaced by naked left congruence.',
    representative_controls: freeze({ u, v, q, r, cu, cv, cq, cr, right_same: rightSame, typed_same: typedSame }),
  });
}

function hostileControls() {
  const oddLeft = quotientCoordinate(['T']);
  const rightQ = quotientCoordinate(['Q']);
  const correctOdd = multiplyQuotientCoordinates(oddLeft, rightQ);
  const naiveNoSwap = freeze({ t: 1, E: 1, O: 0 });
  const directTQ = quotientCoordinate(['T', 'Q']);

  const collapsedA = quotientCoordinate(['Q', 'T', 'Q']);
  const collapsedB = quotientCoordinate(['Q', 'Q', 'T']);
  const qTotalsEqual = collapsedA.E + collapsedA.O === collapsedB.E + collapsedB.O;
  const coordinatesDistinct = !sameCoordinate(collapsedA, collapsedB);

  const routeA = freeze(['T', 'T', 'T', 'T', 'Q']);
  const routeB = freeze(['Q', 'T', 'T', 'T', 'T']);
  const routeCoordA = quotientCoordinate(routeA);
  const routeCoordB = quotientCoordinate(routeB);
  const custody = freeze([
    freeze({ route_id: 'A', word: routeA, quotient: routeCoordA }),
    freeze({ route_id: 'B', word: routeB, quotient: routeCoordB }),
  ]);

  const source0 = pathObjectProjection(minimalHistoryForSeason('S0', 0));
  const source1 = pathObjectProjection(minimalHistoryForSeason('S1', 1));
  const commonCoordinate = quotientCoordinate(['T', 'Q']);
  const target0 = evaluateQuotientCoordinateFromSource(source0, commonCoordinate);
  const target1 = evaluateQuotientCoordinateFromSource(source1, commonCoordinate);

  const first = quotientArrow(source0, quotientCoordinate(['T']));
  const wrongSecond = quotientArrow(source1, quotientCoordinate(['Q']));
  const typeMismatch = composeTypedQuotientArrows(first, wrongSecond);

  return freeze({
    passed: sameCoordinate(correctOdd, directTQ)
      && !sameCoordinate(naiveNoSwap, directTQ)
      && qTotalsEqual
      && coordinatesDistinct
      && sameCoordinate(routeCoordA, routeCoordB)
      && custody.length === 2
      && custody[0].route_id !== custody[1].route_id
      && keyOf(target0) !== keyOf(target1)
      && typeMismatch.status === 'QUOTIENT_PATH_TYPE_MISMATCH_ABSTAINS',
    odd_parity_swap_required: freeze({ correct: correctOdd, naive_no_swap: naiveNoSwap, direct: directTQ }),
    total_q_collapse_rejected: freeze({ a: collapsedA, b: collapsedB, q_totals_equal: qTotalsEqual, coordinates_distinct: coordinatesDistinct }),
    custody_externality: freeze({ same_quotient_class: sameCoordinate(routeCoordA, routeCoordB), ledger_entries: custody }),
    source_retention: freeze({ same_coordinate: commonCoordinate, source0, source1, target0, target1, distinct_targets: keyOf(target0) !== keyOf(target1) }),
    wrong_typed_middle_abstains: typeMismatch,
  });
}

export function runTargetEquivalenceQuotientCongruenceAssay() {
  const algebra = algebraCertificate();
  const concatenation = concatenationControls();
  const locality = transitionLocalityControls();
  const congruence = congruenceCertificate();
  const hostile = hostileControls();
  const passed = algebra.passed && concatenation.passed && locality.passed && congruence.passed && hostile.passed;
  return freeze({
    schema: TARGET_EQUIVALENCE_QUOTIENT_CONGRUENCE_SCHEMA,
    passed,
    status: passed ? 'TARGET_EQUIVALENCE_QUOTIENT_CONGRUENCE_ROUND_CLOSED' : 'TARGET_EQUIVALENCE_QUOTIENT_CONGRUENCE_OBLIGATION_FAILED',
    canonical_classification: passed
      ? 'SOURCE_RELATIVE_TARGET_EQUIVALENCE_DESCENDS_TO_ASSOCIATIVE_PARITY_TWISTED_CANONICAL_ROUTE_QUOTIENT_WITH_TYPED_COMPOSITION_AND_CUSTODY_EXTERNALITY'
      : null,
    parent_receipt: TARGET_EQUIVALENCE_QUOTIENT_PARENT_RECEIPT,
    quotient_object: freeze({
      coordinate_set: 'N x N x N',
      product: '(t,E,O)★(u,F,G)=(t+u,E,F shifted by parity of t; O,G shifted by parity of t)',
      identity: freeze({ t: 0, E: 0, O: 0 }),
      source_conditioned_evaluation: 'rho_s',
      route_custody_external: true,
      source_erasure_authorized: false,
    }),
    algebra,
    concatenation,
    transition_locality: locality,
    congruence,
    hostile,
    claim_ceiling: freeze({
      transport_assignment: false,
      connection: false,
      loop_endomorphism: false,
      inverse_morphisms: false,
      groupoid: false,
      holonomy: false,
      curvature: false,
      source_erasure: false,
      custody_deletion: false,
      proto_loom: false,
      a16: false,
      production: false,
      vercel: false,
    }),
    human_stop: passed ? 'HUMAN_𝄐_REQUIRED_BEFORE_ANY_TRANSPORT_ASSIGNMENT_OR_PATH_DEPENDENT_TRANSPORT_AUDITION' : 'PRESERVE_OBSTRUCTION_AND_STOP',
  });
}
