/**
 * Wendbine · NOV04 seal-pinned public metadata research instrument.
 * Real read-only PUBLIC manifest/capture/typed-edge exploration; no original
 * decrypted bot outputs, inference-based conceptual edges or human identity.
 *
 * Human-facing "Paul" alias is operator-supplied; actual archive account is
 * Upset-Ratio502. This code makes no biographical/person-identity inference.
 * SOURCE_METADATA != SOURCE_TEXT != SOURCE_ADVICE.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {openEpoch} from './wendbine-srcquery.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const rootDefault=path.resolve(here,'..');
const hash=b=>createHash('sha256').update(b).digest('hex');
const fail=code=>{throw Object.assign(Error(code),{code})};
const need=(v,code)=>{if(!v)fail(code)};
const registryPaths=Object.freeze({
 sources:'01-MANIFESTS/phase2/manifestations.jsonl',
 captures:'01-MANIFESTS/phase2/capture-v2.jsonl',
 edges:'05-OPERATIONS/relations/typed-edges.jsonl',
 rights:'01-MANIFESTS/phase2/rights-decision-v1.jsonl'
});
const limitNumber=(v,max=100)=>{need(Number.isInteger(v)&&v>=1&&v<=max,'WEND_PUBLIC_BOUNDED_LIMIT_REQUIRED');return v};
const term=t=>{need(typeof t==='string'&&t.length>0&&t.length<=160,'WEND_PUBLIC_BOUNDED_SEARCH_TERM_REQUIRED');return t.normalize('NFKC').toLowerCase().trim()};
const forbidSensitive=t=>{need(!/private.?key|rsa.?private|decrypted.?body|raw.?selftext|private.?plaintext/i.test(t),'WEND_PRIVATE_CONTENT_QUERY_NOT_ON_PUBLIC_SURFACE')};
function records(epoch,rel){
 const matched=epoch.seal.file_hashes.find(x=>x.path===rel);
 need(matched,'WEND_UNSEALED_REGISTRY_DENIED');
 const absolute=path.resolve(epoch.root,rel);
 need(absolute.startsWith(path.resolve(epoch.root)+path.sep),'WEND_ESCAPE_DENIED');
 const bytes=fs.readFileSync(absolute);
 need(hash(bytes)===matched.sha256,'WEND_REGISTRY_MUTATED_AFTER_OPEN');
 const lines=bytes.toString('utf8').split(/\r?\n/).filter(Boolean);
 need(lines.length===matched.count,'WEND_REGISTRY_LINE_COUNT_MISMATCH');
 return lines.map((row,i)=>{try{return JSON.parse(row)}catch{fail('WEND_INVALID_SEALED_ROW_'+(i+1))}});
}
function projection(r){
 return Object.freeze({source_id:r.source_id,manifestation_id:r.manifestation_id,
  platform_account:r.platform_account,subreddit:r.subreddit,
  canonical_url:r.canonical_url,published_at:r.published_at,
  observed_title_status:r.platform_title_status,
  platform_title:r.platform_title,work_identity_status:r.work_identity_status??null,
  original_full_text_available:false,
  bot_output_full_text_query:'HELD_PRIVATE_SOURCE_NOT_ADMITTED'});
}
function cleanEdge(e,byCapture){
 const a=e.source_entity_id??e.from??null,b=e.target_entity_id??e.to??null;
 return Object.freeze({edge_id:e.edge_id??null,graph:e.graph??'UNSPECIFIED',
  relation:e.relation_type??e.relation??'UNSPECIFIED',from:a,to:b,
  capture_id:e.capture_id??null,
  source_id:byCapture.get(e.capture_id)??null,
  evidence_class:e.evidence_class??e.evidence_basis??'PUBLIC_ARCHIVE_TYPED_EDGE',
  interpretation:'DECLARED_OR_ARCHIVE_DERIVED_RELATION_NOT_CAUSAL_PROOF'});
}
const sorted=(a,b)=>String(a).localeCompare(String(b));
export function openSealedPublicResearch({root=rootDefault,snapshotId,sealId}={}){
 const epoch=openEpoch({root,snapshotId,sealId});
 const sources=records(epoch,registryPaths.sources);
 const captures=records(epoch,registryPaths.captures);
 const edges=records(epoch,registryPaths.edges);
 const rights=records(epoch,registryPaths.rights);
 need(sources.length===epoch.seal.source_count&&captures.length===epoch.seal.capture_count,
  'WEND_SOURCE_CAPTURE_CARDINALITY_CONFLICT');
 need(sources.every(r=>typeof r.source_id==='string'&&r.source_id.startsWith('reddit:t3_')),
  'WEND_UNRECOGNIZED_MANIFESTATION');
 need(new Set(sources.map(r=>r.source_id)).size===sources.length,
  'WEND_DUPLICATE_SOURCE_ID');
 const byCapture=new Map();
 for(const c of captures)if(typeof c.capture_id==='string')
  byCapture.set(c.capture_id,c.source_id??sources.find(s=>s.manifestation_id===c.manifestation_id)?.source_id??null);
 const publicEdges=edges.map(e=>cleanEdge(e,byCapture));
 need(rights.length===sources.length&&rights.every(x=>x.decision==='PRIVATE_ONLY'),
  'WEND_SOURCE_RIGHTS_CONSTRAINT_MISMATCH');
 const knownSources=new Map(sources.map(r=>[r.source_id,r]));
 const knownManifestations=new Map(sources.map(r=>[r.manifestation_id,r]));
 const edgeGraphs=Object.fromEntries([...new Set(publicEdges.map(e=>e.graph))].sort(sorted)
  .map(g=>[g,publicEdges.filter(e=>e.graph===g).length]));
 return Object.freeze({
  schema:'wendbine.seal-pinned-public-research/v1',
  snapshotId,sealId,root:epoch.root,
  sources:Object.freeze(sources),captures:Object.freeze(captures),
  edges:Object.freeze(publicEdges),rights:Object.freeze(rights),
  knownSources,knownManifestations,edgeGraphs,
  source_visibility:'PUBLIC_METADATA_ONLY',
  full_bot_output_text:'HELD_NOT_LOADED',
  source_count:sources.length,capture_count:captures.length,edge_count:edges.length
 });
}
function validate(r){
 need(r?.schema==='wendbine.seal-pinned-public-research/v1','WEND_PINNED_RESEARCH_SESSION_REQUIRED');
}
export function summaryPublicTopology(r){
 validate(r);
 const layerCounts=r.edgeGraphs;
 const nodes=new Set();
 let incompleteEdges=0;
 for(const e of r.edges){if(e.from)nodes.add(e.from);if(e.to)nodes.add(e.to);
  if(!e.from||!e.to)incompleteEdges++;}
 return {schema:'wendbine.public-topology-summary/v1',
  snapshot_id:r.snapshotId,seal_id:r.sealId,
  sources:r.source_count,captures:r.capture_count,
  typed_edges:r.edge_count,distinct_graph_nodes:nodes.size,
  graph_layers:layerCounts,incomplete_endpoints:incompleteEdges,
  source_visibility:'PUBLIC_METADATA_ONLY',private_full_text_search:'HELD',
  note:'Typed structural archive edges are not automatically conceptual or causal relationships.'};
}
/**
 * Honest search against only PUBLIC source/capture/edge metadata.
 * Alias "Paul" -> filter on exact archived platform account, with no
 * identity equivalence or bogus blanket lexical match.
 */
