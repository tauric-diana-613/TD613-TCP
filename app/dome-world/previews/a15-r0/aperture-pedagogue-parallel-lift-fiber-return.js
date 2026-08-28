import {
  quotientCoordinate,
} from './aperture-pedagogue-target-equivalence-quotient-congruence.js';
import {
  firstMomentCoordinate,
} from './aperture-pedagogue-first-moment-weaker-transport-quotient.js';
import {
  firstMomentRouteSection,
} from './aperture-pedagogue-cocycle-extension-splitting-obstruction.js';

export const PARALLEL_LIFT_FIBER_RETURN_SCHEMA = 'td613.a15-r0.parallel-lift-fiber-return/v0.1';
export const PARALLEL_LIFT_FIBER_RETURN_PARENT_RECEIPT = 'a71c884b63e82ed81fe13d1c95ebc060e4f7d2bb';
export const PARALLEL_LIFT_FIBER_RETURN_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const canonicalInteger = (value) => (value === 0 ? 0 : value);

function validWord(word) {
  return Array.isArray(word) && word.every((token) => token === 'T' || token === 'Q');
}

function plainBase(base) {
  return freeze({ t: base.t, E: base.E, O: base.O });
}

function sameBase(a, b) {
  return a && b && a.t === b.t && a.E === b.E && a.O === b.O;
}

export function quotientBaseForRoute(word) {
  if (!validWord(word)) return freeze({ status: 'PARALLEL_LIFT_ROUTE_BASE_ABSTAINS' });
  const coordinate = quotientCoordinate(word);
  if (coordinate?.status !== 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED') {
    return freeze({ status: 'PARALLEL_LIFT_ROUTE_BASE_ABSTAINS' });
  }
  return freeze({
    status: 'PARALLEL_LIFT_ROUTE_BASE_DERIVED',
    base: plainBase(coordinate),
  });
}

export function firstMomentForRoute(word) {
  if (!validWord(word)) return freeze({ status: 'PARALLEL_LIFT_FIRST_MOMENT_ABSTAINS' });
  const coordinate = firstMomentCoordinate(word);
  if (coordinate?.status !== 'FIRST_MOMENT_WEAKER_TRANSPORT_COORDINATE_DERIVED') {
    return freeze({ status: 'PARALLEL_LIFT_FIRST_MOMENT_ABSTAINS' });
  }
  return freeze({
    status: 'PARALLEL_LIFT_FIRST_MOMENT_DERIVED',
    P: canonicalInteger(coordinate.P),
  });
}

export function routeFiberTransport(word, fiber) {
  if (!validWord(word) || !Number.isInteger(fiber)) {
    return freeze({ status: 'PARALLEL_LIFT_FIBER_TRANSPORT_ABSTAINS' });
  }
  const base = quotientBaseForRoute(word);
  const moment = firstMomentForRoute(word);
  if (base.status !== 'PARALLEL_LIFT_ROUTE_BASE_DERIVED'
    || moment.status !== 'PARALLEL_LIFT_FIRST_MOMENT_DERIVED') {
    return freeze({ status: 'PARALLEL_LIFT_FIBER_TRANSPORT_ABSTAINS' });
  }
  return freeze({
    status: 'PARALLEL_LIFT_FIBER_TRANSPORT_DERIVED',
    word: freeze([...word]),
    source_base: freeze({ t: 0, E: 0, O: 0 }),
    target_base: base.base,
    source_fiber: fiber,
    target_fiber: canonicalInteger(fiber + moment.P),
    translation: moment.P,
  });
}

export function routeFiberInverseTransport(word, targetFiber) {
  if (!validWord(word) || !Number.isInteger(targetFiber)) {
    return freeze({ status: 'PARALLEL_LIFT_FIBER_INVERSE_ABSTAINS' });
  }
  const base = quotientBaseForRoute(word);
  const moment = firstMomentForRoute(word);
  if (base.status !== 'PARALLEL_LIFT_ROUTE_BASE_DERIVED'
    || moment.status !== 'PARALLEL_LIFT_FIRST_MOMENT_DERIVED') {
    return freeze({ status: 'PARALLEL_LIFT_FIBER_INVERSE_ABSTAINS' });
  }
  return freeze({
    status: 'PARALLEL_LIFT_FIBER_COORDINATE_INVERSE_DERIVED',
    word: freeze([...word]),
    source_base: base.base,
    target_base: freeze({ t: 0, E: 0, O: 0 }),
    source_fiber: targetFiber,
    target_fiber: canonicalInteger(targetFiber - moment.P),
    translation: canonicalInteger(-moment.P),
    quarantine: 'INVERSE_FIBER_BIJECTION_NOT_INVERSE_TQ_ROUTE',
  });
}

