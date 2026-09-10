import {
  quotientBaseForRoute,
  firstMomentForRoute,
  parallelLiftFiberReturn,
} from './aperture-pedagogue-parallel-lift-fiber-return.js';

export const SAME_BASE_COMPARISON_REPRESENTATION_SCHEMA = 'td613.a15-r0.same-base-comparison-representation/v0.1';
export const SAME_BASE_COMPARISON_REPRESENTATION_PARENT_RECEIPT = '3788dec7a362b55feeb2a79fa4d610fa761a40d6';
export const SAME_BASE_COMPARISON_REPRESENTATION_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const canonicalInteger = (value) => (value === 0 ? 0 : value);
const keyOf = (value) => JSON.stringify(value);

function validWord(word) {
  return Array.isArray(word) && word.every((token) => token === 'T' || token === 'Q');
}

function sameWord(a, b) {
  return validWord(a) && validWord(b) && keyOf(a) === keyOf(b);
}

function validBase(base) {
  return base && [base.t, base.E, base.O].every((n) => Number.isInteger(n) && n >= 0);
}

function sameBase(a, b) {
  return validBase(a) && validBase(b) && a.t === b.t && a.E === b.E && a.O === b.O;
}

function identityBase() {
  return freeze({ t: 0, E: 0, O: 0 });
}

function wordFromBlocks(blocks) {
  const word = [];
  for (let i = 0; i < blocks.length; i += 1) {
    for (let j = 0; j < blocks[i]; j += 1) word.push('Q');
    if (i < blocks.length - 1) word.push('T');
  }
  return freeze(word);
}

export function sameBaseComparisonArrow(u, v) {
  if (!validWord(u) || !validWord(v)) {
    return freeze({ status: 'SAME_BASE_COMPARISON_ARROW_ABSTAINS_INVALID_ROUTE' });
  }
  const baseU = quotientBaseForRoute(u);
  const baseV = quotientBaseForRoute(v);
  const momentU = firstMomentForRoute(u);
  const momentV = firstMomentForRoute(v);
  if (baseU.status !== 'PARALLEL_LIFT_ROUTE_BASE_DERIVED'
    || baseV.status !== 'PARALLEL_LIFT_ROUTE_BASE_DERIVED'
    || momentU.status !== 'PARALLEL_LIFT_FIRST_MOMENT_DERIVED'
    || momentV.status !== 'PARALLEL_LIFT_FIRST_MOMENT_DERIVED') {
    return freeze({ status: 'SAME_BASE_COMPARISON_ARROW_ABSTAINS_PARENT' });
  }
  if (!sameBase(baseU.base, baseV.base)) {
    return freeze({
      status: 'SAME_BASE_COMPARISON_ARROW_ABSTAINS_DIFFERENT_BASE',
      base_u: baseU.base,
      base_v: baseV.base,
    });
  }
  const translation = canonicalInteger(momentU.P - momentV.P);
  const parentReturn = parallelLiftFiberReturn(u, v, 0);
  return freeze({
    status: 'FORMAL_SAME_BASE_COMPARISON_ARROW_DERIVED',
    base: baseU.base,
    source: freeze([...v]),
    target: freeze([...u]),
    P_source: momentV.P,
    P_target: momentU.P,
    translation,
    represented_automorphism: `tau_${translation}`,
    parent_return_consistent: parentReturn.status === 'PARALLEL_LIFT_SAME_BASE_FIBER_RETURN_AUTOMORPHISM_DERIVED'
      && parentReturn.translation === translation,
    kernel_arrow: translation === 0,
    quarantine: freeze([
      'FORMAL_COMPARISON_ARROW_NOT_OPERATIONAL_TQ_PATH',
      'FORMAL_INVERSE_NOT_INVERSE_OPERATIONAL_ROUTE',
      'COMPARISON_REPRESENTATION_NOT_HOLONOMY_REPRESENTATION',
    ]),
  });
}

export function invertSameBaseComparisonArrow(arrow) {
  if (arrow?.status !== 'FORMAL_SAME_BASE_COMPARISON_ARROW_DERIVED') {
    return freeze({ status: 'SAME_BASE_COMPARISON_INVERSE_ABSTAINS' });
  }
  return sameBaseComparisonArrow(arrow.source, arrow.target);
}