export function searchPublicMetadata(r,{query,limit=20,account='Upset-Ratio502'}={}){
 validate(r);limitNumber(limit);const q=term(query);forbidSensitive(q);
 need(account==='Upset-Ratio502','WEND_UNVERIFIED_ACCOUNT_FILTER');
 const scores=[];
 for(const s of r.sources){
  if(s.platform_account!==account)continue;
  const fields=[
   [s.source_id,40,'SOURCE_ID'],[s.canonical_url,25,'CANONICAL_URL'],
   [s.published_at,12,'PUBLICATION_TIMESTAMP'],
   [s.platform_title,4,'ARCHIVED_TITLE'],
   [s.platform_title_status,2,'TITLE_STATUS'],
   [s.work_identity_status,2,'WORK_IDENTITY_STATUS']];
  let points=0,basis=[];
  for(const [value,score,label] of fields)
   if(typeof value==='string'&&value.toLowerCase().includes(q)){points+=score;basis.push(label);}
  if(points) scores.push({source:projection(s),score:points,match_basis:basis});
 }
 scores.sort((a,b)=>b.score-a.score||sorted(a.source.source_id,b.source.source_id));
 return {schema:'wendbine.public-metadata-search/v1',
  query:q,observed_public_matches:scores.length,limit,
  hits:scores.slice(0,limit),source_visibility:'PUBLIC_METADATA_ONLY',
  search_covers_original_bot_output_bodies:false,
  no_match_means:'NO_MATCH_IN_PUBLIC_FIELDS_NOT_NO_MATCH_IN_ARCHIVED_BOT_OUTPUT',
  human_alias_status:'PAUL_OPERATOR_PROVIDED_NOT_VERIFIED_PERSON_IDENTITY'};
}
/**
 * Topological *public observation* mapping with bounded directed neighborhood.
 * Does not claim G_X conceptual synthesis for edges generated by capture flow.
 */
