import { G, clamp, palette } from './core.js';
import {
  resize as baseResize,
  drawWorld as baseDrawWorld,
  drawMap,
  worldToScreen,
} from './render-responsive.js';

const GLYPH_FONT = '"TD613 FlowCore", system-ui, sans-serif';

function visualFrame() {
  const compact = matchMedia('(pointer:coarse), (max-width:820px)').matches;
  const portrait = innerHeight > innerWidth;
  const sidePad = compact ? 10 : 22;
  const topPad = compact ? 70 : 18;
  const bottomPad = compact ? (portrait ? 214 : 132) : 34;
  const width = Math.max(280, innerWidth - sidePad * 2);
  const height = Math.max(250, innerHeight - topPad - bottomPad);
  return {
    compact,
    portrait,
    width,
    height,
    centerX: innerWidth / 2,
    centerY: topPad + height / 2,
  };
}

export function resize() {
  baseResize();
  const frame = visualFrame();
  G.camera.centerX = frame.centerX;
  G.camera.centerY = frame.centerY;
  G.camera.zoom = clamp(Math.min(frame.width / 1160, frame.height / 820), .34, 1.08);
}

function persistentScale() {
  const dpr = devicePixelRatio || 1;
  const zoomPressure = clamp(.82 / Math.max(G.camera.zoom, .34), 1, 1.5);
  const browserPressure = clamp(1.15 / Math.max(dpr, .65), .9, 1.45);
  return Math.max(zoomPressure, browserPressure);
}

function drawPersistentStations() {
  const { ctx } = G;
  const scale = persistentScale();
  const reinforce = G.camera.zoom < .82 || (devicePixelRatio || 1) < 1.15;
  const stations = G.objects.filter(item => item.kind !== 'home');

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const item of stations) {
    const point = worldToScreen(item.x, item.y);
    const near = G.currentInteraction?.id === item.id;
    const radius = near ? 10.5 : 7.5 * scale;
    const alpha = near ? .98 : reinforce ? .88 : .42;

    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius + 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(4,15,14,.72)';
    ctx.fill();
    ctx.lineWidth = near ? 2 : 1;
    ctx.strokeStyle = near ? palette.gold : 'rgba(226,255,247,.48)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = item.color || palette.accent;
    ctx.fill();

    ctx.fillStyle = '#f4fff9';
    ctx.font = `${Math.round(clamp(11.5 * scale, 12, 17))}px ${GLYPH_FONT}`;
    ctx.fillText(item.glyph, point.x, point.y + .5);
  }
  ctx.restore();
}

export function drawWorld() {
  baseDrawWorld();
  drawPersistentStations();
}

export function renderDiagnostics() {
  const frame = visualFrame();
  return {
    schema: 'td613.domeblox.render-diagnostics/v1.2',
    centerX: G.camera.centerX,
    centerY: G.camera.centerY,
    viewportCenterX: innerWidth / 2,
    zoom: G.camera.zoom,
    devicePixelRatio: devicePixelRatio || 1,
    persistentScale: persistentScale(),
    stationCount: G.objects.filter(item => item.kind !== 'home').length,
    frame,
  };
}

export { drawMap, worldToScreen };
