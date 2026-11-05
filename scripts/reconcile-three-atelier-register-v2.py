#!/usr/bin/env python3
"""Additive field repair from frozen qualification/native evidence; no experiment."""
import json,re,subprocess,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from packages.experiment_a_preparation_v1.common import digest,commitment
from packages.experiment_a_preparation_v1.register import validate
ROOT=Path(__file__).resolve().parents[1];DOC=ROOT/'docs/research/2026-11-04'
OLD=DOC/'THREE_ATELIER_NATIVE_QUALIFICATION_MATRICES.json';OUT=DOC/'THREE_ATELIER_NATIVE_QUALIFICATION_REGISTER_V2.json'
QUAL={'SRC':('583c2b24a0680fcc1c3fba15dbace26dfe6c636e','docs/research/2026-11-04/src-native-qualification/SRC_NATIVE_SOURCEBOUND_QUALIFICATION_20261104.md'),'EMSTD613':('30630575ade616a5a47e4066b30d2159c2bd32be','docs/research/2026-11-04/em-native/EM_NATIVE_INHERITANCE_AND_CONTINUITY.md'),'WENDBINE':('6ec4d6ebac2025e47222166b8050c55a26c5268d','docs/research/2026-11-04/wendbine-native/WENDBINE_NATIVE_INHERITANCE_AND_CONTINUITY.md')}
SRC=[
'Grammar observations and candidate labels in the pinned 442-document census only; recipient routing and causal destinations remain unestablished.',
'Regeneration of 107 contextual-role assertions and 27 compiler passes only; independent empirical role discovery remains unestablished.',
'The witnessed exact-ID trace and explicit missing-hop behavior only; unrestricted semantic traversal and causal relations remain unestablished.',
'Recorded destination-withdrawal sensitivity only; the full platform-withdrawal protocol remains unexecuted.',
'Forward construction of 34 claim-dimension records only; evidence/authority deltas remain UNKNOWN, composites null, inverse/geometric tomography unestablished.',
'Exact 50-row relation readback and retained generic graph control only; full topological inference and empirical geometry remain unqualified.',
'Three map snapshots with incomplete-enumeration limits only; reconstruction and geometric measurement remain unestablished.',
'Recorded compiler/scope/time role strata and builder parity only; independent spatial inference remains unqualified.',
'Consumed-byte/seal binding and source-locator consistency only; witness entailment and independent external custody need separate evidence.',
'Typed readback preserving UNKNOWN, null and absence only; genuine recipient fidelity remains unexecuted.',None]
WEND=[
'Compilation of the declared 33-reference public registry into its bounded nine-family graph only; private state and intent remain unestablished.',
'Counts and exact source support sets for declared concepts and noncausal co-occurrence only; recurrence supplies no causal edge.',
'Retention of source-explicit correction/synthesis landmarks only; researcher interpretation and causal correction remain unvalidated.',
'The saved four-of-five placement adjudication only, preserving EchoCore failure and held controls; full controlled success remains unearned.',
'Fourteen historical naming/operator interpretations only; conventional terminology supplies no donor provenance or novelty.',
'Recovery of seven dated literature-sieve verdicts only; no fresh external-literature validation is supplied.',
'Recovery of six zero-promotion repair verdicts only; surviving questions receive no theorem or governance credit.',
'The new transcription reproduces the finite six-input, 24-permutation fixture only; five classes and canonical class size nine supply no external-pipeline identification.',
'Four recorded assurance-representation refinements for the September 11 corpus only; foreign compliance and three held extensions remain unestablished.',
'Deterministic lexical/concept-weighted metadata retrieval only; indexed-record count supplies neither full-body coverage nor causal semantic inference.',
'The preserved 25 observed = zero persisted + 25 failures reconciliation only; historical missing cards remain unrecovered.',
'Read-only operations in the recorded sealed public epoch only; manifestation edges supply neither nine-family inference nor verified private bodies.',
'Time-indexed capture/blob behavior in fictional pure-function controls only; live acquisition and genuine custody remain unestablished.',None]
CACHE={}
def raw(rev,path):
 key=(rev,path)
 if key not in CACHE:CACHE[key]=subprocess.check_output(['git','-C',str(ROOT),'show',rev+':'+path])
 return CACHE[key]
def citation(rev,path,needle=None,native=False):
 b=raw(rev,path);s=b.decode();lines=s.splitlines(keepends=True);start=0;end=min(25,len(lines))
 if native:
  m=re.search(r'^## (?:\d+\. )?(Claim ceiling|Interpretation ceilings|Promotion rule)\s*$',s,re.M|re.I)
  if m:
   start=s[:m.start()].count('\n');end=start+1
   while end<len(lines) and not lines[end].startswith('## '):end+=1
 elif needle:
  for n,line in enumerate(lines):
   if needle in line:start=n;end=min(n+3,len(lines));break
 excerpt=''.join(lines[start:end]);return {'revision':rev,'path':path,'file_sha256':digest(b),'line_start':start+1,'line_end':end,'excerpt':excerpt,'excerpt_sha256':digest(excerpt.encode())}
