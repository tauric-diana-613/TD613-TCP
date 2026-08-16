import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('app/giving/history/index.html');
const app = read('app/giving/history/giving-app.js');
const apiClient = read('app/giving/history/giving-api.js');
const css = read('app/giving/history/giving.css');
const polish = read('app/giving/history/giving-polish.css');
const bootstrap = read('app/giving/history/giving-bootstrap.js');
const leftRailOrder = read('app/giving/history/giving-left-rail-order.js');
const contactQueue = read('app/giving/history/giving-contact-queue-v2.js');
const runSettled = read('app/giving/history/giving-run-settled.js');
const searchControls = read('app/giving/history/giving-search-controls.js');
const searchControlsCss = read('app/giving/history/giving-search-controls.css');
const campaignTools = read('app/giving/history/giving-campaign-tools-v3.js');
const campaignToolsCss = read('app/giving/history/giving-campaign-tools-v3.css');
const uxShell = read('app/giving/history/giving-ux-resilience-shell.js');
const uxCss = read('app/giving/history/giving-ux-resilience.css');
const clarityCss = read('app/giving/history/giving-clarity.css');
const amountFilter = read('app/giving/history/giving-contribution-amount-filter.js');
const contributionsCopy = read('app/giving/history/giving-contributions-copy.js');
const visibleLanguage = read('app/giving/history/giving-visible-language.js');
const dossierHelp = read('app/giving/history/giving-dossier-help.js');
const dossierHelpCss = read('app/giving/history/giving-dossier-help.css');
const campaignDirectory = read('server/giving/campaign-directory.js');
const constants = read('server/giving/constants.js');
const xlsx = read('app/giving/history/giving-xlsx.js');

