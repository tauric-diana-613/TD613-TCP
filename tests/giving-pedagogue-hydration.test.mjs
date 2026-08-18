import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const read = (path) => fs.readFileSync(path, 'utf8');
const practice = read('app/giving/history/giving-practice-hydration.js');
const practiceRuntime = read('app/giving/history/giving-practice-runtime.js');
const noise = read('app/giving/history/giving-practice-search-noise.js');
const bridge = read('app/giving/history/giving-practice-surface-bridge.js');
const directory = read('app/giving/history/giving-practice-directory.js');
const committeeGraph = read('app/giving/history/giving-practice-committee-graph.js');
const discoveryGraph = read('app/giving/history/giving-practice-discovery-graph.js');
const temporalCluster = read('app/giving/history/giving-practice-referendum-cluster.js');
const temporalExtension = read('app/giving/history/giving-practice-temporal-cluster-extension.js');
const localAlignment = read('app/giving/history/giving-practice-local-alignment.js');
const localRules = read('app/giving/history/giving-practice-local-campaign-rules.js');
const inKind = read('app/giving/history/giving-practice-in-kind.js');
const cheapskate = read('app/giving/history/giving-practice-krabs-cheapskate.js');
const transactionClass = read('app/giving/history/giving-transaction-classification.js');
const contributorHandoff = read('app/giving/history/giving-contributor-handoff.js');
const shell = read('app/giving/history/giving-ux-resilience-shell.js');
const practiceCss = read('app/giving/history/giving-practice-hydration.css');
const transactionClassCss = read('app/giving/history/giving-transaction-classification.css');
const help = read('app/giving/history/giving-dossier-help.js');
const helpCss = read('app/giving/history/giving-dossier-help.css');
const bootstrap = read('app/giving/history/giving-bootstrap.js');
const fec = read('app/giving/history/giving-fec-resilience.js');
const pedagogue = read('app/engine/pedagogue-practice-fixture.js');
const fixture = JSON.parse(read('tests/fixtures/pedagogue/giving-bikini-bottom-practice.json'));

const browserModulePaths = [
  'app/giving/history/giving-practice-runtime.js',
  'app/giving/history/giving-practice-hydration.js',
  'app/giving/history/giving-practice-search-noise.js',
  'app/giving/history/giving-practice-discovery-graph.js',
  'app/giving/history/giving-practice-referendum-cluster.js',
  'app/giving/history/giving-practice-temporal-cluster-extension.js',
  'app/giving/history/giving-practice-in-kind.js',
  'app/giving/history/giving-practice-local-campaign-rules.js',
  'app/giving/history/giving-practice-data-reconciliation.js',
  'app/giving/history/giving-practice-krabs-cheapskate.js',
  'app/giving/history/giving-practice-local-alignment.js',
  'app/giving/history/giving-practice-committee-graph.js',
  'app/giving/history/giving-practice-surface-bridge.js',
  'app/giving/history/giving-practice-directory.js',
  'app/giving/history/giving-contributor-handoff.js',
  'app/giving/history/giving-activity-contributor-handoff.js',
  'app/giving/history/giving-transaction-classification.js',
  'app/giving/history/giving-fec-resilience.js'
];
for (const path of browserModulePaths) {
  assert.doesNotThrow(
    () => execFileSync(process.execPath, ['--check', path], { stdio: 'pipe' }),
    `${path} must remain browser/module-parseable`
  );
}

