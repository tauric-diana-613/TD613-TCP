import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// This guard is deliberately about mobile presentation and custody boundaries;
// it does not turn a static source check into a claim of visual browser parity.
const page = readFileSync(new URL('../app/encyclopedia/vix-cyb.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/encyclopedia/vixen-estate/vixen-mobile-reading-rgi17.css', import.meta.url), 'utf8');
const newReader = readFileSync(new URL('../app/encyclopedia/vixen-estate/vixen-mobile-manuscript-opera-rgi27.css', import.meta.url), 'utf8');
const oldDesktop = readFileSync(new URL('../app/encyclopedia/vixen-estate/vixen-obsidian-reading-rgi26.css', import.meta.url), 'utf8');
test('RGI17 is a late-loaded, exclusively mobile sheet', () => {
  const earlier = page.indexOf('vixen-mobile-seams-rgi16.css');
  const later = page.indexOf('vixen-mobile-reading-rgi17.css');
  assert.ok(earlier > 0 && later > earlier);
  assert.equal(page.match(/vixen-mobile-reading-rgi17\.css/g)?.length, 1);
  assert.match(css, /@media screen and \(max-width:680px\)\s*\{/);
  assert.ok(css.trim().endsWith('}'));
  assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length);
  assert.equal((css.match(/@media/g) || []).length, 1);
});
test('phone typography and frontispiece stay scoped to presentation', () => {
  assert.match(css, /#view-overview \.cover-title/);
  assert.match(css, /inset:80px 16px clamp\(190px,23svh,214px\)/);
  assert.match(css, /justify-content:space-between!important/);
  assert.doesNotMatch(css, /inset:clamp\(138px,18svh,178px\) 16px auto/);
  assert.doesNotMatch(css, /#worksExperimentAReaderMount|#worksReaderPanel/);
  assert.ok(newReader.includes('#worksLexiconLayout.has-mobile-reader'));
  assert.ok(newReader.includes('#expaCompanionBodyPre.vix-couture-reader.vix-manuscript'));
  assert.ok(newReader.includes('#expaCompanionBodyPre .vix-reader-paragraph'));
  assert.ok(newReader.includes('display:flow-root!important'));
  assert.ok(newReader.includes('max-height:none!important'));
  assert.ok(newReader.includes('overflow-wrap:normal!important'));
  assert.ok(newReader.includes('font:400 15.5px/1.53'));
  assert.ok(newReader.includes('@media screen and (max-width:680px)'));
  assert.ok(page.indexOf('vixen-mobile-manuscript-opera-rgi27.css')>page.indexOf('vixen-obsidian-reading-rgi26.css'));
  assert.ok(!oldDesktop.includes('#expaCompanionBodyPre :is(*, *::before, *::after)'));
  assert.match(page, /aria-label="Complete companion manuscript"/);
  assert.match(page,/THE OBSIDIAN READING ROOM · EDITORIAL EDITION/);
  assert.match(page,/DOCUMENTARY SOURCE · MANUSCRIPT/);
  assert.match(page, /mountVixenManuscript\(coutureReader,/);
  assert.doesNotMatch(page, /expaToggleFullBtn|readerFullView/);
});

test('iOS native glyph is forced into text presentation, never blue emoji',()=>{
 const cssGlyph=readFileSync(new URL('../app/encyclopedia/vixen-estate/vixen-redpen-couture-rgi18.css', import.meta.url),'utf8');
 assert.equal((cssGlyph.match(/content:"◀︎"/g)||[]).length,2);
 assert.doesNotMatch(cssGlyph,/content:"◀"/);
 assert.match(cssGlyph,/U\+FE0E text selector/);
});
test('Salon flip control wins over decorative circle positioning on mobile',()=>{
 const cssSalon=readFileSync(new URL('../app/encyclopedia/vixen-estate/synthesis-salon.css', import.meta.url),'utf8');
 const corrected=cssSalon.slice(cssSalon.indexOf('Operator iPhone REDPEN'));
 assert(corrected.length>200,'Operator redpen containment must be present');
 assert.match(corrected,/button\.vs-seam\s*\{/);
 assert.match(corrected,/position:relative!important/);
 assert.match(corrected,/left:auto!important/);
 assert.match(corrected,/transform:none!important/);
 assert.match(corrected,/height:auto!important/);
 assert.match(corrected,/font:700 12px\/1\.2/);
 assert.match(corrected,/max-width:calc\(100% - 32px\)!important/);
});
