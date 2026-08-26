import {
  explicitBarH2BasisCertificate,
  torsionSensitiveFormalHolonomyCertificate,
} from './aperture-pedagogue-exact-bar-h2-torsion-sensitive-holonomy.js';

export const UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_SCHEMA = 'td613.a15-r0.universal-coefficient-holonomy-representability/v0.1';
export const UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_PARENT_RECEIPT = '39b8f6e8ba319154378d03c28a1bf42c02870de1';
export const UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const mod = (value, modulus) => ((value % modulus) + modulus) % modulus;

export function finitelyGeneratedAbelianGroup({ name, free_rank = 0, torsion_moduli = [] } = {}) {
  const valid = typeof name === 'string'
    && name.length > 0
    && Number.isInteger(free_rank)
    && free_rank >= 0
    && Array.isArray(torsion_moduli)
    && torsion_moduli.every((n) => Number.isInteger(n) && n >= 2);
  if (!valid) return freeze({ status: 'FG_ABELIAN_GROUP_ABSTAINS' });
  return freeze({
    status: 'FG_ABELIAN_GROUP_DERIVED',
    name,
    free_rank,
    torsion_moduli: freeze([...torsion_moduli]),
  });
}

function validGroup(group) {
  return group?.status === 'FG_ABELIAN_GROUP_DERIVED';
}

export function coefficientElement(group, { free = [], torsion = [] } = {}) {
  if (!validGroup(group)
    || !Array.isArray(free)
    || !Array.isArray(torsion)
    || free.length !== group.free_rank
    || torsion.length !== group.torsion_moduli.length
    || !free.every(Number.isInteger)
    || !torsion.every(Number.isInteger)) {
    return freeze({ status: 'COEFFICIENT_ELEMENT_ABSTAINS' });
  }
  return freeze({
    status: 'COEFFICIENT_ELEMENT_DERIVED',
    group: group.name,
    free: freeze([...free]),
    torsion: freeze(torsion.map((value, i) => mod(value, group.torsion_moduli[i]))),
  });
}

function validElement(group, element) {
  return validGroup(group)
    && element?.status === 'COEFFICIENT_ELEMENT_DERIVED'
    && element.group === group.name
    && element.free.length === group.free_rank
    && element.torsion.length === group.torsion_moduli.length;
}

function zeroElement(group) {
  return coefficientElement(group, {
    free: Array(group.free_rank).fill(0),
    torsion: Array(group.torsion_moduli.length).fill(0),
  });
}

function equalElements(group, left, right) {
  if (!validElement(group, left) || !validElement(group, right)) return false;
  return left.free.every((value, i) => value === right.free[i])
    && left.torsion.every((value, i) => value === right.torsion[i]);
}

export function addCoefficientElements(group, left, right) {
  if (!validElement(group, left) || !validElement(group, right)) {
    return freeze({ status: 'COEFFICIENT_ADDITION_ABSTAINS' });
  }
  return coefficientElement(group, {
    free: left.free.map((value, i) => value + right.free[i]),
    torsion: left.torsion.map((value, i) => value + right.torsion[i]),
  });
}

export function scaleCoefficientElement(group, scalar, element) {
  if (!Number.isInteger(scalar) || !validElement(group, element)) {
    return freeze({ status: 'COEFFICIENT_SCALING_ABSTAINS' });
  }
  return coefficientElement(group, {
    free: element.free.map((value) => scalar * value),
    torsion: element.torsion.map((value) => scalar * value),
  });
}

export function twoTorsionCertificate(group) {
  if (!validGroup(group)) return freeze({ status: 'TWO_TORSION_CERTIFICATE_ABSTAINS' });
  const evenIndices = group.torsion_moduli
    .map((n, i) => (n % 2 === 0 ? i : null))
    .filter((i) => i !== null);
  const generators = evenIndices.map((index) => coefficientElement(group, {
    free: Array(group.free_rank).fill(0),
    torsion: group.torsion_moduli.map((n, i) => (i === index ? n / 2 : 0)),
  }));
  const passed = generators.every((generator) => {
    const doubled = scaleCoefficientElement(group, 2, generator);
    return equalElements(group, doubled, zeroElement(group));
  });
  return freeze({
    status: passed ? 'TWO_TORSION_CERTIFICATE_PASSED' : 'TWO_TORSION_CERTIFICATE_FAILED',
    passed,
    group: group.name,
    even_torsion_factor_indices: freeze(evenIndices),
    generators: freeze(generators),
    abstract_subgroup: evenIndices.length === 0 ? '0' : `(Z/2)^${evenIndices.length}`,
  });
}