const names = ['SpongeBob SquarePants', 'Patrick Star', 'Sandy Cheeks', 'Eugene H. Krabs', 'Squidward Q. Tentacles'];
const learnerFacingCommittees = [
  'King Neptune for King',
  'Puff for Bikini Bottom School District #67',
  'Every Villain Is Lemons PAC',
  'Sheldon Plankton for Bikini Bottom Campaign',
  'Larry Lobster for Mayor of Bikini Bottom',
  'Fishocratic Executive Committee',
  'Friends of Aquaman PC',
  'Krusty Krab Parking Expansion Referendum Committee'
];
for (const name of names) assert.ok(practice.includes(name), `practice fixture must include ${name}`);
for (const committee of learnerFacingCommittees) assert.ok(directory.includes(committee), `practice campaign directory must expose ${committee}`);
assert.ok(practice.includes('Mrs. Puff for Bikini Bottom School District #67'), 'base fixture provenance may retain the earlier Puff source spelling');
assert.match(noise, /Mrs\. Puff for Bikini Bottom School District #67[\s\S]*?Puff for Bikini Bottom School District #67/, 'practice search boundary must normalize the Puff committee label');

assert.match(practice, /city: 'Bikini Bottom'/);
assert.match(practice, /state: 'Oceania'/);
assert.match(practice, /zip: 'X'/);
assert.match(practice, /committee_kind: referendum \? 'ISSUE_REFERENDUM'/);
assert.match(practice, /manifestly_fictional: true/);
assert.match(practice, /evidence_authority: false/);
assert.match(practice, /consequence_authority: false/);
assert.match(practice, /evidence_status: 'FICTIONAL_SAMPLE'/);
assert.match(practice, /8000 \+ \(hash % 8001\)/);
assert.match(practice, /__TD613_GIVING_PRACTICE_DELAY_MS__/);
assert.match(practice, /PRACTICE_AUTHORITY_CLOSED/);
assert.match(practice, /exact\.checked = true/);
assert.match(practice, /Exit Sample Demo\?/);

const contrastIds = new Set(fixture.teaching_contrasts.map((contrast) => contrast.contrast_id));
for (const id of [
  'political-object-kind',
  'practice-aperture-versus-live-jurisdiction',
  'identity-continuity-versus-field-drift',
  'shared-field-versus-shared-identity',
  'revision-chain-versus-duplicate-row',
  'same-name-different-route-role',
  'prepared-handoff-versus-automatic-retrieval',
  'episodic-convergence-versus-longitudinal-divergence',
  'transaction-class-versus-cash-default',
  'preserve-anomaly-versus-auto-repair',
  'negative-space-versus-opposition-inference'
]) assert.ok(contrastIds.has(id), `Pedagogue practice fixture must retain ${id}`);
assert.ok(fixture.teaching_contrasts.length >= 11);
assert.match(
  fixture.teaching_contrasts.find((contrast) => contrast.contrast_id === 'negative-space-versus-opposition-inference').exact,
  /absence may not be converted into a positive claim/i
);
assert.match(pedagogue, /function normalizeTeachingContrasts/);
assert.match(pedagogue, /automatic_inference_forbidden: true/);
assert.match(pedagogue, /authority_grant_forbidden: true/);

assert.match(bridge, /PRACTICE_NAMES = Object\.freeze/);
assert.match(bridge, /function broadenPracticeNameWhenRequested/);
assert.match(bridge, /exact\?\.checked !== false/);
assert.match(bridge, /matches\.length === 1/);
assert.match(bridge, /function enforcePracticeSourceSelection/);
assert.match(bridge, /function enforcePracticeSearchPosture/);
assert.match(bridge, /addEventListener\('submit', enforcePracticeSearchPosture, true\)/);
assert.match(bridge, /practiceFloatingExitButton/);
assert.match(bridge, /Exit route 3 of exactly 3/);
assert.match(bridge, /\.tab\[data-view="campaign"\]/);
assert.match(bridge, /Campaign Deputy is asleep/);

assert.match(directory, /PRACTICE_OBJECTS = Object\.freeze/);
assert.match(directory, /_givingPracticeCommitteeGraph\.contributorsForCommittee/);
assert.match(directory, /_givingPracticeCommitteeGraph\.totalsForCommittee/);
assert.match(directory, /prepareContributorSearch/);
assert.match(directory, /BikiniBottomVotes only/);
assert.match(directory, /#campaignDirectoryForm/);
assert.match(directory, /addEventListener\('submit', interceptPracticeDirectory, true\)/);
assert.match(directory, /event\.stopImmediatePropagation\(\)/, 'practice campaign lookup must preempt the real API listener');
assert.match(directory, /#givingStateFilter/);
assert.match(directory, /#campaignDirectoryState/);
assert.match(directory, /#campaignDirectoryMunicipal/);
assert.match(directory, /#campaignDirectoryJurisdiction/);
assert.match(directory, /input\.disabled = true/);
assert.match(directory, /wakeGeography/);

assert.match(contributorHandoff, /retrieval_started: false/);
assert.match(contributorHandoff, /exact_match_changed: false/);
assert.match(contributorHandoff, /PREPARED ROUTE/);
assert.match(contributorHandoff, /nothing searched by this handoff/);
assert.match(contributorHandoff, /Press SEARCH to continue/);

assert.match(discoveryGraph, /'Sandra Cheeks'/);
assert.match(discoveryGraph, /'Fred Fish'/);
assert.match(discoveryGraph, /'Frederick Fish'/);
assert.match(discoveryGraph, /'Larry Lobster'/);
assert.match(discoveryGraph, /'Lawrence Lobster'/);
assert.match(discoveryGraph, /'Krusty Krab LLC'/);
assert.match(discoveryGraph, /'Chum Bucket Corp'/);
assert.match(discoveryGraph, /'Oceanic Association of Fry Cooks'/);
assert.match(discoveryGraph, /'Barnacle Boy'/);
assert.match(discoveryGraph, /'Mermaid Man'/);
assert.match(discoveryGraph, /'Bubble Bass'/);
assert.match(discoveryGraph, /'Old Man Jenkins'/);
assert.match(discoveryGraph, /'Jenkins, Old Man'/);
assert.match(discoveryGraph, /AMENDMENT_CHAIN/);
assert.match(discoveryGraph, /SHARED_ADDRESS_COLLISION/);
assert.match(discoveryGraph, /NAME_ORDER_VARIANT/);

assert.match(temporalCluster, /BBV-REF-2022-12-03/);
assert.match(temporalCluster, /BBV-REF-2024-09-14/);
assert.match(temporalCluster, /BBV-REF-2026-04-25/);
assert.match(temporalCluster, /7500000/);
assert.match(temporalCluster, /60000000/);
assert.match(temporalCluster, /BBV-FEC-2021-10-02/);
assert.match(temporalCluster, /BBV-AQUA-2023-06-17/);
assert.doesNotMatch(temporalCluster, /BBV-PUFF-2025-03-22/, 'giant temporal clusters must stay off capped local campaigns');
assert.match(temporalExtension, /Every Villain Is Lemons PAC/);
assert.match(temporalExtension, /32000000/);

assert.match(cheapskate, /'2020-01-31': 100/);
assert.match(cheapskate, /'2022-01-31': 99/);
assert.match(cheapskate, /'2026-01-31': 613/);
assert.match(cheapskate, /later_temporal_cluster_should_remain_distinct: true/);

assert.match(localAlignment, /date: '2024-08-24'/);
assert.match(localAlignment, /committee: LARRY/);
assert.match(localAlignment, /date: '2025-09-06'/);
assert.match(localAlignment, /committee: PUFF/);
assert.match(localAlignment, /LOCAL_MAX_CENTS = 100000/);
assert.match(localAlignment, /negative_space_candidate: PLANKTON/);
assert.match(localAlignment, /opposition_inference_forbidden: true/);
assert.match(localAlignment, /removePlanktonFromKrabsBloc/);

assert.match(localRules, /LOCAL_ORDINARY_LIMIT_CENTS = 100000/);
assert.match(localRules, /transaction_class: 'LOAN'/);
assert.match(localRules, /PRESERVE_OBSERVED_VALUE_AND_FLAG_LIMIT_REVIEW/);
assert.match(localRules, /source_value_rewrite_forbidden: true/);
assert.doesNotMatch(localRules, /amount_cents: capped \? LOCAL_ORDINARY_LIMIT_CENTS/, 'observed local source values may not be silently rewritten to the expected limit');
assert.match(localRules, /allLarryLoanRows/);
assert.match(inKind, /amount_cents: 230716/);
assert.match(inKind, /practice_over_limit_anomaly: true/);
assert.match(inKind, /Krusty Krab catering/);
assert.match(inKind, /Every Villain Is Lemons PAC/);
assert.match(inKind, /Krusty Krab Parking Expansion Referendum Committee/);

assert.match(transactionClass, /CLASS_LOAN = 'LOAN'/);
assert.match(transactionClass, /CLASS_IN_KIND = 'IN-KIND'/);
assert.match(transactionClass, /rawTypeCandidates/);
assert.match(transactionClass, /giving-transaction-class-badge/);
assert.match(transactionClassCss, /color: #ff4fd8/);
assert.match(transactionClassCss, /font: 850 6px\/1 var\(--mono\)/);

assert.match(committeeGraph, /_givingPracticeKrabsCheapskate\.normalizeKrabsOrdinaryRecord/);
assert.match(committeeGraph, /_givingPracticeLocalAlignment\.removePlanktonFromKrabsBloc/);
assert.match(committeeGraph, /_givingPracticeInKind\.allRows/);
assert.match(committeeGraph, /_givingPracticeLocalCampaignRules\.allLarryLoanRows/);
assert.match(committeeGraph, /practice_compliance_review_required/);

assert.match(shell, /scrollViewToTop\('view-vault'\)/);
assert.match(shell, /installDossierPickers/);
assert.match(practiceCss, /\.dossier-control #saveState/);
assert.match(practiceCss, /max-width: 46%/);
assert.match(practiceCss, /\.practice-floating-exit \{[\s\S]*?position: fixed/);
assert.match(practiceCss, /\.practice-exit-confirm \{[\s\S]*?left: 50%[\s\S]*?top: 50%[\s\S]*?translate\(-50%, -50%\)/);
assert.match(practiceCss, /\.practice-geo-asleep/);
assert.match(practiceCss, /Bikini Bottom only · asleep/);
assert.match(practiceCss, /\.fictional-sample-chip/);

assert.match(help, /custodyModeHelp/);
assert.match(helpCss, /font-size: 13px/);

assert.match(fec, /const MAX_BOUNDARY_PAGES = 1/);
assert.doesNotMatch(fec, /while \(continuation/);
assert.match(fec, /automatic_continuation: false/);

// Browser ESM side-effect law: one cache-busted practice root; internal modules
// execute once through relative imports and may be reused by directory/graph.
assert.match(practiceRuntime, /ONE_VERSIONED_ROOT_RELATIVE_DEPENDENCIES/);
assert.match(practiceRuntime, /fetch_wrapper_reinstallation_forbidden: true/);
for (const moduleName of [
  'giving-practice-hydration.js',
  'giving-practice-search-noise.js',
  'giving-practice-discovery-graph.js',
  'giving-practice-referendum-cluster.js',
  'giving-practice-temporal-cluster-extension.js',
  'giving-practice-in-kind.js',
  'giving-practice-local-campaign-rules.js',
  'giving-practice-data-reconciliation.js',
  'giving-practice-krabs-cheapskate.js',
  'giving-practice-local-alignment.js'
]) assert.ok(practiceRuntime.includes(moduleName), `practice runtime must own ${moduleName}`);

assert.match(bootstrap, /GIVING_PRACTICE_EPOCH = '20260817-12'/);
assert.match(bootstrap, /practiceUrl\('\.\/giving-practice-runtime\.js'\)/);
assert.match(bootstrap, /sourceUrl\('\.\/giving-contributor-handoff\.js'\)/);
assert.match(bootstrap, /practiceUrl\('\.\/giving-practice-directory\.js'\)/);
assert.doesNotMatch(bootstrap, /practiceUrl\('\.\/giving-practice-hydration\.js'\)/, 'bootstrap must not instantiate practice fetch wrappers independently of the root');
assert.doesNotMatch(bootstrap, /practiceUrl\('\.\/giving-practice-committee-graph\.js'\)/, 'directory owns the pure committee graph import so it resolves one dependency identity');
assert.doesNotMatch(bootstrap, /\bpedagogue\b/i, 'browser bootstrap must keep internal teaching nomenclature out of delivered source');
const runtimeIndex = bootstrap.indexOf('giving-practice-runtime.js');
const appIndex = bootstrap.indexOf('giving-app.js');
const bridgeIndex = bootstrap.indexOf('giving-practice-surface-bridge.js');
const directoryIndex = bootstrap.indexOf('giving-practice-directory.js');
const campaignIndex = bootstrap.indexOf('giving-campaign-tools-v3.js');
assert.ok(runtimeIndex >= 0 && appIndex > runtimeIndex, 'fictional fetch wrappers must install once before GivingApiClient captures fetch');
assert.ok(bridgeIndex > appIndex);
assert.ok(directoryIndex > bridgeIndex && campaignIndex > directoryIndex, 'practice lookup must install before the real campaign directory listener');

console.log('giving-pedagogue-hydration.test.mjs passed: ESM syntax, single-entry practice runtime, expanded fictional graph, transaction classes, source-value preservation, negative-space alignment, contributor handoff, and Pedagogue contrasts remain bounded.');