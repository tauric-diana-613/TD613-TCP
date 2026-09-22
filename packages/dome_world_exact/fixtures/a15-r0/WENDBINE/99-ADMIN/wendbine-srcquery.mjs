#!/usr/bin/env node
/** SRC-style seal-pinned, read-only Wendbine public projection query. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
const readJson=(root,rel)=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const readJsonl=(root,rel)=>fs.readFileSync(path.join(root,rel),'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);
export const ROUTES=['EXPERIENTIAL','CUSTODIAL','AUDIT','IMPLEMENTATION'];
export function openEpoch({root=ROOT,snapshotId,sealId}){
 if(!snapshotId||!sealId)throw new Error('EXPLICIT_SRC_SNAPSHOT_AND_SEAL_REQUIRED');
 const current=readJson(root,'04-RECEIPTS/phase2/current-seal.json');
 if(current.atelier_snapshot_id!==snapshotId||current.seal_id!==sealId)throw new Error('SEAL_EPOCH_UNAVAILABLE');
 const files=current.file_hashes;
 if(!Array.isArray(files)||digest(JSON.stringify(files))!==sealId.slice('wendbine-seal:'.length))
  throw new Error('PUBLIC_SEAL_MANIFEST_INTEGRITY_MISMATCH');
 for(const entry of files){
  const filename=path.resolve(root,entry.path);
  if(!filename.startsWith(path.resolve(root)+path.sep))throw new Error('ESCAPING_REGISTRY_PATH');
  const bytes=fs.readFileSync(filename);
  if(digest(bytes)!==entry.sha256)throw new Error('REGISTRY_HASH_MISMATCH_'+entry.path);
 }
 const registry=readJson(root,'01-MANIFESTS/registry-index.json');
 if(registry.snapshot_id!==snapshotId||registry.current_seal!=='04-RECEIPTS/phase2/current-seal.json')
  throw new Error('REGISTRY_EPOCH_MISMATCH');
 return {root,snapshotId,sealId,seal:current,registry};
}
export function queryEpoch(epoch,{route,action,entityId=null}){
 if(!ROUTES.includes(route))throw new Error('EXPLICIT_AIA_ROUTE_REQUIRED');
 const read=rel=>readJsonl(epoch.root,rel);
 const captures=read('01-MANIFESTS/phase2/capture-v2.jsonl');
 const manifests=read('01-MANIFESTS/phase2/manifestations.jsonl');
 const edges=read('05-OPERATIONS/relations/typed-edges.jsonl');
 let result;
 switch(action){
  case 'summary':
   result={manifestations:manifests.length,captures:captures.length,
    body_states:captures.reduce((a,x)=>(a[x.body_state]=(a[x.body_state]??0)+1,a),{}),
    typed_edges:edges.length,graph_counts:edges.reduce((a,x)=>(a[x.graph]=(a[x.graph]??0)+1,a),{}),
    private_source_body_query_authorized:false,
    source_version_claim:'ARCHIVE_OBSERVED_NOT_FIRST_PUBLICATION_OR_LIVE_REDDIT'};
   break;
  case 'resolve':
   if(!entityId)throw new Error('SOURCE_OR_ENTITY_ID_REQUIRED');
   result={manifestations:manifests.filter(x=>[x.source_id,x.manifestation_id].includes(entityId)),
    captures:captures.filter(x=>[x.source_id,x.capture_id,x.manifestation_id].includes(entityId)),
    edges:edges.filter(x=>[x.source_entity_id,x.target_entity_id].includes(entityId))};
   if(!result.manifestations.length&&!result.captures.length&&!result.edges.length)
    result={entity_id:entityId,status:'UNRESOLVED_TARGET'};
   break;
  case 'chronology':
   result=manifests.slice().sort((a,b)=>a.published_at.localeCompare(b.published_at))
    .map(x=>({source_id:x.source_id,manifestation_id:x.manifestation_id,
      source_published_at:x.published_at,work_id:x.work_id??null}));
   break;
  case 'versions':
   if(!entityId)throw new Error('SOURCE_OR_MANIFESTATION_ID_REQUIRED');
   result=read('05-OPERATIONS/phase2/version-observations.jsonl')
    .filter(x=>[x.manifestation_id,captures.find(c=>c.capture_id===x.capture_id)?.source_id].includes(entityId));
   break;
  case 'relations':
   result=entityId?edges.filter(x=>[x.source_entity_id,x.target_entity_id,x.capture_id].includes(entityId)):edges;
   break;
  default:throw new Error('UNKNOWN_SRC_QUERY_ACTION');
 }
 return {schema:'wendbine-src-query-result/v1',query_epoch:{atelier_snapshot_id:epoch.snapshotId,
   seal_id:epoch.sealId},route,action,result,non_equivalence:'SOURCE_QUERY != SCIENTIFIC_PROMOTION'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),get=k=>args.includes(k)?args[args.indexOf(k)+1]:null;
 const root=get('--root')||ROOT;
 const epoch=openEpoch({root,snapshotId:get('--snapshot-id'),sealId:get('--seal-id')});
 process.stdout.write(JSON.stringify(queryEpoch(epoch,{route:get('--route'),action:get('--action'),entityId:get('--id')}),null,2)+'\n');
}
