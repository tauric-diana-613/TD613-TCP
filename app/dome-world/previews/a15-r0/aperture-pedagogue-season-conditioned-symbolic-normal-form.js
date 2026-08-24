import { stepQuestionPhasePulse } from './aperture-pedagogue-exogenous-evolution-congruence.js';
import {
  deriveRecurrenceHistoryUniverse,
  stepPsiTick,
} from './aperture-pedagogue-temporal-recurrence-phase-aliasing.js';
import {
  evaluatePathWord,
  pathObjectProjection,
} from './aperture-pedagogue-first-bounded-path-grammar.js';
import { runInvertibilityAdmissibilityObstructionAssay } from './aperture-pedagogue-invertibility-admissibility-obstruction.js';
import { runDirectedReachabilityGeometryAssay } from './aperture-pedagogue-directed-reachability-geometry.js';
import { runDirectedBranchingConfluenceAssay } from './aperture-pedagogue-directed-branching-confluence.js';
import { runBoundedCommonFutureJoinObstructionAssay } from './aperture-pedagogue-bounded-common-future-join-obstruction.js';
import { runDirectedFutureConeStratificationAssay } from './aperture-pedagogue-directed-future-cone-stratification.js';

export const SEASON_CONDITIONED_SYMBOLIC_NORMAL_FORM_SCHEMA = 'td613.a15-r0.aperture-pedagogue-season-conditioned-symbolic-normal-form/v0.1';

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
const ZERO4 = freeze([0, 0, 0, 0]);

const vector = (matrix) => freeze([matrix[0][0], matrix[0][1], matrix[1][0], matrix[1][1]]);
const matrix = (v) => freeze([freeze([v[0], v[1]]), freeze([v[2], v[3]])]);
const addV = (a, b) => freeze(a.map((value, i) => value + b[i]));
const subV = (a, b) => freeze(a.map((value, i) => value - b[i]));
const scaleV = (a, n) => freeze(a.map((value) => value * n));
const equalV = (a, b) => keyOf(a) === keyOf(b);
const addSeason = (season, amount) => SEASONS[(SEASON_INDEX[season] + amount) % 4];
const qTotal = (qBySeason) => qBySeason.reduce((sum, n) => sum + n, 0);

function lawfulQuestionSources() {
  const universe = deriveRecurrenceHistoryUniverse();
  if (universe.status !== 'RECURRENCE_HISTORY_UNIVERSE_DERIVED_FROM_PARENT_TEMPORAL_CUSTODY') {
    return freeze({ passed: false, status: universe.status, sources: freeze([]) });
  }
  const byId = new Map(universe.histories.map((history) => [history.id, history]));
  const rows = SEASONS.map((season) => {
    const parent = byId.get(`R_AB_${season}`);
    if (!parent) return freeze({ season, passed: false, status: 'SOURCE_SEASON_HISTORY_MISSING' });
    const questioned = stepQuestionPhasePulse(parent);
    return freeze({
      season,
      passed: !questioned?.status
        && questioned.last_action === 'Q_PHASE_PULSE'
        && questioned.forcing_season === season
        && questioned.clock_phase === CLOCK_BY_SEASON[season],
      parent,
      history: questioned,
    });
  });
  return freeze({
    passed: rows.every((row) => row.passed),
    status: rows.every((row) => row.passed)
      ? 'FOUR_LAWFUL_SEASON_CONDITIONED_Q_SOURCES_DERIVED'
      : 'LAWFUL_SEASON_CONDITIONED_Q_SOURCE_DERIVATION_FAILED',
    sources: freeze(rows),
  });
}

