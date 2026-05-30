import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';
const marker = 'PR87_SENTINEL TD613 Flight iOS visual-scale input shim';

const css = `
/* ${marker} */
@media (hover: none), (pointer: coarse), (max-width: 820px) {
  .flight-lane textarea,
  .flight-lane #taskText,
  .flight-lane #outputText {
    width: 177.777777% !important;
    max-width: 177.777777% !important;
    min-height: 131.5556px !important;
    height: 152.8889px !important;
    max-height: 266.6667px !important;
    margin-right: -77.777777% !important;
    margin-bottom: -66.8889px !important;
    font-size: 16px !important;
    line-height: 1.18 !important;
    letter-spacing: .004em !important;
    transform: scale(.5625) !important;
    transform-origin: left top !important;
    -webkit-transform: scale(.5625) !important;
    -webkit-transform-origin: left top !important;
    touch-action: auto !important;
    -webkit-user-select: text !important;
    user-select: text !important;
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
  }

  .flight-lane .dev-drawer textarea {
    width: 200% !important;
    max-width: 200% !important;
    min-height: 108px !important;
    height: 124px !important;
    max-height: 224px !important;
    margin-right: -100% !important;
    margin-bottom: -62px !important;
    font-size: 16px !important;
    line-height: 1.12 !important;
    transform: scale(.5) !important;
    transform-origin: left top !important;
    -webkit-transform: scale(.5) !important;
    -webkit-transform-origin: left top !important;
  }

  #sealVerbCustom,
  #sealVerbWithCustom,
  #sealTargetWord,
  #authFragment,
  #authSac,
  #authShi,
  #authAuthority,
  #authOntology,
  #authSchema,
  #authRoutePath,
  #authTribunal,
  #authSimFlag,
  #rotationSeed,
  #routeJurisdiction,
  #routeCitationStandard,
  #routeUnit {
    width: 200% !important;
    max-width: 200% !important;
    height: 36px !important;
    min-height: 36px !important;
    margin-right: -100% !important;
    margin-bottom: -18px !important;
    font-size: 16px !important;
    line-height: 1 !important;
    transform: scale(.5) !important;
    transform-origin: left center !important;
    -webkit-transform: scale(.5) !important;
    -webkit-transform-origin: left center !important;
    touch-action: auto !important;
    -webkit-user-select: text !important;
    user-select: text !important;
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
  }

  .seal-custom-label #sealVerbCustom,
  .seal-custom-label #sealVerbWithCustom {
    width: 228.571429% !important;
    max-width: 228.571429% !important;
    height: 32px !important;
    min-height: 32px !important;
    margin-right: -128.571429% !important;
    margin-bottom: -18px !important;
    transform: scale(.4375) !important;
    -webkit-transform: scale(.4375) !important;
  }

  #authPayload,
  #authDate {
    width: 200% !important;
    max-width: 200% !important;
    height: 36px !important;
    min-height: 36px !important;
    margin-right: -100% !important;
    margin-bottom: -18px !important;
    font-size: 16px !important;
    line-height: 1 !important;
    transform: scale(.5) !important;
    transform-origin: left center !important;
    -webkit-transform: scale(.5) !important;
    -webkit-transform-origin: left center !important;
  }

  .output-toolbar {
    align-items: center !important;
    gap: 8px !important;
  }

  .payload-stepper {
    flex: 0 0 auto !important;
    width: auto !important;
    min-width: 112px !important;
    max-width: 156px !important;
    min-height: 30px !important;
    height: 30px !important;
    padding: 3px 6px !important;
    gap: 6px !important;
    margin-left: auto !important;
    transform: scale(.78) !important;
    transform-origin: right center !important;
  }

  .payload-stepper-label {
    font-size: 7px !important;
    line-height: 1 !important;
    letter-spacing: .12em !important;
  }

  .payload-stepper-value {
    font-size: 10px !important;
    line-height: 1 !important;
    min-width: 1.1rem !important;
  }

  .payload-stepper-btn,
  .payload-stepper .icon-btn {
    width: 24px !important;
    min-width: 24px !important;
    height: 24px !important;
    min-height: 24px !important;
    padding: 0 !important;
    font-size: 12px !important;
    line-height: 1 !important;
  }

  @media (max-width: 390px) {
    .payload-stepper {
      transform: scale(.7) !important;
      max-width: 140px !important;
    }
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

console.log('TD613 Flight PR87 iOS visual-scale input shim applied with Safari-safe fixed math');
