import { AnimationCoordinator } from './animation-coordinator.js';

/**
 * Dome-Art projection: paired anisotropic sections, a phi rosette and folded
 * route ribbons. Extends the operators in Dome-World's drawPhiRosette,
 * drawFolds and drawPhasonCanvas, under its single active-view clock contract.
 * The interference is aesthetic geometry, never a hidden-state measurement,
 * thermodynamic quantity, identifiability claim, evidence or authority.
 */
export const LIVING_GEOMETRY_CONTRACT = Object.freeze({
  renderer: 'dome-art/living-sections-v2', modeled: true,
  operators: Object.freeze(['paired-anisotropic-sections', 'phi-rosette', 'folded-route-ribbon']),
  claimCeiling: 'Aesthetic composition from declared view/request/rest only; no measured hidden state or physical inference.',
  maxDpr: 1.5, maxPixels: 2000000, maxFps: 30, durationMs: 1800,
  ambientPeriodMs: 180000, maxDriftPx: 6, maxTiltDegrees: .3,
  maxPaths: 180, maxSegments: 16000,
});

const TAU = Math.PI * 2;
const PHI = (1 + Math.sqrt(5)) / 2;
const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
let mountOrdinal = 0;

export function livingGeometryViewport(width, height, dpr = 1) {
  width = clamp(finite(width, 1), 1, 4096);
  height = clamp(finite(height, 1), 1, 2160);
  const scale = Math.min(clamp(finite(dpr, 1), .1, LIVING_GEOMETRY_CONTRACT.maxDpr), Math.sqrt(LIVING_GEOMETRY_CONTRACT.maxPixels / (width * height)));
  return Object.freeze({ width, height, dpr: scale, pixelWidth: Math.max(1, Math.floor(width * scale)), pixelHeight: Math.max(1, Math.floor(height * scale)) });
}

export function projectLivingGeometry(state = {}, snapshot = {}) {
  const phase = String(snapshot.packet?.phase ?? state.phase ?? 'prepared');
  const view = String(state.view ?? state.variant ?? 'loom').slice(0, 80);
  const rest = state.rest === true || snapshot.rest === true || snapshot.reducedMotion === true;
  const progress = rest ? 1 : clamp(finite(snapshot.progress, 1), 0, 1);
  // One slow, monotone settling gesture. No oscillator, noise source or idle loop.
  const settle = 1 - Math.pow(1 - progress, 3);
  let viewIndex = 0;
  for (const character of view) viewIndex = (viewIndex + character.codePointAt(0)) % 17;
  return Object.freeze({
    view, phase, rest, progress, settle,
    orientation: -.36 + viewIndex * .018 + (1 - settle) * .10,
    outgoing: ['pending', 'received', 'completed'].includes(phase),
    returning: ['received', 'completed'].includes(phase),
    held: ['held', 'error', 'blocked'].includes(phase),
    variant: state.variant === 'marrowline' ? 'marrowline' : 'loom',
    claimCeiling: LIVING_GEOMETRY_CONTRACT.claimCeiling,
  });
}

