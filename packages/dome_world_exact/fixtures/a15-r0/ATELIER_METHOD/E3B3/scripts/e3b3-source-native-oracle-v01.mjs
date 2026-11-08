// 𝌋 E3-B.3 independent SOURCE_NATIVE reference lane. This module never calls the E3-B.3 recipient dispatcher.
// It imports the same pinned original research libraries by design; the new receiver is native-LIBRARY integration.
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import vm from 'node:vm';
import crypto,{createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';
const blob=b=>createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
const pins={
 'encyclopedia-reference-runtime.js':'fbad686706139be6f4cb1bb8e021a55fe65f381e',
 'wendbine-query.mjs':'1900a395238f7e6dbc8d2a6b17b28b4726a7de11',
 'wendbine-compile.mjs':'a625df5c76f7e3295d5a4066dc3f8236c38b64be'
};
const T='TD613_ENCYCLOPEDIA_TO_UNIVERSAL_ATELIER';const W='WENDBINE_ATELIER_TO_UNIVERSAL_ENCYCLOPEDIA';
function pinned(dir,name){const f=path.join(dir,name),st=fs.lstatSync(f);if(st.isSymbolicLink()||!st.isFile()||blob(fs.readFileSync(f))!==pins[name])throw Error('ORIGINAL_NATIVE_BLOB_DRIFT');return f;}
export async function sourceNative({route,originalRoot,fixture,operation,params={}}){
 if(route===T){
  let code=fs.readFileSync(pinned(originalRoot,'encyclopedia-reference-runtime.js'),'utf8');code=code.split('// TD613 unified research view adapter.')[0];
  const nodes={'td613-reference-manifest':JSON.stringify(fixture.manifest),'td613-reference-intake-schema':JSON.stringify({type:'object'}),'td613-reference-records':fixture.records.map(x=>JSON.stringify(x)).join('\n'),'td613-reference-directory':fixture.directory.map(x=>JSON.stringify(x)).join('\n')};
  const scope={document:{getElementById:key=>({textContent:nodes[key]})},window:{},TextEncoder,crypto:crypto.webcrypto};vm.runInNewContext(code,scope,{timeout:2500});const r=scope.window.TD613Reference;
  if(operation==='search')return r.search(params.query,params.options||{});
  if(operation==='get')return r.get(params.id);
  if(operation==='cite')return r.cite(params.id);
  if(operation==='verify')return await r.verify();
  if(operation==='neighbors')return r.neighbors(params.id,params.options||{});
  if(operation==='context')return r.context(params.id,params.options||{});
  throw Error('UNSUPPORTED_ORIGINAL_OPERATION');
 }
 if(route===W){
  const c=await import(pathToFileURL(pinned(originalRoot,'wendbine-compile.mjs')).href);
  const q=await import(pathToFileURL(pinned(originalRoot,'wendbine-query.mjs')).href);
  const topology=c.compilePublicCorpus(fixture.meta,fixture.posts,fixture.relations);
  if(operation==='topology'){const edges=topology.typed_relation_edges;return {snapshot_id:topology.snapshot_id,typed_edges:edges,day_buckets:topology.publication_day_buckets,documented_graph_semantics:topology.graph_semantics,unclassified_graphs:[...new Set(edges.map(e=>e.graph).filter(g=>!Object.hasOwn(topology.graph_semantics,g)))].sort()}}
  const home=fs.mkdtempSync(path.join(os.tmpdir(),'e3b3-independent-native-'));
  try{const manifest=path.join(home,'01-MANIFESTS');fs.mkdirSync(manifest);fs.writeFileSync(path.join(manifest,'source-registry.jsonl'),fixture.posts.map(p=>JSON.stringify(p)).join('\n')+'\n');const rows=q.buildIndex(home);
   if(operation==='lexical')return q.lexicalSearch(rows,params.query,params.options||{});
   if(operation==='semantic')return q.semanticSearch(rows,params.query,params.options||{});
   if(operation==='recent')return q.recentEntries(rows,params.options||{});
   if(operation==='resolve')return q.resolveEntry(rows,params.id);
   throw Error('UNSUPPORTED_ORIGINAL_OPERATION');
  }finally{fs.rmSync(home,{recursive:true,force:true})}
 }
 throw Error('UNSUPPORTED_SOURCE_ROUTE');
}