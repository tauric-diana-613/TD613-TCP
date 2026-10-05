import { AnimationCoordinator } from './holonomy-loom/animation-coordinator.js';

export const FLOWCORE_CATHEDRAL_SCHEMA = 'td613.marrowline.flowcore-cathedral/v1';

export const FLOWCORE_OPERATORS = Object.freeze([
  { glyph: 'à', name: 'gathering', description: 'Context and documents gather at the boundary' },
  { glyph: '米', name: 'recurrence', description: 'Ancestral relation preserved across turns' },
  { glyph: '出', name: 'release', description: 'Explicit directional transport to AI receiver' },
  { glyph: 'hõt', name: 'bounded_emergence', description: 'Returned response admitted under rules' },
  { glyph: 'cōl', name: 'protected_continuity', description: 'Private and withheld material kept local' },
  { glyph: '上', name: 'created_potential', description: 'Armed authority staged for exactly one turn' },
  { glyph: '下', name: 'released_tendency', description: 'Arrival of foreign response before admission' },
  { glyph: '𝄐', name: 'structural_rest', description: 'Consequential authority fully powered down' }
]);

export const CARRIER_DEPTH_CONFIG = Object.freeze({
  near: { count: 6, className: 'flight-near', fontSize: 72, baseOpacity: 0.52, speed: 0.016 },
  mid: { count: 13, className: 'flight-mid', fontSize: 36, baseOpacity: 0.26, speed: 0.024 },
  far: { count: 20, className: 'flight-far', fontSize: 18, baseOpacity: 0.12, speed: 0.032 }
});

const TOTAL_CARRIERS = 39; // 6 + 13 + 20
const TAU = Math.PI * 2;

/**
 * Creates the SVG carrier DOM structure with exactly 39 carriers (6 near, 13 mid, 20 far).
 * Each carrier possesses a fixed semantic Flow-Core operator identity.
 */
export function buildCarrierNodes(svg, doc) {
  const flightLayer = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
  flightLayer.setAttribute('class', 'marrowline-carrier-flight');
  flightLayer.setAttribute('aria-hidden', 'true');

  const carriers = [];
  let index = 0;

  // 6 Near carriers
  for (let i = 0; i < CARRIER_DEPTH_CONFIG.near.count; i++) {
    const operator = FLOWCORE_OPERATORS[index % FLOWCORE_OPERATORS.length];
    const node = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
    node.setAttribute('class', 'flowcore-carrier flight-near');
    node.setAttribute('font-size', String(CARRIER_DEPTH_CONFIG.near.fontSize));
    node.setAttribute('text-anchor', 'middle');
    node.setAttribute('dominant-baseline', 'middle');
    node.setAttribute('data-carrier-index', String(index));
    node.setAttribute('data-carrier-depth', 'near');
    node.setAttribute('data-carrier-operator', operator.name);
    node.textContent = operator.glyph;
    flightLayer.append(node);
    carriers.push({
      index,
      depth: 'near',
      operator,
      node,
      baseOpacity: CARRIER_DEPTH_CONFIG.near.baseOpacity,
      speed: CARRIER_DEPTH_CONFIG.near.speed,
      phaseOffset: (i / CARRIER_DEPTH_CONFIG.near.count) * TAU,
      lane: (i % 3) - 1,
      rScale: 0.85 + (i % 3) * 0.15
    });
    index++;
  }

  // 13 Mid carriers
  for (let i = 0; i < CARRIER_DEPTH_CONFIG.mid.count; i++) {
    const operator = FLOWCORE_OPERATORS[index % FLOWCORE_OPERATORS.length];
    const node = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
    node.setAttribute('class', 'flowcore-carrier flight-mid');
    node.setAttribute('font-size', String(CARRIER_DEPTH_CONFIG.mid.fontSize));
    node.setAttribute('text-anchor', 'middle');
    node.setAttribute('dominant-baseline', 'middle');
    node.setAttribute('data-carrier-index', String(index));
    node.setAttribute('data-carrier-depth', 'mid');
    node.setAttribute('data-carrier-operator', operator.name);
    node.textContent = operator.glyph;
    flightLayer.append(node);
    carriers.push({
      index,
      depth: 'mid',
      operator,
      node,
      baseOpacity: CARRIER_DEPTH_CONFIG.mid.baseOpacity,
      speed: CARRIER_DEPTH_CONFIG.mid.speed,
      phaseOffset: (i / CARRIER_DEPTH_CONFIG.mid.count) * TAU,
      lane: (i % 5) - 2,
      rScale: 0.65 + (i % 4) * 0.18
    });
    index++;
  }

  // 20 Far carriers
  for (let i = 0; i < CARRIER_DEPTH_CONFIG.far.count; i++) {
    const operator = FLOWCORE_OPERATORS[index % FLOWCORE_OPERATORS.length];
    const node = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
    node.setAttribute('class', 'flowcore-carrier flight-far');
    node.setAttribute('font-size', String(CARRIER_DEPTH_CONFIG.far.fontSize));
    node.setAttribute('text-anchor', 'middle');
    node.setAttribute('dominant-baseline', 'middle');
    node.setAttribute('data-carrier-index', String(index));
    node.setAttribute('data-carrier-depth', 'far');
    node.setAttribute('data-carrier-operator', operator.name);
    node.textContent = operator.glyph;
    flightLayer.append(node);
    carriers.push({
      index,
      depth: 'far',
      operator,
      node,
      baseOpacity: CARRIER_DEPTH_CONFIG.far.baseOpacity,
      speed: CARRIER_DEPTH_CONFIG.far.speed,
      phaseOffset: (i / CARRIER_DEPTH_CONFIG.far.count) * TAU,
      lane: (i % 7) - 3,
      rScale: 0.45 + (i % 5) * 0.22
    });
    index++;
  }

  svg.append(flightLayer);
  return { flightLayer, carriers };
}

