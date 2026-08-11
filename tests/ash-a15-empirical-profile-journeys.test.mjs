import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ASH_A15_EMPIRICAL_VERSION,
  ASH_A15_WORLD_ANSWER_SCHEMA,
  ASH_A15_ACTION_ID,
  ASH_A15_PROFILES,
  ASH_A15_WORKSPACES,
  ASH_A15_ROUTES,
  compileAshA15WorldAnswer,
  compileAshA15Matrix,
  containsSensitiveContext,
  publicAnswerLeaksOntology
} from '../app/dome-world/ash-a15-empirical-profile-journeys.js';
import {
  ASH_DEMO_REGISTRY_VERSION,
  ASH_DEMO_ASSET_EPOCH,
  getAshDemoRegistrySnapshot
} from '../app/dome-world/ash-demo-registry.js';

const source = fs.readFileSync('app/dome-world/ash-a15-empirical-profile-journeys.js', 'utf8');
const registry = fs.readFileSync('app/dome-world/ash-demo-registry.js', 'utf8');
const wrapper = fs.readFileSync('app/dome-world/ash-profile-demo-hydration.js', 'utf8');
const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');
const workflow = fs.readFileSync('.github/workflows/td613-ci.yml', 'utf8');
const browserProbe = fs.readFileSync('scripts/ash-a15-empirical-profile-journeys-browser-probe.mjs', 'utf8');
const amendment = fs.readFileSync('app/dome-world/docs/ASH_KEEP_A12_A15_OPERATOR_AMENDMENT_V0_1.md', 'utf8');
const shell = fs.readFileSync('api/dome-world-shell.js', 'utf8');
const eviction = fs.readFileSync('app/dome-world/ash-cache-eviction-aia3.js', 'utf8');
const receipt = fs.readFileSync('app/dome-world/docs/ASH_KEEP_A15_EMPIRICAL_PROFILE_JOURNEY_IMPLEMENTATION_RECEIPT_V0_1.md', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(ASH_A15_EMPIRICAL_VERSION, 'td613.ash.a15-empirical-profile-journeys/v0.1');
assert.equal(ASH_A15_WORLD_ANSWER_SCHEMA, 'td613.ash.a15-profile-world-answer/v0.1');
assert.equal(ASH_A15_ACTION_ID, 'orient_next_bounded_action');
assert.deepEqual(ASH_A15_PROFILES, ['investigation','political_campaign','fundraiser','research','legal','archive']);
assert.deepEqual(ASH_A15_WORKSPACES, ['home','map','work','choir','capsule']);
assert.deepEqual(ASH_A15_ROUTES, ['experimental','custodial','audit','implementation']);
assert.equal(ASH_DEMO_REGISTRY_VERSION, 'td613.ash.demo-registry/v0.3-a15');
assert.equal(ASH_DEMO_ASSET_EPOCH, '20260726-a15-empirical-v1');

const matrix = compileAshA15Matrix();
assert.equal(matrix.length, 120);
assert.equal(new Set(matrix.map(answer => `${answer.profile}:${answer.workspace}:${answer.route}`)).size, 120);
for (const answer of matrix) {
  assert.equal(answer.status, 'READY');
  assert.equal(answer.synthetic_fixture, true);
  assert.equal(answer.context_imported, false);
  assert.equal(answer.real_world_claim, false);
  assert.equal(answer.ontology_exposed, false);
  assert.equal(answer.action_recognized, true);
  assert.equal(answer.authority.custody_changed, false);
  assert.equal(answer.authority.source_bytes_moved, false);
  assert.equal(answer.authority.raw_content_transport, false);
  assert.equal(answer.authority.consequential_action, false);
  assert.equal(answer.authority.release_authority, false);
  assert.equal(answer.authority.destination_authority, false);
  assert.equal(answer.authority.human_review_required, true);
  assert.equal(answer.authority.human_closure_required, true);
  assert.equal(publicAnswerLeaksOntology(answer.message), false);
}
for (const workspace of ASH_A15_WORKSPACES) for (const route of ASH_A15_ROUTES) {
  const answers = ASH_A15_PROFILES.map(profile => compileAshA15WorldAnswer({ profile, workspace, route }));
  assert.equal(new Set(answers.map(answer => answer.message)).size, 6, `${workspace}/${route} collapsed six profiles into one answer.`);
  assert.equal(new Set(answers.map(answer => answer.claim_ceiling)).size, 6, `${workspace}/${route} collapsed six claim ceilings.`);
}
const experientialAlias = compileAshA15WorldAnswer({ profile:'research', workspace:'map', route:'EXPERIENTIAL' });
assert.equal(experientialAlias.route, 'experimental');
assert.equal(experientialAlias.status, 'READY');

const cyclic = { api_key:'secret' };
cyclic.self = cyclic;
const sensitiveContexts = [
  'person@example.com',
  '904-555-1212',
  '+44 20 7946 0958',
  '020 7946 0958',
  '123-45-6789',
  'api_key = abc123',
  'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.payload',
  { api_key:'abc123' },
  { password:'abc123' },
  { Authorization:'Bearer tokenvalue123' },
  new Map([['api_key','secret']]),
  new URLSearchParams({ access_token:'secret' }),
  new Set(['bounded placeholder','Bearer tokenvalue123']),
  cyclic,
  '-----BEGIN PRIVATE KEY-----',
  '-----BEGIN ENCRYPTED PRIVATE KEY-----',
  '-----BEGIN DSA PRIVATE KEY-----'
];
for (const context of sensitiveContexts) {
  assert.equal(containsSensitiveContext(context), true, `Sensitive context escaped quarantine: ${Object.prototype.toString.call(context)}`);
  const held = compileAshA15WorldAnswer({ profile:'legal', workspace:'work', route:'audit', context });
  assert.equal(held.status, 'HELD_SENSITIVE_CONTEXT');
  assert.equal(held.context_imported, false);
  assert.equal(held.authority.consequential_action, false);
}
for (const context of [1722000000, 20260726, 1234567890123n, { timestamp:1722000000 }, { record_id:1234567890 }, { sample_count:10000000 }, '1722000000']) {
  assert.equal(containsSensitiveContext(context), false, `Ordinary integer was misclassified as a phone: ${String(context)}`);
  const ready = compileAshA15WorldAnswer({ profile:'research', workspace:'home', route:'audit', context });
  assert.equal(ready.status, 'READY');
}
assert.equal(containsSensitiveContext({ phone:9045551212 }), true, 'Phone-key numeric values must remain quarantined.');

const incomplete = compileAshA15WorldAnswer({ profile:'archive', workspace:'outside', route:'audit' });
assert.equal(incomplete.status, 'HELD_INCOMPLETE_ROUTE');
const explicitEmpty = compileAshA15WorldAnswer({ profile:'', workspace:'', route:'' });
assert.equal(explicitEmpty.status, 'HELD_INCOMPLETE_ROUTE');
for (const unsupportedProfile of ['organizing','unpublished','general']) {
  const held = compileAshA15WorldAnswer({ profile:unsupportedProfile, workspace:'home', route:'audit' });
  assert.equal(held.status, 'HELD_INCOMPLETE_ROUTE');
  assert.equal(held.profile, null);
}
const unknownToken = 'source_packet_commit';
const unknownAction = compileAshA15WorldAnswer({ profile:'archive', workspace:'map', route:'audit', action_id:unknownToken });
assert.equal(unknownAction.status, 'HELD_UNKNOWN_ACTION');
assert.equal(unknownAction.action_id, null);
assert.equal(unknownAction.action_recognized, false);
assert.equal(JSON.stringify(unknownAction).includes(unknownToken), false);

const snapshot = getAshDemoRegistrySnapshot();
assert.equal(snapshot.control_owner, 'ASH_DEMO_REGISTRY');
assert.equal(snapshot.profiles.length, 6);
assert.equal(snapshot.profiles.filter(entry => entry.promoted).length, 6);
assert.equal(snapshot.empirical_journey_version, ASH_A15_EMPIRICAL_VERSION);
assert.equal(snapshot.empirical_matrix_cells, 120);
assert.equal(snapshot.raw_content_transport, false);
assert.equal(snapshot.automatic_ash_action, false);
assert.equal(snapshot.release_authority, false);
for (const token of [
  "const empiricalOwner = import(`./ash-a15-empirical-profile-journeys.js?v=${ASH_DEMO_ASSET_EPOCH}`)",
  '.catch(error => Object.freeze({ module:null, error }))',
  'empiricalResult.module',
  'empiricalLoadHeld = Boolean(empiricalResult.error || !empirical)',
  'HELD_SUBORDINATE',
  'registry_available:true',
  'installAshA15EmpiricalJourneys',
  'empirical_journey_version',
  'empirical_journey_status',
  'empirical_matrix_cells',
  'ash-a15-empirical-journey:${profile}'
]) assert.ok(registry.includes(token), `A15 registry omitted isolated empirical owner token ${token}`);
assert.match(registry, /const empiricalOwner = import\([\s\S]{0,360}\.catch\(error => Object\.freeze\(\{ module:null, error \}\)\)[\s\S]{0,560}Promise\.all\(\[[\s\S]{0,800}empiricalOwner/);
assert.match(registry, /registryEntries = Object\.freeze\(entries\);[\s\S]{0,420}const empirical = empiricalResult\.module[\s\S]{0,700}HELD_SUBORDINATE[\s\S]{0,720}return registryEntries/);
assert.doesNotMatch(registry, /Promise\.all\(\[[\s\S]{0,900}import\(`\.\/ash-a15-empirical-profile-journeys\.js[^\n]*\)[\s\S]{0,120}\]\)\.then/, 'A subordinate empirical import must not remain an uncaught fixture-owner dependency.');

for (const token of [
  'ashA15EmpiricalJourney','ashA15OrientAction','ashA15WorldAnswer','td613:ash:a15-world-answer','HELD_SENSITIVE_CONTEXT','real_world_claim:false','ontology_exposed:false','context_imported:false','CREDENTIAL_KEY_PATTERN','PHONE_KEY_PATTERN','PHONE_CANDIDATE_PATTERN','structuredEntries(value)','state.seen.has(value)','action_recognized',
  "tag === '[object Map]'","tag === '[object Set]'","tag === '[object URLSearchParams]'",'prototype === Object.prototype || prototype === null','if (!entries) return { sensitive:true, opaque:true, text:\'\' }',
  "premiumSnapshot?.profile ?? premiumSnapshot?.caseMap?.profile",'if (hasExplicitValue(rawSnapshotProfile)) return normalizeProfile(rawSnapshotProfile)','if (hasExplicitValue(selectedProfile)) return normalizeProfile(selectedProfile)','return hasExplicitValue(demoProfile) ? normalizeProfile(demoProfile) : null',
  "hasOwn(overrides, 'profile')","hasOwn(overrides, 'workspace')","hasOwn(overrides, 'route')","hasOwn(overrides, 'action_id')","event.target?.closest?.('[data-aia-route]')",'installedEntries','bindEntries(entries)','entries:() => installedEntries','td613:ash:a15-empirical-entries-bound'
]) assert.ok(source.includes(token), `A15 source omitted ${token}`);
assert.match(source, /function currentProfile\(\)[\s\S]{0,320}premiumSnapshot[\s\S]{0,220}rawSnapshotProfile[\s\S]{0,220}return normalizeProfile\(rawSnapshotProfile\)[\s\S]{0,300}selectedProfile[\s\S]{0,300}demoProfile/);
assert.doesNotMatch(source.match(/function currentProfile\(\)[\s\S]*?\n\}/)?.[0] || '', /\|\| 'investigation'|\|\| "investigation"/, 'Unsupported active profiles must hold instead of defaulting to Investigation.');
assert.match(source, /function textContainsPhone\(text, \{ keyAware = false \} = \{\}\)[\s\S]{0,620}separators >= 2[\s\S]{0,240}\(keyAware \|\| formatted\)/);
assert.match(source, /if \(type === 'number' \|\| type === 'bigint'\)[\s\S]{0,260}TEXT_SENSITIVE_PATTERNS[\s\S]{0,120}opaque:false/);
assert.doesNotMatch(source.match(/if \(type === 'number' \|\| type === 'bigint'\)[\s\S]*?\n  \}/)?.[0] || '', /textContainsPhone/, 'Generic numeric values must not be treated as phones without a phone key.');
for (const pattern of [/fetch\s*\(/,/sendBeacon/,/XMLHttpRequest/,/indexedDB\./,/localStorage\.(?:setItem|removeItem|clear)/,/sessionStorage\.(?:setItem|removeItem|clear)/,/caches\./,/serviceWorker/,/new\s+(?:Worker|SharedWorker)/]) assert.doesNotMatch(source, pattern);
assert.doesNotMatch(source, /custody_changed:true|source_bytes_moved:true|raw_content_transport:true|consequential_action:true|release_authority:true|destination_authority:true/);

assert.match(wrapper, /20260726-a15-empirical-v1/);
assert.match(bridge, /ash-profile-demo-hydration\.js\?v=20260726-a15-empirical-v1/);
assert.match(workflow, /Validate Ash A15 empirical profile journeys/);
assert.match(workflow, /ash-a15-empirical-profile-journeys-browser-probe\.mjs/);
for (const token of [
  '#premiumPrimaryDock [data-premium-workspace=',
  '[data-aia-route=',
  'ashA15OrientAction',
  'real_profile_hydration:true',
  'real_workspace_navigation:true',
  'navigation_receipt_captured_at_click:true',
  'idempotent_active_workspace_gesture:true',
  'real_route_navigation:true',
  'real_world_answer_gesture:true',
  'HELD_SENSITIVE_CONTEXT',
  '__td613A15NavigationWitness',
  'td613:ash:navigation-receipt',
  'workspaceDiagnostic',
  'workspace_transitions',
  'captured_navigation_receipts',
  'minimum_workspace_transitions_per_profile:4',
  "route_landing_workspace:'work'",
  'browser_process_isolation_per_profile:true',
  'incremental_profile_checkpoints:true',
  'all_profiles_distinct:true',
  '-held.png'
]) assert.ok(browserProbe.includes(token), `A15 browser witness omitted ${token}`);
assert.match(browserProbe, /await selectRoute\(page, route\);[\s\S]{0,320}await openWorkspace\(page, workspace, witness\);[\s\S]{0,320}await waitForVisibleCombination\(page, workspace, route\);/);
assert.match(browserProbe, /const selector = `#premiumPrimaryDock \[data-premium-workspace=/);
assert.match(browserProbe, /if \(navigation\.changed\) workspaceTransitions \+= 1/);
assert.match(browserProbe, /captured_navigation_receipts !== result\.workspace_transitions/);
assert.match(browserProbe, /window\.addEventListener\('td613:ash:navigation-receipt', handler\)/);
assert.doesNotMatch(browserProbe, /const control = page\.locator\(`\[data-premium-workspace=/);
assert.doesNotMatch(browserProbe, /empirical\.orient\(\{\s*profile,\s*workspace,\s*route/s);
assert.match(browserProbe, /const expectedJourneyToken = `ash-a15-empirical-journey:\$\{profile\}`/);
assert.match(browserProbe, /entry\.deterministic_test_journey !== expectedJourneyToken/);
assert.doesNotMatch(browserProbe, /Array\.isArray\(entry\.deterministic_test_journey\)/,
  'Registry deterministic_test_journey is an opaque provider token, not the 20-cell journey array itself.');
assert.match(browserProbe, /provider_matrix_cells_per_profile:20/);
assert.match(browserProbe, /result\.answers\.length !== 20/);
assert.match(browserProbe, /matrix_cells:snapshot\.empirical_matrix_cells/);
assert.match(browserProbe, /result\.matrix_cells !== 120/);
assert.match(browserProbe, /__td613AshA15EmpiricalJourneys\?\.compile\?\.\(\{/);
assert.match(browserProbe, /context:\{ email:'person@example\.com' \}/);
assert.match(browserProbe, /result\.sensitive_status !== 'HELD_SENSITIVE_CONTEXT'/);
assert.match(browserProbe, /sensitive_context_rejected:receipts\.every\(receipt => receipt\.sensitive_status === 'HELD_SENSITIVE_CONTEXT'\)/);
assert.doesNotMatch(browserProbe, /sensitive_context_rejected:true/);
assert.match(receipt, /120 deterministic cells/);
assert.match(receipt, /graph-wide mass eviction executed: false/);
assert.match(amendment, /single graph-wide mass eviction[\s\S]*A15 postclosure/);
const massEpoch = 'td613.ash.cache-flush/2026-07-24-a11-postclosure-v1';
assert.ok(shell.includes(`ASH_MASS_EVICTION_EPOCH = '${massEpoch}'`));
assert.ok(eviction.includes(`ASH_AIA3_CACHE_EPOCH = '${massEpoch}'`));
assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a15-empirical-profile-journey-contract/v0.11-registry-token-provider-matrix',
  registry_version:ASH_DEMO_REGISTRY_VERSION,
  asset_epoch:ASH_DEMO_ASSET_EPOCH,
  profiles:ASH_A15_PROFILES.length,
  workspaces:ASH_A15_WORKSPACES.length,
  routes:ASH_A15_ROUTES.length,
  matrix_cells:matrix.length,
  real_ui_witness_required:true,
  canonical_primary_dock_navigation:true,
  exact_failure_witness_context:true,
  state_derived_transition_receipts:true,
  minimum_workspace_transitions_per_profile:4,
  route_landing_workspace:'work',
  registry_journey_token_is_opaque:true,
  provider_matrix_cells_per_profile:20,
  active_case_profile_precedence:true,
  unsupported_profile_holds:true,
  iterable_context_quarantine:true,
  generic_integer_phone_false_positive:false,
  all_private_key_pem_held:true,
  bearer_authorization_held:true,
  empirical_module_failure_isolated:true,
  browser_matrix_cells_registry_derived:true,
  browser_matrix_cells_runtime_enforced:true,
  browser_sensitive_context_hold_derived:true,
  sensitive_context_imported:false,
  ontology_leakage:false,
  false_real_world_claims:false,
  graph_wide_mass_eviction_executed:false,
  custody_authority_changed:false,
  raw_content_transport:false,
  release_authority:false,
  human_closure_required:true,
  vercel_gate:'CLOSED'
}, null, 2));
