import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {openSealedPublicResearch} from '../99-ADMIN/wendbine-sealed-public-research-v01.mjs';
import {buildSourceMatchedHistoricalOverlay,summarizeHistoricalConcepts,
 searchHistoricalConcepts,mapHistoricalConcepts} from '../99-ADMIN/wendbine-historical-concept-overlay-v01.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const session=()=>openSealedPublicResearch({root,
 snapshotId:'wendbine-20261104014208-6d200e3ff3a0',
 sealId:'wendbine-seal:6d200e3ff3a0d7d79d7a135d676141fea8dfab3ae9496b525c5a93b55e31edf2'});
test('Historical 33-source conceptual overlay explicitly joins the real Nov04 seal by exact source ID, URL and date',()=>{
 const r=buildSourceMatchedHistoricalOverlay(session()),s=summarizeHistoricalConcepts(r);
 assert.equal(r.historicalTotal,33);
 assert.equal(s.source_coverage_total,2062);
 assert.equal(s.source_id_join_count,33);
 assert.equal(s.missing_historical_source_count,0);
 assert.equal(s.inherited_concept_edges,146);
 assert.equal(s.source_ids_without_bounded_concept_annotation,2029);
 assert.equal(s.typed_graph_layers.G_X,46);
 assert.equal(s.typed_graph_layers.G_T,25);
 assert.equal(s.full_corpus_semantic_mapping,'NOT_ESTABLISHED');
 assert.equal(s.original_bot_output_text_indexed,0);
});
test('G_D/G_A/G_F/G_I/G_T/G_P/G_R/G_O/G_X retain original evidence categories and exact source URL',()=>{
 const r=buildSourceMatchedHistoricalOverlay(session());
 assert.equal(Object.keys(r.graphCounts).length,9);
 const categories=new Set(r.edges.map(e=>e.original_historical_relation_class));
 assert.ok(categories.has('SOURCE_EXPLICIT_NEGATIVE_RELATION'));
 assert.ok(categories.has('SOURCE_EXPLICIT_SYNTHESIS'));
 assert.ok(categories.has('SOURCE_EXPLICIT_SEQUENCE'));
 assert.ok(categories.has('SOURCE_EXPLICIT_PROGRAM'));
 assert.ok(r.edges.every(e=>e.source_join==='EXACT_SOURCE_ID_URL_DAY'&&
   e.canonical_url?.includes('/r/Wendbine/comments/')&&e.scientific_authority===false));
 const a=r.edges[0],map=mapHistoricalConcepts(r,{concept:a.from,graph:a.graph});
 assert.ok(map.total_edges>=1);
 assert.ok(map.edges.some(x=>x.source_id===a.source_id));
 assert.equal(map.proof_ceiling,'RELATIONSHIP_DECLARATION_NOT_EMPIRICAL_CAUSALITY');
});
test('Public conceptual leads are source-linked historical paraphrases, never original bot quotes',()=>{
 const r=buildSourceMatchedHistoricalOverlay(session());
 const hits=searchHistoricalConcepts(r,{query:'provenance',limit:12});
 assert.ok(hits.total_matching_historical_sources>0);
 assert.ok(hits.hits.every(x=>x.match_basis==='HISTORICAL_BOUND_PUBLIC_PARAPHRASE'&&
    x.original_bot_text_quoted===false&&x.canonical_url));
 assert.ok(r.latestEpochManifestationsWithoutHistoricalConceptAnnotation>2000);
 assert.throws(()=>searchHistoricalConcepts(r,{query:'',limit:2}),/WEND_CONCEPT_QUERY_REQUIRED/);
 assert.throws(()=>mapHistoricalConcepts(r,{concept:'source',graph:'MANIFESTATION'}),/WEND_HISTORICAL_GRAPH_REQUIRED/);
});
