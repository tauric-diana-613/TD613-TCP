import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const read = (path) => fs.readFileSync(path, 'utf8');

const stateCss = read('app/giving/history/giving-state-filter.css');
const shell = read('app/giving/history/giving-ux-resilience-shell.js');
const shellCss = read('app/giving/history/giving-ux-resilience.css');
const help = read('app/giving/history/giving-dossier-help.js');
const helpCss = read('app/giving/history/giving-dossier-help.css');
const practice = read('app/giving/history/giving-practice-hydration.js');
const practiceDirectory = read('app/giving/history/giving-practice-directory.js');
const practiceCss = read('app/giving/history/giving-practice-hydration.css');
const polish = read('app/giving/history/giving-polish.css');
const sharedAccess = read('app/giving/history/giving-shared-access.js');
const pageSize = read('app/giving/history/giving-page-size.js');
const reviewPaging = read('app/giving/history/giving-review-paging.js');
const reviewPagingCore = read('app/giving/history/giving-review-paging-core.js');
const renderBackpressure = read('app/giving/history/giving-search-render-backpressure.js');
const bootstrap = read('app/giving/history/giving-bootstrap.js');
const givingIndex = read('app/giving/history/index.html');
const browserProbe = read('scripts/giving-browser-probe.mjs');
const practiceAssay = read('scripts/giving-practice-fixture-browser-assay.mjs');
const workflow = read('.github/workflows/td613-ci.yml');

assert.doesNotThrow(() => new Function(shell));
assert.doesNotThrow(() => new Function(renderBackpressure.replace(/export const[\s\S]*$/m, '')));
assert.doesNotThrow(
  () => execFileSync(process.execPath, ['--check', 'app/giving/history/giving-practice-directory.js'], { stdio: 'pipe' }),
  'practice directory must remain valid browser ESM'
);
assert.match(stateCss, /@media \(max-width: 760px\)[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);

assert.match(shell, /One contributor research file = one investigation\./);
assert.match(shell, /researchFileVaultButton/);
assert.match(shell, /Load fictional sample/);
assert.match(shell, /td613:giving-practice-load-request/);
assert.match(shell, /scrollViewToTop\('view-vault'\)/);
assert.match(shell, /dossier-single-picker/);

for (const name of ['SpongeBob SquarePants', 'Patrick Star', 'Sandy Cheeks', 'Eugene H. Krabs', 'Squidward Q. Tentacles']) assert.ok(practice.includes(name));
for (const committee of ['King Neptune for King','Puff for Bikini Bottom School District #67','Every Villain Is Lemons PAC','Sheldon Plankton for Bikini Bottom Campaign','Larry Lobster for Mayor of Bikini Bottom','Fishocratic Executive Committee','Friends of Aquaman PC','Krusty Krab Parking Expansion Referendum Committee']) assert.ok(practiceDirectory.includes(committee));
assert.match(practice, /exact\.checked = true/);
assert.match(practice, /8000 \+ \(hash % 8001\)/);
assert.match(practiceCss, /\.fictional-sample-chip/);
assert.match(practiceCss, /\.practice-floating-exit/);
assert.match(practiceCss, /\.practice-geo-asleep/);
assert.match(practiceCss, /left: 50%[\s\S]*?top: 50%/);

assert.match(help, /Contributor research file/);
assert.match(help, /custodyModeHelp/);
assert.match(helpCss, /font-size:\s*13px/);
assert.match(shellCss, /\.campaign-segmented-control/);
assert.match(polish, /#sessionTitle::after[\s\S]*?TD613 Giving/);

assert.match(pageSize, /const PAGE_SIZE = 300/);
assert.match(pageSize, /const FEC_BOUNDARY_PAGE_SIZE = 100/);
assert.match(reviewPagingCore, /const PAGE_SIZE = 50/);
assert.match(reviewPagingCore, /givingSearchRender === 'deferred'/);
assert.match(renderBackpressure, /root\.dataset\.givingSearchRender = 'deferred'/);
assert.match(renderBackpressure, /td613:giving-run-settled/);
assert.match(reviewPaging, /giving-review-paging-core\.js\?v=20260813-3/);
assert.match(bootstrap, /const GIVING_ASSET_EPOCH = '20260816-4'/);
assert.match(bootstrap, /const GIVING_SEARCH_BACKPRESSURE_EPOCH = '20260817-1'/);
assert.match(bootstrap, /const GIVING_PRACTICE_EPOCH = '20260817-12'/);
assert.match(bootstrap, /giving-practice-runtime\.js/);
assert.match(bootstrap, /giving-practice-surface-bridge\.js/);
assert.match(bootstrap, /giving-practice-directory\.js/);
assert.match(bootstrap, /fetch\(sourceUrl\('\.\/giving-fec-resilience\.js\?v=20260814-1'\), \{ cache: 'reload'/);
assert.match(givingIndex, /giving-bootstrap\.js\?v=20260817-1/);

assert.match(sharedAccess, /Close shared access/);
assert.match(sharedAccess, /session\.shared-access\.revoke/);
assert.match(browserProbe, /witnessGivingPracticeFixture/);
assert.match(practiceAssay, /outgrow the obsolete 49-row toy dataset/);
assert.match(practiceAssay, /Open selected file must reopen/);
assert.match(practiceAssay, /practice Vault must keep encrypted custody/);
assert.match(practiceAssay, /confirmed exit must restore the live source picker/);
assert.match(workflow, /Witness originating Giving practice fixture with Chromium/);

console.log('giving-post640-polish.test.mjs passed');