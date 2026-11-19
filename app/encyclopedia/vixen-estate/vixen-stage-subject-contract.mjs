/** OPERAHOUSE ≠ OPERA ≠ PERFORMER: no formula archive is a primary authored Work. */
export const VIXEN_STAGE_SUBJECT_SCHEMA='emstd613.vixen.stage-subjects/v1';
export const VIXEN_OPERA_HEADLINERS=Object.freeze(['TCC-01','TCC-04','TCC-05','TCC-06','TCC-03','TCC-07']);
export function classifyVixenFolio(folio){
 const id=String(folio?.id||'');
 if(folio?.group==='unified'&&/^TCC-0[1-8]$/.test(id))
  return Object.freeze({id,stage_role:'OPERA',kind:'RESEARCH_PROGRAMME',source_ornament:id==='TCC-08',
   performer:false,primary_work:false,authorship_claim:'UNADJUDICATED',scientific_claim_authority:false,technical_instrument:false});
 if(folio?.group==='couture'&&/^RC-(?:0[1-9]|1[0-4])$/.test(id))
  return Object.freeze({id,stage_role:'OPERAHOUSE',kind:'ARCHIVAL_TECHNICAL_INSTRUMENT',
   performer:false,primary_work:false,authorship_claim:'UNADJUDICATED',scientific_claim_authority:false,technical_instrument:true});
 throw new TypeError('VIXEN_STAGE_SUBJECT_UNDECLARED:'+id);
}
export function auditVixenFolioCensus(corpus){
 const folios=corpus?.formula_folios;
 if(!Array.isArray(folios)||folios.length!==22)throw new TypeError('VIXEN_STAGE_FOLIO_CENSUS_HELD');
 const seen=new Set();let programme=0,ornaments=0,technical=0;
 for(const folio of folios){
  const role=classifyVixenFolio(folio);
  if(seen.has(role.id))throw new TypeError('VIXEN_DUPLICATE_STAGE_SUBJECT:'+role.id);
  seen.add(role.id);
  if(role.kind==='RESEARCH_PROGRAMME'){programme++;if(role.source_ornament)ornaments++;}else technical++;
 }
 if(programme!==8||ornaments!==1||technical!==14)throw new TypeError('VIXEN_STAGE_ROLE_CENSUS_HELD');
 return Object.freeze({schema:VIXEN_STAGE_SUBJECT_SCHEMA,programme,ornaments,technical,
  historical_records:folios.length,performers_in_folio_registry:0});
}
export function canStageVixenFolio(lab){
 // Stage eligibility is a positive authorization, never a negative technical-ID filter.
 // Title-locus notation limits theorem claims, not access to one of the eight folio experiments.
 if(!lab||lab.stage_role!=='OPERA'||lab.primary_work!==false||
    lab.performer!==false||lab.scientific_claim_authority!==false)return false;
 if(lab.kind==='PROSPECTIVE_GIVEBACK_SIMULATION')
  return lab.stage_subject_kind==='PROSPECTIVE_GIVEBACK' &&
   /^LAB_TRACK-[A-F]$/.test(lab.id) && lab.source_estate==='EMSTD613';
 return lab.kind==='CANONICAL_FORMULA_SIMULATION' &&
  lab.stage_subject_kind==='RESEARCH_PROGRAMME' &&
  /^TCC-0[1-8]$/.test(lab.folio_id) && lab.id==='LAB_'+lab.folio_id &&
  lab.source_estate==='EMSTD613';
}
