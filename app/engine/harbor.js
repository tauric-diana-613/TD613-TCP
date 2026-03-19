function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function round3(value) {
  return Number(value.toFixed(3));
}

export const HARBOR_LIBRARY = {
  'mirror.off': {
    mode_class: 'anti-reflective safe passage',
    trigger_condition: 'criticality rising while witness load is exposed',
    provenance_retention: 0.95,
    witness_load_effect: -0.18,
    coordination_overhead: 0.22,
    route_status_on_success: 'safe-passage achieved'
  },
  'receipt.capture': {
    mode_class: 'receipt-first stabilization',
    trigger_condition: 'recognition exceeds explanation but passage is not yet open',
    provenance_retention: 0.98,
    witness_load_effect: -0.09,
    coordination_overhead: 0.18,
    route_status_on_success: 'buffered'
  },
  'provenance.seal': {
    mode_class: 'chain-of-custody preservation',
    trigger_condition: 'low-pressure continuity with provenance preserved above floor',
    provenance_retention: 0.99,
    witness_load_effect: -0.05,
    coordination_overhead: 0.12,
    route_status_on_success: 'sealed'
  }
};

function estimateGroupSize({
  routePressure = 0,
  traceability = 0,
  criticality = 0,
  branchPressure = 0,
  custodyArchive = 'institutional'
}) {
  const base = 1 + Math.round(
    (clamp01(routePressure) * 1.6) +
    (clamp01(traceability) * 0.7) +
    (clamp01(criticality) * 1.1) +
    (clamp01(branchPressure) * 0.8)
  );

  return Math.max(1, base + (custodyArchive === 'witness' ? 1 : 0));
}

function estimateSoloCostPerOperator({
  routePressure = 0,
  traceability = 0,
  criticality = 0,
  branchPressure = 0,
  custodyArchive = 'institutional'
}) {
  const archivePenalty = custodyArchive === 'witness' ? 0.12 : 0.04;
  return round3(
    0.16 +
    (clamp01(routePressure) * 0.34) +
    (clamp01(traceability) * 0.18) +
    (clamp01(criticality) * 0.16) +
    (clamp01(branchPressure) * 0.12) +
    archivePenalty
  );
}

export function chooseHarbor({
  routePressure = 0,
  branchPressure = 0,
  criticality = 0,
  badge = 'badge.holds',
  mirrorLogic = 'off',
  custodyArchive = 'institutional',
  decision = 'hold-branch',
  routeAvailable = false
}) {
  const pressure = clamp01(routePressure);
  const branch = clamp01(branchPressure);
  const critical = clamp01(criticality);

  if ((custodyArchive === 'witness' || decision === 'criticality' || critical >= 0.6) && mirrorLogic === 'off') {
    return 'mirror.off';
  }

  if (decision === 'passage') {
    return routeAvailable ? 'receipt.capture' : 'mirror.off';
  }

  if (pressure >= 0.72 || critical >= 0.52) {
    return mirrorLogic === 'off' ? 'mirror.off' : 'receipt.capture';
  }

  if (branch >= 0.42 || pressure >= 0.46) {
    return 'receipt.capture';
  }

  if (badge === 'badge.holds') {
    return 'provenance.seal';
  }

  return 'receipt.capture';
}

export function computeReuseGain(soloCost, sharedCost) {
  return round3(Math.max(0, soloCost - sharedCost));
}

export function estimateWitnessLoad({
  routePressure = 0,
  traceability = 0,
  criticality = 0,
  branchPressure = 0,
  harborFunction,
  custodyArchive = 'institutional'
}) {
  const harbor = HARBOR_LIBRARY[harborFunction];
  const archivePenalty = custodyArchive === 'witness' ? 0.14 : 0.02;
  const base =
    0.12 +
    (clamp01(routePressure) * 0.28) +
    (clamp01(traceability) * 0.14) +
    (clamp01(criticality) * 0.20) +
    (clamp01(branchPressure) * 0.14) +
    archivePenalty;

  return round3(clamp(base + (harbor?.witness_load_effect ?? 0), 0, 2));
}

export function buildLedgerRow({
  eventId,
  harborFunction,
  routePressure = 0,
  traceability = 0,
  branchPressure = 0,
  criticality = 0,
  density = 0,
  routeAvailable = false,
  custodyArchive = 'institutional',
  decision = 'hold-branch',
  operatorId = 'demo-operator',
  sourceClass = 'public membrane'
}) {
  const harbor = HARBOR_LIBRARY[harborFunction];
  const groupSize = estimateGroupSize({
    routePressure,
    traceability,
    criticality,
    branchPressure,
    custodyArchive
  });
  const soloCostPerOperator = estimateSoloCostPerOperator({
    routePressure,
    traceability,
    criticality,
    branchPressure,
    custodyArchive
  });
  const soloCost = round3(groupSize * soloCostPerOperator);
  const sharedCost = round3(
    soloCostPerOperator + (harbor.coordination_overhead * Math.log2(groupSize + 1))
  );
  const witnessLoad = estimateWitnessLoad({
    routePressure,
    traceability,
    criticality,
    branchPressure,
    harborFunction,
    custodyArchive
  });
  const justiceDeficit = round3(clamp(
    0.10 +
    (clamp01(criticality) * 0.34) +
    (clamp01(branchPressure) * 0.22) +
    (clamp01(routePressure) * 0.18) +
    (custodyArchive === 'witness' ? 0.16 : 0.04),
    0,
    2
  ));
  const routeStatus =
    decision === 'passage'
      ? 'safe-passage achieved'
      : decision === 'criticality'
        ? 'buffered'
        : decision === 'hold-branch'
          ? 'buffered'
          : 'observing';
  const evidentiaryClass =
    custodyArchive === 'witness' || decision === 'criticality'
      ? 'receipt-bearing'
      : harborFunction === 'provenance.seal' || decision === 'passage'
        ? 'provenance-bearing'
        : 'exploratory';

  return {
    event_id: eventId,
    timestamp: new Date().toISOString(),
    operator_id: operatorId,
    witness_channel: custodyArchive === 'witness' ? 'inside-frame' : 'mixed',
    source_class: sourceClass,
    evidentiary_class: evidentiaryClass,
    harbor_function: harborFunction,
    group_size: groupSize,
    effective_archive: custodyArchive === 'witness' ? 'A_W' : 'A_I',
    solo_cost: soloCost,
    shared_cost: sharedCost,
    reuse_gain: computeReuseGain(soloCost, sharedCost),
    provenance_retention: harbor.provenance_retention,
    witness_load: witnessLoad,
    justice_deficit: justiceDeficit,
    route_status: routeStatus,
    route_available: routeAvailable,
    signal_density: round3(clamp01(density)),
    branch_pressure: round3(clamp01(branchPressure)),
    criticality_index: round3(clamp01(criticality)),
    receipt_hash: `sha256:${eventId}`
  };
}