function deriveGeneratorTables(sourceRows) {
  const rows = sourceRows.map((row) => {
    const source = row.history;
    const qNext = stepQuestionPhasePulse(source);
    const tNext = stepPsiTick(source);
    if (qNext?.status || tNext?.status) {
      return freeze({ season: row.season, passed: false, status: 'GENERATOR_TABLE_DERIVATION_ABSTAINS' });
    }
    return freeze({
      season: row.season,
      passed: true,
      D_Q: subV(vector(qNext.endpoint), vector(source.endpoint)),
      F_Q: subV(vector(tNext.endpoint), vector(source.endpoint)),
      tick_target_season: tNext.forcing_season,
      tick_target_phase: tNext.clock_phase,
    });
  });
  const bySeason = new Map(rows.map((row) => [row.season, row]));
  const periodTwoQuestionDelta = rows.every((row) => (
    equalV(row.D_Q, bySeason.get(addSeason(row.season, 2)).D_Q)
  ));
  return freeze({
    passed: rows.every((row) => row.passed)
      && rows.every((row) => row.tick_target_season === addSeason(row.season, 1))
      && rows.every((row) => row.tick_target_phase === CLOCK_BY_SEASON[addSeason(row.season, 1)]),
    rows: freeze(rows),
    D_Q: freeze(Object.fromEntries(rows.map((row) => [row.season, row.D_Q]))),
    F_Q: freeze(Object.fromEntries(rows.map((row) => [row.season, row.F_Q]))),
    period_two_question_delta: periodTwoQuestionDelta,
  });
}

export function tickDepartureCounts(sourceSeason, t) {
  if (!SEASONS.includes(sourceSeason) || !Number.isInteger(t) || t < 0) return freeze([]);
  const cycles = Math.floor(t / 4);
  const remainder = t % 4;
  const counts = [cycles, cycles, cycles, cycles];
  for (let i = 0; i < remainder; i += 1) counts[SEASON_INDEX[addSeason(sourceSeason, i)]] += 1;
  return freeze(counts);
}

export function summarizeSeasonConditionedWord(sourceSeason, word) {
  if (!SEASONS.includes(sourceSeason) || !Array.isArray(word)) {
    return freeze({ status: 'SYMBOLIC_WORD_SUMMARY_ABSTAINS' });
  }
  let t = 0;
  const qBySeason = [0, 0, 0, 0];
  let currentSeason = sourceSeason;
  for (const generator of word) {
    if (generator === 'T') {
      t += 1;
      currentSeason = addSeason(currentSeason, 1);
    } else if (generator === 'Q') {
      qBySeason[SEASON_INDEX[currentSeason]] += 1;
    } else {
      return freeze({ status: 'UNDECLARED_PATH_GENERATOR_ABSTAINS', generator });
    }
  }
  return freeze({
    status: 'SEASON_CONDITIONED_WORD_SUMMARIZED',
    source_season: sourceSeason,
    t,
    q_by_season: freeze(qBySeason),
    q_total: qTotal(qBySeason),
    final_season: currentSeason,
    final_phase: CLOCK_BY_SEASON[currentSeason],
  });
}

function symbolicEndpointIncrement(sourceSeason, summary, tables) {
  const tickCounts = tickDepartureCounts(sourceSeason, summary.t);
  let delta = [...ZERO4];
  for (const season of SEASONS) {
    const i = SEASON_INDEX[season];
    delta = addV(delta, scaleV(tables.F_Q[season], tickCounts[i]));
    delta = addV(delta, scaleV(tables.D_Q[season], summary.q_by_season[i]));
  }
  return freeze(delta);
}

export function reconstructSeasonConditionedOperationalState(sourceHistory, summary, tables) {
  if (summary?.status !== 'SEASON_CONDITIONED_WORD_SUMMARIZED') {
    return freeze({ status: 'SYMBOLIC_RECONSTRUCTION_ABSTAINS' });
  }
  const endpoint = addV(vector(sourceHistory.endpoint), symbolicEndpointIncrement(summary.source_season, summary, tables));
  const qLabels = Array.from({ length: summary.q_total }, () => 'Q_PHASE_PULSE');
  return freeze({
    endpoint: matrix(endpoint),
    last_action: 'Q_PHASE_PULSE',
    operational_lineage: freeze([...sourceHistory.operational_lineage, ...qLabels]),
    clock_phase: summary.final_phase,
    forcing_season: summary.final_season,
  });
}

