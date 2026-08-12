import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'app/giving/history/index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app/giving/history/giving-app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'app/giving/history/giving.css'), 'utf8');
const polish = fs.readFileSync(path.join(root, 'app/giving/history/giving-polish.css'), 'utf8');
const bootstrap = fs.readFileSync(path.join(root, 'app/giving/history/giving-bootstrap.js'), 'utf8');
const contactQueue = fs.readFileSync(path.join(root, 'app/giving/history/giving-contact-queue.js'), 'utf8');
const xlsx = fs.readFileSync(path.join(root, 'app/giving/history/giving-xlsx.js'), 'utf8');

assert.match(html, /noindex,nofollow,noarchive,nosnippet/);
assert.doesNotMatch(html, /analytics\.js|speed-insights\.js|https?:\/\//, 'private shell loads no telemetry or third-party assets');
assert.match(html, /id="sessionMembrane"/);
assert.doesNotMatch(html, /id="sessionMembrane"[^>]*\shidden/);
assert.match(html, /id="operatorShell" hidden/);
assert.match(html, /<script type="module" src="\.\/giving-bootstrap\.js\?v=20260812-3"><\/script>/);
assert.match(html, /href="\.\/giving-polish\.css\?v=20260812-3"/);
assert.match(html, /href="\.\/giving\.css\?v=20260812-3"/);
assert.match(bootstrap, /giving-contact-queue\.js\?v=20260812-3/);
assert.match(bootstrap, /giving-app\.js\?v=20260812-3/);
assert.match(html, /id="sourceRegistry"/);
assert.match(html, /id="recordList"/);
assert.match(html, /id="committeeLedger"/);
assert.match(html, /id="vaultVersions"/);
assert.match(html, /id="peopleIndex"/);
assert.match(html, /value="street_address"> public street address/, 'public street address is unchecked by default');
assert.doesNotMatch(html, /value="street_address"\s+checked/);

assert.match(html, /id="exactMatchToggle"/);
assert.match(html, /id="holdReviewButton"[^>]*>Hold<\/button>/);
assert.match(html, /id="reviewTargetFilter"/);
assert.match(html, /id="campaignTargetSelect"/);
assert.match(html, /id="campaignTargetSummary"/);
assert.match(html, /id="syncTargetButton"/);
assert.match(html, /id="exportSpreadsheetButton"/);
for (const key of ['contributor', 'committee', 'amount', 'status']) {
  assert.match(html, new RegExp(`data-review-sort="${key}"`));
}

assert.ok(html.indexOf('<nav class="ledger-tabs"') < html.indexOf('<div class="ledger-column">'), 'section rail is structurally above the ledger column');
assert.match(html, /class="dossier-action-button" id="newDossierButton"/);
assert.match(html, /class="dossier-action-button primary" id="saveDossierButton"/);
assert.doesNotMatch(html, /class="button[^\"]*" id="(?:newDossierButton|saveDossierButton)"/, 'dossier actions cannot inherit the global mobile button minimum');

assert.match(app, /const MAX_SOURCE_CONCURRENCY = 3/);
assert.match(app, /recordBelongsToTarget/);
assert.match(app, /searchTargetFromQuery/);
assert.match(app, /syncTargetCommittees/);
assert.match(app, /syncSelectedTarget/);
assert.match(app, /buildDossierXlsx/);
assert.match(app, /campaign-deputy\.link-existing/);
assert.match(app, /confirmed: true/);
assert.match(app, /duplicate_reviewed: true/);
assert.match(app, /campaign-deputy\.withhold/);
assert.match(app, /if \(!state\.holdReview\) clearReviewForNewSearch\(\)/, 'new searches replace Identity Review unless Hold is active');
assert.match(app, /state\.holdReview = !state\.holdReview/);
assert.match(app, /if \(state\.reviewSort\.key\) records\.sort\(compareReviewRecords\);[\s\S]*const visible = records\.slice\(0, MAX_REVIEW_RENDER\)/, 'the full filtered review is sorted before the render cap');
assert.match(app, /state\.dossier\.query\?\.exact_match[\s\S]*rawRecords\.filter/, 'Exact Match filters source records before they enter the dossier');
assert.match(app, /td613:giving-select-target/);
assert.match(app, /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/);
assert.match(html, /Source failures and partial coverage/i);

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
assert.match(contactQueue, /one per line; commas stay inside names/);
assert.match(contactQueue, /if \(index > 0\) setHold\(true\)/, 'later queued contacts accumulate as partitioned targets');
assert.match(contactQueue, /td613:giving-select-target/);
assert.match(contactQueue, /fec-schedule-a/, 'OpenFEC client diagnostics are surfaced beside retryable source failures');

assert.match(xlsx, /Giving Records/);
assert.match(xlsx, /Search Target/);
assert.match(xlsx, /autoFilter/);
assert.match(xlsx, /state="frozen"/);
assert.match(xlsx, /0x06054b50/, 'spreadsheet is packaged as a native ZIP-based XLSX without a CDN dependency');

const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]));
const clientIdReferences = [...app.matchAll(/\$\('#([^']+)'\)/g)].map((match) => match[1].split(/[\s:[.]/, 1)[0]);
assert.deepEqual([...new Set(clientIdReferences.filter((id) => !htmlIds.has(id)))], [], 'every direct core-client DOM reference exists in the private shell');

console.log('giving-client-surface.test.mjs passed');
