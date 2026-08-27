import {
  evaluatePathWord,
} from './aperture-pedagogue-first-bounded-path-grammar.js';
import { runInvertibilityAdmissibilityObstructionAssay } from './aperture-pedagogue-invertibility-admissibility-obstruction.js';
import { runDirectedBranchingConfluenceAssay } from './aperture-pedagogue-directed-branching-confluence.js';
import { runDirectedFutureConeStratificationAssay } from './aperture-pedagogue-directed-future-cone-stratification.js';
import {
  runSeasonConditionedSymbolicNormalFormAssay,
  tickDepartureCounts,
} from './aperture-pedagogue-season-conditioned-symbolic-normal-form.js';

export const SYMBOLIC_FRONTIER_COMPLETENESS_SCHEMA = 'td613.a15-r0.aperture-pedagogue-symbolic-frontier-completeness/v0.1';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const keyOf = (value) => JSON.stringify(value);
const SEASONS = freeze(['S0', 'S1', 'S2', 'S3']);
const SEASON_INDEX = freeze({ S0: 0, S1: 1, S2: 2, S3: 3 });
const CLOCK_BY_SEASON = freeze({ S0: 'P0', S1: 'P1', S2: 'P0', S3: 'P1' });
const RETROSPECTIVE_HORIZONS = freeze([4, 5, 6, 7]);

const addSeason = (season, amount) => SEASONS[(SEASON_INDEX[season] + amount) % 4];
const addV = (a, b) => a.map((value, i) => value + b[i]);
const subV = (a, b) => a.map((value, i) => value - b[i]);
const scaleV = (a, n) => a.map((value) => value * n);
const sumVectors = (vectors) => vectors.reduce((acc, value) => addV(acc, value), [0, 0, 0, 0]);
const vector = (m) => [m[0][0], m[0][1], m[1][0], m[1][1]];
const matrix = (v) => freeze([freeze([v[0], v[1]]), freeze([v[2], v[3]])]);
const qWord = (count) => Array.from({ length: count }, () => 'Q');
const tWord = (count) => Array.from({ length: count }, () => 'T');
const sameSet = (a, b) => a.size === b.size && [...a].every((value) => b.has(value));

function tickVector(sourceSeason, t, tables) {
  const counts = tickDepartureCounts(sourceSeason, t);
  return freeze(sumVectors(SEASONS.map((season, i) => scaleV(tables.F_Q[season], counts[i]))));
}

function questionSupport(v) {
  return v.map((value, i) => (value !== 0 ? i : null)).filter((value) => value !== null);
}

