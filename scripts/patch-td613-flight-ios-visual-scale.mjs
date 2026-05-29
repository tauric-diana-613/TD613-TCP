import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';
const marker = 'PR87_SENTINEL TD613 Flight iOS visual-scale input shim';

const css = `
/* ${marker} */
@media (hover: none), (pointer: coarse), (max-width: 820px) {
  .flight-lane textarea,
  .flight-lane #taskText {
    --flight-ios-visual-scale: .5625;
    --flight-ios-visual-h: 86px;
    --flight-ios-visual-min-h: 74px;
    --flight-ios-visual-max-h: 150px;
    width: calc(100% / var(--flight-ios-visual-scale)) !important;
    max-width: calc(100% / var(--flight-ios-visual-scale)) !important;
    min-height: calc(var(--flight-ios-visual-min-h) / var(--flight-ios-visual-scale)) !important;
    height: calc(var(--flight-ios-visual-h) / var(--flight-ios-visual-scale)) !important;
    max-height: calc(var(--flight-ios-visual-max-h) / var(--flight-ios-visual-scale)) !important;
    margin-right: calc(100% - (100% / var(--flight-ios-visual-scale))) !important;
    margin-bottom: calc(var(--flight-ios-visual-h) - (var(--flight-ios-visual-h) / var(--flight-ios-visual-scale))) !important;
    font-size: 16px !important;
    line-height: 1.18 !important;
    transform: scale(var(--flight-ios-visual-scale)) !important;
    transform-origin: left top !important;
    -webkit-transform: scale(var(--flight-ios-visual-scale)) !important;
    -webkit-transform-origin: left top !important;
    touch-action: auto !important;
    -webkit-user-select: text !important;
    user-select: text !important;
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
  }

  .flight-lane .dev-drawer textarea {
    --flight-ios-visual-scale: .5;
    --flight-ios-visual-h: 62px;
    --flight-ios-visual-min-h: 54px;
    --flight-ios-visual-max-h: 112px;
    font-size: 16px !important;
    line-height: 1.12 !important;
  }

  .flight-lane input[type="text"],
  .flight-lane input[type="number"],
  .flight-lane input[type="date"] {
    --flight-ios-input-scale: .5;
    --flight-ios-input-w: clamp(8rem, 42vw, 18rem);
    --flight-ios-input-h: 18px;
    width: calc(var(--flight-ios-input-w) / var(--flight-ios-input-scale)) !important;
    max-width: calc(var(--flight-ios-input-w) / var(--flight-ios-input-scale)) !important;
    height: calc(var(--flight-ios-input-h) / var(--flight-ios-input-scale)) !important;
    min-height: calc(var(--flight-ios-input-h) / var(--flight-ios-input-scale)) !important;
    margin-right: calc(var(--flight-ios-input-w) - (var(--flight-ios-input-w) / var(--flight-ios-input-scale))) !important;
    margin-bottom: calc(var(--flight-ios-input-h) - (var(--flight-ios-input-h) / var(--flight-ios-input-scale))) !important;
    font-size: 16px !important;
    line-height: 1 !important;
    transform: scale(var(--flight-ios-input-scale)) !important;
    transform-origin: left center !important;
    -webkit-transform: scale(var(--flight-ios-input-scale)) !important;
    -webkit-transform-origin: left center !important;
    touch-action: auto !important;
    -webkit-user-select: text !important;
    user-select: text !important;
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
  }

  .flight-lane label input[type="text"],
  .flight-lane label input[type="number"],
  .flight-lane label input[type="date"] {
    --flight-ios-input-scale: .4375;
    --flight-ios-input-w: clamp(4rem, 16vw, 6.2rem);
    --flight-ios-input-h: 14px;
  }
}
`;

function removeBlock(source) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.replace(new RegExp(`\\n?/\\* ${escaped} \\*/[\\s\\S]*?(?=\\n</style>|\\n/\\*)`, 'g'), '');
}

function injectCss(source) {
  let out = removeBlock(source);
  if (!out.includes('</style>')) throw new Error('Missing </style> in Flight HTML');
  return out.replace('</style>', `${css}\n</style>`);
}

let html = fs.readFileSync(htmlPath, 'utf8');
html = injectCss(html);
fs.writeFileSync(htmlPath, html);

let pr85 = fs.readFileSync(pr85Path, 'utf8');
pr85 = removeBlock(pr85);
const cssInjectionPoint = 'const css = `\n';
if (!pr85.includes(cssInjectionPoint)) throw new Error('PR85 css template not found');
pr85 = pr85.replace(cssInjectionPoint, `${cssInjectionPoint}${css}\n`);
fs.writeFileSync(pr85Path, pr85);

console.log('TD613 Flight PR87 iOS visual-scale input shim applied');
