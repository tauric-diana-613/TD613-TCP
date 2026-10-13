const FRAME_MS = 1000 / 18;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

const VIEW_TONES = Object.freeze({
  search: [118, 234, 212],
  review: [228, 198, 108],
  ledger: [142, 227, 134],
  vault: [179, 155, 236],
  campaign: [127, 215, 255],
  receipts: [242, 217, 140]
});

function stableUnit(value) {
  let hash = 2166136261;
  for (const character of String(value || 'giving')) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function fit(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width * dpr));
  const height = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const context = canvas.getContext('2d');
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  return [context, rect.width, rect.height];
}

function lineField(context, width, height, spacing, angle, color, alpha) {
  const span = Math.hypot(width, height);
  context.save();
  context.translate(width / 2, height / 2);
  context.rotate(angle);
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.lineWidth = 0.65;
  for (let x = -span; x <= span; x += spacing) {
    context.beginPath();
    context.moveTo(x, -span);
    context.lineTo(x, span);
    context.stroke();
  }
  context.restore();
}

function foldTrace(context, width, y, amplitude, phase, color, alpha) {
  context.save();
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.lineWidth = 0.8;
  context.beginPath();
  for (let x = -8; x <= width + 8; x += 12) {
    const envelope = Math.sin(Math.max(0, Math.min(1, x / width)) * Math.PI);
    const py = y + Math.sin(x * 0.008 + phase) * amplitude * envelope;
    if (x === -8) context.moveTo(x, py);
    else context.lineTo(x, py);
  }
  context.stroke();
  context.restore();
}

function resonanceGeometry(context, width, height, tone, phase, activity) {
  const anchorX = width * 0.76;
  const anchorY = height * 0.31;
  const radius = Math.min(width, height) * 0.19;
  context.save();
  context.translate(anchorX, anchorY);
  context.rotate(-0.17 + phase * 0.35);
  context.strokeStyle = `rgba(${tone.join(',')},${0.075 + activity * 0.012})`;
  context.lineWidth = 0.7;
  for (let ring = 1; ring <= 4; ring += 1) {
    const r = radius * (0.42 + ring * 0.22);
    context.beginPath();
    context.arc(0, 0, r, Math.PI * 1.08, Math.PI * 1.82);
    context.stroke();
  }
  context.strokeStyle = 'rgba(179,155,236,0.075)';
  for (let layer = 0; layer < 3; layer += 1) {
    const size = radius * (0.58 + layer * 0.31);
    context.beginPath();
    context.moveTo(0, -size);
    context.lineTo(size * 0.866, size * 0.5);
    context.lineTo(-size * 0.866, size * 0.5);
    context.closePath();
    context.stroke();
  }
  context.restore();
}

function sourceTone(status) {
  if (status === 'COMPLETE') return [142, 227, 134];
  if (status === 'RUNNING') return [118, 234, 212];
  if (['PARTIAL', 'DRIFTED'].includes(status)) return [228, 198, 108];
  if (['FAILED', 'ERROR', 'UNAVAILABLE', 'CANCELLED'].includes(status)) return [217, 133, 148];
  return [127, 215, 255];
}

