import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {translatePublicCopy} from '../app/encyclopedia/vixen-estate/vixen-opera-public-copy.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('app/encyclopedia/vix-cyb.html');
const phone=read('app/encyclopedia/vixen-estate/vixen-mobile-manuscript-opera-rgi27.css');
const legacy=read('app/encyclopedia/vixen-estate/vixen-mobile-reading-rgi17.css');
const boundary=read('app/encyclopedia/vixen-estate/vixen-opera-public-copy.mjs');

test('Opera HTML directly removes authorization badges and lab claims, retaining machine receipts',()=>{
  assert.doesNotMatch(html,/<(?:span|code)[^>]*>EXPERIMENT_A_PREVIEW_AUTHORIZED<\\//);
  assert.doesNotMatch(html,/EXPERIMENT-A COMPANION PREVIEW|Experiment-A Preview Status:/);
  assert.doesNotMatch(html,/FULL COMPANION MANUSCRIPT AVAILABLE|PRODUCTION REQUIRES OPERATOR SECRET/);
  assert.doesNotMatch(html,/EMPIRICAL_REPLICATION_CREDIT: 0 · EXPERIMENT A: READABLE/);
  assert.match(html,/id="globalSearchObservabilityBar" hidden aria-hidden="true"/);
  assert.match(html,/id="globalFusionTaskTray" hidden aria-hidden="true"/);
  assert.match(html,/id="vixen-corpus-bundle"/);
  assert.match(html,/mountVixenManuscript\\(coutureReader,/);
  assert.match(html,/worksExperimentAReaderMount/);
});

test('public copy boundary destroys backstage furniture and protects manuscript nodes',()=>{
  assert.match(boundary,/REMOVABLE_PUBLIC_FURNITURE/);
  assert.match(boundary,/el\\.remove\\(\\)/);
  assert.match(boundary,/\\.vix-manuscript, \\.expa-body-pre/);
  assert.equal(translatePublicCopy('EXPERIMENT_A_PREVIEW_AUTHORIZED'),'');
  assert.equal(translatePublicCopy('Codex'), '');
  assert.equal(translatePublicCopy('Gemini'), '');
});

test('mobile article replaces former nested measure and forced any-word wrapping',()=>{
  assert.doesNotMatch(legacy,/#worksExperimentAReaderMount|#worksReaderPanel/);
  assert.match(phone,/display:flow-root!important/);
  assert.match(phone,/max-height:none!important/);
  assert.match(phone,/overflow:visible!important/);
  assert.match(phone,/font:400 15\\.5px\\/1\\.53/);
  assert.match(phone,/overflow-wrap:normal!important/);
  assert.match(phone,/\.vix-reader-paragraph/);
  assert.ok(html.indexOf('vixen-mobile-manuscript-opera-rgi27.css')>html.indexOf('vixen-proscenium-seam.css'));
});

test('paired real Chromium baseline witness is included in source and exact-bounded',()=>{
  const witness=read('tests/vixen-opera-surface-browser.test.mjs');
  assert.match(witness,/chromium\\.launch/);
  assert.match(witness,/7500e294003e8a5effa52921c8d4b7eba673be9d/);
  assert.match(witness,/before-after\\.json/);
  assert.match(witness,/words_per_line/);
  assert.match(witness,/article_width/);
  assert.match(witness,/visible_leaks/);
});
