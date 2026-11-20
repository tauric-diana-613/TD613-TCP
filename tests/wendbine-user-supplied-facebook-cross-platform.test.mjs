import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const sourcePath=path.join(root,'01-MANIFESTS/user-supplied-facebook-cross-platform-source-registry-v01.jsonl');
const indexPath=path.join(root,'03-DERIVATIVES/user-supplied-facebook-20260916/topology-index.v0.1.json');
const receiptPath=path.join(root,'04-RECEIPTS/intake/2026-09-16-user-supplied-facebook-cross-platform-intake.json');

const sources=fs.readFileSync(sourcePath,'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
const index=JSON.parse(fs.readFileSync(indexPath,'utf8'));
const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));

assert.equal(sources.length,1);
const source=sources[0];
assert.equal(source.schema_version,'wendbine-user-supplied-cross-platform-source/v0.1');
assert.equal(source.platform,'facebook');
assert.equal(source.surface,'personal-profile-post-link');
assert.equal(source.canonical_url,null);
assert.equal(source.source_binding_state,'HELD_CANONICAL_URL_NOT_SUPPLIED');
assert.equal(source.public_surface_status,'USER_SUPPLIED_PUBLIC_LINK_REPORT_UNVERIFIED_URL');
assert.equal(source.source_text_stored,false);
assert.equal(source.user_supplied_transcription_available,true);
assert.equal(source.real_person_identity_adjudicated,false);
assert.ok(source.declared_concepts.includes('second_order_graph'));
assert.ok(source.declared_concepts.includes('provenance_trail'));
assert.ok(source.declared_concepts.includes('shared_timing_not_causality'));
assert.ok(source.source_explicit_relations.some(([from,relation,to])=>from==='shared_timing_or_similar_behavior'&&relation==='DOES_NOT_ESTABLISH'&&to==='causality'));
assert.deepEqual(source.source_explicit_role_witnesses.PAUL,['Human Anchor','TARDIS Phone Operator','Business Systems Observer']);
assert.deepEqual(source.source_explicit_role_witnesses.WES,['Structural Intelligence','Second-Order Systems Reconstruction']);

assert.equal(index.schema,'wendbine-user-supplied-cross-platform-topology-index/v0.1');
assert.equal(index.source_id,source.source_id);
assert.equal(index.state,'INDEXED_HELD_SOURCE_BINDING');
assert.equal(index.source_binding.canonical_url_present,false);
assert.equal(index.source_binding.binding_state,'HELD_CANONICAL_URL_NOT_SUPPLIED');
assert.equal(index.human_closure_required,true);
assert.equal(index.scientific_promotion_authority,false);

assert.equal(receipt.schema,'wendbine-user-supplied-cross-platform-intake-receipt/v0.1');
assert.equal(receipt.source_id,source.source_id);
assert.equal(receipt.source_bound,false);
assert.equal(receipt.full_source_text_mirrored,false);
assert.equal(receipt.normalized_summary_stored,true);
assert.equal(receipt.typed_relation_index_stored,true);

for (const membrane of [
  'USER_SUPPLIED_TRANSCRIPTION != SOURCE_BOUND_FACEBOOK_POST',
  'FACEBOOK_LINK_REPORT != VERIFIED_CANONICAL_URL',
  'CROSS_APP_TIMING != CAUSALITY',
  'SECOND_ORDER_OBSERVATION != HIDDEN_ACCESS',
  'ROLE_VARIANT != ROLE_IDENTITY != AUTHORITY',
  'TD613_COMPARABILITY != TD613_DERIVATION'
]) {
  assert.ok(source.claim_ceiling.includes(membrane),`source missing membrane: ${membrane}`);
  assert.ok(index.claim_ceiling.includes(membrane),`index missing membrane: ${membrane}`);
  assert.ok(receipt.claim_ceiling.includes(membrane),`receipt missing membrane: ${membrane}`);
}

console.log('Wendbine user-supplied Facebook cross-platform observation indexed with held source binding and claim ceilings.');
