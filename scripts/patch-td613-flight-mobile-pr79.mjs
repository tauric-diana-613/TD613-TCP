import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const marker = 'TD613 Flight PR79 compact mobile controls';
html = html.replace(/\n\/\* === TD613 Flight PR79 compact mobile controls === \*\/[\s\S]*?(?=\n@media \(prefers-reduced-motion: reduce\)|\n<\/style>)/m, '');

const css = `
/* === TD613 Flight PR79 compact mobile controls === */
@media (max-width: 820px) {
  .card,
  .dev-drawer,
  .output-card,
  .seal-card,
  .copy-bin-card {
    padding: .46rem .44rem .52rem .72rem !important;
    margin-bottom: .38rem !important;
    overflow: hidden !important;
  }

  .checkbox-row,
  .radio-row,
  .copy-grid,
  .row,
  .seal-card .radio-row,
  .seal-card .checkbox-row {
    gap: .14rem .16rem !important;
    overflow: hidden !important;
  }

  button,
  .btn,
  .primary,
  .secondary,
  .ghost,
  .copy-chip,
  .checkbox-row label,
  .radio-row label,
  .seal-card .radio-row label,
  .seal-card .checkbox-row label {
    min-height: .88rem !important;
    padding: .11rem .24rem !important;
    border-radius: 999px !important;
    font-size: .33rem !important;
    line-height: 1.06 !important;
    letter-spacing: .055em !important;
    max-width: 100% !important;
    width: auto !important;
    white-space: normal !important;
    overflow-wrap: anywhere !important;
  }

  .checkbox-row input[type="checkbox"],
  .radio-row input[type="radio"] {
    flex: 0 0 .4rem !important;
    width: .4rem !important;
    min-width: .4rem !important;
    height: .4rem !important;
    margin: 0 .13rem 0 0 !important;
  }

  .checkbox-row label:has(input[type="text"]),
  .radio-row label:has(input[type="text"]) {
    flex: 1 1 7rem !important;
    max-width: 100% !important;
  }

  .checkbox-row label input[type="text"],
  .radio-row label input[type="text"],
  input[type="text"] {
    width: 3.9rem !important;
    max-width: 42vw !important;
    font-size: .66rem !important;
    line-height: 1.12 !important;
    padding: .18rem .28rem !important;
  }

  textarea,
  .output,
  #taskText {
    font-size: .64rem !important;
    line-height: 1.28 !important;
    letter-spacing: .02em !important;
    padding: .42rem .48rem !important;
  }

  #taskText,
  .output {
    min-height: 4.15rem !important;
    height: clamp(4.25rem, 15dvh, 5.4rem) !important;
    max-height: 17dvh !important;
  }

  .mobile-lane-tab {
    min-height: 1.28rem !important;
    padding: .14rem .24rem !important;
    font-size: .42rem !important;
  }

  .mobile-lane-tab span:last-child {
    font-size: .28rem !important;
  }

  .output-toolbar {
    gap: .14rem !important;
  }

  .output-toolbar .row .btn,
  .payload-stepper-btn {
    min-height: .82rem !important;
    padding: .08rem .2rem !important;
    font-size: .31rem !important;
  }

  .payload-stepper-value {
    font-size: .34rem !important;
    min-width: .46rem !important;
  }

  .mobile-prompt-rail,
  .mobile-prompt-rail.mobile-prompt-rail-top,
  .mobile-prompt-rail.is-docked {
    min-height: .98rem !important;
    padding: .18rem .3rem .18rem .42rem !important;
    gap: .22rem !important;
  }

  .mobile-prompt-rail span:first-child {
    font-size: .35rem !important;
  }

  .mobile-prompt-rail-pill {
    font-size: .27rem !important;
    padding: .08rem .18rem !important;
  }
}
`;

html = html.replace('</style>', `${css}\n</style>`);

if (!html.includes(marker)) throw new Error('PR79 compact controls CSS missing');
if (!html.includes('font-size: .64rem !important')) throw new Error('PR79 textarea compact font missing');
if (!html.includes('min-height: .88rem !important')) throw new Error('PR79 compact button height missing');
if (!html.includes('width: .4rem !important')) throw new Error('PR79 compact checkbox size missing');
if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) throw new Error('wrapper regression detected');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR79 compact mobile controls');
