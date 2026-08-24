import { stepQuestionPhasePulse } from './aperture-pedagogue-exogenous-evolution-congruence.js';
import {
  deriveRecurrenceHistoryUniverse,
} from './aperture-pedagogue-temporal-recurrence-phase-aliasing.js';
import {
  applyPathGenerator,
  pathObjectProjection,
} from './aperture-pedagogue-first-bounded-path-grammar.js';
import { runInvertibilityAdmissibilityObstructionAssay } from './aperture-pedagogue-invertibility-admissibility-obstruction.js';
import { runDirectedReachabilityGeometryAssay } from './aperture-pedagogue-directed-reachability-geometry.js';
import { runDirectedBranchingConfluenceAssay } from './aperture-pedagogue-directed-branching-confluence.js';
import { runDirectedFutureConeStratificationAssay } from './aperture-pedagogue-directed-future-cone-stratification.js';
import { runSeasonConditionedSymbolicNormalFormAssay } from './aperture-pedagogue-season-conditioned-symbolic-normal-form.js';
import { runSymbolicFrontierCompletenessAssay } from './aperture-pedagogue-symbolic-frontier-completeness.js';

export const TYPED_TARGET_PRESERVING_REWRITE_ADMISSIBILITY_SCHEMA = 'td613.a15-r0.aperture-pedagogue-typed-target-preserving-rewrite-admissibility/v0.1';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const keyOf = (value) => JSON.stringify(value);
const SEASONS = freeze(['S0', 'S1', 'S2', 'S3']);
const Q = (n) => Array.from({ length: n }, () => 'Q');
const T = (n) => Array.from({ length: n }, () => 'T');
const wordLabel = (word) => word.join('');

function lawfulQuestionSources() {
  const universe = deriveRecurrenceHistoryUniverse();
  if (universe.status !== 'RECURRENCE_HISTORY_UNIVERSE_DERIVED_FROM_PARENT_TEMPORAL_CUSTODY') {
    return freeze({ passed: false, status: universe.status, rows: freeze([]) });
  }
  const byId = new Map(universe.histories.map((history) => [history.id, history]));
  const rows = SEASONS.map((season) => {
    const parent = byId.get(`R_AB_${season}`);
    if (!parent) return freeze({ season, passed: false, status: 'SOURCE_SEASON_HISTORY_MISSING' });
    const history = stepQuestionPhasePulse(parent);
    const state = history?.status ? null : pathObjectProjection(history);
    return freeze({
      season,
      passed: !history?.status
        && state?.last_action === 'Q_PHASE_PULSE'
        && state?.forcing_season === season,
      parent,
      history,
      state,
    });
  });
  return freeze({
    passed: rows.every((row) => row.passed),
    status: rows.every((row) => row.passed)
      ? 'FOUR_TYPED_Q_LAST_ACTION_REWRITE_SOURCES_DERIVED'
      : 'TYPED_REWRITE_SOURCE_DERIVATION_FAILED',
    rows: freeze(rows),
  });
}

function evaluateWordAllowEmpty(history, word) {
  if (!Array.isArray(word)) return freeze({ passed: false, status: 'WORD_NOT_ARRAY' });
  let current = history;
  const prefixStates = [freeze(pathObjectProjection(current))];
  for (let index = 0; index < word.length; index += 1) {
    const next = applyPathGenerator(current, word[index]);
    if (next?.status) {
      return freeze({
        passed: false,
        status: next.status,
        failed_index: index,
        generator: word[index],
      });
    }
    current = next;
    prefixStates.push(freeze(pathObjectProjection(current)));
  }
  const targetState = freeze(pathObjectProjection(current));
  return freeze({
    passed: true,
    status: 'TYPED_WORD_EVALUATED',
    word: freeze([...word]),
    target_state: targetState,
    target_key: keyOf(targetState),
    final_history: current,
    prefix_states: freeze(prefixStates),
  });
}

