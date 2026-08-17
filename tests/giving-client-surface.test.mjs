import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('app/giving/history/index.html');
const app = read('app/giving/history/giving-app.js');
const apiClient = read('app/giving/history/giving-api.js');
const bootstrap = read('app/giving/history/giving-bootstrap.js');
const css = read('app/giving/history/giving.css');
const polish = read('app/giving/history/giving-polish.css');
const leftRailOrder = read('app/giving/history/giving-left-rail-order.js');
const queue = read('app/giving/history/giving-contact-queue-v2.js');
const settled = read('app/giving/history/giving-run-settled.js');
const searchControls = read('app/giving/history/giving-search-controls.js');
const searchCss = read('app/giving/history/giving-search-controls.css');
const campaignTools = read('app/giving/history/giving-campaign-tools-v3.js');
const campaignCss = read('app/giving/history/giving-campaign-tools-v3.css');
const uxShell = read('app/giving/history/giving-ux-resilience-shell.js');
const uxCss = read('app/giving/history/giving-ux-resilience.css');
const amountFilter = read('app/giving/history/giving-contribution-amount-filter.js');
const visibleLanguage = read('app/giving/history/giving-visible-language.js');
const dossierHelp = read('app/giving/history/giving-dossier-help.js');
const dossierHelpCss = read('app/giving/history/giving-dossier-help.css');
const campaignDirectory = read('server/giving/campaign-directory.js');
const constants = read('server/giving/constants.js');
const xlsx = read('app/giving/history/giving-xlsx.js');