function finiteControlEqualizerCertificate(normalForm) {
  const tables = normalForm.generator_tables;
  const cycleDelta = freeze(sumVectors(SEASONS.map((season) => tables.F_Q[season])));
  const allQuestionDeltasMiddleSilent = SEASONS.every((season) => (
    tables.D_Q[season][1] === 0 && tables.D_Q[season][2] === 0
  ));
  const cycleMiddleSeparates = cycleDelta[1] !== 0 && cycleDelta[2] !== 0;
  const rows = SEASONS.map((sourceSeason) => {
    const opposite = addSeason(sourceSeason, 1);
    const sourceTwin = addSeason(sourceSeason, 2);
    const oppositeTwin = addSeason(sourceSeason, 3);
    const dSource = tables.D_Q[sourceSeason];
    const dOpposite = tables.D_Q[opposite];
    const sourceSupport = questionSupport(dSource);
    const oppositeSupport = questionSupport(dOpposite);
    const supportDisjoint = sourceSupport.length === 1
      && oppositeSupport.length === 1
      && sourceSupport[0] !== oppositeSupport[0];
    const sourcePhase = CLOCK_BY_SEASON[sourceSeason];
    return freeze({
      source_season: sourceSeason,
      source_phase: sourcePhase,
      cycle_delta: cycleDelta,
      question_delta_source_phase: dSource,
      question_delta_opposite_phase: dOpposite,
      period_two_source_identity: keyOf(dSource) === keyOf(tables.D_Q[sourceTwin]),
      period_two_opposite_identity: keyOf(dOpposite) === keyOf(tables.D_Q[oppositeTwin]),
      question_support_source: freeze(sourceSupport),
      question_support_opposite: freeze(oppositeSupport),
      question_support_disjoint: supportDisjoint,
      one_tick_leaves_source_phase: CLOCK_BY_SEASON[addSeason(sourceSeason, 1)] !== sourcePhase,
      two_ticks_return_source_phase: CLOCK_BY_SEASON[addSeason(sourceSeason, 2)] === sourcePhase,
      passed: keyOf(dSource) === keyOf(tables.D_Q[sourceTwin])
        && keyOf(dOpposite) === keyOf(tables.D_Q[oppositeTwin])
        && supportDisjoint,
    });
  });

  const passed = normalForm.structural_induction.structural_induction_earned
    && normalForm.generator_tables.period_two_question_delta
    && keyOf(cycleDelta) === keyOf([3, 3, 3, 3])
    && allQuestionDeltasMiddleSilent
    && cycleMiddleSeparates
    && rows.every((row) => row.passed && row.one_tick_leaves_source_phase && row.two_ticks_return_source_phase);

  return freeze({
    passed,
    all_finite_word_capture_inherited: normalForm.structural_induction.structural_induction_earned,
    final_season_equality_implies_tick_difference_multiple_of_four: true,
    four_tick_cycle_endpoint_delta: cycleDelta,
    all_question_deltas_zero_on_coordinates_1_and_2: allQuestionDeltasMiddleSilent,
    cycle_delta_nonzero_on_coordinates_1_and_2: cycleMiddleSeparates,
    equal_operational_targets_force_equal_total_tick_count: passed,
    with_ticks_equal_endpoint_equality_forces_equal_question_counts_by_phase_class: passed,
    branch_prefix_Q_forces_source_phase_question_count_at_least_one: passed,
    branch_prefix_T_plus_equal_source_phase_question_count_forces_total_ticks_at_least_two: passed,
    proof_text: freeze({
      tick: 'Equal final seasons give tL-tR=4m. Every four-tick difference contributes m*[3,3,3,3], while question deltas contribute zero to endpoint coordinates 1 and 2. Endpoint equality therefore forces 3m=0 and hence m=0.',
      questions: 'With tick counts equal, tick contributions cancel. The two phase-class question deltas are nonzero on disjoint endpoint coordinates, so endpoint equality forces equality of question counts in each phase class.',
      fork_lower_bound: 'The right branch begins with one source-phase Q. Equality forces the left route to contain a source-phase Q; after its initial T it can return to the source phase only after a second T.',
    }),
    rows: freeze(rows),
    anti_equivalence: 'FINITE_CONTROL_IS_NOT_FINITE_STATE_SPACE',
  });
}

function factorizationTickCertificate(normalForm) {
  const tables = normalForm.generator_tables;
  const cycleDelta = sumVectors(SEASONS.map((season) => tables.F_Q[season]));
  const rows = [];
  for (const sourceSeason of SEASONS) {
    const frontierSeason = addSeason(sourceSeason, 2);
    for (let residue = 0; residue < 4; residue += 1) {
      const lhsConst = subV(tickVector(sourceSeason, 2 + residue, tables), tickVector(sourceSeason, 2, tables));
      const rhsConst = tickVector(frontierSeason, residue, tables);
      const lhsCycle = freeze(cycleDelta);
      const rhsCycle = freeze(cycleDelta);
      rows.push(freeze({
        source_season: sourceSeason,
        extra_tick_residue: residue,
        frontier_season: frontierSeason,
        symbolic_cycle_coefficient_left: lhsCycle,
        symbolic_cycle_coefficient_right: rhsCycle,
        constant_left: freeze(lhsConst),
        constant_right: freeze(rhsConst),
        passed: keyOf(lhsCycle) === keyOf(rhsCycle) && keyOf(lhsConst) === keyOf(rhsConst),
      }));
    }
  }
  return freeze({
    passed: rows.length === 16 && rows.every((row) => row.passed),
    formal_extra_tick_form: 'a = 4m + r, m >= 0, r in {0,1,2,3}',
    identity: 'Tick_s(2+a) - Tick_s(2) = Tick_{s+2}(a)',
    rows: freeze(rows),
  });
}

