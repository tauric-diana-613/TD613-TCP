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
const shellSource = fs.readFileSync('api/dome-world-shell.js', 'utf8');
const evictionSource = fs.readFileSync('app/dome-world/ash-cache-eviction-aia3.js', 'utf8');
const amendmentSource = fs.readFileSync('app/dome-world/docs/ASH_KEEP_A12_A15_OPERATOR_AMENDMENT_V0_1.md', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(ASH_ARCHIVE_DEMO_VERSION, 'td613.ash.archive-demo/v0.1-a14-accession');
assert.equal(ASH_ARCHIVE_ACCESSION_SCHEMA, 'td613.ash.archive-accession/v0.1');
assert.equal(ASH_DEMO_REGISTRY_VERSION, 'td613.ash.demo-registry/v0.2-a14');
assert.equal(ASH_DEMO_ASSET_EPOCH, '20260725-a14-release-v1');

const fixture = buildArchiveDemoFixture();
assert.equal(fixture.profile, 'archive');
assert.equal(fixture.schema, ASH_ARCHIVE_ACCESSION_SCHEMA);
assert.equal(fixture.rooms.length, 8);
assert.equal(fixture.nodes.length, 24);
assert.equal(fixture.relationships.length, 15);
assert.equal(fixture.rules.length, 4);
assert.equal(fixture.routes.length, 4);
assert.equal(fixture.assay.accession_scope_declared, true);
assert.equal(fixture.assay.provenance_gaps_preserved, true);
assert.equal(fixture.assay.restrictions_interpreted_automatically, false);
assert.equal(fixture.assay.access_copy_created_automatically, false);
assert.equal(fixture.assay.release_authority, false);
assert.equal(fixture.assay.transfer_authority, false);
assert.match(fixture.assay.claim_ceiling, /NO_ACCESS_GRANT_RELEASE_DECLASSIFICATION_OR_TRANSFER_AUTHORITY/);

for (const room of ['room_accession','room_provenance','room_restrictions','room_embargo','room_derivatives','room_access','room_routes','room_next']) {
  assert(fixture.rooms.some(entry => entry.id === room), `Archive fixture omitted ${room}.`);
}
for (const node of ['node_custody_root','node_donor_restriction','node_embargo_clock','node_preservation_master','node_research_copy','node_access_approval_gap','node_transfer_manifest','node_destination_hold']) {
  assert(fixture.nodes.some(entry => entry.id === node), `Archive fixture omitted ${node}.`);
}
for (const route of ['route_internal_accession_review','route_restricted_research_copy','route_public_derivative_review','route_delayed_transfer']) {
  assert(fixture.rules.some(entry => entry.route_id === route), `Archive fixture omitted ${route}.`);
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
  'SYNTHETIC_ARCHIVE_ACCESSION_FIXTURE',
  'access_granted:false',
  'release_authorized:false',
  'declassification_authorized:false',
  'transfer_executed:false',
  'preservation master',
  'access copy',
  'delayed transfer',
  'human authority required'
]) assert(archiveSource.includes(token), `Archive provider omitted ${token}.`);

assert.doesNotMatch(archiveSource + registrySource, /fetch\(|sendBeacon|indexedDB\.deleteDatabase|localStorage\.clear|sessionStorage\.clear|caches\.|serviceWorker|Clear-Site-Data/);
assert.doesNotMatch(archiveSource + registrySource, /access_granted:\s*true|release_authorized:\s*true|release_authority:\s*true|declassification_authorized:\s*true|transfer_executed:\s*true|transfer_authority:\s*true/);

const massEpoch = 'td613.ash.cache-flush/2026-07-24-a11-postclosure-v1';
assert(shellSource.includes(`ASH_MASS_EVICTION_EPOCH = '${massEpoch}'`));
assert(evictionSource.includes(`ASH_AIA3_CACHE_EPOCH = '${massEpoch}'`));
assert.match(amendmentSource, /For A12 through A14, ordinary monotonic asset-version advancement MAY admit/);
assert.match(amendmentSource, /single graph-wide mass eviction[\s\S]*reserved for \*\*A15 postclosure\*\*/);
assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a14-archive-accession-contract/v0.1',
  registry_version:ASH_DEMO_REGISTRY_VERSION,
  ordinary_asset_epoch:ASH_DEMO_ASSET_EPOCH,
  archive_fixture:fixture.demo_id,
  promoted_profiles:6,
  mass_eviction_epoch:massEpoch,
  graph_wide_mass_eviction_executed:false,
  access_granted:false,
  release_authority:false,
  declassification_authority:false,
  transfer_authority:false,
  raw_content_transport:false,
  human_closure_required:true,
  vercel_gate:'CLOSED'
}, null, 2));