export function composeSameBaseComparisonArrows(left, right) {
  if (left?.status !== 'FORMAL_SAME_BASE_COMPARISON_ARROW_DERIVED'
    || right?.status !== 'FORMAL_SAME_BASE_COMPARISON_ARROW_DERIVED') {
    return freeze({ status: 'SAME_BASE_COMPARISON_COMPOSITION_ABSTAINS_INVALID_ARROW' });
  }
  if (!sameBase(left.base, right.base) || !sameWord(left.source, right.target)) {
    return freeze({
      status: 'SAME_BASE_COMPARISON_COMPOSITION_ABSTAINS_NONCOMPOSABLE',
      left,
      right,
    });
  }
  const composed = sameBaseComparisonArrow(left.target, right.source);
  const translationSum = canonicalInteger(left.translation + right.translation);
  return freeze({
    status: 'FORMAL_SAME_BASE_COMPARISON_COMPOSITION_DERIVED',
    left,
    right,
    composed,
    translation_sum: translationSum,
    functorial: composed.status === 'FORMAL_SAME_BASE_COMPARISON_ARROW_DERIVED'
      && composed.translation === translationSum,
  });
}

export function sameBaseDistributionFreedom(base) {
  if (!validBase(base)) return freeze({ status: 'SAME_BASE_DISTRIBUTION_FREEDOM_ABSTAINS' });
  const evenSlots = Math.floor(base.t / 2) + 1;
  const oddSlots = Math.ceil(base.t / 2);
  const evenFreedom = base.E > 0 && evenSlots >= 2;
  const oddFreedom = base.O > 0 && oddSlots >= 2;
  return freeze({
    status: 'SAME_BASE_DISTRIBUTION_FREEDOM_DERIVED',
    base: freeze({ ...base }),
    even_slots: evenSlots,
    odd_slots: oddSlots,
    even_freedom: evenFreedom,
    odd_freedom: oddFreedom,
    has_freedom: evenFreedom || oddFreedom,
    equivalent_condition: '(E>0 && t>=2) || (O>0 && t>=3)',
  });
}

function generatorWitnessForBase(base) {
  const freedom = sameBaseDistributionFreedom(base);
  if (freedom.status !== 'SAME_BASE_DISTRIBUTION_FREEDOM_DERIVED') {
    return freeze({ status: 'SAME_BASE_GENERATOR_WITNESS_ABSTAINS' });
  }
  if (!freedom.has_freedom) {
    return freeze({
      status: 'SAME_BASE_GENERATOR_WITNESS_TRIVIAL_NO_FREEDOM',
      base: freeze({ ...base }),
      translation: 0,
    });
  }

  const blocksA = Array(base.t + 1).fill(0);
  const blocksB = Array(base.t + 1).fill(0);
  blocksA[0] = base.E;
  blocksB[0] = base.E;
  if (base.t >= 1) {
    blocksA[1] = base.O;
    blocksB[1] = base.O;
  }

  if (freedom.even_freedom) {
    blocksB[0] -= 1;
    blocksB[2] += 1;
  } else {
    blocksB[1] -= 1;
    blocksB[3] += 1;
  }

  const u = wordFromBlocks(blocksB);
  const v = wordFromBlocks(blocksA);
  const arrow = sameBaseComparisonArrow(u, v);
  return freeze({
    status: 'SAME_BASE_PLUS_TWO_GENERATOR_WITNESS_DERIVED',
    base: freeze({ ...base }),
    u,
    v,
    arrow,
    translation: arrow.translation,
    passed: arrow.status === 'FORMAL_SAME_BASE_COMPARISON_ARROW_DERIVED'
      && sameBase(arrow.base, base)
      && arrow.translation === 2,
  });
}