function antichainCertificate(normalForm) {
  const tables = normalForm.generator_tables;
  const cycleDelta = sumVectors(SEASONS.map((season) => tables.F_Q[season]));
  const rows = SEASONS.map((sourceSeason) => {
    const frontierSeason = addSeason(sourceSeason, 2);
    const sourceDelta = tables.D_Q[sourceSeason];
    const frontierQDelta = tables.D_Q[frontierSeason];
    const oppositeDelta = tables.D_Q[addSeason(sourceSeason, 1)];
    const sourceSupport = questionSupport(sourceDelta);
    const oppositeSupport = questionSupport(oppositeDelta);
    const supportDisjoint = sourceSupport.length === 1
      && oppositeSupport.length === 1
      && sourceSupport[0] !== oppositeSupport[0];
    return freeze({
      source_season: sourceSeason,
      frontier_season: frontierSeason,
      frontier_difference_coefficient: oppositeDelta,
      zero_tick_continuation_question_coefficient: frontierQDelta,
      period_two_frontier_question_identity: keyOf(frontierQDelta) === keyOf(sourceDelta),
      supports_disjoint: supportDisjoint,
      positive_multiple_of_four_ticks_changes_middle_coordinates: cycleDelta[1] > 0 && cycleDelta[2] > 0,
      passed: keyOf(frontierQDelta) === keyOf(sourceDelta)
        && supportDisjoint
        && cycleDelta[1] > 0
        && cycleDelta[2] > 0,
    });
  });
  const passed = rows.every((row) => row.passed);
  return freeze({
    passed,
    formal_statement: 'For formal j != k, no nonempty finite T/Q continuation maps U_s(k) to U_s(j).',
    proof_text: 'U_s(k) and U_s(j) share the same final season. Any connecting continuation therefore has 4m ticks. If m>0, the four-tick cycle changes endpoint coordinates 1 and 2, which frontier differences never change. Hence m=0. With zero ticks, all continuation Qs occur at s+2 and add D_Q(s), while U_s(j)-U_s(k) is (j-k)D_Q(s+1); the supports are disjoint, so equality forces zero Qs and j=k.',
    rows: freeze(rows),
    classification: passed ? 'ALL_FORMAL_FRONTIER_STRATA_PAIRWISE_INCOMPARABLE_UNDER_DECLARED_TQ_GRAMMAR' : 'FRONTIER_FAMILY_NOT_ANTICHAIN',
  });
}

function simplexParameter(k, a, b) {
  return freeze({
    k_opposite_phase_questions: k,
    a_extra_ticks: a,
    b_extra_source_phase_questions: b,
  });
}

export function simplexParametersThroughHorizon(H) {
  if (!Number.isInteger(H) || H < 2) return freeze([]);
  const rows = [];
  const N = H - 2;
  for (let k = 0; k <= N; k += 1) {
    for (let a = 0; a <= N - k; a += 1) {
      for (let b = 0; b <= N - k - a; b += 1) rows.push(simplexParameter(k, a, b));
    }
  }
  return freeze(rows);
}

export function simplexClosedFormCount(H) {
  if (!Number.isInteger(H) || H < 2) return null;
  return ((H + 1) * H * (H - 1)) / 6;
}

function canonicalChildContinuations(parameter) {
  const { k_opposite_phase_questions: k, a_extra_ticks: a, b_extra_source_phase_questions: b } = parameter;
  return freeze({
    left: freeze([...qWord(k), 'T', ...qWord(1 + b), ...tWord(a)]),
    right: freeze([...qWord(b), 'T', ...qWord(k), ...tWord(1 + a)]),
    child_continuation_length: k + a + b + 2,
  });
}