export function createGivingField(canvas) {
  const field = {
    view: 'search',
    sources: [],
    confirmed: 0,
    custody: 'LOCAL',
    sessionOpen: false
  };
  let frame = null;
  let lastFrame = 0;

  canvas.dataset.renderer = 'td613-giving-field/v1';
  canvas.dataset.claimCeiling = 'modeled-interface-ambiance-not-retrieval-evidence';

  function draw(timestamp = 0) {
    const [context, width, height] = fit(canvas);
    const tone = VIEW_TONES[field.view] || VIEW_TONES.search;
    const running = field.sources.filter((source) => source.status === 'RUNNING').length;
    const stressed = field.sources.filter((source) => ['PARTIAL', 'DRIFTED', 'FAILED', 'ERROR', 'UNAVAILABLE'].includes(source.status)).length;
    const phase = REDUCED_MOTION.matches ? 0 : timestamp * 0.00006 * (running ? 1 : 0.18);

    context.clearRect(0, 0, width, height);
    const gradient = context.createRadialGradient(width * 0.68, height * 0.22, 4, width * 0.58, height * 0.44, Math.max(width, height) * 0.78);
    gradient.addColorStop(0, `rgba(${tone.join(',')},0.052)`);
    gradient.addColorStop(0.48, 'rgba(7,23,18,0.025)');
    gradient.addColorStop(1, 'rgba(3,10,8,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    const spacing = width < 700 ? 58 : 72;
    lineField(context, width, height, spacing, Math.PI / 3 + phase, `rgba(${tone.join(',')},0.16)`, 0.42);
    lineField(context, width, height, spacing, -Math.PI / 3 - phase * 0.8, 'rgba(179,155,236,0.13)', 0.36);
    lineField(context, width, height, spacing * 1.35, 0, 'rgba(255,255,255,0.055)', 0.26);
    resonanceGeometry(context, width, height, tone, phase, Math.min(5, running + stressed));

    const traceCount = Math.min(7, 3 + stressed + Math.ceil(running / 2));
    for (let index = 0; index < traceCount; index += 1) {
      const y = height * (0.17 + index * 0.095);
      const amplitude = 8 + stressed * 2.2 + index * 1.5;
      foldTrace(context, width, y, amplitude, phase * (index + 1) + index, stressed ? 'rgba(217,133,148,0.46)' : `rgba(${tone.join(',')},0.34)`, 0.25);
    }

    const sources = field.sources.slice(0, 23);
    const columns = width < 620 ? 5 : width < 1000 ? 8 : 12;
    sources.forEach((source, index) => {
      const seed = stableUnit(source.id || index);
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = width * 0.08 + column * (width * 0.84 / Math.max(1, columns - 1)) + (seed - 0.5) * 18;
      const y = height * 0.66 + row * 34 + (seed - 0.5) * 12;
      const color = sourceTone(source.status);
      const pulse = source.status === 'RUNNING' && !REDUCED_MOTION.matches ? 1 + Math.sin(timestamp * 0.003 + index) * 0.24 : 1;
      context.fillStyle = `rgba(${color.join(',')},${source.status === 'IDLE' ? 0.12 : 0.30})`;
      context.beginPath();
      context.arc(x, y, (1.7 + (source.status === 'COMPLETE' ? 0.6 : 0)) * pulse, 0, Math.PI * 2);
      context.fill();
    });

    if (field.confirmed > 0) {
      context.strokeStyle = 'rgba(142,227,134,0.16)';
      context.lineWidth = 1;
      const radius = Math.min(width, height) * Math.min(0.22, 0.07 + Math.log10(field.confirmed + 1) * 0.035);
      context.beginPath();
      context.arc(width * 0.78, height * 0.72, radius, Math.PI, Math.PI * 2);
      context.stroke();
    }
  }

  function loop(timestamp) {
    frame = null;
    if (!field.sessionOpen || document.hidden) return;
    if (timestamp - lastFrame >= FRAME_MS) {
      lastFrame = timestamp;
      draw(timestamp);
    }
    if (!REDUCED_MOTION.matches && field.sources.some((source) => source.status === 'RUNNING')) frame = requestAnimationFrame(loop);
  }

  function schedule() {
    if (frame) cancelAnimationFrame(frame);
    frame = null;
    draw(performance.now());
    if (field.sessionOpen && !document.hidden && !REDUCED_MOTION.matches && field.sources.some((source) => source.status === 'RUNNING')) {
      frame = requestAnimationFrame(loop);
    }
  }

  const resize = () => schedule();
  const visibility = () => schedule();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  REDUCED_MOTION.addEventListener?.('change', schedule);

  return {
    update(next = {}) {
      Object.assign(field, next);
      schedule();
    },
    destroy() {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility);
      REDUCED_MOTION.removeEventListener?.('change', schedule);
    }
  };
}
