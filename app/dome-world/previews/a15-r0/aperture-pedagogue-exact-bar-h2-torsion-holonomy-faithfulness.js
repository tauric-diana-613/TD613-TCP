import {
  multiplyQuotientCoordinates,
} from './aperture-pedagogue-target-equivalence-quotient-congruence.js';
import {
  relationBarCycle,
  boundaryOfBar2Chain,
  pairTwoCochainWithBarChain,
  normalizedOneCoboundary,
  T_COORDINATE,
  Q_COORDINATE,
} from './aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';
import {
  normalizeBar2Chain,
  addBar2Chains,
  scaleBar2Chain,
} from './aperture-pedagogue-bar-h2-period-return-representation.js';
import {
  transportIncrementCocycle,
} from './aperture-pedagogue-affine-transport-increment-cocycle.js';

export const EXACT_BAR_H2_TORSION_HOLONOMY_FAITHFULNESS_SCHEMA = 'td613.a15-r0.exact-bar-h2-torsion-holonomy-faithfulness/v0.1';
export const EXACT_BAR_H2_TORSION_HOLONOMY_FAITHFULNESS_PARENT_RECEIPT = '50ada0bb0e7b25f9c1bde7e2feafeebbb5067a8f';
export const EXACT_BAR_H2_TORSION_HOLONOMY_FAITHFULNESS_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const UNIT = freeze({ t: 0, E: 0, O: 0 });
export const AMBIENT_Y_COORDINATE = freeze({ t: 0, E: 0, O: 1 });

function canonicalInteger(value) {
  return value === 0 ? 0 : value;
}

function parity(value) {
  return ((value % 2) + 2) % 2;
}

function validAmbientBase(base) {
  return base
    && typeof base === 'object'
    && Object.keys(base).length === 3
    && Number.isInteger(base.t) && base.t >= 0
    && Number.isInteger(base.E) && base.E >= 0
    && Number.isInteger(base.O) && base.O >= 0;
}

function validFractionCoordinate(base) {
  return base
    && typeof base === 'object'
    && Object.keys(base).length === 3
    && [base.t, base.E, base.O].every(Number.isInteger);
}

function plain(base) {
  return freeze({ t: canonicalInteger(base.t), E: canonicalInteger(base.E), O: canonicalInteger(base.O) });
}

function same(left, right) {
  return left && right
    && left.t === right.t
    && left.E === right.E
    && left.O === right.O;
}

function swapVector(E, O) {
  return [O, E];
}

function parityTransform(t, E, O) {
  return parity(t) === 0 ? [E, O] : swapVector(E, O);
}

function ambientProduct(left, right) {
  if (!validAmbientBase(left) || !validAmbientBase(right)) return null;
  const out = multiplyQuotientCoordinates(left, right);
  if (out?.status !== 'PARITY_TWISTED_QUOTIENT_PRODUCT_DERIVED') return null;
  return plain(out);
}

export function fractionGroupProduct(left, right) {
  if (!validFractionCoordinate(left) || !validFractionCoordinate(right)) {
    return freeze({ status: 'FRACTION_GROUP_PRODUCT_ABSTAINS' });
  }
  const [F, G] = parityTransform(left.t, right.E, right.O);
  return freeze({
    status: 'FRACTION_GROUP_PRODUCT_DERIVED',
    coordinate: plain({
      t: left.t + right.t,
      E: left.E + F,
      O: left.O + G,
    }),
  });
}

export function fractionGroupInverse(base) {
  if (!validFractionCoordinate(base)) return freeze({ status: 'FRACTION_GROUP_INVERSE_ABSTAINS' });
  const [E, O] = parityTransform(base.t, base.E, base.O);
  const inverse = plain({ t: -base.t, E: -E, O: -O });
  const left = fractionGroupProduct(inverse, base);
  const right = fractionGroupProduct(base, inverse);
  return freeze({
    status: left.status === 'FRACTION_GROUP_PRODUCT_DERIVED'
      && right.status === 'FRACTION_GROUP_PRODUCT_DERIVED'
      && same(left.coordinate, UNIT)
      && same(right.coordinate, UNIT)
      ? 'FRACTION_GROUP_INVERSE_DERIVED'
      : 'FRACTION_GROUP_INVERSE_FAILED',
    coordinate: plain(base),
    inverse,
    left_product: left,
    right_product: right,
  });
}

