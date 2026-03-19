function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function round3(value) {
  return Number(value.toFixed(3));
}

function harmonicMean(values = []) {
  const finite = values
    .map((value) => clamp01(Number(value) || 0))
    .filter((value) => value > 0);

  if (!finite.length) {
    return 0;
  }

  return finite.length / finite.reduce((sum, value) => sum + (1 / Math.max(value, 1e-6)), 0);
}

function arithmeticMean(values = []) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + clamp01(Number(value) || 0), 0) / values.length;
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

export function cadenceCoherence({
  sentenceDistance = 1,
  spreadDistance = 1,
  punctDistance = 1,
  punctShapeDistance = 1,
  contractionDistance = 1,
  functionWordDistance = 1,
  wordLengthDistance = 1,
  charGramDistance = 1,
  lexicalDistance = 1,
  recurrenceDistance = 1
} = {}) {
  return round3(clamp01(
    ((1 - clamp01(sentenceDistance)) * 0.14) +
    ((1 - clamp01(spreadDistance)) * 0.08) +
    ((1 - clamp01(punctDistance)) * 0.10) +
    ((1 - clamp01(punctShapeDistance)) * 0.14) +
    ((1 - clamp01(contractionDistance)) * 0.10) +
    ((1 - clamp01(functionWordDistance)) * 0.18) +
    ((1 - clamp01(wordLengthDistance)) * 0.08) +
    ((1 - clamp01(charGramDistance)) * 0.14) +
    ((1 - clamp01(lexicalDistance)) * 0.02) +
    ((1 - clamp01(recurrenceDistance)) * 0.02)
  ));
}

export function cadenceResonance({ similarity = 0, traceability = 0, coherence = null } = {}) {
  const harmonic = harmonicMean([similarity, traceability]);

  if (coherence == null) {
    return round3(clamp01(harmonic));
  }

  return round3(clamp01(
    (harmonic * 0.58) +
    (harmonicMean([similarity, traceability, coherence]) * 0.42)
  ));
}

export function branchDynamics({
  similarity = 0,
  traceability = 0,
  lexicalOverlap = 0,
  coherence = null,
  functionWordDistance = 1,
  charGramDistance = 1,
  punctShapeDistance = 1
} = {}) {
  const overlap = clamp01(lexicalOverlap);
  const coherenceTerm = clamp01(
    coherence == null
      ? arithmeticMean([
          1 - clamp01(functionWordDistance),
          1 - clamp01(charGramDistance),
          1 - clamp01(punctShapeDistance)
        ])
      : coherence
  );
  const stylometricSurplus = clamp01(clamp01(traceability) - overlap);
  const coherenceShadow = clamp01(coherenceTerm - overlap);
  const branchPressure = round3(clamp01(
    (stylometricSurplus * 0.68) +
    (coherenceShadow * 0.32)
  ));
  const beta = round3(1 + clamp01(similarity) + clamp01(traceability));
  const gamma = round3(0.42 - branchPressure);
  const quadratic = solveQuadratic(1, -beta, gamma);

  return {
    ...quadratic,
    lexicalOverlap: round3(overlap),
    coherence: round3(coherenceTerm),
    stylometricSurplus: round3(stylometricSurplus),
    branchPressure,
    beta,
    gamma,
    flag: quadratic.unwanted.length ? 1 : 0,
    classification: branchPressure >= 0.42 || quadratic.unwanted.length
      ? 'candidate-discovery-branch'
      : quadratic.classification
  };
}

export function routePressure(similarityOrState, traceability = 0, branchFlag = 0, recurrencePressure = 0) {
  if (typeof similarityOrState === 'object' && similarityOrState !== null) {
    const {
      similarity = 0,
      traceability: trace = 0,
      recurrencePressure: recurrence = 0,
      branchPressure = 0,
      coherence = cadenceCoherence(similarityOrState),
      resonance = cadenceResonance({ similarity, traceability: trace, coherence })
    } = similarityOrState;

    return round3(clamp01(
      (clamp01(resonance) * 0.40) +
      (clamp01(coherence) * 0.26) +
      (clamp01(recurrence) * 0.18) +
      (clamp01(branchPressure) * 0.16)
    ));
  }

  return round3(clamp01(
    (clamp01(similarityOrState) * 0.33) +
    (clamp01(traceability) * 0.27) +
    (clamp01(recurrencePressure) * 0.22) +
    ((branchFlag ? 1 : 0) * 0.05)
  ));
}

