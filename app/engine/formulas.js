function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function round3(value) {
  return Number(value.toFixed(3));
}

export function solveQuadratic(a, b, c) {
  if (a === 0) {
    throw new Error('a must be non-zero');
  }

  const discriminant = b * b - (4 * a * c);
  if (discriminant < 0) {
    return {
      roots: [],
      discriminant,
      unwanted: [],
      classification: 'complex'
    };
  }

  const sqrt = Math.sqrt(discriminant);
  const roots = [(-b + sqrt) / (2 * a), (-b - sqrt) / (2 * a)].sort((x, y) => x - y);
  const unwanted = roots.filter((root) => root < 0);

  return {
    roots,
    discriminant,
    unwanted,
    classification: unwanted.length ? 'candidate-discovery-branch' : 'resolved'
  };
}

export function fieldPotential({ routePressure = 0, mirrorLogic = 'off', containment = 'on' } = {}) {
  const pressure = clamp01(routePressure);
  const mirrorTerm = mirrorLogic === 'on' ? 0.12 : 0;
  const containmentTerm = containment === 'on' ? 0.06 : -0.02;
  return round3(clamp01((pressure * 0.72) + mirrorTerm + containmentTerm));
}

export function waveStats({ traceability = 0, recurrencePressure = 0, fieldPotential: V = 0 } = {}) {
  const amplitude = round3(clamp01(traceability));
  const waveNumber = round3(1 + (clamp01(recurrencePressure) * 3));
  const density = round3(clamp01((amplitude ** 2) * (0.4 + (0.6 * clamp01(V)))));

  return {
    amplitude,
    k: waveNumber,
    density,
    V: round3(clamp01(V))
  };
}

export function custodyThreshold(custodialIntegrity, custodialDrift, theta = 0.2) {
  const integrity = clamp01(custodialIntegrity);
  const drift = clamp01(custodialDrift);
  const threshold = round3(theta);
  const delta = round3(integrity - drift);

  return {
    integrity,
    drift,
    delta,
    theta: threshold,
    archive: delta >= threshold ? 'institutional' : 'witness'
  };
}

export function routePressure(similarity, traceability, branchFlag = 0, recurrencePressure = 0) {
  const pressure =
    (clamp01(similarity) * 0.33) +
    (clamp01(traceability) * 0.27) +
    (clamp01(recurrencePressure) * 0.22) +
    ((branchFlag ? 1 : 0) * 0.05);

  return round3(clamp01(pressure));
}

export function providerDecision({
  recognized,
  explained,
  routeAvailable,
  density = 0,
  recurrencePressure = 0
}) {
  const denseSignal = clamp01(density) >= 0.28 || clamp01(recurrencePressure) >= 0.58;

  if (!recognized) {
    return 'weak-signal';
  }

  if (recognized && routeAvailable) {
    return 'passage';
  }

  if (recognized && !explained && !routeAvailable && denseSignal) {
    return 'criticality';
  }

  return 'hold-branch';
}