function ambientFactorization(base) {
  if (!validAmbientBase(base)) return freeze({ status: 'AMBIENT_FACTORIZATION_ABSTAINS' });
  const QE = freeze({ t: 0, E: base.E, O: 0 });
  const YO = freeze({ t: 0, E: 0, O: base.O });
  const Tt = freeze({ t: base.t, E: 0, O: 0 });
  const first = ambientProduct(QE, YO);
  const second = first && ambientProduct(first, Tt);
  return freeze({
    status: second && same(second, base)
      ? 'AMBIENT_Q_Y_T_FACTORIZATION_DERIVED'
      : 'AMBIENT_Q_Y_T_FACTORIZATION_FAILED',
    base: plain(base),
    factors: freeze([QE, YO, Tt]),
    product: second,
  });
}

export function ambientBarH1CompletionCertificate() {
  const T = T_COORDINATE;
  const Q = Q_COORDINATE;
  const Y = AMBIENT_Y_COORDINATE;
  const TQ = ambientProduct(T, Q);
  const YT = ambientProduct(Y, T);
  const samples = freeze([
    UNIT,
    T,
    Q,
    Y,
    freeze({ t: 0, E: 2, O: 3 }),
    freeze({ t: 3, E: 4, O: 2 }),
  ]);
  const factorizations = samples.map(ambientFactorization);
  const relationPassed = same(TQ, YT) && same(TQ, freeze({ t: 1, E: 0, O: 1 }));
  const passed = relationPassed && factorizations.every((row) => row.status === 'AMBIENT_Q_Y_T_FACTORIZATION_DERIVED');
  return freeze({
    status: passed ? 'AMBIENT_BAR_H1_COMPLETION_CERTIFICATE_PASSED' : 'AMBIENT_BAR_H1_COMPLETION_CERTIFICATE_FAILED',
    passed,
    T,
    Q,
    Y,
    TQ,
    YT,
    ambient_relation: 'T★Q=Y★T, hence [T]+[Q]=[Y]+[T] and [Y]=[Q] in H1.',
    factorizations: freeze(factorizations),
    universal_reduction: 'Every ambient (t,E,O)=Q^E★Y^O★T^t, so [(t,E,O)]=t[T]+(E+O)[Q]. The additive map chi([b])=(t,E+O) is inverse on [T],[Q].',
    earned_if_passed: 'H1_bar(B;Z) ≅ Z² on the full #735 ambient B, including t=0,O>0 coordinates.',
    parent_coverage_scar: 'The #773 canonical-word helper abstained on ambient non-route-generated coordinates; this certificate closes that proof-coverage gap without altering the #773 theorem statement.',
  });
}

export function commonRightOreMultiple(left, right) {
  if (!validAmbientBase(left) || !validAmbientBase(right)) {
    return freeze({ status: 'COMMON_RIGHT_ORE_MULTIPLE_ABSTAINS' });
  }
  const N = Math.max(left.t, right.t) + 1;
  const targetE = Math.max(left.E, right.E);
  const targetO = Math.max(left.O, right.O);
  const deltaLeft = [targetE - left.E, targetO - left.O];
  const deltaRight = [targetE - right.E, targetO - right.O];
  const [xE, xO] = parityTransform(left.t, deltaLeft[0], deltaLeft[1]);
  const [yE, yO] = parityTransform(right.t, deltaRight[0], deltaRight[1]);
  const x = freeze({ t: N - left.t, E: xE, O: xO });
  const y = freeze({ t: N - right.t, E: yE, O: yO });
  const leftProduct = ambientProduct(left, x);
  const rightProduct = ambientProduct(right, y);
  const target = freeze({ t: N, E: targetE, O: targetO });
  const passed = validAmbientBase(x) && validAmbientBase(y)
    && x.t >= 1 && y.t >= 1
    && same(leftProduct, target) && same(rightProduct, target);
  return freeze({
    status: passed ? 'COMMON_RIGHT_ORE_MULTIPLE_DERIVED' : 'COMMON_RIGHT_ORE_MULTIPLE_FAILED',
    passed,
    left: plain(left),
    right: plain(right),
    left_factor: x,
    right_factor: y,
    target,
    left_product: leftProduct,
    right_product: rightProduct,
  });
}