export function computeRoutePressure(...args) {
  return routePressure(...args);
}

export function fieldPotential({
  routePressure: pressureInput = 0,
  resonance = 0,
  coherence = 0,
  branchPressure = 0,
  mirrorLogic = 'off',
  containment = 'on'
} = {}) {
  const pressure = clamp01(pressureInput);
  const mirrorTerm = mirrorLogic === 'on' ? 0.08 : 0;
  const containmentTerm = containment === 'on' ? 0.06 : -0.04;

  return round3(clamp01(
    (pressure * 0.46) +
    (clamp01(resonance) * 0.22) +
    (clamp01(coherence) * 0.12) +
    (clamp01(branchPressure) * 0.08) +
    mirrorTerm +
    containmentTerm
  ));
}

export function waveStats({
  similarity = 0,
  traceability = 0,
  resonance = null,
  coherence = 0,
  branchPressure = 0,
  recurrencePressure = 0,
  fieldPotential: V = 0
} = {}) {
  const phaseLock = clamp01(
    resonance == null
      ? cadenceResonance({ similarity, traceability, coherence })
      : resonance
  );
  const amplitude = round3(phaseLock);
  const waveNumber = round3(1 + (clamp01(recurrencePressure) * 2.2) + (clamp01(branchPressure) * 0.8));
  const density = round3(clamp01(
    (amplitude ** 2) * (0.26 + (0.44 * clamp01(V)) + (0.30 * clamp01(coherence)))
  ));
  const damping = round3(clamp01((1 - phaseLock) * (1 - clamp01(V))));

  return {
    amplitude,
    k: waveNumber,
    density,
    V: round3(clamp01(V)),
    coherence: round3(clamp01(coherence)),
    phaseLock: round3(phaseLock),
    damping
  };
}

export function criticalityIndex({
  density = 0,
  routePressure: pressureInput = 0,
  branchPressure = 0,
  routeAvailable = false
} = {}) {
  return round3(clamp01(
    (clamp01(density) * 0.46) +
    (clamp01(pressureInput) * 0.28) +
    (clamp01(branchPressure) * 0.26) -
    (routeAvailable ? 0.24 : 0)
  ));
}

export function custodyThreshold(custodialIntegrityOrState, custodialDrift, theta = 0.2) {
  if (typeof custodialIntegrityOrState === 'object' && custodialIntegrityOrState !== null) {
    const {
      routePressure: pressureInput = 0,
      density = 0,
      branchPressure = 0,
      resonance = 0,
      coherence = 0,
      criticality = 0,
      containment = 'on',
      mirrorLogic = 'off',
      badge = 'badge.holds',
      theta: thresholdInput = 0.2
    } = custodialIntegrityOrState;

    const badgeTerm =
      badge === 'badge.holds'
        ? 0.08
        : badge === 'badge.buffer'
          ? 0.05
          : 0.03;
    const integrity = round3(clamp01(
      0.22 +
      (clamp01(resonance) * 0.22) +
      (clamp01(coherence) * 0.18) +
      (containment === 'on' ? 0.12 : -0.03) +
      (mirrorLogic === 'on' ? 0.08 : 0) +
      badgeTerm +
      ((1 - clamp01(branchPressure)) * 0.10)
    ));
    const drift = round3(clamp01(
      0.12 +
      (clamp01(pressureInput) * 0.28) +
      (clamp01(density) * 0.18) +
      (clamp01(branchPressure) * 0.16) +
      (clamp01(criticality) * 0.16) +
      (mirrorLogic === 'off' ? 0.07 : 0) +
      (containment === 'off' ? 0.05 : 0)
    ));
    const threshold = round3(thresholdInput);
    const delta = round3(integrity - drift);

    return {
      integrity,
      drift,
      delta,
      theta: threshold,
      archive: delta >= threshold ? 'institutional' : 'witness'
    };
  }

  const integrity = clamp01(custodialIntegrityOrState);
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
