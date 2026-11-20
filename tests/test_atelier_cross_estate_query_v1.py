import hashlib, importlib.util, pathlib, unittest
spec=importlib.util.spec_from_file_location("cross",pathlib.Path(__file__).resolve().parents[1]/"scripts"/"atelier-cross-estate-query-v1.py")
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def h(b):return hashlib.sha256(b).hexdigest()
def row(estate,sid,body):
 b=body.encode("utf8");title=b"title"
 return {"estate":estate,"source_id":sid,"bytes":b,"sha256":h(b),
         "title":title,"title_sha256":h(title),"source_kind":"SYNTHETIC",
         "capture_id":"cap1" if estate=="WENDBINE" else None}
class QueryContract(unittest.TestCase):
 def setUp(self):
  self.rows=[row("SRC","src:1","context governance"),row("EMSTD613","emsrc:1","identity mechanisms"),
             row("WENDBINE","reddit:t3_abcde1","archive 𝌋 provenance")]
  self.chunks=list(m.source_chunks(iter(self.rows)))
 def test_source_provenance_and_lexical(self):
  hits=m.lexical("archive provenance",self.chunks)
  self.assertEqual(hits[0]["estate"],"WENDBINE")
  self.assertEqual(hits[0]["capture_id"],"cap1")
 def test_semantic_adapter_uses_only_verified_vectors(self):
  model="a"*64
  indexed=[{"chunk_id":c["chunk_id"],"chunk_sha256":c["chunk_sha256"],
            "source_sha256":c["source_sha256"],"model_sha256":model,
            "vector":[1,0] if c["estate"]=="EMSTD613" else [0,1]} for c in self.chunks]
  top=m.semantic([1,0],self.chunks,indexed,model_sha256=model)
  self.assertEqual(top[0]["estate"],"EMSTD613")
  self.assertFalse(top[0]["semantic_relation_proven"])
  indexed[0]["source_sha256"]="0"*64
  with self.assertRaises(ValueError):m.semantic([1,0],self.chunks,indexed,model_sha256=model)
 def test_unknown_semantic_quality_remains_unverified(self):
  self.assertFalse(m.probe("why systems remember",self.chunks)["automatic_crosswalk_admitted"])
if __name__=="__main__":unittest.main()
