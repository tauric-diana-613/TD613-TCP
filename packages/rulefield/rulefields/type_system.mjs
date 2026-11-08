/**
 * 𝌋 Typed Rulefield Projection v1 — historical data are immutable.
 * Rulefield ≠ Rule ≠ Assay ≠ Source ≠ Empirical Claim.
 *
 * This module overlays a reversible ontology onto the legacy 596-record
 * "rules" registry. It DOES NOT modify, rename, reclassify in place,
 * scientifically promote, or delete any historical record.
 *
 * Type decisions are bounded to an auditable operator-reviewed crosswalk.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readRulefield,validateRulefield} from '../rulefield.mjs';
import {readRevisionSeed,validateRevision} from './temporal_guardian.mjs';
const auditURL=new URL('./type_assessment/TYPE_ASSESSMENT_ROD0002.json',import.meta.url);
const registryURL=new URL('../data/rulefield.v1.json',import.meta.url);
const fail=code=>{const e=new Error(code);e.code=code;throw e;};
const hash=s=>createHash('sha256').update(s).digest('hex');
export const TYPES=Object.freeze({
 RULEFIELD:'RULEFIELD',
 RULE:'RULE',
 ASSAY:'ASSAY',
 MODEL:'MODEL',
 CLAIM:'CLAIM',
 SOURCE:'SOURCE',
 THEOREM:'THEOREM',
 EVIDENCE_BOUNDARY:'EVIDENCE_BOUNDARY',
 RESEARCH_PROGRAM:'RESEARCH_PROGRAM',
 HISTORICAL_RECORD:'HISTORICAL_RECORD',
 UNRESOLVED:'UNRESOLVED'
});
const KIND_MAP=Object.freeze({
 ASSAY_SPECIFICATION:'ASSAY',EXPERIMENTAL_PROGRAM:'RESEARCH_PROGRAM',
 RESEARCH_PIPELINE:'RESEARCH_PROGRAM',MIXED_RESEARCH_PROGRAM:'RESEARCH_PROGRAM',
 MODEL_INVENTORY:'MODEL',SOURCE_SCHEMA:'MODEL',OBSERVABLE_DEFINITION:'MODEL',
 MEASUREMENT_CONTRACT:'ASSAY',THEORETICAL_METHOD:'RESEARCH_PROGRAM',
 FORMALIZATION_DEBT:'UNRESOLVED',EVIDENCE_BOUNDARY:'EVIDENCE_BOUNDARY',
 EMPIRICAL_HYPOTHESIS:'CLAIM',FUTURE_RESEARCH_HYPOTHESIS:'CLAIM',
 NEGATIVE_RESULT_RECORD:'SOURCE',HISTORICAL_VERSIONING_METHOD:'RESEARCH_PROGRAM',
 THEOREM_AND_ASSAY:'THEOREM',COUNTEREXAMPLE_CONSTRUCTION:'ASSAY'
});
export function readTypeAssessment(){
 const a=JSON.parse(readFileSync(auditURL,'utf8'));
 if(a.schema!=='td613.rulefield.type-assessment/v1'||a.authorization.canonical_rule_registry_changed!==false)fail('TYPE_ASSESSMENT_UNSAFE');
 return a;
}
export function proposedRuleGate(proposal){
 const explicitField=proposal?.object_type==='RULEFIELD'||typeof proposal?.source_rulefield_id==='string'||typeof proposal?.rulefield_id==='string';
 if(proposal?.kind!=='PROPOSE_RULE')return {type:'NOT_A_RULE_PROPOSAL',status:'NOT_APPLICABLE',issues:[]};
 const issues=[];
 if(proposal.object_type==='RULEFIELD')issues.push('RULEFIELD_AS_RULE_TYPE_COLLAPSE');
 const formal=proposal.formal_rule;
 if(explicitField){
  if(!formal||typeof formal!=='object'||Array.isArray(formal))issues.push('MISSING_TYPED_LOCAL_RULE_CONTRACT');
  else{
   if(typeof formal.state_space!=='string'||formal.state_space.trim().length<3)issues.push('MISSING_STATE_SPACE');
   if(typeof formal.local_transition!=='string'||formal.local_transition.trim().length<3)issues.push('MISSING_LOCAL_TRANSITION');
   if(typeof formal.guard!=='string'||formal.guard.trim().length<3)issues.push('MISSING_GUARD');
   if(typeof formal.observer!=='string'||formal.observer.trim().length<3)issues.push('MISSING_OBSERVER');
  }
 }
 return {type:'PROPOSED_LOCAL_RULE',status:issues.length?'HELD_RULEFIELD_RULE_TYPE_COLLAPSE':'CANDIDATE_RULE_ONLY_NOT_ADOPTED',
  issues,human_adoption_authorized:false,scientific_credit:0,
  note:'A valid local-rule shape is not a tested theorem, human authorization or executable implementation.'};
}
export function buildTypedProjection({index=readRulefield(),seed=readRevisionSeed(),audit=readTypeAssessment()}={}){
 validateRulefield(index);validateRevision(seed);
 const ids=new Set(index.rules.map(r=>r.id)),fields=new Set(seed.items.map(r=>r.id));
 const decisions=new Map();
 for(const row of audit.promote_rule_records_to_field_or_assay){
  if(!ids.has(row.rule_id)||!(fields.has(row.field_or_priority_anchor)||index.priority_queue.some(q=>q.id===row.field_or_priority_anchor)))fail('CROSSWALK_UNKNOWN_ORIGINAL_ID');
  if(decisions.has(row.rule_id))fail('MULTIPLE_CONFLICTING_TYPE_DECISIONS');
  decisions.set(row.rule_id,row);
 }
 const retained=new Set(audit.protect_as_existing_rules.map(x=>x.rule_id));
 for(const id of retained)if(!ids.has(id)||decisions.has(id))fail('PROTECTED_RULE_COLLIDES_WITH_RETYPE');
 const byRule=index.rules.map(r=>{
  const selected=decisions.get(r.id);
  const explicit=retained.has(r.id);
  const kind=selected?KIND_MAP[selected.proposed_kind]:explicit?'RULE':'HISTORICAL_RECORD';
  if(!kind)fail('UNKNOWN_ONTOLOGY_TYPE');
  return {id:r.id,legacy_container:'rules',legacy_lane:r.lane,legacy_statement:r.statement,
   proposed_effective_type:kind,assessment_kind:selected?.proposed_kind||null,
   review_status:selected?'TYPE_PROJECTION_REVIEW_ONLY':explicit?'RETAIN_AS_RULE':'LEGACY_TYPE_NOT_INDEPENDENTLY_ADJUDICATED',
   parent_refs:selected?[selected.field_or_priority_anchor]:[],
   original_id_preserved:true,original_record_mutated:false,scientific_credit_added:0};
 });
 const byField=seed.items.map(f=>({id:f.id,kind:'RULEFIELD',human_original_expression:f.original_expression,
  academic_working_title:f.revision_overlay?.revised_academic_working_label||f.proposed_academic_label,
  source_snapshot:'RF-OD-0001_PLUS_RF-OD-0002_REVISION',review_status:'FIELD_NOT_AUTOMATIC_LOCAL_RULE'}));
 const childCandidates=audit.extract_rule_candidates_from_rulefields.map((c,i)=>{
  if(!fields.has(c.rulefield_id))fail('CHILD_RULE_WITHOUT_PARENT_FIELD');
  const kind=/PROTOCOL|ABLATION|MEASUREMENT|MODEL_SELECTION|ASSAY/.test(c.proposed_rule_title)?'ASSAY_CANDIDATE':'RULE_CANDIDATE';
  return {id:'RF-CAND-'+String(i+1).padStart(3,'0'),source_rulefield_id:c.rulefield_id,
   kind,working_name:c.proposed_rule_title,proposed_formal_specification:c.formal_specification,
   proposed_discriminating_test:c.discriminating_test,claim_boundary:c.claim_boundary,
   review_status:'UNQUALIFIED_NOT_ADMITTED',independent_test_executed:false,
   original_rule_id_created:false,scientific_credit:0};
 });
 const relations=[
  ...byRule.filter(r=>r.parent_refs.length).flatMap(r=>r.parent_refs.map(parent=>({from:r.id,to:parent,kind:'CONTEXTUALIZED_BY',source:'TYPE_ASSESSMENT_ROD0002',proposed_only:true}))),
  ...childCandidates.map(r=>({from:r.source_rulefield_id,to:r.id,kind:'PROPOSES_CHILD',source:'TYPE_ASSESSMENT_ROD0002',proposed_only:true})),
  ...audit.protect_as_research_fields.map(f=>({from:f.rulefield_id,to:f.rulefield_id,kind:'PRESERVE_DOMAIN_SCOPE',source:'TYPE_ASSESSMENT_ROD0002',proposed_only:true}))
 ];
 const counts=byRule.reduce((o,r)=>(o[r.proposed_effective_type]=(o[r.proposed_effective_type]||0)+1,o),{});
 const body={schema:'td613.rulefield.typed-projection/v1',
  assessment_source:'type_assessment/TYPE_ASSESSMENT_ROD0002.json',
  source_registry_sha256:hash(readFileSync(registryURL)),
  status:'REVIEW_ONLY_TYPED_PROJECTION_NO_HISTORICAL_REWRITE',
  counts:{original_legacy_rule_records:byRule.length,rulefields:byField.length,
   assessed_retypes:decisions.size,protected_rules:retained.size,
   derived_child_candidates:childCandidates.length,by_effective_type:counts},
  objects:{legacy:byRule,rulefields:byField,children:childCandidates},
  relations,
  authority:{human_ontology_review_pending:true,canonical_mutation:false,protected_flight:'HELD',
    type_assessment_is_not_rule_adoption:true,scientific_claim_credit:0},
  unassessed_records:byRule.filter(r=>r.proposed_effective_type==='HISTORICAL_RECORD').map(r=>r.id)
 };
 return {...body,projection_sha256:hash(JSON.stringify(body))};
}
export function validateTypedProjection(p){
 if(p?.schema!=='td613.rulefield.typed-projection/v1')return false;
 const {projection_sha256,...rest}=p;
 if(hash(JSON.stringify(rest))!==projection_sha256)return false;
 const a=p.objects?.legacy||[],b=p.objects?.rulefields||[],c=p.objects?.children||[];
 return a.length===596&&b.length===86&&c.length===31&&
 p.counts.assessed_retypes===26&&p.counts.protected_rules===11&&
 p.counts.original_legacy_rule_records===596&&
 a.every(x=>x.original_record_mutated===false&&x.original_id_preserved)&&
 p.authority.canonical_mutation===false&&p.authority.protected_flight==='HELD';
}
export function inspectType(id,{projection=buildTypedProjection()}={}){
 const target=[...projection.objects.legacy,...projection.objects.rulefields,...projection.objects.children].find(x=>x.id===id);
 if(!target)fail('TYPE_OBJECT_NOT_FOUND');
 return {...target,relations:projection.relations.filter(r=>r.from===id||r.to===id),
  projection_sha256:projection.projection_sha256};
}
