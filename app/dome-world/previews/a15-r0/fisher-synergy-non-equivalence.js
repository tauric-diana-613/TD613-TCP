export const FISHER_SYNERGY_NON_EQUIVALENCE_SCHEMA = 'td613.ash.a15-r0.fisher-synergy-non-equivalence/v0.1';

const round = value => Number(value.toFixed(6));

function weightedMutualInformation(rows, xSelector, ySelector) {
  const total = rows.reduce((sum, row) => sum + row.weight, 0);
  const joint = new Map();
  const xs = new Map();
  const ys = new Map();
  for (const row of rows) {
    const x = String(xSelector(row));
    const y = String(ySelector(row));
    const key = `${x}\u0000${y}`;
    joint.set(key, (joint.get(key) || 0) + row.weight);
    xs.set(x, (xs.get(x) || 0) + row.weight);
    ys.set(y, (ys.get(y) || 0) + row.weight);
  }
  let information = 0;
  for (const [key, weight] of joint) {
    const split = key.indexOf('\u0000');
    const x = key.slice(0, split);
    const y = key.slice(split + 1);
    const pxy = weight / total;
    const px = xs.get(x) / total;
    const py = ys.get(y) / total;
    information += pxy * Math.log2(pxy / (px * py));
  }
  return round(information);
}

function buildNoisyBooleanJoint(kind, flipProbability = 0.1) {
  if (!(flipProbability > 0 && flipProbability < 0.5)) throw new TypeError('Flip probability must lie strictly between 0 and 0.5.');
  const truth = kind === 'XOR'
    ? (a, b) => a ^ b
    : kind === 'AND'
      ? (a, b) => a & b
      : null;
  if (!truth) throw new TypeError('Declared noisy Boolean family supports XOR and AND.');
  const rows = [];
  for (const a of [0, 1]) {
    for (const b of [0, 1]) {
      const expected = truth(a, b);
      for (const s of [0, 1]) {
        rows.push(Object.freeze({
          a,
          b,
          s,
          weight: 0.25 * (s === expected ? 1 - flipProbability : flipProbability)
        }));
      }
    }
  }
  return Object.freeze(rows);
}

function summarize(kind, flipProbability) {
  const rows = buildNoisyBooleanJoint(kind, flipProbability);
  const informationA = weightedMutualInformation(rows, row => row.s, row => row.a);
  const informationB = weightedMutualInformation(rows, row => row.s, row => row.b);
  const informationJoint = weightedMutualInformation(rows, row => row.s, row => `${row.a}:${row.b}`);
  return Object.freeze({
    family: kind,
    flip_probability: flipProbability,
    minimum_joint_state_probability: round(Math.min(...rows.map(row => row.weight))),
    feature_a_information_bits: informationA,
    feature_b_information_bits: informationB,
    joint_information_bits: informationJoint,
    joining_synergy_proxy_bits: round(informationJoint - informationA - informationB)
  });
}

export function runFisherSynergyNonEquivalence({ flipProbability = 0.1 } = {}) {
  const xor = summarize('XOR', flipProbability);
  const and = summarize('AND', flipProbability);
  const categoricalStates = 8;
  const simplexDimension = categoricalStates - 1;
  const fisherRaoSphereRadius = 2;
  const ambientScalarCurvature = simplexDimension * (simplexDimension - 1) / (fisherRaoSphereRadius ** 2);
  const synergyDifference = Math.abs(xor.joining_synergy_proxy_bits - and.joining_synergy_proxy_bits);

  return Object.freeze({
    schema: FISHER_SYNERGY_NON_EQUIVALENCE_SCHEMA,
    source_status: 'ANALYTIC_AMBIENT_GEOMETRY_WITH_SYNTHETIC_INTERIOR_DISTRIBUTIONS',
    authority_class: 'A2_DERIVATIONAL',
    categorical_joint_state_count: categoricalStates,
    simplex_dimension: simplexDimension,
    fisher_rao_sphere_radius: fisherRaoSphereRadius,
    ambient_fisher_rao_scalar_curvature: ambientScalarCurvature,
    noisy_xor: xor,
    noisy_and: and,
    joining_synergy_difference_bits: round(synergyDifference),
    same_ambient_scalar_curvature: true,
    different_joining_synergy: synergyDifference > 0,
    synergy_equals_ambient_fisher_scalar_curvature: false,
    submanifold_or_extrinsic_geometry_ruled_out: false,
    finding: 'Noisy XOR and noisy AND occupy the same interior eight-state categorical Fisher-Rao manifold, whose ambient scalar curvature is constant, while their joining-synergy proxies differ. Joining synergy therefore cannot equal ambient Fisher-Rao scalar curvature on that simplex.',
    caveat: 'This counterexample does not rule out a different metric, an interaction submanifold, extrinsic curvature, information-geometric tensors beyond scalar curvature, or another relational geometry.',
    claim_ceiling: 'AMBIENT_FISHER_RAO_SCALAR_CURVATURE_NON_EQUIVALENCE_ONLY'
  });
}