function redexAt(word, start) {
  if (!Array.isArray(word) || !Number.isInteger(start) || start < 0 || word[start] !== 'T') return null;
  let cursor = start + 1;
  while (cursor < word.length && word[cursor] === 'Q') cursor += 1;
  if (cursor >= word.length - 1 || word[cursor] !== 'T' || word[cursor + 1] !== 'Q') return null;
  const k = cursor - start - 1;
  return freeze({
    start,
    end_exclusive: cursor + 2,
    k,
    lhs: freeze(['T', ...Q(k), 'T', 'Q']),
    rhs: freeze(['Q', 'T', ...Q(k), 'T']),
  });
}

export function findRkRedexes(word) {
  if (!Array.isArray(word)) return freeze([]);
  const rows = [];
  for (let start = 0; start < word.length; start += 1) {
    const match = redexAt(word, start);
    if (match) rows.push(match);
  }
  return freeze(rows);
}

function sourceIsTyped(state) {
  return state?.last_action === 'Q_PHASE_PULSE'
    && SEASONS.includes(state?.forcing_season)
    && typeof state?.clock_phase === 'string';
}

export function applyTypedRkRewrite(sourceHistory, word, start) {
  const match = redexAt(word, start);
  if (!match) {
    return freeze({
      status: 'NO_RK_REDEX_AT_REQUESTED_POSITION',
      disposition: 'ABSTAIN_BEFORE_TYPED_REWRITE',
      start,
    });
  }
  const prefix = word.slice(0, start);
  const prefixEvaluation = evaluateWordAllowEmpty(sourceHistory, prefix);
  if (!prefixEvaluation.passed || !sourceIsTyped(prefixEvaluation.target_state)) {
    return freeze({
      status: 'REWRITE_SOURCE_OUTSIDE_Q_LAST_ACTION_JURISDICTION',
      disposition: 'ABSTAIN_BEFORE_TYPED_REWRITE',
      start,
      k: match.k,
      prefix_state: prefixEvaluation.target_state ?? null,
    });
  }
  const rewritten = freeze([
    ...word.slice(0, match.start),
    ...match.rhs,
    ...word.slice(match.end_exclusive),
  ]);
  const before = evaluateWordAllowEmpty(sourceHistory, word);
  const after = evaluateWordAllowEmpty(sourceHistory, rewritten);
  const targetPreserved = before.passed && after.passed && before.target_key === after.target_key;
  return freeze({
    status: targetPreserved
      ? 'TYPED_RK_REWRITE_APPLIED_TARGET_PRESERVED'
      : 'TYPED_RK_REWRITE_TARGET_PRESERVATION_FAILED',
    passed: targetPreserved,
    start,
    k: match.k,
    original_word: freeze([...word]),
    rewritten_word: rewritten,
    original_label: wordLabel(word),
    rewritten_label: wordLabel(rewritten),
    source_state: prefixEvaluation.target_state,
    complete_target_preserved: targetPreserved,
    before_target_key: before.target_key ?? null,
    after_target_key: after.target_key ?? null,
    route_provenance_preserved_as_distinct: wordLabel(word) !== wordLabel(rewritten),
  });
}

function typedPrefixInvariant(sources) {
  const controlWords = freeze([
    freeze([]),
    freeze(['Q']),
    freeze(['T']),
    freeze(['T', 'Q']),
    freeze(['Q', 'T', 'Q', 'T', 'T', 'Q']),
    freeze(['T', 'T', 'T', 'T', 'Q', 'Q', 'T']),
  ]);
  const rows = [];
  for (const source of sources.rows) {
    for (const word of controlWords) {
      const evaluated = evaluateWordAllowEmpty(source.history, word);
      const allPrefixesTyped = evaluated.passed
        && evaluated.prefix_states.every((state) => sourceIsTyped(state));
      rows.push(freeze({
        source_season: source.season,
        word: freeze([...word]),
        passed: allPrefixesTyped,
      }));
    }
  }
  const passed = sources.passed && rows.every((row) => row.passed);
  return freeze({
    passed,
    symbolic_invariant: 'Starting from last_action=Q_PHASE_PULSE, Q writes Q_PHASE_PULSE and T preserves the existing last_action; forcing season remains in S0..S3. Therefore every finite T/Q prefix remains in rewrite source jurisdiction.',
    consequence: 'EVERY_SYNTACTIC_RK_REDEX_IN_A_WORD_FROM_AN_AUTHORED_Q_SOURCE_IS_TYPED',
    control_rows: freeze(rows),
    anti_equivalence: 'SUBSTRING_MATCH_IS_NOT_TYPED_REWRITE_ADMISSIBILITY_OUTSIDE_THE_DECLARED_SOURCE_DOMAIN',
  });
}

