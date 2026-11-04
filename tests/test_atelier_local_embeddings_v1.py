import importlib.util, pathlib, tempfile, json, unittest, hashlib
p=pathlib.Path(__file__).resolve().parents[1]/"scripts"/"atelier-local-embeddings-v1.py"
s=importlib.util.spec_from_file_location("emb",p)
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class LocalEmbeddings(unittest.TestCase):
 def test_stable_model_tree_and_source_hash_bindings(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=pathlib.Path(tmp);model=root/"model";model.mkdir()
   (model/"config.json").write_text('{"model":"synthetic"}',encoding="utf8")
   digest=m.local_model_fingerprint(model)
   self.assertEqual(len(digest),64)
   (model/"config.json").write_text('{"model":"different"}',encoding="utf8")
   self.assertNotEqual(digest,m.local_model_fingerprint(model))
   doc=b"Unrelated invented technical source text"
   chunks=list(m.q.source_chunks(iter([{"estate":"SRC","source_id":"s1",
     "source_kind":"SYNTHETIC","bytes":doc,"sha256":hashlib.sha256(doc).hexdigest()}])))
   dst=root/"semantic.jsonl"
   out=m.build_vectors(chunks,lambda text:[1.0,0.0],digest,dst)
   self.assertEqual(out["vectors_written"],1)
   records=[json.loads(x) for x in dst.read_text("utf8").splitlines()]
   hits=m.q.semantic([1,0],chunks,records,model_sha256=digest)
   self.assertEqual(hits[0]["source_id"],"s1")
   with self.assertRaises(FileExistsError):
    m.build_vectors(chunks,lambda text:[1,0],digest,dst)
if __name__=="__main__":unittest.main()
