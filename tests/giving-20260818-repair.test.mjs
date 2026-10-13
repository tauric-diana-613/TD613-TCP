import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_BOUNDARY_SPECIMEN_SCHEMA,
  compilePedagogueBoundaryDiagnosis
} from '../app/engine/pedagogue-boundary-diagnosis.js';
import { _easyVoteInternals } from '../server/giving/adapters/easyvote.js';

const repair = fs.readFileSync('app/giving/history/giving-20260818-repair.js', 'utf8');
const css = fs.readFileSync('app/giving/history/giving-20260818-repair.css', 'utf8');
const bootstrap = fs.readFileSync('app/giving/history/giving-bootstrap.js', 'utf8');
const pageSize = fs.readFileSync('app/giving/history/giving-page-size.js', 'utf8');
const classifier = fs.readFileSync('scripts/classify-validation-scope.mjs', 'utf8');

const diagnosis = compilePedagogueBoundaryDiagnosis({
  schema: PEDAGOGUE_BOUNDARY_SPECIMEN_SCHEMA,
  surface_reference: 'Giving mobile/retrieval/committee repair · 2026-08-18',
  specimen_kind: 'IMPLEMENTATION_CHAPERONE',
  observed: {
    universe_boundary_crossing_unstated: true,
    transient_state_survives_world_exit: true,
    source_finality_label_opaque: true,
    route_affordance_visually_ambiguous: true,
    source_envelope_mismatch: true,
    native_control_geometry_breaches_container: true
  },
  constraints: {
    implementation_this_round: true,
    preserve_durable_custody: true,
    preserve_source_receipts: true
  }
});
const findingCodes = new Set(diagnosis.findings.map((item) => item.code));
const recommendationCodes = new Set(diagnosis.recommendations.map((item) => item.code));
for (const code of [
  'WORLD_BOUNDARY_UNDECLARED', 'EXIT_STATE_LEAK', 'SOURCE_FINALITY_OPAQUE',
  'ROUTE_AFFORDANCE_AMBIGUOUS', 'SOURCE_ENVELOPE_MISMATCH', 'NATIVE_CONTROL_GEOMETRY_BREACH'
]) assert.ok(findingCodes.has(code), `Pedagogue must diagnose ${code}`);
for (const code of [
  'DECLARE_WORLD_TRANSITION_BEFORE_RESTORE', 'PURGE_TRANSIENT_STATE_ON_WORLD_EXIT',
  'NAME_SOURCE_STATE_BY_CONSEQUENCE', 'MARK_ROUTE_AS_ROUTE', 'BOUND_PAGE_BY_SOURCE',
  'BOUND_NATIVE_CONTROL_WITHOUT_REIMPLEMENTING_IT'
]) assert.ok(recommendationCodes.has(code), `Pedagogue must recommend ${code}`);
assert.equal(diagnosis.synthesis.implementation_this_round, true);
assert.equal(diagnosis.authority.product_mutation_authorized, false);
assert.equal(diagnosis.authority.automatic_redesign, false);
assert.equal(diagnosis.authority.automatic_release, false);
assert.equal(diagnosis.authority.human_closure_required, true);
assert.match(classifier, /pedagogue-boundary-diagnosis\.js/, 'generic Pedagogue diagnosis must stay scope-neutral rather than wake unrelated browser estates');

assert.match(bootstrap, /GIVING_REPAIR_EPOCH = '20260818-2'/, 'repair bundle must carry a fresh cache epoch after mobile/boundary changes');
assert.match(bootstrap, /giving20260818RepairStylesheet/, 'repair stylesheet must be loaded by bootstrap');
assert.match(bootstrap, /giving-20260818-repair\.js/, 'repair JS must load last in Giving bootstrap');