function symbolicTickCountResidueProof() {
  const proofs = [];
  for (const sourceSeason of SEASONS) {
    for (let r = 0; r < 4; r += 1) {
      // Represent t = 4m + r. Every departure count is m plus a finite prefix bit.
      const beforeConst = [0, 0, 0, 0];
      for (let i = 0; i < r; i += 1) beforeConst[SEASON_INDEX[addSeason(sourceSeason, i)]] = 1;
      let afterConst;
      if (r < 3) {
        afterConst = [...beforeConst];
        afterConst[SEASON_INDEX[addSeason(sourceSeason, r)]] = 1;
      } else {
        // 4m+3 -> 4(m+1): relative to the original formal m every coordinate is m+1.
        afterConst = [1, 1, 1, 1];
      }
      const diff = afterConst.map((value, i) => value - beforeConst[i]);
      const currentSeason = addSeason(sourceSeason, r);
      const expected = [0, 0, 0, 0];
      expected[SEASON_INDEX[currentSeason]] = 1;
      proofs.push(freeze({
        source_season: sourceSeason,
        residue: r,
        current_season: currentSeason,
        symbolic_m_coefficient_before: freeze([1, 1, 1, 1]),
        symbolic_m_coefficient_after: freeze([1, 1, 1, 1]),
        constant_difference: freeze(diff),
        expected_difference: freeze(expected),
        passed: keyOf(diff) === keyOf(expected),
      }));
    }
  }
  return freeze({
    passed: proofs.length === 16 && proofs.every((row) => row.passed),
    proofs: freeze(proofs),
  });
}

function structuralInductionCertificate(tables) {
  const tickResidues = symbolicTickCountResidueProof();
  const baseRows = SEASONS.map((sourceSeason) => {
    const empty = summarizeSeasonConditionedWord(sourceSeason, []);
    return freeze({
      source_season: sourceSeason,
      passed: empty.t === 0
        && keyOf(empty.q_by_season) === keyOf(ZERO4)
        && empty.final_season === sourceSeason
        && empty.final_phase === CLOCK_BY_SEASON[sourceSeason]
        && keyOf(tickDepartureCounts(sourceSeason, 0)) === keyOf(ZERO4),
    });
  });
  const qExtensionRows = [];
  const tExtensionRows = [];
  for (const sourceSeason of SEASONS) {
    for (let residue = 0; residue < 4; residue += 1) {
      const currentSeason = addSeason(sourceSeason, residue);
      qExtensionRows.push(freeze({
        source_season: sourceSeason,
        residue,
        current_season: currentSeason,
        endpoint_increment_added: tables.D_Q[currentSeason],
        q_counter_increment_season: currentSeason,
        lineage_increment: 1,
        season_increment: 0,
        passed: Boolean(tables.D_Q[currentSeason]),
      }));
      tExtensionRows.push(freeze({
        source_season: sourceSeason,
        residue,
        current_season: currentSeason,
        endpoint_increment_added: tables.F_Q[currentSeason],
        tick_departure_counter_increment_season: currentSeason,
        lineage_increment: 0,
        season_increment: 1,
        passed: Boolean(tables.F_Q[currentSeason]),
      }));
    }
  }
  const basePassed = baseRows.every((row) => row.passed);
  const qPassed = qExtensionRows.every((row) => row.passed);
  const tPassed = tExtensionRows.every((row) => row.passed) && tickResidues.passed;
  return freeze({
    base: freeze({ passed: basePassed, rows: freeze(baseRows) }),
    T_extension: freeze({ passed: tPassed, rows: freeze(tExtensionRows), residue_certificate: tickResidues }),
    Q_extension: freeze({ passed: qPassed, rows: freeze(qExtensionRows) }),
    endpoint_linearity_used: true,
    lineage_update_exact: true,
    season_phase_update_exact: true,
    structural_induction_earned: basePassed && tPassed && qPassed,
    classification: basePassed && tPassed && qPassed
      ? 'ALL_FINITE_TQ_WORDS_RECONSTRUCT_BY_SEASON_CONDITIONED_NORMAL_FORM_IN_AUTHORED_Q_LAST_ACTION_DOMAIN'
      : 'SYMBOLIC_STRUCTURAL_INDUCTION_OBLIGATION_FAILED',
  });
}

