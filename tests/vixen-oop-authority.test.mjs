import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildOriginalWorkMathWardrobe,buildSyntheticWorkMathWardrobe,scoreOriginalWorkMath} from '../app/encyclopedia/vixen-estate/observatory-work-mathematics.mjs';
import {loadExperimentAShard,computeSha256HexAsync} from '../app/encyclopedia/vixen-estate/corpus-experiment-a.mjs';
import {classifyIndependentEncounter,constructCrossAtelierWitness} from '../app/encyclopedia/reference/vixen-operator-encounter.mjs';
import {sourceWitness} from './fixtures/vixen/source-witness.mjs';
const html=readFileSync('app/encyclopedia/vix-cyb.html','utf8');
const corpus=JSON.parse(html.match(/id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
const work=corpus.works.find(w=>w.linked_sources.some(s=>s.source_file_id==='emsrc_31ed6fb3bdc15d3c29b8ae13'));
const source=work.linked_sources[0];
for(const [name,alter] of [
 ['withdrawn human identity gate',w=>w.human_gate_required=!w.human_gate_required],
 ['false title',w=>w.display_title='Counterfeit'],
 ['substituted Work',w=>w.work_id='emwork_'+'0'.repeat(24)],
 ['false original digest',w=>w.linked_sources[0].sha256='a'.repeat(64)],
 ['metadata companion as Work',w=>w.linked_sources[0].source_file_id='metadata_companion']
])test(name+' cannot issue canonical mathematics',async()=>{
 const w=structuredClone(work);alter(w);
 await assert.rejects(buildOriginalWorkMathWardrobe({works:[w]}),/PERFORMER_SOURCE_COORDINATE_DRIFT/);
});
test('a self-hashed synthetic reader remains usable without production authority',async()=>{
 const text_body='$$x+y=z$$',derivative_sha256=await computeSha256HexAsync(text_body);
 const options={readSource:async id=>({source_file_id:id,work_id:work.work_id,text_body,derivative_sha256,body_sha256_verified:true,readable:true})};
 const fake=await buildOriginalWorkMathWardrobe({works:[work]},options);assert.equal(fake.entries.length,0);
 const synthetic=await buildSyntheticWorkMathWardrobe({works:[work]},options);assert.equal(synthetic.entries.length,1);
 assert.equal(synthetic.source_register,'SYNTHETIC_TEST_MATERIAL');
 assert.throws(()=>scoreOriginalWorkMath(corpus,synthetic.entries[0]),/UNVERIFIED_OR_FOREIGN/);
});
test('verified derivative cache resists mutation beneath its canonical seal',async()=>{
 const shard=await loadExperimentAShard(1),record=Object.values(shard.sources)[0];
 assert.throws(()=>{record.text_body='$$fake=truth$$';},TypeError);
});
test('genuine byte replay remains unlinked; cloned, forged and stale witnesses cannot ratify',async()=>{
 const witness=await sourceWitness();
 const forged={eligible:true,record_id:witness.id,human_ratification_ref:'caller',warrant_sha256:'a'.repeat(64)};
 const observation=classifyIndependentEncounter({work,source,witness,warrant:forged});
 assert.equal(observation.state,'WITNESSED_UNLINKED_PAIR');
 for(const w of [{...witness},structuredClone(witness),{...witness,record:{...witness.record,id:'G-999'}}]){
  const r=constructCrossAtelierWitness({work,source,witness:w,warrant:forged});
  assert.equal(r.disposition,'HELD_INDEPENDENT_REFERENCE_WITNESS');
  assert.equal(r.admissibility.human_ratified_crosswalk,false);assert.equal(r.admissibility.publication_eligible,false);
 }
 assert.equal(constructCrossAtelierWitness({work,source,witness,warrant:forged}).admissibility.human_ratified_crosswalk,false);
 const altered=structuredClone(work);altered.display_title='Fake identity';
 assert.equal(classifyIndependentEncounter({work:altered,source,witness,warrant:forged}).state,'HELD_VIXEN_SOURCE_IDENTITY');
 assert.throws(()=>{witness.record.id='G-999';},TypeError);
});
