import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const viewport = '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover" />';
if (html.includes('<meta name="viewport"')) html = html.replace(/<meta name="viewport"[^>]*>/i, viewport);
else html = html.replace('<head>', `<head>\n${viewport}`);

const css = `
/* === TD613 Flight PR73 mobile finale === */
@media (max-width: 820px) {
  html, body { overscroll-behavior: none !important; -webkit-text-size-adjust: 100% !important; }
  .grid {
    transition: transform .68s cubic-bezier(.18,.82,.16,1) !important;
    will-change: transform !important;
    backface-visibility: hidden !important;
    transform-style: preserve-3d !important;
  }
  body.flight-dragging .grid { transition: none !important; }
  textarea,
  input,
  select,
  .output,
  #taskText {
    font-size: 16px !important;
    line-height: 1.12 !important;
    -webkit-text-size-adjust: 100% !important;
    touch-action: manipulation !important;
    zoom: .68 !important;
  }
  #taskText,
  .output {
    min-height: 5.65rem !important;
    height: clamp(5.8rem, 18dvh, 7.2rem) !important;
    max-height: 20dvh !important;
    padding: .58rem .62rem !important;
  }
  button,
  .btn,
  .primary,
  .secondary,
  .ghost,
  .mobile-lane-tab,
  .mobile-prompt-rail,
  .payload-stepper-btn {
    min-height: .98rem !important;
    padding: .05rem .24rem !important;
    font-size: .31rem !important;
    line-height: 1.05 !important;
    letter-spacing: .07em !important;
    border-radius: 9px !important;
  }
  .mobile-lane-tab { min-height: 1.05rem !important; }
  .mobile-prompt-rail { min-height: 1.22rem !important; justify-content: flex-start !important; gap: .22rem !important; }
  .mobile-prompt-rail span:first-child { font-size: .32rem !important; }
  .mobile-prompt-rail-pill { font-size: .26rem !important; padding: .07rem .18rem !important; }
  .payload-stepper { justify-content: flex-start !important; margin-left: 0 !important; gap: .02rem !important; }
  .payload-stepper-value { font-size: .32rem !important; min-width: .48rem !important; text-align: left !important; }
  .payload-stepper-btn { width: .66rem !important; min-width: .66rem !important; height: .66rem !important; }
  input[type="checkbox"],
  input[type="radio"] {
    width: .46rem !important;
    height: .46rem !important;
    min-width: .46rem !important;
    margin: 0 .18rem 0 0 !important;
    flex: 0 0 .46rem !important;
    align-self: center !important;
    justify-self: start !important;
    transform: none !important;
    zoom: 1 !important;
  }
  label:has(input[type="checkbox"]),
  label:has(input[type="radio"]),
  .output-auth-toggle,
  .checkbox-row,
  .radio-row {
    justify-content: flex-start !important;
    align-items: center !important;
    text-align: left !important;
    gap: .16rem !important;
  }
  .output-auth-toggle { margin-left: 0 !important; font-size: .28rem !important; }
  .status-bar { justify-content: flex-start !important; gap: .12rem !important; }
  .output-toolbar { gap: .12rem !important; }
  .output-toolbar .row .btn { min-height: .96rem !important; padding: .05rem .22rem !important; font-size: .3rem !important; }
}
`;

if (!html.includes('TD613 Flight PR73 mobile finale')) html = html.replace('</style>', `${css}\n</style>`);

const script = `
<script id="td613-flight-pr73-mobile-finale-script">
(function () {
  var viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    document.head.appendChild(viewport);
  }
  viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover');
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (type) {
    document.addEventListener(type, function (event) { if (event.cancelable) event.preventDefault(); }, { capture: true, passive: false });
  });
  var lastTouchEnd = 0;
  document.addEventListener('touchend', function (event) {
    var now = Date.now();
    if (now - lastTouchEnd <= 320 && event.cancelable) event.preventDefault();
    lastTouchEnd = now;
  }, { capture: true, passive: false });
  document.addEventListener('dblclick', function (event) { if (event.cancelable) event.preventDefault(); }, { capture: true, passive: false });
})();
</script>`;
html = html.replace(/<script id="td613-flight-pr73-mobile-finale-script">[\s\S]*?<\/script>/g, '');
html = html.replace('</body>', `${script}\n</body>`);

let pr71 = html.match(/<script id="td613-flight-pr71-mobile-polish-script">[\s\S]*?<\/script>/)?.[0];
if (pr71) {
  pr71 = pr71
    .replace('function setLane(target) {', `function settleLane(target, currentPx) {
    var output = target === 'output';
    var grid = document.querySelector('.grid');
    var destination = output ? -width() : 0;
    document.body.classList.remove('flight-dragging');
    document.body.classList.toggle('flight-output-active', output);
    document.querySelectorAll('[data-flight-lane-target]').forEach(function (el) {
      var isActive = el.getAttribute('data-flight-lane-target') === target;
      el.classList.toggle('is-active', isActive);
      if (el.classList.contains('mobile-lane-tab')) el.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    if (grid) {
      if (Number.isFinite(currentPx)) grid.style.setProperty('--flight-lane-x', currentPx + 'px');
      window.requestAnimationFrame(function () { grid.style.setProperty('--flight-lane-x', destination + 'px'); });
      window.setTimeout(function () { grid.style.removeProperty('--flight-lane-x'); }, 720);
    }
  }
  function setLane(target) {`)
    .replace(`    var grid = document.querySelector('.grid');
    if (grid) grid.style.removeProperty('--flight-lane-x');
    document.body.classList.remove('flight-dragging');`, `    var grid = document.querySelector('.grid');
    if (grid) grid.style.removeProperty('--flight-lane-x');
    document.body.classList.remove('flight-dragging');`)
    .replace(`    document.body.classList.remove('flight-dragging');
    grid.style.removeProperty('--flight-lane-x');
    if (!active && (!quick || Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.3)) return;
    if (dx < -42) setLane('output');
    else if (dx > 42) setLane('prompt');`, `    var current = base() + dx;
    if (!active && (!quick || Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.3)) { settleLane(document.body.classList.contains('flight-output-active') ? 'output' : 'prompt', current); return; }
    if (dx < -42) settleLane('output', current);
    else if (dx > 42) settleLane('prompt', current);
    else settleLane(document.body.classList.contains('flight-output-active') ? 'output' : 'prompt', current);`);
  html = html.replace(/<script id="td613-flight-pr71-mobile-polish-script">[\s\S]*?<\/script>/, pr71);
}

if (!html.includes('TD613 Flight PR73 mobile finale')) throw new Error('PR73 finale CSS missing');
if (!html.includes('maximum-scale=1') || !html.includes('user-scalable=no')) throw new Error('PR73 zoom lock missing');
if (!html.includes('zoom: .68 !important')) throw new Error('PR73 visual mini field scale missing');
if (!html.includes('font-size: 16px !important')) throw new Error('PR73 iOS focus zoom guard missing');
if (!html.includes('min-height: .98rem !important')) throw new Error('PR73 mini button controls missing');
if (!html.includes('input[type="checkbox"]')) throw new Error('PR73 mini toggle controls missing');
if (!html.includes('justify-content: flex-start !important')) throw new Error('PR73 left-hug control alignment missing');
if (!html.includes('transition: transform .68s')) throw new Error('PR73 slower snap transition missing');
if (!html.includes('settleLane')) throw new Error('PR73 thumb-tracking settle override missing');
if (!html.includes('gesturestart')) throw new Error('PR73 gesture zoom guard missing');
if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) throw new Error('wrapper regression detected');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR73 mobile finale');
