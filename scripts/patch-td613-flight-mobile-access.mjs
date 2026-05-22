import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const switcherEnd = html.indexOf('</nav>', html.indexOf('mobile-flight-switcher'));
if (switcherEnd !== -1 && !html.includes('mobileSwipeCue')) {
  const cue = '\n<div class="mobile-swipe-cue" id="mobileSwipeCue" aria-hidden="true"><span>Swipe right</span><strong>→ Sealed Output</strong></div>';
  html = html.slice(0, switcherEnd + '</nav>'.length) + cue + html.slice(switcherEnd + '</nav>'.length);
}

const css = `
/* === TD613 Flight mobile lane access override === */
@media (max-width: 820px) {
  html, body {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 100dvh !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }
  body.flight-locked, body {
    touch-action: pan-y !important;
    overscroll-behavior-y: auto !important;
  }
  .page-wrap {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 100dvh !important;
    margin: 0 !important;
    padding: .42rem .42rem 2.7rem !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: visible !important;
  }
  header {
    width: 100% !important;
    max-width: 100% !important;
    padding: .58rem .72rem .62rem !important;
    overflow: hidden !important;
  }
  .grid {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    overflow: visible !important;
    scroll-snap-type: none !important;
  }
  .grid > div:first-child,
  .grid > div:last-child {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    padding: .16rem .44rem 3rem .58rem !important;
    scroll-snap-align: none !important;
  }
  body:not(.flight-output-active) .flight-lane-output { display: none !important; }
  body.flight-output-active .flight-lane-prompt { display: none !important; }
  body.flight-output-active .flight-lane-output { display: block !important; }
  .card,
  .output-card,
  .seal-card,
  .dev-drawer {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
    transform: none !important;
    contain: none !important;
  }
  .card {
    padding: .72rem .68rem .74rem .94rem !important;
    margin-bottom: .48rem !important;
  }
  .card::before { left: .44rem !important; }
  .section-note,
  .danger-note,
  .row,
  .checkbox-row,
  .radio-row,
  .section-split-row,
  .copy-grid {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }
  .section-split-row { display: block !important; }
  .section-split-row > div { margin-bottom: .45rem !important; }
  textarea,
  input,
  select,
  button { max-width: 100% !important; }
  .mobile-output-cue { display: none !important; }
  .mobile-lane-tab[data-flight-lane-target="output"] {
    border-color: rgba(49,255,138,.88) !important;
    box-shadow: 0 0 34px rgba(49,255,138,.28), inset 0 1px 0 rgba(245,255,246,.14) !important;
  }
  body:not(.flight-output-active) .mobile-lane-tab[data-flight-lane-target="output"] {
    animation: sealedOutputBlinkStrong 1.05s ease-in-out infinite !important;
  }
  .mobile-swipe-cue {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: .42rem !important;
    width: calc(100% - .28rem) !important;
    margin: -.1rem .14rem .28rem !important;
    padding: .22rem .42rem !important;
    border: 1px solid rgba(49,255,138,.48) !important;
    border-radius: 999px !important;
    background: rgba(0,9,8,.72) !important;
    color: var(--moss) !important;
    font-family: var(--font-mono) !important;
    letter-spacing: .13em !important;
    text-transform: uppercase !important;
    pointer-events: none !important;
    box-shadow: 0 0 22px rgba(49,255,138,.18), inset 0 1px 0 rgba(245,255,246,.08) !important;
    animation: mobileSwipeCue 1.15s ease-in-out infinite !important;
  }
  .mobile-swipe-cue span { font-size: .34rem !important; color: rgba(190,255,223,.72) !important; }
  .mobile-swipe-cue strong { font-size: .42rem !important; color: var(--moss) !important; white-space: nowrap !important; }
  body.flight-output-active .mobile-swipe-cue { display: none !important; }
  .mobile-prompt-rail { margin: .18rem 0 .44rem !important; padding: .28rem .44rem !important; min-height: 1.72rem !important; border-radius: 14px !important; }
  .output { min-height: 4.1rem !important; height: clamp(4.2rem, 14dvh, 5.6rem) !important; max-height: 16dvh !important; overflow-y: auto !important; }
}
@keyframes sealedOutputBlinkStrong { 0%,100% { box-shadow: 0 0 18px rgba(49,255,138,.20), inset 0 1px 0 rgba(245,255,246,.10); } 50% { box-shadow: 0 0 46px rgba(49,255,138,.56), 0 0 18px rgba(137,255,240,.28), inset 0 1px 0 rgba(245,255,246,.20); } }
@keyframes mobileSwipeCue { 0%,100% { transform: translateX(0); opacity: .84; } 50% { transform: translateX(9px); opacity: 1; } }
`;

if (!html.includes('TD613 Flight mobile lane access override')) {
  html = html.replace('</style>', `${css}\n</style>`);
}

const js = `
<script id="td613-flight-mobile-lane-access-script">
(function () {
  function setLane(target) {
    var output = target === 'output';
    document.body.classList.toggle('flight-output-active', output);
    document.querySelectorAll('[data-flight-lane-target]').forEach(function (el) {
      var active = el.getAttribute('data-flight-lane-target') === target;
      el.classList.toggle('is-active', active);
      if (el.classList.contains('mobile-lane-tab')) el.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    var grid = document.querySelector('.grid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-flight-lane-target]');
    if (!trigger || trigger.classList.contains('mobile-swipe-cue')) return;
    var target = trigger.getAttribute('data-flight-lane-target');
    if (target === 'prompt' || target === 'output') {
      event.preventDefault();
      setLane(target);
    }
  });
  window.TD613FlightSetLane = setLane;
})();
</script>`;

if (!html.includes('td613-flight-mobile-lane-access-script')) {
  html = html.replace('</body>', `${js}\n</body>`);
}

if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) throw new Error('wrapper regression detected');
if (!html.includes('mobileSwipeCue')) throw new Error('swipe cue missing');
if (!html.includes('TD613FlightSetLane')) throw new Error('lane switch handler missing');
if (!html.includes('min-width: 0 !important')) throw new Error('desktop min-width override missing');
if (!html.includes('body:not(.flight-output-active) .flight-lane-output')) throw new Error('mobile lane toggle CSS missing');
if (!html.includes('pointer-events: none !important')) throw new Error('cue must be non-interactive');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight mobile lane access');