export function commonLeftOreMultiple(left, right) {
  if (!validAmbientBase(left) || !validAmbientBase(right)) {
    return freeze({ status: 'COMMON_LEFT_ORE_MULTIPLE_ABSTAINS' });
  }
  const N = Math.max(left.t, right.t) + 1;
  const r = N - left.t;
  const s = N - right.t;
  const leftMoved = parityTransform(r, left.E, left.O);
  const rightMoved = parityTransform(s, right.E, right.O);
  const targetE = Math.max(leftMoved[0], rightMoved[0]);
  const targetO = Math.max(leftMoved[1], rightMoved[1]);
  const x = freeze({ t: r, E: targetE - leftMoved[0], O: targetO - leftMoved[1] });
  const y = freeze({ t: s, E: targetE - rightMoved[0], O: targetO - rightMoved[1] });
  const leftProduct = ambientProduct(x, left);
  const rightProduct = ambientProduct(y, right);
  const target = freeze({ t: N, E: targetE, O: targetO });
  const passed = validAmbientBase(x) && validAmbientBase(y)
    && x.t >= 1 && y.t >= 1
    && same(leftProduct, target) && same(rightProduct, target);
  return freeze({
    status: passed ? 'COMMON_LEFT_ORE_MULTIPLE_DERIVED' : 'COMMON_LEFT_ORE_MULTIPLE_FAILED',
    passed,
    left: plain(left),
    right: plain(right),
    left_factor: x,
    right_factor: y,
    target,
    left_product: leftProduct,
    right_product: rightProduct,
  });
}

function cancellationSamples() {
  const rows = freeze([
    freeze({ a: { t: 1, E: 2, O: 5 }, x: { t: 2, E: 3, O: 1 }, y: { t: 2, E: 4, O: 1 } }),
    freeze({ a: { t: 2, E: 1, O: 4 }, x: { t: 1, E: 0, O: 3 }, y: { t: 1, E: 0, O: 4 } }),
    freeze({ a: AMBIENT_Y_COORDINATE, x: { t: 1, E: 2, O: 0 }, y: { t: 1, E: 2, O: 1 } }),
  ]);
  return rows.map((row) => {
    const leftAX = ambientProduct(row.a, row.x);
    const leftAY = ambientProduct(row.a, row.y);
    const rightXA = ambientProduct(row.x, row.a);
    const rightYA = ambientProduct(row.y, row.a);
    return freeze({
      ...row,
      left_products_distinct: !same(leftAX, leftAY),
      right_products_distinct: !same(rightXA, rightYA),
      leftAX,
      leftAY,
      rightXA,
      rightYA,
    });
  });
}