/**
 * Evaluates carrier positions for a given route state and timestamp.
 * Coordinates are bounded to the 1000x600 SVG viewBox with origin center (500, 280).
 */
export function computeCarrierPosition(carrier, {
  seconds = 0,
  routeState = 'REST',
  reducedMotion = false
} = {}) {
  const cx = 500;
  const cy = 280;

  if (reducedMotion) {
    // Static harmonious constellation under reduced motion
    const col = carrier.index % 7;
    const row = Math.floor(carrier.index / 7);
    const x = 120 + col * 125;
    const y = 80 + row * 85;
    return { x, y, opacity: carrier.baseOpacity * 0.8, roll: 0, scale: 1 };
  }

  const t = seconds * carrier.speed;
  const theta = carrier.phaseOffset + t;

  let x = cx;
  let y = cy;
  let opacity = carrier.baseOpacity;
  let roll = 0;
  let scale = 1;

  switch (routeState) {
    case 'ARRIVAL': {
      // Field gathers inward from perimeter toward focal point (à, 米)
      const r = (1 - ((t * 0.2) % 1)) * 320 * carrier.rScale + 60;
      x = cx + Math.cos(theta) * r * 1.3;
      y = cy + Math.sin(theta) * r * 0.65;
      roll = Math.sin(theta) * 12;
      scale = 0.8 + ((t * 0.2) % 1) * 0.35;
      break;
    }

    case 'BOUNDARY_DISCLOSURE': {
      // Selected relations become locally coherent; near carriers form a protective ellipse
      if (carrier.depth === 'near') {
        const rEllipseX = 260;
        const rEllipseY = 140;
        x = cx + Math.cos(theta * 0.6) * rEllipseX;
        y = cy + Math.sin(theta * 0.6) * rEllipseY;
        opacity = carrier.baseOpacity * 1.35;
        roll = Math.cos(theta * 0.6) * 8;
        scale = 1.1;
      } else {
        const r = 360 * carrier.rScale;
        x = cx + Math.cos(theta * 0.4) * r * 1.2;
        y = cy + Math.sin(theta * 0.4) * r * 0.7;
        opacity = carrier.baseOpacity * 0.9;
        roll = 0;
      }
      break;
    }

    case 'GOVERNED_SEND': {
      // Carriers align into directional horizontal transport (出)
      const speedMult = 2.4;
      const progress = ((seconds * carrier.speed * speedMult + carrier.index * 0.05) % 1);
      x = 50 + progress * 900;
      y = cy + carrier.lane * 45 + Math.sin(progress * Math.PI) * 20;
      opacity = carrier.baseOpacity * (1 + Math.sin(progress * Math.PI) * 0.4);
      roll = (progress - 0.5) * 16;
      scale = 0.9 + Math.sin(progress * Math.PI) * 0.25;
      break;
    }

    case 'RETURN': {
      // Carriers sweep inward from the perimeter, altered but connected (下, hõt)
      const sweepProgress = Math.min(1, ((seconds * 0.35) % 1));
      const r = (1 - sweepProgress * 0.6) * 380 * carrier.rScale + 40;
      x = cx + Math.cos(-theta * 0.8) * r * 1.25;
      y = cy + Math.sin(-theta * 0.8) * r * 0.6;
      opacity = carrier.baseOpacity * (0.8 + sweepProgress * 0.4);
      roll = Math.sin(sweepProgress * Math.PI) * 14;
      scale = 0.95 + sweepProgress * 0.15;
      break;
    }

    case 'RE_ENTRY': {
      // Field locally re-coheres only around the deliberate human gesture (cōl -> 上)
      const focusR = 190 * carrier.rScale;
      x = cx + Math.cos(theta * 0.7) * focusR * 1.1;
      y = cy + Math.sin(theta * 0.7) * focusR * 0.55;
      opacity = carrier.baseOpacity * (carrier.depth === 'near' ? 1.4 : 1.0);
      roll = Math.sin(theta * 0.7) * 9;
      scale = carrier.depth === 'near' ? 1.15 : 0.95;
      break;
    }

    case 'REST':
    default: {
      // Calm, breathing structural relaxation (𝄐)
      const slowTheta = carrier.phaseOffset + seconds * (carrier.speed * 0.35);
      const breath = Math.sin(seconds * 0.6) * 15;
      const r = (240 + breath) * carrier.rScale;
      x = cx + Math.cos(slowTheta) * r * 1.35;
      y = cy + Math.sin(slowTheta) * r * 0.75;
      opacity = carrier.baseOpacity;
      roll = Math.sin(slowTheta) * 5;
      scale = 1 + Math.sin(seconds * 0.6) * 0.04;
      break;
    }
  }

  return { x, y, opacity, roll, scale };
}