function lexCompareQBeforeT(a, b) {
  if (a.length !== b.length) return null;
  const rank = { Q: 0, T: 1 };
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] === b[i]) continue;
    return rank[a[i]] < rank[b[i]] ? -1 : 1;
  }
  return 0;
}

function terminationCertificate() {
  const sampledRows = [];
  for (let k = 0; k <= 16; k += 1) {
    const lhs = freeze(['T', ...Q(k), 'T', 'Q']);
    const rhs = freeze(['Q', 'T', ...Q(k), 'T']);
    sampledRows.push(freeze({
      k,
      lhs,
      rhs,
      length_preserved: lhs.length === rhs.length,
      lexicographic_descent: lexCompareQBeforeT(rhs, lhs) === -1,
    }));
  }
  const symbolicPassed = sampledRows.every((row) => row.length_preserved && row.lexicographic_descent);
  return freeze({
    passed: symbolicPassed,
    alphabet_order: 'Q < T',
    orientation: 'T Q^k T Q -> Q T Q^k T',
    length_preserved_for_all_formal_k: true,
    first_differing_symbol_changes_T_to_Q: true,
    whole_word_lexicographic_descent_under_context: true,
    fixed_length_word_set_finite: true,
    termination_conclusion: symbolicPassed
      ? 'NO_FINITE_WORD_ADMITS_AN_INFINITE_RK_REWRITE_CHAIN'
      : null,
    proof_text: 'A rewrite leaves the prefix before the redex unchanged and changes the first differing symbol at the redex from T to Q under Q<T. The rule preserves total word length. A chain from a word of length n therefore descends strictly inside the finite lexicographically ordered set {Q,T}^n and must terminate.',
    sampled_arithmetic_controls_only: freeze(sampledRows),
    anti_equivalences: freeze([
      'SYNTACTIC_WELL_FOUNDED_ORDER_IS_NOT_ENDPOINT_MASS_ORDER',
      'REWRITE_TERMINATION_IS_NOT_OPERATIONAL_IRREVERSIBILITY',
      'REWRITE_TERMINATION_IS_NOT_CONFLUENCE',
    ]),
  });
}

function concreteTargetPreservationControls(sources) {
  const prefixes = freeze([
    freeze([]),
    freeze(['Q']),
    freeze(['T', 'Q']),
    freeze(['Q', 'T', 'T']),
  ]);
  const suffixes = freeze([
    freeze([]),
    freeze(['T']),
    freeze(['Q', 'T']),
  ]);
  const rows = [];
  for (const source of sources.rows) {
    for (const k of [0, 1, 2, 4, 7]) {
      const lhs = ['T', ...Q(k), 'T', 'Q'];
      for (const prefix of prefixes) {
        for (const suffix of suffixes) {
          const word = [...prefix, ...lhs, ...suffix];
          const rewrite = applyTypedRkRewrite(source.history, word, prefix.length);
          rows.push(freeze({
            source_season: source.season,
            k,
            prefix: freeze([...prefix]),
            suffix: freeze([...suffix]),
            passed: rewrite.passed
              && rewrite.complete_target_preserved
              && rewrite.route_provenance_preserved_as_distinct,
          }));
        }
      }
    }
  }
  return freeze({
    passed: rows.every((row) => row.passed),
    rows: freeze(rows),
    role: 'CONCRETE_CONTEXT_CONTROLS_ONLY_NOT_BASIS_OF_ALL_FORMAL_K_PROOF',
  });
}