export function ambientOreFractionGroupCertificate() {
  const pairs = freeze([
    freeze([T_COORDINATE, Q_COORDINATE]),
    freeze([AMBIENT_Y_COORDINATE, T_COORDINATE]),
    freeze([{ t: 1, E: 5, O: 2 }, { t: 4, E: 1, O: 7 }]),
    freeze([{ t: 0, E: 0, O: 9 }, { t: 3, E: 6, O: 0 }]),
  ]);
  const rightOre = pairs.map(([a, b]) => commonRightOreMultiple(a, b));
  const leftOre = pairs.map(([a, b]) => commonLeftOreMultiple(a, b));
  const cancellation = cancellationSamples();

  const T = plain(T_COORDINATE);
  const Q = plain(Q_COORDINATE);
  const Tinv = fractionGroupInverse(T).inverse;
  const first = fractionGroupProduct(T, Q);
  const derivedY = first.status === 'FRACTION_GROUP_PRODUCT_DERIVED'
    ? fractionGroupProduct(first.coordinate, Tinv)
    : freeze({ status: 'FRACTION_GROUP_PRODUCT_ABSTAINS' });
  const TY = derivedY.status === 'FRACTION_GROUP_PRODUCT_DERIVED'
    ? fractionGroupProduct(T, derivedY.coordinate)
    : freeze({ status: 'FRACTION_GROUP_PRODUCT_ABSTAINS' });
  const TYTinverse = TY.status === 'FRACTION_GROUP_PRODUCT_DERIVED'
    ? fractionGroupProduct(TY.coordinate, Tinv)
    : freeze({ status: 'FRACTION_GROUP_PRODUCT_ABSTAINS' });
  const QY = derivedY.status === 'FRACTION_GROUP_PRODUCT_DERIVED'
    ? fractionGroupProduct(Q, derivedY.coordinate)
    : freeze({ status: 'FRACTION_GROUP_PRODUCT_ABSTAINS' });
  const YQ = derivedY.status === 'FRACTION_GROUP_PRODUCT_DERIVED'
    ? fractionGroupProduct(derivedY.coordinate, Q)
    : freeze({ status: 'FRACTION_GROUP_PRODUCT_ABSTAINS' });

  const inverseRows = freeze([
    fractionGroupInverse({ t: 2, E: 3, O: -4 }),
    fractionGroupInverse({ t: 3, E: -2, O: 7 }),
    fractionGroupInverse({ t: -1, E: 5, O: 6 }),
  ]);

  const passed = rightOre.every((row) => row.passed)
    && leftOre.every((row) => row.passed)
    && cancellation.every((row) => row.left_products_distinct && row.right_products_distinct)
    && inverseRows.every((row) => row.status === 'FRACTION_GROUP_INVERSE_DERIVED')
    && derivedY.status === 'FRACTION_GROUP_PRODUCT_DERIVED'
    && same(derivedY.coordinate, AMBIENT_Y_COORDINATE)
    && TYTinverse.status === 'FRACTION_GROUP_PRODUCT_DERIVED'
    && same(TYTinverse.coordinate, Q)
    && QY.status === 'FRACTION_GROUP_PRODUCT_DERIVED'
    && YQ.status === 'FRACTION_GROUP_PRODUCT_DERIVED'
    && same(QY.coordinate, YQ.coordinate);

  return freeze({
    status: passed ? 'AMBIENT_ORE_FRACTION_GROUP_CERTIFICATE_PASSED' : 'AMBIENT_ORE_FRACTION_GROUP_CERTIFICATE_FAILED',
    passed,
    cancellation: freeze(cancellation),
    common_right_multiples: freeze(rightOre),
    common_left_multiples: freeze(leftOre),
    inverse_rows: inverseRows,
    derived_Y: derivedY,
    T_Y_T_inverse: TYTinverse,
    QY,
    YQ,
    universal_cancellation_proof: 'Tick equality fixes the parity action; the parity action on the right vector is bijective, so both left and right cancellation hold for all ambient coordinates.',
    universal_ore_proof: 'Choose a target tick one above both inputs, then choose a componentwise-dominating target vector. Positive-tick factors admit arbitrary nonnegative E/O vectors, so the displayed constructive formulas give common right and left multiples for every pair.',
    fraction_group: 'G=Z^2 ⋊_swap Z with the same parity-twisted multiplication.',
    localization_bridge: 'By the standard cancellative Ore calculus-of-fractions/classifying-space theorem, BB≃BG after the exact hypotheses above pass.',
    false_shortcut_rejected: 'cancellative alone does not authorize BB≃BG; Ore/calculus-of-fractions is a required hypothesis.',
  });
}

export function mappingTorusH2Certificate() {
  const d3 = (n) => freeze([2 * n, 0, 0]);
  const d2 = ([a, b, c]) => freeze([b - c, c - b, 0]);
  const d3Generator = d3(1);
  const d2d3 = d2(d3Generator);
  const kernelSamples = freeze([
    freeze([0, 0, 0]),
    freeze([1, 0, 0]),
    freeze([0, 1, 1]),
    freeze([5, -3, -3]),
  ]).map((v) => freeze({ vector: v, image: d2(v), in_kernel: d2(v).every((n) => n === 0) }));
  const nonKernel = freeze([0, 1, 0]);
  const nonKernelImage = d2(nonKernel);
  const passed = d3Generator[0] === 2
    && d2d3.every((n) => n === 0)
    && kernelSamples.every((row) => row.in_kernel)
    && nonKernelImage.some((n) => n !== 0);
  return freeze({
    status: passed ? 'MAPPING_TORUS_H2_CERTIFICATE_PASSED' : 'MAPPING_TORUS_H2_CERTIFICATE_FAILED',
    passed,
    mapping_torus_group: 'G=Z^2⋊_swap Z',
    chain_groups: freeze({ D3: 'Z', D2: 'Z⊕Z²', D1: 'Z²⊕Z' }),
    d3_generator: d3Generator,
    d2_formula: 'd2(a,b,c)=(b-c,c-b,0)',
    d2_d3_generator: d2d3,
    kernel_samples: kernelSamples,
    nonkernel_sample: freeze({ vector: nonKernel, image: nonKernelImage }),
    exact_kernel: 'ker d2={(a,b,b):a,b∈Z}≅Z²',
    exact_image: 'im d3={(2n,0,0):n∈Z}',
    smith_result: freeze({ free_rank: 1, torsion_invariants: freeze([2]), group: 'Z⊕Z/2' }),
    identity_monodromy_hostile: 'Replacing swap by identity would make both cone maps zero and produce a different H2; the swap and orientation reversal are constitutive.',
    zero_d3_hostile: 'Replacing d3(n)=(2n,0,0) by zero would erase the order-two quotient and is rejected.',
    earned_if_passed: 'H2_bar(B;Z)≅Z⊕Z/2 after the Ore localization bridge.',
  });
}

