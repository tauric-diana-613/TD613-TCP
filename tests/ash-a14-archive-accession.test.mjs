import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;
import {
  ASH_ARCHIVE_DEMO_VERSION,
  ASH_ARCHIVE_ACCESSION_SCHEMA,
  buildArchiveDemoFixture
} from '../app/dome-world/ash-archive-profile-demo.js';
import {
  ASH_DEMO_REGISTRY_VERSION,
  ASH_DEMO_ASSET_EPOCH,
  getAshDemoRegistrySnapshot
} from '../app/dome-world/ash-demo-registry.js';
import {
  compileCaseMap,
  compileRoomRules,
  compileRouteMemory,
  verifyCaseMap,
  verifyRoomRules,
  verifyRouteMemory
} from '../app/engine/ash-keep-core.js';

const archiveSource = fs.readFileSync('app/dome-world/ash-archive-profile-demo.js', 'utf8');
const registrySource = fs.readFileSync('app/dome-world/ash-demo-registry.js', 'utf8');
const empiricalSource = fs.readFileSync('app/dome-world/ash-a15-empirical-profile-journeys.js', 'utf8');
const convergenceSource = fs.readFileSync('app/dome-world/ash-demo-entry-convergence.js', 'utf8');
const currentObserver = fs.readFileSync('scripts/ash-a2-a5-browser-probe.mjs', 'utf8');
const legacyObserver = fs.readFileSync('scripts/ash-a2-a5-browser-probe-a13.mjs', 'utf8');
const a12ObserverWrapper = fs.readFileSync('scripts/ash-a12-browser-probe.mjs', 'utf8');
const a12ObserverCore = fs.readFileSync('scripts/ash-a12-browser-probe-stable-entry.mjs', 'utf8');
const a12Observer = `${a12ObserverWrapper}\n${a12ObserverCore}`;
const a14Observer = fs.readFileSync('scripts/ash-a14-archive-browser-probe.mjs', 'utf8');
const a15Observer = fs.readFileSync('scripts/ash-a15-empirical-profile-journeys-browser-probe.mjs', 'utf8');
const readinessPreparer = fs.readFileSync('scripts/prepare-ash-profile-closure-fixture-a13.mjs', 'utf8');
const shellSource = fs.readFileSync('api/dome-world-shell.js', 'utf8');
const evictionSource = fs.readFileSync('app/dome-world/ash-cache-eviction-aia3.js', 'utf8');
const amendmentSource = fs.readFileSync('app/dome-world/docs/ASH_KEEP_A12_A15_OPERATOR_AMENDMENT_V0_1.md', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(ASH_ARCHIVE_DEMO_VERSION, 'td613.ash.archive-demo/v0.2-a14-harbor-memory');
assert.equal(ASH_ARCHIVE_ACCESSION_SCHEMA, 'td613.ash.archive-accession/v0.2-harbor-memory');
assert.equal(ASH_DEMO_REGISTRY_VERSION, 'td613.ash.demo-registry/v0.3-a15');
assert.equal(ASH_DEMO_ASSET_EPOCH, '20260726-a15-empirical-v1');

const fixture = buildArchiveDemoFixture();
assert.equal(fixture.profile, 'archive');
assert.equal(fixture.schema, ASH_ARCHIVE_ACCESSION_SCHEMA);
assert.equal(fixture.demo_id, 'demo_archive_harbor_memory_v1');
assert.equal(fixture.title, 'Harbor Memory Archive · mixed-media accession and access review');
assert.equal(fixture.rooms.length, 8);
assert.equal(fixture.nodes.length, 29);
assert.equal(fixture.relationships.length, 23);
assert.equal(fixture.rules.length, 4);
assert.equal(fixture.routes.length, 4);
for (const route of fixture.routes) assert.match(route.draft_digest, /^sha256:[0-9a-f]{64}$/);
assert.match(fixture.defaults.route.digest, /^sha256:[0-9a-f]{64}$/);
assert.equal(fixture.assay.mixed_media_fixture_complete, true);
assert.equal(fixture.assay.original_derivative_lineage_visible, true);
assert.equal(fixture.assay.provenance_gaps_preserved, true);
assert.equal(fixture.assay.restrictions_interpreted_automatically, false);
assert.equal(fixture.assay.access_copy_created_automatically, false);
assert.equal(fixture.assay.release_authority, false);
assert.equal(fixture.assay.transfer_authority, false);
assert.match(fixture.assay.claim_ceiling, /NO_OWNERSHIP_AUTHENTICITY_ACCESS_GRANT_RELEASE_DECLASSIFICATION_PUBLICATION_OR_TRANSFER_AUTHORITY/);

const requiredNodes = [
  'node_original_audio','node_transcript','node_edited_transcript','node_photograph','node_accession_note',
  'node_donor_restriction','node_uncertain_date','node_duplicate_scan','node_missing_release_form',
  'node_embargoed_item','node_public_access_copy','node_custody_root','node_preservation_master',
  'node_transfer_manifest','node_destination_hold'
];
for (const node of requiredNodes) assert(fixture.nodes.some(entry => entry.id === node), `Harbor Memory fixture omitted ${node}.`);

const requiredRelations = [
  'edge_audio_transcript','edge_transcript_edited','edge_photo_date','edge_photo_scan','edge_root_audio',
  'edge_restriction_audio','edge_release_missing','edge_embargo_item','edge_master_audio',
  'edge_redaction_access','edge_authority_access','edge_manifest_destination'
];
for (const relation of requiredRelations) assert(fixture.relationships.some(entry => entry.id === relation), `Harbor Memory fixture omitted ${relation}.`);

for (const route of ['route_internal_accession_review','route_restricted_research_copy','route_public_access_copy_review','route_delayed_transfer']) {
  assert(fixture.rules.some(entry => entry.route_id === route), `Harbor Memory fixture omitted ${route}.`);
}

const compiledCase = await compileCaseMap({
  profile:'archive',
  caseId:'case_archive_harbor_memory_static',
  title:fixture.title,
  rooms:fixture.rooms,
  nodes:fixture.nodes,
  relationships:fixture.relationships,
  privateChronology:['mixed-media accession offered','original audio anchored','transcript lineage recorded','photograph date held uncertain','duplicate scan identified','restriction and missing release preserved','embargo review held','public access copy withheld','transfer held for destination authority'],
  intendedActions:fixture.nodes.filter(node => node.type === 'intended-action').map(node => node.label),
  sourceStatus:'SIMULATED',
  evidenceBasis:['synthetic Harbor Memory mixed-media Archive fixture'],
  observations:['No real collection, donor, repository, speaker, researcher, destination, or document is represented.'],
  missingness:[...fixture.missingness],
  alternatives:[...fixture.alternatives],
  openQuestions:['Which object anchors the collection?','Which date remains uncertain?','Who may interpret the restriction?','Which access copy may be prepared without publication?','Which destination evidence remains absent?'],
  operatorNotes:['demo_profile:archive',`demo_id:${fixture.demo_id}`,'claim_ceiling:no_ownership_authenticity_access_release_declassification_publication_or_transfer_authority']
});
const compiledRules = await compileRoomRules({ caseId:compiledCase.case_id, rules:fixture.rules, sourceStatus:'SIMULATED' });
const compiledRoutes = await compileRouteMemory({
  caseId:compiledCase.case_id,
  entries:fixture.routes,
  operatorDeclaredAssumptions:['The original audio is not its transcript.','The transcript is not the edited transcript.','A duplicate scan is not a second original.','A public access copy is not publication approval.','A transfer manifest is not destination authorization.'],
  unknown:['photograph date','release-form status','restriction interpretation','third-party rights posture','embargo review outcome','destination identity and recipient authority'],
  sourceStatus:'SIMULATED'
});
assert.equal(await verifyCaseMap(compiledCase), true);
assert.equal(await verifyRoomRules(compiledRules), true);
assert.equal(await verifyRouteMemory(compiledRoutes), true);

const snapshot = getAshDemoRegistrySnapshot();
assert.equal(snapshot.profiles.length, 6);
assert.equal(snapshot.profiles.filter(entry => entry.promoted).length, 6);
assert.deepEqual(snapshot.profiles.find(entry => entry.profile === 'archive'), {
  profile:'archive',
  label:'Archive',
  status:'PROMOTED',
  promoted:true,
  owner:'ARCHIVE',
  claim_ceiling:null
});
assert.equal(snapshot.empirical_journey_version, 'td613.ash.a15-empirical-profile-journeys/v0.1');
assert.equal(snapshot.empirical_matrix_cells, 120);
assert.equal(snapshot.release_authority, false);
assert.equal(snapshot.raw_content_transport, false);
assert.equal(snapshot.automatic_ash_action, false);
assert.equal(snapshot.human_review_required, true);

for (const token of [
  'SYNTHETIC_HARBOR_MEMORY_ARCHIVE_FIXTURE','Harbor Memory Archive','Original audio recording',
  'Transcript derived from original audio','Edited transcript derivative','Collection photograph',
  'Photograph date remains uncertain','Duplicate photograph scan','Release form is missing',
  'Embargoed collection item','Public access copy','access_granted:false','release_authorized:false',
  'declassification_authorized:false','transfer_executed:false'
]) assert(archiveSource.includes(token), `Harbor Memory provider omitted ${token}.`);

assert.match(convergenceSource, /td613\.ash\.demo-entry-convergence\/v0\.7-coalesced-entry-clock/);
assert.match(convergenceSource, /const ENTRY_FALLBACK = Object\.freeze\(\{[^\n]*archive:'map'/);
for (const token of [
  'const CONVERGENCE_FALLBACK_MS = 64',
  'let frameFallback = 0',
  'function cancelConvergenceTick()',
  'function scheduleConvergence(caseId, profile, workspace, currentToken, phase, stableFrames)',
  'let admitted = false',
  'frame = host.requestAnimationFrame(run)',
  'frameFallback = host.setTimeout(run, CONVERGENCE_FALLBACK_MS)',
  'cancelConvergenceTick()',
  "scheduleConvergence(caseId, profile, workspace, currentToken, 'VISIBLE', 0)",
  "scheduleConvergence(caseId, profile, workspace, currentToken, 'STRUCTURAL', 0)"
]) assert(convergenceSource.includes(token), `Archive entry convergence omitted coalesced clock law ${token}.`);
assert.match(convergenceSource, /const nextStable = ready \? stableFrames \+ 1 : 0/);
assert.match(convergenceSource, /phase === 'STRUCTURAL' && nextStable >= 2/);
assert.match(convergenceSource, /phase === 'VISIBLE' && nextStable >= 2/);
assert.doesNotMatch(convergenceSource, /setInterval\s*\(/);
assert(currentObserver.includes("replaceAll('td613.ash.demo-registry/v0.1-a13', 'td613.ash.demo-registry/v0.3-a15')"));
assert(legacyObserver.includes('td613.ash.demo-registry/v0.1-a13'));
assert.match(a12ObserverWrapper, /ash-a12-browser-probe-stable-entry\.mjs/);
assert.match(a12ObserverWrapper, /POST_CLICK_CASE_QUIET_MS = 220/);
assert.match(a12ObserverWrapper, /waitForPostClickCaseSettlement\(page, attempt\)/);
assert.match(a12ObserverWrapper, /td613\.ash\.a12-present-state-convergence-rebind\/v0\.2-post-click-settled/);
assert.doesNotMatch(a12Observer, /td613\.ash\.demo-registry\/v0\.[12]-(?:a13|a14)/);
assert.match(a12Observer, /td613\.ash\.demo-registry\/v0\.3-a15/);
assert.match(a14Observer, /registry\?\.asset_epoch === '20260726-a15-empirical-v1'/);
assert.match(a14Observer, /const normalizedDocket = result\.docket_text\.toLowerCase\(\)\.replace/);
assert.match(a14Observer, /const authoritySequence = \['claim ceiling','no ownership','authenticity','access grant','release','declassification','publication','transfer authority'\]/);
assert.doesNotMatch(a14Observer, /'no access grant'/);
assert.match(a14Observer, /v0\.6-a15-registry-current/);
assert.match(a15Observer, /matrix_cells:snapshot\.empirical_matrix_cells/);
assert.match(a15Observer, /result\.matrix_cells !== 120/);
assert.match(a15Observer, /HELD_SENSITIVE_CONTEXT/);
assert.match(readinessPreparer, /v0\.3-read-only-exact-head/);
assert.match(readinessPreparer, /legacy_fixture_rewriter_invoked:false/);
assert.match(readinessPreparer, /tracked_sources_mutated:false/);
assert.doesNotMatch(readinessPreparer, /import\(['"]\.\/prepare-ash-profile-closure-fixture\.mjs/);
assert.doesNotMatch(readinessPreparer, /writeFile\(convergenceRunnerPath|writeFile\(currentObserverPath|writeFile\(a2ProbePath/);
assert.doesNotMatch(archiveSource + registrySource + empiricalSource, /fetch\(|sendBeacon|indexedDB\.deleteDatabase|localStorage\.clear|sessionStorage\.clear|caches\.|serviceWorker|Clear-Site-Data/);
assert.doesNotMatch(archiveSource + registrySource + empiricalSource, /access_granted:\s*true|release_authorized:\s*true|release_authority:\s*true|declassification_authorized:\s*true|publication_authorized:\s*true|transfer_executed:\s*true|transfer_authority:\s*true/);

const massEpoch = 'td613.ash.cache-flush/2026-07-24-a11-postclosure-v1';
assert(shellSource.includes(`ASH_MASS_EVICTION_EPOCH = '${massEpoch}'`));
assert(evictionSource.includes(`ASH_AIA3_CACHE_EPOCH = '${massEpoch}'`));
assert.match(amendmentSource, /For A12 through A14, ordinary monotonic asset-version advancement MAY admit/);
assert.match(amendmentSource, /single graph-wide mass eviction[\s\S]*reserved for \*\*A15 postclosure\*\*/);
assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a14-harbor-memory-archive-contract/v1.1-a15-matrix-provenance',
  registry_version:ASH_DEMO_REGISTRY_VERSION,
  ordinary_asset_epoch:ASH_DEMO_ASSET_EPOCH,
  archive_fixture:fixture.demo_id,
  promoted_profiles:6,
  empirical_matrix_cells:120,
  a15_matrix_cells_registry_derived:true,
  a15_matrix_cells_runtime_enforced:true,
  required_mixed_media_nodes:requiredNodes.length,
  required_lineage_and_hold_relations:requiredRelations.length,
  case_map_verified:true,
  room_rules_verified:true,
  route_memory_verified:true,
  readiness_validator_read_only:true,
  a12_registry_observer_current:true,
  a12_observer_composed:true,
  a12_post_click_case_settlement:true,
  a12_present_state_convergence_adapter:true,
  a14_authority_ceiling_normalized:true,
  archive_entry_fallback:'map',
  coalesced_entry_clock:true,
  convergence_fallback_ms:64,
  tracked_probe_sources_mutated:false,
  legacy_fixture_rewriter_invoked:false,
  mass_eviction_epoch:massEpoch,
  graph_wide_mass_eviction_executed:false,
  access_granted:false,
  release_authority:false,
  declassification_authority:false,
  publication_authority:false,
  transfer_authority:false,
  raw_content_transport:false,
  human_closure_required:true,
  vercel_gate:'CLOSED'
}, null, 2));
