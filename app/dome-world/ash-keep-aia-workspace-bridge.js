const LEGACY = new URLSearchParams(location.search).get('presentation') === 'legacy';
const POINTER_KEY = 'td613.ash-keep.current-case';

function caseOpen() {
  try { return Boolean(window.__td613AshKeep?.current?.().case_id || localStorage.getItem(POINTER_KEY)); }
  catch { return Boolean(window.__td613AshKeep?.current?.().case_id); }
}

function sync() {
  if (LEGACY) return;
  const launch = document.getElementById('launch');
  const slot = document.querySelector('[data-aia-ingress-slot]');
  if (!launch || !slot || !window.__td613AshLiveAIA) return;
  if (!slot.contains(launch)) slot.append(launch);
  if (caseOpen()) launch.classList.add('hidden');
  else launch.classList.remove('hidden');
  document.body.dataset.ashAiaCaseOpen = String(caseOpen());
  document.documentElement.dataset.ashAiaIngress = 'INTEGRATED_EXACT_CONTROLS';
}

function show() {
  if (LEGACY) return;
  sync();
  const launch = document.getElementById('launch');
  if (!caseOpen()) launch?.classList.remove('hidden');
  document.querySelector('[data-aia-ingress-slot]')?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  setTimeout(() => document.getElementById('newTitle')?.focus(), 100);
}

async function boot() {
  if (LEGACY) return;
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (window.__td613AshLiveAIA && document.querySelector('[data-aia-ingress-slot]') && document.getElementById('launch')) {
      window.__td613AshAIAIngress = Object.freeze({ version: 'td613.ash.aia-ingress/v0.2-task-continuity', refresh: sync, show });
      sync();
      for (const type of ['case-opened', 'case-created', 'profile-demo-hydrated', 'capsule-opened', 'case-closed', 'lifecycle-updated']) {
        window.addEventListener(`td613:ash:${type}`, () => setTimeout(sync, 0));
      }
      window.addEventListener('td613:ash:aia-ready', sync);
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  console.error('Ash AIA ingress bridge held: exact launch or task membrane unavailable. Legacy ingress remains untouched.');
}

boot();