def build():
 oldraw=OLD.read_bytes();old=json.loads(oldraw);rows=[];counts={'SRC':0,'WENDBINE':0}
 for p in old['records']:
  estate=p['estate'];mid=p['method_or_investigation_id'];native=p['estate_native_record'];rev,path=QUAL[estate];refs={'qualification':citation(rev,path,mid)}
  if estate=='EMSTD613':
   refs['native']=citation(native['original_source_revision'],'packages/dome_world_exact/fixtures/a15-r0/EMSTD613/'+native['exact_witness'],native=True)
   excerpt=refs['native']['excerpt'];explicit=bool(re.match(r'^## (?:\d+\. )?(Claim ceiling|Interpretation ceilings|Promotion rule)',excerpt,re.I))
   state=('INTERPRETIVE_LIMIT_ONLY' if 'Interpretation ceilings' in excerpt.splitlines()[0] else 'CONDITIONAL_PROTOCOL_ONLY') if explicit else 'UNADJUDICATED'
   ceiling=(mid+': source-defined '+('clock/index interpretation limits only.' if state=='INTERPRETIVE_LIMIT_ONLY' else 'conditional local/candidate outcomes only after the specified witnesses and assay.')) if explicit else None
   execution={'state':'ORIGINAL_EXECUTOR_NOT_RECOVERED','original_standalone_executors_recovered':0,'text':'No authentic standalone execution of '+mid+' recovered or performed.'}
   scientific={'state':'NO_NEW_SCIENTIFIC_RESULT','text':mid+' remains a documentary instrument; readback establishes no newly observed scientific outcome.'}
  else:
   n=counts[estate];counts[estate]+=1;ceiling=(SRC if estate=='SRC' else WEND)[n]
   historic=estate=='WENDBINE' and n in (2,3,4,5,6,8)
   state='UNADJUDICATED' if ceiling is None else 'HISTORICAL_RESULT_ONLY' if historic else 'SUPPORTED_BOUNDED_EXECUTION'
   ex='HISTORICAL_RECORDED_ONLY' if historic else 'ORIGINAL_PUBLIC_EXECUTED'
   if ceiling is None:ex='PROPOSAL_OR_GENUINE_RUNTIME_UNEXECUTED'
   elif estate=='WENDBINE' and n==7:ex='NEW_SYNTHETIC_TRANSCRIPTION'
   elif estate=='WENDBINE' and n==12:ex='SYNTHETIC_ONLY'
   elif estate=='SRC' and n in (5,6,9):state='SUPPORTED_BOUNDED_READBACK';ex='SOURCE_BOUND_READBACK_WITH_GENERIC_CONTROL' if n==5 else 'SOURCE_BOUND_READBACK_ONLY'
   elif estate=='SRC' and n==8:state='SUPPORTED_BYTE_BINDING_LIMIT';ex='SOURCE_BOUND_BINDING_CHECKS'
   execution={'state':ex,'text':native['reproduction_or_differential_result']}
   scientific={'state':'HISTORICAL_RECORDED' if historic else 'UNESTABLISHED' if ceiling is None else 'BOUNDED_COMPUTATIONAL_OBSERVATION','text':'The qualified observation for '+mid+' is confined to its recorded input, epoch and evidence class.'}
   if estate=='WENDBINE':refs['native']=citation(native['original_source_revision'],'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/'+native['exact_witness'],native=True)
   elif native.get('verified_file_witnesses'):refs['native']=citation(native['original_source_revision'],'packages/dome_world_exact/fixtures/a15-r0/SRC/'+native['verified_file_witnesses'][0]['path'])
  def f(text,**kw):return {'text':text,'evidence_refs':list(refs),**kw}
  c=f(ceiling,state=state)
  if state=='UNADJUDICATED':c['reason']='No determinate achieved scientific ceiling established for '+mid+'; human adjudication remains required.'
  if estate=='EMSTD613' and state!='UNADJUDICATED':c['source_declared_conditional_or_interpretive_limit']=refs['native']['excerpt']
  scientific['recorded_native_observation']=native['reproduction_or_differential_result'];scientific['interpretation_status']='BOUNDED_HISTORICAL_OR_QUALIFICATION_OBSERVATION; HUMAN_ENTAILMENT_REVIEW_REQUIRED'
  execution['evidence_refs']=list(refs);scientific['evidence_refs']=list(refs)
  rows.append({'estate':estate,'method_or_investigation_id':mid,'prior_record_sha256':commitment(p),'estate_native_record':native,'sources':refs,
   'implemented_or_restored_capability':f(p['current_universal_atelier_support']),'observed_native_execution':execution,'scientific_result':scientific,'supported_claim_ceiling':c,
   'evidence_required_for_promotion':f('A promotion requirement has not been scientifically adjudicated for '+mid+'. Independently evaluate the retained native requirements and evidence before proposing a specific expanded claim.',classification='UNADJUDICATED_PROMOTION_REQUIREMENT',native_required_repair=native.get('required_repair'),native_continuity_requirement=native.get('v2_and_capsule_requirements')),
   'falsifiers_and_negative_controls':f(p['negative_controls_falsifiers_unresolved']),
   'remaining_human_authority_gate':f('Human admission, activation, interpretation and scientific closure remain reserved.',native_held_or_human_gated_state=native.get('held_or_human_gated_state'),automatic_authorization=False),'source_entailment_adjudication':'HUMAN_REVIEW_REQUIRED'})
 v={'schema':'td613.scientific-qualification-register/v2','correction_kind':'ADDITIVE_FIELD_INTEGRITY_REPAIR','prior_revision':'6ec4d6ebac2025e47222166b8050c55a26c5268d','prior_register_path':str(OLD.relative_to(ROOT)),'prior_register_sha256':digest(oldraw),'independent_review_id':5778948250,'records':rows,'automatic_authorization':False}
 validate(v,old,oldraw);return v
if __name__=='__main__':
 v=build();OUT.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');print(json.dumps(validate(v,json.loads(OLD.read_bytes()),OLD.read_bytes()),indent=2))
