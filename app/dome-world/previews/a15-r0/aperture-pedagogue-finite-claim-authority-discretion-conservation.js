import {
  finiteClaimAuthorityProfile,
  classifyClaimAuthority,
} from './aperture-pedagogue-finite-claim-authority-partition.js';

export const FINITE_DISCRETION_CONSERVATION_SCHEMA = 'td613.a15-r0.finite-claim-authority-discretion-conservation/v0.1';
export const FINITE_DISCRETION_CONSERVATION_PARENT_RECEIPT = 'c75459509bc9c948d2a7b7ff21d8de93328b76d7';
export const FINITE_DISCRETION_CONSERVATION_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

function canonicalFiniteValue(value) {
  if (value === null) return 'null';
  if (typeof value === 'string') return `s:${JSON.stringify(value)}`;
  if (typeof value === 'boolean') return value ? 'b:1' : 'b:0';
  if (typeof value === 'number' && Number.isFinite(value)) return `n:${Object.is(value, -0) ? '0' : String(value)}`;
  if (Array.isArray(value)) {
    const parts = value.map(canonicalFiniteValue);
    if (parts.some((part) => part === null)) return null;
    return `a:${JSON.stringify(parts)}`;
  }
  return null;
}

function normalizeAssignments(assignments) {
  if (!Array.isArray(assignments)) return null;
  const allowed = new Set(['UNIVERSALLY_ADMISSIBLE', 'UNIVERSALLY_INADMISSIBLE', 'ABSTAIN']);
  const map = new Map();
  for (const row of assignments) {
    const key = canonicalFiniteValue(row?.value);
    if (key === null || !allowed.has(row?.decision) || map.has(key)) return null;
    map.set(key, row.decision);
  }
  return map;
}

export function auditFiniteDiscretionPresentation(rows, quotient, ambientValues, assignments) {
  const profile = finiteClaimAuthorityProfile(rows, quotient, ambientValues);
  const map = normalizeAssignments(assignments);
  if (profile.status !== 'EXACT_FINITE_CLAIM_AUTHORITY_PARTITION_DERIVED' || map === null) {
    return freeze({ status: 'FINITE_DISCRETION_AUDIT_ABSTAIN' });
  }

  const ambientKeys = new Set(profile.ambient.map(canonicalFiniteValue));
  if (map.size !== ambientKeys.size || [...ambientKeys].some((key) => !map.has(key))) {
    return freeze({ status: 'FINITE_DISCRETION_AUDIT_INCOMPLETE_ASSIGNMENTS' });
  }

  let falseClaims = 0;
  let abstentions = 0;
  let settledMisclassifications = 0;
  let gapFalseClaims = 0;
  let gapAbstentions = 0;

  for (const value of profile.ambient) {
    const key = canonicalFiniteValue(value);
    const decision = map.get(key);
    const truth = classifyClaimAuthority(rows, quotient, ambientValues, value).authority;

    if (decision === 'ABSTAIN') {
      abstentions += 1;
      if (truth === 'CONDITIONING_DEPENDENT') gapAbstentions += 1;
      else settledMisclassifications += 1;
      continue;
    }

    if (decision !== truth) {
      falseClaims += 1;
      if (truth === 'CONDITIONING_DEPENDENT') gapFalseClaims += 1;
      else settledMisclassifications += 1;
    }
  }

  const gap = profile.conditioning_dependent_cardinality;
  const burden = falseClaims + abstentions;
  const rhs = gap + settledMisclassifications;
  const identityPassed = burden === rhs
    && gapFalseClaims + gapAbstentions === gap;

  return freeze({
    status: identityPassed
      ? 'FINITE_DISCRETION_CONSERVATION_AUDITED'
      : 'FINITE_DISCRETION_CONSERVATION_MISMATCH',
    false_universal_claims: falseClaims,
    abstentions,
    total_epistemic_burden: burden,
    irreducible_gap_cardinality: gap,
    settled_misclassification_count: settledMisclassifications,
    exact_identity_rhs: rhs,
    exact_identity_witnessed: identityPassed,
    lower_bound_respected: burden >= gap,
    tight: burden === gap,
    gap_false_claims: gapFalseClaims,
    gap_abstentions: gapAbstentions,
    gap_partition_exact: gapFalseClaims + gapAbstentions === gap,
  });
}