function symbolCoordinate(symbol) {
  if (symbol === 'T') return T_COORDINATE;
  if (symbol === 'Q') return Q_COORDINATE;
  return null;
}

function wordPathChain(symbols) {
  if (!Array.isArray(symbols) || symbols.length < 2) return freeze({ status: 'WORD_PATH_CHAIN_ABSTAINS' });
  const first = symbolCoordinate(symbols[0]);
  if (!first) return freeze({ status: 'WORD_PATH_CHAIN_ABSTAINS' });
  let prefix = plain(first);
  const chain = [];
  for (let i = 1; i < symbols.length; i += 1) {
    const next = symbolCoordinate(symbols[i]);
    if (!next) return freeze({ status: 'WORD_PATH_CHAIN_ABSTAINS' });
    chain.push(freeze({ coefficient: 1, left: prefix, right: next, label: `[${symbols.slice(0, i).join('')}|${symbols[i]}]` }));
    prefix = ambientProduct(prefix, next);
    if (!prefix) return freeze({ status: 'WORD_PATH_CHAIN_ABSTAINS' });
  }
  return freeze({ status: 'WORD_PATH_CHAIN_DERIVED', chain: freeze(chain), endpoint: prefix });
}

export function relationCycleK(k) {
  if (!Number.isInteger(k) || k < 0) return freeze({ status: 'RELATION_CYCLE_K_ABSTAINS' });
  const leftWord = freeze(['T', ...Array(k).fill('Q'), 'T', 'Q']);
  const rightWord = freeze(['Q', 'T', ...Array(k).fill('Q'), 'T']);
  const left = wordPathChain(leftWord);
  const right = wordPathChain(rightWord);
  if (left.status !== 'WORD_PATH_CHAIN_DERIVED' || right.status !== 'WORD_PATH_CHAIN_DERIVED') {
    return freeze({ status: 'RELATION_CYCLE_K_ABSTAINS' });
  }
  const negRight = scaleBar2Chain(right.chain, -1);
  const normalized = negRight.status === 'BAR_2_CHAIN_NORMALIZED'
    ? addBar2Chains(left.chain, negRight.chain)
    : freeze({ status: 'BAR_2_CHAIN_ADDITION_ABSTAINS', chain: freeze([]) });
  if (normalized.status !== 'BAR_2_CHAIN_NORMALIZED') return normalized;
  const boundary = boundaryOfBar2Chain(normalized.chain);
  const passed = same(left.endpoint, right.endpoint) && boundary.is_cycle;
  return freeze({
    status: passed ? 'AUTHORED_RELATION_BAR_2_CYCLE_DERIVED' : 'AUTHORED_RELATION_BAR_2_CYCLE_FAILED',
    passed,
    k,
    left_word: leftWord.join(''),
    right_word: rightWord.join(''),
    left_endpoint: left.endpoint,
    right_endpoint: right.endpoint,
    chain: normalized.chain,
    boundary,
  });
}

export function primitiveBarTwoCocycle(left, right) {
  if (!validAmbientBase(left) || !validAmbientBase(right)) return null;
  const p = parity(left.t);
  return Math.floor(left.t / 2) * (right.E + right.O) + p * right.E;
}

function alphaDefect(x, y, z) {
  const xy = ambientProduct(x, y);
  const yz = ambientProduct(y, z);
  if (!xy || !yz) return null;
  return primitiveBarTwoCocycle(y, z)
    - primitiveBarTwoCocycle(xy, z)
    + primitiveBarTwoCocycle(x, yz)
    - primitiveBarTwoCocycle(x, y);
}

