export const HUSH_APERTURE_ROUTE_VERSION = 'phase-38-aperture-route-v1';

const arr = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const txt = (value) => String(value ?? '').trim();
const num = (value) => {
  const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};
const uniq = (values = []) => [...new Set(arr(values).map((value) => txt(value)).filter(Boolean))];

export function summarizeApertureRoute(packet = {}) {
  const metrics = packet.aperture_metrics || {};
  const trace = packet.source_trace || {};
  const state = txt(metrics.route_state || packet.route_intent || '').toLowerCase();
  const sigma = num(metrics.sigma_r);
  const detector = num(metrics.detector_confidence);
  const harbor = num(metrics.harbor_eligibility);
  const labels = [];
  if (sigma >= 0.66 || /rupture|harbor/.test(state)) labels.push('route_pressure');
  if (detector >= 0.55) labels.push('compression_review');
  if (harbor >= 0.72) labels.push('operator_close');
  if (arr(trace.occlusion_markers).length > arr(trace.trace_fragments).length) labels.push('boundary_review');
  if (!labels.length) labels.push('ordinary_review');
  return {
    version: HUSH_APERTURE_ROUTE_VERSION,
    route_intent: packet.route_intent || 'hush-mask-review',
    route_state: metrics.route_state || '',
    labels: uniq(labels),
    scores: { sigma_r: sigma, detector_confidence: detector, harbor_eligibility: harbor },
    close_required: labels.includes('operator_close') || labels.includes('boundary_review')
  };
}

export function buildApertureBridge(packet = {}) {
  const route = summarizeApertureRoute(packet);
  const repair = route.labels.flatMap((label) => ({ route_pressure: ['route_visibility'], compression_review: ['relation_restore'], boundary_review: ['boundary_reassert'], operator_close: ['operator_close'], ordinary_review: ['mask_fidelity_review'] }[label] || []));
  return {
    bridge_version: HUSH_APERTURE_ROUTE_VERSION,
    packet_version: packet.packet_version || 'aperture-hush-handoff/v1',
    route_intent: route.route_intent,
    route_profile: route,
    repair_controls: { aperture_bridge_active: true, aperture_repair_operations: uniq(repair), operator_close_required: route.close_required },
    trace_summary: { trace_fragment_count: arr(packet.source_trace?.trace_fragments).length, occlusion_marker_count: arr(packet.source_trace?.occlusion_markers).length }
  };
}

export function attachApertureRoute(flightPacket = {}, packet = {}) {
  if (!packet || packet.source !== 'td613-aperture' || packet.target !== 'hush') return flightPacket;
  const bridge = buildApertureBridge(packet);
  return { ...flightPacket, aperture_bridge: bridge, repair_controls: { ...(flightPacket.repair_controls || {}), ...bridge.repair_controls }, flight_controls: { ...(flightPacket.flight_controls || {}), ...bridge.repair_controls } };
}