function targetPreservationCertificate(normalForm, sources, typing) {
  const family = normalForm.symbolic_reconvergence_family;
  const controls = concreteTargetPreservationControls(sources);
  const formalFamilyEarned = family.passed
    && family.formal_reconvergence_classification
      === 'SEASON_CONDITIONED_SYMBOLIC_RECONVERGENCE_FAMILY_EARNED_FOR_ALL_FORMAL_K_IN_AUTHORED_Q_LAST_ACTION_DOMAIN'
    && family.rows.length === 4
    && family.rows.every((row) => row.passed && row.formal_k_domain === 'k >= 0 integer');
  const passed = formalFamilyEarned && typing.passed && controls.passed;
  return freeze({
    passed,
    parent_all_formal_k_target_equality_inherited: formalFamilyEarned,
    rule_schema: 'R_k : T Q^k T Q -> Q T Q^k T, k>=0',
    context_closure: freeze({
      passed,
      reason: 'At any typed redex source the parent all-formal-k theorem gives identical complete K_period4 targets for the two redex routes. Deterministic evaluation of an identical suffix from that identical post-redex state preserves equality of the final complete target.',
    }),
    complete_operational_target_not_endpoint_only: true,
    route_provenance_erased: false,
    concrete_context_controls: controls,
    classification: passed
      ? 'TYPED_R_K_REWRITE_PRESERVES_COMPLETE_OPERATIONAL_TARGET'
      : 'TYPED_REWRITE_DOES_NOT_PRESERVE_COMPLETE_TARGET',
  });
}

function criticalOverlapCertificate() {
  const overlapGrammar = freeze({
    left_side: 'L_i = T Q^i T Q, i>=0',
    proper_suffixes_beginning_with_T: 'Only the final TQ can begin a proper self-overlap.',
    right_prefix_condition: 'prefix_2(L_j)=TQ iff j>=1; for j=0 prefix_2(L_0)=TT.',
    inclusion_overlap: 'NONE: an L_i contains only two T symbols, so no proper embedded L_j exists.',
    disjoint_redexes: 'COMMUTE_SYNTACTICALLY_AND_REMAIN_TYPED_BY_Q_LAST_ACTION_PREFIX_INVARIANT',
    complete_nontrivial_overlap_family: 'W_(i,j)=T Q^i T Q^j T Q for i>=0, j>=1',
  });

  const formalJoin = freeze({
    critical_word: 'W_(i,j)=T Q^i T Q^j T Q',
    left_first_descendant: 'A_(i,j)=Q T Q^i T Q^(j-1) T Q',
    right_first_descendant: 'B_(i,j)=T Q^(i+1) T Q^j T',
    common_join: 'N_(i,j)=Q^j T Q^(i+1) T T',
    left_join_sequence: 'For r=0..j-2 rewrite the L_i redex in Q^(r+1) T Q^i T Q^(j-1-r) T Q, then rewrite the terminal L_0=T T Q. For j=1 only the terminal L_0 step is needed.',
    right_join_sequence: 'For r=0..j-1 rewrite the L_(i+1) redex in Q^r T Q^(i+1) T Q^(j-r) T. After j steps the result is N_(i,j).',
    formal_domain: 'i>=0 integer, j>=1 integer',
  });

  const controls = [];
  for (let i = 0; i <= 5; i += 1) {
    for (let j = 1; j <= 5; j += 1) {
      const critical = ['T', ...Q(i), 'T', ...Q(j), 'T', 'Q'];
      const leftStart = 0;
      const rightStart = i + 1;
      const leftMatch = redexAt(critical, leftStart);
      const rightMatch = redexAt(critical, rightStart);
      const expectedJoin = [...Q(j), 'T', ...Q(i + 1), 'T', 'T'];

      let left = [
        ...leftMatch.rhs,
        ...critical.slice(leftMatch.end_exclusive),
      ];
      for (let r = 0; r < j - 1; r += 1) {
        const match = redexAt(left, r + 1);
        left = [...left.slice(0, match.start), ...match.rhs, ...left.slice(match.end_exclusive)];
      }
      const terminalStart = j + i + 1;
      const terminal = redexAt(left, terminalStart);
      left = [...left.slice(0, terminal.start), ...terminal.rhs, ...left.slice(terminal.end_exclusive)];

      let right = [
        ...critical.slice(0, rightMatch.start),
        ...rightMatch.rhs,
        ...critical.slice(rightMatch.end_exclusive),
      ];
      for (let r = 0; r < j; r += 1) {
        const match = redexAt(right, r);
        right = [...right.slice(0, match.start), ...match.rhs, ...right.slice(match.end_exclusive)];
      }

      controls.push(freeze({
        i,
        j,
        critical_word: freeze(critical),
        expected_join: freeze(expectedJoin),
        left_joined: freeze(left),
        right_joined: freeze(right),
        passed: keyOf(left) === keyOf(expectedJoin) && keyOf(right) === keyOf(expectedJoin),
      }));
    }
  }

  const passed = controls.every((row) => row.passed);
  return freeze({
    passed,
    symbolic_overlap_completeness: passed,
    overlap_grammar: overlapGrammar,
    formal_join: formalJoin,
    sampled_string_arithmetic_controls_only: freeze(controls),
    critical_pair_classification: passed
      ? 'ALL_TYPED_NONTRIVIAL_RK_CRITICAL_OVERLAPS_SYMBOLICALLY_CLASSIFIED_AND_JOINABLE'
      : 'TYPED_CRITICAL_PAIR_NOT_JOINABLE',
    bounded_sampling_is_not_overlap_completeness_basis: true,
  });
}

