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

assert.match(browserProbe, /witnessGivingPracticeFixture/);
assert.match(browserProbe, /normalizedArtifactDir\.split\('\/'\)\.includes\('practice-production'\)/, 'bounded practice-production artifact custody must request the production fixture witness');
assert.match(browserProbe, /releaseReceiptPolicy:\s*practiceObservation \? 'observe-existing' : 'match-source'/, 'practice observation must select observe-existing provenance explicitly');
assert.match(browserProbe, /production && practiceObservation[\s\S]*?productionPracticeWitness = await witnessGivingPracticeFixture\(page\)/, 'production practice must execute the actual Bikini Bottom fixture assay');
assert.match(browserProbe, /item\?\.status !== 401 \|\| item\?\.method !== 'POST' \|\| item\?\.operation !== 'session\.status'/, 'only an exact pre-auth session.status refusal may be classified as expected');
assert.match(browserProbe, /target\.pathname === '\/api\/td613-ledger'/, 'protected refusal classification must be pinned to the real Giving boundary');
assert.match(browserProbe, /async function waitForSessionBootstrapSettlement\(\)/, 'production practice must expose a semantic session-bootstrap barrier');
assert.ok(
  browserProbe.includes("() => ['open', 'closed'].includes(document.documentElement.dataset.session || '')"),
  'session barrier must wait on the product-authored open-or-closed state'
);
assert.match(browserProbe, /sessionBootstrapState = await waitForSessionBootstrapSettlement\(\);[\s\S]*?await exposeOperatorShell\(\);[\s\S]*?witnessGivingPracticeFixture\(page\)/, 'pre-auth session bootstrap must settle before the practice shell is exposed and the fixture causal window begins');
assert.doesNotMatch(browserProbe, /async function requireResilienceShell\(\) \{\s*await page\.waitForTimeout\(450\)/, 'resilience hydration must use a semantic selector boundary rather than a fixed sleep');
assert.match(browserProbe, /practiceFailedResourceDelta = failedResources\.slice\(failedBeforePractice\)/, 'production witness must measure failed network responses introduced by the practice click itself');
assert.match(browserProbe, /production practice fixture must not cause failed network responses/, 'practice click network failures remain fatal');
assert.match(browserProbe, /session_bootstrap_state:\s*sessionBootstrapState/);
assert.match(browserProbe, /expected_protected_refusals:\s*expectedProtectedRefusals/);
assert.match(browserProbe, /failed_resources:\s*unexpectedFailedResources/);
assert.match(browserProbe, /production practice receipt cannot seal without an observed fixture PASS/);
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
