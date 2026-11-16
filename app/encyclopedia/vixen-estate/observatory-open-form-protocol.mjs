/**
 * TD613 · Observatory Open-Form Composition Protocol (OFCP) / v1.
 *
 * A mathematical synthesis can propose an entirely new visual grammar. The
 * available catalogue of installed displays is not the space of possible
 * presentations. No candidate can execute arbitrary source code, install a
 * renderer, mutate a lab, change a source, or bypass human Composer approval.
 */
export const OPEN_FORM_SCHEMA='td613.vixen.observatory.open-form/v1';
const is=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const str=(x,n=180)=>typeof x==='string'?x.trim().slice(0,n):'';
const strings=(x,min=1,max=24)=>Array.isArray(x)&&x.length>=min&&x.length<=max&&
 x.every(y=>typeof y==='string'&&y.trim()&&y.length<=260);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const clamp=x=>Math.min(1,Math.max(0,x));
const round=x=>Math.round(x*10000)/10000;
const result=(status,reason)=>({status,reason,approved:false,renderer_installed:false,
 release_authority:false,empirical_replication_credit:0});
function inspectProposal(p,i,sourceIds,currentIds){
 const reasons=[];
 if(!is(p))return {...result('HELD_INCOMPLETE','FORM_'+i+'_OBJECT_REQUIRED'),index:i};
 const id=str(p.id,96),family=str(p.family,150),title=str(p.title,220);
 const evidence=p.evidence,model=p.mathematical_model,mapping=p.data_mapping,
  grammar=p.visual_grammar,controls=p.interaction_contract,transition=p.transition;
 if(!id||!family||!title)reasons.push('EXACT_ID_FAMILY_TITLE');
 if(!is(evidence)||!strings(evidence.source_ids)||!Array.isArray(evidence.locators)||
   evidence.locators.length===0||evidence.locators.some(x=>!is(x)||
   !str(x.source_id)||!str(x.locator)||!str(x.supports)))reasons.push('SOURCE_LOCATED_EVIDENCE');
 if(!is(model)||!strings(model.observables)||!strings(model.transformations)||
   !strings(model.falsifiers)||!strings(model.assumptions))
   reasons.push('MATHEMATICAL_OBSERVABLES_TRANSFORM_ASSUMPTIONS_FALSIFIERS');
 if(!is(mapping)||!Array.isArray(mapping.channels)||mapping.channels.length===0||
    mapping.channels.length>32||mapping.channels.some(x=>!is(x)||!str(x.observable)||
      !str(x.visual_channel)||!str(x.units)||!str(x.interpretation)))
   reasons.push('DATA_TO_VISUAL_MEANING_AND_UNITS');
 if(!is(grammar)||!strings(grammar.primitives)||!strings(grammar.composition_rules)||
   !str(grammar.description,900))reasons.push('OPEN_VISUAL_GRAMMAR');
 if(!is(controls)||!str(controls.interaction_model)||
   !str(controls.reduced_motion_fallback)||!str(controls.nonvisual_equivalent))
   reasons.push('INTERACTION_REDUCED_MOTION_ACCESSIBILITY');
 if(!is(transition)||!str(transition.replaces_lab_id)||
   !str(transition.rollback_form_id)||!strings(transition.failure_modes))
   reasons.push('EXPLICIT_REPLACEMENT_AND_ROLLBACK');
 if(!is(p.renderer_plan)||!str(p.renderer_plan.implementation_strategy)||
   !str(p.renderer_plan.validation_plan))
   reasons.push('REVIEWABLE_RENDERER_ENGINEERING_PLAN');
 if(is(evidence)&&Array.isArray(evidence.source_ids)&&Array.isArray(evidence.locators)&&
  evidence.locators.some(x=>!evidence.source_ids.includes(x.source_id)))
   reasons.push('LOCATOR_SOURCE_OUTSIDE_EVIDENCE_SET');
 if(is(transition)&&str(transition.replaces_lab_id)&&!currentIds.has(transition.replaces_lab_id))
   reasons.push('REPLACEMENT_LAB_OUTSIDE_CURRENT_ESTATE');
 const unknownRefs=is(evidence)&&Array.isArray(evidence.source_ids)?
  evidence.source_ids.filter(id=>!sourceIds.has(id)):[];
 if(unknownRefs.length)reasons.push('SOURCE_REFS_NOT_IN_CURRENT_INDEX_OR_NOT_YET_VERIFIED');
 // Open vocabulary: no whitelist of chart, matrix, holonomy, 3D, swarm,
 // tessellation, generative topology, audio, performance or spatial form.
 const evidenceMatch=is(evidence)&&Array.isArray(evidence.locators)?
  evidence.locators.filter(x=>sourceIds.has(x.source_id)).length:0;
 const fit=round(.4*clamp(evidenceMatch/3)+.3*(is(model)&&strings(model.falsifiers)?1:0)+
  .2*(is(mapping)&&Array.isArray(mapping.channels)&&mapping.channels.length>0?1:0)+
  .1*(is(controls)&&str(controls.nonvisual_equivalent)?1:0));
 return {
  id:id||'INVALID_'+i,kind:'OPEN_FORM_PROPOSAL',family,title,
  evidence_ceiling:'DECLARED_SOURCE_MAPPINGS_NOT_INDEPENDENTLY_ADJUDICATED',
  source_refs:is(evidence)&&Array.isArray(evidence.source_ids)?evidence.source_ids.slice(0,24):[],
  linked_lab_id:is(transition)?str(transition.replaces_lab_id):null,
  previous_form_id:is(transition)?str(transition.rollback_form_id):null,
  visual_grammar:is(grammar)?grammar:null,mathematical_model:is(model)?model:null,
  data_mapping:is(mapping)?mapping:null,
  interaction_contract:is(controls)?controls:null,
  renderer_plan:is(p.renderer_plan)?p.renderer_plan:null,
  fitness:fit,
  status:reasons.length?'HELD_MISSING_EVIDENCE_OR_CONTRACT':'CANDIDATE_READY_FOR_REVIEW',
  requirements:reasons,has_executable_candidate_preview:false,
  renderer_installed:false,install_readiness:'NEW_RENDERER_NEEDS_PR_CI_HUMAN_COMPOSER',
  runtime_scene_replacement:false,approved:false,
  scientific_promotion:false,empirical_replication_credit:0,release_authority:false
 };
}
export function planOpenFormComposition({labs,proposals=[],sourceIds=[],synthesis=null,selectionId=null}={}){
 if(!Array.isArray(labs)||!Array.isArray(proposals)||proposals.length>24||
    !Array.isArray(sourceIds)||sourceIds.length>256)
  throw new TypeError('HELD_OPEN_FORM_BOUNDS');
 const ids=new Set(sourceIds),labIds=new Set(labs.map(x=>x.id));
 const installed=labs.map(lab=>{
  const overlaps=(lab.work_refs||[]).filter(x=>ids.has(x)).length;
  const fitness=round(.3+.1*clamp(overlaps/2));
  return {id:'CURRENT:'+lab.id,kind:'CURRENT_INSTALLED_LAB',family:lab.optic_program,
   title:lab.name,lab_id:lab.id,previous_form_id:lab.optic_program,
   fitness,renderer_state:'CURRENT_RUNTIME',
   install_readiness:'CURRENT_RUNTIME',linked_lab_id:lab.id,
   evidence_ceiling:lab.ceiling||'FORMULA_SIMULATION_NOT_EMPIRICAL_WITNESS',
   runtime_scene_replacement:false,approved:true,renderer_installed:true,
   has_executable_candidate_preview:true,empirical_replication_credit:0};
 });
 const examined=proposals.map((p,i)=>inspectProposal(p,i,ids,labIds));
 const duplicateIds=examined.map(x=>x.id).filter((id,i,arr)=>arr.indexOf(id)!==i);
 if(duplicateIds.length)for(const item of examined)if(duplicateIds.includes(item.id)){
  item.status='HELD_DUPLICATE_FORM_ID';item.requirements.push('UNIQUE_FORM_ID_REQUIRED');
 }
 const ranked=[...examined].sort((a,b)=>b.fitness-a.fitness||a.id.localeCompare(b.id));
 const baseline=installed[0]||null;
 const eligible=ranked.filter(x=>x.status==='CANDIDATE_READY_FOR_REVIEW');
 // The Composer can request any audition by exact ID for a NEW Score.
 // Selection is not acceptance: it cannot confer installation/release authority.
 const request=selectionId===null||selectionId===undefined?'':str(selectionId,120);
 const explicit=request?eligible.find(x=>x.id===request):null;
 if(request&&!explicit)throw new TypeError('HELD_VISUAL_SELECTION_NOT_ELIGIBLE');
 const selected=explicit||eligible[0]||baseline;
 return {
  schema:OPEN_FORM_SCHEMA,decision_space:'EXTENSIBLE_PROPOSED_GRAMMARS_NOT_FINITE_CHART_ENUMERATION',
  installed,proposed:ranked,selected,alternatives:[...ranked.filter(x=>x!==selected),...installed.filter(x=>x!==selected)],
  selection:{requested_id:request||null,
   chosen_id:selected?.id||null,explicit_request_resolved:!!explicit,
   status:'PROPOSAL_ONLY_REQUIRES_NEW_SCORE_DIGEST_AND_HUMAN_COMPOSER'},
  dynamic_form_types:true,form_family_whitelist:null,
  accepted_renderer_code_from_task:false,installed_renderer_modules_unmodified:true,
  composition_execution:'HELD_PENDING_EXACT_SCORE_HUMAN_CLOSURE_AND_RENDERER_QUALIFICATION',
  candidate_count:ranked.length,eligible_proposal_count:eligible.length,
  active_observatory_form_unchanged:true,
  engine_diagnostics_prove_form_fitness:false,
  human_composer_required:true,scientific_promotion_authority:false,
  empirical_replication_credit:0,release_authority:false
 };
}