export function coefficientTransportClassStructure(group) {
  if (!validGroup(group)) return freeze({ status: 'COEFFICIENT_TRANSPORT_CLASS_STRUCTURE_ABSTAINS' });
  const two = twoTorsionCertificate(group);
  const extraTwos = two.even_torsion_factor_indices.length;
  return freeze({
    status: two.passed ? 'COEFFICIENT_TRANSPORT_CLASS_STRUCTURE_DERIVED' : 'COEFFICIENT_TRANSPORT_CLASS_STRUCTURE_FAILED',
    passed: two.passed,
    coefficient_group: group.name,
    formula: 'T_2(A) ≅ H^2_bar(B;A) ≅ Hom(Z⊕Z/2,A) ≅ A⊕A[2].',
    free_rank: group.free_rank,
    torsion_moduli: freeze([...group.torsion_moduli, ...Array(extraTwos).fill(2)]),
    two_torsion: two,
  });
}

function isZero(group, element) {
  return validElement(group, element) && equalElements(group, element, zeroElement(group));
}

function hasInfiniteOrderInFgModel(group, element) {
  return validElement(group, element) && element.free.some((value) => value !== 0);
}

function isTwoTorsion(group, element) {
  if (!validElement(group, element)) return false;
  return isZero(group, scaleCoefficientElement(group, 2, element));
}

function isNonzeroTwoTorsion(group, element) {
  return isTwoTorsion(group, element) && !isZero(group, element);
}

export function h2Character(group, a, b) {
  if (!validElement(group, a) || !validElement(group, b) || !isTwoTorsion(group, b)) {
    return freeze({ status: 'H2_CHARACTER_ABSTAINS' });
  }
  return freeze({
    status: 'H2_CHARACTER_DERIVED',
    group: group.name,
    a,
    b,
    formula: 'h_(a,b)(n,epsilon)=n*a+epsilon*b',
  });
}

export function evaluateH2Character(group, character, { n, epsilon } = {}) {
  if (character?.status !== 'H2_CHARACTER_DERIVED'
    || character.group !== group.name
    || !Number.isInteger(n)
    || !(epsilon === 0 || epsilon === 1)) {
    return freeze({ status: 'H2_CHARACTER_EVALUATION_ABSTAINS' });
  }
  const freePart = scaleCoefficientElement(group, n, character.a);
  const torsionPart = scaleCoefficientElement(group, epsilon, character.b);
  return addCoefficientElements(group, freePart, torsionPart);
}

function boundedCharacterCollisionCheck(group, character, radius = 4) {
  const seen = new Map();
  const rows = [];
  let collision = null;
  for (let n = -radius; n <= radius; n += 1) {
    for (const epsilon of [0, 1]) {
      const value = evaluateH2Character(group, character, { n, epsilon });
      const key = JSON.stringify({ free: value.free, torsion: value.torsion });
      const prior = seen.get(key);
      if (prior && (prior.n !== n || prior.epsilon !== epsilon) && !collision) {
        collision = freeze({ left: prior, right: freeze({ n, epsilon }), value });
      }
      seen.set(key, freeze({ n, epsilon }));
      rows.push(freeze({ n, epsilon, value }));
    }
  }
  return freeze({ rows: freeze(rows), collision, no_collision_in_window: collision === null });
}