assert.match(html, /noindex,nofollow,noarchive,nosnippet/);
assert.doesNotMatch(html, /analytics\.js|speed-insights\.js|https?:\/\//, 'private shell loads no telemetry or third-party assets');
assert.match(html, /id="sessionMembrane"/);
assert.doesNotMatch(html, /id="sessionMembrane"[^>]*\shidden/);
assert.match(html, /id="operatorShell" hidden/);
assert.match(html, /<script type="module" src="\.\/giving-bootstrap\.js\?v=20260816-2"><\/script>/);
assert.match(html, /href="\.\/giving-polish\.css\?v=20260816-2"/);
assert.match(html, /href="\.\/giving\.css\?v=20260816-2"/);
assert.match(bootstrap, /GIVING_ASSET_EPOCH = '20260816-2'/);
for (const asset of [
  'giving-left-rail-order.js', 'giving-export-menu.js', 'giving-contribution-amount-filter.js',
  'giving-state-filter.js', 'giving-review-paging.js', 'giving-ux-resilience-shell.js',
  'giving-run-settled.js', 'giving-contact-queue-v2.js', 'giving-app.js', 'giving-search-controls.js',
  'giving-campaign-tools-v3.js', 'giving-visible-language.js', 'giving-contributions-copy.js',
  'giving-date-sort.js', 'giving-dossier-help.js', 'giving-campaign-tools-v3.css',
  'giving-search-controls.css', 'giving-state-filter.css', 'giving-clarity.css', 'giving-ux-resilience.css'
]) assert.ok(bootstrap.includes(asset), `Giving bootstrap must load ${asset} through the coordinated epoch`);
assert.ok(bootstrap.indexOf('giving-left-rail-order.js') < bootstrap.indexOf('giving-ux-resilience-shell.js'), 'left rail DOM order is established before resilience shell composition');
assert.ok(bootstrap.indexOf('giving-run-settled.js') < bootstrap.indexOf('giving-contact-queue-v2.js'), 'terminal run signal is installed before queued-search orchestration');
assert.ok(bootstrap.indexOf('giving-contribution-amount-filter.js') < bootstrap.indexOf('giving-app.js'), 'amount filter installs at the API boundary before the core client is constructed');
assert.match(leftRailOrder, /rail\.insertBefore\(searchTerms, rail\.firstElementChild\)/);
assert.match(leftRailOrder, /searchTerms\.after\(campaignLookup\)/);
assert.match(leftRailOrder, /campaignLookup\.after\(researchDossier\)/);
assert.match(html, /id="sourceRegistry"/);
assert.match(html, /id="recordList"/);
assert.match(html, /id="committeeLedger"/);
assert.match(html, /id="vaultVersions"/);
assert.match(html, /id="peopleIndex"/);
assert.match(html, /value="street_address"> public street address/, 'public street address is unchecked by default');
assert.doesNotMatch(html, /value="street_address"\s+checked/);

assert.match(html, /id="exactMatchToggle"/);
assert.match(html, /id="amountMin"/);
assert.match(html, /id="amountMax"/);
assert.ok(html.indexOf('id="searchHints"') < html.indexOf('id="amountMin"'), 'amount range follows Identity Hints');
assert.ok(html.indexOf('id="amountMax"') < html.indexOf('id="dateFrom"'), 'amount range precedes date range');
assert.match(html, /id="holdReviewButton"[^>]*>Hold<\/button>/);
assert.match(html, /id="reviewTargetFilter"/);
assert.match(html, /id="campaignTargetSelect"/);
assert.match(html, /id="campaignTargetSummary"/);
assert.match(html, /id="syncTargetButton"/);
assert.match(html, /id="prepareGivingHistoryButton"/);
assert.match(html, /id="bulkGivingHistoryButton"/);
assert.match(html, /id="exportCampaignDeputyBundleButton"/);
assert.match(html, /id="exportSpreadsheetButton"/);
assert.match(html, /id="exportReviewedSummaryButton"/);
for (const key of ['contributor', 'committee', 'date', 'amount', 'status']) {
  assert.match(html, new RegExp(`data-review-sort="${key}"`));
}

assert.ok(html.indexOf('<nav class="ledger-tabs"') < html.indexOf('<div class="ledger-column">'), 'section rail is structurally above the ledger column');
assert.match(html, /class="dossier-action-button" id="newDossierButton"/);
assert.match(html, /class="dossier-action-button primary" id="saveDossierButton"/);
assert.doesNotMatch(html, /class="button[^\"]*" id="(?:newDossierButton|saveDossierButton)"/, 'dossier actions cannot inherit the global mobile button minimum');

assert.match(html, />Contributions <span id="reviewCount">/);
assert.match(html, /<h2>Contributions<\/h2>/);
assert.match(html, /aria-label="Contributions sort columns"/);
assert.doesNotMatch(html, /Identity review/i, 'legacy Identity Review label is removed from the page shell');
assert.match(html, /id="campaignDirectoryPanel"/);
assert.ok(html.indexOf('id="campaignDirectoryPanel"') < html.indexOf('</aside>'), 'candidate and committee lookup lives in the left control rail');
assert.ok(html.indexOf('id="syncTargetButton"') < html.indexOf('id="syncLoadedCommitteeButton"'), 'existing donor sync remains above loaded committee sync');
assert.ok(html.indexOf('id="createContactButton"') < html.indexOf('id="bulkExactContactsButton"'), 'new-record donor action remains above multi-contact sync');
assert.match(html, /id="loadedCampaignContext"/);
assert.match(html, /id="campaignDeputyLoadedContext"/);

assert.match(app, /const MAX_SOURCE_CONCURRENCY = 3/);
assert.match(app, /recordBelongsToTarget/);
assert.match(app, /searchTargetFromQuery/);
assert.match(app, /syncTargetCommittees/);
assert.match(app, /syncSelectedTarget/);
assert.match(app, /prepareGivingHistoryBatch/);
assert.match(app, /prepareMultiContactGivingHistory/);
assert.match(app, /campaignDeputyGivingHistoryCsv/);
assert.match(app, /campaign-deputy\.prepare-giving-history/);
assert.match(app, /buildDossierXlsx/);
assert.match(app, /campaign-deputy\.link-existing/);
assert.match(app, /confirmed: true/);
assert.match(app, /duplicate_reviewed: true/);
assert.match(app, /campaign-deputy\.withhold/);
assert.match(app, /if \(!state\.holdReview\) clearReviewForNewSearch\(\)/, 'new searches replace the review working set unless Hold is active');
assert.match(app, /state\.holdReview = !state\.holdReview/);
assert.match(app, /if \(state\.reviewSort\.key\) records\.sort\(compareReviewRecords\);[\s\S]*const visible = records\.slice\(0, MAX_REVIEW_RENDER\)/, 'the full filtered review is sorted before the render cap');
assert.match(app, /state\.dossier\.query\?\.exact_match[\s\S]*rawRecords\.filter/, 'Exact Match filters source records before they enter the dossier');
assert.match(app, /td613:giving-select-target/);
assert.match(app, /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/);
assert.match(html, /Source failures and partial coverage/i);

assert.match(apiClient, /GIVING_SEARCH_MIN_TIMEOUT_MS = 58_000/);
assert.match(apiClient, /operation === 'search\.page'/);
assert.match(apiClient, /campaign-deputy\.ensure-committee/);
assert.match(apiClient, /body\?\.session\?\.intent_nonce/, 'mutation client accepts rotated session intent from the response envelope');

assert.match(css, /@media \(max-width: 760px\)/);
assert.match(css, /@media \(max-width: 430px\)/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /\.ledger-tabs \{/);
assert.match(polish, /\.control-rail \{[\s\S]*grid-row: 1 \/ span 2/);
assert.match(polish, /\.ledger-tabs \{[\s\S]*grid-column: 2;[\s\S]*grid-row: 1;[\s\S]*display: flex;[\s\S]*height: 42px/);
assert.match(polish, /\.ledger-column \{[\s\S]*grid-column: 2;[\s\S]*grid-row: 2;[\s\S]*padding-top: 0/);
assert.doesNotMatch(polish, /position:\s*fixed\s*!important/, 'rail no longer depends on the failed fixed-position override stack');
assert.match(polish, /\.dossier-action-button \{[\s\S]*height: 26px;[\s\S]*max-height: 26px/);
assert.match(polish, /@media \(max-width: 430px\)[\s\S]*\.dossier-action-button \{[\s\S]*height: 24px;[\s\S]*max-height: 24px/);
assert.match(polish, /\.review-hold-button\[data-held="true"\]/);
assert.match(polish, /\.review-sort-header/);
assert.match(polish, /\.contact-queue-panel/);
assert.match(polish, /\.campaign-target-panel/);
assert.match(polish, /\.target-lineage/);

assert.match(contactQueue, /searchTargetFromQuery/);
assert.match(contactQueue, /Contact queue/);
assert.match(contactQueue, />Add contact<\/button>/);
assert.match(contactQueue, /one per line for a list; commas stay inside names/);
assert.match(contactQueue, /use current sources at run/);
assert.match(contactQueue, /queueMessage\('Enter a contact name first\.'/);
assert.match(contactQueue, /Select at least one source before running the queue/);
assert.match(contactQueue, /setHold\(index > 0 \? true : originalHold\)/, 'later queued contacts accumulate as partitioned targets');
assert.match(contactQueue, /td613:giving-select-target/);
assert.match(contactQueue, /td613:giving-clear-all/);
assert.match(contactQueue, /td613:giving-run-settled/);
assert.match(contactQueue, /SOURCE HOLD/);
assert.match(contactQueue, /CLIENT HOLD/);
assert.match(contactQueue, /queue\.length >= 5/);
assert.match(contactQueue, /exact\.textContent = 'Exact'/);
assert.match(contactQueue, /stopButton\.hidden = !queueRunning/);
assert.match(runSettled, /cardsTerminal/);
assert.match(runSettled, /held_sources/);
assert.match(runSettled, /td613:giving-run-settled/);

assert.match(searchControls, /DEFAULT_DATE_FROM = '2020-01-01'/);
assert.match(searchControls, /id = 'clearSearchButton'/);
assert.match(searchControls, /textContent = 'Clear search'/);
assert.match(searchControls, /data-start-year="2020"/);
assert.match(searchControls, /data-start-year="2022"/);
assert.match(searchControls, /data-start-year="2024"/);
assert.match(searchControls, /newDossierButton/);
assert.match(searchControls, /td613:giving-clear-all/);
assert.match(searchControls, /run\.textContent = 'SEARCH'/);
assert.match(searchControls, /run\.dataset\.primarySearch = 'true'/);
assert.match(searchControls, /aria-label', 'Search selected sources'/);
assert.match(searchControls, /form\.addEventListener\('submit', scrollSearchToTop\)/, 'the primary SEARCH gesture also scrolls the operator to the top');
assert.match(searchControls, /window\.scrollTo\(\{ top: 0, left: 0, behavior \}\)/);
assert.doesNotMatch(searchControls, /createElement\('style'\)/, 'search controls styling is CSP-safe and external');
assert.match(searchControlsCss, /#runSearchButton\[data-primary-search="true"\]/);
assert.match(searchControlsCss, /drop-shadow\(0 0 3px rgba\(118, 234, 212, \.42\)\)/, 'primary search halo remains visibly cyan outside the clipped button');
assert.match(searchControlsCss, /@media \(max-width: 760px\)[\s\S]*\.ledger-column \{ min-height: 0; \}/);
assert.match(searchControlsCss, /#view-search \{ min-height: 0; padding-bottom: 12px; \}/);
assert.match(searchControlsCss, /source-progress-grid > \.empty-state \{[\s\S]*min-height: 92px/, 'mobile pre-search empty runway is compact rather than reordered');

assert.match(amountFilter, /import \{ GivingApiClient \}/);
assert.match(amountFilter, /__td613AmountFilterInstalled/);
assert.match(amountFilter, /operation === 'search\.page'/);
assert.match(amountFilter, /client_amount_filter/);
assert.match(amountFilter, /record\.amount_cents/);
assert.match(amountFilter, /activeBounds = boundsFromForm\(\)/);
assert.match(amountFilter, /Maximum contribution must be greater than or equal to minimum contribution/);
assert.match(amountFilter, /td613:giving-clear-all/);
assert.doesNotMatch(amountFilter, /MutationObserver/, 'amount filtering occurs before dossier admission rather than after the review render cap');

assert.match(contributionsCopy, /Identity Review/);
assert.match(contributionsCopy, /Contributions/);
assert.match(contributionsCopy, /holdReviewButton/);
assert.match(contributionsCopy, /toastStack/);
assert.match(visibleLanguage, /textContent = 'Match'/);

assert.match(campaignTools, /value="FEDERAL"|FEDERAL/);
assert.match(campaignTools, /Promise\.allSettled/);
assert.match(campaignTools, /Load committee → Contributions/);
assert.match(campaignTools, /Load candidate → Contributions/);
assert.match(campaignTools, /campaign-deputy\.ensure-committee/);
assert.match(campaignTools, /syncLoadedCommittee/);
assert.match(campaignTools, /bulkSyncExactContacts/);
assert.match(campaignTools, /matches\.length !== 1/, 'multi-contact sync holds missing and ambiguous Campaign Deputy identities');
assert.match(campaignTools, /no exact Campaign Deputy person/);
assert.match(campaignTools, /ambiguous exact Campaign Deputy name/);
assert.match(campaignTools, /linkCommitteeForCurrentTarget/);
assert.doesNotMatch(campaignTools, /create-confirmed|Create person/, 'bulk exact-contact gesture cannot silently create Campaign Deputy people');
assert.match(campaignTools, /aggregate organization context/);
assert.match(campaignTools, /include_opensecrets: index === 0/);
assert.doesNotMatch(campaignTools, /createElement\('style'\)/, 'campaign tools styling cannot depend on CSP-blocked inline style injection');
assert.match(campaignToolsCss, /\.campaign-directory-panel/);
assert.match(campaignToolsCss, /\.campaign-deputy-sync-tools/);
assert.match(campaignToolsCss, /\.loaded-campaign-context/);
assert.match(uxShell, /campaign-directory-jurisdiction/);
assert.match(uxShell, /campaignDirectoryStateAll/);
assert.match(uxShell, /campaignDirectoryMunicipalAll/);
assert.match(uxShell, /vaultChildLegibleGuide/);
assert.match(uxShell, /committee-ledger-toolbar/);
assert.match(uxCss, /\.vault-child-legible-guide/);
assert.match(uxCss, /\.committee-ledger-toolbar/);
assert.match(clarityCss, /\.readiness-tooltip/);
assert.match(clarityCss, /\.contact-queue-list\.contact-queue-scrollbox/);

assert.match(dossierHelp, /Research Dossier/);
assert.match(dossierHelp, /🛈︎/);
assert.match(dossierHelp, /headingParent\.insertBefore\(line, heading\)/);
assert.match(dossierHelp, /line\.appendChild\(heading\)/);
assert.match(dossierHelp, /line\.appendChild\(help\)/);
assert.match(dossierHelp, /document\.body\.appendChild\(popup\)/, 'tooltip is portaled outside the clipped dossier panel');
assert.doesNotMatch(dossierHelp, /heading\.append/, 'the info control must never be nested inside the heading typography');
assert.match(dossierHelp, /giving-dossier-help\.css\?v=20260812-2/);
assert.doesNotMatch(dossierHelp, /createElement\('style'\)/, 'tooltip styling must not depend on CSP-blocked injected style elements');
assert.match(dossierHelp, /popup\.hidden = true/);
assert.match(dossierHelp, /popup\.hidden = !open/);
assert.match(dossierHelp, /pointerenter/);
assert.match(dossierHelp, /pointerleave/);
assert.match(dossierHelp, /rightwardLeft/);
assert.match(dossierHelpCss, /\.research-dossier-help-popup\[hidden\]/);
assert.match(dossierHelpCss, /display:\s*none\s*!important/);
assert.match(dossierHelpCss, /\.research-dossier-help \{[\s\S]*flex:\s*0 0 13px/);
assert.match(dossierHelpCss, /\.research-dossier-help-trigger \{[\s\S]*font-size:\s*10px/);
assert.match(dossierHelpCss, /\.research-dossier-help-popup \{[\s\S]*position:\s*fixed/);
assert.match(dossierHelpCss, /z-index:\s*10000/);
assert.match(dossierHelpCss, /font-size:\s*8px/);
assert.match(dossierHelpCss, /pointer-events:\s*none/);
assert.match(dossierHelp, /Local keeps the dossier in this browser/);
assert.match(dossierHelp, /conflicting hosted branches are preserved for human reconciliation/);

assert.match(campaignDirectory, /method', 'getOrgs'/);
assert.match(campaignDirectory, /method', 'orgSummary'/);
assert.match(campaignDirectory, /output', 'json'/);
assert.match(campaignDirectory, /apikey', key/);
assert.match(campaignDirectory, /AGGREGATE_ORGANIZATION_INTELLIGENCE_NOT_INDIVIDUAL_DONOR_TRANSACTIONS/);
assert.match(campaignDirectory, /REVIEWED_FEC_COMMITTEE_IDENTITY_TO_CAMPAIGN_DEPUTY_LIST/);
assert.match(campaignDirectory, /external_contribution_created: false/);
assert.match(campaignDirectory, /fec_committee_id/);
assert.match(campaignDirectory, /includeOpenSecrets = payload\.include_opensecrets !== false/);
assert.match(constants, /OPENSECRETS_API_KEY/);
assert.match(constants, /www\.opensecrets\.org/);
assert.doesNotMatch(constants, /opensecrets[^\n]*source_instance/i, 'OpenSecrets enrichment is not registered as a donor-transaction source');

assert.match(xlsx, /Giving Records/);
assert.match(xlsx, /Search Target/);
assert.match(xlsx, /autoFilter/);
assert.match(xlsx, /state="frozen"/);
assert.match(xlsx, /0x06054b50/, 'spreadsheet is packaged as a native ZIP-based XLSX without a CDN dependency');

const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]));
const clientIdReferences = [...app.matchAll(/\$\('#([^']+)'\)/g)].map((match) => match[1].split(/[\s:[.]/, 1)[0]);
assert.deepEqual([...new Set(clientIdReferences.filter((id) => !htmlIds.has(id)))], [], 'every direct core-client DOM reference exists in the private shell');

console.log('giving-client-surface.test.mjs passed');