export function parallelLiftFiberReturn(u, v, fiber = 0) {
  if (!validWord(u) || !validWord(v) || !Number.isInteger(fiber)) {
    return freeze({ status: 'PARALLEL_LIFT_FIBER_RETURN_ABSTAINS' });
  }
  const baseU = quotientBaseForRoute(u);
  const baseV = quotientBaseForRoute(v);
  const momentU = firstMomentForRoute(u);
  const momentV = firstMomentForRoute(v);
  if (baseU.status !== 'PARALLEL_LIFT_ROUTE_BASE_DERIVED'
    || baseV.status !== 'PARALLEL_LIFT_ROUTE_BASE_DERIVED'
    || momentU.status !== 'PARALLEL_LIFT_FIRST_MOMENT_DERIVED'
    || momentV.status !== 'PARALLEL_LIFT_FIRST_MOMENT_DERIVED') {
    return freeze({ status: 'PARALLEL_LIFT_FIBER_RETURN_ABSTAINS' });
  }
  if (!sameBase(baseU.base, baseV.base)) {
    return freeze({
      status: 'PARALLEL_LIFT_FIBER_RETURN_ABSTAINS_DIFFERENT_BASE',
      base_u: baseU.base,
      base_v: baseV.base,
    });
  }

  const translation = canonicalInteger(momentU.P - momentV.P);
  const inverseV = routeFiberInverseTransport(v, fiber);
  const forwardU = routeFiberTransport(u, inverseV.target_fiber);
  return freeze({
    status: 'PARALLEL_LIFT_SAME_BASE_FIBER_RETURN_AUTOMORPHISM_DERIVED',
    base: baseU.base,
    u: freeze([...u]),
    v: freeze([...v]),
    P_u: momentU.P,
    P_v: momentV.P,
    translation,
    input_fiber: fiber,
    output_fiber: forwardU.target_fiber,
    inverse_v: inverseV,
    forward_u: forwardU,
    nonidentity: translation !== 0,
    quarantine: freeze([
      'FIBER_INVERSE_NOT_OPERATIONAL_ROUTE_INVERSE',
      'SAME_BASE_PARALLEL_COMPARISON_NOT_OPERATIONAL_LOOP',
      'RETURN_AUTOMORPHISM_NOT_HOLONOMY',
    ]),
  });
}

function arraysEqual(a, b) {
  return Array.isArray(a) && Array.isArray(b)
    && a.length === b.length && a.every((value, index) => value === b[index]);
}

function transportBijectionCertificate() {
  const words = freeze([
    freeze([]),
    freeze(['T']),
    freeze(['Q']),
    freeze(['T', 'T', 'Q']),
    freeze(['Q', 'T', 'T']),
    freeze(['T', 'Q', 'T', 'Q', 'T']),
  ]);
  const fibers = freeze([-7, 0, 11]);
  const rows = [];
  for (const word of words) {
    for (const n of fibers) {
      const forward = routeFiberTransport(word, n);
      const inverse = routeFiberInverseTransport(word, forward.target_fiber);
      const backwardFirst = routeFiberInverseTransport(word, n);
      const forwardSecond = routeFiberTransport(word, backwardFirst.target_fiber);
      rows.push(freeze({
        word,
        n,
        forward,
        inverse,
        backward_first: backwardFirst,
        forward_second: forwardSecond,
        left_inverse: inverse.target_fiber === n,
        right_inverse: forwardSecond.target_fiber === n,
      }));
    }
  }
  return freeze({
    passed: rows.every((row) => row.left_inverse && row.right_inverse),
    rows: freeze(rows),
    claim: 'BIJECTIVITY_OF_INTEGER_FIBER_TRANSLATION_ONLY',
  });
}