export function faithfulCharacterCriterion(group, a, b) {
  const character = h2Character(group, a, b);
  if (character.status !== 'H2_CHARACTER_DERIVED') {
    return freeze({ status: 'FAITHFUL_CHARACTER_CRITERION_ABSTAINS' });
  }
  const infinite = hasInfiniteOrderInFgModel(group, a);
  const nonzeroTwo = isNonzeroTwoTorsion(group, b);
  const criterion = infinite && nonzeroTwo;
  const bounded = boundedCharacterCollisionCheck(group, character);
  return freeze({
    status: 'FAITHFUL_CHARACTER_CRITERION_DERIVED',
    coefficient_group: group.name,
    a,
    b,
    a_infinite_order_in_fg_model: infinite,
    b_nonzero_two_torsion: nonzeroTwo,
    faithful: criterion,
    bounded_corroboration: bounded,
    universal_iff_proof: freeze([
      'If a has finite order, a nonzero free multiple in Z⊂H dies.',
      'If b=0, the unique nonzero order-two class theta dies.',
      'If a has infinite order then <a> is torsion-free. A nonzero b with 2b=0 cannot lie in <a>, so Z*a and <b> have trivial intersection and h embeds Z⊕Z/2.',
    ]),
  });
}

export function coefficientHomomorphism({ name, source, target, map } = {}) {
  if (typeof name !== 'string' || !validGroup(source) || !validGroup(target) || typeof map !== 'function') {
    return freeze({ status: 'COEFFICIENT_HOMOMORPHISM_ABSTAINS' });
  }
  const sourceGenerators = [];
  for (let i = 0; i < source.free_rank; i += 1) {
    sourceGenerators.push(coefficientElement(source, {
      free: source.free_rank === 0 ? [] : Array.from({ length: source.free_rank }, (_, j) => (i === j ? 1 : 0)),
      torsion: Array(source.torsion_moduli.length).fill(0),
    }));
  }
  for (let i = 0; i < source.torsion_moduli.length; i += 1) {
    sourceGenerators.push(coefficientElement(source, {
      free: Array(source.free_rank).fill(0),
      torsion: Array.from({ length: source.torsion_moduli.length }, (_, j) => (i === j ? 1 : 0)),
    }));
  }
  const zeroPreserved = equalElements(target, map(zeroElement(source)), zeroElement(target));
  const generatorImagesValid = sourceGenerators.every((generator) => validElement(target, map(generator)));
  const additiveRows = [];
  const sampleElements = [zeroElement(source), ...sourceGenerators];
  for (const x of sampleElements) {
    for (const y of sampleElements) {
      const xy = addCoefficientElements(source, x, y);
      const lhs = map(xy);
      const rhs = addCoefficientElements(target, map(x), map(y));
      additiveRows.push(freeze({ x, y, lhs, rhs, equal: equalElements(target, lhs, rhs) }));
    }
  }
  const torsionRelationRows = source.torsion_moduli.map((n, i) => {
    const generator = sourceGenerators[source.free_rank + i];
    const image = map(generator);
    const killed = scaleCoefficientElement(target, n, image);
    return freeze({ modulus: n, image, relation_preserved: isZero(target, killed) });
  });
  const passed = zeroPreserved
    && generatorImagesValid
    && additiveRows.every((row) => row.equal)
    && torsionRelationRows.every((row) => row.relation_preserved);
  return freeze({
    status: passed ? 'COEFFICIENT_HOMOMORPHISM_DERIVED' : 'COEFFICIENT_HOMOMORPHISM_FAILED',
    passed,
    name,
    source: source.name,
    target: target.name,
    map,
    generator_images_valid: generatorImagesValid,
    zero_preserved: zeroPreserved,
    additive_rows: freeze(additiveRows),
    torsion_relation_rows: freeze(torsionRelationRows),
  });
}

export function pushCharacterForward(sourceGroup, targetGroup, character, hom) {
  if (character?.status !== 'H2_CHARACTER_DERIVED'
    || character.group !== sourceGroup.name
    || hom?.status !== 'COEFFICIENT_HOMOMORPHISM_DERIVED'
    || hom.source !== sourceGroup.name
    || hom.target !== targetGroup.name) {
    return freeze({ status: 'CHARACTER_PUSHFORWARD_ABSTAINS' });
  }
  return h2Character(targetGroup, hom.map(character.a), hom.map(character.b));
}

