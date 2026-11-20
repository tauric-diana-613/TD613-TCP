import importlib.util, pathlib, unittest
p=pathlib.Path(__file__).resolve().parents[1]/"scripts"/"atelier-four-estate-readiness-gate-v1.py"
s=importlib.util.spec_from_file_location("gate",p);g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
def sample():
 return {"schema":"td613.atelier-four-estate-evidence/v1",
    "estates":{k:{"git_head":"0"*40,"checks":{x:"VERIFIED_ON_REAL_CORPUS" for x in g.TESTS},
       "observed_source_count":12,"human_reviewed_evidence_ids":["independent:1"],
       "forensic_source_origin_proven":False} for k in g.ESTATES},
    "td613_encyclopedia_source":{"observed_source_count":1,"source_index_readback_verified":True,
      "source_provenance_checked":True,"matched_recipient_contract":True},
    "receivers":{k:{"empty_source_admission":True,"replayable_zero_source_receipt":True,
      "has_auto_promote":False} for k in ("UNIVERSAL_ENCYCLOPEDIA","UNIVERSAL_ATELIER")},
    "reciprocal_probes":{k:{"distinct_send_return_routes":True,
       "preregistered_matched_control":True,"source_admission_approval":True}
       for k in ("WENDBINE_TO_UNIVERSAL_ENCYCLOPEDIA",
                 "TD613_ENCYCLOPEDIA_TO_UNIVERSAL_ATELIER")}}
class FailClosed(unittest.TestCase):
 def test_missing_semantic_wendbine_keeps_both_flights_held(self):
  x=sample();x["estates"]["WENDBINE"]["checks"]["VAGUE_TO_SPECIFIC_SEMANTIC"]="UNTESTED"
  out=g.check_report(x)
  self.assertEqual(out["disposition"],"HELD_PARITY_NOT_REALIZED")
  self.assertIn("VAGUE_TO_SPECIFIC_SEMANTIC",out["blocks"]["WENDBINE"])
 def test_submitted_evidence_only_produces_candidate_not_execution(self):
  out=g.check_report(sample())
  self.assertIn("CANDIDATE",out["disposition"])
  self.assertTrue(out["does_not_admit_sources_or_initialize_flight"])
 def test_empty_receiver_and_dubious_provenance_fail_closed(self):
  x=sample();x["receivers"]["UNIVERSAL_ENCYCLOPEDIA"]["empty_source_admission"]=False
  self.assertIn("UNIVERSAL_ENCYCLOPEDIA",g.check_report(x)["blocks"])
  x=sample();x["estates"]["SRC"]["forensic_source_origin_proven"]=True
  with self.assertRaisesRegex(ValueError,"UNSUPPORTED_SOURCE_ORIGIN_ASSERTION"):
   g.check_report(x)
if __name__=="__main__":unittest.main()