// Private shell, fresh entry point, and sealed coordinated cache generation.
assert.match(html, /noindex,nofollow,noarchive,nosnippet/);
assert.doesNotMatch(html, /analytics\.js|speed-insights\.js|https?:\/\//, 'private shell loads no telemetry or third-party assets');
assert.match(html, /id="sessionMembrane"/);
assert.match(html, /id="operatorShell" hidden/);
assert.match(html, /giving\.css\?v=20260816-2/);
assert.match(html, /giving-polish\.css\?v=20260816-2/);
assert.match(html, /giving-bootstrap\.js\?v=20260817-1/, 'changed bootstrap bytes require a fresh HTML entry URL');
assert.match(bootstrap, /GIVING_ASSET_EPOCH = '20260816-4'/);
assert.match(bootstrap, /GIVING_SEARCH_BACKPRESSURE_EPOCH = '20260817-1'/);
for (const asset of [
  'giving-left-rail-order.js', 'giving-export-menu.js', 'giving-contribution-amount-filter.js',
  'giving-state-filter.js', 'giving-review-paging.js', 'giving-ux-resilience-shell.js',
  'giving-run-settled.js', 'giving-contact-queue-v2.js', 'giving-app.js', 'giving-shared-access.js',
  'giving-search-controls.js', 'giving-campaign-tools-v3.js', 'giving-visible-language.js',
  'giving-contributions-copy.js', 'giving-date-sort.js', 'giving-dossier-help.js',
  'giving-campaign-tools-v3.css', 'giving-search-controls.css', 'giving-state-filter.css',
  'giving-clarity.css', 'giving-ux-resilience.css'
]) assert.ok(bootstrap.includes(asset), `Giving bootstrap must load ${asset} through the coordinated or explicitly isolated repair epoch`);
assert.ok(bootstrap.indexOf('giving-run-settled.js') < bootstrap.indexOf('giving-contact-queue-v2.js'));
assert.ok(bootstrap.indexOf('giving-contribution-amount-filter.js') < bootstrap.indexOf('giving-app.js'));

// Stable shell structure and non-regression controls.
for (const id of [
  'sourceRegistry', 'recordList', 'committeeLedger', 'vaultVersions', 'peopleIndex', 'exactMatchToggle',
  'amountMin', 'amountMax', 'holdReviewButton', 'reviewTargetFilter', 'campaignTargetSelect',
  'syncTargetButton', 'prepareGivingHistoryButton', 'bulkGivingHistoryButton', 'exportCampaignDeputyBundleButton'
]) assert.match(html, new RegExp(`id="${id}"`));
assert.ok(html.indexOf('id="searchHints"') < html.indexOf('id="amountMin"'));
assert.ok(html.indexOf('id="amountMax"') < html.indexOf('id="dateFrom"'));
assert.match(html, /value="street_address"> public street address/);
assert.doesNotMatch(html, /value="street_address"\s+checked/);
assert.ok(html.indexOf('<nav class="ledger-tabs"') < html.indexOf('<div class="ledger-column">'));
assert.ok(html.indexOf('id="syncTargetButton"') < html.indexOf('id="syncLoadedCommitteeButton"'));
assert.ok(html.indexOf('id="createContactButton"') < html.indexOf('id="bulkExactContactsButton"'));
for (const key of ['contributor', 'committee', 'date', 'amount', 'status']) assert.match(html, new RegExp(`data-review-sort="${key}"`));
assert.doesNotMatch(html, /Identity review/i);

// Existing app semantics remain intact.
assert.match(app, /const MAX_SOURCE_CONCURRENCY = 3/);
assert.match(app, /recordBelongsToTarget/);
assert.match(app, /searchTargetFromQuery/);
assert.match(app, /syncTargetCommittees/);
assert.match(app, /campaign-deputy\.prepare-giving-history/);
assert.match(app, /campaign-deputy\.link-existing/);
assert.match(app, /duplicate_reviewed: true/);
assert.match(app, /if \(!state\.holdReview\) clearReviewForNewSearch\(\)/);
assert.match(app, /if \(state\.reviewSort\.key\) records\.sort\(compareReviewRecords\);[\s\S]*const visible = records\.slice\(0, MAX_REVIEW_RENDER\)/);
assert.match(app, /state\.dossier\.query\?\.exact_match[\s\S]*rawRecords\.filter/);
assert.match(apiClient, /GIVING_SEARCH_MIN_TIMEOUT_MS = 58_000/);
assert.match(apiClient, /body\?\.session\?\.intent_nonce/);
assert.match(amountFilter, /operation === 'search\.page'/);
assert.match(amountFilter, /client_amount_filter/);
assert.doesNotMatch(amountFilter, /MutationObserver/);

// Layout and primary search behavior.
assert.match(css, /@media \(max-width: 760px\)/);
assert.match(css, /prefers-reduced-motion/);
assert.match(polish, /\.control-rail \{[\s\S]*grid-row: 1 \/ span 2/);
assert.doesNotMatch(polish, /position:\s*fixed\s*!important/);
assert.match(leftRailOrder, /rail\.insertBefore\(searchTerms, rail\.firstElementChild\)/);
assert.match(leftRailOrder, /searchTerms\.after\(campaignLookup\)/);
assert.match(leftRailOrder, /campaignLookup\.after\(researchDossier\)/);
assert.match(searchControls, /run\.textContent = 'SEARCH'/);
assert.match(searchControls, /run\.dataset\.primarySearch = 'true'/);
assert.match(searchControls, /form\.addEventListener\('submit', scrollSearchToTop\)/);
assert.match(searchControls, /window\.scrollTo\(\{ top: 0, left: 0, behavior \}\)/);
assert.match(searchCss, /#runSearchButton\[data-primary-search="true"\]/);
assert.match(searchCss, /drop-shadow\(0 0 3px rgba\(118, 234, 212, \.42\)\)/);

// Queue resilience uses one terminal truth and per-contact isolation.
assert.match(queue, /td613:giving-run-settled/);
assert.match(queue, /setHold\(index > 0 \? true : originalHold\)/);
assert.match(queue, /SOURCE HOLD/);
assert.match(queue, /CLIENT HOLD/);
assert.match(queue, /try \{/);
assert.match(queue, /catch \(error\)/);
assert.match(queue, /finally \{/);
assert.match(settled, /cardsTerminal/);
assert.match(settled, /held_sources/);
assert.match(settled, /td613:giving-run-settled/);

// Campaign/PC lookup v3 and Committee toolbar composition.
assert.match(uxShell, /value="FEDERAL"/);
assert.match(uxShell, /value="STATE"/);
assert.match(uxShell, /value="MUNICIPAL"/);
assert.match(uxShell, /campaignDirectoryStateAll/);
assert.match(uxShell, /campaignDirectoryMunicipalAll/);
assert.match(uxShell, /committee-ledger-toolbar/);
assert.match(uxShell, /id = 'vaultGuide'/);
assert.doesNotMatch(uxShell, /ChildLegible|child-legible/i);
assert.match(uxCss, /\.committee-ledger-toolbar/);
assert.match(uxCss, /\.vault-guide/);
assert.match(campaignTools, /Promise\.allSettled/);
assert.match(campaignTools, /document\.querySelector\('\[data-view="ledger"\]'\)\?\.click\(\)/);
assert.match(campaignTools, /localTask\(source, 'CANDIDATE', query, 'STATE'\)/);
assert.match(campaignTools, /localTask\(source, 'COMMITTEE', query, 'STATE'\)/);
assert.match(campaignTools, /localTask\(source, 'CANDIDATE', query, 'MUNICIPAL'\)/);
assert.match(campaignTools, /localTask\(source, 'COMMITTEE', query, 'MUNICIPAL'\)/);
assert.match(campaignTools, /include_opensecrets: index === 0/);
assert.match(campaignTools, /campaign-deputy\.ensure-committee/);
assert.match(campaignTools, /matches\.length !== 1/);
assert.doesNotMatch(campaignTools, /create-confirmed|Create person/);
assert.match(campaignCss, /\.campaign-directory-panel/);
assert.match(campaignCss, /\.campaign-deputy-sync-tools/);

// Operator copy and public/internal boundary.
assert.match(visibleLanguage, /textContent = 'Match'/);
assert.match(dossierHelp, /Contributor research file/);
assert.match(dossierHelp, /document\.body\.appendChild\(popup\)/);
assert.doesNotMatch(dossierHelp, /createElement\('style'\)/);
assert.match(dossierHelpCss, /\.research-dossier-help-popup \{[\s\S]*position:\s*fixed/);
assert.match(dossierHelpCss, /z-index:\s*10000/);

// External enrichment and export invariants.
assert.match(campaignDirectory, /method', 'getOrgs'/);
assert.match(campaignDirectory, /method', 'orgSummary'/);
assert.match(campaignDirectory, /output', 'json'/);
assert.match(campaignDirectory, /apikey', key/);
assert.match(campaignDirectory, /includeOpenSecrets = payload\.include_opensecrets !== false/);
assert.match(campaignDirectory, /AGGREGATE_ORGANIZATION_INTELLIGENCE_NOT_INDIVIDUAL_DONOR_TRANSACTIONS/);
assert.match(campaignDirectory, /external_contribution_created: false/);
assert.match(constants, /OPENSECRETS_API_KEY/);
assert.doesNotMatch(constants, /opensecrets[^\n]*source_instance/i);
assert.match(xlsx, /Giving Records/);
assert.match(xlsx, /Search Target/);
assert.match(xlsx, /autoFilter/);
assert.match(xlsx, /0x06054b50/);

// Every direct core-client DOM reference must remain present in the static shell.
const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]));
const clientIdReferences = [...app.matchAll(/\$\('#([^']+)'\)/g)].map((match) => match[1].split(/[\s:[.]/, 1)[0]);
assert.deepEqual([...new Set(clientIdReferences.filter((id) => !htmlIds.has(id)))], []);

console.log('giving-client-surface.test.mjs passed');
