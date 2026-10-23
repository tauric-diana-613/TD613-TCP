// Additive, provenance-bounded research indexing. Does not mutate Edition 1.4 records.
export function buildResearchAccessionRecords({staged, addendum, originals}) {
 const sourceById=new Map(originals.map(record=>[record.id,record]));
 const proposals=new Set(addendum.coverage.all_candidate_ids_csv.split(','));
 if(proposals.size!==279)throw new Error('Research candidate ID count changed (expected 279)');
 const classes=[
  ['typed_formal_or_existing_implementation','TYPED_OR_SOURCE_IMPLEMENTATION_RECORDED'],
  ['research_protocol_ready_to_specify','PROTOCOL_READY_TO_SPECIFY'],
  ['empirical_or_model_claim_held','EMPIRICAL_OR_MODEL_CLAIM_HELD']
 ];
 const classById=new Map();
 for(const [key,value] of classes)for(const id of addendum.adoption[key]||[]){
  if(!proposals.has(id))throw new Error('Research classification references unknown ID '+id);
  if(classById.has(id))throw new Error('Conflicting research classification for '+id);
  classById.set(id,value);
 }
 if(staged.length!==3)throw new Error('Expected exactly three reviewed-for-indexing staged research notes');
 const records=[];
 for(const note of staged){
  if(!note||note.visibility!=='public'||note.schema!=='td613.research-intake/v1')
   throw new Error('Only schema-valid public research notes may be indexed');
  if(!note.record_id||!note.evidence?.claim_ceiling)
   throw new Error('Research note missing ID / claim ceiling');
  records.push({
   id:note.record_id,
   kind:note.kind==='concept'?'glossary':'evidence',
   label:note.title,
   family:note.family||'Research / source notes',
   status:note.evidence.disposition||'SOURCE_STAGED',
   evidence_class:'DECLARED_STAGED_SOURCE_RECORD',
   claim_ceiling:note.evidence.claim_ceiling,
   aliases:note.aliases||[],
   source_keys:[],
   origin:{json_pointer:null,accession_path:'intake/staged/'+note.record_id+'.json',human_review_status:'OPERATOR_DIRECT_PREPARATION; RESEARCH_CLAIM_NOT_INDEPENDENTLY_ADJUDICATED'},
   record:note, supplement:{accession_kind:'SOURCE_NOTE',source_locators:note.sources||[]},
   links:[]
  });
 }
 const ids=[...proposals].sort();
 for(const id of ids){
  const source=sourceById.get(id);
  if(!source)throw new Error('Research candidate missing from original index: '+id);
  const disposition=classById.get(id)||'ORIGINAL_SOURCE_STATUS_RETAINED';
  const held=disposition==='EMPIRICAL_OR_MODEL_CLAIM_HELD';
  const ceiling=held
    ? 'Proposal retained; external verification, real provider performance and empirical realization remain unearned.'
    : 'Source-bounded catalog classification only; finite mathematical examples do not establish general scientific or external empirical validity.';
  const label='Research assessment · '+source.label;
  records.push({
   id:'ASSESS-'+id,
   kind:'research_assessment',
   label,
   family:source.family||'Research assessment',
   status:disposition,
   evidence_class:'SECONDARY_SOURCE_BOUND_CATALOG_CLASSIFICATION',
   claim_ceiling:ceiling,
   aliases:[id,source.label],
   source_keys:[],
   origin:{json_pointer:null,research_receipt_path:'research/2026-10-23-proposal-and-rest-addendum.json',original_record_id:id},
   record:{
    title:label,
    source_record_id:id,
    original_source_status:source.status,
    disposition,
    description:'Indexed research classification of '+id+'. Original source record remains unchanged; follow the linked primary record for mathematical hypotheses, evidence class and qualifications.',
    qualification:ceiling,
    relations:[{type:'assesses_record',target:id},{type:'documented_by_accession',target:'R-ENCYCLOPEDIA-LAB-279-20261023'}]
   },
   supplement:{research_accession:'2026-10-23',provenance:'Laboratory selection, not independent experiment'},
   links:[]
  });
 }
 for(const programId of addendum.programs||[]){
  if(!/^P\d{2}$/.test(programId))throw new Error('Invalid bounded program identifier '+programId);
  records.push({
   id:'PROGRAM-'+programId,
   kind:'research_program',
   label:'Research program '+programId+' · laboratory catalog reference',
   family:'Research programs / conditional experiments',
   status:'PROGRAM_REFERENCE_ONLY',
   evidence_class:'CATALOG_LOCATOR_NOT_EXPERIMENT',
   claim_ceiling:'Program existence in operator-supplied lab catalog; no program execution, independent measurement or validation established by this record.',
   aliases:[programId],
   source_keys:[],
   origin:{json_pointer:null,research_receipt_path:'research/2026-10-23-proposal-and-rest-addendum.json'},
   record:{title:'Research program '+programId,description:'An individually identified program in the 16-program laboratory catalog. Full hypothesis, tests and falsifiers remain with the original operator-supplied laboratory artifact.',relations:[{type:'documented_by_accession',target:'R-ENCYCLOPEDIA-LAB-279-20261023'}]},
   supplement:null,links:[]
  });
 }
 return records;
}
