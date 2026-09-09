// Pure normalized geometry: no DOM, time sampling, randomness, or authority.
// Coordinates are explanatory layout, never information-theoretic measurements.
const round = number => Math.round(number * 1000) / 1000;
const ease = value => 1 - (1 - value) ** 3;
const curve = points => points.map((point, index) => `${index ? 'L' : 'M'}${round(point.x)},${round(point.y)}`).join(' ');

export function projectLoomGeometry(snapshot) {
  const { packet, progress } = snapshot;
  const state = packet.geometry;
  const t = ease(Math.max(0, Math.min(1, progress)));
  const blocked = !packet.analysis.release_boundary.raw_release_allowed;
  const endpoint = blocked ? 566 : 610;
  const pressure = state.pressure;
  const returning = state.route === 'return';
  const forked = state.route === 'fork';
  const missing = state.missingness.length > 0;
  // Same start and endpoint; the declared route relation changes the interior.
  const at = u => ({
    x: 160 + (endpoint - 160) * u - (returning ? 88 * Math.sin(2 * Math.PI * u) * Math.sin(Math.PI * u) : 0),
    y: 227 - (returning ? 97 : 25) * Math.sin(Math.PI * u) + (returning ? 64 * Math.sin(2 * Math.PI * u) : 0)
  });
  const samples = Array.from({ length: 65 }, (_, i) => at(i / 64));
  const point = at(t);
  const strands = [-1, 0, 1].map((lane) => {
    const points = samples.map((p, i) => ({ x: p.x, y: p.y + lane * (10 + 5 * Math.sin(i / 64 * Math.PI)) }));
    // Missing evidence is an actual break, never a faded continuous line.
    return missing ? `${curve(points.slice(0, 29))} ${curve(points.slice(37))}` : curve(points);
  });
  const weather = Array.from({ length: 10 }, (_, i) => {
    const y = 97 + i * 22;
    const fold = pressure * (24 + i * 3) * t;
    return `M210,${y} C330,${y - fold} 438,${y + fold} 558,${y}`;
  });
  return Object.freeze({
    route: curve(samples),
    alternative: forked ? `M160,227 C270,330 470,320 ${endpoint},227` : '',
    strands: Object.freeze(strands), weather: Object.freeze(weather),
    point: Object.freeze({ x: round(point.x), y: round(point.y) }),
    progress: t, blocked, pressure, missing,
    // Forecast/model weather remains dashed even when motion is disabled.
    modeled: packet.alert.observed_vs_modeled === 'MODELED_DEMO',
    gateGap: round((1 - pressure) * 45 + 14),
    rest: state.rest,
    color: ({ GREEN: '#76ead4', YELLOW: '#e4c66c', RED: '#ff8b9d', HELD: '#dcc1ef' })[packet.alert.severity] || '#76ead4'
  });
}
