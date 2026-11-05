"""Field/provenance integrity checks; scientific entailment stays human-governed."""
from collections import Counter
from .common import commitment,digest
FIELDS=('implemented_or_restored_capability','observed_native_execution','scientific_result','supported_claim_ceiling','evidence_required_for_promotion','falsifiers_and_negative_controls','remaining_human_authority_gate')
STATES={'SUPPORTED_BOUNDED_EXECUTION','SUPPORTED_BOUNDED_READBACK','SUPPORTED_BYTE_BINDING_LIMIT','CONDITIONAL_PROTOCOL_ONLY','INTERPRETIVE_LIMIT_ONLY','HISTORICAL_RESULT_ONLY','UNADJUDICATED'}
READBACK={'Relational topology':('SUPPORTED_BOUNDED_READBACK','SOURCE_BOUND_READBACK_WITH_GENERIC_CONTROL'),'Cartography':('SUPPORTED_BOUNDED_READBACK','SOURCE_BOUND_READBACK_ONLY'),'UNKNOWN / null / missing evidence':('SUPPORTED_BOUNDED_READBACK','SOURCE_BOUND_READBACK_ONLY'),'Snapshot / seal / witnesses':('SUPPORTED_BYTE_BINDING_LIMIT','SOURCE_BOUND_BINDING_CHECKS')}
def validate(v2,old,raw):
 if v2.get('schema')!='td613.scientific-qualification-register/v2' or v2.get('prior_register_sha256')!=digest(raw):raise ValueError('PRIOR_REGISTER_PIN_OR_SCHEMA')
 prior={(r['estate'],r['method_or_investigation_id']):r for r in old['records']};seen=set()
 if len(v2['records'])!=46 or len(prior)!=46:raise ValueError('EXACT_46_ROWS')
 for row in v2['records']:
  key=(row['estate'],row['method_or_investigation_id'])
  if key in seen or key not in prior:raise ValueError('RECORD_IDENTITY_LOSS')
  seen.add(key);p=prior[key]
  if row['prior_record_sha256']!=commitment(p) or row['estate_native_record']!=p['estate_native_record']:raise ValueError('NATIVE_RECORD_CHANGED')
  for field in FIELDS:
   x=row.get(field)
   if not isinstance(x,dict) or not x.get('evidence_refs') or any(r not in row['sources'] for r in x['evidence_refs']):raise ValueError('FIELD_PROVENANCE_REQUIRED')
  for ref in row['sources'].values():
   if len(ref['revision'])!=40 or len(ref['file_sha256'])!=64 or digest(ref['excerpt'].encode())!=ref['excerpt_sha256']:raise ValueError('SOURCE_PIN_OR_EXCERPT')
   if type(ref['line_start']) is not int or type(ref['line_end']) is not int or not 1<=ref['line_start']<=ref['line_end']:raise ValueError('SOURCE_LOCATOR')
  c=row['supported_claim_ceiling'];state=c['state'];text=c['text']
  if state not in STATES:raise ValueError('CEILING_STATE')
  if state=='UNADJUDICATED':
   if text is not None or not c.get('reason'):raise ValueError('UNADJUDICATED_NULL_REQUIRED')
  elif not isinstance(text,str) or not text.strip():raise ValueError('CEILING_TEXT_REQUIRED')
  if text and (any(text==row[f].get('text') for f in FIELDS if f!='supported_claim_ceiling') or text in [p.get('current_universal_atelier_support'),p.get('negative_controls_falsifiers_unresolved')]):raise ValueError('CROSS_FIELD_SUBSTITUTION')
  execution=row['observed_native_execution']
  if row['estate']=='SRC' and row['method_or_investigation_id'] in READBACK and (state,execution['state'])!=READBACK[row['method_or_investigation_id']]:raise ValueError('READBACK_OR_BINDING_PROMOTED_TO_EXECUTION')
  if state=='SUPPORTED_BOUNDED_EXECUTION' and execution['state'] not in ('ORIGINAL_PUBLIC_EXECUTED','NEW_SYNTHETIC_TRANSCRIPTION','SYNTHETIC_ONLY'):raise ValueError('UNSUPPORTED_EXECUTION_PROMOTION')
  if row['estate']=='EMSTD613' and execution.get('original_standalone_executors_recovered')!=0:raise ValueError('INVENTED_EM_EXECUTOR')
  if row.get('source_entailment_adjudication')!='HUMAN_REVIEW_REQUIRED' or row['remaining_human_authority_gate'].get('automatic_authorization') is not False:raise ValueError('AUTHORITY_WIDENING')
 if seen!=set(prior) or v2.get('automatic_authorization') is not False:raise ValueError('REGISTER_AUTHORITY_OR_IDENTITY')
 return {'rows':46,'ceiling_states':dict(Counter(r['supported_claim_ceiling']['state'] for r in v2['records'])),'integrity':'PASS','source_entailment':'HUMAN_REVIEW_REQUIRED','automatic_authorization':False}
