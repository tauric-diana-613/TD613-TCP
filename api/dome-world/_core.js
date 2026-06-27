const CLAIM_CEILINGS = Object.freeze({
  bridge: 'aperture-to-flowcore-translation-not-aperture-execution',
  phason: 'phason-gate-simulation-not-external-enforcement',
  ash: 'ash-readiness-preview-not-sensitive-intake',
  deployment: 'dev-hidden-compatibility-workflow-not-production-custody'
});

const NUMBER_KEYS = ['projection_shift', 'fold_pressure', 'route_pressure', 'coherence', 'gluing_obstruction'];

function clamp01(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(1, n));
}

function avg(values) {
  const nums = values.map((v) => Number(v)).filter(Number.isFinite);
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

function hash(input) {
  const text = typeof input === 'string' ? input : JSON.stringify(input ?? null);
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function readJsonBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let body = '';
    req.on?.('data', (chunk) => { body += chunk; });
    req.on?.('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch (error) { resolve({ raw: body }); }
    });
    if (!req.on) resolve({});
  });
}

export function sendJson(res, status, payload) {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store, max-age=0');
  res.setHeader('x-td613-dome-world', 'v0.4.2b-aperture-v293-bridge');
  res.status(status).json(payload);
}

export function extractApertureV293Metadata(input = '') {
  const html = String(input.html || input.aperture_html || input.raw || '');
  const meta = {};
  const rx = /<meta\s+([^>]*?)>/gi;
  let match;
  while ((match = rx.exec(html))) {
    const tag = match[1];
    const name = /(?:name|property)=["']([^"']+)["']/i.exec(tag)?.[1];
    const content = /content=["']([^"']*)["']/i.exec(tag)?.[1];
    if (name) meta[name] = content || '';
  }
  const scripts = Array.from(html.matchAll(/<script[^>]+id=["']([^"']+)["'][^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi))
    .map((m) => ({ id: m[1], bytes: m[2].length }));
  return {
    schema: 'td613.aperture-v293.metadata/v1',
    detected: meta['aperture-version'] === 'v2.9.3-phason-heterostratigraphic-bridge' || /v2\.9\.3/.test(meta['aperture-version'] || html),
    aperture_version: meta['aperture-version'] || 'unknown',
    observed_regime: meta['observed-regime-full'] || meta['observed-regime'] || 'PRCS-A',
    dome_flowcore_compat: meta['dome-flowcore-compat'] || null,
    phason_gate_status: meta['phason-gate-status'] || null,
    hidden_indices: scripts,
    claim_ceiling: CLAIM_CEILINGS.bridge
  };
}

export function computeFlowCoreWeatherFromAperture(input = {}) {
  const metrics = {};
  for (const key of NUMBER_KEYS) metrics[key] = clamp01(input.metrics?.[key] ?? input[key], key === 'coherence' ? 0.58 : 0.0);
  const heat = avg([metrics.projection_shift, metrics.fold_pressure, metrics.route_pressure, metrics.gluing_obstruction]);
  const pressure = clamp01((metrics.projection_shift * 0.34) + (metrics.route_pressure * 0.34) + (metrics.gluing_obstruction * 0.22) + ((1 - metrics.coherence) * 0.10));
  const restDebt = clamp01((pressure * 0.72) + ((1 - metrics.coherence) * 0.28));
  const tending = [];
  if (pressure > 0.67 || restDebt > 0.66) tending.push('𝄐');
  if (heat > 0.48) tending.push('cōl');
  if (metrics.coherence > 0.62 && pressure < 0.55) tending.push('hõt');
  tending.push('米');
  const room = pressure > 0.74 ? 'Rest Alcove' : metrics.projection_shift > 0.62 ? 'Phason Gate' : metrics.gluing_obstruction > 0.56 ? 'Tomography Room' : metrics.route_pressure > 0.58 ? 'Cistern' : 'Atrium';
  return {
    schema: 'td613.aperture-to-dome.route-weather/v1',
    source: { tool: 'TD613 Aperture', version: 'v2.9.3', role: 'counter-tool', claim_ceiling: CLAIM_CEILINGS.bridge },
    active_lane: input.scan_family || input.active_lane || 'dome_world_compatibility_scan',
    metrics,
    flowcore_weather: {
      temperature: heat > 0.68 ? 'high' : heat > 0.38 ? 'moderate' : 'low',
      pressure: pressure > 0.72 ? 'storming' : pressure > 0.42 ? 'rising' : 'settled',
      humidity: metrics.projection_shift > 0.58 ? 'latent-trace-heavy' : 'dry',
      visibility: metrics.gluing_obstruction > 0.62 ? 'fogged' : metrics.gluing_obstruction > 0.34 ? 'partial' : 'clear',
      rest_debt: Number(restDebt.toFixed(3))
    },
    recommended_tending: [...new Set(tending)],
    room_candidate: room,
    claim_ceiling: CLAIM_CEILINGS.bridge
  };
}

export function simulatePhasonGate(input = {}) {
  const previous = input.previous_projection || 'public-weather';
  const next = input.new_projection || input.next_projection || 'quarantine';
  const hidden = input.hidden_coordinate_changed || 'stewardship_status';
  const contentChanged = Boolean(input.artifact_content_changed);
  const projectionChanged = previous !== next;
  const boundary = input.boundary_crossed || (String(next).includes('quarantine') ? 'public_export_boundary' : 'admissibility_window');
  return {
    schema: 'td613.phason-gate/v1',
    event_id: input.event_id || `phg_${hash({ previous, next, hidden, contentChanged, boundary })}`,
    artifact_id: input.artifact_id || 'ash_doc_pending',
    artifact_content_changed: contentChanged,
    projection_changed: projectionChanged,
    hidden_coordinate_changed: hidden,
    previous_projection: previous,
    new_projection: next,
    window_id: input.window_id || 'W_Public-Export',
    boundary_crossed: boundary,
    boundary_relation: input.boundary_relation || 'exterior',
    operator_message: contentChanged ? 'Content changed; not a pure phason event.' : 'Artifact unchanged; admissible projection changed.',
    flowcore_translation: computeFlowCoreWeatherFromAperture({
      scan_family: 'phason_gate_scan',
      projection_shift: projectionChanged ? 0.84 : 0.18,
      fold_pressure: projectionChanged ? 0.62 : 0.24,
      route_pressure: projectionChanged ? 0.76 : 0.28,
      coherence: contentChanged ? 0.38 : 0.72,
      gluing_obstruction: projectionChanged ? 0.66 : 0.12
    }),
    content_exported: false,
    public_export_allowed: !String(next).includes('quarantine') && !String(next).includes('safe-harbor'),
    claim_ceiling: CLAIM_CEILINGS.phason
  };
}

export function computeAshReadiness(input = {}) {
  const required = ['artifact_class', 'route', 'stewardship_status', 'export_target'];
  const missing = required.filter((key) => !input[key]);
  const surface = JSON.stringify(input).toLowerCase();
  const sensitive = /whistle|legal|medical|minor|cultural|language|archive|private|sealed|indigenous|crimean|heritage/.test(surface);
  const stewardshipBlocked = /pending|unknown|unverified|withheld|quarantine/.test(String(input.stewardship_status || 'pending-review').toLowerCase());
  const publicBlocked = missing.length > 0 || stewardshipBlocked || sensitive;
  const weather = computeFlowCoreWeatherFromAperture({
    scan_family: 'ash_readiness_scan',
    projection_shift: publicBlocked ? 0.78 : 0.32,
    fold_pressure: sensitive ? 0.72 : 0.26,
    route_pressure: publicBlocked ? 0.82 : 0.34,
    coherence: missing.length ? 0.42 : 0.68,
    gluing_obstruction: stewardshipBlocked ? 0.72 : 0.22
  });
  return {
    schema: 'td613.ash-readiness-preview/v1',
    readiness: publicBlocked ? 'buffer_or_quarantine' : 'candidate_for_guarded_projection',
    missing_inputs: missing,
    public_export_allowed: !publicBlocked,
    recommended_projection: publicBlocked ? 'public-weather-only' : 'Ash Veil candidate',
    blocked_projection: publicBlocked ? ['raw summary', 'public cinder', 'Flight packet'] : [],
    flowcore_translation: weather,
    claim_ceiling: CLAIM_CEILINGS.ash
  };
}

export function step2Readiness() {
  return {
    schema: 'td613.dome-world.step2-readiness/v1',
    route: '/dome-world',
    runtime: 'Dome-World / Flow-Core v0.4.2b Aperture v2.9.3 Bridge',
    status: 'wired-for-dev-review',
    checks: {
      aperture_v293_bridge: true,
      phason_gate_simulator: true,
      ash_readiness_preview: true,
      repo_aperture_promotion_required_separately: true,
      production_custody_execution: false
    },
    claim_ceiling: CLAIM_CEILINGS.deployment
  };
}

export { CLAIM_CEILINGS };