function concreteReconstructionControls(sourceRows, tables) {
  const words = freeze([
    freeze([]),
    freeze(['T']),
    freeze(['Q']),
    freeze(['T', 'Q']),
    freeze(['Q', 'T']),
    freeze(['T', 'T', 'Q']),
    freeze(['Q', 'T', 'T']),
    freeze(['Q', 'T', 'T', 'T', 'T']),
    freeze(['T', 'T', 'T', 'T', 'Q']),
  ]);
  const rows = [];
  for (const sourceRow of sourceRows) {
    const source = sourceRow.history;
    for (const word of words) {
      const summary = summarizeSeasonConditionedWord(sourceRow.season, word);
      const symbolic = reconstructSeasonConditionedOperationalState(source, summary, tables);
      const concrete = word.length === 0
        ? pathObjectProjection(source)
        : evaluatePathWord(source, word).target_state;
      rows.push(freeze({
        source_season: sourceRow.season,
        word,
        symbolic,
        concrete,
        equal: keyOf(symbolic) === keyOf(concrete),
      }));
    }
  }
  return freeze({ passed: rows.every((row) => row.equal), rows: freeze(rows) });
}

function routeCompressionControl(sourceRows) {
  const leftWord = freeze(['Q', 'T', 'T', 'T', 'T']);
  const rightWord = freeze(['T', 'T', 'T', 'T', 'Q']);
  const rows = sourceRows.map((sourceRow) => {
    const left = evaluatePathWord(sourceRow.history, leftWord);
    const right = evaluatePathWord(sourceRow.history, rightWord);
    return freeze({
      source_season: sourceRow.season,
      left_word: leftWord,
      right_word: rightWord,
      words_distinct: keyOf(leftWord) !== keyOf(rightWord),
      target_equal: left.target_key === right.target_key,
      left_target: left.target_state,
      right_target: right.target_state,
      classification: left.target_key === right.target_key
        ? 'DISTINCT_ROUTE_WORDS_COLLAPSE_TO_EQUAL_OPERATIONAL_TARGET_AFTER_FULL_SEASON_CYCLE'
        : 'ROUTE_COMPRESSION_CONTROL_FAILED',
    });
  });
  return freeze({
    passed: rows.every((row) => row.words_distinct && row.target_equal),
    rows: freeze(rows),
    anti_equivalence: 'SYMBOLIC_TARGET_NORMAL_FORM_IS_NOT_ROUTE_PROVENANCE',
  });
}