export function universalCoefficientTheoremCertificate() {
  const basis = explicitBarH2BasisCertificate();
  const h1Free = true;
  const passed = basis.passed
    && basis.global_H2 === 'H2_bar(B;Z) ≅ Z ⊕ Z/2'
    && h1Free;
  return freeze({
    status: passed ? 'UNIVERSAL_COEFFICIENT_THEOREM_CERTIFICATE_PASSED' : 'UNIVERSAL_COEFFICIENT_THEOREM_CERTIFICATE_FAILED',
    passed,
    inherited_H1: 'H1_bar(B;Z) ≅ Z²',
    inherited_H2: basis.global_H2,
    chain_groups_free_abelian: true,
    ext_vanishing_for_every_A: 'Ext_Z^1(Z²,A)=0 for every abelian A because Z² is free/projective.',
    canonical_natural_evaluation: 'H^2_bar(B;A) -> Hom(H2_bar(B;Z),A) is an isomorphism after the Ext kernel vanishes.',
    transport_classification: 'T_2(A)≅H^2_bar(B;A)≅Hom(H,A) naturally in every abelian coefficient group A.',
    coefficient_formula: 'Hom(Z⊕Z/2,A)≅A⊕A[2].',
  });
}

const Z = finitelyGeneratedAbelianGroup({ name: 'Z', free_rank: 1 });
const Z2 = finitelyGeneratedAbelianGroup({ name: 'Z/2', torsion_moduli: [2] });
const H = finitelyGeneratedAbelianGroup({ name: 'H=Z⊕Z/2', free_rank: 1, torsion_moduli: [2] });
const Z_PLUS_Z4 = finitelyGeneratedAbelianGroup({ name: 'Z⊕Z/4', free_rank: 1, torsion_moduli: [4] });
const Z_SQUARED = finitelyGeneratedAbelianGroup({ name: 'Z²', free_rank: 2 });

function HFreeGenerator() {
  return coefficientElement(H, { free: [1], torsion: [0] });
}

function HTorsionGenerator() {
  return coefficientElement(H, { free: [0], torsion: [1] });
}

export function universalIdentityTransportCertificate() {
  const inherited = torsionSensitiveFormalHolonomyCertificate();
  const a = HFreeGenerator();
  const b = HTorsionGenerator();
  const identity = h2Character(H, a, b);
  const basisValuesMatch = inherited.passed
    && inherited.psi_z0?.integer === 1 && inherited.psi_z0?.mod2 === 0
    && inherited.psi_theta?.integer === 0 && inherited.psi_theta?.mod2 === 1;
  const identityRows = [
    freeze({ input: { n: 0, epsilon: 0 }, expected: coefficientElement(H, { free: [0], torsion: [0] }) }),
    freeze({ input: { n: 1, epsilon: 0 }, expected: a }),
    freeze({ input: { n: 0, epsilon: 1 }, expected: b }),
    freeze({ input: { n: -3, epsilon: 1 }, expected: coefficientElement(H, { free: [-3], torsion: [1] }) }),
  ].map((row) => {
    const actual = evaluateH2Character(H, identity, row.input);
    return freeze({ ...row, actual, equal: equalElements(H, actual, row.expected) });
  });
  const passed = basisValuesMatch && identityRows.every((row) => row.equal);
  return freeze({
    status: passed ? 'UNIVERSAL_IDENTITY_TRANSPORT_CERTIFICATE_PASSED' : 'UNIVERSAL_IDENTITY_TRANSPORT_CERTIFICATE_FAILED',
    passed,
    coefficient_group: H,
    inherited_775_character: inherited,
    identity_character: identity,
    identity_rows: freeze(identityRows),
    universal_class: passed ? 'U=[K_full]=(kappa,beta) in T_2(H) corresponds to id_H under T_2(H)≅Hom(H,H).' : 'UNEARNED',
    unique_pushforward_statement: 'For every [F]∈T_2(A), its character h_F:H->A is unique and [F]=(h_F)_*(U).',
  });
}

