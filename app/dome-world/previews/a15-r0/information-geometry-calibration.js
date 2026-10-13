import { mutualInformationBits } from './open-research-field.js';

export const INFORMATION_GEOMETRY_CALIBRATION_SCHEMA = 'td613.ash.a15-r0.information-geometry-calibration/v0.1';

const round = value => Number(value.toFixed(9));

function softmaxReference(theta1, theta2) {
  const e1 = Math.exp(theta1);
  const e2 = Math.exp(theta2);
  const z = e1 + e2 + 1;
  return [e1 / z, e2 / z, 1 / z];
}

function fisherMetric(probabilities) {
  const [p1, p2] = probabilities;
  return [
    [p1 * (1 - p1), -p1 * p2],
    [-p1 * p2, p2 * (1 - p2)]
  ];
}

function determinant2(matrix) {
  return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
}

function transpose(matrix) {
  return matrix[0].map((_, column) => matrix.map(row => row[column]));
}

function multiply(left, right) {
  return left.map(row => right[0].map((_, column) => row.reduce((sum, value, index) => sum + value * right[index][column], 0)));
}

function metricTransform(metric, jacobian) {
  return multiply(multiply(transpose(jacobian), metric), jacobian);
}

function embeddingNormSquared(probabilities) {
  return probabilities.reduce((sum, probability) => sum + (2 * Math.sqrt(probability)) ** 2, 0);
}

function xorRows() {
  return [
    { s: 0, a: 0, b: 0 },
    { s: 1, a: 0, b: 1 },
    { s: 1, a: 1, b: 0 },
    { s: 0, a: 1, b: 1 }
  ];
}

function synergyProxy(rows, relabel = value => value) {
  const featureA = rows.map(row => ({ strategy: `S${relabel(row.s)}`, observation: `A${relabel(row.a)}` }));
  const featureB = rows.map(row => ({ strategy: `S${relabel(row.s)}`, observation: `B${relabel(row.b)}` }));
  const joint = rows.map(row => ({ strategy: `S${relabel(row.s)}`, observation: `A${relabel(row.a)}:B${relabel(row.b)}` }));
  return round(mutualInformationBits(joint) - mutualInformationBits(featureA) - mutualInformationBits(featureB));
}

export function runInformationGeometryCalibration() {
  const points = [
    [0, 0],
    [0.7, -0.4],
    [-1.1, 0.8]
  ].map(([theta1, theta2]) => {
    const probabilities = softmaxReference(theta1, theta2);
    const metric = fisherMetric(probabilities);
    return Object.freeze({
      theta: Object.freeze([theta1, theta2]),
      probabilities: Object.freeze(probabilities.map(round)),
      fisher_metric: Object.freeze(metric.map(row => Object.freeze(row.map(round)))),
      metric_determinant: round(determinant2(metric)),
      square_root_embedding_norm_squared: round(embeddingNormSquared(probabilities)),
      fisher_rao_sphere_radius: 2,
      gaussian_curvature: 0.25,
      scalar_curvature: 0.5
    });
  });

  const theta = [0.35, -0.6];
  const probabilities = softmaxReference(...theta);
  const metric = fisherMetric(probabilities);
  const jacobian = [[2, 0], [0.25, 0.5]];
  const transformed = metricTransform(metric, jacobian);
  const determinantLawLeft = determinant2(transformed);
  const determinantLawRight = determinant2(metric) * determinant2(jacobian) ** 2;
  const determinantCovarianceError = Math.abs(determinantLawLeft - determinantLawRight);

  const xor = xorRows();
  const originalSynergy = synergyProxy(xor);
  const relabeledSynergy = synergyProxy(xor, value => 1 - value);

  return Object.freeze({
    schema: INFORMATION_GEOMETRY_CALIBRATION_SCHEMA,
    source_status: 'ANALYTIC_CALIBRATION_WITH_NUMERIC_COORDINATE_CHECK',
    authority_class: 'A2_DERIVATIONAL',
    manifold: 'interior of the three-category probability simplex',
    metric: 'Fisher-Rao metric in two natural softmax coordinates',
    square_root_embedding: 'p -> 2*sqrt(p), positive octant of sphere radius 2',
    analytic_gaussian_curvature: 0.25,
    analytic_scalar_curvature: 0.5,
    calibration_points: Object.freeze(points),
    coordinate_change_jacobian: Object.freeze(jacobian.map(row => Object.freeze(row))),
    metric_determinant_covariance_error: round(determinantCovarianceError),
    metric_covariance_check_pass: determinantCovarianceError < 1e-12,
    joining_synergy_original_bits: originalSynergy,
    joining_synergy_bijective_relabel_bits: relabeledSynergy,
    joining_synergy_relabel_invariant_in_fixture: Math.abs(originalSynergy - relabeledSynergy) < 1e-12,
    joining_synergy_has_declared_manifold_metric: false,
    joining_synergy_has_declared_connection: false,
    joining_synergy_intrinsic_curvature_claim_supported: false,
    finding: 'The Fisher-Rao simplex supplies a positive-control geometry with an explicit metric, spherical embedding, and coordinate-covariant curvature. The joining-synergy proxy survives a bijective relabeling in its fixture, but that invariance alone does not supply a manifold, connection, or intrinsic curvature.',
    claim_ceiling: 'GEOMETRY_CALIBRATION_CONTROL_ONLY'
  });
}
