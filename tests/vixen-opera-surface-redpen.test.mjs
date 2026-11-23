import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('app/encyclopedia/vix-cyb.html');
const edition=read('app/encyclopedia/vixen-estate/vixen-manuscript-mobile-edition.css');
const legacy=read('app/encyclopedia/vixen-estate/vixen-mobile-reading-rgi17.css');
const dark=read('app/encyclopedia/vixen-estate/vixen-obsidian-reading-rgi26.css');
const chromeGuard=read('app/encyclopedia/vixen-estate/vixen-opera-public-copy.mjs');

test('Opera HTML exposes source reading, not experiment authorization ribbons',()=>{
 const start=html.indexOf('<body'),stop=html.indexOf('<script id="vixen-reference-manifest"');
 assert(start>0&&stop>start);
 const visitorMarkup=html.slice(start,stop);
 const forbidden=/EXPERIMENT_A_PREVIEW_AUTHORIZED|EXPERIMENT-A COMPANION|(?:OPERATOR|PREVIEW)[_-]AUTHORIZED|PRODUCTION REQUIRES OPERATOR SECRET|VOLUNTEER\s*\/\s*DEV AUTHORIZED|PERSISTENT COMPOSE · HELD FOR HUMAN APPROVAL|EMSTD613|\bWendbine\b|\bSignalRupture\b/i;
 assert.doesNotMatch(visitorMarkup,forbidden,'Visitor-facing HTML includes a backstage token');
 assert.match(visitorMarkup,/02 · COMPLETE WORKS CATALOGUE/);
 assert.match(visitorMarkup,/Choose a Work to read its individual manuscript/);
 assert.doesNotMatch(visitorMarkup,/EXPERIMENT A: READABLE|EMPIRICAL_REPLICATION_CREDIT/);
});
test('the generated reader display, not machine data, is scrubbed at its sources',()=>{
 assert.match(html,/class="vixen-manuscript-kicker">Read the original text/);
 assert.match(html,/THE MANUSCRIPT/);
 assert.match(html,/summaryEl.textContent = 'Showing ' \+ filtered.length \+ ' of 21 documentary protocols'/);
 assert.doesNotMatch(html,/class="tag gold">EXPERIMENT_A_PREVIEW_AUTHORIZED/);
 assert.doesNotMatch(html,/DOCUMENTARY PROTOCOL TEXT · ' \+ esc\(instRec.custody_status/);
 assert.match(html,/onMobileReadingPage/);
 assert.match(chromeGuard,/const BACKSTAGE_CHROME =/);
 assert.match(chromeGuard,/el.remove\(\)/);
 assert.match(chromeGuard,/\.vix-reader-paragraph/);
 assert.match(html,/id="vixen-corpus-bundle"/,'Machine source data must remain separate and unchanged');
});
test('mobile manuscript edition owns one full page, not legacy fixed-width strips',()=>{
 const oldLink=html.indexOf('vixen-obsidian-reading-rgi26.css');
 const newLink=html.indexOf('vixen-manuscript-mobile-edition.css');
 assert(oldLink>0&&newLink>oldLink);
 assert.equal(html.match(/href="\.\/vixen-estate\/vixen-manuscript-mobile-edition\.css"/g)?.length,1);
 assert.equal(edition.match(/@media screen and \(max-width: 680px\)/g)?.length,1);
 assert.match(edition,/#worksReaderPanel/);
 assert.match(edition,/grid-template-columns: minmax\(0,1fr\) !important/);
 assert.match(edition,/font-family: "Iowan Old Style","New York",Georgia,serif !important/);
 assert.match(edition,/font-size: 15\.5px !important/);
 assert.match(edition,/overflow-wrap: normal !important/);
 assert.match(edition,/max-height: none !important/);
 assert.match(edition,/column-count: auto !important/);
 assert.doesNotMatch(legacy,/#worksExperimentAReaderMount|\.vix-reader-paragraph/);
 assert.doesNotMatch(dark,/box-sizing:border-box!important;min-width:0!important;overflow-wrap:anywhere!important/);
});
