import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

const stateCss = read('app/giving/history/giving-state-filter.css');
const shell = read('app/giving/history/giving-ux-resilience-shell.js');
const shellCss = read('app/giving/history/giving-ux-resilience.css');
const help = read('app/giving/history/giving-dossier-help.js');
const helpCss = read('app/giving/history/giving-dossier-help.css');
const practice = read('app/giving/history/giving-practice-hydration.js');
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

assert.doesNotThrow(() => new Function(shell), 'Giving resilience shell must remain browser-parseable');
assert.doesNotThrow(() => new Function(renderBackpressure.replace(/export const[\s\S]*$/m, '')), 'Giving search backpressure module must remain browser-parseable');

assert.match(stateCss, /@media \(max-width: 760px\)[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/, 'mobile state and municipal selectors must preserve the desktop two-column option grammar');

assert.match(shell, /One contributor research file = one investigation\./);
assert.match(shell, /researchFileVaultButton/);
assert.match(shell, /Load fictional sample/);
assert.match(shell, /td613:giving-practice-load-request/);
assert.match(shell, /First encrypted save: choose a passphrase here\./);
assert.match(shell, /Untitled contributor research/);
assert.match(shell, /scrollViewToTop\('view-vault'\)/);
assert.match(shell, /dossier-single-picker/);

for (const name of ['SpongeBob SquarePants', 'Patrick Star', 'Sandy Cheeks', 'Eugene H. Krabs', 'Squidward Q. Tentacles']) assert.ok(practice.includes(name));
assert.match(practice, /Krusty Krab Parking Expansion Referendum Committee/);
assert.match(practice, /exact\.checked = true/);
assert.match(practice, /8000 \+ \(hash % 8001\)/);
assert.match(practiceCss, /\.fictional-sample-chip/);
assert.match(practiceCss, /\.dossier-single-picker-menu\.giving-state-filter-menu \{[\s\S]*?grid-template-columns: 1fr/);

assert.match(help, /Contributor research file/);
assert.match(help, /Giving calls this object a dossier internally/);
assert.match(help, /custodyModeHelp/);
assert.match(helpCss, /font-size:\s*13px/);
assert.match(helpCss, /font-weight:\s*500/);

assert.match(shellCss, /\.campaign-segmented-control\s*\{[\s\S]*?gap:\s*5px/);
assert.match(shellCss, /\.review-hold-button\s*\{[\s\S]*?translateY\(-2px\)/);
assert.match(polish, /#sessionTitle::after[\s\S]*?TD613 Giving/);

assert.match(pageSize, /const PAGE_SIZE = 300/);
assert.match(pageSize, /const FEC_BOUNDARY_PAGE_SIZE = 100/);
assert.match(pageSize, /Math\.min\(sourceCeiling, Math\.floor\(requested\)\)/, 'legacy page shim may narrow by source contract but may not widen the client request');
assert.match(reviewPagingCore, /const PAGE_SIZE = 50/);
assert.match(reviewPagingCore, /const LEGACY_RENDER_SLICE = 300/);
assert.match(reviewPagingCore, /givingSearchRender === 'deferred'/);
assert.match(reviewPagingCore, /if \(reviewRenderDeferred\(\)\) return \[\]/);
assert.match(reviewPagingCore, /nativeSlice\.call\(source, offset, offset \+ PAGE_SIZE\)/);
assert.match(renderBackpressure, /runButton\.disabled/);
assert.match(renderBackpressure, /root\.dataset\.givingSearchRender = 'deferred'/);
assert.match(renderBackpressure, /delete root\.dataset\.givingSearchRender/);
assert.match(renderBackpressure, /td613:giving-run-settled/);
assert.match(reviewPaging, /giving-review-paging-core\.js\?v=20260813-3/);
assert.match(bootstrap, /const GIVING_ASSET_EPOCH = '20260816-4'/);
assert.match(bootstrap, /const GIVING_SEARCH_BACKPRESSURE_EPOCH = '20260817-1'/);
assert.match(bootstrap, /const GIVING_PEDAGOGUE_EPOCH = '20260817-2'/);
assert.match(bootstrap, /giving-practice-hydration\.js/);
assert.match(bootstrap, /giving-practice-surface-bridge\.js/);
assert.match(bootstrap, /fetch\(sourceUrl\('\.\/giving-fec-resilience\.js\?v=20260814-1'\), \{ cache: 'reload'/);
assert.match(givingIndex, /giving-bootstrap\.js\?v=20260817-1/);

assert.match(sharedAccess, /Close shared access/);
assert.match(sharedAccess, /Evict every shared Giving session/);
assert.match(sharedAccess, /session\.shared-access\.revoke/);

assert.match(browserProbe, /witnessGivingPracticeFixture/);
assert.match(browserProbe, /normalizedArtifactDir\.split\('\/'\)\.includes\('practice-production'\)/);
assert.match(browserProbe, /releaseReceiptPolicy:\s*practiceObservation \? 'observe-existing' : 'match-source'/);
assert.ok(practiceAssay.includes("return /\\/api\\/td613-ledger\\/?$/.test(url.pathname);"));
assert.match(practiceAssay, /loading the fictional practice case must not call Giving API/);
assert.match(practiceAssay, /practice load must not start a retrieval run/);
assert.match(practiceAssay, /49 fictional contributions/);
assert.match(practiceAssay, /Open selected file must reopen/);
assert.match(practiceAssay, /practice Vault must keep encrypted custody/);
assert.match(practiceAssay, /confirmed exit must restore the live source picker/);
assert.match(practiceAssay, /evidence_authority_granted:\s*false/);
assert.match(practiceAssay, /consequence_authority_granted:\s*false/);

assert.match(workflow, /Witness originating Giving practice fixture with Chromium/);
assert.match(workflow, /TD613_ARTIFACT_DIR=artifacts\/convergence\/giving-practice[\s\S]*?scripts\/giving-browser-probe\.mjs/);
assert.match(workflow, /Stop Giving practice runtime/);

console.log('giving-post640-polish.test.mjs passed');
