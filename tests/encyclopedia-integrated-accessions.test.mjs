import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base=new URL('../app/encyclopedia/',import.meta.url);
const read=async path=>readFile(new URL(path,base),'utf8');
const hash=x=>createHash('sha256').update(x).digest('hex');
test('Research accession shares original 843-record index without rewriting its bytes',async()=>{
 const manifest=JSON.parse(await read('reference/manifest.json'));
 const dir=JSON.parse(await read('reference/directory.json'));
 assert.equal(manifest.record_count,1141);
 assert.equal(dir.length,1141);
 assert.equal(manifest.canonical_payload_sha256,'ff0c98f564c9157f22b8603a20ddefa3ca13d843b17bdfb7e2a495408a49b4c9');
 const old=await Promise.all(dir.slice(0,843).map(r=>read(r.record_path).then(x=>x.replace(/\n$/,''))));
 assert.equal(hash(old.join('\n')),'f47d53b3de722f9cae36aa92450573aa806b6ce26143e048887ef122683e4e25');
 const ids=dir.map(r=>r.id);
 assert.equal(new Set(ids).size,ids.length);
 assert.equal(ids.filter(id=>id.startsWith('ASSESS-')).length,279);
 assert.equal(ids.filter(id=>id.startsWith('PROGRAM-')).length,16);
});
test('Ambiance and REST are ordinary indexed and mutually discoverable research records',async()=>{
 const manifest=JSON.parse(await read('reference/manifest.json'));
 const ids=Object.keys(manifest.facets.kind).flatMap(k=>Object.values(manifest.facets.kind[k]).flat());
 for(const id of ['R-DOME-AMBIANCE-20261023','R-DOLLHOUSE-REST-EXIT-20261023','R-ENCYCLOPEDIA-LAB-279-20261023','ASSESS-G-260','PROGRAM-P14'])
  assert.ok(ids.includes(id),'facet index missing '+id);
 const ambiance=JSON.parse(await read('reference/records/R-DOME-AMBIANCE-20261023.json'));
 const rest=JSON.parse(await read('reference/records/R-DOLLHOUSE-REST-EXIT-20261023.json'));
 assert.equal(ambiance.kind,'glossary');
 assert.equal(rest.kind,'evidence');
 assert.equal(ambiance.evidence_class,'DECLARED_STAGED_SOURCE_RECORD');
 assert.match(ambiance.record.body,/fold density/);
 assert.match(rest.claim_ceiling,/cancelled CI/i);
 const a=JSON.parse(await read('reference/terms/61.json'));
 assert.ok(a.ambiance.includes('R-DOME-AMBIANCE-20261023'));
 const g=JSON.parse(await read('reference/graph.json'));
 assert.ok(g.edges.some(e=>e.source==='ASSESS-G-260'&&e.target==='G-260'&&e.type==='assesses_record'));
});
test('Normal reader accessions have usable links, and the separate addendum view has retired',async()=>{
 const dir=JSON.parse(await read('reference/directory.json'));
 const ids=new Map(dir.map(x=>[x.id,x]));
 for(const id of ['R-DOME-AMBIANCE-20261023','ASSESS-G-260','PROGRAM-P14'])
  assert.equal(ids.get(id)?.html_anchor,'#record='+id);
 const html=await read('index.html');
 assert.ok(html.includes('TD613 unified research view adapter'));
 assert.ok(!html.includes('TD613_RESEARCH_ADDENDUM_20261023_BEGIN'));
 assert.ok(html.includes('id="td613-reference-records"'));
 const runtime=await readFile(new URL('../scripts/encyclopedia-reference-runtime.js',import.meta.url),'utf8');
 assert.match(runtime,/GLOSSARY_LIST\.push/);
 assert.match(runtime,/LABS_LIST\.push/);
 assert.match(runtime,/SEARCH_RECORDS\.push/);
});
