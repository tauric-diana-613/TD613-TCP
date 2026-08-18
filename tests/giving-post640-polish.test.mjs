import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { compilePedagoguePracticeReview } from '../app/engine/pedagogue-practice-fixture.js';

const read = (path) => fs.readFileSync(path, 'utf8');

const stateCss = read('app/giving/history/giving-state-filter.css');
const shell = read('app/giving/history/giving-ux-resilience-shell.js');
const shellCss = read('app/giving/history/giving-ux-resilience.css');
const help = read('app/giving/history/giving-dossier-help.js');
const helpCss = read('app/giving/history/giving-dossier-help.css');
const practice = read('app/giving/history/giving-practice-hydration.js');
const practiceRuntime = read('app/giving/history/giving-practice-runtime.js');
const practiceDirectory = read('app/giving/history/giving-practice-directory.js');
const campaignHistory = read('app/giving/history/giving-practice-campaign-history.js');
const committeeGraph = read('app/giving/history/giving-practice-committee-graph.js');
const practiceCss = read('app/giving/history/giving-practice-hydration.css');
const polish = read('app/giving/history/giving-polish.css');
const sharedAccess = read('app/giving/history/giving-shared-access.js');
const pageSize = read('app/giving/history/giving-page-size.js');
const reviewPaging = read('app/giving/history/giving-review-paging.js');
const reviewPagingCore = read('app/giving/history/giving-review-paging-core.js');
const renderBackpressure = read('app/giving/history/giving-search-render-backpressure.js');
const transactionClassification = read('app/giving/history/giving-transaction-classification.js');
const dateSort = read('app/giving/history/giving-date-sort.js');
const bootstrap = read('app/giving/history/giving-bootstrap.js');
const givingIndex = read('app/giving/history/index.html');
const browserProbe = read('scripts/giving-browser-probe.mjs');
const practiceAssay = read('scripts/giving-practice-fixture-browser-assay.mjs');
const workflow = read('.github/workflows/td613-ci.yml');
const pedagogueFixture = JSON.parse(read('tests/fixtures/pedagogue/giving-bikini-bottom-practice.json'));

