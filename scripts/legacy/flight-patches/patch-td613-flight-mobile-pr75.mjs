import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const css = `
/* === TD613 Flight PR75 mobile lane recovery ===
   Source of the break: PR73 translated each lane while PR74 also translated
   the grid. On Output that double-shift pushed every Output card offscreen.
   This final layer keeps one captain: the grid translates, the lanes do not. */
@media (max-width: 820px) {
  .grid {
    --td613-flight-lane-x: 0px;
    display: flex !important;
    flex-direction: row !important;
    width: 100vw !important;
    max-width: 100vw !important;
    min-width: 0 !important;
    overflow: hidden !important;
    scroll-snap-type: none !important;
    scroll-behavior: auto !important;
    -webkit-overflow-scrolling: auto !important;
    touch-action: pan-y !important;
    transform: translate3d(var(--td613-flight-lane-x), 0, 0) !important;
    transition: transform .30s cubic-bezier(.18,.78,.2,1) !important;
    will-change: transform !important;
  }

  html[data-flight-mobile-lane="output"] .grid {
    --td613-flight-lane-x: -100vw;
  }

  body.flight-dragging .grid {
    transition: none !important;
  }

  .grid > .flight-lane,
  html[data-flight-mobile-lane="output"] .grid > .flight-lane,
  .grid > .flight-lane-prompt,
  .grid > .flight-lane-output,
  html[data-flight-mobile-lane="output"] .grid > .flight-lane-prompt,
  html[data-flight-mobile-lane="output"] .grid > .flight-lane-output {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    transform: none !important;
  }

  .grid > .flight-lane-prompt,
  .grid > .flight-lane-output {
    flex: 0 0 100vw !important;
    width: 100vw !important;
    min-width: 100vw !important;
    max-width: 100vw !important;
    height: 100% !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    scroll-snap-align: none !important;
    padding: .2rem .18rem 4.9rem !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .grid > :not(.flight-lane-prompt):not(.flight-lane-output) {
    display: none !important;
  }

  .flight-lane-output,
  .flight-lane-output .output-card,
  .flight-lane-output .seal-card,
  .flight-lane-output .copy-bin-card,
  .flight-lane-output .dev-drawer,
  .flight-lane-output .card,
  .flight-lane-output textarea,
  .flight-lane-output button {
    visibility: visible !important;
    opacity: 1 !important;
  }

  .mobile-prompt-rail,
  .mobile-prompt-rail.mobile-prompt-rail-top,
  .mobile-prompt-rail.is-docked {
    position: static !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    z-index: 2 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: flex-end !important;
    width: auto !important;
    max-width: 100% !important;
    margin: .72rem 0 .62rem auto !important;
    padding: .3rem .42rem .3rem .62rem !important;
    border-radius: 999px !important;
    gap: .38rem !important;
    float: none !important;
    text-align: right !important;
    box-shadow: 0 10px 30px rgba(0,0,0,.38), 0 0 18px rgba(255,193,90,.10), inset 0 1px 0 rgba(255,239,196,.08) !important;
  }

  .mobile-prompt-rail:not(.mobile-prompt-rail-top) {
    display: none !important;
  }

  html[data-flight-mobile-lane="output"] .mobile-prompt-rail,
  body.flight-output-active .mobile-prompt-rail {
    display: none !important;
  }

  .mobile-prompt-rail span:first-child {
    font-size: .38rem !important;
    white-space: nowrap !important;
    text-align: right !important;
  }

  .mobile-prompt-rail-pill {
    padding: .14rem .28rem !important;
    font-size: .3rem !important;
    white-space: nowrap !important;
  }

  .dev-drawer {
    margin-bottom: .72rem !important;
  }

  .output-toolbar {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: .2rem !important;
  }

  .output-toolbar .row {
    width: auto !important;
    flex: 0 1 auto !important;
  }

  .output-toolbar .row .btn {
    flex: 0 0 auto !important;
    width: auto !important;
    min-width: 0 !important;
  }

  .payload-stepper {
    align-self: center !important;
    margin-left: auto !important;
  }
}
`;

html = html.replace(/\n\/\* === TD613 Flight PR75 mobile lane recovery ===[\s\S]*?(?=\n@media \(prefers-reduced-motion: reduce\)|\n<\/style>)/m, '');
html = html.replace('</style>', `${css}\n</style>`);

if (!html.includes('TD613 Flight PR75 mobile lane recovery')) throw new Error('PR75 recovery CSS missing');
if (!html.includes('html[data-flight-mobile-lane="output"] .grid > .flight-lane-output')) throw new Error('PR75 output-lane neutralizer missing');
if (!html.includes('position: static !important')) throw new Error('PR75 inline seal rail positioning missing');
if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) throw new Error('wrapper regression detected');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR75 mobile lane recovery');
