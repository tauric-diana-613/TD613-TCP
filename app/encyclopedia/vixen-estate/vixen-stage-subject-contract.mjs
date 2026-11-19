/** OPERAHOUSE ≠ OPERA ≠ PERFORMER: no formula archive is a primary authored Work. */
export const VIXEN_STAGE_SUBJECT_SCHEMA='emstd613.vixen.stage-subjects/v1';
export const VIXEN_OPERA_HEADLINERS=Object.freeze(['TCC-01','TCC-04','TCC-05','TCC-06','TCC-03','TCC-07']);
export function classifyVixenFolio(folio){
 const id=String(folio?.id||'');
 if(folio?.group==='unified'&&/^TCC-0[1-8]$/.test(id))
  return Object.freeze({id,stage_role:'OPERA',kind:id==='TCC-08'?'TITLE_ORNAMENT':'RESEARCH_PROGRAMME',
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
  if(role.kind==='RESEARCH_PROGRAMME')programme++;else if(role.kind==='TITLE_ORNAMENT')ornaments++;else technical++;
 }
 if(programme!==7||ornaments!==1||technical!==14)throw new TypeError('VIXEN_STAGE_ROLE_CENSUS_HELD');
 return Object.freeze({schema:VIXEN_STAGE_SUBJECT_SCHEMA,programme,ornaments,technical,
  historical_records:folios.length,performers_in_folio_registry:0});
}
export function canStageVixenFolio(lab){
 if(!lab||lab.stage_role!=='OPERA')return false;
 if(lab.kind==='PROSPECTIVE_GIVEBACK_SIMULATION')return lab.stage_subject_kind==='PROSPECTIVE_GIVEBACK';
 return lab.kind==='CANONICAL_FORMULA_SIMULATION'&&/^TCC-0[1-8]$/.test(lab.folio_id)
  && lab.stage_subject_kind!=='ARCHIVAL_TECHNICAL_INSTRUMENT';
}
