from pathlib import Path
from contextlib import closing
import importlib.util,sys,json,hashlib,collections,time,sqlite3
R=Path(__file__).resolve().parent
def load(name,p):
 s=importlib.util.spec_from_file_location(name,p);m=importlib.util.module_from_spec(s);sys.modules[name]=m;s.loader.exec_module(m);return m
sem=load('run_semantic',R/'u/scripts/atelier-semantic-sqlite-v1.py')
ref=load('run_ref',R/'u/scripts/atelier-reference-index-v1.py')
bench=load('run_bench',R/'u/scripts/atelier-semantic-parity-benchmark-v1.py')
q=sem.q
manifest=json.loads((R/'candidate-gold-manifest.json').read_text('utf8'))
gold_bytes=(R/'candidate-gold-v1.private.json').read_bytes()
assert hashlib.sha256(gold_bytes).hexdigest()==manifest['sha256']
gold=json.loads(gold_bytes)
db=next(Path(x) for x in (R/'db-discovery-private.txt').read_text().splitlines() if Path(x).name=='wendbine-combined-observed.sqlite')
cache=R/'authentic-chunks-v2.private.jsonl'
if cache.exists():
 chunks=[json.loads(x) for x in cache.read_text('utf8').splitlines() if x.strip()]
 for row in chunks:assert hashlib.sha256(row['chunk'].encode('utf8')).hexdigest()==row['chunk_sha256']
 sources=[{'estate':est,'source_id':sid,'capture_id':cid} for est,sid,cid in sorted({(x['estate'],x['source_id'],x['capture_id'] or '') for x in chunks})]
else:
 sources=list(q.u.load_sources(db,(R/'u').resolve(),native_checkouts={'SRC':(R/'so').resolve(),'EMSTD613':(R/'eo').resolve()}))
 chunks=list(q.source_chunks(iter(sources)))
 with cache.open('x',encoding='utf8') as f:
  for row in chunks:f.write(json.dumps(row,ensure_ascii=False,separators=(',',':'))+'\n')
print('exact-source corpus ready',len(chunks),dict(collections.Counter(r['estate'] for r in chunks)),flush=True)
out={'gold_freeze_sha256':manifest['sha256'],'human_gold_approved':False,'ranking_evidence':'EXPLORATORY_CANDIDATE_LABELS_ONLY','source_counts':dict(collections.Counter(r['estate'] for r in sources))}
refdb=(R/'reference-exact-v4.sqlite').resolve()
native=load('run_native_relations',R/'u/scripts/atelier-native-reference-relations-v1.py')
out['reference_build']=ref.build(refdb,iter(chunks),native.relations(R/'so'/q.u.BASE/'SRC',R/'eo'/q.u.BASE/'EMSTD613',chunks))
with closing(ref.connect(refdb)) as c:out['reference_verify']=ref.verify(c);out['facets']=ref.facets(c)
modeldir=(R/'model').resolve();mh=sem.e.local_model_fingerprint(modeldir);model=sem.e.open_model(modeldir)
out['model_sha256']=mh
calls=0;t=time.monotonic()
def embed_batch(texts):
 global calls
 result=model.encode(texts,batch_size=24,normalize_embeddings=True,show_progress_bar=False);calls+=len(texts)
 if calls%240==0:print('locally embedded',calls,'of',len(chunks),'elapsed_s',round(time.monotonic()-t),flush=True)
 return result
vecdb=(R/'semantic-exact-v2.sqlite').resolve()
out['vector_build']=sem.build(vecdb,iter(chunks),lambda text:sem.e.encode(model,text),mh,embed_batch=embed_batch,batch_size=24)
out['vector_audit']=sem.audit(vecdb,iter(chunks))
(R/'semantic-execution-private.json').write_text(json.dumps(out,indent=2),'utf8')
rankings={};lexical={};readback=0;bychunk={x['chunk_id']:x for x in chunks}
with closing(ref.connect(refdb)) as c:
 for case in gold['cases']:
  hits=sem.search(vecdb,sem.e.encode(model,case['query']),model_hash=mh,estate=case['target_estate'],limit=20,unique_sources=True)
  for h in hits:
   chunk=bychunk[h['chunk_id']]
   assert h['source_sha256']==chunk['source_sha256'] and h['chunk_sha256']==hashlib.sha256(chunk['chunk'].encode('utf8')).hexdigest()
   readback+=1
  rankings[case['query_id']]=hits
  # Fetch all chunks in pages to rank 20 distinct sources, preserving actual BM25 order.
  result=[];seen=set();offset=0
  while len(result)<20:
   batch=ref.search(c,case['query'],estate=case['target_estate'],limit=100,offset=offset)['results']
   for h in batch:
    if h['source_id'] not in seen:
     seen.add(h['source_id']);result.append(h|{'retrieval_class':'LOCAL_SEMANTIC_CANDIDATE_NO_RELATION_PROMOTION','measured_method':'LEXICAL_BM25_BASELINE'})
     if len(result)==20:break
   if len(batch)<100 or offset>=4900:break
   offset+=100
  lexical[case['query_id']]=result
  print('candidate query measured',case['query_id'],flush=True)
out['semantic_candidate_metrics']=bench.benchmark(gold['cases'],rankings)
out['bm25_candidate_metrics']=bench.benchmark(gold['cases'],lexical)
out['returned_semantic_source_spans_verified']=readback
out['evaluation_seconds']=round(time.monotonic()-t,2)
(R/'semantic-rankings-private.json').write_text(json.dumps(rankings,ensure_ascii=False,indent=2),'utf8')
(R/'lexical-rankings-private.json').write_text(json.dumps(lexical,ensure_ascii=False,indent=2),'utf8')
(R/'semantic-execution-private.json').write_text(json.dumps(out,indent=2),'utf8')
print('exploratory comparison complete; human relevance adjudication held',flush=True)
