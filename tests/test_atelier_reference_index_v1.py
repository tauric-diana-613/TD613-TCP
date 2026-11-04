from contextlib import closing
import importlib.util, pathlib, tempfile, hashlib, sqlite3, unittest
p=pathlib.Path(__file__).resolve().parents[1]/"scripts"/"atelier-reference-index-v1.py"
s=importlib.util.spec_from_file_location("refindex",p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
def row(estate,sid,body):
 b=body.encode("utf8");title=b"Imaginary heading"
 return {"estate":estate,"source_id":sid,"source_kind":"SYNTHETIC_FIXTURE",
   "capture_id":"cap1" if estate=="WENDBINE" else None,
   "bytes":b,"sha256":hashlib.sha256(b).hexdigest(),
   "title":title,"title_sha256":hashlib.sha256(title).hexdigest()}
class ReferenceIndex(unittest.TestCase):
 def setUp(self):
  t=tempfile.TemporaryDirectory();self.addCleanup(t.cleanup)
  self.db=pathlib.Path(t.name)/"reference.sqlite"
  self.data=list(m.q.source_chunks(iter([
   row("SRC","zenodo:100","Witnessed graph claim"),
   row("EMSTD613","emsrc_1","Work identity uncertain"),
   row("WENDBINE","reddit:t3_abcde1","Traceable 𝌋 post about search")])))
  self.edges=[{"edge_id":"e1","src":"zenodo:100","dst":"emsrc_1",
    "relation_type":"TEST_CROSSWALK","projection":"RESEARCH_CANDIDATE",
    "evidence_id":"fixture:1","evidence_status":"CANDIDATE",
    "authority":"RESEARCH_ONLY"}]
 def test_reference_index_and_typed_graph(self):
  state=m.build(self.db,self.data,self.edges)
  self.assertEqual(state["record_count"],4)
  with closing(m.connect(self.db)) as con:
   self.assertEqual(m.verify(con)["records"],4)
   hits=m.search(con,"Traceable post",estate="WENDBINE")
   self.assertEqual(len(hits["results"]),1)
   record=m.get(con,hits["results"][0]["doc_id"],include_text=True)
   self.assertIn("Traceable",record["text"])
   self.assertEqual(len(m.facets(con)["by_estate"]),3)
   self.assertEqual(len(m.neighbors(con,"zenodo:100")),1)
   self.assertEqual(len(m.route(con,"zenodo:100","emsrc_1")["route"]),1)
   self.assertEqual(m.route(con,"emsrc_1","zenodo:100")["status"],
      "NO_RECORDED_PATH_NOT_SOURCE_ABSENCE")
 def test_source_mutation_and_authority_promotion_fail_closed(self):
  self.edges[0]["authority"]="SCIENTIFIC_PROMOTED"
  with tempfile.TemporaryDirectory() as folder:
   with self.assertRaisesRegex(ValueError,"UNBOUND_OR_PROMOTED_RELATION"):
    m.build(pathlib.Path(folder)/"reject.sqlite",self.data,self.edges)
 def test_mutated_source_refused(self):
  m.build(self.db,self.data)
  with closing(sqlite3.connect(self.db)) as con, con:
   con.execute("UPDATE records SET text='tampered' WHERE estate='SRC'")
  with closing(m.connect(self.db)) as con:
   with self.assertRaisesRegex(ValueError,"REFERENCE_TEXT_DIGEST_MISMATCH"):
    m.verify(con)
 def test_unicode_phrase_pages_context_reverse_and_fts_corruption(self):
  m.build(self.db,self.data,self.edges)
  with closing(m.connect(self.db)) as con:
   hits=m.search(con,"𝌋",mode="exact",estate="WENDBINE")
   self.assertEqual(hits['total'],1)
   self.assertEqual(m.search(con,"post Traceable",mode="phrase")['total'],0)
   self.assertEqual(m.search(con,"Traceable",source_id="not-the-source")['total'],0)
   packet=m.context(con,hits['results'][0]['doc_id'],max_records=1)
   self.assertEqual(len(packet['records']),1)
   self.assertEqual(len(m.cited_by(con,"emsrc_1")),1)
  with closing(sqlite3.connect(self.db)) as con,con:con.execute("DELETE FROM fts")
  with closing(m.connect(self.db)) as con:
   with self.assertRaisesRegex(ValueError,"FTS_MIRROR_MISMATCH"):m.verify(con)
 def test_typed_relation_tamper_is_not_laundered_by_valid_source_hashes(self):
  m.build(self.db,self.data,self.edges)
  with closing(sqlite3.connect(self.db)) as con,con:con.execute("UPDATE relations SET projection='CAUSAL_PROMOTED'")
  with closing(m.connect(self.db)) as con:
   with self.assertRaisesRegex(ValueError,'RELATION_DIGEST_MISMATCH'):m.verify(con)
if __name__=="__main__":unittest.main()