export function generatedReturnTranslationSubgroupProfile(base) {
  const freedom = sameBaseDistributionFreedom(base);
  if (freedom.status !== 'SAME_BASE_DISTRIBUTION_FREEDOM_DERIVED') {
    return freeze({ status: 'GENERATED_RETURN_SUBGROUP_ABSTAINS' });
  }
  const generator = generatorWitnessForBase(base);
  const passed = freedom.has_freedom ? generator.passed : generator.translation === 0;
  return freeze({
    status: passed
      ? 'GENERATED_RETURN_TRANSLATION_SUBGROUP_CLASSIFIED'
      : 'GENERATED_RETURN_TRANSLATION_SUBGROUP_NOT_CLASSIFIED',
    passed,
    base: freeze({ ...base }),
    distribution_freedom: freedom,
    literal_return_difference_set: 'FINITE_SUBSET_OF_2Z',
    parity_identity: 'P(w)=sum_i i*q_i ≡ sum_(i odd)q_i=O (mod 2), so every same-base difference is even.',
    generator_witness: generator,
    generated_subgroup: freedom.has_freedom ? '2Z' : '{0}',
    generated_subgroup_step: freedom.has_freedom ? 2 : 0,
    proof: freedom.has_freedom
      ? 'Parity gives all represented differences even; an actual +2 represented return exists; inverses/composition in Aut(Z) generate every even translation.'
      : 'Without block-distribution freedom the fixed parity totals determine every q_i, hence P is constant and every represented return is identity.',
    clarification: '2Z_IS_THE_SUBGROUP_GENERATED_BY_THE_FINITE_REPRESENTED_DIFFERENCE_SET_NOT_THE_LITERAL_FINITE_IMAGE_SET',
  });
}

function pairGroupoidRepresentationCertificate() {
  const u = freeze(['T', 'T', 'Q', 'Q']);
  const v = freeze(['Q', 'T', 'T', 'Q']);
  const w = freeze(['Q', 'Q', 'T', 'T']);
  const uv = sameBaseComparisonArrow(u, v);
  const vw = sameBaseComparisonArrow(v, w);
  const uu = sameBaseComparisonArrow(u, u);
  const vu = invertSameBaseComparisonArrow(uv);
  const composed = composeSameBaseComparisonArrows(uv, vw);
  const inverseComposition = composeSameBaseComparisonArrows(vu, uv);
  return freeze({
    passed: uv.status === 'FORMAL_SAME_BASE_COMPARISON_ARROW_DERIVED'
      && vw.status === 'FORMAL_SAME_BASE_COMPARISON_ARROW_DERIVED'
      && uu.translation === 0
      && vu.translation === -uv.translation
      && composed.functorial
      && composed.composed.translation === 4
      && inverseComposition.functorial
      && inverseComposition.composed.translation === 0
      && [uv, vw, uu, vu].every((arrow) => arrow.parent_return_consistent),
    u,
    v,
    w,
    arrow_u_from_v: uv,
    arrow_v_from_w: vw,
    identity_u: uu,
    inverse_v_from_u: vu,
    composition_u_from_w: composed,
    inverse_composition: inverseComposition,
    formal_structure: 'PAIR_GROUPOID_ON_SAME_BASE_ROUTE_REPRESENTATIVES_ONLY',
  });
}

function kernelCertificate() {
  const nonkernel = sameBaseComparisonArrow(
    freeze(['T', 'T', 'Q']),
    freeze(['Q', 'T', 'T']),
  );
  const u = freeze(['T', 'Q', 'T', 'Q', 'T']);
  const v = freeze(['Q', 'T', 'T', 'T', 'Q']);
  const kernel = sameBaseComparisonArrow(u, v);
  return freeze({
    passed: nonkernel.translation === 2
      && !nonkernel.kernel_arrow
      && !sameWord(u, v)
      && kernel.status === 'FORMAL_SAME_BASE_COMPARISON_ARROW_DERIVED'
      && kernel.P_source === 3
      && kernel.P_target === 3
      && kernel.translation === 0
      && kernel.kernel_arrow,
    nonkernel,
    kernel,
    exact_symbolic_kernel: 'rho_b([u<-v])=id iff P(u)-P(v)=0 iff P(u)=P(v).',
    nonfaithfulness_witnessed: true,
  });
}

function rkGeneratedSubgroupCertificate() {
  const sampleKs = freeze([0, 1, 2, 7, 19]);
  const rows = sampleKs.map((k) => {
    const base = freeze({ t: 2, E: 1, O: k });
    const profile = generatedReturnTranslationSubgroupProfile(base);
    const left = freeze(['T', ...Array(k).fill('Q'), 'T', 'Q']);
    const right = freeze(['Q', 'T', ...Array(k).fill('Q'), 'T']);
    const arrow = sameBaseComparisonArrow(left, right);
    return freeze({
      k,
      base,
      profile,
      arrow,
      passed: profile.passed
        && profile.generated_subgroup === '2Z'
        && arrow.translation === 2,
    });
  });
  return freeze({
    passed: rows.every((row) => row.passed),
    rows: freeze(rows),
    symbolic_all_finite: 'For every finite k>=0, base (2,1,k) has two even block positions and E=1>0, so +2 is represented and all same-base differences are even; generated subgroup is exactly 2Z.',
  });
}