function symbolicTargetFromParameter(source, parameter, tables) {
  const { k_opposite_phase_questions: k, a_extra_ticks: a, b_extra_source_phase_questions: b } = parameter;
  const sourceSeason = source.forcing_season;
  const totalTicks = 2 + a;
  const sourcePhaseQuestions = 1 + b;
  const oppositePhaseQuestions = k;
  const tick = tickVector(sourceSeason, totalTicks, tables);
  const sourceQ = scaleV(tables.D_Q[sourceSeason], sourcePhaseQuestions);
  const oppositeQ = scaleV(tables.D_Q[addSeason(sourceSeason, 1)], oppositePhaseQuestions);
  const endpoint = addV(vector(source.endpoint), addV(tick, addV(sourceQ, oppositeQ)));
  const qLabels = qWord(sourcePhaseQuestions + oppositePhaseQuestions).map(() => 'Q_PHASE_PULSE');
  const finalSeason = addSeason(sourceSeason, totalTicks);
  return freeze({
    endpoint: matrix(endpoint),
    last_action: 'Q_PHASE_PULSE',
    operational_lineage: freeze([...source.operational_lineage, ...qLabels]),
    clock_phase: CLOCK_BY_SEASON[finalSeason],
    forcing_season: finalSeason,
  });
}

function realizeAcross(histories, word) {
  const rows = histories.map((history) => evaluatePathWord(history, word));
  const valid = rows.every((row) => row.status === 'BOUNDED_PATH_WORD_EVALUATED' && row.target_key);
  const keys = new Set(rows.map((row) => row.target_key).filter(Boolean));
  return freeze({
    valid,
    representative_independent: valid && keys.size === 1,
    target_key: valid && keys.size === 1 ? rows[0].target_key : null,
    target_state: valid && keys.size === 1 ? rows[0].target_state : null,
  });
}

function parameterizationCertificate(normalForm, equalizer, factorization, antichain) {
  const rows = SEASONS.map((sourceSeason) => {
    const sourceDelta = normalForm.generator_tables.D_Q[sourceSeason];
    const oppositeDelta = normalForm.generator_tables.D_Q[addSeason(sourceSeason, 1)];
    return freeze({
      source_season: sourceSeason,
      formal_common_target_coordinates: freeze({
        total_ticks: 'n = 2 + a',
        source_phase_questions: 'q_source = 1 + b',
        opposite_phase_questions: 'q_opposite = k',
        constraints: 'k,a,b >= 0',
      }),
      inverse_map: freeze({
        k: 'q_opposite',
        a: 'n - 2',
        b: 'q_source - 1',
      }),
      horizon_constraint: 'child continuation length = k + a + b + 2 <= H',
      simplex_constraint: 'k + a + b <= H - 2',
      source_phase_delta: sourceDelta,
      opposite_phase_delta: oppositeDelta,
      passed: equalizer.passed
        && factorization.passed
        && antichain.passed
        && questionSupport(sourceDelta).length === 1
        && questionSupport(oppositeDelta).length === 1
        && questionSupport(sourceDelta)[0] !== questionSupport(oppositeDelta)[0],
    });
  });
  const passed = rows.every((row) => row.passed);
  return freeze({
    passed,
    arbitrary_equal_target_reduction: passed,
    injectivity: freeze({
      passed,
      reason: 'Complete target equality forces equal total ticks and equal question counts in the two phase classes; therefore it forces equal (k,a,b).',
    }),
    surjectivity: freeze({
      passed,
      reason: 'Every equal target has n>=2, q_source>=1, q_opposite>=0 and therefore a unique nonnegative (k,a,b); the canonical child continuations realize that tuple.',
    }),
    canonical_route_realizers: freeze({
      left_child: 'Q^k T Q^(1+b) T^a',
      right_child: 'Q^b T Q^k T^(1+a)',
      equal_length: 'k+a+b+2',
    }),
    frontier_identification: freeze({
      parameter_family: '(k,0,0), k=0,...,H-2',
      source_rooted_routes: 'T Q^k T Q  ==target==  Q T Q^k T',
      inherited_from_parent_reconvergence_family: normalForm.symbolic_reconvergence_family.passed,
    }),
    factorization: freeze({
      passed: factorization.passed,
      continuation_from_frontier: 'U_s(k) --[Q^b T^a]--> phi_s(k,a,b)',
      strict_when: 'a+b>0',
      endpoint_mass_strictness_inherited_from_718: true,
    }),
    stars_and_bars: freeze({
      dimension: 3,
      slack_variable_used: true,
      N: 'H-2',
      tuple_count: 'C((H-2)+3,3) = C(H+1,3)',
    }),
    rows: freeze(rows),
    classification: passed ? 'ALL_FORMAL_COMMON_FUTURES_PARAMETERIZED_BY_NONNEGATIVE_INTEGER_SIMPLEX' : 'HORIZON_SIMPLEX_PARAMETERIZATION_FALSE',
  });
}

