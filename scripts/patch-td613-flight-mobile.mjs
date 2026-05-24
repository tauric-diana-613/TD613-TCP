import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const railStart = html.indexOf('<button class="mobile-prompt-rail"');
let rail = '<button class="mobile-prompt-rail" data-flight-lane-target="output" type="button"><span>Seal payload to begin Flight</span><span class="mobile-prompt-rail-pill">Sealed Output &rarr;</span></button>';
if (railStart !== -1) {
  const railEnd = html.indexOf('</button>', railStart) + '</button>'.length;
  rail = html.slice(railStart, railEnd);
  html = html.slice(0, railStart) + html.slice(railEnd);
}

const devIndex = html.indexOf('<details class="dev-drawer" id="devSettingsDrawer"');
if (devIndex !== -1) {
  const dividerIndex = html.lastIndexOf('<div class="dev-divider"', devIndex);
  const insertAt = dividerIndex !== -1 && devIndex - dividerIndex < 500 ? dividerIndex : devIndex;
  html = html.slice(0, insertAt) + rail + '\n' + html.slice(insertAt);
}

html = html
  .replace(/>\s*Copy from output\s*<\/button>/gi, '>Copy</button>')
  .replace(/>\s*Clear output\s*<\/button>/gi, '>Clear</button>')
  .replaceAll('Copy from output', 'Copy')
  .replaceAll('COPY FROM OUTPUT', 'Copy')
  .replaceAll('Clear output', 'Clear')
  .replaceAll('CLEAR OUTPUT', 'Clear');

const css = `
/* === TD613 Flight direct mobile layout fix === */
@media (max-width: 820px) {
  .page-wrap { padding: .42rem !important; gap: .34rem !important; }
  .grid { gap: .16rem !important; scroll-padding-inline: 0 !important; overflow: visible !important; }
  .grid > div:first-child,
  .grid > div:last-child { flex: 0 0 100% !important; width: 100% !important; min-width: 100% !important; max-width: 100% !important; padding: .16rem .58rem 3rem !important; overflow: visible !important; }
  .card { padding: .58rem .6rem .62rem .9rem !important; border-radius: 14px !important; overflow: visible !important; }
  .card::before { left: .44rem !important; }
  .mobile-prompt-rail { margin: .18rem 0 .34rem !important; padding: .28rem .44rem !important; min-height: 1.78rem !important; border-radius: 14px !important; gap: .3rem !important; }
  .mobile-prompt-rail span:first-child { font-size: .42rem !important; line-height: 1.08 !important; letter-spacing: .12em !important; }
  .mobile-prompt-rail-pill { padding: .12rem .28rem !important; font-size: .32rem !important; white-space: nowrap !important; }
  .dev-divider { margin: .34rem 0 .28rem !important; padding-top: .34rem !important; }
  .btn { min-height: 1.32rem !important; padding: .1rem .32rem !important; font-size: .39rem !important; letter-spacing: .08em !important; }
  .row { gap: .16rem !important; }
  .output-card { padding: .56rem .6rem .62rem .9rem !important; border-radius: 16px !important; }
  .output-card h2 { font-size: .66rem !important; margin-bottom: .16rem !important; }
  .output-card .module-marker { margin-bottom: .2rem !important; }
  .output { min-height: 4.1rem !important; height: clamp(4.2rem, 14dvh, 5.6rem) !important; max-height: 16dvh !important; overflow-y: auto !important; resize: vertical !important; padding: .5rem .54rem !important; font-size: .61rem !important; line-height: 1.36 !important; }
  .status-bar { align-items: center !important; gap: .16rem !important; margin-top: .16rem !important; font-size: .39rem !important; }
  .output-auth-toggle { margin-left: auto !important; gap: .12rem !important; font-size: .35rem !important; }
  .output-auth-toggle input[type="checkbox"] { width: .64rem !important; height: .64rem !important; }
  .output-toolbar { flex-direction: row !important; align-items: center !important; justify-content: space-between !important; gap: .18rem !important; margin-top: .2rem !important; padding-top: .18rem !important; }
  .output-toolbar .row { width: auto !important; gap: .14rem !important; flex: 0 1 auto !important; }
  .output-toolbar .row .btn { flex: 0 0 auto !important; min-height: 1.28rem !important; padding: .08rem .3rem !important; font-size: .38rem !important; }
  .payload-stepper { align-self: auto !important; margin-left: 0 !important; padding: 0 !important; gap: .05rem !important; border: 0 !important; background: transparent !important; clip-path: none !important; box-shadow: none !important; }
  .payload-stepper-label { display: none !important; }
  .payload-stepper-value { min-width: .62rem !important; font-size: .42rem !important; }
  .payload-stepper-btn { width: .9rem !important; min-width: .9rem !important; height: .9rem !important; border: 0 !important; background: transparent !important; box-shadow: none !important; font-size: .62rem !important; }
  .seal-card { margin-top: .3rem !important; padding: .6rem .6rem .66rem .9rem !important; border-radius: 16px !important; }
  .seal-card h2 { font-size: .68rem !important; }
}
`;

if (!html.includes('TD613 Flight direct mobile layout fix')) {
  html = html.replace('</style>', `${css}\n</style>`);
}

if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) {
  throw new Error('wrapper regression detected');
}
if (!(html.indexOf('mobile-prompt-rail') < html.indexOf('devSettingsDrawer'))) {
  throw new Error('mobile rail order patch failed');
}
if (!html.includes('>Copy</button>') || !html.includes('>Clear</button>')) {
  throw new Error('output control labels were not tightened');
}
if (html.includes('Copy from output') || html.includes('COPY FROM OUTPUT') || html.includes('Clear output') || html.includes('CLEAR OUTPUT')) {
  throw new Error('long output control labels remain');
}
if (!html.includes('14dvh') || !html.includes('max-height: 16dvh')) {
  throw new Error('mobile output height patch missing');
}

fs.writeFileSync(path, html);
console.log('patched TD613 Flight mobile layout directly');

await import('./patch-td613-flight-mobile-access.mjs');
await import('./patch-td613-flight-mobile-viewport.mjs');
await import('./patch-td613-flight-mobile-interaction-guard.mjs');
await import('./patch-td613-flight-mobile-pr71.mjs');
await import('./patch-td613-flight-mobile-pr73.mjs');
await import('./patch-td613-flight-mobile-pr74.mjs');
await import('./patch-td613-flight-mobile-pr75.mjs');