function noFreedomCertificate() {
  const bases = freeze([
    freeze({ t: 0, E: 5, O: 0 }),
    freeze({ t: 1, E: 4, O: 7 }),
    freeze({ t: 2, E: 0, O: 6 }),
  ]);
  const rows = bases.map((base) => {
    const profile = generatedReturnTranslationSubgroupProfile(base);
    return freeze({ base, profile, passed: profile.passed && profile.generated_subgroup === '{0}' });
  });
  return freeze({
    passed: rows.every((row) => row.passed),
    rows: freeze(rows),
    symbolic: 'No positive mass has two same-parity block slots available, so the block allocation and P are unique.',
  });
}

export function sectionRezeroedComparisonReturn(u, v, section) {
  if (!validWord(u) || !validWord(v) || typeof section !== 'function') {
    return freeze({ status: 'SECTION_REZEROED_COMPARISON_ABSTAINS' });
  }
  const zero = section(identityBase());
  if (!Number.isInteger(zero) || zero !== 0) {
    return freeze({ status: 'SECTION_REZEROED_COMPARISON_ABSTAINS_NONNORMALIZED_SECTION' });
  }
  const arrow = sameBaseComparisonArrow(u, v);
  if (arrow.status !== 'FORMAL_SAME_BASE_COMPARISON_ARROW_DERIVED') return arrow;
  const shift = section(arrow.base);
  if (!Number.isInteger(shift)) return freeze({ status: 'SECTION_REZEROED_COMPARISON_ABSTAINS_NONINTEGER_SECTION' });
  const PTargetPhi = canonicalInteger(arrow.P_target + shift);
  const PSourcePhi = canonicalInteger(arrow.P_source + shift);
  const translationPhi = canonicalInteger(PTargetPhi - PSourcePhi);
  return freeze({
    status: 'LAWFUL_SECTION_REZEROED_COMPARISON_RETURN_DERIVED',
    base: arrow.base,
    original_translation: arrow.translation,
    section_shift_at_base: shift,
    P_target_phi: PTargetPhi,
    P_source_phi: PSourcePhi,
    transformed_translation: translationPhi,
    invariant: translationPhi === arrow.translation,
    symbolic: '[P(u)+phi(b)]-[P(v)+phi(b)]=P(u)-P(v).',
  });
}

function sectionRezeroingCertificate() {
  const sections = freeze([
    freeze({ name: 'quadratic', fn: (b) => (b.t * b.t) + b.E + b.O }),
    freeze({ name: 'linear', fn: (b) => (3 * b.t) - (2 * b.E) + (5 * b.O) }),
  ]);
  const pairs = freeze([
    freeze([freeze(['T', 'T', 'Q']), freeze(['Q', 'T', 'T'])]),
    freeze([freeze(['T', 'Q', 'T', 'Q', 'T']), freeze(['Q', 'T', 'T', 'T', 'Q'])]),
    freeze([freeze(['T', 'T', 'Q', 'Q']), freeze(['Q', 'Q', 'T', 'T'])]),
  ]);
  const rows = [];
  for (const { name, fn } of sections) {
    for (const [u, v] of pairs) {
      const result = sectionRezeroedComparisonReturn(u, v, fn);
      rows.push(freeze({ name, u, v, result, passed: result.invariant }));
    }
  }
  return freeze({
    passed: rows.every((row) => row.passed),
    rows: freeze(rows),
    universal_identity: 'For every normalized integer phi:B->Z and same-base u,v, the common phi(b) cancels exactly from the return translation.',
    coordinate_conjugation: 'Base-local integer translations conjugate integer translations trivially because the translation group is abelian.',
  });
}

