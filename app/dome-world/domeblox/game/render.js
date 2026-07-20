import { G, TAU, clamp, palette } from './core.js';

export function resize() {
  const ratio = Math.min(2, devicePixelRatio || 1);
  G.canvas.width = Math.floor(innerWidth * ratio);
  G.canvas.height = Math.floor(innerHeight * ratio);
  G.canvas.style.width = `${innerWidth}px`;
  G.canvas.style.height = `${innerHeight}px`;
  G.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  G.camera.zoom = clamp(Math.min(innerWidth / 1100, innerHeight / 760), .58, 1.12);
}

export function worldToScreen(x, y) {
  return { x: innerWidth / 2 + (x - G.camera.x) * G.camera.zoom, y: innerHeight / 2 + (y - G.camera.y) * G.camera.zoom * .78 };
}

function ellipse(ctx, x, y, rx, ry, fill, stroke = null, width = 1) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = width; ctx.strokeStyle = stroke; ctx.stroke(); }
}

function skyColor() {
  const hour = G.state.world.clock;
  if (hour < 5 || hour > 21) return '#02070e';
  if (hour < 7) return '#302f3e';
  if (hour < 18) return G.state.world.weather === 'storm' ? '#263238' : '#315a58';
  return hour < 20 ? '#5f4c4b' : '#101522';
}

export function drawWorld() {
  const { ctx } = G;
  ctx.fillStyle = skyColor(); ctx.fillRect(0, 0, innerWidth, innerHeight);
  const center = worldToScreen(0, 0); const z = G.camera.zoom;
  ellipse(ctx, center.x, center.y + 15 * z, 555 * z, 410 * z, palette.wasteland, '#332d27', 5 * z);
  const ground = { spring: '#295c4e', summer: '#376a50', autumn: '#5c6242', winter: '#5a6a68' }[G.state.world.season] || palette.dome;
  ellipse(ctx, center.x, center.y, 510 * z, 370 * z, ground, 'rgba(157,230,212,.24)', 4 * z);
  ellipse(ctx, center.x, center.y, 455 * z, 325 * z, null, palette.waterDark, 36 * z);
  ellipse(ctx, center.x, center.y, 420 * z, 295 * z, palette.grass, 'rgba(220,255,246,.12)', 2 * z);
  drawPaths(z); drawDomeGrid(center, z); drawMound(center, z);
  const entities = [...G.objects, ...G.animals.map((animal, index) => ({ ...animal, id: `animal-${index}`, kind: 'animal' })), { ...G.state.player, id: 'player', kind: 'player' }].sort((a, b) => a.y - b.y);
  for (const entity of entities) drawEntity(entity, z);
  drawWeather(); drawVignette();
}

