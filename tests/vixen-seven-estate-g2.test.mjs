import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {
 SemanticSemioticSearchEngine, hestenesJacobiSvd, createInlineFallbackEngine
} from '../app/encyclopedia/vixen-estate/semantic-semiotic-search.mjs';
const base=new URL('../app/encyclopedia/vixen-estate/',import.meta.url);
const idx=JSON.parse(await readFile(new URL('semantic-semiotic-index.v1.json',base),'utf8'));
const p1=JSON.parse(await readFile(new URL('corpus-experiment-a-part1.json',base),'utf8'));
const p2=JSON.parse(await readFile(new URL('corpus-experiment-a-part2.json',base),'utf8'));
const html=readFileSync(fileURLToPath(new URL('../app/encyclopedia/vix-cyb.html',import.meta.url)),'utf8');
const corpus=JSON.parse(html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\\s\\S]*?)<\\/script>/)[1]);
const empty=()=>new SemanticSemioticSearchEngine(idx);
test('OBS-A: 12x48 diagnostic distinguishes algebraic rank, nullity, nonzero kappa and fractional effective rank',()=>{
 const e=empty(),q=e.search('algedonic bypass viability',{limit:12});
 const a=q.aperture_observability;
 assert.equal(q.status,'SEARCH_OK');
 assert.equal(a.matrix_rows,12);assert.equal(a.matrix_columns,48);
 assert.equal(a.algebraic_rank,12);assert.equal(a.nullity,36);
 assert.equal(a.condition_number_kappa,a.condition_number_nonzero_spectrum);
 assert(a.condition_number_nonzero_spectrum>1&&Number.isFinite(a.condition_number_nonzero_spectrum));
 assert(a.spectral_effective_rank>0&&a.spectral_effective_rank<=12);
 assert.equal(a.spectral_effective_rank,a.effective_rank);
 assert.equal(a.full_column_identifiability_established,false);
 assert.equal(a.noise_geometry_identifiability,'UNKNOWN_NOT_MEASURED');
 assert.equal(a.rank_tolerance_absolute,1e-10);
 const oneRow=hestenesJacobiSvd([Array.from({length:48},(_,j)=>j===0?1:0)],48);
 assert.equal(oneRow.algebraic_rank,1);assert.equal(oneRow.nullity,47);
 assert.equal(oneRow.condition_number_nonzero_spectrum,1);
 assert.equal(oneRow.full_column_identifiability_established,false);
});
test('SEARCH-A: original missing-body false-looking phrase witnesses never receive body-verified boost',()=>{
 const e=empty();
 for(const [phrase,originalFalseCount] of [['viability bypass',9],['barrier memory',10]]){
  const result=e.search('"'+phrase+'"',{mode:'phrase',limit:20});
  assert.equal(result.total_hits,0);
  assert.equal(result.returned_hits,0);
  assert.equal(result.status,'UNVERIFIED_COOCCURRENCE');
  assert.equal(result.phrase_evidence_status,'UNVERIFIED_COOCCURRENCE');
  assert(result.unverified_phrase_candidates>=originalFalseCount,
    'Do not erase missing-body candidates; report their observation class');
 }
});
test('SEARCH-B: real ordered phrase in attached source body is attributable and retains BM25F',()=>{
 const e=empty();e.attachShardTexts(p1,p2);
 const positive=e.search('"semantic steering"',{mode:'phrase',limit:12});
 assert.equal(positive.status,'SEARCH_OK');
 assert(positive.hits.length>0);
 assert(positive.hits.every(h=>h.phrase_verification_status==='BODY_VERIFIED_PHRASE'));
 assert(positive.hits.some(h=>h.why.some(w=>w.includes('phrase match'))));
 assert(positive.hits.every(h=>!!h.chunk_sha256));
 for(const phrase of ['viability bypass','barrier memory']){
  const no=e.search('"'+phrase+'"',{mode:'phrase',limit:20});
  assert.equal(no.total_hits,0);
  assert.notEqual(no.phrase_evidence_status,'BODY_VERIFIED_PHRASE');
 }
 const normal=e.search('algedonic bypass viability',{limit:12});
 assert.equal(normal.status,'SEARCH_OK');
 assert(normal.hits.some(h=>h.s_lex>0));
});
test('SEARCH-C: inline fallback has no original body and must not claim phrase success',()=>{
 const f=createInlineFallbackEngine(corpus);
 const result=f.search('"semantic steering"',{mode:'phrase',limit:20});
 assert.equal(result.total_hits,0);
 assert.equal(result.returned_hits,0);
 assert.notEqual(result.phrase_evidence_status,'BODY_VERIFIED_PHRASE');
 assert(result.hits.every(h=>!h.why.some(v=>v.includes('phrase match'))));
});
test('SEARCH-D: asynchronous loadShards=false maintains explicit missing-body refusal',async()=>{
 const e=empty();
 const result=await e.searchAsync('"viability bypass"',{mode:'phrase',limit:20,loadShards:false});
 assert.equal(result.total_hits,0);
 assert.equal(result.phrase_evidence_status,'UNVERIFIED_COOCCURRENCE');
});