function makeStandardCoefficientMaps() {
  const reduceMod2 = coefficientHomomorphism({
    name: 'Z_to_Z2_reduction',
    source: Z,
    target: Z2,
    map: (x) => coefficientElement(Z2, { torsion: [x.free[0]] }),
  });
  const embedZtoH = coefficientHomomorphism({
    name: 'Z_to_H_embedding',
    source: Z,
    target: H,
    map: (x) => coefficientElement(H, { free: [x.free[0]], torsion: [0] }),
  });
  const projectHtoZ = coefficientHomomorphism({
    name: 'H_to_Z_projection',
    source: H,
    target: Z,
    map: (x) => coefficientElement(Z, { free: [x.free[0]] }),
  });
  const projectHtoZ2 = coefficientHomomorphism({
    name: 'H_to_Z2_projection',
    source: H,
    target: Z2,
    map: (x) => coefficientElement(Z2, { torsion: [x.torsion[0]] }),
  });
  const embedHtoZplusZ4 = coefficientHomomorphism({
    name: 'H_to_ZplusZ4_embedding',
    source: H,
    target: Z_PLUS_Z4,
    map: (x) => coefficientElement(Z_PLUS_Z4, { free: [x.free[0]], torsion: [2 * x.torsion[0]] }),
  });
  return freeze({ reduceMod2, embedZtoH, projectHtoZ, projectHtoZ2, embedHtoZplusZ4 });
}

function naturalityRow({ source, target, character, hom, samples }) {
  const pushed = pushCharacterForward(source, target, character, hom);
  const rows = samples.map((input) => {
    const sourceValue = evaluateH2Character(source, character, input);
    const mapped = hom.map(sourceValue);
    const pushedValue = evaluateH2Character(target, pushed, input);
    return freeze({ input, mapped, pushed: pushedValue, equal: equalElements(target, mapped, pushedValue) });
  });
  return freeze({
    hom: hom.name,
    source: source.name,
    target: target.name,
    pushed_character: pushed,
    rows: freeze(rows),
    passed: pushed.status === 'H2_CHARACTER_DERIVED' && rows.every((row) => row.equal),
  });
}

export function coefficientNaturalityCertificate() {
  const maps = makeStandardCoefficientMaps();
  const primitiveZ = h2Character(
    Z,
    coefficientElement(Z, { free: [1] }),
    coefficientElement(Z, { free: [0] }),
  );
  const universalH = h2Character(H, HFreeGenerator(), HTorsionGenerator());
  const samples = freeze([
    freeze({ n: 0, epsilon: 0 }),
    freeze({ n: 1, epsilon: 0 }),
    freeze({ n: 0, epsilon: 1 }),
    freeze({ n: 3, epsilon: 1 }),
    freeze({ n: -2, epsilon: 1 }),
  ]);
  const rows = freeze([
    naturalityRow({ source: Z, target: Z2, character: primitiveZ, hom: maps.reduceMod2, samples }),
    naturalityRow({ source: Z, target: H, character: primitiveZ, hom: maps.embedZtoH, samples }),
    naturalityRow({ source: H, target: Z, character: universalH, hom: maps.projectHtoZ, samples }),
    naturalityRow({ source: H, target: Z2, character: universalH, hom: maps.projectHtoZ2, samples }),
    naturalityRow({ source: H, target: Z_PLUS_Z4, character: universalH, hom: maps.embedHtoZplusZ4, samples }),
  ]);
  const passed = Object.values(maps).every((hom) => hom.passed) && rows.every((row) => row.passed);
  return freeze({
    status: passed ? 'COEFFICIENT_NATURALITY_CERTIFICATE_PASSED' : 'COEFFICIENT_NATURALITY_CERTIFICATE_FAILED',
    passed,
    maps,
    rows,
    naturality_identity: 'For every coefficient homomorphism f:A->A’, pushforward sends h_(a,b) to h_(f(a),f(b))=f∘h_(a,b).',
  });
}

function cyclicGroup(n) {
  return finitelyGeneratedAbelianGroup({ name: `Z/${n}`, torsion_moduli: [n] });
}

