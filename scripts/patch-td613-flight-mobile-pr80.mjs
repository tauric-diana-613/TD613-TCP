import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const sentinel = 'PR80_SENTINEL TD613 Flight PR80 mobile chrome restoration';
html = html.replace(/\n\/\* PR80_SENTINEL TD613 Flight PR80 mobile chrome restoration \*\/[\s\S]*?(?=\n<\/style>)/m, '');
html = html.replace(/\n\/\* === TD613 Flight PR80 mobile chrome restoration === \*\/[\s\S]*?(?=\n<\/style>)/m, '');

const css = `
/* PR80_SENTINEL TD613 Flight PR80 mobile chrome restoration */
@media (max-width: 820px) {
  html body .page-wrap header { position: relative !important; grid-template-areas: "title" "text" "tags" "howto" !important; padding: .58rem !important; overflow: hidden !important; }
  html body .page-wrap header h1 { font-size: clamp(1.05rem, 6.8vw, 1.72rem) !important; line-height: .98 !important; }
  html body .page-wrap header .flight-quick-nav { position: absolute !important; top: 3.42rem !important; right: .58rem !important; left: auto !important; display: flex !important; justify-content: flex-end !important; align-items: center !important; gap: .16rem !important; width: auto !important; max-width: 78% !important; padding: 0 !important; margin: 0 !important; overflow: visible !important; }
  html body .page-wrap header .flight-quick-nav > a, html body .page-wrap header .flight-quick-nav > button { width: auto !important; min-width: 0 !important; min-height: .78rem !important; padding: .08rem .22rem !important; border: 1px solid rgba(137,255,240,.30) !important; border-radius: 7px !important; background: linear-gradient(180deg, rgba(9,42,38,.74), rgba(2,14,14,.90)) !important; box-shadow: inset 0 1px 0 rgba(245,255,246,.08), 0 0 12px rgba(49,255,138,.06) !important; font-size: .27rem !important; white-space: nowrap !important; }
  html body .page-wrap header .flight-quick-nav > .flight-nav-signout { min-height: auto !important; padding: .04rem .02rem !important; border: 0 !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important; font-size: .25rem !important; }
  html body .page-wrap header .subtitle { padding-top: 1.02rem !important; font-size: .45rem !important; line-height: 1.22 !important; }
  html body .page-wrap header .pill-row { display: flex !important; flex-wrap: nowrap !important; gap: 0 !important; overflow-x: auto !important; white-space: nowrap !important; padding: .02rem 0 .08rem !important; }
  html body .page-wrap header .pill-row > * { flex: 0 0 auto !important; padding: 0 .34rem 0 0 !important; margin: 0 !important; border: 0 !important; border-right: 1px solid rgba(137,255,240,.25) !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important; font-size: .29rem !important; white-space: nowrap !important; }
  html body .flight-lane .card, html body .flight-lane .dev-drawer, html body .flight-lane .output-card, html body .flight-lane .seal-card, html body .flight-lane .copy-bin-card { padding: .42rem .42rem .48rem .66rem !important; margin-bottom: .34rem !important; overflow: hidden !important; }
  html body .flight-lane .checkbox-row, html body .flight-lane .radio-row, html body .flight-lane .copy-grid, html body .flight-lane .row { display: flex !important; flex-wrap: wrap !important; gap: .12rem .14rem !important; overflow: hidden !important; }
  html body .flight-lane .checkbox-row > label, html body .flight-lane .radio-row > label, html body .flight-lane .copy-chip, html body .flight-lane .row > .btn, html body .flight-lane .row > button { flex: 0 1 calc(50% - .12rem) !important; min-width: 0 !important; max-width: calc(50% - .12rem) !important; min-height: .72rem !important; padding: .08rem .17rem !important; font-size: .27rem !important; line-height: 1.05 !important; white-space: normal !important; overflow-wrap: anywhere !important; text-align: left !important; }
  html body .flight-lane .actions button, html body .flight-lane .output-toolbar button, html body .flight-lane .payload-stepper button { flex: 0 0 auto !important; max-width: none !important; min-height: .72rem !important; padding: .07rem .18rem !important; font-size: .27rem !important; white-space: nowrap !important; }
  html body .flight-lane input[type="checkbox"], html body .flight-lane input[type="radio"] { width: .32rem !important; min-width: .32rem !important; height: .32rem !important; margin: 0 .10rem 0 0 !important; }
  html body .flight-lane textarea, html body .flight-lane .output, html body .flight-lane #taskText { font-size: 12px !important; line-height: 1.24 !important; padding: .34rem .40rem !important; }
  html body .flight-lane #taskText, html body .flight-lane .output { min-height: 3.35rem !important; height: clamp(3.45rem, 11dvh, 4.55rem) !important; max-height: 14dvh !important; }
  html body .mobile-flight-switcher .mobile-lane-tab { min-height: 1.02rem !important; padding: .09rem .18rem !important; font-size: .32rem !important; }
  html body .mobile-flight-switcher .mobile-lane-tab span { font-size: .33rem !important; }
  html body .mobile-flight-switcher .mobile-lane-tab small { font-size: .22rem !important; }
  html body .mobile-prompt-rail { min-height: .82rem !important; padding: .13rem .22rem .13rem .32rem !important; }
}
`;

html = html.replace('</style>', `${css}\n</style>`);

if (!html.includes(sentinel)) throw new Error('PR80 sentinel missing');
if (!html.includes('font-size: 12px !important')) throw new Error('PR80 compact textarea missing');
if (!html.includes('calc(50% - .12rem)')) throw new Error('PR80 compact controls missing');
fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR80 strong mobile chrome restoration');
