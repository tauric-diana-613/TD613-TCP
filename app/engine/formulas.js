export function solveQuadratic(a, b, c) {
  if (a === 0) throw new Error('a must be non-zero');
  const disc = b * b - 4 * a * c;
  if (disc < 0) {
    return { roots: [], discriminant: disc, unwanted: [], classification: 'complex' };
  }
  const sqrt = Math.sqrt(disc);
  const roots = [(-b + sqrt) / (2 * a), (-b - sqrt) / (2 * a)].sort((x, y) => x - y);
  const unwanted = roots.filter(r => r < 0);
  return {
    roots,
    discriminant: disc,
    unwanted,
    classification: unwanted.length ? 'candidate-discovery-branch' : 'resolved'
  };
}

export function fieldPotential({ routePressure = 0, mirrorLogic = 'off', containment = 'on' } = {}) {
  const mirrorTerm = mirrorLogic === 'on' ? 0.18 : 0;
  const containmentTerm = containment === 'on' ? 0.08 : 0;
  const V = Math.min(1, routePressure * 0.74 + mirrorTerm + containmentTerm);
  return Number(V.toFixed(3));
}

export function waveStats({ traceability = 0, recurrencePressure = 0, fieldPotential: V = 0 } = {}) {
  const amplitude = Number(Math.max(0, Math.min(1, traceability)).toFixed(3));
  const k = Number((1 + recurrencePressure * 4).toFixed(3));
  const density = Number((Math.min(1, (amplitude ** 2) * (0.5 + 0.5 * V))).toFixed(3));
  return { amplitude, k, density, V };
}

export function custodyThreshold(custodialIntegrity, custodialDrift, theta = 0.2) {
  const delta = Number((custodialIntegrity - custodialDrift).toFixed(3));
  const archive = delta >= theta ? 'institutional' : 'witness';
  return { delta, theta, archive };
}

export function routePressure(similarity, traceability, branchFlag = 0, recurrencePressure = 0) {
  const pressure = Math.min(1, similarity * 0.44 + traceability * 0.26 + recurrencePressure * 0.2 + branchFlag * 0.10);
  return Number(pressure.toFixed(3));
}

export function providerDecision({ recognized, explained, routeAvailable, density = 0, recurrencePressure = 0 }) {
  if (recognized && !explained && !routeAvailable && (density >= 0.2 || recurrencePressure >= 0.55)) return 'criticality';
  if (recognized && routeAvailable) return 'passage';
  if (!recognized) return 'weak-signal';
  return 'hold-branch';
}
