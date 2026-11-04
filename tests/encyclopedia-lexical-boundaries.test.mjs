import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../scripts/encyclopedia-reference-runtime.js',import.meta.url),'utf8');
function makeReference(){
 const mk=(id,label,body,aliases=[])=>({id,kind:'concept',label,family:'synthetic',status:'TEST',
 evidence_class:'SYNTHETIC',claim_ceiling:'Source-free fixture only.',aliases,source_keys:[],
 origin:{json_pointer:null},record:{body},supplement:null,links:[]});
 const records=[
  mk('T-1','Observational notes','This analyst explores possible routes.'),
  mk('T-2','Explicit route','Explore: follow the admitted source.'),
  mk('T-3','Ordinary instruction','Explore the context without cue punctuation.'),
  mk('T-4','Scope history','Provenance-based evidence.'),
  mk('T-5','Conventional provenance','Provenance is a separately typed witness.'),
  mk('T-6','Route exclusion','The field reports explore and exploration together.'),
  mk('T-7','Unrelated','No route is present.',['Explorer'])
 ];
 const doc={
  'td613-reference-records':records.map(x=>JSON.stringify(x)).join('\n'),
  'td613-reference-directory':records.map((x,i)=>JSON.stringify({id:x.id,record_sha256:'TEST',html_line:i+1})).join('\n'),
  'td613-reference-manifest':JSON.stringify({schema:'td613.encyclopedia.reference/v1',canonical_payload_sha256:'TEST',edition_source_commit:'TEST',facets:{}}),
  'td613-reference-intake-schema':JSON.stringify({schema:'synthetic/v1'})
 };
 const context={document:{getElementById:id=>({textContent:doc[id]})},window:{TD613Intake:{}},setTimeout};
 vm.runInNewContext(source,context);
 return context.window.TD613Reference;
}
const ids=result=>result.hits.map(x=>x.id);

test('default whole-token matching rejects explores, explorer, and exploration',()=>{
 const ref=makeReference();
 assert.deepEqual(ids(ref.search('explore',{limit:30})).sort(),['T-2','T-3','T-6']);
 assert(!ids(ref.search('explore')).includes('T-1'));
 assert(!ids(ref.search('explore')).includes('T-7'));
});
test('explicit Explore: cue is distinguished from ordinary Explore and explores',()=>{
 const ref=makeReference();
 assert.deepEqual(ids(ref.search({q:'Explore:',limit:30})),['T-2']);
 assert(ids(ref.search({q:'Explore',limit:30})).includes('T-3'));
});
test('exact negatives, Unicode-token hyphens, and opting in to broad search',()=>{
 const ref=makeReference();
 assert.deepEqual(ids(ref.search('provenance')).sort(),['T-5']);
 assert(ids(ref.search({q:'provenance',termMode:'prefix'})).includes('T-4'));
 assert(ids(ref.search({q:'plore',termMode:'substring'})).includes('T-1'));
 assert(!ids(ref.search({q:'Explore',exclude:'possible'})).includes('T-1'));
 const original=ids(ref.search({q:'Explore',termMode:'prefix'}));
 assert(original.includes('T-1')&&original.includes('T-2'));
});
test('exclusion and title/alias reasons use the selected term mode',()=>{
 const ref=makeReference();
 assert(!ids(ref.search({q:'route',exclude:'explor',termMode:'prefix'})).includes('T-3'));
 const exact=ref.search({q:'Explorer'});
 assert(ids(exact).includes('T-7'));
 assert(exact.hits.find(x=>x.id==='T-7').why.includes('alias:explorer'));
 assert(!ids(ref.search({q:'explore',exclude:'explores'})).includes('T-1'));
});
test('quoted phrases remain phrase-based, invalid term modes fail closed',()=>{
 const ref=makeReference();
 assert.deepEqual(ids(ref.search({q:'"explores possible"'})),['T-1']);
 assert.deepEqual(ids(ref.search({q:'"Explore: follow"'})),['T-2']);
 assert.throws(()=>ref.search({q:'Explore',termMode:'fuzzy'}),/Invalid termMode/);
});