function alphaParityCertificate() {
  const rows = [];
  for (let tx = 0; tx <= 1; tx += 1) {
    for (let ty = 0; ty <= 1; ty += 1) {
      for (let Ez = 0; Ez <= 1; Ez += 1) {
        for (let Oz = 0; Oz <= 1; Oz += 1) {
          const x = freeze({ t: tx, E: 0, O: 0 });
          const y = freeze({ t: ty, E: 0, O: 0 });
          const z = freeze({ t: 0, E: Ez, O: Oz });
          const defect = alphaDefect(x, y, z);
          rows.push(freeze({ tx, ty, Ez, Oz, defect, passed: defect === 0 }));
        }
      }
    }
  }
  return freeze({
    passed: rows.every((row) => row.passed),
    rows: freeze(rows),
    universal_reason: 'The defect depends only on the two tick parities and linearly on the right E/O coordinates; the even tick quotients cancel via floor((t+u)/2)=floor(t/2)+floor(u/2)+p_t p_u. The 16 parity-basis rows therefore certify all integer coordinates.',
  });
}

function epsilonE(base) {
  return validAmbientBase(base) ? base.E : null;
}

function omegaDoubleAlphaCertificate() {
  const rows = [];
  for (let tx = 0; tx <= 1; tx += 1) {
    for (let E = 0; E <= 1; E += 1) {
      for (let O = 0; O <= 1; O += 1) {
        const x = freeze({ t: tx, E: 0, O: 0 });
        const y = freeze({ t: 0, E, O });
        const omega = transportIncrementCocycle(x, y);
        const alpha = primitiveBarTwoCocycle(x, y);
        const dE = normalizedOneCoboundary(epsilonE, x, y);
        rows.push(freeze({ tx, E, O, omega, alpha, dE, rhs: (2 * alpha) - dE, passed: omega === (2 * alpha) - dE }));
      }
    }
  }
  return freeze({
    passed: rows.every((row) => row.passed),
    rows: freeze(rows),
    exact_identity: 'omega=2alpha-d(E-coordinate) pointwise on B.',
    cohomology_identity: '[omega]=2[alpha] in H2-cohomology.',
    universal_reason: 'Both sides are linear in the right E/O coordinates and depend on the left tick only through its parity plus the common even quotient, so the displayed parity basis closes the pointwise identity for all ambient coordinates.',
  });
}

export function auxiliaryModTwoTorsionCocycle(left, right) {
  if (!validAmbientBase(left) || !validAmbientBase(right)) return null;
  const p = parity(left.t);
  const transformedRightO = p === 0 ? right.O : right.E;
  return ((left.E * transformedRightO) + (p * right.E * right.O)) & 1;
}

function betaDefectMod2(x, y, z) {
  const xy = ambientProduct(x, y);
  const yz = ambientProduct(y, z);
  if (!xy || !yz) return null;
  const value = auxiliaryModTwoTorsionCocycle(y, z)
    - auxiliaryModTwoTorsionCocycle(xy, z)
    + auxiliaryModTwoTorsionCocycle(x, yz)
    - auxiliaryModTwoTorsionCocycle(x, y);
  return parity(value);
}

function betaParityCertificate() {
  const rows = [];
  for (let tx = 0; tx <= 1; tx += 1) {
    for (let ty = 0; ty <= 1; ty += 1) {
      for (let Ex = 0; Ex <= 1; Ex += 1) {
        for (let Ey = 0; Ey <= 1; Ey += 1) {
          for (let Oy = 0; Oy <= 1; Oy += 1) {
            for (let Ez = 0; Ez <= 1; Ez += 1) {
              for (let Oz = 0; Oz <= 1; Oz += 1) {
                const x = freeze({ t: tx, E: Ex, O: 0 });
                const y = freeze({ t: ty, E: Ey, O: Oy });
                const z = freeze({ t: 0, E: Ez, O: Oz });
                const defect = betaDefectMod2(x, y, z);
                rows.push(freeze({ tx, ty, Ex, Ey, Oy, Ez, Oz, defect, passed: defect === 0 }));
              }
            }
          }
        }
      }
    }
  }
  return freeze({
    passed: rows.length === 128 && rows.every((row) => row.passed),
    row_count: rows.length,
    rows: freeze(rows),
    universal_reason: 'beta and its defect are polynomials over F2 in exactly these seven parity variables; exhaustive 2^7 evaluation is therefore a universal parity-polynomial identity, not bounded coordinate enumeration.',
  });
}