assert.match(repair, /moveStateBelowHints/, 'State placement repair must exist');
assert.match(repair, /after-search-hints/, 'State must move directly below Search Hints');
assert.match(repair, /before-filing-sources/, 'committee filter must move immediately before filing sources');
assert.match(repair, /Campaign finance filing sources/, 'technical Electronic Source Instances label must be replaced with field-legible language');
assert.match(repair, /Choose a committee ↓/, 'committee filter route must expose a visible jump link');
assert.match(repair, /td613:giving-clear-all/, 'practice exit must invoke canonical transient clearing');
assert.match(repair, /resetLoadedCommitteeSurface/, 'practice exit must clear the visible loaded-committee context as well as form fields');
assert.match(repair, /practice-file-boundary-dialog/, 'saved fictional files must cross an explicit practice boundary before opening');
assert.match(repair, /Enter Demo &amp; open file/, 'practice-file boundary must name the universe transition');
assert.match(repair, /openGivingStore/, 'saved-file world classification must read durable dossier provenance');
assert.match(repair, /dossierDeclaresPractice/, 'saved-file world classification must be a named provenance operation');
assert.match(repair, /practice-bikini-bottom-votes/, 'practice provenance must recognize the canonical practice source ID');
assert.doesNotMatch(repair, /const label = compact\(option\.textContent\)/, 'saved-file universe must never be inferred from the option title');
assert.match(repair, /INCOMPLETE COVERAGE/, 'opaque Source Hold must render as consequence-level finality language');
assert.match(repair, /practiceActive\(\).*addContactQueueButton/s, 'practice Add Contact path must be able to default Exact before the queue snapshots settings');
assert.match(repair, /ensureLiveWorkspaceFallback/, 'real campaign lookup must have a bounded Committee Workspace fallback');
assert.match(repair, /ensurePracticeLoadButtons/, 'practice committee results must expose an explicit load-context action');
assert.match(repair, /Yellow means incomplete coverage—not a failed search and never zero giving/, 'FEC partial copy must explain incomplete coverage rather than imply failure');
assert.match(repair, /automatic_repo_propagation: false/, 'Pedagogue hydration remains diagnosis-only outside this Giving repair');

assert.match(css, /committee-filter-jump[\s\S]*text-decoration: underline/, 'committee jump affordance must look like a route');
assert.match(css, /committee-context-filter\[data-repair-placement="before-filing-sources"\][\s\S]*grid-template-columns: minmax\(0,1fr\)/, 'mobile committee filter must be one compact teaching card');
assert.match(css, /giving-date-range-filter input\[type="date"\][\s\S]*box-sizing: border-box/, 'mobile date inputs must be bounded to their panel');
assert.match(css, /giving-date-range-filter input\[type="date"\][\s\S]*border-radius: 8px/, 'native mobile dates must receive a deliberate visual surface');
assert.match(css, /::-webkit-date-and-time-value/, 'mobile Safari date value must receive explicit alignment');
assert.match(css, /giving-date-presets[\s\S]*justify-content: center/, 'Quick Start presets must center on mobile');
assert.match(css, /source-picker-actions[\s\S]*position: static !important/, 'source actions must not overlap their heading on mobile');
assert.match(css, /committee-ledger-toolbar-repair[\s\S]*display: flex !important[\s\S]*flex-wrap: wrap !important/, 'Committee Workspace toolbar must use natural wrapped mobile controls');
assert.doesNotMatch(css, /committee-ledger-toolbar-repair[\s\S]{0,220}grid-template-columns: repeat\(2/, 'Committee Workspace must not regress to equal-width mobile pancakes');

assert.match(pageSize, /FEC_EXACT_BOUNDARY_PAGE_SIZE = 50/, 'Exact FEC retrieval must use a smaller per-gesture provider envelope');
assert.match(pageSize, /EASYVOTE_BOUNDARY_PAGE_SIZE = 50/, 'EasyVote must use smaller source-specific pages to stay below the response boundary');
assert.match(pageSize, /body\.payload\.query\.exact_match \? FEC_EXACT_BOUNDARY_PAGE_SIZE/, 'FEC exact-match ceiling must be selected from the actual request envelope');
assert.match(pageSize, /sourceId\.startsWith\('easyvote-'\)/, 'EasyVote page ceiling must apply across registered municipal tenants');
assert.equal(_easyVoteInternals.EASYVOTE_PAGE_SIZE_CEILING, 50, 'EasyVote adapter must independently enforce the same 50-row upstream ceiling');

console.log(JSON.stringify({
  suite: 'giving-20260818-repair',
  status: 'PASS',
  pedagogue: {
    findings: [...findingCodes],
    recommendations: [...recommendationCodes],
    product_mutation_authority: diagnosis.authority.product_mutation_authorized
  },
  boundaries: [
    'mobile-geometry', 'committee-route', 'practice-custody-provenance', 'practice-exit-purge',
    'queue-finality', 'easyvote-page-envelope', 'fec-exact-envelope', 'fec-partial-language'
  ]
}, null, 2));
