/** 𝌋 Residual semantic audit. Classification CANDIDATES, never scientific adjudication.
 * All 559 formerly unassessed objects are covered by source-linked, reversible decisions.
 * A legacy "rule" container is not evidence of an executable law.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readRulefield} from '../rulefield.mjs';
import {readTypeAssessment} from './type_system.mjs';
const regURL=new URL('../data/rulefield.v1.json',import.meta.url);
const hash=s=>createHash('sha256').update(s).digest('hex');
const fail=s=>{throw Object.assign(new Error(s),{code:s})};
const signalDefs=[
 ['ASSAY_INTERVENTION',/\b(test|compare|contrast|vary|perturb|randomiz|ablat|factorial|counterbalanc|sweep|trial|intervention|experiment|paired policy|hold(?:ing)? .*constant)\b/i,'ASSAY'],
 ['GUARD_OBLIGATION',/\b(must|never|cannot|refuse|reject|require|prohibit|do not|not admitted|fail.closed|preserv|retain|hold|only if|without .* cannot)\b/i,'RULE'],
 ['MODEL_DEFINITION',/\b(define|represent|typed|model|coordinate|metric|state|graph|clock|projection|partition|kernel|relation|geometry|map|schema|transition)\b/i,'MODEL'],
 ['SOURCE_OBSERVATION',/\b(observed|measured|recorded|witness|documentary|historical|census|previously|source bytes|actual .*occurred|withdrawn.*estimate)\b/i,'SOURCE'],
 ['THEORY_CLAIM',/\b(hypothes|conjecture|may |could |perhaps|possible|not entai[l]|does not imply|falsifiab|prediction)\b/i,'CLAIM'],
 ['PRODUCT_AFFORDANCE',/\b(ui|interface|visitor|navigation|render|animation|button|visual|scene|mobile|scroll|theme|workbench)\b/i,'MODEL']
];
// Curator-read examples: reversible interpretations, NOT authorization to execute or promote.
// The key is the historical record identity; no new registry object is minted.
export const CURATOR_EXEMPLARS=Object.freeze({
 'I-002':['RULE','Directory scanning is explicitly barred as an archive admission path.'],
 'I-003':['RULE','Digest/derivative binding is a finite provenance invariant.'],
 'I-010':['MODEL','Four arm identities describe a runner architecture, despite inherited kind=rewrite.'],
 'I-011':['RULE','Completion is conditional on required-arm settlement.'],
 'I-018':['EVIDENCE_BOUNDARY','Unknown adverse events are preserved as unknown, rather than evidence of absence.'],
 'I-040':['SOURCE','Native model-turn occurrence is a historical witness claim; underlying independent verification remains separate.'],
 'P-001':['ASSAY','Four-arm coverage is a study-design completeness criterion; child rule may test it.'],
 'P-002':['ASSAY','RCA-01 specifies a crossed experimental design, not a natural law.'],
 'X-002':['RESEARCH_PROGRAM','A reverse Atelier transfer is a protocol with multiple transitions.'],
 'X-018':['RULE','Directed citation lineage preservation is a conditional graph invariant.'],
 'AMB-01':['MODEL','Local section coordinates define a representation, not a universal truth scalar.'],
 'AMB-02':['EVIDENCE_BOUNDARY','Gluing disagreement does not warrant inferred intent or suppression.'],
 'AMB-05':['ASSAY','Aesthetic kernel parity and independent observer effects require separate comparison arms.'],
 'RGI-01b':['RULE','Unqualified rule generation remains held until closure/comparator verification.'],
 'RGI-01c':['MODEL','Branching and nonjoining outcomes form a multiway-state taxonomy.'],
 'INF-03':['MODEL','Four AIA views specify non-equivalent projections.'],
 'DRO-04':['MODEL','A signed clock difference is a defined measurement coordinate.'],
 'DRO-05':['RULE','A derivative lacking comparable clock domains is inadmissible.'],
 'BFE-03':['ASSAY','Route perturbation at constant testimony is a controlled experimental contrast.'],
 'BFE-07':['RULE','Consent and right-to-opacity constrain identity inference.'],
 'ENC-02':['SOURCE','The 1141/2131 census is a version-specific reported observation.'],
 'ENC-04':['ASSAY','Empty-Atelier claim requires an explicit zero-row witness procedure.'],
 'Q01-A01':['ASSAY','Blinded presentation contrasts preserve the kernel and measure observer response.'],
 'Q04-A06':['RULE','Participant rejection and opting out act as an authority boundary.'],
 'Q17-R02':['MODEL','Four signed clock coordinates form a temporal model.'],
 'Q18-R02':['ASSAY','Independent latent-state randomization is an experimental allocation.'],
 'Q21-R01':['EVIDENCE_BOUNDARY','Five same-episode surfaces must be jointly witnessed before Golden Egg credit.'],
 'Q23-R01':['ASSAY','Estimand, intervention, comparator and falsifier constitute the study protocol.'],
 'Q27-R02':['ASSAY','Animation and mobile parity are tested against deterministic fixtures.'],
 'Q30-R04':['EVIDENCE_BOUNDARY','Output divergence cannot alone warrant malicious agency inference.'],
 'AE-03':['RULE','Registered-source byte continuity is a provenance invariant.'],
 'AE-09':['MODEL','Optional diagnostic exposure is an interface affordance rather than a local rewrite law.'],
 'TC02':['ASSAY','Manipulating listener expectations separates testimony uptake from source status.'],
 'TC07':['ASSAY','Toy classical receivers are explicitly separated from quantum claims.'],
 'TC17':['MODEL','Absent, uncollected and inadmissible records are distinct observational states.'],
 'CBFE-RG-01':['MODEL','Typed incidence and temporally/standing-admissible paths describe distinct relation projections.'],
 'CBFE-RG-05':['RULE','Evidence availability bounds hearing and inference at a cutoff.'],
 'CBFE-RG-07':['EVIDENCE_BOUNDARY','No hearing does not entail evidence of falsehood.']
});
const allowed=new Set(['RULE','ASSAY','MODEL','SOURCE','CLAIM','THEOREM','EVIDENCE_BOUNDARY','RESEARCH_PROGRAM','RULEFIELD','UNRESOLVED']);
function candidate(row){
 const text=String(row.statement||'');
 const signals=signalDefs.filter(([name,re])=>re.test(text)).map(([name,re,role])=>({signal:name,role}));
 const found=[...new Set(signals.map(x=>x.role))];
 let primary='UNRESOLVED',basis='INSUFFICIENT_EXPLICIT_SEMANTICS',alternatives=[];
 const k=row.record?.kind||null,l=row.lane;
 if(l==='HISTORICAL_NKS'){
  if(k==='guard'||k==='invariant'){primary='RULE';basis='INHERITED_GUARD_OR_INVARIANT_METADATA';}
  else if(k==='rewrite'){primary='MODEL';basis='INHERITED_REWRITE_NEEDS_EXPLICIT_TRANSITION_REVIEW';alternatives=['RULE','RESEARCH_PROGRAM'];}
  else if(k==='observation'){primary='SOURCE';basis='INHERITED_OBSERVATION_REQUIRES_WITNESS_CHECK';}
  else if(k==='constraint'){primary=signals.some(s=>s.role==='ASSAY')?'ASSAY':'RULE';basis='INHERITED_DESIGN_CONSTRAINT_PROVISIONAL';alternatives=['ASSAY','RULE'];}
 }else if(l==='THINKER_CONDITION'){primary='ASSAY';basis='THINKER_INTERVENTION_DESIGN_NOT_THEOREM';alternatives=['RESEARCH_PROGRAM'];}
 else if(l==='CBFE_DD02'){primary=signals.some(s=>s.role==='RULE')?'RULE':'MODEL';basis='RELATIONAL_MODEL_OR_CONDITIONAL_GUARD';alternatives=['MODEL','ASSAY'];}
 else if(l==='OPERAHOUSE_MEMBRANE'){
  primary=k==='affordance'?'MODEL':k==='invariant'?'RULE':signals.some(s=>s.role==='ASSAY')?'ASSAY':'RULE';
  basis='OPERAHOUSE_DECLARED_MEMBRANE_ROLE';alternatives=['MODEL','RULE'];
 }else {
  if(found.includes('ASSAY'))primary='ASSAY';
  else if(found.includes('RULE'))primary='RULE';
  else if(found.includes('MODEL'))primary='MODEL';
  else if(found.includes('SOURCE'))primary='SOURCE';
  else if(found.includes('CLAIM'))primary='CLAIM';
  else primary='UNRESOLVED';
  alternatives=found.filter(x=>x!==primary);
  basis='STATEMENT_SEMANTIC_CUE_TRIAGE_UNVERIFIED';
 }
 const override=CURATOR_EXEMPLARS[row.id];
 const manual=!!override;
 if(manual){primary=override[0];basis='CURATOR_READ_SOURCE_STATEMENT';}
 alternatives=[...new Set([...alternatives,...found.filter(x=>x!==primary)])].filter(x=>allowed.has(x));
 return {id:row.id,lane:l,source_statement:text,source_title:row.title,
  inherited_kind:k,legacy_claim_state:row.claim_state||null,
  proposed_primary_role:primary,alternative_role_candidates:alternatives,
  inference_basis:basis,lexical_signals:signals.map(x=>x.signal),
  curator_note:manual?override[1]:null,
  review_status:manual?'CURATOR_INTERPRETED_PROPOSAL':'DETERMINISTIC_TRIAGE_REQUIRES_SEMANTIC_REVIEW',
  executable_rule_contract_verified:false,scientific_adjudication_complete:false,
  authority_transfer:false,source_reference:'registry:rules['+row.id+']',
  source_refs:Array.isArray(row.sources)?row.sources:[],claim_credit_added:0};
}
export function buildResidualTriage({registry=readRulefield(),audit=readTypeAssessment()}={}){
 const prior=new Set([...audit.promote_rule_records_to_field_or_assay.map(x=>x.rule_id),
  ...audit.protect_as_existing_rules.map(x=>x.rule_id)]);
 const remaining=registry.rules.filter(x=>!prior.has(x.id));
 if(registry.rules.length!==596||prior.size!==37||remaining.length!==559)fail('TRIAGE_SOURCE_SCOPE_DRIFT');
 const rows=remaining.map(candidate);
 const byRole={};const byLane={};for(const x of rows){byRole[x.proposed_primary_role]=(byRole[x.proposed_primary_role]||0)+1;byLane[x.lane]=(byLane[x.lane]||0)+1;}
 const sourceBytes=readFileSync(regURL,'utf8');
 const body={schema:'td613.rulefield.residual-triage/v1',status:'ALL_559_TRIAGED_NOT_SEMANTICALLY_ADJUDICATED',
  source_registry_sha256:hash(sourceBytes),source_prior_crosswalk:'TYPE_ASSESSMENT_ROD0002',
  reviewer_method:'STRUCTURED_INHERITED_ROLE_PLUS_DECLARED_LEXICAL_CUES_AND_CURATOR_EXEMPLARS',
  counts:{legacy:596,prior_audited:37,remaining:rows.length,curator_read:rows.filter(x=>x.curator_note).length,
   deterministic_only:rows.filter(x=>!x.curator_note).length,byRole,byLane},
  rows,authority:{canonical_mutation:false,source_identity_unchanged:true,od02:'HELD',
   protected_flight:'HELD',human_closure:'RESERVED',independent_empirical_credit:0,
   lexical_classification_is_scientific_adjudication:false}};
 return {...body,digest:hash(JSON.stringify(body))};
}
export function validateResidualTriage(t,{registry=readRulefield(),audit=readTypeAssessment()}={}){
 if(t?.schema!=='td613.rulefield.residual-triage/v1'||t.rows?.length!==559)return false;
 const {digest,...body}=t;if(hash(JSON.stringify(body))!==digest)return false;
 const excluded=new Set([...audit.promote_rule_records_to_field_or_assay.map(x=>x.rule_id),
  ...audit.protect_as_existing_rules.map(x=>x.rule_id)]);
 const ids=new Set(registry.rules.filter(x=>!excluded.has(x.id)).map(x=>x.id));
 return t.counts.prior_audited===37&&t.counts.curator_read===Object.keys(CURATOR_EXEMPLARS).length&&
  new Set(t.rows.map(x=>x.id)).size===559&&t.rows.every(x=>ids.has(x.id)&&allowed.has(x.proposed_primary_role)&&
  x.source_statement===registry.rules.find(r=>r.id===x.id).statement&&x.scientific_adjudication_complete===false&&
  x.claim_credit_added===0&&x.authority_transfer===false)&&
  t.authority.canonical_mutation===false&&t.authority.protected_flight==='HELD';
}
export function inspectResidual(id,triage=buildResidualTriage()){
 return triage.rows.find(x=>x.id===id)||null;
}
