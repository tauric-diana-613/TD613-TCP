import importlib.util, pathlib, tempfile, json, unittest
p=pathlib.Path(__file__).with_name("em-work-route-v1.py")
s=importlib.util.spec_from_file_location("emroute",p)
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class WorkRoute(unittest.TestCase):
 def test_work_manifestation_source_roundtrip(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=pathlib.Path(tmp)
   entries={
    "work":[{"work_id":"emwork_1","identity_status":"SAME_WORK_SUPPORTED","manifestation_source_file_ids":["emsrc_1"]}],
    "links":[{"work_id":"emwork_1","source_file_id":"emsrc_1","human_gate_required":True,"identity_status":"SAME_WORK_SUPPORTED","evidence":{"source_sha256":"a"*64}}],
    "sources":[{"source_file_id":"emsrc_1","sha256":"a"*64}],
    "derivatives":[{"source_file_id":"emsrc_1","extraction_status":"EXTRACTED_NATIVE_TEXT"}]}
   for key,rel in m.TABLES.items():
    q=root/rel;q.parent.mkdir(parents=True,exist_ok=True)
    q.write_text("".join(json.dumps(x)+"\n" for x in entries[key]),encoding="utf8")
   out=m.route(root,"emwork_1")
   self.assertEqual(out["manifestations"][0]["source_id"],"emsrc_1")
   self.assertEqual(out["manifestations"][0]["extractions"],["EXTRACTED_NATIVE_TEXT"])
   self.assertFalse(out["lineage_proven"])
   self.assertEqual(m.route(root,"emwork_missing")["status"],"UNRESOLVED_WORK_ID")
if __name__=="__main__":unittest.main()
