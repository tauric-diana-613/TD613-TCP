import test from 'node:test';
import assert from 'node:assert/strict';
import {planOpenFormComposition,OPEN_FORM_SCHEMA} from
 '../app/encyclopedia/vixen-estate/observatory-open-form-protocol.mjs';

const labs=[
 {id:'LAB_ALPHA',name:'Installed control exhibit',optic_program:'CONTROL_PLANES',
  work_refs:['work:A'],ceiling:'SOURCE_CONDITIONED_TOY_MODEL'},
 {id:'LAB_BETA',name:'Installed relational exhibit',optic_program:'HOLONOMY',
  work_refs:['work:B'],ceiling:'SOURCE_CONDITIONED_TOY_MODEL'}
];
const exemplar=()=>({
 id:'UNANTICIPATED_VISUAL_GRAMMAR',
 family:'DYNAMIC_OPERATOR_INVENTED_FAMILY_WITH_NO_PREDEFINED_RENDERER',
 title:'An unanticipated mathematical representation, not a prescribed chart',
 evidence:{source_ids:['work:A'],locators:[{
  source_id:'work:A',locator:'section 3, transform statement',
  supports:'bounded correspondence between the source observable and the visual channel'
 }]},
 mathematical_model:{observables:['x(t)'],transformations:['T(x,t)'],
  assumptions:['sampled synthetic trajectory'],falsifiers:['bounded prediction fails']},
 data_mapping:{channels:[{observable:'x(t)',visual_channel:'operator-originated gesture',
  units:'dimensionless',interpretation:'transformed variable, not an external witness'}]},
 visual_grammar:{description:'An entirely new grammar unconstrained by current renderers',
  primitives:['unclassified future geometric primitive'],
  composition_rules:['meaning-preserving reversible transformation']},
 interaction_contract:{interaction_model:'operator-determined bounded controls',
  reduced_motion_fallback:'static comparison frame',
  nonvisual_equivalent:'tabular trace with source and mathematical coordinate'},
 transition:{replaces_lab_id:'LAB_BETA',rollback_form_id:'HOLONOMY',
  failure_modes:['semantic mapping ambiguous']},
 renderer_plan:{implementation_strategy:'create a separately reviewed renderer module',
  validation_plan:'source-bound geometry, accessibility and breakpoint witness'}
});
test('candidate grammar is open vocabulary, carries source and meaning, remains uninstalled',()=>{
 const before=JSON.stringify(labs);
 const s=planOpenFormComposition({labs,sourceIds:['work:A','work:B'],proposals:[exemplar()]});
 assert.equal(s.schema,OPEN_FORM_SCHEMA);
 assert.equal(s.dynamic_form_types,true);
 assert.equal(s.form_family_whitelist,null);
 assert.equal(s.selected.id,'UNANTICIPATED_VISUAL_GRAMMAR');
 assert.equal(s.selected.status,'CANDIDATE_READY_FOR_REVIEW');
 assert.equal(s.selected.has_executable_candidate_preview,false);
 assert.equal(s.selected.runtime_scene_replacement,false);
 assert.equal(s.active_observatory_form_unchanged,true);
 assert.equal(s.installed.length,2);
 assert.equal(JSON.stringify(labs),before);
});
test('missing citations and source identities HOLD rather than acquire visual authority',()=>{
 const p=exemplar();p.evidence.source_ids=['invented:unindexed'];
 const a=planOpenFormComposition({labs,sourceIds:['work:A'],proposals:[p]});
 assert.equal(a.proposed[0].status,'HELD_MISSING_EVIDENCE_OR_CONTRACT');
 assert.ok(a.proposed[0].requirements.includes('SOURCE_REFS_NOT_IN_CURRENT_INDEX_OR_NOT_YET_VERIFIED'));
 assert.equal(a.selected.kind,'CURRENT_INSTALLED_LAB');
});
test('requires all visual meaning, mathematical falsifiers, reversibility, and accessibility',()=>{
 const p=exemplar();p.data_mapping.channels=[];p.mathematical_model.falsifiers=[];
 p.interaction_contract.nonvisual_equivalent='';p.transition.rollback_form_id='';
 const a=planOpenFormComposition({labs,sourceIds:['work:A'],proposals:[p]});
 assert.equal(a.proposed[0].status,'HELD_MISSING_EVIDENCE_OR_CONTRACT');
 assert.ok(a.proposed[0].requirements.length>=4);
});
test('no proposal can smuggle executable renderer code or displace the live exhibit',()=>{
 const p=exemplar();p.renderer_plan.unsafe_eval='alert(1)';p.javascript_source='__autoexec__';
 const a=planOpenFormComposition({labs,sourceIds:['work:A'],proposals:[p]});
 assert.equal(a.accepted_renderer_code_from_task,false);
 assert.equal(a.installed_renderer_modules_unmodified,true);
 assert.equal(a.selected.renderer_installed,false);
 assert.equal(a.selected.approved,false);
 assert.equal(a.release_authority,false);
});
test('duplicate candidate IDs are held even across new arbitrary families',()=>{
 const a=planOpenFormComposition({labs,sourceIds:['work:A'],proposals:[exemplar(),exemplar()]});
 assert.equal(a.eligible_proposal_count,0);
 assert.ok(a.proposed.every(p=>p.status==='HELD_DUPLICATE_FORM_ID'));
});

test('The Composer may select the seventh eligible audition, but never obtain release authority by selecting',()=>{
 const proposals=Array.from({length:7},(_,i)=>({...exemplar(),
  id:'UNEXPECTED_FORM_'+i,
  title:'Independent new visual grammar '+i,
  family:'NOVEL_'+i
 }));
 const result=planOpenFormComposition({labs,sourceIds:['work:A'],
  proposals,selectionId:'UNEXPECTED_FORM_6'});
 assert.equal(result.selected.id,'UNEXPECTED_FORM_6');
 assert.equal(result.selection.explicit_request_resolved,true);
 assert.equal(result.proposed.length,7);
 assert.equal(result.release_authority,false);
 assert.equal(result.active_observatory_form_unchanged,true);
 assert.throws(()=>planOpenFormComposition({labs,sourceIds:['work:A'],
  proposals,selectionId:'INVENTED_EIGHTH'}),/HELD_VISUAL_SELECTION_NOT_ELIGIBLE/);
 const denied=proposals.map(x=>({...x}));
 denied[2].evidence={source_ids:['foreign:unverified'],locators:[]};
 assert.throws(()=>planOpenFormComposition({labs,sourceIds:['work:A'],
  proposals:denied,selectionId:'UNEXPECTED_FORM_2'}),/HELD_VISUAL_SELECTION_NOT_ELIGIBLE/);
});