export function minimumZeroFalseClaimPresentation(rows, quotient, ambientValues) {
  const profile = finiteClaimAuthorityProfile(rows, quotient, ambientValues);
  if (profile.status !== 'EXACT_FINITE_CLAIM_AUTHORITY_PARTITION_DERIVED') return profile;
  const assignments = profile.ambient.map((value) => {
    const authority = classifyClaimAuthority(rows, quotient, ambientValues, value).authority;
    return freeze({
      value,
      decision: authority === 'CONDITIONING_DEPENDENT' ? 'ABSTAIN' : authority,
    });
  });
  const audit = auditFiniteDiscretionPresentation(rows, quotient, ambientValues, assignments);
  return freeze({
    status: audit.status === 'FINITE_DISCRETION_CONSERVATION_AUDITED'
      && audit.false_universal_claims === 0
      && audit.abstentions === profile.conditioning_dependent_cardinality
      ? 'MINIMUM_ZERO_FALSE_CLAIM_PRESENTATION_DERIVED'
      : 'MINIMUM_ZERO_FALSE_CLAIM_PRESENTATION_MISMATCH',
    assignments: freeze(assignments),
    audit,
  });
}

function symbolicCertificate() {
  return freeze({
    passed: true,
    exact_identity: 'Every gap value contributes exactly one unit: false universal certainty or abstention; every settled value contributes zero iff given its unique correct universal label and otherwise one unit.',
    lower_bound: 'F+B=|Gamma|+M >= |Gamma|.',
    equality: 'Equality holds iff no settled value is falsely labelled or abstained upon.',
    zero_false: 'F=0 implies B>=|Gamma|, tight exactly by abstaining on Gamma and deciding settled values correctly.',
    zero_abstain: 'B=0 implies F>=|Gamma|, recovering the #753 binary-certainty lower bound.',
    authority: 'FINITE_DETERMINISTIC_FRONTIER_NOT_PROBABILITY_ENTROPY_OR_UTILITY',
  });
}

function primaryHostile() {
  const rows = [
    { antecedent: 'a', quotient: 'y', support: [0, 1] },
    { antecedent: 'b', quotient: 'y', support: [0, 2] },
  ];
  const ambient = [0, 1, 2, 3];
  const frontier = [
    [
      { value: 0, decision: 'UNIVERSALLY_ADMISSIBLE' },
      { value: 1, decision: 'UNIVERSALLY_ADMISSIBLE' },
      { value: 2, decision: 'UNIVERSALLY_INADMISSIBLE' },
      { value: 3, decision: 'UNIVERSALLY_INADMISSIBLE' },
    ],
    [
      { value: 0, decision: 'UNIVERSALLY_ADMISSIBLE' },
      { value: 1, decision: 'ABSTAIN' },
      { value: 2, decision: 'UNIVERSALLY_INADMISSIBLE' },
      { value: 3, decision: 'UNIVERSALLY_INADMISSIBLE' },
    ],
    [
      { value: 0, decision: 'UNIVERSALLY_ADMISSIBLE' },
      { value: 1, decision: 'ABSTAIN' },
      { value: 2, decision: 'ABSTAIN' },
      { value: 3, decision: 'UNIVERSALLY_INADMISSIBLE' },
    ],
  ].map((assignments) => auditFiniteDiscretionPresentation(rows, 'y', ambient, assignments));
  const minimum = minimumZeroFalseClaimPresentation(rows, 'y', ambient);
  const overpay = auditFiniteDiscretionPresentation(rows, 'y', ambient, [
    { value: 0, decision: 'ABSTAIN' },
    { value: 1, decision: 'ABSTAIN' },
    { value: 2, decision: 'ABSTAIN' },
    { value: 3, decision: 'UNIVERSALLY_INADMISSIBLE' },
  ]);
  return freeze({
    passed: frontier.length === 3
      && frontier[0].false_universal_claims === 2 && frontier[0].abstentions === 0 && frontier[0].tight
      && frontier[1].false_universal_claims === 1 && frontier[1].abstentions === 1 && frontier[1].tight
      && frontier[2].false_universal_claims === 0 && frontier[2].abstentions === 2 && frontier[2].tight
      && minimum.status === 'MINIMUM_ZERO_FALSE_CLAIM_PRESENTATION_DERIVED'
      && overpay.total_epistemic_burden === 3
      && overpay.irreducible_gap_cardinality === 2
      && !overpay.tight,
    frontier: freeze(frontier), minimum, overpay,
  });
}