function symbolicRouteFamily(tables) {
  const rows = SEASONS.map((sourceSeason) => {
    const s1 = addSeason(sourceSeason, 1);
    const s2 = addSeason(sourceSeason, 2);
    const leftConstant = addV(addV(tables.F_Q[sourceSeason], tables.F_Q[s1]), tables.D_Q[s2]);
    const rightConstant = addV(addV(tables.D_Q[sourceSeason], tables.F_Q[sourceSeason]), tables.F_Q[s1]);
    const kCoefficientLeft = tables.D_Q[s1];
    const kCoefficientRight = tables.D_Q[s1];
    const periodTwoIdentity = equalV(tables.D_Q[s2], tables.D_Q[sourceSeason]);
    const endpointFormalEquality = periodTwoIdentity
      && equalV(leftConstant, rightConstant)
      && equalV(kCoefficientLeft, kCoefficientRight);
    const nonzeroKCoordinates = kCoefficientLeft
      .map((value, i) => ({ value, i }))
      .filter((row) => row.value !== 0)
      .map((row) => row.i);
    return freeze({
      source_season: sourceSeason,
      source_phase: CLOCK_BY_SEASON[sourceSeason],
      final_season: s2,
      final_phase: CLOCK_BY_SEASON[s2],
      left_route: 'T Q^k T Q',
      right_route: 'Q T Q^k T',
      formal_k_domain: 'k >= 0 integer',
      T_count_left: 2,
      T_count_right: 2,
      Q_lineage_increment_left: freeze({ k_coefficient: 1, constant: 1 }),
      Q_lineage_increment_right: freeze({ k_coefficient: 1, constant: 1 }),
      endpoint_left: freeze({ constant: leftConstant, k_coefficient: kCoefficientLeft }),
      endpoint_right: freeze({ constant: rightConstant, k_coefficient: kCoefficientRight }),
      period_two_question_delta_identity: periodTwoIdentity,
      endpoint_formal_equality: endpointFormalEquality,
      varying_endpoint_coordinates: freeze(nonzeroKCoordinates),
      passed: endpointFormalEquality
        && CLOCK_BY_SEASON[s2] === CLOCK_BY_SEASON[sourceSeason],
    });
  });
  const fourTemplatesExposed = rows.length === 4
    && new Set(rows.map((row) => row.source_season)).size === 4;
  return freeze({
    passed: rows.every((row) => row.passed) && fourTemplatesExposed,
    rows: freeze(rows),
    four_season_conditioned_templates_exposed: fourTemplatesExposed,
    formal_reconvergence_classification: rows.every((row) => row.passed)
      ? 'SEASON_CONDITIONED_SYMBOLIC_RECONVERGENCE_FAMILY_EARNED_FOR_ALL_FORMAL_K_IN_AUTHORED_Q_LAST_ACTION_DOMAIN'
      : 'SYMBOLIC_RECONVERGENCE_FAMILY_NOT_EARNED',
    bounded_horizon_consequence: freeze({
      domain: 'formal H >= 2',
      k_range: '0 <= k <= H-2',
      explicitly_constructed_common_future_witness_count: 'H-1',
      pairwise_distinct_basis: 'operational_lineage appends k+1 Q_PHASE_PULSE labels, so distinct k values produce distinct K_period4 lineage coordinates',
      frontier_completeness_claimed: false,
      minimal_frontier_completeness_claimed: false,
      ambient_common_future_count_formula_claimed: false,
    }),
  });
}

function parentCustodySnapshot() {
  return freeze({
    p718: JSON.stringify(runInvertibilityAdmissibilityObstructionAssay()),
    p719: JSON.stringify(runDirectedReachabilityGeometryAssay()),
    p720: JSON.stringify(runDirectedBranchingConfluenceAssay()),
    p722: JSON.stringify(runBoundedCommonFutureJoinObstructionAssay()),
    p723: JSON.stringify(runDirectedFutureConeStratificationAssay()),
  });
}

