import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { METHOD, blankProfile,validateProfile,stageIntake,assertEpoch,
  compileTypedProjections,ablateSource,representationSufficiency,nonLiftPath,
  preregisterAssay,findingViews,recognitionPathway,stageOrderAssay,factorialForeignDonorPlan
} from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/atelier-core-v02.mjs';
import { preview,createEmptyAtelier,DEFAULT_PARENT } from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/atelier-scaffold-v02.mjs';

assert.equal(METHOD.schema,'td613.atelier-method/v0.2-candidate');
assert.equal(METHOD.required_capability_ids.length,44);
assert.deepEqual(Object.keys(METHOD.operator_families),['COMMON','SRC_CONTRIBUTED','WENDBINE_CONTRIBUTED','EM_CONTRIBUTED']);
for(const kind of ['SRC_CONTRIBUTED','WENDBINE_CONTRIBUTED','EM_CONTRIBUTED'])
  assert.ok(METHOD.operator_families[kind].length>=10);
for(const module of ['POLYCOMPILATION_CONSERVATION','QUERY_CONDITIONED_CANONICAL_SUFFICIENCY',
  'NOMENCLATURE_DECONTAMINATION','PRIOR_ART_NOVELTY_RESIDUAL_SIEVE','FOREIGN_DONOR_ARCHITECTURE_STYLE_FACTORIAL',
  'STAGE_ORDER_PERMUTATION_IDENTIFIABILITY','INTERMEDIATE_WITNESS_DIFFERENTIATION',
  'PUBLIC_RECOGNITION_BREADCRUMB_ROUTE','REPARATIVE_TRANSFER_AND_EXIT'])
  assert.ok(METHOD.required_capability_ids.includes(module));

const blank=blankProfile('ATILLA_OZY',{display_name:'Atilla & Ozy'});
assert.equal(validateProfile(blank).valid,true);
assert.equal(blank.source_count,0);
assert.equal(blank.current_findings.length,0);
assert.equal(blank.claim_ceiling,'NO_SOURCES_NO_RESEARCH_RESULT');
assert.equal(blank.consent_and_contact.outbound_contact_authorized,false);
assert.equal(blank.modules.PUBLIC_RECOGNITION_BREADCRUMB_ROUTE.corpus_execution,'NOT_TESTED');
assert.equal(Object.values(blank.modules).filter(m=>m.callable_available).length,1);
assert.equal(blank.modules.STAGE_ORDER_PERMUTATION_IDENTIFIABILITY.callable_available,true);
assert.equal(blank.modules.NOMENCLATURE_DECONTAMINATION.callable_available,false);

assert.deepEqual(blank.routes,['EXPERIENTIAL','CUSTODIAL','AUDIT','IMPLEMENTATION']);
const illegal=structuredClone(blank);
illegal.modules.POLYCOMPILATION_CONSERVATION.implementation_state='IMPLEMENTED_AND_TRUST_ME';
assert.throws(()=>validateProfile(illegal),/BAD_MODULE_IMPLEMENTATION/);
const polluted=structuredClone(blank);polluted.current_findings=[{id:'imaginary'}];
assert.throws(()=>validateProfile(polluted),/FINDINGS_WITHOUT_SOURCES/);
const recipient=structuredClone(blank);recipient.consent_and_contact.public_recognition_route_enabled=true;
assert.throws(()=>validateProfile(recipient),/RECOGNITION_DEFAULT_MUST_BE_DORMANT/);
assert.equal(preview('ATILLA_OZY','Atilla & Ozy').write_performed,false);
assert.equal(fs.existsSync(path.join(DEFAULT_PARENT,'ATILLA_OZY')),false);
assert.throws(()=>createEmptyAtelier('ATILLA_OZY',{create:true,destination:'/tmp/ATILLA_OZY'}),/DESTINATION_MUST_MATCH_ATELIER_ID_UNDER_COMMON_PARENT/);

const staged=stageIntake({bytes:new TextEncoder().encode('synthetic'),filename:'synthetic.md',
 source_provenance:'SYNTHETIC_TEST_ONLY',rights:'PRIVATE',epoch:'T1'});
assert.match(staged.sha256,/^[a-f0-9]{64}$/);
assert.equal(staged.public_export_permitted,false);
assert.equal(staged.source_import_authorized,false);
assert.throws(()=>stageIntake({bytes:new Uint8Array(),filename:'../../escape',source_provenance:'x',rights:'PRIVATE',epoch:'T1'}),/SOURCE_FILENAME_INVALID/);
assert.throws(()=>stageIntake({bytes:new Uint8Array(),filename:'x.md',source_provenance:'x',rights:'UNKNOWN',epoch:'T1'}),/RIGHTS_UNRESOLVED/);
assert.deepEqual(assertEpoch({snapshot_id:'T1'},{snapshot_id:'T1'}),{epoch_match:true,seal_replay_cryptographically_verified:false});
assert.throws(()=>assertEpoch({snapshot_id:'T1'},{snapshot_id:'T2'}),/SNAPSHOT_EPOCH_MISMATCH/);

