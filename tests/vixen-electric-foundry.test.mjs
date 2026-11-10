import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {CARRIERS,LABS,fieldAt,sceneProbe,project111,
 singularValues2,fiveClockTicks} from '../app/encyclopedia/vixen-estate/observatory-foundry-kernel.mjs';
import {buildVixenLaboratories,assessVixenLab,completeVixenSourceCensus,
 VIXEN_SOURCE_ESTATES} from '../app/encyclopedia/vixen-estate/observatory-vixen-corpus.mjs';
import {RENDERER_CONTRACT} from '../app/encyclopedia/vixen-estate/observatory-foundry-renderer.mjs';
import {SCORE_CONTRACT} from '../app/encyclopedia/vixen-estate/observatory-computational-score.mjs';
import {ELECTRIC_STAGE_SCHEMA} from '../app/encyclopedia/vixen-estate/observatory-electric-foundry.mjs';
const html=await readFile(new URL('../app/encyclopedia/vix-cyb.html',import.meta.url),'utf8');
const match=html.match(/id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
assert(match,'Original Vixen corpus omitted');
const corpus=JSON.parse(match[1]);
test('All mathematical SUBJECTS are Vixen historical folios and giveback tracks; borrowed engines never become performers',()=>{
 const entries=buildVixenLaboratories(corpus),c=completeVixenSourceCensus(corpus);
 assert.equal(entries.length,28,'28 references, not 28 equally qualified visual performances');
 assert.deepEqual([c.source_formula_labs,c.source_track_labs,c.source_work_count,
  c.source_original_record_count,c.source_instruments,c.source_human_gates,
  c.optical_strata],[22,6,32,53,21,8,39]);
 assert.equal(c.foreign_opera_as_performer_count,0);
 assert.equal(VIXEN_SOURCE_ESTATES.cross_estate_promotion,false);
 assert.equal(VIXEN_SOURCE_ESTATES.performer,'EMSTD613_ORIGINAL_WORK_MANIFESTATION_ONLY');
 const folios=new Map(corpus.formula_folios.map(f=>[f.id,f]));
 const tracks=new Map(corpus.giveback_tracks.map(t=>[t.id,t]));
 for(const e of entries){
  assert.equal(e.source_estate,'EMSTD613');
  assert.equal(e.empirical_credit,0);
  if(e.kind==='CANONICAL_FORMULA_SIMULATION'){
   const f=folios.get(e.folio_id);assert(f,e.id);
   assert.equal(e.formula,f.fallback,'No shader-authored replacement theorem');
   assert.equal(e.status,f.status);
  }else{
   assert(tracks.has(e.id.slice(4)));
   assert.match(e.ceiling,/NOT_EXECUTED/);
  }
 }
});
test('Six individually directed source-native headliners: executed mathematical probes, not lab-count inflation',()=>{
 const ids=['LAB_TCC-01','LAB_TCC-04','LAB_TCC-05','LAB_RC-03','LAB_RC-07','LAB_RC-10'];
 const results=ids.map(id=>assessVixenLab(corpus,id,{gain:.72,witness:.7,voltage:.88,twist:.53},
  {x:.12,y:-.28}));
 assert.equal(results.length,6);
 for(let i=0;i<results.length;i++){
  const r=results[i];
  assert.equal(r.schema,'emstd613.vixen.corpus-referenced-observatory/v1');
  assert.equal(r.corpus_coordinates.lab_id,ids[i]);
  assert(r.metrics.length>0);
  assert(Number.isFinite(r.visual_scalar));
  assert.equal(r.authority.empirical_replication_credit,0);
  assert.equal(r.authority.experiment_b_flight,'HELD');
  assert.equal(r.optical_engine.borrowed_from,'DOME_ART_LOOM_APERTURE_COUTURE_TOOLING_ONLY');
 }
 const pres=results[0].metrics;
 assert(pres.some(x=>x.name==='semantic_alignment_entails_witness'&&x.value===false));
 const clocks=results[1].metrics.find(x=>x.name==='five_distinct_clocks').value;
 assert.equal(clocks.length,5);
 const alg=results[2].metrics;
 assert(alg.some(x=>x.name==='raw_preempts_0_65'));
 const nullspace=results[3].metrics;
 assert(nullspace.some(x=>x.name==='unique_inverse'&&x.value===false));
 const rank=results[4].metrics.find(x=>x.name==='singular_values').value;
 assert.equal(typeof rank.rank,'number');
 const xor=results[5].metrics;
 assert(xor.some(x=>x.name==='pairwise_I_X_Z'&&x.value===0));
 assert(xor.some(x=>x.name==='joint_I_XY_Z'&&x.value===1));
});
test('Actual model output responds to controls and independent probe position',()=>{
 for(const optic of ['CONTROL_PLANES','FIVE_CLOCKS','ALGEDONIC','COUTURE_111',
 'APERTURE_SVD','FOURIER','D3_MOIRE','PHI_QUASI','FOLD_SEAM',
 'GRADIENT_CAUSTIC','LOOM_39','HOLONOMY','GATE_256','TOROID','TWIN_WORLD','WITNESS_EXT']){
  assert(Number.isFinite(fieldAt(optic,.15,-.2,{gain:.7,voltage:.8,twist:.55,time:1})),optic);
 }
 const c=assessVixenLab(corpus,'LAB_TCC-05',{gain:.05,witness:.8,voltage:.82,twist:.3},{x:.11,y:.2});
 const d=assessVixenLab(corpus,'LAB_TCC-05',{gain:.94,witness:.8,voltage:.82,twist:.3},{x:.11,y:.2});
 assert.notDeepEqual(c.metrics,d.metrics,'Algedonic differential assay must respond to gain');
 const a=assessVixenLab(corpus,'LAB_RC-07',{gain:.1,witness:.8,voltage:.9,twist:.2},{x:.3,y:0});
 const b=assessVixenLab(corpus,'LAB_RC-07',{gain:.9,witness:.8,voltage:.9,twist:.7},{x:.3,y:0});
 assert.notDeepEqual(a.metrics,b.metrics,'Aperture singular-value assay must respond to controls');
 const x=sceneProbe('FIVE_CLOCKS',{gain:.7,time:0},{x:0,y:0});
 const y=sceneProbe('FIVE_CLOCKS',{gain:.7,time:0},{x:.55,y:.43});
 assert.notEqual(x.diagnostic.field_value,y.diagnostic.field_value);
});
test('Aperture/Couture formal computation is auditable, with rank-deficient countermodel and true nullspace',()=>{
 assert.equal(singularValues2([[1,1],[.2,.2]]).rank,1);
 assert.equal(singularValues2([[1,0],[0,1]]).rank,2);
 assert.equal(project111([1,1,1]).projection_orthogonal_to_111,true);
 assert.equal(project111([1,1,1]).nullspace_energy,3);
 assert.equal(fiveClockTicks(70).length,5);
 assert.deepEqual([CARRIERS.filter(x=>x.near).length,CARRIERS.filter(x=>x.mid).length,
  CARRIERS.filter(x=>x.far).length],[6,13,20]);
});
test('The optical shader and exact host clock are coded—not merely described in a design receipt',async()=>{
 const shader=await readFile(new URL('../app/encyclopedia/vixen-estate/observatory-foundry.frag',import.meta.url),'utf8');
 assert(shader.startsWith('#version 300 es'));
 assert(shader.includes('uniform int u_optic'));
 assert(shader.includes('for(int i=0;i<39;i++)'));
 assert(shader.includes('float arc=arcSwitch*arcRibbon'));
 assert(shader.includes('out vec4 color'));
 assert(shader.includes('u_model.z'));
 assert.equal(RENDERER_CONTRACT.clock,'ONE_HOST_RAF_NO_CHILD_CLOCK');
 assert.equal(RENDERER_CONTRACT.declared_carriers,39);
 assert.equal(RENDERER_CONTRACT.source_estate,'EMSTD613');
 assert.equal(ELECTRIC_STAGE_SCHEMA,'emstd613.vixen.electric-foundry-stage/v1');
 assert(html.includes('id="vixenElectricFoundry"'));
 assert(html.includes('observatory-electric-foundry.mjs'));
 assert(html.includes('data-obs-tab="planes"'),'legacy scientific contract retained for predecessor audit');
 assert(!html.includes('Eclipse–Omega'),'Foreign Opera prohibited');
 assert.equal(LABS.length,16,'16 optical programs are ENGINE tools, not authored Vixen labs');
});
test('Tampered human gate or foreign folio identifier cannot inflate research status',()=>{
 const bad=structuredClone(corpus);
 bad.human_gates[0].default_state='ADJUDICATED_BY_RENDERER';
 assert.throws(()=>buildVixenLaboratories(bad),/VIXEN_HUMAN_GATE_INTEGRITY/);
 assert.throws(()=>assessVixenLab(corpus,'LAB_APERTURE_FOREIGN'),/UNKNOWN_VIXEN_LAB/);
});


test('Glinda chromepunk lineage anchors the scene without banning deliberate spectral departures',async()=>{
 const original=html.match(/<style id="manifest-instance-theme">([\s\S]*?)<\/style>/);
 assert(original,'Historical Vixen authored color surface missing');
 for(const [name,hex] of [
  ['--vixen-pink','#FF91AF'],['--arc-flash','#F9F36D'],
  ['--graphite','#24282A'],['--nickel','#667078'],
  ['--porcelain','#F6F4F0']
 ])assert(original[1].includes(name+':'+hex),'Historical theme '+name);
 const css=await readFile(new URL('../app/encyclopedia/vixen-estate/observatory-electric-foundry.css',import.meta.url),'utf8');
 const shader=await readFile(new URL('../app/encyclopedia/vixen-estate/observatory-foundry.frag',import.meta.url),'utf8');
 const fallback=await readFile(new URL('../app/encyclopedia/vixen-estate/observatory-foundry-renderer.mjs',import.meta.url),'utf8');
 const score=await readFile(new URL('../app/encyclopedia/vixen-estate/observatory-computational-score.mjs',import.meta.url),'utf8');
 const liveCouture=await readFile(new URL('../app/encyclopedia/vixen-estate/glinda-cybergoth-rgi10.css',import.meta.url),'utf8');
 assert(liveCouture.includes('--arc-flash:#FFF2A9'),
  'RGI10 active body palette must override archival yellow without mutating its historical declaration');
 for(const token of ['--ef-pink:#FF91AF','--ef-arc:#FFF2A9',
   '--ef-graphite:#24282A','--ef-nickel:#667078','--ef-porcelain:#F6F4F0']){
  assert(css.includes(token),'Absent original structural token or revised active foil '+token);
 }
 assert(shader.includes('vec3 arcFlash=vec3(1.,.9490,.6627)'),
  'WebGL must use the revised lilac-foil optical palette while preserving voltage calculation');
 assert(shader.includes('vec3 glinda=vec3(1.,.5686,.6863)'),
  'Shader must retain the historic pink Glinda refraction');
 assert(shader.includes('float arcSwitch=smoothstep(.26,.86,u_model.z)'),
  'Arc Flash must be governed by active simulation voltage');
 assert(shader.includes('vec3 bright=vec3(1.,.9490,.6627)'),
  'Lilac electrical discharge must remain a computed event');
 assert(fallback.includes('const discharge=narrow(Math.abs(Math.sin('),
  'CPU fallback must calculate its own voltage-bound caustic');
 assert(fallback.includes('const opal=narrow('),
  'An intentional, bounded spectral excursion may exist');
 assert(fallback.includes('arc:[255,242,169]'),
  'Canvas2D fallback must match the computed lilac-foil family');
 assert(score.includes("arc:'#FFF2A9'"),
  'The mathematical score must retain the new chromatic register');
 assert(score.includes('LAB_RC-10')&&score.includes('LAB_TCC-05'),
  'Optical composition must have differentiated source-native lab geometry');
 assert(score.includes('fiveClockTicks(')&&score.includes('project111(')&&score.includes('singularValues2('),
  'Score must use actual mathematical instruments, not only canvas styling');
 assert(css.includes('#vixenElectricFoundry .ef-notation'),
  'One host-timed computed score must be composited on top of the optics');
 // Chromatic experimentation is allowed. Inherited colors are anchors,
 // rather than an absolute prohibition on blue/cyan, ultraviolet or opal.
});

test('The computed source geometry lives in the same host-owned clock, not twenty-eight superficial loops',()=>{
 assert.equal(SCORE_CONTRACT.subject,'EMSTD613_CANONICAL_FORMULA');
 assert.equal(SCORE_CONTRACT.timebase,'HOST_FOUNDRY_FRAME');
 assert.equal(SCORE_CONTRACT.observed_physical_results,false);
 const code=html;
 assert(code.includes('observatory-electric-foundry.mjs'));
 assert(!code.includes('Eclipse–Omega'));
});
