import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  EM_ROOT, REQUIRED_ROUTES, COMMON_CAPABILITIES, inspectEmCorpus,
  validateInterchange, compileAiaViews, compileTypedGraph, withdrawSource,
  makeBlurbHypothesis, stageSourceIntake
} from '../packages/dome_world_exact/fixtures/a15-r0/EMSTD613/99-ADMIN/em-atelier-parity.mjs';

const status=inspectEmCorpus();
assert.equal(status.method,'td613.atelier-method/v0.1');
assert.equal(status.source_file_count,87);
assert.equal(status.operational_work_count,32);
assert.deepEqual(status.independent_work_count_interval,[32,40]);
assert.equal(status.independent_work_count_exact,'UNRESOLVED');
assert.equal(status.registry_states.claims.declared,'NOT_GENERATED');
assert.equal(status.registry_states.relations.declared,'NOT_GENERATED');
assert.equal(status.registry_states.concepts.declared,'NOT_GENERATED');
assert.equal(status.registry_states.motifs.declared,'NOT_GENERATED');
assert.equal(status.registry_states.mechanisms.declared,'NOT_GENERATED');
assert.equal(status.registry_states.relations.present,false);
assert.equal(status.capabilities.length,COMMON_CAPABILITIES.length);
assert.equal(status.capabilities.find(x=>x.name==='TYPED_MULTIPLEX_TOPOLOGY').state,'NOT_GENERATED');
assert.equal(status.capabilities.find(x=>x.name==='SOURCE_CUSTODY_AND_DELTA_SYNC').state,'BOUNDED_HISTORICAL_INTAKE_ONLY');
assert.equal(status.authority.scientific_promotion,false);
assert.equal(status.src_compositional_fidelity,'NOT_TESTED');
assert.equal(status.full_functional_parity,'NOT_EARNED');
assert.equal(status.capabilities.find(x=>x.name==='FOUR_RECEIVER_AIA_PROJECTIONS').state,'FOUR_AIA_PACKET_PROJECTIONS_ONLY');
assert.equal(status.capabilities.find(x=>x.name==='ATELIER_INTERCHANGE_PACKET').state,'PACKET_SHAPE_VALIDATOR_ONLY');

const shared=JSON.parse(fs.readFileSync(path.resolve(EM_ROOT,'../ATELIER_METHOD/atelier-method-v0.1.json'),'utf8'));
const profile=JSON.parse(fs.readFileSync(path.join(EM_ROOT,'ATELIER_PROFILE.json'),'utf8'));
assert.deepEqual(profile.aia_routes,REQUIRED_ROUTES);
for(const stage of shared.stages) assert.ok(profile.active_stages.includes(stage)||Object.hasOwn(profile.held_or_conditional_stages,stage));
for(const strength of shared.divergent_strength_modules.EMSTD613)assert.ok(profile.distinctive_strengths.includes(strength));
assert.equal(shared.interchange.direct_raw_graph_union_forbidden,true);
assert.equal(shared.interchange.cross_atelier_authority_transfer,false);

const source=[...status.source_ids][0];
const secondSource=[...status.source_ids][1];
const candidate=makeBlurbHypothesis({
  finding_id:'SYNTHETIC_EM_BLURB_001',source_file_id:source,
  span_or_locator:'synthetic:blurb-1',proposition:'A metaphor-rich abstract might encode a particular formal mechanism.',
  snapshot_or_epoch:'TEST_FIXED_EPOCH'
});
const ctx={method:shared,sourceIds:status.source_ids};
assert.equal(validateInterchange(candidate,ctx).valid,true);
assert.equal(candidate.evidence_class,'RESEARCH_HYPOTHESIS');
assert.equal(candidate.human_closure_state,'PENDING_HUMAN_REVIEW');
assert.equal(candidate.external_witnesses.length,0);
assert.ok(candidate.claim_ceiling.includes('NO_MECHANISM_OR_NOVELTY_ESTABLISHED'));
const projections=compileAiaViews(candidate,ctx);
assert.deepEqual(Object.keys(projections),REQUIRED_ROUTES);
for(const route of REQUIRED_ROUTES){
  assert.deepEqual(projections[route].source_span_or_source_refs,candidate.source_span_or_source_refs);
  assert.equal(projections[route].claim_ceiling,candidate.claim_ceiling);
  assert.equal(projections[route].evidence_class,candidate.evidence_class);
  assert.equal(projections[route].authority_state,'RESEARCH_ONLY');
}
assert.ok(Object.hasOwn(projections.EXPERIENTIAL,'proposition'));
assert.ok(Object.hasOwn(projections.CUSTODIAL,'time_coordinates'));
assert.ok(Object.hasOwn(projections.AUDIT,'disconfirmers'));
assert.ok(Object.hasOwn(projections.IMPLEMENTATION,'method_version'));

