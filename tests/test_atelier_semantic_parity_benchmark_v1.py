import importlib.util,pathlib,unittest
p=pathlib.Path(__file__).resolve().parents[1]/"scripts"/"atelier-semantic-parity-benchmark-v1.py"
s=importlib.util.spec_from_file_location("bench",p)
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class Bench(unittest.TestCase):
 def setUp(self):
  self.cases=[];self.ranks={}
  for estate in m.ESTATES:
   for i in range(3):
    cid=estate+str(i);sid=estate.lower()+":"+str(i)
    self.cases.append({"query_id":cid,"target_estate":estate,
      "difficulty":"VAGUE" if i==0 else "SPECIFIC","query":"synthetic",
      "relevant_source_ids":[sid],"decoy_source_ids":["bad:"+sid]})
    self.ranks[cid]=[{"estate":estate,"source_id":sid,
      "retrieval_class":"LOCAL_SEMANTIC_CANDIDATE_NO_RELATION_PROMOTION"}]
 def test_all_estates_measured_without_promoting_semantic_truth(self):
  res=m.benchmark(self.cases,self.ranks)
  self.assertFalse(res["automatic_parity_certification"])
  self.assertEqual(res["by_estate"]["SRC"]["mean_recall_at_k"],1.0)
  self.assertEqual(len(res["individual_queries"]),9)
 def test_missing_em_ranking_blocks(self):
  self.ranks.pop("EMSTD6131")
  with self.assertRaisesRegex(ValueError,"MISSING_INDEPENDENT_MODEL_RANKING"):
   m.benchmark(self.cases,self.ranks)
 def test_no_vague_gold_holds(self):
  self.cases[0]["difficulty"]="SPECIFIC"
  with self.assertRaisesRegex(ValueError,"BENCHMARK_ESTATE_COVERAGE_INSUFFICIENT"):
   m.benchmark(self.cases,self.ranks)
if __name__=="__main__":unittest.main()