function enumerateWords(maxLength) {
  const words = [];
  const extend = (prefix, remaining) => {
    if (prefix.length > 0) words.push(freeze([...prefix]));
    if (remaining === 0) return;
    extend([...prefix, 'Q'], remaining - 1);
    extend([...prefix, 'T'], remaining - 1);
  };
  extend([], maxLength);
  return freeze(words);
}

function normalizeTypedWord(sourceHistory, word) {
  let current = [...word];
  const steps = [];
  const hardBound = 2 ** Math.min(current.length, 20);
  for (let iteration = 0; iteration <= hardBound; iteration += 1) {
    const redexes = findRkRedexes(current);
    if (redexes.length === 0) {
      return freeze({
        passed: true,
        normal_form: freeze(current),
        normal_form_label: wordLabel(current),
        steps: freeze(steps),
      });
    }
    const chosen = redexes[0];
    const rewritten = applyTypedRkRewrite(sourceHistory, current, chosen.start);
    if (!rewritten.passed) {
      return freeze({ passed: false, status: rewritten.status, steps: freeze(steps) });
    }
    steps.push(freeze({ from: freeze(current), to: rewritten.rewritten_word, k: rewritten.k, start: rewritten.start }));
    current = [...rewritten.rewritten_word];
  }
  return freeze({ passed: false, status: 'NORMALIZATION_BOUND_EXCEEDED', steps: freeze(steps) });
}

function boundedTargetEquivalenceHostile(sources) {
  const maxLength = 7;
  const words = enumerateWords(maxLength);
  const rows = [];
  let equalTargetPairCount = 0;
  let disconnectedWithinNormalization = 0;
  for (const source of sources.rows) {
    const byTarget = new Map();
    for (const word of words) {
      const evaluated = evaluateWordAllowEmpty(source.history, word);
      if (!evaluated.passed) continue;
      if (!byTarget.has(evaluated.target_key)) byTarget.set(evaluated.target_key, []);
      byTarget.get(evaluated.target_key).push(word);
    }
    for (const [targetKey, routes] of byTarget.entries()) {
      if (routes.length < 2) continue;
      equalTargetPairCount += (routes.length * (routes.length - 1)) / 2;
      const normalized = routes.map((word) => normalizeTypedWord(source.history, word));
      const normalForms = new Set(normalized.filter((row) => row.passed).map((row) => row.normal_form_label));
      if (normalForms.size > 1 || normalized.some((row) => !row.passed)) disconnectedWithinNormalization += 1;
      rows.push(freeze({
        source_season: source.season,
        target_key: targetKey,
        route_count: routes.length,
        normal_form_count: normalForms.size,
        all_normalizations_completed: normalized.every((row) => row.passed),
        classification: normalForms.size === 1 && normalized.every((row) => row.passed)
          ? 'CONNECTED_BY_TYPED_RK_REWRITES'
          : 'NOT_CONNECTED_WITHIN_DECLARED_SEARCH_BOUND',
      }));
    }
  }
  return freeze({
    passed: rows.length > 0 && rows.every((row) => row.all_normalizations_completed),
    maximum_word_length: maxLength,
    equal_target_pair_count: equalTargetPairCount,
    target_classes_with_multiple_routes: rows.length,
    target_classes_with_multiple_rewrite_normal_forms: disconnectedWithinNormalization,
    rows: freeze(rows),
    observation: disconnectedWithinNormalization === 0
      ? 'BOUNDED_SEARCH_FOUND_NO_EQUAL_TARGET_CLASS_SPLIT_ACROSS_RK_NORMAL_FORMS'
      : 'BOUNDED_SEARCH_FOUND_EQUAL_TARGET_CLASSES_WITH_DISTINCT_RK_NORMAL_FORMS',
    authority: 'BOUNDED_HOSTILE_ONLY_NOT_A_GLOBAL_TARGET_EQUIVALENCE_COMPLETENESS_THEOREM',
    anti_equivalence: 'BOUNDED_NORMAL_FORM_AGREEMENT_IS_NOT_COMPLETE_OPERATIONAL_TARGET_EQUIVALENCE',
  });
}

