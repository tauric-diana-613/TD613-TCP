import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {VIXEN_OPERA_HEADLINERS,canStageVixenFolio,classifyVixenFolio,auditVixenFolioCensus}
 from '../app/encyclopedia/vixen-estate/vixen-stage-subject-contract.mjs';
import {buildVixenLaboratories,completeVixenSourceCensus,assessVixenLab}
 from '../app/encyclopedia/vixen-estate/observatory-vixen-corpus.mjs';
import {computeVixenTheoryReceipt} from '../app/encyclopedia/vixen-estate/observatory-math-wardrobe.mjs';
const html=readFileSync(new URL('../app/encyclopedia/vix-cyb.html',import.meta.url),'utf8');
const source=html.match(/id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
assert.ok(source,'original archive preserved');
const corpus=JSON.parse(source[1]);
test('Historical TCC archive has its recorded census, without determining experimental N',()=>{
 const roles=auditVixenFolioCensus(corpus),census=completeVixenSourceCensus(corpus);
 assert.deepEqual([roles.programme,roles.ornaments,roles.technical,roles.performers_in_folio_registry],[8,1,14,0]);
 assert.deepEqual([census.opera_programme_folios,census.opera_title_ornaments,census.backstage_technical_folios],[8,1,14]);
 const labs=buildVixenLaboratories(corpus);assert.equal(labs.length,28);
 assert.equal(census.experimental_subject_count,null,'Archival record count must not set experimental N');
 assert.equal(census.experiment_count_from_folio_inventory,false);
 for(const lab of labs.filter(l=>l.folio_id.startsWith('RC-')&&l.kind==='CANONICAL_FORMULA_SIMULATION')){
  assert.equal(lab.stage_role,'OPERAHOUSE');assert.equal(lab.performer,false);
  assert.equal(canStageVixenFolio(lab),false);
  assert.equal(assessVixenLab(corpus,lab.id).corpus_coordinates.stage_role,'OPERAHOUSE');
 }
});
test('Only Vixen programme models headline the Opera stage; RC maths remain callable offstage',()=>{
 const labs=buildVixenLaboratories(corpus);
 assert.equal(VIXEN_OPERA_HEADLINERS.length,6);
 for(const id of VIXEN_OPERA_HEADLINERS)
  assert.equal(canStageVixenFolio(labs.find(x=>x.id==='LAB_'+id)),true);
 const foundry=readFileSync(new URL('../app/encyclopedia/vixen-estate/observatory-electric-foundry.mjs',import.meta.url),'utf8');
 assert.match(foundry,/Six source-linked Vixen inquiry models/);
 assert.doesNotMatch(foundry,/Six individually choreographed instruments from Em’s original mathematical folios/);
 assert.match(foundry,/!canStageVixenFolio\(byId\.get\(id\)\)/);
 assert.match(foundry,/SOURCE_MODEL_PREVIEW/);
 assert.doesNotMatch(foundry,/EXPERIMENTAL_VIEW/);
 assert.doesNotMatch(foundry,/\['COUTURE','RC · 14'\]/);
 assert.doesNotMatch(foundry,/Stage 39-Skin Loom/);
 assert.doesNotMatch(foundry,/ORIGINAL VIXEN CORPUS/);
 const tcc8=labs.find(x=>x.id==='LAB_TCC-08');
 assert.equal(tcc8.stage_subject_kind,'RESEARCH_PROGRAMME');
 assert.equal(tcc8.source_ornament,true,'Source title-locus status remains recorded');
 assert.equal(canStageVixenFolio(tcc8),true,'Every TCC folio, including the eighth, has a genuine optical model');
 assert.equal(classifyVixenFolio(corpus.formula_folios.find(x=>x.id==='TCC-08')).scientific_claim_authority,false);
 assert.equal(canStageVixenFolio(labs.find(x=>x.id==='LAB_TCC-02')),true);
 assert.equal(canStageVixenFolio(labs.find(x=>x.id==='LAB_TRACK-A')),true);
 assert.equal(canStageVixenFolio(labs.find(x=>x.id==='LAB_TRACK-D')),true,
  'Borrowed optical method retains its technical role without becoming a Performer');
 const valid=labs.find(x=>x.id==='LAB_TCC-01');
 for(const forged of [
  {...valid,stage_subject_kind:'TITLE_ORNAMENT'},
  {...valid,folio_id:'TCC-08',id:'LAB_TCC-08'},
  {...valid,optic_program:'TOROID'},
  {...valid,id:'LAB_RC-07'},
  {...valid,performer:true},
  {...valid,stage_role:'OPERAHOUSE'},
  {...valid,source_estate:'TD613_OPERAHOUSE'}
 ]) assert.equal(canStageVixenFolio(forged),false,'Forged source/role attribution must fail closed');
});
test('Tampered or duplicated role coordinates are refused',()=>{
 const bad=structuredClone(corpus);bad.formula_folios[0].id='RC-07';
 assert.throws(()=>auditVixenFolioCensus(bad),/VIXEN_STAGE_SUBJECT_UNDECLARED/);
 const duplicate=structuredClone(corpus);duplicate.formula_folios[1].id=duplicate.formula_folios[0].id;
 assert.throws(()=>auditVixenFolioCensus(duplicate),/VIXEN_DUPLICATE_STAGE_SUBJECT/);
});
test('Historical TCC-08 diagnostics remain original source semantics without experimental admission',()=>{
 const x=computeVixenTheoryReceipt(corpus,'TCC-01');
 const y=computeVixenTheoryReceipt(corpus,'TCC-05');
 assert.notEqual(x.synthesis.question,y.synthesis.question);
 assert.equal(x.synthesis.conditioning_folio,'TCC-01');
 assert.equal(y.synthesis.conditioning_folio,'TCC-05');
 const ornament=computeVixenTheoryReceipt(corpus,'TCC-08');
 assert.ok(ornament.synthesis.candidate_count>=1,'Eighth must participate in ranked exploration');
 assert.equal(ornament.synthesis.state,'UNRATIFIED_SOURCE_CONDITIONED_CANDIDATE_RANKING');
 assert.equal(ornament.folio_kind,'RESEARCH_PROGRAMME');
 assert.equal(ornament.source_title_locus_ornament,true);
 assert.equal(ornament.foundry.lab_id,'LAB_TCC-08');
 assert.equal(ornament.foundry.model,'TOROID');
 assert.ok(ornament.foundry.metrics.some(x=>x.name==='signature'&&x.unit==='AUTHORIAL_BRANDING_ONLY'));
 assert.ok(ornament.foundry.metrics.some(x=>x.name==='arithmetic_or_empirical_operator'&&x.value===null&&x.unit==='NO_THEOREM'),
  'Original TCC-08 historical metric semantics must be retained, not invented');
 assert.equal(ornament.authority.empirical_credit,0);
 assert.match(ornament.synthesis.question,/Vixen Signature Emblem/);
 assert.throws(()=>computeVixenTheoryReceipt(corpus,'RC-07'),/TECHNICAL_METHOD_NOT_VIXEN_PERFORMER/);
});

test('AI guide cannot reimport archived RC optics as Opera headline works',()=>{
 const guide=readFileSync(new URL('../app/encyclopedia/vix-cyb/llms.txt',import.meta.url),'utf8');
 assert.match(guide,/8.*OPERA folio explorations/);
 assert.match(guide,/14.*OPERAHOUSE technical\/optical records/);
 assert.match(guide,/TCC-06.*TCC-03.*TCC-07/);
 assert.match(guide,/RC-03.*RC-07.*RC-10.*no right to headline/i);
 assert.match(guide,/LAB_RC-##/);
 assert.match(guide,/TCC-08.*authorial title-locus notation/);
 assert.match(guide,/bounded computational connection/);
 assert.doesNotMatch(guide,/dial cabinet for `TCC-01`, `TCC-04`, `TCC-05`, `RC-03`, `RC-07`, `RC-10`/);
});
