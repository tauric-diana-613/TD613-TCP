import importlib.util,pathlib,sys,unittest
from unittest.mock import patch
p=pathlib.Path(__file__).with_name('src-research-journey-v1.py');s=importlib.util.spec_from_file_location('journey',p);m=importlib.util.module_from_spec(s);sys.modules[s.name]=m;s.loader.exec_module(m)
class Journey(unittest.TestCase):
 def test_original_projective_chronology_and_unresolved_negative(self):
  m.projective.synthetic_self_test()
  d=m.projective.Document('1','zenodo:1','First','2026-01-01',None,'one.md',None,'Explore nonexistent rival.','Explore nonexistent rival.')
  out=m.projective.explore_observations([d])
  self.assertEqual(out[0]['observation_status'],'UNRESOLVED_MACHINE')
  self.assertEqual(out[0]['machine_candidates'],[])
 def test_boundaries_and_empty_seed_remain_empty(self):
  with self.assertRaisesRegex(ValueError,'BOUNDS'):m.explore(None,None,'vague',depth=5)
  with patch.object(m.native,'verify'),patch.object(m.native,'search',return_value={'results':[]}):
   out=m.explore(None,None,'fictional query',documents=[])
  self.assertEqual(out['events'],[]);self.assertFalse(out['automatic_relation_promotion'])
  self.assertEqual((out['formal_canon_layers'],out['experiential_reader_routes']),(9,8))
if __name__=='__main__':unittest.main()
