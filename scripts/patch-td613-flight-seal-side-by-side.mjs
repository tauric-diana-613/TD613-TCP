import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';

const marker = '/* PR90_SENTINEL TD613 Flight seal side-by-side target/zwnj repair */';

const css = `
${marker}
@media (hover: none), (pointer: coarse), (max-width: 820px) {
  .flight-lane .seal-card .section-split-row {
    display: grid !important;
    grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr) !important;
    grid-template-areas: "target zwnj" !important;
    gap: 7px !important;
    align-items: stretch !important;
  }

  .flight-lane .seal-card .section-split-row > div:first-child {
    grid-area: zwnj !important;
    align-self: stretch !important;
    margin-top: 0 !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .flight-lane .seal-card .section-split-row > div:nth-child(2) {
    grid-area: target !important;
    align-self: stretch !important;
    min-height: 100% !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .flight-lane .seal-card .section-split-row > div {
    min-width: 0 !important;
    padding: 7px 8px !important;
  }

  .flight-lane .seal-card .section-split-row .small-label {
    font-size: 6px !important;
    line-height: 1.1 !important;
    letter-spacing: .09em !important;
  }

  .flight-lane .seal-card #sealTargetWord {
    width: 100% !important;
    max-width: 100% !important;
  }

  .flight-lane .seal-card .section-split-row .radio-row {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 4px 5px !important;
    align-content: flex-start !important;
  }

  .flight-lane .seal-card .section-split-row .radio-row label {
    flex: 0 1 auto !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 15px !important;
    padding: 2px 5px !important;
    font-size: 5px !important;
    line-height: 1.08 !important;
    white-space: normal !important;
  }
}

@media (hover: none) and (pointer: coarse) and (max-width: 520px) {
  .flight-lane .seal-card .section-split-row {
    grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr) !important;
    grid-template-areas: "target zwnj" !important;
  }

  .flight-lane .seal-card .section-split-row > div:first-child,
  .flight-lane .seal-card .section-split-row > div:nth-child(2) {
    transform: none !important;
    -webkit-transform: none !important;
  }
}
`;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripPrior(source) {
  const escaped = escapeRegExp(marker);
  return source.replace(new RegExp('\\n?' + escaped + '[\\s\\S]*?(?=\\n<\\/style>|\\n`|\\n\/\\* PR|\\n@media)', 'g'), '');
}

function injectIntoHtml(source) {
  let out = stripPrior(source);
  if (!out.includes('</style>')) throw new Error('Missing </style> in Flight HTML');
  out = out.replace('</style>', `${css}\n</style>`);
  if (!out.includes(marker)) throw new Error('PR90 CSS injection failed in Flight HTML');
  if (!out.includes('grid-template-areas: "target zwnj" !important;')) throw new Error('PR90 target/zwnj grid area missing in Flight HTML');
  return out;
}

function injectIntoPr85(source) {
  let out = stripPrior(source);
  const cssInjectionPoint = 'const css = `\n';
  if (!out.includes(cssInjectionPoint)) throw new Error('PR85 CSS template not found');
  out = out.replace(cssInjectionPoint, `${cssInjectionPoint}${css}\n`);
  if (!out.includes(marker)) throw new Error('PR90 CSS injection failed in PR85 patch script');
  if (!out.includes('grid-template-areas: "target zwnj" !important;')) throw new Error('PR90 target/zwnj grid area missing in PR85 patch script');
  return out;
}

fs.writeFileSync(htmlPath, injectIntoHtml(fs.readFileSync(htmlPath, 'utf8')));
fs.writeFileSync(pr85Path, injectIntoPr85(fs.readFileSync(pr85Path, 'utf8')));

console.log('Applied TD613 Flight PR90 Seal repair: Target Word and ZWNJ Behavior stay side-by-side, target left and ZWNJ right.');
