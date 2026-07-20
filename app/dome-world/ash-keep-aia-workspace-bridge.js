const LEGACY = new URLSearchParams(location.search).get('presentation') === 'legacy';
const POINTER_KEY = 'td613.ash-keep.current-case';
let railObserver = null;

function caseOpen() {
  try { return Boolean(window.__td613AshKeep?.current?.().case_id || localStorage.getItem(POINTER_KEY)); }
  catch { return Boolean(window.__td613AshKeep?.current?.().case_id); }
}

function railIsRestored(rail) {
  return rail?.style.getPropertyValue('display') === 'grid'
    && rail.style.getPropertyPriority('display') === 'important'
    && rail.style.getPropertyValue('min-height') === '54px'
    && rail.style.getPropertyValue('max-height') === 'none';
}

function composeExactWork(open) {
  const main = document.querySelector('body > main');
  const rail = document.querySelector('body > .workspace-rail');
  if (!main || !rail) return;
  if (open) {
    main.style.setProperty('display', 'block', 'important');
    rail.style.setProperty('display', 'grid', 'important');
    rail.style.setProperty('min-height', '54px', 'important');
    rail.style.setProperty('max-height', 'none', 'important');
    rail.style.setProperty('opacity', '1', 'important');
    rail.dataset.ashAiaExactNavigation = 'RESTORED_FOR_OPEN_CASE';
  } else if (rail.dataset.ashAiaExactNavigation === 'RESTORED_FOR_OPEN_CASE') {
    main.style.removeProperty('display');
    for (const property of ['display', 'min-height', 'max-height', 'opacity']) rail.style.removeProperty(property);
    delete rail.dataset.ashAiaExactNavigation;
  }
  if (!railObserver) {
    railObserver = new MutationObserver(() => {
      if (caseOpen() && !railIsRestored(rail)) queueMicrotask(sync);
    });
    railObserver.observe(rail, { attributes: true, attributeFilter: ['style'] });
  }
}

function sync() {
  if (LEGACY) return;
  const launch = document.getElementById('launch');
  const slot = document.querySelector('[data-aia-ingress-slot]');
  if (!launch || !slot || !window.__td613AshLiveAIA) return;
  if (!slot.contains(launch)) slot.append(launch);
  const open = caseOpen();
  if (open) launch.classList.add('hidden');
  else launch.classList.remove('hidden');
  composeExactWork(open);
  document.body.dataset.ashAiaCaseOpen = String(open);
  document.documentElement.dataset.ashAiaIngress = 'INTEGRATED_EXACT_CONTROLS';
}

function show() {
  if (LEGACY) return;
  sync();
  const launch = document.getElementById('launch');
  if (!caseOpen()) launch?.classList.remove('hidden');
  document.querySelector('[data-aia-ingress-slot]')?.scrollIntoView({
    block: 'center',
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  });
  setTimeout(() => document.getElementById('newTitle')?.focus(), 100);
}

async function boot() {
  if (LEGACY) return;
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (window.__td613AshLiveAIA && document.querySelector('[data-aia-ingress-slot]') && document.getElementById('launch')) {
      window.__td613AshAIAIngress = Object.freeze({
        version: 'td613.ash.aia-ingress/v0.2-task-continuity',
        refresh: sync,
        show
      });
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