function drawPaths(z) {
  const { ctx } = G; ctx.strokeStyle = 'rgba(190,163,112,.48)'; ctx.lineWidth = 15 * z; ctx.lineCap = 'round';
  for (let index = 0; index < 12; index += 1) {
    const angle = -Math.PI / 2 + index * TAU / 12;
    const a = worldToScreen(Math.cos(angle) * 70, Math.sin(angle) * 48);
    const b = worldToScreen(Math.cos(angle) * 370, Math.sin(angle) * 270);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
}

function drawDomeGrid(center, z) {
  const { ctx } = G; ctx.save(); ctx.globalAlpha = .18; ctx.strokeStyle = palette.accent; ctx.lineWidth = 1;
  for (let ring = 1; ring <= 5; ring += 1) ellipse(ctx, center.x, center.y - ring * 13 * z, (95 + ring * 78) * z, (65 + ring * 50) * z, null, palette.accent, 1);
  for (let index = 0; index < 18; index += 1) {
    const angle = index * TAU / 18; const point = worldToScreen(Math.cos(angle) * 490, Math.sin(angle) * 350);
    ctx.beginPath(); ctx.moveTo(center.x, center.y - 260 * z); ctx.quadraticCurveTo((center.x + point.x) / 2, center.y - 140 * z, point.x, point.y); ctx.stroke();
  }
  ctx.restore();
}

function drawMound(center, z) {
  const { ctx } = G;
  ellipse(ctx, center.x, center.y + 25 * z, 105 * z, 69 * z, '#315f4b', 'rgba(210,245,226,.15)', 2);
  ellipse(ctx, center.x, center.y + 10 * z, 63 * z, 43 * z, '#4a7659');
  ellipse(ctx, center.x, center.y + 4 * z, 33 * z, 22 * z, palette.waterDark);
  ellipse(ctx, center.x, center.y - z, 25 * z, 16 * z, palette.water);
}

function drawEntity(item, z) {
  const point = worldToScreen(item.x, item.y);
  if (item.kind === 'player') return drawPlayer(point, z);
  if (item.kind === 'animal') return drawAnimal(item, point, z);
  const { ctx } = G; ctx.save();
  const near = G.currentInteraction?.id === item.id;
  if (near) { ctx.shadowColor = palette.gold; ctx.shadowBlur = 20; }
  if (item.kind === 'home') drawHome(item, point, z);
  else if (item.kind === 'fountain') drawFountain(point, z);
  else if (item.kind === 'garden') drawGarden(point, z);
  else if (item.kind === 'bamboo') drawBamboo(point, z);
  else if (item.kind === 'loom') drawLoom(point, z);
  else if (item.kind === 'keep') drawKeep(item, point, z);
  else drawStation(item, point, z);
  if (near || G.camera.zoom > .85) drawLabel(item, point, z, near);
  ctx.restore();
}

function drawHome(item, point, z) {
  const { ctx } = G; ellipse(ctx, point.x, point.y + 10 * z, 38 * z, 18 * z, 'rgba(0,0,0,.25)');
  ctx.fillStyle = palette.wood; ctx.fillRect(point.x - 29 * z, point.y - 22 * z, 58 * z, 35 * z);
  ctx.beginPath(); ctx.moveTo(point.x - 36 * z, point.y - 20 * z); ctx.quadraticCurveTo(point.x, point.y - 65 * z, point.x + 36 * z, point.y - 20 * z); ctx.closePath(); ctx.fillStyle = item.color; ctx.fill();
  ctx.fillStyle = '#2c2018'; ctx.fillRect(point.x - 7 * z, point.y - 6 * z, 14 * z, 19 * z);
}
function drawFountain(point, z) { const { ctx } = G; ellipse(ctx, point.x, point.y + 8 * z, 44 * z, 18 * z, palette.stone); ellipse(ctx, point.x, point.y + 3 * z, 35 * z, 13 * z, palette.waterDark); ctx.strokeStyle = palette.water; ctx.lineWidth = 5 * z; ctx.beginPath(); ctx.moveTo(point.x, point.y - 4 * z); ctx.quadraticCurveTo(point.x - 25 * z, point.y - 45 * z, point.x - 31 * z, point.y + z); ctx.moveTo(point.x, point.y - 4 * z); ctx.quadraticCurveTo(point.x + 25 * z, point.y - 45 * z, point.x + 31 * z, point.y + z); ctx.stroke(); }
function drawGarden(point, z) { const { ctx } = G; ellipse(ctx, point.x, point.y + 7 * z, 44 * z, 23 * z, '#694c31'); for (let index = 0; index < 9; index += 1) { const angle = index * 2.3; const radius = 9 + index % 3 * 8; ellipse(ctx, point.x + Math.cos(angle) * radius * z, point.y + Math.sin(angle) * radius * .55 * z, 5 * z, 7 * z, palette.leaf); } }
function drawBamboo(point, z) { const { ctx } = G; for (let index = 0; index < 8; index += 1) { const x = (index % 4 - 1.5) * 10 * z; const y = Math.floor(index / 4) * 10 * z; ctx.strokeStyle = palette.bamboo; ctx.lineWidth = 5 * z; ctx.beginPath(); ctx.moveTo(point.x + x, point.y + 15 * z + y); ctx.lineTo(point.x + x + (index % 2 ? 3 : -3) * z, point.y - (35 + index % 3 * 9) * z); ctx.stroke(); } }
function drawLoom(point, z) { const { ctx } = G; ctx.strokeStyle = palette.wood; ctx.lineWidth = 7 * z; ctx.strokeRect(point.x - 28 * z, point.y - 38 * z, 56 * z, 50 * z); ctx.strokeStyle = palette.loom; ctx.lineWidth = 2 * z; for (let x = -20; x <= 20; x += 8) { ctx.beginPath(); ctx.moveTo(point.x + x * z, point.y - 33 * z); ctx.lineTo(point.x + x * z, point.y + 8 * z); ctx.stroke(); } }
function drawKeep(item, point, z) { const { ctx } = G; ellipse(ctx, point.x, point.y + 12 * z, 48 * z, 22 * z, 'rgba(0,0,0,.3)'); ctx.fillStyle = item.color; ctx.beginPath(); ctx.moveTo(point.x - 33 * z, point.y + 8 * z); ctx.lineTo(point.x - 20 * z, point.y - 48 * z); ctx.lineTo(point.x + 20 * z, point.y - 48 * z); ctx.lineTo(point.x + 33 * z, point.y + 8 * z); ctx.closePath(); ctx.fill(); ctx.strokeStyle = palette.gold; ctx.lineWidth = 2 * z; ctx.beginPath(); ctx.moveTo(point.x, point.y - 48 * z); ctx.lineTo(point.x, point.y - 110 * z); ctx.stroke(); ellipse(ctx, point.x, point.y - 118 * z, 20 * z, 12 * z, '#7b849a', palette.gold, 2); }
function drawStation(item, point, z) { const { ctx } = G; ellipse(ctx, point.x, point.y + 7 * z, 28 * z, 14 * z, 'rgba(0,0,0,.24)'); ellipse(ctx, point.x, point.y, 24 * z, 15 * z, item.color, 'rgba(255,255,255,.25)', 2); ctx.fillStyle = palette.white; ctx.font = `${20 * z}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(item.glyph, point.x, point.y - z); }
function drawPlayer(point, z) { const { ctx } = G; ellipse(ctx, point.x, point.y + 10 * z, 15 * z, 7 * z, 'rgba(0,0,0,.35)'); ctx.fillStyle = palette.playerDark; ctx.fillRect(point.x - 10 * z, point.y - 7 * z, 20 * z, 22 * z); ellipse(ctx, point.x, point.y - 13 * z, 11 * z, 12 * z, palette.player, '#fff3c0', 1.5); ctx.strokeStyle = palette.accent; ctx.lineWidth = 3 * z; ctx.beginPath(); ctx.moveTo(point.x, point.y - z); ctx.lineTo(point.x + Math.cos(G.state.player.facing) * 18 * z, point.y + Math.sin(G.state.player.facing) * 11 * z); ctx.stroke(); }
function drawAnimal(animal, point, z) { const colors = { duck: '#dfc36b', rabbit: '#bbb3aa', sheep: '#e7e4dc', chicken: '#d99758' }; ellipse(G.ctx, point.x, point.y, 7 * z, 5 * z, colors[animal.kind] || '#ddd'); ellipse(G.ctx, point.x + 6 * z, point.y - 3 * z, 3 * z, 3 * z, colors[animal.kind] || '#ddd'); }
function drawLabel(item, point, z, near) { const { ctx } = G; ctx.font = `${near ? 12 : 9}px system-ui`; const text = near ? `${item.glyph} ${item.name}` : item.glyph; const width = ctx.measureText(text).width + 14; ctx.fillStyle = near ? 'rgba(4,15,14,.92)' : 'rgba(4,15,14,.58)'; ctx.fillRect(point.x - width / 2, point.y - 78 * z, width, 20); ctx.fillStyle = near ? palette.gold : palette.white; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, point.x, point.y - 68 * z); }

function drawWeather() { const { ctx } = G; if (['rain', 'storm'].includes(G.state.world.weather)) { ctx.strokeStyle = G.state.world.weather === 'storm' ? 'rgba(180,220,235,.55)' : 'rgba(180,220,235,.35)'; for (const particle of G.particles) { ctx.beginPath(); ctx.moveTo(particle.x, particle.y); ctx.lineTo(particle.x - 7, particle.y + 16); ctx.stroke(); } } else if (G.state.world.weather === 'mist') { const gradient = ctx.createLinearGradient(0, 0, innerWidth, innerHeight); gradient.addColorStop(0, 'rgba(210,235,228,.12)'); gradient.addColorStop(.5, 'rgba(210,235,228,.03)'); gradient.addColorStop(1, 'rgba(210,235,228,.16)'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, innerWidth, innerHeight); } }
function drawVignette() { const { ctx } = G; const gradient = ctx.createRadialGradient(innerWidth / 2, innerHeight / 2, Math.min(innerWidth, innerHeight) * .2, innerWidth / 2, innerHeight / 2, Math.max(innerWidth, innerHeight) * .7); gradient.addColorStop(0, 'rgba(0,0,0,0)'); gradient.addColorStop(1, 'rgba(0,0,0,.42)'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, innerWidth, innerHeight); }

export function drawMap() {
  const { mapCtx: ctx, mapCanvas } = G; const center = mapCanvas.width / 2;
  ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height); ctx.fillStyle = '#071716'; ctx.fillRect(0, 0, mapCanvas.width, mapCanvas.height); ctx.save(); ctx.translate(center, center); ctx.scale(.68, .68);
  ellipse(ctx, 0, 0, 510, 370, '#224f43', '#4f9587'); ellipse(ctx, 0, 0, 455, 325, null, palette.water, 26);
  for (const item of G.objects) { ctx.fillStyle = item.color; ctx.beginPath(); ctx.arc(item.x, item.y, item.kind === 'home' ? 16 : 12, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '16px system-ui'; ctx.textAlign = 'center'; ctx.fillText(item.glyph, item.x, item.y + 5); }
  ctx.fillStyle = palette.player; ctx.beginPath(); ctx.arc(G.state.player.x, G.state.player.y, 11, 0, TAU); ctx.fill(); ctx.restore();
}
