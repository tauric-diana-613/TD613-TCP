import { compileReadinessReceipt } from '../engine/ash-lifecycle.js';

const READINESS_KEY = 'td613:ash-threshold:readiness:v0.1';
const KEEP_ROUTE = '/dome-world/ash-threshold.html';

function initField(root) {
  const canvas = root.querySelector('[data-ash-threshold-field]');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const particles = [];
  let frame = 0;
  let width = 0;
  let height = 0;
  let visible = root.classList.contains('active');

  function draw(time = 0) {
    frame = 0;
    context.clearRect(0, 0, width, height);
    const glow = context.createRadialGradient(width * .5, height * .47, 0, width * .5, height * .47, Math.max(width, height) * .52);
    glow.addColorStop(0, 'rgba(118,234,212,.055)');
    glow.addColorStop(.35, 'rgba(208,167,255,.025)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
    for (const particle of particles) {
      particle.y -= particle.velocity;
      particle.x += Math.sin(time * .00025 + particle.phase) * .08;
      if (particle.y < -8) {
        particle.y = height + 8;
        particle.x = Math.random() * width;
      }
      context.fillStyle = `rgba(${particle.radius > 1.4 ? '228,198,108' : '118,234,212'},${particle.alpha})`;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    }
    if (!reduced.matches && visible && !document.hidden) frame = requestAnimationFrame(draw);
  }

  function resize() {
    const rect = root.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const dpr = Math.min(devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles.splice(0);
    const count = Math.min(240, Math.max(70, Math.floor(width * height / 9000)));
    for (let index = 0; index < count; index += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: .4 + Math.random() * 2.2,
        velocity: .04 + Math.random() * .16,
        alpha: .04 + Math.random() * .2,
        phase: Math.random() * Math.PI * 2
      });
    }
    draw(performance.now());
  }

  function syncMotion() {
    visible = root.classList.contains('active') && !document.hidden;
    if (!visible && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (visible && !frame) {
      frame = requestAnimationFrame(draw);
    }
  }

  new ResizeObserver(resize).observe(root);
  new MutationObserver(syncMotion).observe(root, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', syncMotion);
  reduced.addEventListener?.('change', syncMotion);
  resize();
  syncMotion();
}

function initRite(root) {
  const expected = [1, 2, 3];
  const cleared = [];
  const status = root.querySelector('[data-ash-threshold-status]');
  const enter = root.querySelector('[data-ash-threshold-enter]');
  const laws = [...root.querySelectorAll('[data-ash-law-step]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let entering = false;

  function reset(message) {
    cleared.splice(0);
    laws.forEach(law => law.classList.remove('cleared'));
    enter.setAttribute('aria-disabled', 'true');
    enter.tabIndex = -1;
    status.textContent = message;
  }

  laws.forEach(button => button.addEventListener('click', event => {
    const step = Number(button.dataset.ashLawStep);
    const wanted = expected[cleared.length];
    if (step !== wanted) {
      reset('The order broke. Arrival comes before boundary; boundary before custody.');
      return;
    }
    cleared.push(step);
    button.classList.add('cleared');
    status.textContent = step === 1
      ? 'Arrival remains unpersisted. Touch the boundary.'
      : step === 2
        ? 'Boundary observed. Touch custody.'
        : 'The three laws hold. Clear the Ash.';
    const ready = cleared.length === expected.length;
    enter.setAttribute('aria-disabled', String(!ready));
    enter.tabIndex = ready ? 0 : -1;
    if (!reduced) {
      const pulse = document.createElement('i');
      pulse.className = 'ash-threshold-pulse';
      pulse.style.left = `${event.clientX - 9}px`;
      pulse.style.top = `${event.clientY - 9}px`;
      document.body.append(pulse);
      setTimeout(() => pulse.remove(), 800);
    }
  }));

  enter.addEventListener('click', async event => {
    event.preventDefault();
    if (enter.getAttribute('aria-disabled') === 'true' || entering) return;
    entering = true;
    enter.setAttribute('aria-busy', 'true');
    status.textContent = 'Compiling readiness without custody...';
    try {
      const receipt = await compileReadinessReceipt({
        sourceSurface: 'dome-world-ash-threshold',
        artifactClass: 'unclassified',
        arrivalAcknowledged: true,
        boundaryAcknowledged: true,
        custodyAcknowledged: true,
        missingness: [
          'artifact metadata not yet supplied',
          'custody digest spine not yet verified',
          'case root not yet bound'
        ]
      });
      sessionStorage.setItem(READINESS_KEY, JSON.stringify(receipt));
      status.textContent = 'Readiness observed. Open the Keep.';
      location.assign(enter.href || KEEP_ROUTE);
    } catch (error) {
      entering = false;
      enter.removeAttribute('aria-busy');
      status.textContent = `Readiness held locally: ${error?.message || String(error)}`;
    }
  });
}

export function initAshThresholdMembranes(doc = document) {
  doc.querySelectorAll('[data-ash-threshold-membrane]').forEach(root => {
    if (root.dataset.ashThresholdReady === 'true') return;
    root.dataset.ashThresholdReady = 'true';
    initRite(root);
    initField(root);
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initAshThresholdMembranes(), { once: true });
  else initAshThresholdMembranes();
}