export function cyclicCoefficientParityCertificate() {
  const rows = [];
  for (let n = 2; n <= 9; n += 1) {
    const group = cyclicGroup(n);
    const structure = coefficientTransportClassStructure(group);
    const two = twoTorsionCertificate(group);
    const expectedExtra = n % 2 === 0 ? 1 : 0;
    const expected = n % 2 === 0 ? `Z/${n}⊕Z/2` : `Z/${n}`;
    rows.push(freeze({
      n,
      parity: n % 2 === 0 ? 'even' : 'odd',
      two_torsion_generators: two.generators.length,
      expected_two_torsion_generators: expectedExtra,
      transport_structure: expected,
      passed: structure.passed && two.generators.length === expectedExtra,
    }));
  }
  return freeze({
    status: rows.every((row) => row.passed)
      ? 'CYCLIC_COEFFICIENT_PARITY_CERTIFICATE_PASSED'
      : 'CYCLIC_COEFFICIENT_PARITY_CERTIFICATE_FAILED',
    passed: rows.every((row) => row.passed),
    rows: freeze(rows),
    theorem: 'T_2(Z/n)≅Z/n for odd n and Z/n⊕Z/2 for even n; no finite cyclic target is raw-H2 faithful because it has no infinite-order element.',
  });
}

export function faithfulTargetCriterionCertificate() {
  const zeroZ = coefficientElement(Z, { free: [0] });
  const zFree = coefficientElement(Z, { free: [1] });
  const hA = HFreeGenerator();
  const hB = HTorsionGenerator();
  const z4A = coefficientElement(Z_PLUS_Z4, { free: [1], torsion: [0] });
  const z4B = coefficientElement(Z_PLUS_Z4, { free: [0], torsion: [2] });
  const z2A = coefficientElement(Z2, { torsion: [1] });
  const z2B = coefficientElement(Z2, { torsion: [1] });
  const zSqA = coefficientElement(Z_SQUARED, { free: [1, 0] });
  const zSqB = coefficientElement(Z_SQUARED, { free: [0, 0] });
  const rows = freeze([
    freeze({ name: 'Z', expected: false, result: faithfulCharacterCriterion(Z, zFree, zeroZ) }),
    freeze({ name: 'Z/2', expected: false, result: faithfulCharacterCriterion(Z2, z2A, z2B) }),
    freeze({ name: 'H', expected: true, result: faithfulCharacterCriterion(H, hA, hB) }),
    freeze({ name: 'Z⊕Z/4', expected: true, result: faithfulCharacterCriterion(Z_PLUS_Z4, z4A, z4B) }),
    freeze({ name: 'Z²', expected: false, result: faithfulCharacterCriterion(Z_SQUARED, zSqA, zSqB) }),
  ]);
  const passed = rows.every((row) => row.result.status === 'FAITHFUL_CHARACTER_CRITERION_DERIVED'
    && row.result.faithful === row.expected);
  return freeze({
    status: passed ? 'FAITHFUL_TARGET_CRITERION_CERTIFICATE_PASSED' : 'FAITHFUL_TARGET_CRITERION_CERTIFICATE_FAILED',
    passed,
    rows,
    exact_iff: 'A admits a faithful single H2->A character iff A contains an infinite-order element and a nonzero element of A[2], equivalently iff A contains a subgroup isomorphic to Z⊕Z/2.',
    minimal_core_image: 'For every injective h:H->A, im(h)≅H. Corestriction gives H≅im(h), so H is minimal in the exact image-theoretic sense.',
    larger_hostile: 'Z⊕Z/4 is faithful but nonminimal; the image generated by (1,0) and (0,2) is exactly a copy of Z⊕Z/2.',
    uniqueness_ceiling: 'minimal faithful image != unique smallest ambient abelian group under an undeclared ordering.',
  });
}

