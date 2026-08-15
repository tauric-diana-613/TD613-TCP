import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  IDENTITY_STATUS,
  committeeLedger,
  reviewedSummaryCsv
} from '../app/giving/history/giving-model.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('app/giving/history/index.html');
const app = read('app/giving/history/giving-app.js');
const controls = read('app/giving/history/giving-search-controls.js');
const queue = read('app/giving/history/giving-contact-queue.js');
const clarity = read('app/giving/history/giving-clarity.css');
const campaign = read('app/giving/history/giving-campaign-tools-v2.js');

const confirmed = {
  local_digest: 'confirmed-row',
  contributor_name_display: 'Jane Doe',
  committee: 'People for Precision',
  contribution_date: '2026-01-02',
  amount_cents: 12500,
  jurisdiction: 'Florida',
  address: '123 Private Street',
  employer: 'Private Employer',
  occupation: 'Private Occupation',
  source_locator: 'https://example.gov/records?contributor=Jane+Doe#result',
  provisional: true
};
const excluded = {
  ...confirmed,
  local_digest: 'excluded-row',
  contributor_name_display: 'Jane Excluded',
  amount_cents: 5000,
  source_locator: 'https://example.gov/records?contributor=Jane+Excluded'
};
const dossier = {
  records: [confirmed, excluded],
  decisions: {
    'confirmed-row': IDENTITY_STATUS.CONFIRMED,
    'excluded-row': IDENTITY_STATUS.EXCLUDED
  }
};

const summary = reviewedSummaryCsv(dossier);
assert.match(summary, /Jane Doe/);
assert.doesNotMatch(summary, /Jane Excluded|123 Private Street|Private Employer|Private Occupation|contributor=/);
assert.match(summary, /https:\/\/example\.gov\/records/);

const guardedSummary = reviewedSummaryCsv({
  records: [{
    ...confirmed,
    local_digest: 'guarded-row',
    contributor_name_display: '=WEBSERVICE("https://example.test")',
    committee: '+Formula Committee',
    jurisdiction: '@Florida',
    source_locator: 'https://www.voterfocus.com/CampaignFinance/cand_srch.php?c=leon&contributor=Jane#result'
  }],
  decisions: { 'guarded-row': IDENTITY_STATUS.CONFIRMED }
});
assert.match(guardedSummary, /"'=WEBSERVICE/);
assert.match(guardedSummary, /"'\+Formula Committee"/);
assert.match(guardedSummary, /"'@Florida"/);
assert.match(guardedSummary, /cand_srch\.php\?c=leon/);
assert.doesNotMatch(guardedSummary, /contributor=Jane|#result/);
const ledger = committeeLedger(dossier);
assert.equal(ledger.length, 1);
assert.equal(ledger[0].amount_cents, 12500);
assert.equal(ledger[0].deterministic_amount_cents, 0);
assert.equal(ledger[0].provisional_amount_cents, 12500);

assert.match(html, /Normalized exact match/);
assert.match(html, /Identity confirmation is a research determination, not a legal compliance determination/);
assert.match(html, /id="coverageExecutiveLine"/);
assert.match(html, /id="exportReviewedSummaryButton"/);
assert.match(html, /id="filingTotalState"/);
assert.match(html, /id="readinessTooltip"[\s\S]*does not search, sync, create, upload, or deploy anything/);
assert.match(html, /id="campaignDirectoryJurisdiction"/);
assert.match(html, /id="campaignDirectoryStateMenu"/);
assert.match(html, /id="campaignDirectoryLocalMenu"/);
assert.match(html, /value="EXPENDITURES">Expenditure receipts/);
assert.match(html, /id="holdCommitteeButton"/);
assert.match(html, /id="clearCommitteeListButton"[^>]*>Clear</);
assert.match(html, /class="button committee-clear-button" id="clearCommitteeListButton"/);
assert.match(html, /id="committeeSearchWorkspaceList"/);
assert.match(app, /data-exclude-record/);
assert.match(app, /Excluded from ordinary exports and committee totals by operator/);
assert.match(app, /identityStatusLabel/);
assert.match(app, /filing total provisional/);
assert.match(app, /selected sources complete/);
assert.match(controls, /All electronically available\*/);
assert.match(controls, /actual coverage is source-receipt bounded/);
assert.match(queue, /contact-queue-scrollbox/);
assert.match(queue, /queue\.length >= 5/);
assert.match(queue, /exact\.textContent = 'Exact'/);
assert.match(queue, /review\.hidden = item\.status === 'QUEUED' \|\| item\.status === 'RUNNING'/);
assert.match(queue, /item\.exactMatch = !item\.exactMatch/);
assert.match(queue, /stopButton\.hidden = !queueRunning/);
assert.match(queue, /Stop queue/);
assert.match(clarity, /transition: opacity 90ms ease 200ms/);
assert.match(clarity, /\.contact-queue-list\.contact-queue-scrollbox/);
assert.match(campaign, /one jurisdiction-scoped committee activity lane/);
assert.match(campaign, /TRANSIENT_SEPARATE_CAMPAIGN_ACTIVITY|Expenditures remain separate from donor Giving History/);
assert.match(campaign, /jurisdiction === 'FLORIDA_STATE'/);
assert.match(campaign, /query: \{ \.\.\.dateWindow, candidate: query \}/);
assert.match(campaign, /query: \{ \.\.\.dateWindow, committee: query \}/);
assert.match(campaign, /bounded candidate\/committee projections/);
assert.match(campaign, /let committeeHold = false/);
assert.match(campaign, /if \(!committeeHold\) committeeSearchSnapshots = \[\]/);
assert.match(campaign, /window\.confirm\('Clear List\?'\)/);
assert.match(campaign, /clearCommitteeWorkspace/);
assert.doesNotMatch(campaign, /holdReviewButton/);
assert.match(campaign, /Source page boundary reached; more rows may exist/);
assert.match(campaign, /Continue at the public-record source/);
assert.match(clarity, /campaign-activity-coverage-warning/);
assert.match(clarity, /committee-hold-button/);
assert.match(clarity, /committee-search-workspace-list[\s\S]*max-height: 22rem/);

console.log('giving-interpretation-ux.test.mjs passed');

