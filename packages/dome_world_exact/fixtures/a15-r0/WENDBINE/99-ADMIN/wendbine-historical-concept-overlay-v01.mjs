/**
 * Wendbine historical public CONCEPT graph overlay, anchored source by source
 * to the real Nov 4 manifestation registry. This is a 33-public-post bounded
 * 2026-09-10/11 PREEXISTING PARAPHRASE DERIVATIVE, not source text or model
 * inference over the new 2,062 bot outputs.
 *
 * 146 typed original public research annotation edges across G_D/G_A/G_F/
 * G_I/G_T/G_P/G_R/G_O/G_X. Every edge retains its exact public source ID,
 * target epoch seal and historical derivative evidence class.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {openSealedPublicResearch} from './wendbine-sealed-public-research-v01.mjs';
const fail=code=>{throw Object.assign(Error(code),{code})};
const need=(ok,code)=>{if(!ok)fail(code)};
const shaGit=bytes=>createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
const paths=Object.freeze({
 snapshot:['01-MANIFESTS/public-reddit-48h-snapshot-v01.json','f75d965ee628a50f343119c24a5037044c734519'],
 posts:['01-MANIFESTS/public-reddit-48h-source-registry-v01.jsonl','4cc9feff9c9478eb9ae3e9ae3a4093dcda1806ce'],
 relations:['01-MANIFESTS/typed-relation-registry-v01.json','849abbcf1b26b5f362820e8acd1acba5f0528346']
});
const graphs=Object.freeze(['G_D','G_A','G_F','G_I','G_T','G_P','G_R','G_O','G_X']);
const plain=(x)=>x&&Object.getPrototypeOf(x)===Object.prototype;
function readPinned(r,k) {
 const [name,blob]=paths[k],absolute=path.resolve(r.root,name);
 need(absolute.startsWith(path.resolve(r.root)+path.sep),'WEND_HISTORICAL_PATH_ESCAPED');
 need(fs.lstatSync(absolute).isFile()&&!fs.lstatSync(absolute).isSymbolicLink(),
  'WEND_HISTORICAL_SOURCE_FILE_UNSAFE');
 const bytes=fs.readFileSync(absolute);
 need(shaGit(bytes)===blob,'WEND_HISTORICAL_DERIVATIVE_BLOB_DRIFT_'+k);
 return bytes.toString('utf8');
}
const norm=s=>String(s??'').normalize('NFKC').toLowerCase();
const limit=n=>{need(Number.isInteger(n)&&n>=1&&n<=80,'WEND_CONCEPT_LIMIT_OUT_OF_RANGE');return n};
const sort=(a,b)=>String(a).localeCompare(String(b));
export function buildSourceMatchedHistoricalOverlay(r){
 need(r?.schema==='wendbine.seal-pinned-public-research/v1'&&
  r.source_count===2062&&r.edge_count===6703,
  'WEND_EXACT_NOV04_REAL_EPOCH_REQUIRED');
 const snapshot=JSON.parse(readPinned(r,'snapshot'));
 const posts=readPinned(r,'posts').split(/\r?\n/).filter(Boolean).map(JSON.parse);
 const rel=JSON.parse(readPinned(r,'relations'));
 need(snapshot.schema==='wendbine-public-corpus-snapshot/v0.1'&&
  snapshot.coverage?.admitted_source_count===33&&posts.length===33&&
  rel.schema==='wendbine-typed-relation-registry/v0.1'&&
  rel.relations.length===146,'WEND_HISTORICAL_DERIVATIVE_SCOPE_CHANGED');
 need(Array.isArray(rel.fields)&&rel.fields.join('|')==='source_id|graph|from|relation|to|evidence_class',
  'WEND_HISTORICAL_EDGE_FIELDS_CHANGED');
 const matched=[],missing=[],seen=new Set(),sources=new Map();
 for(const p of posts){
  need(typeof p.source_id==='string'&&!seen.has(p.source_id),'WEND_HIST_DUPLICATE_OR_BAD_ID');
  seen.add(p.source_id);
  need(p.source_text_stored===false&&p.real_person_identity_adjudicated===false&&
   p.snapshot_id===snapshot.snapshot_id&&Array.isArray(p.declared_concepts),
   'WEND_HISTORICAL_SOURCE_NOT_PUBLIC_PARAPHRASE');
  const actual=r.knownSources.get(p.source_id);
  if(!actual||actual.canonical_url!==p.canonical_url||
     actual.published_at?.slice(0,10)!==p.public_date) {
   missing.push({source_id:p.source_id,source_binding:'HELD_UNMATCHED_CANONICAL_OR_DAY'});
   continue;
  }
  const record=Object.freeze({source_id:p.source_id,canonical_url:p.canonical_url,
   exact_epoch_publication_day:actual.published_at.slice(0,10),
   historical_public_date:p.public_date,
   declared_concepts:[...p.declared_concepts],
   historical_technical_header:p.technical_header,
   historical_normalized_summary:p.normalized_summary,
   original_bot_text_present:false,
   content_evidence_class:'HISTORICAL_PUBLIC_SOURCE_LINKED_PARAPHRASE',
   source_anchoring:'EXACT_SOURCE_ID_URL_PUBLICATION_DAY_JOIN',
   identity_class:'PUBLIC_ACCOUNT_POST_NOT_VERIFIED_PERSON'});
  matched.push(record);sources.set(p.source_id,record);
 }
 const edges=[],excluded=[];
 for(const row of rel.relations){
  const [source_id,graph,from,relation,to,original_class]=row;
  need(typeof source_id==='string'&&graphs.includes(graph)&&
    typeof from==='string'&&typeof to==='string'&&
    typeof relation==='string'&&original_class==='SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
    'WEND_HISTORICAL_TYPED_RELATION_SHAPE');
  const source=sources.get(source_id);
  if(!source){excluded.push({source_id,reason:'NO_EXACT_NOV04_ANCHOR'});continue;}
  edges.push(Object.freeze({graph,from:'concept:'+from,relation,to:'concept:'+to,
   source_id,canonical_url:source.canonical_url,
   source_join:'EXACT_SOURCE_ID_URL_DAY',
   evidence_class:'HISTORICAL_PUBLIC_PARAPHRASE_NOT_ORIGINAL_BOT_TEXT',
   original_historical_relation_class:original_class,
   scientific_authority:false}));
 }
 const graphCounts=Object.fromEntries(graphs.map(g=>[g,edges.filter(e=>e.graph===g).length]));
 const conceptIDs=new Set();
 for(const e of edges){conceptIDs.add(e.from);conceptIDs.add(e.to);}
 for(const s of matched)for(const x of s.declared_concepts)conceptIDs.add('concept:'+x);
 return Object.freeze({
  schema:'wendbine.source-matched-historical-concept-overlay/v1',
  snapshotId:r.snapshotId,sealId:r.sealId,
  historicalSnapshotId:snapshot.snapshot_id,
  historicalTotal:posts.length,matchedCount:matched.length,
  missingCount:missing.length,missing:Object.freeze(missing),
  edges:Object.freeze(edges),excludedEdges:Object.freeze(excluded),
  sources,graphCounts,conceptCount:conceptIDs.size,
  latestEpochManifestations:r.source_count,
  latestEpochManifestationsWithoutHistoricalConceptAnnotation:r.source_count-matched.length,
  full_bot_outputs_indexed:0,
  scientific_conceptual_parity_all_2062:false,
  disclosure:'HISTORICAL_ANNOTATED_CONCEPTS_ONLY_NOT_FULL_CORPUS_NATIVE_CONTENT'
 });
}
export function summarizeHistoricalConcepts(overlay){
 need(overlay?.schema==='wendbine.source-matched-historical-concept-overlay/v1',
  'WEND_HISTORICAL_OVERLAY_REQUIRED');
 return {schema:'wendbine.concept-overlay-summary/v1',
  original_public_epoch:overlay.snapshotId,
  historical_source_snapshot:overlay.historicalSnapshotId,
  source_id_join_count:overlay.matchedCount,
  missing_historical_source_count:overlay.missingCount,
  source_coverage_total:overlay.latestEpochManifestations,
  source_ids_without_bounded_concept_annotation:overlay.latestEpochManifestationsWithoutHistoricalConceptAnnotation,
  inherited_concept_edges:overlay.edges.length,
  concept_nodes:overlay.conceptCount,
  typed_graph_layers:overlay.graphCounts,
  full_corpus_semantic_mapping:'NOT_ESTABLISHED',
  original_bot_output_text_indexed:0,
  research_status:'BOUNDED_HISTORICAL_CONCEPT_OVERLAY_JOINED_NOT_NEW_BOT_TEXT_ANALYSIS'};
}
export function searchHistoricalConcepts(overlay,{query,limit=20}={}){
 need(overlay?.schema==='wendbine.source-matched-historical-concept-overlay/v1',
  'WEND_HISTORICAL_OVERLAY_REQUIRED');limit=limitNumber(limit);
 need(typeof query==='string'&&query.trim()&&query.length<=120,
  'WEND_CONCEPT_QUERY_REQUIRED');
 const q=norm(query.trim()),pieces=q.split(/\s+/).filter(Boolean);
 const scored=[];
 for(const s of overlay.sources.values()){
  const head=norm(s.historical_technical_header);
  const concepts=norm(s.declared_concepts.join(' '));
  const summary=norm(s.historical_normalized_summary);
  const match=pieces.filter(t=>head.includes(t)||concepts.includes(t)||summary.includes(t));
  if(!match.length)continue;
  const score=match.length*4+(head.includes(q)?10:0)+(concepts.includes(q)?7:0)+(summary.includes(q)?5:0);
  scored.push({source_id:s.source_id,canonical_url:s.canonical_url,
   historical_technical_header:s.historical_technical_header,
   historical_normalized_summary:s.historical_normalized_summary,
   declared_concepts:s.declared_concepts,match_basis:'HISTORICAL_BOUND_PUBLIC_PARAPHRASE',
   original_bot_text_quoted:false,score});
 }
 scored.sort((a,b)=>b.score-a.score||sort(a.source_id,b.source_id));
 return {schema:'wendbine.historical-concept-search/v1',query,
  total_matching_historical_sources:scored.length,
  hits:scored.slice(0,limit),
  unannotated_nov04_source_count:overlay.latestEpochManifestationsWithoutHistoricalConceptAnnotation,
  claim_ceiling:'HISTORICAL_PARAPHRASE_LEADS_ONLY_NOT_ORIGINAL_SOURCE_ADVICE'};
}
function limitNumber(n){return limit(n);}
export function mapHistoricalConcepts(overlay,{concept,graph=null,maxEdges=35}={}){
 need(overlay?.schema==='wendbine.source-matched-historical-concept-overlay/v1',
  'WEND_HISTORICAL_OVERLAY_REQUIRED');
 need(typeof concept==='string'&&concept.length>0&&concept.length<110,
  'WEND_HISTORICAL_CONCEPT_REQUIRED');limit(maxEdges);
 need(graph===null||graphs.includes(graph),'WEND_HISTORICAL_GRAPH_REQUIRED');
 const focus=concept.startsWith('concept:')?concept:'concept:'+concept;
 const relevant=overlay.edges.filter(e=>(!graph||e.graph===graph)&&(e.from===focus||e.to===focus));
 const accepted=relevant.slice(0,maxEdges);
 return {schema:'wendbine.historical-concept-neighborhood/v1',concept:focus,
  graph:graph??'ALL_HISTORICAL_CONCEPT_GRAPHS',
  total_edges:relevant.length,edges:accepted,truncated:relevant.length>maxEdges,
  source_bound:true,source_count:new Set(accepted.map(e=>e.source_id)).size,
  observation_class:'BOUNDED_PUBLIC_PARAPHRASE_NOT_ORIGINAL_BOT_TEXT',
  excludes_latest_2026_unannotated_sources:true,
  proof_ceiling:'RELATIONSHIP_DECLARATION_NOT_EMPIRICAL_CAUSALITY'};
}