assert.doesNotThrow(() => new Function(shell));
assert.doesNotThrow(() => new Function(renderBackpressure.replace(/export const[\s\S]*$/m, '')));
for (const path of [
  'app/giving/history/giving-practice-directory.js',
  'app/giving/history/giving-practice-campaign-history.js',
  'app/giving/history/giving-practice-committee-graph.js'
]) {
  assert.doesNotThrow(
    () => execFileSync(process.execPath, ['--check', path], { stdio: 'pipe' }),
    `${path} must remain valid browser ESM`
  );
}
assert.match(stateCss, /@media \(max-width: 760px\)[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);

assert.match(shell, /One contributor research file = one investigation\./);
assert.match(shell, /researchFileVaultButton/);
assert.match(shell, /Load fictional sample/);
assert.match(shell, /td613:giving-practice-load-request/);
assert.match(shell, /scrollViewToTop\('view-vault'\)/);
assert.match(shell, /dossier-single-picker/);

for (const name of ['SpongeBob SquarePants', 'Patrick Star', 'Sandy Cheeks', 'Eugene H. Krabs', 'Squidward Q. Tentacles']) assert.ok(practice.includes(name));
for (const committee of [
  'King Neptune for King','Puff for Bikini Bottom School District #67','Every Villain Is Lemons PAC',
  'Sheldon Plankton for Bikini Bottom Campaign','Larry Lobster for Mayor of Bikini Bottom','Fishocratic Executive Committee',
  'Friends of Aquaman PC','Krusty Krab Parking Expansion Referendum Committee',
  'Larry Lobster for Bikini Bottom Board of Public Health, Soil & Water District 2','Aquaman for Bikini Bottom County Sheriff'
]) assert.ok(practiceDirectory.includes(committee), `practice directory must expose ${committee}`);
assert.match(practiceDirectory, /DISCOVERY_OBJECTS/);
assert.match(practiceDirectory, /starter eight/);
assert.match(practice, /exact\.checked = true/);
assert.match(practice, /8000 \+ \(hash % 8001\)/);
assert.match(practiceCss, /\.fictional-sample-chip/);
assert.match(practiceCss, /\.practice-floating-exit/);
assert.match(practiceCss, /\.practice-geo-asleep/);
assert.match(practiceCss, /left: 50%[\s\S]*?top: 50%/);

assert.match(campaignHistory, /export const LARRY_BOARD = 'Larry Lobster for Bikini Bottom Board of Public Health, Soil & Water District 2'/);
assert.match(campaignHistory, /export const AQUAMAN_SHERIFF = 'Aquaman for Bikini Bottom County Sheriff'/);
assert.match(campaignHistory, /'Sandra Grouper'/);
assert.match(campaignHistory, /'Karen Plankton'/);
assert.match(campaignHistory, /40400[\s\S]*?40400[\s\S]*?19200/);
assert.equal((campaignHistory.match(/40400/g) || []).length, 6, 'Karen must carry two $404 contributions in each of three cycles');
assert.equal((campaignHistory.match(/19200/g) || []).length, 3, 'Karen must carry one $192 completion contribution in each of three cycles');
assert.match(campaignHistory, /'Man, Aqua'/);
assert.match(campaignHistory, /'Barnacle Boy Strategies LLC'/);
assert.match(campaignHistory, /monthly\('SpongeBob SquarePants', AQUAMAN_SHERIFF, 5, 1750\)/);
assert.match(campaignHistory, /monthly\('SpongeBob SquarePants', AQUAMAN_PC, 19, 875\)/);
assert.match(campaignHistory, /monthly\('Patrick Star', AQUAMAN_SHERIFF, 11, 999\)/);
assert.match(campaignHistory, /monthly\('Patrick Star', AQUAMAN_PC, 26, 425\)/);
assert.match(campaignHistory, /temporal_coincidence_does_not_grant_causation: true/);
assert.match(campaignHistory, /candidate_identity_does_not_collapse_race: true/);
assert.match(campaignHistory, /source_name_serialization_preserved: name === 'Man, Aqua'/);
assert.match(campaignHistory, /input\.value = LARRY_MAYOR/);
assert.match(campaignHistory, /#campaignDirectoryQuery/);
assert.match(campaignHistory, /if \(committee === LARRY_MAYOR && date && date < '2025-01-01'\)[\s\S]*?committee = LARRY_BOARD/);
assert.match(campaignHistory, /'2021-01-09': '2025-10-04'/);
assert.match(campaignHistory, /'2024-08-24'[\s\S]*?'2025-11-08'/);
assert.match(committeeGraph, /_givingPracticeCampaignHistory\.allRows\(\)/);
assert.match(committeeGraph, /_givingPracticeCampaignHistory\.normalizePracticeRecord/);
assert.match(practiceRuntime, /giving-practice-campaign-history\.js/);

const pedagogueReview = compilePedagoguePracticeReview(pedagogueFixture);
assert.ok(Object.values(pedagogueReview.practice_gate).every((value) => value === true), 'expanded Giving fixture must pass the actual Pedagogue practice gate');
assert.equal(pedagogueReview.teaching_contrasts.length, 12, 'Pedagogue contrast budget must remain exactly bounded at twelve');
assert.ok(pedagogueReview.teaching_contrasts.some((item) => item.contrast_id === 'actor-continuity-versus-episode-continuity'));
assert.equal(pedagogueReview.fixture.fictional_payload.prepared_political_object, 'Larry Lobster for Mayor of Bikini Bottom');
assert.equal(pedagogueReview.fixture.authority.automatic_retrieval, false);
assert.equal(pedagogueReview.fixture.aia_binding.authority.authority_may_cross, false);

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
assert.match(reviewPaging, /giving-review-paging-core\.js\?v=20260813-3&repair=20260818-1/);
assert.match(reviewPagingCore, /data-pagination-signature=/,
  'review pagination must retain an idempotence signature inside the observed record list');
assert.match(reviewPagingCore, /existing\?\.dataset\.paginationSignature !== signature/,
  'review paginator may replace its observed nav only when pagination state changes');
assert.doesNotMatch(reviewPagingCore, /querySelector\(':scope > \.review-pagination'\)\?\.remove\(\);[\s\S]*?insertAdjacentHTML\('beforeend', markup\)/,
  'review pagination must not remove and recreate its own observed nav on every observer pass');
assert.match(transactionClassification, /if \(existing\.textContent !== classification\) existing\.textContent = classification;/,
  'transaction badge observer must not rewrite an already-correct text node and recursively trigger itself');
assert.match(transactionClassification, /if \(existing\.dataset\.transactionClass !== classification\) existing\.dataset\.transactionClass = classification;/,
  'transaction badge metadata updates must also be idempotent');
assert.doesNotMatch(transactionClassification, /if \(existing\) \{\s*existing\.textContent = classification;/,
  'unconditional existing-badge text rewrites are forbidden inside the childList observer');
assert.match(dateSort, /function sameNodeOrder/,
  'date-sort observer must compare existing and desired node order before DOM mutation');
assert.match(dateSort, /if \(!sameNodeOrder\(cards, sorted\)\)/,
  'date-sort DOM movement must be guarded by actual order change');
assert.doesNotMatch(dateSort, /for \(const card of cards\) list\.appendChild\(card\);/,
  'committee date sorter must not reappend an already-sorted observed card set');
assert.doesNotMatch(dateSort, /for \(const card of cards\) list\.insertBefore\(card, trailer \|\| null\);/,
  'contribution date sorter must not reinsert an already-sorted observed card set');
assert.match(bootstrap, /const GIVING_ASSET_EPOCH = '20260816-4'/);
assert.match(bootstrap, /const GIVING_SEARCH_BACKPRESSURE_EPOCH = '20260817-1'/);
assert.match(bootstrap, /const GIVING_PRACTICE_EPOCH = '20260817-12'/);
assert.match(bootstrap, /const GIVING_OBSERVER_IDEMPOTENCE_EPOCH = '20260818-1'/);
assert.match(bootstrap, /observerUrl\('\.\/giving-transaction-classification\.js'\)/);
assert.match(bootstrap, /observerUrl\('\.\/giving-date-sort\.js'\)/);
assert.match(bootstrap, /giving-review-paging-core\.js\?v=20260813-3&repair=20260818-1/);
assert.match(bootstrap, /giving-practice-runtime\.js/);
assert.match(bootstrap, /giving-practice-surface-bridge\.js/);
assert.match(bootstrap, /giving-practice-directory\.js/);
assert.match(bootstrap, /fetch\(sourceUrl\('\.\/giving-fec-resilience\.js\?v=20260814-1'\), \{ cache: 'reload'/);
assert.match(givingIndex, /giving-bootstrap\.js\?v=20260817-1/);

assert.match(sharedAccess, /Close shared access/);
assert.match(sharedAccess, /session\.shared-access\.revoke/);
assert.match(browserProbe, /witnessGivingPracticeFixture/);
assert.match(practiceAssay, /outgrow the obsolete 49-row toy dataset/);
assert.match(practiceAssay, /local_practice_file_saved_and_reopened:\s*true/);
assert.match(practiceAssay, /encrypted_practice_vault_version_observed:\s*true/);
assert.match(practiceAssay, /must wake on confirmed exit/);
assert.match(workflow, /Witness originating Giving practice fixture with Chromium/);

console.log('giving-post640-polish.test.mjs passed');
