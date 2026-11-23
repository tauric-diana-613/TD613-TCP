import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = relative => readFileSync(new URL('../'+relative, import.meta.url),'utf8');
const page = read('app/encyclopedia/vix-cyb.html');
const retired = read('app/encyclopedia/vixen-estate/vixen-mobile-reading-rgi17.css');
const mobile = read('app/encyclopedia/vixen-estate/vixen-mobile-manuscript-opera-rgi27.css');
const desktop = read('app/encyclopedia/vixen-estate/vixen-obsidian-reading-rgi26.css');

test('RGI27 is the last loaded manuscript sheet, with RGI17 reader retired and original frontispiece retained',()=>{
  assert.ok(page.indexOf('vixen-mobile-reading-rgi17.css') > 0);
  assert.ok(page.indexOf('vixen-obsidian-reading-rgi26.css') < page.indexOf('vixen-mobile-manuscript-opera-rgi27.css'));
  assert.equal((page.match(/vixen-mobile-manuscript-opera-rgi27\.css/g)||[]).length,1);
  assert.match(retired, /inset:80px 16px clamp\(190px,23svh,214px\)/);
  assert.doesNotMatch(retired, /worksExperimentAReaderMount|vix-couture-reader|vix-manuscript/);
  assert.match(mobile, /@media screen and \(max-width:680px\)/);
  assert.ok(mobile.trim().endsWith('}'));
  assert.equal((mobile.match(/\{/g)||[]).length, (mobile.match(/\}/g)||[]).length);
});

test('manuscript is an independent full-width ordinary-flow mobile article without inherited anywhere breaking',()=>{
  assert.match(mobile, /#worksLexiconLayout\.has-mobile-reader/);
  assert.match(mobile, /#worksReaderPanel\.lexicon-reader/);
  assert.match(mobile, /#expaCompanionBodyPre\.vix-couture-reader\.vix-manuscript/);
  assert.match(mobile, /display:flow-root!important/);
  assert.match(mobile, /width:100%!important/);
  assert.match(mobile, /max-height:none!important/);
  assert.match(mobile, /column-count:1!important/);
  assert.match(mobile, /overflow:visible!important/);
  assert.match(mobile, /word-break:normal!important;overflow-wrap:normal!important/);
  assert.match(mobile, /font:400 15\.5px\/1\.53 "Iowan Old Style"/);
  assert.match(mobile, /\.vix-reader-paragraph/);
  assert.match(mobile, /\.vix-reader-heading/);
  assert.match(page, /mountVixenManuscript\(coutureReader,/);
  assert.match(page, /aria-label="Complete companion manuscript"/);
  assert.doesNotMatch(desktop, /#expaCompanionBodyPre :is\(\*, \*::before, \*::after\)/);
  assert.doesNotMatch(mobile, /:is\(pre,code,/);
});

test('visible Works and Methods no longer expose preview approvals or release-state ribbons',()=>{
  assert.doesNotMatch(page, /EXPERIMENT-A COMPANION READER · VOLUNTEER \/ DEV AUTHORIZED/);
  assert.doesNotMatch(page, /EXHAUSTIVE 32-WORK CATALOGUE · EXPERIMENT-A COMPANION PREVIEW/);
  assert.doesNotMatch(page, /<span class="tag gold">EXPERIMENT_A_PREVIEW_AUTHORIZED<\/span>/);
  assert.doesNotMatch(page, /<strong>Experiment-A Preview Status:<\/strong>/);
  assert.doesNotMatch(page, /FULL COMPANION MANUSCRIPT AVAILABLE|PRODUCTION REQUIRES OPERATOR SECRET/);
  assert.match(page, /id="globalSearchObservabilityBar" hidden aria-hidden="true"/);
  assert.match(page, /id="globalFusionTaskTray" hidden aria-hidden="true"/);
  // Exact machine states still exist for typed provenance; no source-custody changes.
  assert.match(page, /custody_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED'/);
  assert.match(page, /id="vixen-corpus-bundle"/);
});

test('iOS native glyph and mobile Salon controls remain unchanged',()=>{
  const glyph=read('app/encyclopedia/vixen-estate/vixen-redpen-couture-rgi18.css');
  const salon=read('app/encyclopedia/vixen-estate/synthesis-salon.css');
  assert.equal((glyph.match(/content:"◀︎"/g)||[]).length,2);
  assert.doesNotMatch(glyph,/content:"◀"/);
  assert.match(glyph,/U\+FE0E text selector/);
  const corrected=salon.slice(salon.indexOf('Operator iPhone REDPEN'));
  assert.ok(corrected.length>200);
  assert.match(corrected,/button\.vs-seam\s*\{/);
  assert.match(corrected,/position:relative!important/);
  assert.match(corrected,/left:auto!important/);
  assert.match(corrected,/transform:none!important/);
  assert.match(corrected,/height:auto!important/);
  assert.match(corrected,/font:700 12px\/1\.2/);
  assert.match(corrected,/max-width:calc\(100% - 32px\)!important/);
});
