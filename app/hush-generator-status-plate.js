const TD613_HUSH_GENERATOR_STATUS_PLATE_VERSION = 'generator-status-plate/v1';

function byId(id) {
  return document.getElementById(id);
}

function actionGateHost() {
  return byId('hushGateStrip') || byId('generateMaskedOutputBtn')?.closest('.hush-transform-gate') || null;
}

function stylePlate(plate) {
  if (!plate) return;
  plate.classList.add('hush-warning-panel', 'hush-generator-status', 'hush-transmission-plate');
  plate.style.setProperty('display', 'block', 'important');
  plate.style.setProperty('position', 'relative', 'important');
  plate.style.setProperty('width', '100%', 'important');
  plate.style.setProperty('box-sizing', 'border-box', 'important');
  plate.style.setProperty('margin', '.62rem 0 .42rem', 'important');
  plate.style.setProperty('padding', '.76rem .92rem .76rem 1.05rem', 'important');
  plate.style.setProperty('border', '1px solid rgba(137,255,240,.24)', 'important');
  plate.style.setProperty('border-left', '4px solid rgba(137,255,240,.88)', 'important');
  plate.style.setProperty('border-radius', '16px', 'important');
  plate.style.setProperty('background', 'linear-gradient(135deg,rgba(3,9,20,.88),rgba(10,7,22,.78))', 'important');
  plate.style.setProperty('box-shadow', 'inset 0 1px 0 rgba(255,255,255,.06),0 0 18px rgba(137,255,240,.08)', 'important');
  plate.style.setProperty('color', 'rgba(226,255,236,.92)', 'important');
  plate.style.setProperty('font-size', 'clamp(.82rem,2.7vw,1rem)', 'important');
  plate.style.setProperty('line-height', '1.35', 'important');
  plate.style.setProperty('letter-spacing', '.025em', 'important');
  plate.style.setProperty('white-space', 'normal', 'important');
  plate.style.setProperty('overflow-wrap', 'anywhere', 'important');
}

function ensureStatusPlate(message = 'Strict provider bridge ready.') {
  const host = actionGateHost();
  let plate = byId('hushGeneratorStatus') || byId('hushStrictProviderStatus');
  if (!plate) {
    plate = document.createElement('div');
    plate.id = 'hushGeneratorStatus';
    plate.setAttribute('aria-live', 'polite');
  }
  if (plate.id !== 'hushGeneratorStatus') plate.id = 'hushGeneratorStatus';
  stylePlate(plate);
  if (!plate.textContent.trim()) plate.textContent = message;
  if (host?.id === 'hushGateStrip') {
    if (plate.nextElementSibling !== host) host.insertAdjacentElement('beforebegin', plate);
  } else if (host && !host.contains(plate)) {
    host.appendChild(plate);
  }
  return plate;
}

function setStatusPlate(message = '', tone = 'info') {
  const plate = ensureStatusPlate();
  plate.dataset.tone = tone || 'info';
  if (message) plate.textContent = message;
  if (tone === 'ok') {
    plate.style.setProperty('border-left-color', 'rgba(49,255,138,.88)', 'important');
    plate.style.setProperty('box-shadow', 'inset 0 1px 0 rgba(255,255,255,.06),0 0 18px rgba(49,255,138,.12)', 'important');
  } else if (tone === 'error' || tone === 'warning') {
    plate.style.setProperty('border-left-color', 'rgba(255,194,104,.88)', 'important');
    plate.style.setProperty('box-shadow', 'inset 0 1px 0 rgba(255,255,255,.06),0 0 18px rgba(255,194,104,.12)', 'important');
  } else {
    plate.style.setProperty('border-left-color', 'rgba(137,255,240,.88)', 'important');
    plate.style.setProperty('box-shadow', 'inset 0 1px 0 rgba(255,255,255,.06),0 0 18px rgba(137,255,240,.08)', 'important');
  }
  return plate;
}

function boot() {
  ensureStatusPlate();
  window.setTimeout(() => ensureStatusPlate(), 120);
  window.setTimeout(() => ensureStatusPlate(), 520);
  window.setTimeout(() => ensureStatusPlate(), 1200);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
window.addEventListener('load', () => window.setTimeout(boot, 120));
window.__TD613_HUSH_GENERATOR_STATUS_PLATE__ = { version: TD613_HUSH_GENERATOR_STATUS_PLATE_VERSION, ensure: ensureStatusPlate, set: setStatusPlate };