const reject=(obj,why)=>assert.throws(()=>validateInterchange(obj,ctx),new RegExp(why));
reject({...candidate,claim_ceiling:''},'CLAIM_CEILING_MISSING');
reject({...candidate,authority_state:'TD613_SCIENCE'},'AUTHORITY_TRANSFER_FORBIDDEN');
reject({...candidate,human_closure_state:'APPROVED'},'UNAUTHORIZED_HUMAN_CLOSURE');
reject({...candidate,evidence_class:'SOURCE_ASSERTION'},'UNTRANSLATED_EVIDENCE_CLASS');
reject({...candidate,evidence_class:'TD613_SCIENTIFIC_PROMOTION'},'SCIENTIFIC_PROMOTION_FORBIDDEN');
reject({...candidate,source_span_or_source_refs:[{source_file_id:'invalid',span_or_locator:'x'}]},'UNBOUND_SOURCE_REF');
reject({...candidate,source_span_or_source_refs:[{source_file_id:source,span_or_locator:''}]},'SOURCE_SPAN_UNBOUND');
reject({...candidate,local_evidence_class:'LOCAL',class_translation_basis:''},'CLASS_TRANSLATION_BASIS_MISSING');
reject({...candidate,projection_or_graph_family:'AUTHORITY_AND_CAUSAL_FUSED'},'UNKNOWN_GRAPH_PROJECTION');
const withoutEvidence={...candidate};delete withoutEvidence.evidence_chain;
reject(withoutEvidence,'MISSING_PACKET_FIELD:evidence_chain');

const graphs=compileTypedGraph([
  {edge_id:'e1',from:'concept-a',to:'concept-b',projection:'CONCEPTUAL',
    relation:'SHARES_MOTIF_WITH',evidence_class:'RESEARCH_HYPOTHESIS',
    source_refs:[source],claim_ceiling:'MOTIF_ONLY',authority_state:'RESEARCH_ONLY'},
  {edge_id:'e2',from:'concept-a',to:'concept-c',projection:'GENEALOGICAL',
    relation:'DERIVES_FROM',evidence_class:'RESEARCH_HYPOTHESIS',
    source_refs:[secondSource],claim_ceiling:'GENEALOGY_UNPROVEN',authority_state:'RESEARCH_ONLY'}
],status.source_ids);
assert.equal(Object.keys(graphs).length,2);
assert.equal(graphs.CONCEPTUAL.length,1);
assert.equal(graphs.GENEALOGICAL.length,1);
const ablated=withdrawSource(graphs,source);
assert.equal(ablated.removed.CONCEPTUAL,1);
assert.equal(ablated.removed.GENEALOGICAL,0);
assert.equal(ablated.retained.GENEALOGICAL.length,1);
assert.equal(ablated.claim,'STRUCTURAL_WITHDRAWAL_ONLY_NO_CAUSAL_INFERENCE');

assert.throws(()=>compileTypedGraph([{...graphs.CONCEPTUAL[0],source_refs:[]}],status.source_ids),/EDGE_WITHOUT_SOURCE/);
assert.throws(()=>compileTypedGraph([{...graphs.GENEALOGICAL[0],authority_state:'SCIENTIFICALLY_CERTIFIED'}],status.source_ids),/EDGE_AUTHORITY_TRANSFER/);
assert.throws(()=>compileTypedGraph([{...graphs.GENEALOGICAL[0],evidence_class:'CAUSAL_PROOF'}],status.source_ids),/INVALID_EDGE_EVIDENCE_CLASS/);
assert.throws(()=>compileTypedGraph([{...graphs.CONCEPTUAL[0],source_refs:['unknown']}],status.source_ids),/UNKNOWN_EDGE_SOURCE/);

const intake=stageSourceIntake({
  bytes:new TextEncoder().encode('SYNTHETIC_STAGE_ONLY'),
  original_filename:'synthetic.md',media_type:'text/markdown',
  provenance_basis:'SYNTHETIC_HUMAN_SUPPLIED_TEST',
  rights_state:'PRIVATE_RETAIN_ONLY',parent_epoch:'TEST_FIXED_EPOCH'
});
assert.equal(intake.state,'STAGED_UNADMITTED');
assert.equal(intake.public_export_permitted,false);
assert.equal(intake.accession_authorized,false);
assert.match(intake.sha256,/^[a-f0-9]{64}$/);
assert.throws(()=>stageSourceIntake({
  bytes:new TextEncoder().encode('private'),original_filename:'x.md',
  media_type:'text/markdown',provenance_basis:'stated',
  parent_epoch:'X',rights_state:'UNKNOWN'
}),/INTAKE_RIGHTS_UNRESOLVED/);
console.log('Em bounded scaffold assertions completed: registry, common kernel, 4 packet projections, and synthetic hostile checks. SRC compositional fidelity NOT TESTED; full parity NOT EARNED.');
