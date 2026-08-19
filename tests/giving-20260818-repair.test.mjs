import assert from 'node:assert/strict';
import fs from 'node:fs';

const repair = fs.readFileSync('app/giving/history/giving-20260818-repair.js', 'utf8');
const css = fs.readFileSync('app/giving/history/giving-20260818-repair.css', 'utf8');
const bootstrap = fs.readFileSync('app/giving/history/giving-bootstrap.js', 'utf8');
const pageSize = fs.readFileSync('app/giving/history/giving-page-size.js', 'utf8');

assert.match(bootstrap, /GIVING_REPAIR_EPOCH = '20260818-1'/, 'repair bundle must carry an explicit cache epoch');
assert.match(bootstrap, /giving20260818RepairStylesheet/, 'repair stylesheet must be loaded by bootstrap');
assert.match(bootstrap, /giving-20260818-repair\.js/, 'repair JS must load last in Giving bootstrap');

assert.match(repair, /moveStateBelowHints/, 'State placement repair must exist');
assert.match(repair, /after-search-hints/, 'State must move directly below Search Hints');
assert.match(repair, /before-filing-sources/, 'committee filter must move immediately before filing sources');
assert.match(repair, /Campaign finance filing sources/, 'technical Electronic Source Instances label must be replaced with field-legible language');
assert.match(repair, /Choose a committee ↓/, 'committee filter route must expose a visible jump link');
assert.match(repair, /td613:giving-clear-all/, 'practice exit must invoke canonical transient clearing');
assert.match(repair, /practice-file-boundary-dialog/, 'saved fictional files must cross an explicit practice boundary before opening');
assert.match(repair, /Enter Demo &amp; open file/, 'practice-file boundary must name the universe transition');
assert.match(repair, /NEEDS SOURCE RETRY/, 'Source Hold must render as a legible retry state');
assert.match(repair, /practiceActive\(\).*addContactQueueButton/s, 'practice Add Contact path must be able to default Exact before the queue snapshots settings');
assert.match(repair, /ensureLiveWorkspaceFallback/, 'real campaign lookup must have a bounded Committee Workspace fallback');
assert.match(repair, /ensurePracticeLoadButtons/, 'practice committee results must expose an explicit load-context action');
assert.match(repair, /Yellow means incomplete coverage—not a failed search and never zero giving/, 'FEC partial copy must explain incomplete coverage rather than imply failure');
assert.match(repair, /automatic_repo_propagation: false/, 'Pedagogue hydration remains diagnosis-only outside this Giving repair');

assert.match(css, /committee-filter-jump[\s\S]*text-decoration: underline/, 'committee jump affordance must look like a link');
assert.match(css, /giving-date-range-filter input\[type="date"\][\s\S]*box-sizing: border-box/, 'mobile date inputs must be bounded to their panel');
assert.match(css, /::-webkit-date-and-time-value/, 'mobile Safari date value must receive explicit alignment');
assert.match(css, /giving-date-presets[\s\S]*justify-content: center/, 'Quick Start presets must center on mobile');
assert.match(css, /source-picker-actions[\s\S]*position: static !important/, 'source actions must not overlap their heading on mobile');
assert.match(css, /committee-ledger-toolbar-repair[\s\S]*grid-template-columns: repeat\(2, minmax\(0,1fr\)\)/, 'Committee Workspace mobile toolbar must recompose into bounded columns');

assert.match(pageSize, /EASYVOTE_BOUNDARY_PAGE_SIZE = 50/, 'EasyVote must use smaller source-specific pages to stay below the response boundary');
assert.match(pageSize, /sourceId\.startsWith\('easyvote-'\)/, 'EasyVote page ceiling must apply across registered municipal tenants');

console.log(JSON.stringify({
  suite: 'giving-20260818-repair',
  status: 'PASS',
  boundaries: ['mobile-geometry', 'committee-route', 'practice-custody', 'queue-finality', 'easyvote-page-envelope', 'fec-partial-language']
}, null, 2));