function routeDependentFakeRezeroingHostile() {
  const u = freeze(['T', 'T', 'Q']);
  const v = freeze(['Q', 'T', 'T']);
  const arrow = sameBaseComparisonArrow(u, v);
  const fakeTargetShift = 7;
  const fakeSourceShift = -2;
  const fakeTranslation = canonicalInteger(
    (arrow.P_target + fakeTargetShift) - (arrow.P_source + fakeSourceShift),
  );
  return freeze({
    passed: arrow.translation === 2 && fakeTranslation === 11 && fakeTranslation !== arrow.translation,
    arrow,
    fake_target_shift: fakeTargetShift,
    fake_source_shift: fakeSourceShift,
    fake_translation: fakeTranslation,
    classification: 'ROUTE_DEPENDENT_REZEROING_IS_OUTSIDE_#734_BASE_SECTION_JURISDICTION',
    lesson: 'Section invariance is earned for lawful base-only re-zeroings, not arbitrary route-spelling offsets.',
  });
}

function abstentionHostiles() {
  const differentBase = sameBaseComparisonArrow(freeze(['T']), freeze(['Q']));
  const a = sameBaseComparisonArrow(freeze(['T', 'T', 'Q']), freeze(['Q', 'T', 'T']));
  const b = sameBaseComparisonArrow(freeze(['T', 'T', 'Q']), freeze(['Q', 'T', 'T']));
  const noncomposable = composeSameBaseComparisonArrows(a, b);
  return freeze({
    passed: differentBase.status === 'SAME_BASE_COMPARISON_ARROW_ABSTAINS_DIFFERENT_BASE'
      && noncomposable.status === 'SAME_BASE_COMPARISON_COMPOSITION_ABSTAINS_NONCOMPOSABLE',
    different_base: differentBase,
    noncomposable,
  });
}

export function sameBaseComparisonRepresentationCertificate() {
  const representation = pairGroupoidRepresentationCertificate();
  const kernel = kernelCertificate();
  const rk = rkGeneratedSubgroupCertificate();
  const noFreedom = noFreedomCertificate();
  const section = sectionRezeroingCertificate();
  const fakeSection = routeDependentFakeRezeroingHostile();
  const abstentions = abstentionHostiles();
  const passed = representation.passed
    && kernel.passed
    && rk.passed
    && noFreedom.passed
    && section.passed
    && fakeSection.passed
    && abstentions.passed;
  return freeze({
    schema: SAME_BASE_COMPARISON_REPRESENTATION_SCHEMA,
    parent_receipt: SAME_BASE_COMPARISON_REPRESENTATION_PARENT_RECEIPT,
    gate_issue: SAME_BASE_COMPARISON_REPRESENTATION_GATE_ISSUE,
    status: passed
      ? 'SAME_BASE_COMPARISON_REPRESENTATION_AND_SECTION_REZEROING_INVARIANCE_CERTIFIED'
      : 'SAME_BASE_COMPARISON_REPRESENTATION_NOT_CERTIFIED',
    passed,
    pair_groupoid_representation: representation,
    kernel,
    all_finite_Rk_generated_subgroup: rk,
    no_distribution_freedom: noFreedom,
    lawful_section_rezeroing: section,
    route_dependent_fake_section_hostile: fakeSection,
    abstention_hostiles: abstentions,
    canonical_classifications: freeze([
      'FORMAL_SAME_BASE_ROUTE_PAIR_GROUPOID_ADMITS_A_RETURN_TRANSLATION_REPRESENTATION_INTO_AUT_Z',
      'REPRESENTATION_KERNEL_IS_EXACTLY_EQUAL_FIRST_MOMENT_P_AND_IS_NONFAITHFUL_ON_WITNESSED_ROUTE_FIBERS',
      'GENERATED_RETURN_TRANSLATION_SUBGROUP_IS_TRIVIAL_WITHOUT_BLOCK_FREEDOM_AND_2Z_WITH_BLOCK_FREEDOM',
      'SAME_BASE_RETURN_REPRESENTATION_IS_EXACTLY_INVARIANT_UNDER_LAWFUL_NORMALIZED_BASE_SECTION_REZEROING',
    ]),
    quarantines: freeze([
      'FORMAL_COMPARISON_GROUPOID_NOT_OPERATIONAL_TQ_PATH_GROUPOID',
      'COMPARISON_REPRESENTATION_NOT_HOLONOMY_REPRESENTATION',
      'SECTION_REZEROING_INVARIANCE_NOT_CONNECTION_GAUGE_INVARIANCE',
      'GENERATED_RETURN_SUBGROUP_NOT_HOLONOMY_GROUP',
    ]),
  });
}