function parentCustodySnapshot() {
  return freeze({
    p718: JSON.stringify(runInvertibilityAdmissibilityObstructionAssay()),
    p719: JSON.stringify(runDirectedReachabilityGeometryAssay()),
    p720: JSON.stringify(runDirectedBranchingConfluenceAssay()),
    p723: JSON.stringify(runDirectedFutureConeStratificationAssay()),
    p724: JSON.stringify(runSeasonConditionedSymbolicNormalFormAssay()),
    p725: JSON.stringify(runSymbolicFrontierCompletenessAssay()),
  });
}

export function runTypedTargetPreservingRewriteAdmissibilityAssay() {
  const parentBefore = parentCustodySnapshot();
  const p718 = runInvertibilityAdmissibilityObstructionAssay();
  const p719 = runDirectedReachabilityGeometryAssay();
  const p720 = runDirectedBranchingConfluenceAssay();
  const p723 = runDirectedFutureConeStratificationAssay();
  const p724 = runSeasonConditionedSymbolicNormalFormAssay();
  const p725 = runSymbolicFrontierCompletenessAssay();

  if (![p718, p719, p720, p723, p724, p725].every((parent) => parent?.passed)) {
    return freeze({
      schema: TYPED_TARGET_PRESERVING_REWRITE_ADMISSIBILITY_SCHEMA,
      passed: false,
      status: 'PARENT_REWRITE_JURISDICTION_NOT_WITNESSED',
      disposition: 'ABSTAIN_BEFORE_TYPED_REWRITE_AUDITION',
    });
  }

  const sources = lawfulQuestionSources();
  const typing = typedPrefixInvariant(sources);
  const targetPreservation = targetPreservationCertificate(p724, sources, typing);
  const termination = terminationCertificate();
  const overlaps = criticalOverlapCertificate();
  const hostile = boundedTargetEquivalenceHostile(sources);

  const localConfluence = freeze({
    passed: typing.passed && overlaps.passed,
    symbolic_critical_overlap_family_complete: overlaps.symbolic_overlap_completeness,
    all_typed_critical_pairs_joinable: overlaps.passed,
    disjoint_redexes_commute: true,
    identical_redex_choice_trivial: true,
    classification: typing.passed && overlaps.passed
      ? 'TYPED_RK_REWRITE_RELATION_IS_LOCALLY_CONFLUENT_IN_AUTHORED_Q_SOURCE_DOMAIN'
      : 'LOCAL_CONFLUENCE_NOT_EARNED',
  });

  const parentAfter = parentCustodySnapshot();
  const parentCustodyUnchanged = Object.keys(parentBefore).every((key) => parentBefore[key] === parentAfter[key]);
  const passed = sources.passed
    && typing.passed
    && targetPreservation.passed
    && termination.passed
    && overlaps.passed
    && localConfluence.passed
    && hostile.passed
    && parentCustodyUnchanged;

  return freeze({
    schema: TYPED_TARGET_PRESERVING_REWRITE_ADMISSIBILITY_SCHEMA,
    passed,
    status: passed
      ? 'TYPED_TARGET_PRESERVING_REWRITE_ADMISSIBILITY_ROUND_CLOSED'
      : 'TYPED_TARGET_PRESERVING_REWRITE_ADMISSIBILITY_AUDITION_FALSIFIED',
    source_domain: freeze({
      path_object: 'K_period4',
      last_action: 'Q_PHASE_PULSE',
      forcing_seasons_retained: SEASONS,
      generators: freeze(['T', 'Q']),
      finite_control_quotient_applied: false,
      source_season_erased: false,
    }),
    rule_schema: freeze({
      id: 'R_k',
      formal_k_domain: 'k >= 0 integer',
      left: 'T Q^k T Q',
      right: 'Q T Q^k T',
      direction: 'LEFT_TO_RIGHT_ONLY',
      inverse_semantics: false,
    }),
    typing_certificate: typing,
    target_preservation_certificate: targetPreservation,
    termination_certificate: termination,
    critical_overlap_certificate: overlaps,
    local_confluence_certificate: localConfluence,
    bounded_target_equivalence_hostile: hostile,
    route_provenance: freeze({
      erased: false,
      rewrite_identifies_a_normalization_step_not_history_identity: true,
      anti_equivalence: 'REWRITE_EQUIVALENT_ROUTES_ARE_NOT_IDENTICAL_ROUTE_PROVENANCE',
    }),
    parent_custody_unchanged: parentCustodyUnchanged,
    parent_custody_classification: parentCustodyUnchanged
      ? 'PARENT_718_719_720_723_724_725_CUSTODY_UNCHANGED'
      : 'PARENT_CUSTODY_MUTATION_DETECTED',
    canonical_classification: passed
      ? 'TYPED_TARGET_PRESERVING_TERMINATING_LOCALLY_CONFLUENT_RK_REWRITE_SYSTEM_IN_AUTHORED_DOMAIN'
      : null,
    strongest_claim: passed
      ? 'IN_THE_AUTHORED_Q_LAST_ACTION_K_PERIOD4_TQ_DOMAIN_THE_ALL_FORMAL_K_TARGET_EQUALITY_FAMILY_SUPPORTS_A_TYPED_LEFT_TO_RIGHT_ROUTE_REWRITE_R_K_FROM_T_QK_T_Q_TO_Q_T_QK_T_EVERY_ADMITTED_REWRITE_PRESERVES_THE_COMPLETE_OPERATIONAL_TARGET_AND_DISTINCT_ROUTE_PROVENANCE_THE_ORIENTATION_STRICTLY_DESCENDS_Q_BEFORE_T_LEXICOGRAPHIC_ORDER_AT_FIXED_WORD_LENGTH_AND_THEREFORE_TERMINATES_AND_THE_ONLY_NONTRIVIAL_SYMBOLIC_LEFT_SIDE_OVERLAP_FAMILY_T_QI_T_QJ_T_Q_FOR_I_AT_LEAST_ZERO_J_AT_LEAST_ONE_HAS_JOINABLE_TYPED_CRITICAL_PAIRS_SO_LOCAL_CONFLUENCE_IS_EARNED_WITHOUT_QUOTIENTING_FORCING_SEASON_OR_CLAIMING_AMBIENT_CHURCH_ROSSER_OR_TARGET_EQUIVALENCE_COMPLETENESS'
      : null,
    claim_ceiling: freeze({
      complete_operational_target_equivalence_by_rewrite_normal_form: false,
      finite_control_quotient: false,
      source_season_erasure: false,
      endpoint_erasure: false,
      ambient_td613_rewrite_system: false,
      ambient_church_rosser: false,
      rewrite_completion: false,
      global_td613_confluence: false,
      join_semilattice_or_lattice: false,
      domain_theory: false,
      causal_set_theorem: false,
      inverse_generator: false,
      inverse_morphism: false,
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
    stop: passed
      ? 'HUMAN_𝄐_QUALIFIED_FOR_SEPARATE_REWRITE_NORMAL_FORM_TARGET_EQUIVALENCE_COMPLETENESS_AUDITION'
      : 'PRESERVE_REWRITE_AUDITION_FAILURE_AND_RETURN_TO_HUMAN_𝄐',
  });
}
