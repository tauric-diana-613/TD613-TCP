import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeMethodCensus,runWendbineNativeFixture} from '../scripts/pe04-native-method-census-v01.mjs';
test('PE04 SRC and Em methods execute against pinned source-free software, retain truthful status',()=>{
 const c=nativeMethodCensus();
 assert.equal(c.src.family_count,12);
 assert.equal(c.src.original_corpus_parity,0);
 assert.equal(c.em.count,10);assert.equal(c.em.executed,3);assert.equal(c.em.partial,6);assert.equal(c.em.designed,1);
 assert.equal(c.universal_original.real_sources_admitted,0);
 assert.equal(c.universal_original.original_shared_connector,'HELD');
 assert.match(c.claim_ceiling,/NOT_FULL_METHOD_PARITY/);
});
test('PE04 actual Wendbine public compiler invoked for exact inherited fixture, private untouched',()=>{
 const c=runWendbineNativeFixture();
 assert.equal(c.source_id,'FIXTURE:W_PUBLIC');
 assert.ok(c.post_nodes>=1);
 assert.ok(c.typed_edges>=0);
 assert.equal(c.private_originals_seen,0);
});