export function neighborhood(r,{entityId,graph=null,depth=1,maxEdges=60}={}){
 validate(r);need(typeof entityId==='string'&&entityId.length>0&&entityId.length<=180,'WEND_ENTITY_ID_REQUIRED');
 need(Number.isInteger(depth)&&depth>=1&&depth<=3,'WEND_TOPOLOGY_MAX_DEPTH_3');
 limitNumber(maxEdges,200);
 need(graph===null||(typeof graph==='string'&&Object.hasOwn(r.edgeGraphs,graph)),
  'WEND_GRAPH_LAYER_NOT_REGISTERED');
 const chosen=graph?r.edges.filter(e=>e.graph===graph):r.edges;
 let frontier=new Set([entityId]),visited=new Set([entityId]),located=[];
 for(let d=0;d<depth;d++){
  const next=new Set();
  for(const e of chosen){
   if(frontier.has(e.from)||frontier.has(e.to)||frontier.has(e.capture_id)){
    located.push(e);
    if(e.from&&!visited.has(e.from))next.add(e.from);
    if(e.to&&!visited.has(e.to))next.add(e.to);
   }
  }
  for(const n of next)visited.add(n);
  if(!next.size)break;
  frontier=next;
 }
 const unique=new Map(located.map(e=>[
  [e.edge_id,e.graph,e.relation,e.from,e.to,e.capture_id].join('|'),e]));
 const matching=[...unique.values()];
 const trimmed=matching.slice(0,maxEdges);
 const nodeIds=new Set([entityId]);
 for(const e of trimmed){if(e.from)nodeIds.add(e.from);if(e.to)nodeIds.add(e.to);}
 const nodes=[...nodeIds].sort(sorted).map(id=>{
  const s=r.knownSources.get(id)??r.knownManifestations.get(id);
  return s?{id,kind:'ARCHIVED_PUBLIC_SOURCE',source:projection(s)}:
   {id,kind:'PUBLIC_RELATIONAL_NODE_ONLY',identity_adjudicated:false};
 });
 return {schema:'wendbine.public-typed-neighborhood/v1',
  snapshot_id:r.snapshotId,seal_id:r.sealId,focus:entityId,graph,
  depth,max_edges:maxEdges,matching_edges:matching.length,
  truncated:matching.length>maxEdges,
  nodes,edges:trimmed,
  no_match_means:'NO_TYPED_EDGE_AT_THIS_EPOCH_FOR_THIS_FOCUS',
  graph_claim_ceiling:'ARCHIVED_TYPED_RELATIONS_NOT_RECONSTRUCTED_BOT_MEANING'};
}
export function resolvePublicSource(r,{sourceId}={}){
 validate(r);need(typeof sourceId==='string'&&sourceId.length<=180,'WEND_SOURCE_ID_REQUIRED');
 const s=r.knownSources.get(sourceId)??r.knownManifestations.get(sourceId);
 const captures=r.captures.filter(c=>c.source_id===sourceId||c.manifestation_id===s?.manifestation_id);
 return {schema:'wendbine.public-source-resolution/v1',
  requested_id:sourceId,found:!!s,source:s?projection(s):null,
  capture_count:captures.length,capture_ids:captures.slice(0,80).map(x=>x.capture_id??null),
  capture_ids_truncated:captures.length>80,
  full_original_text:'HELD_PRIVATE_ENCRYPTED_EPOCH',
  rights_automatic_grant:false};
}
export function researchReadiness(r,{query='Experiment B Flight'}={}){
 validate(r);
 const metadata=searchPublicMetadata(r,{query,limit:12});
 return {schema:'wendbine.research-readiness/v1',
  question:query,meta_hits:metadata.hits,
  public_topology:summaryPublicTopology(r),
  bot_output_text_retrieved:0,
  source_advice_from_original_text:'NOT_OBSERVED',
  eligible_for_attributed_public_quotations:false,
  requires_operator_local_decrypt_and_rights_review:true,
  claim_ceiling:'SEARCH_AND_TOPOLOGY_ON_REAL_SEALED_METADATA_ONLY'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const a=process.argv.slice(2),v=k=>a.includes(k)?a[a.indexOf(k)+1]:null;
 const session=openSealedPublicResearch({root:v('--root')||rootDefault,
  snapshotId:v('--snapshot-id'),sealId:v('--seal-id')});
 const command=a[0]||'summary';
 const result=command==='summary'?summaryPublicTopology(session):
  command==='search'?searchPublicMetadata(session,{query:v('--query')??'Experiment B',limit:Number(v('--limit')||20)}):
  command==='map'?neighborhood(session,{entityId:v('--id'),graph:v('--graph'),depth:Number(v('--depth')||1)}):
  command==='source'?resolvePublicSource(session,{sourceId:v('--id')}):
  command==='readiness'?researchReadiness(session,{query:v('--query')??'Experiment B Flight'}):
  fail('WEND_UNKNOWN_PUBLIC_RESEARCH_ACTION');
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