function inheritedWoundCertificate() {
  const u = freeze(['T', 'T', 'Q']);
  const v = freeze(['Q', 'T', 'T']);
  const baseU = quotientBaseForRoute(u);
  const baseV = quotientBaseForRoute(v);
  const result = parallelLiftFiberReturn(u, v, 19);
  return freeze({
    passed: sameBase(baseU.base, freeze({ t: 2, E: 1, O: 0 }))
      && sameBase(baseU.base, baseV.base)
      && result.P_u === 2
      && result.P_v === 0
      && result.translation === 2
      && result.output_fiber === 21
      && result.nonidentity,
    u,
    v,
    result,
  });
}

function compositionCertificate() {
  const u = freeze(['T', 'T', 'Q', 'Q']);       // blocks (0,0,2), P=4
  const v = freeze(['Q', 'T', 'T', 'Q']);       // blocks (1,0,1), P=2
  const w = freeze(['Q', 'Q', 'T', 'T']);       // blocks (2,0,0), P=0
  const uv = parallelLiftFiberReturn(u, v, 5);
  const vw = parallelLiftFiberReturn(v, w, uv.output_fiber);
  const uw = parallelLiftFiberReturn(u, w, 5);
  const reverse = parallelLiftFiberReturn(v, u, uv.output_fiber);
  const identity = parallelLiftFiberReturn(u, u, 5);
  return freeze({
    passed: uv.status === 'PARALLEL_LIFT_SAME_BASE_FIBER_RETURN_AUTOMORPHISM_DERIVED'
      && vw.status === 'PARALLEL_LIFT_SAME_BASE_FIBER_RETURN_AUTOMORPHISM_DERIVED'
      && uw.status === 'PARALLEL_LIFT_SAME_BASE_FIBER_RETURN_AUTOMORPHISM_DERIVED'
      && uv.translation === 2
      && vw.translation === 2
      && uw.translation === 4
      && vw.output_fiber === uw.output_fiber
      && reverse.translation === -2
      && reverse.output_fiber === 5
      && identity.translation === 0
      && identity.output_fiber === 5,
    u,
    v,
    w,
    R_u_v: uv,
    R_v_w_after_u_v: vw,
    R_u_w: uw,
    reverse,
    identity,
    symbolic: 'R_(u|v) o R_(v|w) translates by (P_u-P_v)+(P_v-P_w)=P_u-P_w=R_(u|w).',
  });
}

function symbolicRkCertificate() {
  const sampleKs = freeze([0, 1, 2, 7, 19]);
  const rows = sampleKs.map((k) => {
    const left = freeze(['T', ...Array(k).fill('Q'), 'T', 'Q']);
    const right = freeze(['Q', 'T', ...Array(k).fill('Q'), 'T']);
    const baseLeft = quotientBaseForRoute(left);
    const baseRight = quotientBaseForRoute(right);
    const returnMap = parallelLiftFiberReturn(left, right, -3);
    return freeze({
      k,
      left,
      right,
      base_left: baseLeft,
      base_right: baseRight,
      return_map: returnMap,
      passed: sameBase(baseLeft.base, freeze({ t: 2, E: 1, O: k }))
        && sameBase(baseLeft.base, baseRight.base)
        && returnMap.P_u === k + 2
        && returnMap.P_v === k
        && returnMap.translation === 2
        && returnMap.output_fiber === -1,
    });
  });
  return freeze({
    passed: rows.every((row) => row.passed),
    symbolic_all_finite: freeze({
      jurisdiction: 'EVERY_FINITE_INTEGER_k_GREATER_THAN_OR_EQUAL_TO_0',
      left_blocks: '(0,k,1)',
      right_blocks: '(1,k,0)',
      common_quotient_base: '(2,1,k)',
      P_left: 'k+2',
      P_right: 'k',
      return_translation: '2',
      proof: 'Direct finite block-coordinate algebra; samples corroborate implementation only.',
    }),
    sample_rows: freeze(rows),
  });
}

function sameBaseSamePDistinctRouteHostile() {
  const u = freeze(['T', 'Q', 'T', 'Q', 'T']);
  const v = freeze(['Q', 'T', 'T', 'T', 'Q']);
  const result = parallelLiftFiberReturn(u, v, 13);
  return freeze({
    passed: !arraysEqual(u, v)
      && result.status === 'PARALLEL_LIFT_SAME_BASE_FIBER_RETURN_AUTOMORPHISM_DERIVED'
      && result.P_u === 3
      && result.P_v === 3
      && result.translation === 0
      && result.output_fiber === 13
      && !result.nonidentity,
    u,
    v,
    result,
    conclusion: 'DISTINCT_ROUTE_DOES_NOT_FORCE_NONIDENTITY_FIBER_RETURN',
  });
}

