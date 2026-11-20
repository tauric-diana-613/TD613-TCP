import importlib.util,json,pathlib,tempfile,hashlib,unittest
p=pathlib.Path(__file__).resolve().parents[1]/"scripts"/"atelier-source-crosswalk-v1.py"
s=importlib.util.spec_from_file_location("xwalk",p)
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class Crosswalk(unittest.TestCase):
 def test_em_uncertain_work_and_src_derivative_and_wendbine_capture(self):
  with tempfile.TemporaryDirectory() as temp:
   root=pathlib.Path(temp)
   for rel,rows in (
    (m.EM_DERIV,[{"source_file_id":"emsrc_1",
      "derivative_relative_path":"03-DERIVATIVES/text/emsrc_1.txt",
      "derivative_sha256":"a"*64}]),
    (m.EM_LINKS,[{"source_file_id":"emsrc_1","work_id":"emwork_1",
      "relation":"MANIFESTATION_OF","identity_status":"SAME_WORK_SUPPORTED",
      "human_gate_required":True}])):
    file=root/rel;file.parent.mkdir(parents=True,exist_ok=True)
    file.write_text("".join(json.dumps(x)+"\n" for x in rows),encoding="utf8")
   hits=[{"estate":"EMSTD613","source_id":"derivative:03-DERIVATIVES/text/emsrc_1.txt",
     "source_sha256":"a"*64,"source_field":"body","byte_offset":1},
     {"estate":"SRC","source_id":"derivative:03-DERIVATIVES/text/zenodo/zenodo-18827727-file-0.md",
       "source_sha256":"b"*64},
     {"estate":"WENDBINE","source_id":"reddit:t3_abcde1","capture_id":"cap1",
       "source_sha256":"c"*64}]
   out=m.annotate(hits,root)
   self.assertEqual(out["results"][0]["candidate_works"][0]["work_id"],"emwork_1")
   self.assertTrue(out["results"][0]["candidate_works"][0]["human_gate_required"])
   self.assertEqual(out["results"][1]["candidate_native_entity_id"],"zenodo:18827727")
   self.assertEqual(out["results"][2]["capture_id"],"cap1")
   self.assertFalse(out["scientific_promotion"])
   hits[0]["source_sha256"]="d"*64
   with self.assertRaisesRegex(ValueError,"EM_DERIVATIVE_NOT_BOUND"):
    m.annotate(hits,root)
if __name__=="__main__":unittest.main()
