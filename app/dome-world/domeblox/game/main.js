import { CANONICAL, G, buildWorldObjects, seedAnimals, saveState, exportState, message, writeStateSnapshot } from './core.js';
import { openRouteInNewTab } from './navigation.js';
import { resize, drawWorld, renderDiagnostics } from './render-centered.js';
import { update, findInteraction, interact, renderHud, toggleHud, toggleMap, closeSpringald, witnessSpringald, armSpringald, releaseSpringald, resetWorld } from './sim-responsive.js';

const CONTROLLED_KEYS = new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','e','m','h']);
const INTERACTIVE_SELECTOR = 'button,a,input,select,textarea,summary,[contenteditable="true"],[role="button"]';
const isInteractiveTarget = target => Boolean(target?.closest?.(INTERACTIVE_SELECTOR));

document.fonts?.load('48px "TD613 FlowCore"', CANONICAL).catch(() => {});
buildWorldObjects();
seedAnimals();
resize();
renderHud();
findInteraction();
if (!G.hudCollapsed) toggleHud();
addEventListener('resize', resize, { passive: true });
globalThis.visualViewport?.addEventListener('resize', resize, { passive: true });
addEventListener('orientationchange', () => setTimeout(resize, 80), { passive: true });

addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (key === 'escape') {
    G.keys.clear();
    if (G.springaldOpen) closeSpringald();
    else if (G.mapOpen) toggleMap();
    return;
  }
  if (isInteractiveTarget(event.target) || !CONTROLLED_KEYS.has(key)) return;
  event.preventDefault();
  G.keys.add(key);
  if ((key === 'e' || key === ' ') && !event.repeat) interact();
  if (key === 'm' && !event.repeat) toggleMap();
  if (key === 'h' && !event.repeat) toggleHud();
});
addEventListener('keyup', event => G.keys.delete(event.key.toLowerCase()));
G.canvas.addEventListener('pointerdown', () => G.canvas.focus());
G.ui.interactButton.addEventListener('click', interact);
G.ui.touchInteract.addEventListener('click', interact);
G.ui.enterGame.addEventListener('click', () => {
  G.running = true;
  G.ui.bootPanel.hidden = true;
  G.canvas.focus();
  resize();
  message('You enter Dome-World.');
});
G.ui.resetGame.addEventListener('click', () => { if (confirm('Reset the local Dome-World save?')) resetWorld(); });
G.ui.saveButton.addEventListener('click', () => saveState('manual'));
G.ui.exportButton.addEventListener('click', exportState);
G.ui.batteryButton.addEventListener('click', () => openRouteInNewTab('./forward-battery/'));
G.ui.toggleHud.addEventListener('click', toggleHud);
G.ui.closeMap.addEventListener('click', toggleMap);
G.ui.closeSpringald.addEventListener('click', closeSpringald);
G.ui.witnessSpringald.addEventListener('click', witnessSpringald);
G.ui.armSpringald.addEventListener('click', armSpringald);
G.ui.releaseSpringald.addEventListener('click', releaseSpringald);

let touchOrigin = null;
function updateTouch(event) {
  const touch = event.touches?.[0];
  if (!touch || !touchOrigin) return;
  const dx = touch.clientX - touchOrigin.x;
  const dy = touch.clientY - touchOrigin.y;
  const length = Math.hypot(dx, dy);
  const max = 31;
  G.pointer.x = Math.max(-1, Math.min(1, dx / max));
  G.pointer.y = Math.max(-1, Math.min(1, dy / max));
  if (length > max) { G.pointer.x = dx / length; G.pointer.y = dy / length; }
  G.ui.touchStick.style.transform = `translate(${G.pointer.x * max}px,${G.pointer.y * max}px)`;
}
function releaseTouch() {
  touchOrigin = null;
  G.pointer.active = false;
  G.pointer.x = 0;
  G.pointer.y = 0;
  G.ui.touchStick.style.transform = '';
}
G.ui.touchPad.addEventListener('touchstart', event => {
  const rect = G.ui.touchPad.getBoundingClientRect();
  touchOrigin = { x:rect.left + rect.width / 2, y:rect.top + rect.height / 2 };
  G.pointer.active = true;
  updateTouch(event);
}, { passive:false });
G.ui.touchPad.addEventListener('touchmove', event => { event.preventDefault(); updateTouch(event); }, { passive:false });
G.ui.touchPad.addEventListener('touchend', releaseTouch);
G.ui.touchPad.addEventListener('touchcancel', releaseTouch);
addEventListener('blur', () => { G.keys.clear(); releaseTouch(); });

document.addEventListener('visibilitychange', () => { if (document.hidden) writeStateSnapshot(); });
addEventListener('pagehide', () => writeStateSnapshot());
addEventListener('beforeunload', () => writeStateSnapshot());

function frame(time) {
  const delta = Math.min(.05, (time - G.lastFrame) / 1000);
  G.lastFrame = time;
  update(delta);
  drawWorld();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.TD613_DOME_BLOX_GAME = Object.freeze({
  version:'1.2.2',
  canonical:CANONICAL,
  save:() => saveState('api'),
  snapshot:() => structuredClone(G.state),
  renderDiagnostics,
  enter:() => G.ui.enterGame.click(),
  interact,
});
