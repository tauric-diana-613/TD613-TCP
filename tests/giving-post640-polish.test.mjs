import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

const stateCss = read('app/giving/history/giving-state-filter.css');
const shell = read('app/giving/history/giving-ux-resilience-shell.js');
const shellCss = read('app/giving/history/giving-ux-resilience.css');
const help = read('app/giving/history/giving-dossier-help.js');
const helpCss = read('app/giving/history/giving-dossier-help.css');
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

assert.match(
  stateCss,
  /@media \(max-width: 760px\)[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
  'mobile state and municipal selectors must preserve the desktop two-column option grammar'
);

assert.match(shell, /One contributor research file = one investigation\./);
assert.match(shell, /researchFileVaultButton/);
assert.match(shell, /Load fictional sample/);
assert.match(shell, /SpongeBob SquarePants/);
assert.match(shell, /Patrick Star/);
assert.match(shell, /SAMPLE only/);
assert.match(shell, /First encrypted save: choose a passphrase here\./);
assert.match(shell, /Untitled contributor research/);

assert.match(help, /Contributor research file/);
assert.match(help, /Giving calls this object a dossier internally/);
assert.match(helpCss, /font-size:\s*11px/);
assert.match(helpCss, /font-weight:\s*500/);

assert.match(shellCss, /\.campaign-segmented-control\s*\{[\s\S]*?gap:\s*5px/);
assert.match(shellCss, /\.review-hold-button\s*\{[\s\S]*?translateY\(-2px\)/);
assert.match(polish, /#sessionTitle::after[\s\S]*?TD613 Giving/);

assert.match(pageSize, /const PAGE_SIZE = 300/);
assert.match(pageSize, /const FEC_BOUNDARY_PAGE_SIZE = 100/);
assert.match(pageSize, /Math\.min\(sourceCeiling, Math\.floor\(requested\)\)/, 'legacy page shim may narrow by source contract but may not widen the client request');
assert.match(reviewPagingCore, /const PAGE_SIZE = 50/);
assert.match(reviewPagingCore, /const LEGACY_RENDER_SLICE = 300/);
assert.match(reviewPagingCore, /givingSearchRender === 'deferred'/, 'review paging must detect the live search render gate');
assert.match(reviewPagingCore, /if \(reviewRenderDeferred\(\)\) return \[\]/, 'live searches must retain evidence while declining expensive contribution-card DOM materialization');
assert.match(reviewPagingCore, /nativeSlice\.call\(source, offset, offset \+ PAGE_SIZE\)/, 'settled review rendering must remain bounded to the visible page');
assert.match(renderBackpressure, /runButton\.disabled/);
assert.match(renderBackpressure, /root\.dataset\.givingSearchRender = 'deferred'/);
assert.match(renderBackpressure, /delete root\.dataset\.givingSearchRender/);
assert.match(renderBackpressure, /td613:giving-run-settled/);
assert.match(renderBackpressure, /reviewSearch\?\.dispatchEvent\(new Event\('input'/, 'settlement must request one convergence review render');
assert.match(reviewPaging, /giving-review-paging-core\.js\?v=20260817-1/);
assert.match(bootstrap, /const GIVING_ASSET_EPOCH = '20260816-4'/, 'coordinated Giving epoch remains sealed');
assert.match(bootstrap, /const GIVING_SEARCH_BACKPRESSURE_EPOCH = '20260817-1'/, 'search/render repair receives an isolated browser sub-epoch');
assert.match(bootstrap, /repairUrl\('\.\/giving-review-paging\.js'\)/, 'fresh review paging wrapper must load under the repair sub-epoch');
assert.match(bootstrap, /repairUrl\('\.\/giving-search-render-backpressure\.js'\)/, 'search backpressure membrane must load under the repair sub-epoch');
assert.match(bootstrap, /fetch\(sourceUrl\('\.\/giving-api\.js'\), \{ cache: 'reload'/, 'the exact unversioned Giving API child module must be revalidated before app import');
assert.match(givingIndex, /giving-bootstrap\.js\?v=20260817-1/);

assert.match(sharedAccess, /Close shared access/);
assert.match(sharedAccess, /Evict every shared Giving session/);
assert.match(sharedAccess, /session\.shared-access\.revoke/);

assert.match(browserProbe, /witnessGivingPracticeFixture/);
assert.match(browserProbe, /normalizedArtifactDir\.split\('\/'\)\.includes\('practice-production'\)/, 'bounded practice-production artifact custody must request the production fixture witness');
assert.match(browserProbe, /releaseReceiptPolicy:\s*practiceObservation \? 'observe-existing' : 'match-source'/, 'practice observation must select observe-existing provenance explicitly');
assert.match(browserProbe, /production && practiceObservation[\s\S]*?productionPracticeWitness = await witnessGivingPracticeFixture\(page\)/, 'production practice must execute the actual Bikini Bottom fixture assay');
assert.match(browserProbe, /\['session\.status', 'registry\.read'\]\.includes\(item\?\.operation\)/, 'only exact protected bootstrap reads may be eligible for pre-practice classification');
assert.match(browserProbe, /target\.pathname === '\/api\/td613-ledger'/, 'protected refusal classification must be pinned to the real Giving boundary');
assert.match(browserProbe, /givingRequestStarts\.filter\(\(item\) => item\.sequence > practiceRequestBoundary\)/, 'production witness must measure Giving requests by request-start causality after the practice boundary');
assert.match(browserProbe, /production practice fixture must not start Giving API requests/, 'practice-originated Giving requests remain fatal');
assert.match(browserProbe, /request_sequence:\s*Number\.isInteger\(meta\.sequence\)/, 'failed responses must retain the originating Giving request sequence');
assert.match(browserProbe, /item\.request_sequence <= practiceRequestBoundary/, 'protected refusal classification must depend on request start occurring before the practice boundary');
assert.match(browserProbe, /practice_giving_request_delta:\s*practiceGivingRequestDelta/);
assert.match(browserProbe, /expected_protected_refusals:\s*expectedProtectedRefusals/);
assert.match(browserProbe, /failed_resources:\s*unexpectedFailedResources/);
assert.match(browserProbe, /production practice receipt cannot seal without an observed fixture PASS/);
assert.match(browserProbe, /production practice receipt cannot seal if the fixture starts Giving API traffic/);
assert.ok(
  practiceAssay.includes("return /\\/api\\/td613-ledger\\/?$/.test(url.pathname);"),
  'practice assay must observe the real Giving API endpoint rather than the retired /api/giving alias'
);
assert.match(practiceAssay, /loading the fictional practice case must not call Giving API/);
assert.match(practiceAssay, /practice load must not start a retrieval run/);
assert.match(practiceAssay, /practice load must not fabricate or alter contribution records/);
assert.match(practiceAssay, /practice load must not create retrieval\/operator receipts/);
assert.match(practiceAssay, /practice load must not write or hydrate Vault versions/);
assert.match(practiceAssay, /practice load must not create Campaign Deputy receipts/);
assert.match(practiceAssay, /evidence_authority_granted:\s*false/);
assert.match(practiceAssay, /consequence_authority_granted:\s*false/);

assert.match(workflow, /Witness originating Giving practice fixture with Chromium/);
assert.match(workflow, /TD613_ARTIFACT_DIR=artifacts\/convergence\/giving-practice[\s\S]*?scripts\/giving-browser-probe\.mjs/);
assert.match(workflow, /Stop Giving practice runtime/);

console.log('giving-post640-polish.test.mjs passed');