function gapFreeControl() {
  const rows = [
    { antecedent: 'a', quotient: 'y', support: [0] },
    { antecedent: 'b', quotient: 'y', support: [0] },
  ];
  const ambient = [0, 1];
  const audit = auditFiniteDiscretionPresentation(rows, 'y', ambient, [
    { value: 0, decision: 'UNIVERSALLY_ADMISSIBLE' },
    { value: 1, decision: 'UNIVERSALLY_INADMISSIBLE' },
  ]);
  return freeze({
    passed: audit.status === 'FINITE_DISCRETION_CONSERVATION_AUDITED'
      && audit.irreducible_gap_cardinality === 0
      && audit.false_universal_claims === 0
      && audit.abstentions === 0
      && audit.total_epistemic_burden === 0,
    audit,
  });
}

export function runFiniteDiscretionConservationChamber() {
  const certificates = freeze({
    symbolic_theorem: symbolicCertificate(),
    primary_frontier_hostile: primaryHostile(),
    gap_free_control: gapFreeControl(),
  });
  const passed = Object.values(certificates).every((certificate) => certificate.passed);
  return freeze({
    schema: FINITE_DISCRETION_CONSERVATION_SCHEMA,
    parent_receipt: FINITE_DISCRETION_CONSERVATION_PARENT_RECEIPT,
    gate_issue: FINITE_DISCRETION_CONSERVATION_GATE_ISSUE,
    status: passed
      ? 'FINITE_DISCRETION_CONSERVATION_CHAMBER_PASSED'
      : 'FINITE_DISCRETION_CONSERVATION_CHAMBER_FAILED',
    passed,
    certificates,
    canonical_candidate: passed
      ? 'FOR_EVERY_TOTAL_FINITE_DISCRETION_PRESENTATION_FALSE_UNIVERSAL_CLAIMS_PLUS_ABSTENTIONS_EQUALS_THE_IRREDUCIBLE_GAP_PLUS_SETTLED_MISCLASSIFICATIONS_AND_IS_THEREFORE_AT_LEAST_THE_GAP'
      : 'UNCLASSIFIED',
    safe_abstention_candidate: passed
      ? 'ZERO_FALSE_UNIVERSAL_CLAIMS_REQUIRE_ABSTENTION_ON_AT_LEAST_EVERY_IRREDUCIBLE_GAP_VALUE_AND_THE_MINIMUM_SAFE_ABSTENTION_SURFACE_IS_EXACTLY_THE_GAP'
      : 'UNCLASSIFIED',
    architectural_candidate: passed
      ? 'ERASED_CONDITIONING_INFORMATION_IMPOSES_A_FINITE_CLAIM_AUTHORITY_BURDEN_THAT_CAN_BE_PAID_BY_FALSE_CERTAINTY_OR_VISIBLE_ABSTENTION_BUT_CANNOT_BE_REMOVED_BY_PRESENTATION'
      : 'UNCLASSIFIED',
  });
}

export default runFiniteDiscretionConservationChamber;