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
const bootstrap = read('app/giving/history/giving-bootstrap.js');
const browserProbe = read('scripts/giving-browser-probe.mjs');
const practiceAssay = read('scripts/giving-practice-fixture-browser-assay.mjs');
const workflow = read('.github/workflows/td613-ci.yml');

assert.doesNotThrow(() => new Function(shell), 'Giving resilience shell must remain browser-parseable');

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
assert.match(pageSize, /Math\.min\(sourceCeiling, Math\.floor\(requested\)\)/, 'legacy page shim may narrow but never widen the client-requested 50-row page');

assert.match(sharedAccess, /Close shared access/);
assert.match(sharedAccess, /Evict every shared Giving session/);
assert.match(sharedAccess, /session\.shared-access\.revoke/);

assert.match(bootstrap, /const GIVING_ASSET_EPOCH = '20260816-5'/);
assert.match(bootstrap, /givingResilienceShellReady = 'true'/);
assert.match(bootstrap, /givingBootstrapReady = 'true'/);
assert.match(bootstrap, /publishSettlement\('resilience-shell'\)/);
assert.match(bootstrap, /publishSettlement\('bootstrap'\)/);
const stateFilterIndex = bootstrap.indexOf("await import(epochUrl('./giving-state-filter.js'))");
const shellImportIndex = bootstrap.indexOf("await import(epochUrl('./giving-ux-resilience-shell.js'))");
const shellSettlementIndex = bootstrap.indexOf("publishSettlement('resilience-shell')");
const reviewPagingIndex = bootstrap.indexOf("await import(epochUrl('./giving-review-paging.js'))");
const dossierHelpIndex = bootstrap.indexOf("await import(epochUrl('./giving-dossier-help.js'))");
const bootstrapSettlementIndex = bootstrap.lastIndexOf("publishSettlement('bootstrap')");
assert.ok(stateFilterIndex >= 0 && shellImportIndex > stateFilterIndex, 'existing Giving module order must preserve state-filter before resilience shell');
assert.ok(shellSettlementIndex > shellImportIndex && reviewPagingIndex > shellSettlementIndex, 'shell settlement must be published immediately after the existing shell import boundary');
assert.ok(bootstrapSettlementIndex > dossierHelpIndex, 'full bootstrap settlement must be terminal after the complete module graph');

assert.match(browserProbe, /witnessGivingPracticeFixture/);
assert.match(browserProbe, /normalizedArtifactDir\.split\('\/'\)\.includes\('practice-production'\)/, 'bounded practice-production artifact custody must request the production fixture witness');
assert.match(browserProbe, /releaseReceiptPolicy:\s*practiceObservation \? 'observe-existing' : 'match-source'/, 'practice observation must select observe-existing provenance explicitly');
assert.match(browserProbe, /givingResilienceShellReady === 'true'/, 'browser probe must wait on the published shell settlement marker');
assert.doesNotMatch(browserProbe, /waitForTimeout\(450\)/, 'browser probe must not guess shell settlement from a fixed 450ms sleep');
assert.match(browserProbe, /production && practiceObservation[\s\S]*?productionPracticeWitness = await witnessGivingPracticeFixture\(page\)/, 'production practice must execute the actual Bikini Bottom fixture assay');
assert.match(browserProbe, /practice_observation_requested:\s*practiceObservation/);
assert.match(browserProbe, /practice_fixture_load:\s*resilienceWitness\?\.practiceFixture\?\.status \|\| productionPracticeWitness\?\.status/);
assert.match(browserProbe, /production practice receipt cannot seal without an observed fixture PASS/);
assert.match(practiceAssay, /requireBootstrapSettlement/);
assert.match(practiceAssay, /stableSnapshot/);
assert.match(practiceAssay, /givingResilienceShellReady/);
assert.match(practiceAssay, /givingBootstrapReady/);
assert.doesNotMatch(practiceAssay, /waitForTimeout\(150\)/, 'practice fixture must observe post-click state instead of sleeping for 150ms');
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
