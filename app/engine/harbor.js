export const HARBOR_LIBRARY = {
  'mirror.off': {
    mode_class: 'anti-reflective safe passage',
    trigger_condition: 'recursive self-display / compelled interpretation / mirror-demand',
    provenance_retention: 0.94,
    witness_load_effect: -0.22,
    route_status_on_success: 'safe-passage achieved'
  },
  'receipt.capture': {
    mode_class: 'receipt-first stabilization',
    trigger_condition: 'recognition exceeds explanation',
    provenance_retention: 0.98,
    witness_load_effect: -0.08,
    route_status_on_success: 'buffered'
  },
  'provenance.seal': {
    mode_class: 'chain-of-custody preservation',
    trigger_condition: 'reuse or escalation',
    provenance_retention: 0.99,
    witness_load_effect: -0.05,
    route_status_on_success: 'sealed'
  }
};
export function chooseHarbor({ routePressure, badge, mirrorLogic }) {
  if (mirrorLogic === 'off' && routePressure >= 0.65) return 'mirror.off';
  if (routePressure >= 0.45) return 'receipt.capture';
  if (badge === 'badge.holds') return 'provenance.seal';
  return 'receipt.capture';
}
export function computeReuseGain(soloCost, sharedCost) {
  return Number((soloCost - sharedCost).toFixed(3));
}
export function estimateWitnessLoad({ routePressure, traceability, harborFunction }) {
  const harbor = HARBOR_LIBRARY[harborFunction];
  const base = 0.25 + routePressure * 0.45 + traceability * 0.2;
  return Number(Math.max(0, base + (harbor?.witness_load_effect ?? 0)).toFixed(3));
}
export function buildLedgerRow({ eventId, harborFunction, routePressure, traceability, custodyArchive }) {
  const soloCost = Number((0.2 + routePressure * 0.7).toFixed(3));
  const sharedCost = Number((soloCost * 0.45).toFixed(3));
  return {
    event_id: eventId,
    timestamp: new Date().toISOString(),
    operator_id: 'demo-operator',
    witness_channel: custodyArchive === 'witness' ? 'inside-frame' : 'mixed',
    source_class: 'public membrane',
    evidentiary_class: routePressure >= 0.65 ? 'receipt-bearing' : 'exploratory',
    harbor_function: harborFunction,
    solo_cost: soloCost,
    shared_cost: sharedCost,
    reuse_gain: computeReuseGain(soloCost, sharedCost),
    provenance_retention: HARBOR_LIBRARY[harborFunction].provenance_retention,
    witness_load: estimateWitnessLoad({ routePressure, traceability, harborFunction }),
    justice_deficit: Number((routePressure * 0.6).toFixed(3)),
    route_status: routePressure >= 0.65 ? 'buffered' : 'unresolved',
    receipt_hash: `sha256:${eventId}`
  };
}