function stroke(ctx, points, color, width = 1) {
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

/** Pure with respect to application state. Canvas is the only write target. */
export function drawLivingGeometry(ctx, viewport, field) {
  const { width: w, height: h, dpr } = viewport;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#08070e';
  ctx.fillRect(0, 0, w, h);
  const mobile = w < 650;
  const cx = w * (mobile ? .76 : field.variant === 'marrowline' ? .75 : .77);
  const cy = h * (mobile ? .30 : .46);
  const radius = Math.min(w * (mobile ? .91 : .57), h * .91);
  const halo = ctx.createRadialGradient(cx, cy, radius * .05, cx, cy, radius * 1.3);
  halo.addColorStop(0, '#39225b');
  halo.addColorStop(.38, '#26113b');
  halo.addColorStop(.70, '#14101f');
  halo.addColorStop(1, '#08070e');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);

  // Two elliptical sections share an anchor. Their unequal axes produce the
  // caustic interference; angular displacement is a declared view composition.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(field.orientation);
  const rings = mobile ? 34 : 48;
  for (let layer = 0; layer < 2; layer++) {
    for (let index = 0; index < rings; index++) {
      const q = index / (rings - 1);
      const r = radius * (.12 + q * .88);
      const points = [];
      for (let step = 0; step <= 84; step++) {
        const a = step / 84 * TAU;
        const fold = 1 + .115 * Math.cos(3 * a + q * PHI + layer * .38);
        const x = Math.cos(a) * r * fold;
        const y = Math.sin(a) * r * (.62 + layer * .065) * fold;
        const twist = layer * (.12 + .025 * (1 - field.settle));
        points.push([x * Math.cos(twist) - y * Math.sin(twist), x * Math.sin(twist) + y * Math.cos(twist)]);
      }
      const alpha = .17 + .36 * Math.pow(Math.sin(q * Math.PI), 2);
      const color = layer ? `rgba(205,149,255,${alpha})` : `rgba(245,178,100,${alpha * .89})`;
      stroke(ctx, points, color, index % 11 === 0 ? 1.45 : .68);
    }
  }
  // A finite phi rosette, made from tangent bundles rather than a star icon.
  for (let index = 0; index < 24; index++) {
    const a = index / 24 * TAU;
    const points = [];
    for (let step = 0; step <= 48; step++) {
      const t = step / 48 * 2 - 1;
      const bend = Math.sin(t * Math.PI * PHI + a) * radius * .115;
      points.push([Math.cos(a) * t * radius + Math.cos(a + Math.PI / 2) * bend, (Math.sin(a) * t * radius + Math.sin(a + Math.PI / 2) * bend) * .66]);
    }
    stroke(ctx, points, index % 3 ? 'rgba(189,142,242,.15)' : 'rgba(254,211,151,.29)', .65);
  }
  ctx.restore();

  // A folded silk section crosses the canvas, leaving broad, quiet plate areas.
  const bands = mobile ? 24 : 36;
  for (let index = 0; index < bands; index++) {
    const q = index / (bands - 1);
    const points = [];
    for (let step = 0; step <= 72; step++) {
      const u = step / 72;
      const x = u * w;
      const y = h * (.84 - .25 * u) + Math.sin(u * Math.PI * 1.8 + q * .48 + field.orientation) * h * .17 + (q - .5) * h * (.08 + .20 * Math.pow(Math.sin(u * Math.PI), 4));
      points.push([x, y]);
    }
    stroke(ctx, points, index % 3 ? 'rgba(160,116,224,.30)' : 'rgba(239,169,99,.45)', .8);
  }

  // Request lanes are the only event encoding: no lane implies no request.
  if (field.outgoing || field.returning || field.held) {
    ctx.save();
    ctx.strokeStyle = field.held ? '#eab38d' : '#e4b779';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(w * .16, h * .76);
    ctx.bezierCurveTo(w * .35, h * .22, w * .63, h * .96, w * (field.held ? .53 : .90), h * .27);
    ctx.stroke();
    if (field.returning) {
      ctx.strokeStyle = '#c9a8fa';
      ctx.beginPath(); ctx.moveTo(w * .90, h * .31);
      ctx.bezierCurveTo(w * .64, h * 1.03, w * .32, h * .27, w * .16, h * .80); ctx.stroke();
    }
    if (field.held) {
      stroke(ctx, [[w * .515, h * .24], [w * .545, h * .30]], '#ffd0a1', 2);
      stroke(ctx, [[w * .525, h * .23], [w * .555, h * .29]], '#ffd0a1', 2);
    }
    ctx.restore();
  }
  // Edge vignette lets the linework remain saturated without bright corners.
  const veil = ctx.createLinearGradient(0, 0, w, 0);
  veil.addColorStop(0, 'rgba(8,7,14,.72)');
  veil.addColorStop(.45, 'rgba(8,7,14,.04)');
  veil.addColorStop(1, 'rgba(8,7,14,.08)');
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, w, h);
}

/** A slow deterministic camera drift over cached geometry, not a measurement. */
export function livingGeometryTransform(snapshot = {}, rest = false) {
  const staticView = rest || snapshot.rest || snapshot.reducedMotion;
  const phase = staticView ? 0 : finite(snapshot.motionTimeMs, 0) / LIVING_GEOMETRY_CONTRACT.ambientPeriodMs * TAU;
  const x = Math.sin(phase) * LIVING_GEOMETRY_CONTRACT.maxDriftPx;
  const y = (Math.cos(phase * .7) - 1) * LIVING_GEOMETRY_CONTRACT.maxDriftPx * .5;
  const tilt = Math.sin(phase * .8) * LIVING_GEOMETRY_CONTRACT.maxTiltDegrees;
  return `translate3d(${x.toFixed(4)}px, ${y.toFixed(4)}px, 0) rotate(${tilt.toFixed(5)}deg) scale(1.04)`;
}

