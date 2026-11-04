import hashlib, importlib.util, pathlib, tempfile, unittest
p=pathlib.Path(__file__).resolve().parents[1]/"scripts"/"atelier-semantic-sqlite-v1.py"
s=importlib.util.spec_from_file_location("semdb",p)
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
def source(estate,sid,text):
 b=text.encode("utf8")
 return {"estate":estate,"source_id":sid,"source_kind":"TEST_ONLY",
  "bytes":b,"sha256":hashlib.sha256(b).hexdigest(),"relative_path":"none",
  "title":b"title","title_sha256":hashlib.sha256(b"title").hexdigest()}
class SemanticDB(unittest.TestCase):
 def test_full_three_estate_source_bound_snapshot(self):
  with tempfile.TemporaryDirectory() as folder:
   dest=pathlib.Path(folder)/"vectors.sqlite"
   rows=[source("SRC","s1","one research thread"),
         source("EMSTD613","e1","two unrelated mechanisms"),
         source("WENDBINE","reddit:t3_abcde1","three observed facts")]
   chunks=list(m.q.source_chunks(iter(rows)))
   labels={x["source_id"]:[1,0] if x["estate"]=="EMSTD613" else [0,1] for x in chunks}
   result=m.build(dest,iter(chunks),lambda x:labels[next(z["source_id"]
     for z in chunks if z["chunk"]==x)],"a"*64)
   self.assertEqual(result["source_chunk_count"],4)
   self.assertEqual(int(m.audit(dest,iter(chunks))["corpus_chunk_count"]),4)
   found=m.search(dest,[1,0],model_hash="a"*64,limit=2)
   self.assertEqual(found[0]["estate"],"EMSTD613")
   self.assertEqual(found[0]["retrieval_class"],"LOCAL_SEMANTIC_CANDIDATE_NO_RELATION_PROMOTION")
   with self.assertRaisesRegex(ValueError,"SEMANTIC_INDEX_SOURCE_SNAPSHOT_DRIFT"):
    m.audit(dest,iter(chunks[:-1]))
   with self.assertRaisesRegex(ValueError,"SEMANTIC_MODEL_OR_INDEX_STATE_DRIFT"):
    m.search(dest,[1,0],model_hash="b"*64)
 def test_batched_embeddings_retain_three_estates_and_all_chunks(self):
  with tempfile.TemporaryDirectory() as folder:
   target=pathlib.Path(folder)/"batched.sqlite"
   rows=[source("SRC","s1","a research thread"),source("EMSTD613","e1","b research argument"),
      source("WENDBINE","reddit:t3_abcde1","c captured observation")]
   chunks=list(m.q.source_chunks(iter(rows)))
   calls=[]
   def embed_batch(texts):
    calls.append(len(texts))
    return [[1,0] for text in texts]
   report=m.build(target,iter(chunks),lambda _:(_ for _ in ()).throw(AssertionError("UNBATCHED")),
           "a"*64,embed_batch=embed_batch,batch_size=2)
   self.assertEqual(report["source_chunk_count"],4)
   self.assertEqual(calls,[2,2])
   self.assertEqual(int(m.audit(target,iter(chunks))["corpus_chunk_count"]),4)
 def test_incomplete_source_coverage_is_explicit(self):
  with tempfile.TemporaryDirectory() as folder:
   one=list(m.q.source_chunks(iter([source("SRC","s1","single")])))[0]
   with self.assertRaisesRegex(ValueError,"THREE_NONEMPTY_SOURCE_ESTATES_REQUIRED"):
    m.build(pathlib.Path(folder)/"partial.sqlite",iter([one]),lambda x:[1,0],"b"*64)
if __name__=="__main__":unittest.main()