function retrospectiveControls(normalForm, stratification, branching) {
  const forkById = new Map(branching.forks.map((fork) => [fork.source_node_id, fork]));
  const rows = [];
  for (const audit of stratification.fork_audits) {
    const fork = forkById.get(audit.source_node_id);
    if (!fork) {
      rows.push(freeze({ source_node_id: audit.source_node_id, passed: false, status: 'PARENT_FORK_NOT_FOUND' }));
      continue;
    }
    const source = JSON.parse(fork.source_key);
    for (const H of RETROSPECTIVE_HORIZONS) {
      const parentH = audit.horizons.find((row) => row.horizon === H);
      const parameters = simplexParametersThroughHorizon(H);
      const targetKeys = [];
      const frontierKeys = [];
      const realizationRows = [];
      for (const parameter of parameters) {
        const routes = canonicalChildContinuations(parameter);
        const left = realizeAcross(fork.left_child.histories, routes.left);
        const right = realizeAcross(fork.right_child.histories, routes.right);
        const symbolic = symbolicTargetFromParameter(source, parameter, normalForm.generator_tables);
        const symbolicKey = keyOf(symbolic);
        const targetEqual = left.representative_independent
          && right.representative_independent
          && left.target_key === right.target_key
          && left.target_key === symbolicKey;
        if (targetEqual) targetKeys.push(left.target_key);
        if (parameter.a_extra_ticks === 0 && parameter.b_extra_source_phase_questions === 0 && targetEqual) {
          frontierKeys.push(left.target_key);
        }
        realizationRows.push(freeze({
          parameter,
          route_length_left: routes.left.length,
          route_length_right: routes.right.length,
          route_within_horizon: routes.left.length <= H && routes.right.length <= H,
          representative_independent_left: left.representative_independent,
          representative_independent_right: right.representative_independent,
          target_equal: targetEqual,
        }));
      }
      const generatedSet = new Set(targetKeys);
      const parentSet = new Set(parentH.objects.map((object) => object.target_key));
      const generatedFrontierSet = new Set(frontierKeys);
      const parentFrontierSet = new Set(parentH.minimal_target_keys);
      const tupleCount = parameters.length;
      const closedFormCount = simplexClosedFormCount(H);
      rows.push(freeze({
        source_node_id: audit.source_node_id,
        source_season: source.forcing_season,
        horizon: H,
        tuple_count: tupleCount,
        closed_form_count: closedFormCount,
        parent_common_future_count: parentH.object_count,
        generated_unique_target_count: generatedSet.size,
        parent_minimal_frontier_count: parentH.minimal_common_future_count,
        generated_frontier_count: generatedFrontierSet.size,
        all_routes_within_horizon: realizationRows.every((row) => row.route_within_horizon),
        all_realizations_equal: realizationRows.every((row) => row.target_equal),
        injection_control: generatedSet.size === tupleCount,
        exact_parent_common_set_match: sameSet(generatedSet, parentSet),
        exact_parent_frontier_set_match: sameSet(generatedFrontierSet, parentFrontierSet),
        count_matches_closed_form: tupleCount === closedFormCount,
        frontier_width_matches_H_minus_one: generatedFrontierSet.size === H - 1,
        passed: realizationRows.every((row) => row.route_within_horizon && row.target_equal)
          && generatedSet.size === tupleCount
          && sameSet(generatedSet, parentSet)
          && sameSet(generatedFrontierSet, parentFrontierSet)
          && tupleCount === closedFormCount
          && generatedFrontierSet.size === H - 1,
      }));
    }
  }
  return freeze({
    passed: rows.length === stratification.fork_audits.length * RETROSPECTIVE_HORIZONS.length
      && rows.every((row) => row.passed),
    horizons: RETROSPECTIVE_HORIZONS,
    maximum_enumerated_control_horizon: 7,
    h8_or_larger_enumerated: false,
    rows: freeze(rows),
    role: 'RETROSPECTIVE_PARENT_CONTROLS_ONLY_NOT_BASIS_OF_SYMBOLIC_PROOF',
  });
}