export function mountLivingGeometry(host, { coordinator: supplied, environment = globalThis, variant = 'loom', state: initial = {}, ambient = true } = {}) {
  if (!host) return null;
  const document = environment.document;
  const canvas = document.createElement('canvas');
  canvas.className = 'living-geometry-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.classList.add('living-geometry');
  host.dataset.geometryClaim = LIVING_GEOMETRY_CONTRACT.claimCeiling;
  host.dataset.geometryRenderer = LIVING_GEOMETRY_CONTRACT.renderer;
  host.append(canvas);
  const ctx = canvas.getContext('2d', { alpha: false });
  let disposed = false, inView = true, enabled = true, draws = 0, resizes = 0, frames = 0, lastSnapshot = null;
  let viewport = null, rasterKey = null;
  let state = { ...initial, variant };
  const coordinator = supplied ?? new AnimationCoordinator({
    durationMs: LIVING_GEOMETRY_CONTRACT.durationMs, maxFps: LIVING_GEOMETRY_CONTRACT.maxFps,
    requestFrame: callback => environment.requestAnimationFrame(callback),
    cancelFrame: id => environment.cancelAnimationFrame(id), now: () => environment.performance.now(),
    onState: current => { host.dataset.pendingFrames = String(current.pendingFrames); },
  });
  const media = environment.matchMedia?.('(prefers-reduced-motion: reduce)');
  const visible = () => enabled && inView && !document.hidden;
  const measure = () => {
    if (!visible()) return;
    const rect = host.getBoundingClientRect();
    viewport = rect.width >= 1 && rect.height >= 1 ? livingGeometryViewport(rect.width, rect.height, environment.devicePixelRatio) : null;
  };
  const draw = snapshot => {
    lastSnapshot = snapshot;
    if (disposed || !ctx || !visible()) return;
    if (!viewport) measure();
    if (!viewport) return;
    const reducedMotion = snapshot.reducedMotion || Boolean(media?.matches);
    // Rasterize at the complete state. Per-frame work is a compositor transform:
    // no layout read, trigonometric vertex army, canvas clear or new bitmap.
    const field = projectLivingGeometry(state, { ...snapshot, progress: 1, reducedMotion });
    const key = JSON.stringify([viewport, field.view, field.phase, field.variant]);
    if (rasterKey !== key) {
      if (canvas.width !== viewport.pixelWidth || canvas.height !== viewport.pixelHeight) {
        canvas.width = viewport.pixelWidth; canvas.height = viewport.pixelHeight; resizes++;
      }
      drawLivingGeometry(ctx, viewport, field);
      rasterKey = key;
      draws++;
    }
    canvas.style.transform = livingGeometryTransform({ ...snapshot, reducedMotion }, state.rest === true);
    canvas.style.willChange = field.rest ? 'auto' : 'transform';
    host.dataset.geometryPhase = field.phase;
    host.dataset.geometryReady = 'true';
    frames++;
  };
  const unregister = coordinator.registerPass(`living-geometry-${++mountOrdinal}`, draw);
  const update = (next = {}) => {
    if (disposed) return;
    state = { ...state, ...next, variant };
    host.dataset.geometryView = state.view ?? variant;
    if (supplied) {
      if (lastSnapshot) draw(lastSnapshot);
      else draw({ progress: 1, rest: state.rest === true, packet: {} });
    } else {
      coordinator.setContinuous(Boolean(ambient) && state.rest !== true);
      coordinator.setPacket({ scene: { id: `living-${state.view ?? variant}` }, phase: state.phase ?? 'prepared', geometry: { rest: state.rest === true } });
    }
  };
  const visibility = () => {
    if (disposed) return;
    coordinator.setVisible(visible());
    if (visible() && lastSnapshot) { measure(); draw(lastSnapshot); }
  };
  const motion = () => {
    if (disposed) return;
    if (!supplied) coordinator.setReducedMotion(Boolean(media?.matches));
    else if (lastSnapshot) draw(lastSnapshot);
  };
  const intersection = environment.IntersectionObserver ? new environment.IntersectionObserver(entries => {
    inView = entries.some(entry => entry.isIntersecting); visibility();
  }) : null;
  intersection?.observe(host);
  const resize = environment.ResizeObserver ? new environment.ResizeObserver(() => {
    measure();
    if (lastSnapshot) draw(lastSnapshot);
  }) : null;
  resize?.observe(host);
  document.addEventListener('visibilitychange', visibility);
  media?.addEventListener?.('change', motion);
  motion(); visibility(); update();
  const dispose = () => {
    if (disposed) return;
    disposed = true; unregister(); intersection?.disconnect(); resize?.disconnect();
    document.removeEventListener('visibilitychange', visibility);
    media?.removeEventListener?.('change', motion);
    environment.removeEventListener?.('pagehide', dispose);
    if (!supplied) coordinator.destroy();
    canvas.remove();
  };
  environment.addEventListener?.('pagehide', dispose, { once: true });
  return { update, dispose, setVisible(value) { enabled = Boolean(value); visibility(); }, inspect: () => ({ draws, frames, resizes, ownsClock: !supplied, visible: visible(), disposed, clock: coordinator.inspect(), contract: LIVING_GEOMETRY_CONTRACT }) };
}