/**
 * Installs the complete 39-carrier Flow-Core cinematic field inside a container element.
 * Connects directly to the shared AnimationCoordinator for single-clock cadence.
 */
export function installFlowcoreCathedralField(container, docOrOptions = null, environmentArg = null, suppliedCoordinator = null) {
  if (!container) return null;
  let doc, environment, coordinator;
  if (docOrOptions && typeof docOrOptions.createElement === 'function') {
    doc = docOrOptions;
    environment = environmentArg || doc.defaultView || (typeof window !== 'undefined' ? window : globalThis);
    coordinator = suppliedCoordinator;
  } else {
    const opts = docOrOptions || {};
    environment = opts.environment || environmentArg || (typeof window !== 'undefined' ? window : globalThis);
    doc = opts.doc || environment.document || (typeof document !== 'undefined' ? document : null);
    coordinator = opts.coordinator || suppliedCoordinator;
  }
  if (!doc) return null;

  // Create SVG host
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'marrowlineFlowcoreField';
  svg.setAttribute('class', 'marrowline-flowcore-field');
  svg.setAttribute('viewBox', '0 0 1000 600');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('aria-hidden', 'true');

  // Gradient & filters definition
  const defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="flowcoreLuminousGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9ce7e4" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#b69be9" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#f6edcf" stop-opacity="0.85" />
    </linearGradient>
    <filter id="flowcoreSubtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  `;
  svg.append(defs);

  const { flightLayer, carriers } = buildCarrierNodes(svg, doc);
  container.append(svg);

  let activeRouteState = 'REST';
  let isLoomActive = false;
  let destroyed = false;

  const animCoordinator = coordinator || suppliedCoordinator || new AnimationCoordinator({
    durationMs: 4000,
    maxFps: 30,
    requestFrame: cb => environment.requestAnimationFrame ? environment.requestAnimationFrame(cb) : setTimeout(cb, 33),
    cancelFrame: id => environment.cancelAnimationFrame ? environment.cancelAnimationFrame(id) : clearTimeout(id),
    now: () => environment.performance?.now ? environment.performance.now() : Date.now()
  });

  const media = environment.matchMedia?.('(prefers-reduced-motion: reduce)');

  const renderFrame = (snapshot = {}) => {
    if (destroyed) return;
    const reducedMotion = Boolean(snapshot.reducedMotion || media?.matches);
    const seconds = (snapshot.timeMs || (environment.performance?.now ? environment.performance.now() : Date.now())) / 1000;

    // Apply choreography
    for (const carrier of carriers) {
      const pos = computeCarrierPosition(carrier, {
        seconds,
        routeState: activeRouteState,
        reducedMotion
      });
      carrier.node.setAttribute('x', String(Math.round(pos.x)));
      carrier.node.setAttribute('y', String(Math.round(pos.y)));
      carrier.node.setAttribute('opacity', pos.opacity.toFixed(3));
      carrier.node.setAttribute('transform',
        `rotate(${pos.roll.toFixed(1)} ${Math.round(pos.x)} ${Math.round(pos.y)}) scale(${pos.scale.toFixed(3)})`);
    }
  };

  const unregister = animCoordinator.registerPass('marrowline-flowcore-cathedral', renderFrame);

  const setRouteState = (state, { active = true } = {}) => {
    activeRouteState = state;
    isLoomActive = active;
    svg.dataset.routeState = state;
    svg.dataset.loomActive = String(active);
    svg.style.opacity = active ? '1' : '0';
    svg.style.visibility = active ? 'visible' : 'hidden';
  };

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    unregister?.();
    svg.remove();
    if (!coordinator && !suppliedCoordinator) animCoordinator.destroy();
  };

  return Object.freeze({
    svg,
    carriers,
    setRouteState,
    getRouteState: () => activeRouteState,
    getCarrierCount: () => TOTAL_CARRIERS,
    destroy
  });
}