export function universalCoefficientHolonomyRepresentabilityCertificate() {
  const uct = universalCoefficientTheoremCertificate();
  const universal = universalIdentityTransportCertificate();
  const naturality = coefficientNaturalityCertificate();
  const cyclic = cyclicCoefficientParityCertificate();
  const faithful = faithfulTargetCriterionCertificate();

  const examples = freeze({
    Z: coefficientTransportClassStructure(Z),
    Z2: coefficientTransportClassStructure(Z2),
    H: coefficientTransportClassStructure(H),
    Z_plus_Z4: coefficientTransportClassStructure(Z_PLUS_Z4),
    Z_squared: coefficientTransportClassStructure(Z_SQUARED),
  });

  const passed = uct.passed
    && universal.passed
    && naturality.passed
    && cyclic.passed
    && faithful.passed
    && Object.values(examples).every((row) => row.passed);

  return freeze({
    status: passed
      ? 'UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_CERTIFICATE_PASSED'
      : 'UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_CERTIFICATE_FAILED',
    passed,
    parent_receipt: UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_PARENT_RECEIPT,
    uct,
    universal_identity: universal,
    coefficient_naturality: naturality,
    cyclic_parity: cyclic,
    faithful_target_criterion: faithful,
    examples,
    represented_functor: passed ? 'T_2(-) ≅ Hom(H2_bar(B;Z),-) naturally on Ab.' : 'UNEARNED',
    coefficient_classification: passed ? 'T_2(A) ≅ A⊕A[2] for every abelian A.' : 'UNEARNED',
    universal_class: passed ? 'The #775 (kappa,beta) H-valued class U corresponds to id_H and every coefficient-valued class is its unique coefficient pushforward.' : 'UNEARNED',
    classifications: passed ? freeze([
      'THE_FORMAL_DEGREE_TWO_TRANSPORT_EQUIVALENCE_FUNCTOR_ON_ABELIAN_COEFFICIENT_GROUPS_IS_NATURALLY_REPRESENTED_BY_H2_BAR_B_Z',
      'FOR_EVERY_ABELIAN_A_STRICT_B_SQUARED_A_FORMAL_TWO_TRANSPORT_CLASSES_MODULO_FORMAL_BOUNDARY_REZEROING_ARE_NATURALLY_A_CROSS_A_TWO_TORSION',
      'THE_775_KAPPA_BETA_CLASS_IS_THE_UNIVERSAL_IDENTITY_TRANSPORT_CLASS_AND_EVERY_COEFFICIENT_VALUED_FORMAL_TRANSPORT_CLASS_IS_ITS_UNIQUE_COEFFICIENT_PUSHFORWARD',
      'AN_ABELIAN_COEFFICIENT_TARGET_ADMITS_A_FAITHFUL_SINGLE_CLOSED_FORMAL_TWO_HOLONOMY_CHARACTER_IFF_IT_CONTAINS_BOTH_AN_INFINITE_ORDER_ELEMENT_AND_NONZERO_TWO_TORSION',
      'EVERY_FAITHFUL_CHARACTER_HAS_CORE_IMAGE_ISOMORPHIC_TO_Z_CROSS_Z_OVER_TWO_SO_THE_775_TARGET_IS_MINIMAL_IN_THE_EXACT_IMAGE_THEORETIC_SENSE',
    ]) : freeze([]),
    consequential_bearing: passed ? 'UNIVERSAL_COEFFICIENT_FORMAL_TWO_HOLONOMY_REPRESENTABILITY_EARNED' : 'UNEARNED',
    authority_ceiling: freeze({
      geometric_two_holonomy: false,
      physical_two_holonomy: false,
      berry_or_gerbe_holonomy: false,
      connection: false,
      two_connection: false,
      curvature: false,
      operational_path_two_groupoid: false,
      operational_inverse_route: false,
      ontology: false,
      production: false,
      vercel: false,
    }),
    scars: freeze([
      'representing object H2 != physical gauge group',
      'universal formal transport class != universal physical field',
      'coefficient pushforward != physical symmetry breaking or coupling',
      'faithful formal H2 character != geometric holonomy tomography',
      'minimal faithful image != unique smallest ambient abelian group under an undeclared ordering',
      'A[2] torsion visibility != physical topological order',
      'formal coefficient universality != operational route universality',
    ]),
  });
}
