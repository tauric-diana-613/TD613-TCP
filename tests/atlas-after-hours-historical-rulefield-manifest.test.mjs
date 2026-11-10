import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=(path)=>readFileSync(new URL('../'+path,import.meta.url));
const historical=JSON.parse(read('RULEFIELD_HANDOFF_MANIFEST.json'));
const crosswalk=JSON.parse(read('packages/atlas-after-hours/HISTORICAL_RULEFIELD_MANIFEST_DISPOSITION.json'));
const sha256=(b)=>createHash('sha256').update(b).digest('hex');
const old=new Map(historical.files.map(e=>[e.path,e]));

test('historical Rulefield manifest is explicitly not a current-head certificate',()=>{
 assert.equal(crosswalk.historical_manifest_source_git_head,historical.source_exact_git_head);
 assert.equal(crosswalk.historical_manifest_pr,historical.research_pr);
 assert.equal(crosswalk.historical_snapshot_role,'INHERITED_OLDER_SNAPSHOT_REFERENCE_NOT_CURRENT_HEAD_CERTIFICATE');
 assert.equal(crosswalk.current_certificate,'ATLAS_AFTER_HOURS_HANDOFF_MANIFEST.json');
 assert.equal(crosswalk.scientific_closure,'RESERVED');
 assert.equal(crosswalk.protected_experiment_b,'HELD');
});
test('historical-vs-successor divergences are accounted for without rewriting historic receipt',()=>{
 const changed=[];
 for(const e of historical.files) if(sha256(read(e.path))!==e.sha256)changed.push(e.path);
 const listed=crosswalk.known_successor_divergences.map(x=>x.path).sort();
 assert.deepEqual(changed.sort(),listed,'Unexpected predecessor divergence requires a new explicitly reviewed crosswalk');
 assert.deepEqual(listed,['packages/rulefield/lab/README.md','packages/rulefield/lab/tool_registry.json']);
 for(const x of crosswalk.known_successor_divergences){
   assert.equal(old.get(x.path).sha256,x.historical_sha256);
   assert.equal(old.get(x.path).size_bytes,x.historical_size_bytes);
   const b=read(x.path);assert.equal(sha256(b),x.current_sha256);
   assert.equal(b.length,x.current_size_bytes);
 }
});
test('authoritative Argon IX commission matches the dossier and numbered shelf byte-for-byte',()=>{
 const source=read('packages/rulefield/rulefields/research/NINTH_ORDER_ARGON_COMMISSION_RESEARCH_ESTATE.md');
 assert.deepEqual(source,read('dossier/THE_CITY_THAT_ARRIVED_BEFORE_ITS_PEOPLE.md'));
 assert.deepEqual(source,read('packages/atlas-after-hours/commissions/ORDER-09_THE_CITY_THAT_ARRIVED_BEFORE_ITS_PEOPLE.md'));
 assert.equal(source.at(-1),10);
});