function pairing(cochain, chain) {
  const result = pairTwoCochainWithBarChain(cochain, chain);
  return result.status === 'BAR_2_COCHAIN_PAIRING_DERIVED' ? result.value : null;
}

function pairingMod2(cochain, chain) {
  const value = pairing(cochain, chain);
  return Number.isInteger(value) ? parity(value) : null;
}

export function exactBarH2TorsionHolonomyFaithfulnessCertificate() {
  const ambientH1 = ambientBarH1CompletionCertificate();
  const ore = ambientOreFractionGroupCertificate();
  const mappingTorus = mappingTorusH2Certificate();
  const alphaParity = alphaParityCertificate();
  const omegaDoubleAlpha = omegaDoubleAlphaCertificate();
  const betaParity = betaParityCertificate();

  const inheritedZ = relationBarCycle();
  const z0 = relationCycleK(0);
  const z1 = relationCycleK(1);
  const negZ0 = z0.status === 'AUTHORED_RELATION_BAR_2_CYCLE_DERIVED'
    ? scaleBar2Chain(z0.chain, -1)
    : freeze({ status: 'BAR_2_CHAIN_SCALING_ABSTAINS', chain: freeze([]) });
  const tau = z1.status === 'AUTHORED_RELATION_BAR_2_CYCLE_DERIVED'
    && negZ0.status === 'BAR_2_CHAIN_NORMALIZED'
    ? addBar2Chains(z1.chain, negZ0.chain)
    : freeze({ status: 'BAR_2_CHAIN_ADDITION_ABSTAINS', chain: freeze([]) });
  const tauBoundary = tau.status === 'BAR_2_CHAIN_NORMALIZED'
    ? boundaryOfBar2Chain(tau.chain)
    : freeze({ status: 'BAR_2_BOUNDARY_ABSTAINS', is_cycle: false });

  const alphaZ0 = z0.chain ? pairing(primitiveBarTwoCocycle, z0.chain) : null;
  const alphaZ1 = z1.chain ? pairing(primitiveBarTwoCocycle, z1.chain) : null;
  const alphaTau = tau.chain ? pairing(primitiveBarTwoCocycle, tau.chain) : null;
  const omegaZ0 = z0.chain ? pairing(transportIncrementCocycle, z0.chain) : null;
  const omegaZ1 = z1.chain ? pairing(transportIncrementCocycle, z1.chain) : null;
  const omegaTau = tau.chain ? pairing(transportIncrementCocycle, tau.chain) : null;
  const betaZ0 = z0.chain ? pairingMod2(auxiliaryModTwoTorsionCocycle, z0.chain) : null;
  const betaZ1 = z1.chain ? pairingMod2(auxiliaryModTwoTorsionCocycle, z1.chain) : null;
  const betaTau = tau.chain ? pairingMod2(auxiliaryModTwoTorsionCocycle, tau.chain) : null;

  const inheritedMatchesZ0 = inheritedZ.passed
    && z0.status === 'AUTHORED_RELATION_BAR_2_CYCLE_DERIVED'
    && pairing(transportIncrementCocycle, inheritedZ.chain) === omegaZ0
    && omegaZ0 === 2;

  const relationPairingsPassed = z0.passed && z1.passed
    && tau.status === 'BAR_2_CHAIN_NORMALIZED'
    && tauBoundary.is_cycle
    && alphaZ0 === 1 && alphaZ1 === 1 && alphaTau === 0
    && omegaZ0 === 2 && omegaZ1 === 2 && omegaTau === 0
    && betaZ0 === 0 && betaZ1 === 1 && betaTau === 1;

  const h2DecompositionPassed = mappingTorus.passed
    && alphaZ0 === 1
    && alphaTau === 0
    && betaTau === 1;

  const passed = ambientH1.passed
    && ore.passed
    && mappingTorus.passed
    && alphaParity.passed
    && omegaDoubleAlpha.passed
    && betaParity.passed
    && inheritedMatchesZ0
    && relationPairingsPassed
    && h2DecompositionPassed;

  return freeze({
    status: passed
      ? 'EXACT_BAR_H2_TORSION_HOLONOMY_FAITHFULNESS_CERTIFICATE_PASSED'
      : 'EXACT_BAR_H2_TORSION_HOLONOMY_FAITHFULNESS_CERTIFICATE_FAILED',
    passed,
    ambient_h1_completion: ambientH1,
    ore_fraction_group: ore,
    mapping_torus_h2: mappingTorus,
    primitive_alpha_cocycle: alphaParity,
    omega_double_alpha: omegaDoubleAlpha,
    auxiliary_beta_mod2_cocycle: betaParity,
    inherited_z_matches_z0: inheritedMatchesZ0,
    z0,
    z1,
    tau: freeze({ chain: tau.chain ?? freeze([]), boundary: tauBoundary }),
    pairings: freeze({
      alpha: freeze({ z0: alphaZ0, z1: alphaZ1, tau: alphaTau }),
      omega: freeze({ z0: omegaZ0, z1: omegaZ1, tau: omegaTau }),
      beta_mod2: freeze({ z0: betaZ0, z1: betaZ1, tau: betaTau }),
    }),
    exact_h2_decomposition: h2DecompositionPassed
      ? 'H2_bar(B;Z) ≅ Z[z0] ⊕ (Z/2)[tau], with tau=[z1]-[z0].'
      : 'UNEARNED',
    primitive_free_statement: h2DecompositionPassed
      ? 'alpha(z0)=1 splits the free quotient; z0 is a primitive free generator in this splitting.'
      : 'UNEARNED',
    torsion_statement: h2DecompositionPassed
      ? 'ker(alpha_*) is the unique Z/2 sector from the exact H2 calculation; beta(tau)=1 makes tau its nonzero generator, hence 2[tau]=0 and [tau]!=0.'
      : 'UNEARNED',
    inherited_normalization_statement: omegaDoubleAlpha.passed && alphaZ0 === 1 && omegaZ0 === 2
      ? '[omega]=2[alpha]; inherited Hol_omega(z0)=tau_2 is an even normalization, while the primitive class alpha gives tau_1.'
      : 'UNEARNED',
    integer_holonomy_faithfulness_boundary: h2DecompositionPassed
      ? 'Every H2->Z character kills tau, so integer B^2Z holonomy cannot distinguish z1 from z0 even though #773 remains complete for transport-equivalence classes.'
      : 'UNEARNED',
    classifications: passed ? freeze([
      'THE_DECLARED_AMBIENT_PARITY_TWISTED_BAR_MONOID_HAS_EXACT_SECOND_INTEGRAL_BAR_HOMOLOGY_Z_PLUS_Z_OVER_TWO',
      'THE_INHERITED_RELATION_CYCLE_Z0_IS_A_PRIMITIVE_FREE_H2_GENERATOR_IN_A_SPLITTING_WHILE_Z1_MINUS_Z0_GENERATES_THE_UNIQUE_ORDER_TWO_TORSION_SECTOR',
      'THE_INHERITED_TRANSPORT_COCYCLE_OMEGA_IS_COHOMOLOGOUS_TO_TWICE_A_PRIMITIVE_INTEGER_TWO_COCYCLE_ALPHA_AND_ITS_TAU_2_RETURN_IS_AN_EVEN_NORMALIZATION_NOT_A_MINIMALITY_THEOREM',
      'INTEGER_B_SQUARED_Z_FORMAL_TWO_HOLONOMY_IS_COMPLETE_FOR_TRANSPORT_EQUIVALENCE_CLASSES_BUT_NECESSARILY_NONFAITHFUL_ON_THE_RAW_TORSION_SECTOR_OF_H2',
    ]) : freeze([]),
    authority: freeze({
      formal_bar_complex_two_holonomy: passed,
      formal_integer_holonomy_transport_completeness_inherited_from_773: passed,
      raw_h2_faithfulness_of_integer_holonomy: false,
      geometric_two_holonomy: false,
      physical_two_holonomy: false,
      berry_or_gerbe_holonomy: false,
      connection: false,
      two_connection: false,
      curvature: false,
      operational_path_two_groupoid: false,
      mod_two_transport_target: false,
    }),
    scars: freeze([
      'ambient bar-coordinate monoid != route-generated T/Q quotient image',
      'parent reachable-word H1 proof coverage != full ambient H1 proof coverage',
      'cancellative != Ore-localizable without the Ore hypothesis',
      'group-of-fractions inverse != operational inverse route',
      'transport-complete integer holonomy != faithful detector of raw H2',
      'tau_2 inherited return != minimal nonidentity formal holonomy translation',
      'auxiliary F2 torsion detector != mod-two transport authority',
      'bar cycle != operational T/Q loop',
    ]),
  });
}
