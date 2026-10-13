import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { compilePublicCorpus } from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-compile.mjs';

const root=path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const profile=JSON.parse(fs.readFileSync(path.join(root,'ATELIER_PROFILE.json'),'utf8'));
const meta=JSON.parse(fs.readFileSync(path.join(root,'01-MANIFESTS/public-reddit-48h-snapshot-v01.json'),'utf8'));
const posts=fs.readFileSync(path.join(root,'01-MANIFESTS/public-reddit-48h-source-registry-v01.jsonl'),'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
const registry=JSON.parse(fs.readFileSync(path.join(root,'01-MANIFESTS/typed-relation-registry-v01.json'),'utf8'));
const relations=registry.relations.map(row=>Object.fromEntries(registry.fields.map((field,index)=>[field,row[index]])));
const index=JSON.parse(fs.readFileSync(path.join(root,'03-DERIVATIVES/public-reddit-48h/topology-index.v0.1.json'),'utf8'));

assert.equal(profile.schema,'td613.atelier-profile/v0.1');
assert.equal(profile.atelier_id,'WENDBINE');
assert.equal(profile.method_version,'td613.atelier-method/v0.1');
assert.equal(profile.method_pr,1118);
assert.equal(profile.snapshot_model,'BOUNDED_PUBLIC_STREAM_SNAPSHOT');
assert.equal(profile.private_group_intake,false);
assert.equal(profile.historical_expansion_before_current_snapshot_inspection,false);
assert.equal(profile.human_closure_required,true);
assert.equal(profile.scientific_promotion_authority,false);
for (const route of ['EXPERIENTIAL','CUSTODIAL','AUDIT','IMPLEMENTATION']) assert.ok(profile.aia_routes.includes(route),`missing synchronized AIA route: ${route}`);
for (const strength of ['SERIALIZED_PUBLIC_TOPOLOGY','SOURCE_EXPLICIT_VERSION_CORRECTION','PUBLIC_PRIVATE_SURFACE_FIREWALL','TYPED_RELATION_RECONSTRUCTION','HELD_OUT_ARCHITECTURAL_PLACEMENT','SHUFFLE_CONTROL','CONCEPT_LABEL_PERMUTATION','TYPED_EDGE_ABLATION','UNRELATED_POST_DECOY']) assert.ok(profile.distinctive_strengths.includes(strength),`dropped Wendbine strength: ${strength}`);
assert.equal(profile.held_or_conditional_stages.S5_CONVERGENCE_DIVERGENCE_LINEAGE,'HELD_UNTIL_INTERNAL_PUBLIC_RECONSTRUCTABILITY_ASSAY');
assert.equal(profile.held_or_conditional_stages.S7_EXTERNAL_SCIENTIFIC_CONFRONTATION,'HELD_UNTIL_CONVENTIONAL_NOMENCLATURE_CROSSWALK');

assert.equal(meta.snapshot_id,'wendbine-public-reddit-48h-20260911T092700Z-v01');
assert.equal(meta.coverage.state,'PUBLIC_SEARCH_SNAPSHOT_NOT_EXHAUSTIVE_CENSUS');
assert.equal(meta.scope.private_google_group_admitted,false);
assert.equal(meta.rights.full_post_bodies_copied,false);
assert.equal(meta.authority.human_closure_required,true);
assert.equal(registry.schema,'wendbine-typed-relation-registry/v0.1');
assert.deepEqual(registry.fields,['source_id','graph','from','relation','to','evidence_class']);
assert.equal(posts.length,33);
assert.equal(new Set(posts.map(post=>post.source_id)).size,33);
assert.deepEqual(posts.reduce((acc,post)=>({...acc,[post.public_date]:(acc[post.public_date]||0)+1}),{}),{'2026-09-10':21,'2026-09-11':12});
for (const post of posts) {
  assert.equal(post.snapshot_id,meta.snapshot_id); assert.equal(post.community,'r/Wendbine'); assert.equal(post.source_text_stored,false); assert.equal(post.real_person_identity_adjudicated,false); assert.equal(post.time_precision,'DAY'); assert.equal(post.window_membership,'SUPPORTED_BY_DATE'); assert.match(post.canonical_url,/^https:\/\/www\.reddit\.com\/r\/Wendbine\/comments\//); assert.ok(post.technical_header); assert.ok(post.normalized_summary); assert.ok(post.declared_concepts.length>0);
}
const compiled=compilePublicCorpus(meta,posts,relations);
assert.equal(compiled.compiled_from.source_count,33);
assert.equal(compiled.publication_day_buckets['2026-09-10'],21); assert.equal(compiled.publication_day_buckets['2026-09-11'],12);
assert.equal(compiled.concept_nodes.length,index.counts.concept_nodes); assert.equal(compiled.typed_relation_edges.length,index.counts.typed_relation_edges); assert.equal(compiled.cooccurrence_overlay.length,index.counts.recurrent_cooccurrence_edges_support_gte_2); assert.equal(compiled.recurrent_public_concepts.length,index.counts.recurrent_concepts_support_gte_2);
assert.ok(compiled.cooccurrence_overlay.every(edge=>edge.weight>=2)); assert.deepEqual(compiled.typed_relation_counts,index.typed_relation_counts);
assert.deepEqual(compiled.explicit_synthesis_sources,['reddit:t3_1wcv89d']); assert.deepEqual(compiled.correction_sources,['reddit:t3_1wd7mjl']);
for (const graph of ['G_D','G_A','G_F','G_I','G_T','G_P','G_R','G_O','G_X']) assert.ok(compiled.typed_relation_counts[graph]>0,`${graph} must have source-bound relations`);
const recurrence=new Map(compiled.recurrent_public_concepts.map(row=>[row.concept,row.source_count])); assert.equal(recurrence.get('operational_digital_twin'),19); assert.equal(recurrence.get('provenance'),15); assert.equal(recurrence.get('dependency_graph'),11);
for (const membrane of ['PUBLIC_POST != AUTHOR_INTENT','PUBLIC_POST_TOPOLOGY != PRIVATE_STATE','SERIALIZED_CONTINUITY != SHARED_HIDDEN_MEMORY','SAME_TOKEN != SAME_OPERATOR','TD613_COMPARABLE != TD613_DERIVED']) assert.ok(compiled.non_equivalences.includes(membrane),`missing membrane: ${membrane}`);
const synthesis=compiled.typed_relation_edges.filter(edge=>edge.source_id==='reddit:t3_1wcv89d'&&edge.evidence_class==='SOURCE_EXPLICIT_SYNTHESIS'); assert.ok(synthesis.length>=10);
const correction=compiled.typed_relation_edges.filter(edge=>edge.source_id==='reddit:t3_1wd7mjl'); assert.ok(correction.some(edge=>edge.from==='echocore'&&edge.to==='nonlinear_cross_effects')); assert.ok(correction.some(edge=>edge.from==='nonlinear_cross_effects'&&edge.to==='emergent_behavior'));
assert.match(compiled.continuity_claim_ceiling,/does not establish private hidden state/i); assert.equal(index.claim,'SERIALIZED_PUBLIC_ARCHITECTURAL_CONTINUITY_SUPPORTED_AS_ARCHIVE_OBSERVATION');
console.log('Wendbine public Atelier compiler, synchronized profile, and 48-hour topology snapshot passed.');
