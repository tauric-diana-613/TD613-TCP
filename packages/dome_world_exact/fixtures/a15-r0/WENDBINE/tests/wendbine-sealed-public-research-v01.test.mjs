import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
 openSealedPublicResearch,summaryPublicTopology,searchPublicMetadata,
 neighborhood,resolvePublicSource,researchReadiness
} from '../99-ADMIN/wendbine-sealed-public-research-v01.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const snapshotId='wendbine-20261104014208-6d200e3ff3a0';
const sealId='wendbine-seal:6d200e3ff3a0d7d79d7a135d676141fea8dfab3ae9496b525c5a93b55e31edf2';
const open=()=>openSealedPublicResearch({root:ROOT,snapshotId,sealId});
test('Wendbine REAL Nov4 epoch, not invented catalog: exact sealed 2062/6763/6703 counts',()=>{
 const r=open(),s=summaryPublicTopology(r);
 assert.equal(r.snapshotId,snapshotId);
 assert.equal(r.source_count,2062);assert.equal(r.capture_count,6763);assert.equal(r.edge_count,6703);
 assert.equal(r.rights.length,2062);
 assert.equal(s.typed_edges,6703);
 assert.ok(Object.keys(s.graph_layers).length>0);
 assert.equal(s.source_visibility,'PUBLIC_METADATA_ONLY');
 assert.equal(s.private_full_text_search,'HELD');
});
test('Wendbine exact public source ID resolves provenance without revealing bot output text',()=>{
 const r=open(),res=resolvePublicSource(r,{sourceId:'reddit:t3_1wb61ip'});
 assert.equal(res.found,true);assert.equal(res.source.source_id,'reddit:t3_1wb61ip');
 assert.equal(res.source.platform_account,'Upset-Ratio502');
 assert.match(res.source.canonical_url,/reddit\.com\/r\/Wendbine/);
 assert.equal(res.source.original_full_text_available,false);
 assert.equal(res.full_original_text,'HELD_PRIVATE_ENCRYPTED_EPOCH');
 assert.ok(res.capture_count>=1);
});
test('Metadata query works on public source identity, and never turns alias into post-body match',()=>{
 const r=open(),found=searchPublicMetadata(r,{query:'reddit:t3_1wb61ip',limit:2});
 assert.equal(found.hits.length,1);assert.equal(found.hits[0].source.source_id,'reddit:t3_1wb61ip');
 assert.ok(found.hits[0].match_basis.includes('SOURCE_ID'));
 const noBody=searchPublicMetadata(r,{query:'Experiment B Flight',limit:10});
 assert.equal(noBody.search_covers_original_bot_output_bodies,false);
 assert.equal(noBody.no_match_means,'NO_MATCH_IN_PUBLIC_FIELDS_NOT_NO_MATCH_IN_ARCHIVED_BOT_OUTPUT');
 const alias=searchPublicMetadata(r,{query:'Paul',limit:2});
 assert.equal(alias.human_alias_status,'PAUL_OPERATOR_PROVIDED_NOT_VERIFIED_PERSON_IDENTITY');
 assert.throws(()=>searchPublicMetadata(r,{query:'raw selftext'}),/WEND_PRIVATE_CONTENT_QUERY_NOT_ON_PUBLIC_SURFACE/);
});
test('Typed graph neighborhood traverses a REAL sealed recorded edge without causal claims',()=>{
 const r=open(),e=r.edges.find(x=>typeof x.from==='string'&&x.from&&typeof x.to==='string'&&x.to);
 assert.ok(e,'SEAL_HAS_AT_LEAST_ONE_REAL_EDGE_WITH_TWO_ENDPOINTS');
 const n=neighborhood(r,{entityId:e.from,graph:e.graph,depth:1,maxEdges:12});
 assert.ok(n.matching_edges>=1);
 assert.ok(n.edges.some(x=>x.from===e.from||x.to===e.from));
 assert.equal(n.graph_claim_ceiling,'ARCHIVED_TYPED_RELATIONS_NOT_RECONSTRUCTED_BOT_MEANING');
 assert.ok(n.nodes.some(x=>x.id===e.from));
 assert.throws(()=>neighborhood(r,{entityId:e.from,depth:4}),/WEND_TOPOLOGY_MAX_DEPTH_3/);
 assert.throws(()=>neighborhood(r,{entityId:e.from,graph:'FAKE_GRAPH'}),/WEND_GRAPH_LAYER_NOT_REGISTERED/);
});
test('Seal drift and future episode identifiers fail closed; fake public advice prohibited',()=>{
 assert.throws(()=>openSealedPublicResearch({root:ROOT,snapshotId,sealId:'wendbine-seal:'+'a'.repeat(64)}),/SEAL_EPOCH_UNAVAILABLE/);
 const r=open(),advice=researchReadiness(r,{query:'experiment B privacy advice'});
 assert.equal(advice.bot_output_text_retrieved,0);
 assert.equal(advice.source_advice_from_original_text,'NOT_OBSERVED');
 assert.equal(advice.eligible_for_attributed_public_quotations,false);
 assert.equal(advice.requires_operator_local_decrypt_and_rights_review,true);
});