function differentBaseAbstentionHostile() {
  const result = parallelLiftFiberReturn(freeze(['T']), freeze(['Q']), 0);
  return freeze({
    passed: result.status === 'PARALLEL_LIFT_FIBER_RETURN_ABSTAINS_DIFFERENT_BASE',
    result,
  });
}

function extensionConsistencyCertificate() {
  const words = freeze([
    freeze([]),
    freeze(['T']),
    freeze(['Q']),
    freeze(['T', 'T', 'Q']),
    freeze(['Q', 'T', 'T']),
    freeze(['T', 'Q', 'T', 'Q', 'T']),
  ]);
  const rows = words.map((word) => {
    const moment = firstMomentForRoute(word);
    const parentSection = firstMomentRouteSection(word, 1);
    return freeze({
      word,
      P: moment.P,
      parent_section_fiber: parentSection.fiber,
      equal: parentSection.fiber === moment.P,
    });
  });
  return freeze({
    passed: rows.every((row) => row.equal),
    rows: freeze(rows),
    authority: 'CONSISTENCY_WITH_WITNESSED_#738_FREE_ROUTE_SPLITTING_SECTION',
  });
}

export function parallelLiftFiberReturnCertificate() {
  const transport = transportBijectionCertificate();
  const wound = inheritedWoundCertificate();
  const composition = compositionCertificate();
  const rk = symbolicRkCertificate();
  const sameP = sameBaseSamePDistinctRouteHostile();
  const differentBase = differentBaseAbstentionHostile();
  const extensionConsistency = extensionConsistencyCertificate();
  const passed = transport.passed
    && wound.passed
    && composition.passed
    && rk.passed
    && sameP.passed
    && differentBase.passed
    && extensionConsistency.passed;
  return freeze({
    schema: PARALLEL_LIFT_FIBER_RETURN_SCHEMA,
    parent_receipt: PARALLEL_LIFT_FIBER_RETURN_PARENT_RECEIPT,
    gate_issue: PARALLEL_LIFT_FIBER_RETURN_GATE_ISSUE,
    status: passed
      ? 'PARALLEL_LIFT_INTEGER_FIBER_RETURN_AUTOMORPHISM_CERTIFIED'
      : 'PARALLEL_LIFT_INTEGER_FIBER_RETURN_AUTOMORPHISM_NOT_CERTIFIED',
    passed,
    transport_bijection: transport,
    inherited_TTQ_QTT_wound: wound,
    comparison_composition: composition,
    all_finite_Rk_family: rk,
    same_base_same_P_distinct_route_hostile: sameP,
    different_base_abstention_hostile: differentBase,
    extension_consistency: extensionConsistency,
    canonical_classifications: freeze([
      'SAME_BASE_PARALLEL_AUTHORED_ROUTES_CAN_INDUCE_NONIDENTITY_BIJECTIVE_RETURN_TRANSLATIONS_ON_THE_INTEGER_COCYCLE_EXTENSION_FIBER',
      'THE_RK_TARGET_EQUIVALENCE_RELATION_FAMILY_CARRIES_A_UNIFORM_PLUS_TWO_INTEGER_FIBER_RETURN_TRANSLATION_FOR_EVERY_FINITE_K',
      'DISTINCT_ROUTE_DOES_NOT_IMPLY_NONIDENTITY_FIBER_RETURN_AND_INTEGER_EXTENSION_FIBER_DOES_NOT_ENCODE_COMPLETE_ROUTE_PROVENANCE',
    ]),
    quarantines: freeze([
      'INVERSE_FIBER_BIJECTION_NOT_INVERSE_TQ_ROUTE',
      'SAME_BASE_PARALLEL_COMPARISON_NOT_OPERATIONAL_CLOSED_PATH',
      'FIBER_RETURN_AUTOMORPHISM_NOT_HOLONOMY',
      'NO_CONNECTION_OR_CURVATURE_PROMOTION',
    ]),
  });
}
