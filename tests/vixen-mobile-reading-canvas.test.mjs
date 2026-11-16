import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// This guard is deliberately about mobile presentation and custody boundaries;
// it does not turn a static source check into a claim of visual browser parity.
const page = readFileSync(new URL('../app/encyclopedia/vix-cyb.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/encyclopedia/vixen-estate/vixen-mobile-reading-rgi17.css', import.meta.url), 'utf8');
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
  assert.match(css, /#worksLexiconLayout\.has-mobile-reader #worksReaderPanel/);
  assert.match(css, /#worksExperimentAReaderMount \.vix-couture-reader\.vix-manuscript/);
  assert.match(css, /#worksExperimentAReaderMount \.vix-manuscript \.vix-reader-paragraph/);
  assert.match(page, /COMPANION MANUSCRIPT · COMPLETE TEXT/);
  assert.match(page, /mountVixenManuscript\(coutureReader,/);
  assert.doesNotMatch(page, /expaToggleFullBtn|readerFullView/);
});