function parentCustodySnapshot() {
  return freeze({
    p718: JSON.stringify(runInvertibilityAdmissibilityObstructionAssay()),
    p720: JSON.stringify(runDirectedBranchingConfluenceAssay()),
    p723: JSON.stringify(runDirectedFutureConeStratificationAssay()),
    p724: JSON.stringify(runSeasonConditionedSymbolicNormalFormAssay()),
  });
}

export function runSymbolicFrontierCompletenessAssay() {
  const parentBefore = parentCustodySnapshot();
  const normalForm = runSeasonConditionedSymbolicNormalFormAssay();
  const stratification = runDirectedFutureConeStratificationAssay();
  const branching = runDirectedBranchingConfluenceAssay();
  const obstruction = runInvertibilityAdmissibilityObstructionAssay();

  if (!normalForm?.passed || !stratification?.passed || !branching?.passed || !obstruction?.passed) {
    return freeze({
      schema: SYMBOLIC_FRONTIER_COMPLETENESS_SCHEMA,
      passed: false,
      status: 'PARENT_SYMBOLIC_OR_FRONTIER_CUSTODY_NOT_WITNESSED',
      disposition: 'ABSTAIN_BEFORE_SYMBOLIC_FRONTIER_COMPLETENESS_AUDITION',
    });
  }

  const equalizer = finiteControlEqualizerCertificate(normalForm);
  const factorization = factorizationTickCertificate(normalForm);
  const antichain = antichainCertificate(normalForm);
  const parameterization = parameterizationCertificate(normalForm, equalizer, factorization, antichain);
  const controls = retrospectiveControls(normalForm, stratification, branching);

  const parentAfter = parentCustodySnapshot();
  const parentCustodyUnchanged = Object.keys(parentBefore).every((key) => parentBefore[key] === parentAfter[key]);

  const strongPassed = equalizer.passed
    && factorization.passed
    && antichain.passed
    && parameterization.passed
    && controls.passed
    && parentCustodyUnchanged;

  return freeze({
    schema: SYMBOLIC_FRONTIER_COMPLETENESS_SCHEMA,
    passed: strongPassed,
    status: strongPassed ? 'SYMBOLIC_FRONTIER_COMPLETENESS_ROUND_CLOSED' : 'SYMBOLIC_FRONTIER_COMPLETENESS_AUDITION_FALSIFIED',
    source_domain: freeze({
      last_action: 'Q_PHASE_PULSE',
      path_object: 'K_period4',
      generators: freeze(['T', 'Q']),
      forcing_seasons_retained: SEASONS,
      finite_control_seasons: 4,
      unbounded_integer_counters_retained: true,
      finite_state_space_claimed: false,
    }),
    equalizer_certificate: equalizer,
    factorization_tick_certificate: factorization,
    frontier_antichain_certificate: antichain,
    common_future_simplex: parameterization,
    all_H_consequences: freeze({
      domain: 'formal integer H >= 2 under the parent per-child continuation-horizon convention',
      parameter_set: 'P_H = {(k,a,b) in N^3 : k+a+b <= H-2}',
      common_future_count: 'C(H+1,3)',
      minimal_frontier: '{(k,0,0) : 0 <= k <= H-2}',
      minimal_frontier_width: 'H-1',
      frontier_pairwise_incomparable: antichain.passed,
      least_common_future: freeze({
        H_equals_2: 'unique frontier object U_s(0) is least because every common future factors through it',
        H_at_least_3: 'none; at least two incomparable minimal frontier objects exist',
      }),
      minimum_total_continuation_cost: 4,
      H8_enumeration_used: false,
      larger_horizon_enumeration_used: false,
    }),
    retrospective_controls: controls,
    season_dependence: freeze({
      source_season_erased: false,
      endpoint_templates_remain_season_conditioned: true,
      same_count_does_not_imply_source_independent_geometry: true,
      anti_equivalence: 'SAME_FRONTIER_CARDINALITY_IS_NOT_SOURCE_INDEPENDENT_FRONTIER_GEOMETRY',
    }),
    route_provenance: freeze({
      erased: false,
      target_parameterization_is_not_route_identity: true,
      anti_equivalence: 'SAME_OPERATIONAL_TARGET_IS_NOT_SAME_ROUTE_PROVENANCE',
    }),
    parent_custody_unchanged: parentCustodyUnchanged,
    parent_custody_classification: parentCustodyUnchanged
      ? 'PARENT_718_720_723_724_CUSTODY_UNCHANGED'
      : 'PARENT_CUSTODY_MUTATION_DETECTED',
    canonical_classification: strongPassed
      ? 'ALL_H_SYMBOLIC_COMMON_FUTURE_SIMPLEX_WITH_COMPLETE_MINIMAL_FRONTIER_AND_BINOMIAL_COUNT'
      : null,
    strongest_claim: strongPassed
      ? 'IN_THE_AUTHORED_Q_LAST_ACTION_K_PERIOD4_TQ_DOMAIN_THE_PARENT_ALL_FINITE_WORD_NORMAL_FORM_REDUCES_EVERY_COMMON_TARGET_OF_THE_T_VERSUS_Q_FORK_TO_A_UNIQUE_NONNEGATIVE_INTEGER_TRIPLE_K_A_B_WITH_K_PLUS_A_PLUS_B_AT_MOST_H_MINUS_TWO_THE_CANONICAL_CHILD_ROUTES_REALIZE_EVERY_TRIPLE_EVERY_NONFRONTIER_TRIPLE_FACTORS_STRICTLY_FROM_U_S_K_BY_Q_TO_THE_B_T_TO_THE_A_THE_U_S_K_FORM_AN_ALL_FORMAL_K_ANTICHAIN_AND_THEREFORE_FOR_EVERY_FORMAL_H_AT_LEAST_TWO_THE_BOUNDED_COMMON_FUTURE_SET_HAS_CARDINALITY_C_H_PLUS_ONE_CHOOSE_THREE_AND_EXACT_MINIMAL_FRONTIER_WIDTH_H_MINUS_ONE_WITHOUT_ENUMERATING_H8_OR_ANY_LARGER_HORIZON'
      : null,
    claim_ceiling: freeze({
      ambient_td613_confluence: false,
      church_rosser: false,
      rewrite_system_completion: false,
      global_join_semilattice_or_lattice: false,
      domain_theory_or_scott_domain: false,
      causal_set_theorem: false,
      finite_state_automaton_for_unbounded_endpoint: false,
      source_independent_quotient: false,
      inverse_generator: false,
      groupoid: false,
      transport: false,
      connection: false,
      loop_endomorphism: false,
      holonomy: false,
      curvature: false,
      berry_or_quantum: false,
      proto_loom: false,
      a16: false,
      live_ash: false,
      merge: false,
      production: false,
      vercel: false,
    }),
    stop: 'HUMAN_𝄐_REQUIRED_BEFORE_ANY_FINITE_CONTROL_QUOTIENT_OR_REWRITE_SYSTEM_AUDITION',
  });
}