const s=[{source_id:'s1'},{source_id:'s2'}],e=[
  {edge_id:'x1',from:'a',to:'b',graph:'CONCEPTUAL',relation:'SUPPORTS',source_ids:['s1'],evidence_class:'RESEARCH_HYPOTHESIS',claim_ceiling:'SOURCE_BOUNDED',authority_state:'RESEARCH_ONLY'},
  {edge_id:'x2',from:'b',to:'c',graph:'PROVENANCE',relation:'PRECEDES',source_ids:['s2'],evidence_class:'ARCHIVE_OBSERVATION',claim_ceiling:'SOURCE_BOUNDED',authority_state:'RESEARCH_ONLY'}
];
const top=compileTypedProjections({sources:s,edges:e,epoch:{snapshot_id:'T1'}});
assert.equal(top.edge_count,2);
assert.equal(top.graphs.CONCEPTUAL.length,1);
assert.equal(top.graphs.PROVENANCE.length,1);
const ablate=ablateSource(top,'s1');assert.equal(ablate.removed.CONCEPTUAL,1);assert.equal(ablate.removed.PROVENANCE,0);
assert.throws(()=>compileTypedProjections({sources:s,edges:[{...e[0],source_ids:['unseen']}],epoch:{snapshot_id:'T1'}}),/UNBOUND_EDGE_SOURCE/);
const pathEval=nonLiftPath({first:e[0],second:e[1],proposed_direct:'CAUSES'});
assert.equal(pathEval.direct_relation_admitted,false);
const suff=representationSufficiency({questions:['Q_place','Q_history'],surfaces:['CanonMap','Registry'],
 cells:{'Q_place::CanonMap':'SUFFICIENT','Q_place::Registry':'PARTIAL','Q_history::CanonMap':'INSUFFICIENT','Q_history::Registry':'SUFFICIENT'},
 evidence_refs:Object.fromEntries(['Q_place','Q_history'].flatMap(q=>['CanonMap','Registry'].map(s=>[q+'::'+s,['SYNTHETIC_WITNESS']])) )});
assert.equal(suff.status,'MATRIX_SUPPLIED_NOT_AUTOMATICALLY_PROVED');

const held=preregisterAssay({id:'EM_CONSTRUCT_A',epoch:'T1',target_ids:['s1'],controls:['SHUFFLE','LABEL_ABLATION'],comparison_frame:'MATCHED_TOKEN_BUDGET',heldout_before_scoring:true});
assert.equal(held.state,'PREREGISTERED_NOT_EXECUTED');
assert.throws(()=>preregisterAssay({id:'not-prereg',epoch:'T1',target_ids:['s1'],controls:['SHUFFLE'],comparison_frame:'?',heldout_before_scoring:false}),/ASSAY_NOT_PREREGISTERED/);
const views=findingViews({source_id:'s1',evidence_class:'RESEARCH_HYPOTHESIS',authority_state:'RESEARCH_ONLY',claim_ceiling:'NONE'});
assert.deepEqual(Object.keys(views),METHOD.routes);
for(const x of Object.values(views))assert.equal(x.authority_state,'RESEARCH_ONLY');
const recognition=recognitionPathway({source_id:'s1',public_locator:'https://example.org/research'});
assert.equal(recognition.outbound_contact_performed,false);
assert.equal(recognition.disclosure_required,false);
assert.throws(()=>recognitionPathway({source_id:'s1',public_locator:'https://example.org',requested_action:'CONTACT_PAUL'}),/NO_TARGETED_CONTACT_OR_DISCLOSURE/);

const stage=stageOrderAssay({
  operators:{
    K:x=>({...x,p:Math.min(x.p,2)}),
    P:x=>({...x,p:x.p%2}),
    A:x=>({...x,allowed:x.p===1}),
    N:x=>({...x,label:x.allowed===true?'YES':x.allowed===false?'NO':'UNKNOWN'})
  },
  inputs:[{p:0},{p:1},{p:2},{p:3}],
  register:x=>({p:x.p,allowed:x.allowed,label:x.label}),
  canonical_order:['K','P','A','N']
});
assert.equal(stage.prefix_permutations,24);
assert.ok(stage.terminal_equivalence_classes>=1);
assert.ok(stage.canonical_terminal_equivalence_size>=1);
assert.ok(stage.claim_ceiling.includes('NO_HIDDEN_STAGE_IDENTIFICATION_OR_NOVELTY'));
const factorial=factorialForeignDonorPlan({id:'F1',source_snapshot:'PUBLIC_FROZEN',receiver_snapshot:'TD613_FROZEN',
 architecture_control:'HOSTILE_VALID',style_control:'STYLE_BLINDED',unrelated_decoy:'DECOY_PREBOUND',matched_frame:'BUDGET_FROZEN'});
assert.deepEqual(factorial.cells.map(c=>c.cell),['C00','C01','C10','C11']);
assert.equal(factorial.state,'PREREGISTERED_NOT_EXECUTED');
assert.throws(()=>factorialForeignDonorPlan({id:'F1',source_snapshot:'X',receiver_snapshot:'Y',architecture_control:'A',style_control:'S',unrelated_decoy:'',matched_frame:'M'}),/FOREIGN_DONOR_CONTROL_NOT_PREREGISTERED/);

console.log('Universal Atelier v0.2 candidate synthetic tests pass: 44 registered modules, blank source-free preview, guarded intake, graph non-lift, query matrix, chronology, factorial, finite stage order, optional recognition route. Full cross-Atelier parity NOT TESTED.');