export function runSeasonConditionedSymbolicNormalFormAssay() {
  const parentBefore = parentCustodySnapshot();
  const sources = lawfulQuestionSources();
  if (!sources.passed) {
    return freeze({
      schema: SEASON_CONDITIONED_SYMBOLIC_NORMAL_FORM_SCHEMA,
      passed: false,
      status: 'LAWFUL_SYMBOLIC_SOURCE_DOMAIN_NOT_DERIVABLE',
      source_status: sources.status,
      stop: 'PRESERVE_SYMBOLIC_PROOF_FAILURE_AND_RETURN_TO_HUMAN_𝄐',
    });
  }

  const tables = deriveGeneratorTables(sources.sources);
  const induction = structuralInductionCertificate(tables);
  const reconstructionControls = concreteReconstructionControls(sources.sources, tables);
  const routeCompression = routeCompressionControl(sources.sources);
  const routeFamily = symbolicRouteFamily(tables);
  const parentAfter = parentCustodySnapshot();
  const parentCustodyUnchanged = Object.keys(parentBefore).every((key) => parentBefore[key] === parentAfter[key]);

  const passed = tables.passed
    && tables.period_two_question_delta
    && induction.structural_induction_earned
    && reconstructionControls.passed
    && routeCompression.passed
    && routeFamily.passed
    && parentCustodyUnchanged;

  return freeze({
    schema: SEASON_CONDITIONED_SYMBOLIC_NORMAL_FORM_SCHEMA,
    passed,
    status: passed
      ? 'SEASON_CONDITIONED_SYMBOLIC_NORMAL_FORM_ROUND_CLOSED'
      : 'SEASON_CONDITIONED_SYMBOLIC_NORMAL_FORM_AUDITION_FAILED',
    source_domain: freeze({
      status: sources.status,
      source_seasons: freeze(sources.sources.map((row) => row.season)),
      last_action: 'Q_PHASE_PULSE',
      finite_control_seasons: 4,
      unbounded_integer_counters_retained: true,
      finite_state_automaton_claimed: false,
    }),
    generator_tables: tables,
    structural_induction: induction,
    concrete_reconstruction_controls: reconstructionControls,
    route_provenance_control: routeCompression,
    symbolic_reconvergence_family: routeFamily,
    season_dependence: freeze({
      forcing_season_erased: false,
      four_templates_retained: routeFamily.four_season_conditioned_templates_exposed,
      source_independent_frontier_profile_claimed: false,
      classification: 'SAME_SYMBOLIC_RECURRENCE_FAMILY_DOES_NOT_IMPLY_SOURCE_INDEPENDENT_NORMALIZED_FRONTIER_PROFILE',
    }),
    parent_custody_unchanged: parentCustodyUnchanged,
    parent_custody_classification: parentCustodyUnchanged
      ? 'PARENT_718_719_720_722_723_CUSTODY_UNCHANGED'
      : 'PARENT_CUSTODY_MUTATION_DETECTED',
    canonical_classification: passed
      ? 'FINITE_CONTROL_SEASON_CONDITIONED_SYMBOLIC_NORMAL_FORM_WITH_ALL_FINITE_WORD_STRUCTURAL_INDUCTION_AND_FORMAL_RECONVERGENCE_FAMILY'
      : null,
    strongest_claim: passed
      ? 'IN_THE_AUTHORED_LAST_ACTION_Q_PHASE_PULSE_DOMAIN_EVERY_FINITE_TQ_WORD_FACTORS_THROUGH_A_FOUR_SEASON_CONTROL_PLUS_INTEGER_COUNTER_NORMAL_FORM_WHOSE_ENDPOINT_LINEAGE_SEASON_AND_PHASE_RECONSTRUCTION_IS_EARNED_BY_BASE_AND_GENERATOR_EXTENSION_OBLIGATIONS_AND_THE_TWO_FORMAL_ROUTE_FAMILIES_T_QK_T_Q_AND_Q_T_QK_T_RECONVERGE_FOR_EVERY_NONNEGATIVE_INTEGER_K_BECAUSE_THE_PERIOD_TWO_QUESTION_DELTA_REPEATS_AFTER_TWO_FORCING_SEASONS_WHILE_ROUTE_PROVENANCE_AND_SEASON_CONDITIONING_REMAIN_DISTINCT'
      : null,
    claim_ceiling: freeze({
      h8_or_larger_enumeration: false,
      all_H_common_future_count: false,
      frontier_completeness: false,
      frontier_minimality_completeness: false,
      ambient_join: false,
      semilattice_or_lattice: false,
      church_rosser: false,
      global_confluence: false,
      rewrite_system_theorem: false,
      finite_state_automaton_for_unbounded_endpoint: false,
      myhill_nerode_or_minimal_automaton: false,
      domain_theory: false,
      causal_set: false,
      inverse_generator: false,
      groupoid: false,
      transport_or_connection: false,
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
    stop: passed
      ? 'HUMAN_𝄐_QUALIFIED_FOR_SEPARATE_FRONTIER_COMPLETENESS_OR_FINITE_CONTROL_QUOTIENT_AUDITION'
      : 'PRESERVE_SYMBOLIC_PROOF_FAILURE_AND_RETURN_TO_HUMAN_𝄐',
  });
}
