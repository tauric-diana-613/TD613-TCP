import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'app/giving/history/index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app/giving/history/giving-app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'app/giving/history/giving.css'), 'utf8');
const polish = fs.readFileSync(path.join(root, 'app/giving/history/giving-polish.css'), 'utf8');

assert.match(html, /noindex,nofollow,noarchive,nosnippet/);
assert.doesNotMatch(html, /analytics\.js|speed-insights\.js|https?:\/\//, 'private shell loads no telemetry or third-party assets');
assert.match(html, /id="sessionMembrane"/);
assert.doesNotMatch(html, /id="sessionMembrane"[^>]*\shidden/);
assert.match(html, /id="operatorShell" hidden/);
assert.match(html, /<script type="module" src="\.\/giving-app\.js"><\/script>/);
assert.match(html, /href="\.\/giving-polish\.css"/);
assert.match(html, /id="sourceRegistry"/);
assert.match(html, /id="recordList"/);
assert.match(html, /id="committeeLedger"/);
assert.match(html, /id="vaultVersions"/);
assert.match(html, /id="peopleIndex"/);
assert.match(html, /value="street_address"> public street address/, 'public street address is unchecked by default');
assert.doesNotMatch(html, /value="street_address"\s+checked/);

assert.match(html, /id="exactMatchToggle"/);
assert.match(html, /id="holdReviewButton"[^>]*>Hold<\/button>/);
for (const key of ['contributor', 'committee', 'amount', 'status']) {
  assert.match(html, new RegExp(`data-review-sort="${key}"`));
}

assert.match(app, /const MAX_SOURCE_CONCURRENCY = 3/);
assert.match(app, /state\.dossier\.decisions\[recordDigest\(record\)\] === IDENTITY_STATUS\.CONFIRMED/);
assert.match(app, /campaign-deputy\.link-existing/);
assert.match(app, /confirmed: true/);
assert.match(app, /duplicate_reviewed: true/);
assert.match(app, /campaign-deputy\.withhold/);
assert.match(app, /if \(!state\.holdReview\) clearReviewForNewSearch\(\)/, 'new searches replace Identity Review unless Hold is active');
assert.match(app, /state\.holdReview = !state\.holdReview/);
assert.match(app, /if \(state\.reviewSort\.key\) records\.sort\(compareReviewRecords\);[\s\S]*const visible = records\.slice\(0, MAX_REVIEW_RENDER\)/, 'the full filtered review is sorted before the render cap');
assert.match(app, /state\.dossier\.query\?\.exact_match[\s\S]*rawRecords\.filter/, 'Exact Match filters source records before they enter the dossier');
assert.match(html, /Source failures and partial coverage/i);

assert.match(css, /@media \(max-width: 760px\)/);
assert.match(css, /@media \(max-width: 430px\)/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /\.ledger-tabs \{/);
assert.match(polish, /\.ledger-tabs \.tab[\s\S]*min-height: 38px/, 'mobile tabs stay compact');
assert.match(polish, /overflow-x: auto/);
assert.match(polish, /\.dossier-actions #newDossierButton,[\s\S]*#saveDossierButton/);
assert.match(polish, /\.review-hold-button\[data-held="true"\]/);
assert.match(polish, /\.review-sort-header/);

const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]));
const clientIdReferences = [...app.matchAll(/\$\('#([^']+)'\)/g)].map((match) => match[1].split(/[\s:[.]/, 1)[0]);
assert.deepEqual([...new Set(clientIdReferences.filter((id) => !htmlIds.has(id)))], [], 'every direct client DOM reference exists in the private shell');

console.log('giving-client-surface.test.mjs passed');
