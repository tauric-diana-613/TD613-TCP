import assert from 'node:assert/strict';
import fs from 'node:fs';
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

const archiveSource = fs.readFileSync('app/dome-world/ash-archive-profile-demo.js', 'utf8');
const registrySource = fs.readFileSync('app/dome-world/ash-demo-registry.js', 'utf8');
const currentObserver = fs.readFileSync('scripts/ash-a2-a5-browser-probe.mjs', 'utf8');
const legacyObserver = fs.readFileSync('scripts/ash-a2-a5-browser-probe-a13.mjs', 'utf8');
const shellSource = fs.readFileSync('api/dome-world-shell.js', 'utf8');
const evictionSource = fs.readFileSync('app/dome-world/ash-cache-eviction-aia3.js', 'utf8');
const amendmentSource = fs.readFileSync('app/dome-world/docs/ASH_KEEP_A12_A15_OPERATOR_AMENDMENT_V0_1.md', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(ASH_ARCHIVE_DEMO_VERSION, 'td613.ash.archive-demo/v0.2-a14-harbor-memory');
assert.equal(ASH_ARCHIVE_ACCESSION_SCHEMA, 'td613.ash.archive-accession/v0.2-harbor-memory');
assert.equal(ASH_DEMO_REGISTRY_VERSION, 'td613.ash.demo-registry/v0.2-a14');
assert.equal(ASH_DEMO_ASSET_EPOCH, '20260725-a14-release-v1');

const fixture = buildArchiveDemoFixture();
assert.equal(fixture.profile, 'archive');
assert.equal(fixture.schema, ASH_ARCHIVE_ACCESSION_SCHEMA);
assert.equal(fixture.demo_id, 'demo_archive_harbor_memory_v1');
assert.equal(fixture.title, 'Harbor Memory Archive · mixed-media accession and access review');
assert.equal(fixture.rooms.length, 8);
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
  'node_original_audio',
  'node_transcript',
  'node_edited_transcript',
  'node_photograph',
  'node_accession_note',
  'node_donor_restriction',
  'node_uncertain_date',
  'node_duplicate_scan',
  'node_missing_release_form',
  'node_embargoed_item',
  'node_public_access_copy',
  'node_custody_root',
  'node_preservation_master',
  'node_transfer_manifest',
  'node_destination_hold'
];
for (const node of requiredNodes) {
  assert(fixture.nodes.some(entry => entry.id === node), `Harbor Memory fixture omitted ${node}.`);
}

const requiredRelations = [
  'edge_audio_transcript',
  'edge_transcript_edited',
  'edge_photo_date',
  'edge_photo_scan',
  'edge_root_audio',
  'edge_restriction_audio',
  'edge_release_missing',
  'edge_embargo_item',
  'edge_master_audio',
  'edge_redaction_access',
  'edge_authority_access',
  'edge_manifest_destination'
];
for (const relation of requiredRelations) {
  assert(fixture.relationships.some(entry => entry.id === relation), `Harbor Memory fixture omitted ${relation}.`);
}

for (const route of [
  'route_internal_accession_review',
  'route_restricted_research_copy',
  'route_public_access_copy_review',
  'route_delayed_transfer'
]) {
  assert(fixture.rules.some(entry => entry.route_id === route), `Harbor Memory fixture omitted ${route}.`);
}

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
assert.equal(snapshot.release_authority, false);
assert.equal(snapshot.raw_content_transport, false);
assert.equal(snapshot.automatic_ash_action, false);
assert.equal(snapshot.human_review_required, true);

for (const token of [
  'SYNTHETIC_HARBOR_MEMORY_ARCHIVE_FIXTURE',
  'Harbor Memory Archive',
  'Original audio recording',
  'Transcript derived from original audio',
  'Edited transcript derivative',
  'Collection photograph',
  'Photograph date remains uncertain',
  'Duplicate photograph scan',
  'Release form is missing',
  'Embargoed collection item',
  'Public access copy',
  'access_granted:false',
  'release_authorized:false',
  'declassification_authorized:false',
  'transfer_executed:false'
]) {
  assert(archiveSource.includes(token), `Harbor Memory provider omitted ${token}.`);
}

assert(currentObserver.includes("replaceAll('td613.ash.demo-registry/v0.1-a13', 'td613.ash.demo-registry/v0.2-a14')"));
assert(legacyObserver.includes("td613.ash.demo-registry/v0.1-a13"));
assert.doesNotMatch(archiveSource + registrySource, /fetch\(|sendBeacon|indexedDB\.deleteDatabase|localStorage\.clear|sessionStorage\.clear|caches\.|serviceWorker|Clear-Site-Data/);
assert.doesNotMatch(archiveSource + registrySource, /access_granted:\s*true|release_authorized:\s*true|release_authority:\s*true|declassification_authorized:\s*true|publication_authorized:\s*true|transfer_executed:\s*true|transfer_authority:\s*true/);

const massEpoch = 'td613.ash.cache-flush/2026-07-24-a11-postclosure-v1';
assert(shellSource.includes(`ASH_MASS_EVICTION_EPOCH = '${massEpoch}'`));
assert(evictionSource.includes(`ASH_AIA3_CACHE_EPOCH = '${massEpoch}'`));
assert.match(amendmentSource, /For A12 through A14, ordinary monotonic asset-version advancement MAY admit/);
assert.match(amendmentSource, /single graph-wide mass eviction[\s\S]*reserved for \*\*A15 postclosure\*\*/);
assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a14-harbor-memory-archive-contract/v0.2',
  registry_version:ASH_DEMO_REGISTRY_VERSION,
  ordinary_asset_epoch:ASH_DEMO_ASSET_EPOCH,
  archive_fixture:fixture.demo_id,
  promoted_profiles:6,
  required_mixed_media_nodes:requiredNodes.length,
  required_lineage_and_hold_relations:requiredRelations.length,
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
