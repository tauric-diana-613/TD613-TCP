import pathlib,importlib.util,hashlib,unittest
p=pathlib.Path(__file__).with_name('em-motif-mechanism-control-v1.py');s=importlib.util.spec_from_file_location('firewall',p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class Firewall(unittest.TestCase):
 def packet(self):
  body='Imaginary motif 𝌋 with competing interpretation'.encode('utf8');piece=b'Imaginary motif'
  return body,{'spans':[{'source_id':'fiction','sha256':hashlib.sha256(body).hexdigest(),'byte_offset':0,'length_utf8':len(piece),'span_sha256':hashlib.sha256(piece).hexdigest()}]}
 def test_motif_and_hostile_alternative_do_not_certify_mechanism(self):
  body,p=self.packet();out=m.assess(p,{'fiction':body});self.assertEqual(out['classification'],'MOTIF_MATCH');self.assertFalse(out['mechanism_supported'])
  p.update(structural_mapping={k:['fictional observation'] for k in ['entities','operators','boundary_conditions','predicted_consequences']},field_generic_alternatives=['common engineering vocabulary'],non_metaphorical_mechanism='candidate feedback loop',discriminating_observation='unperformed measurement',work_identity_sensitivity={'collapse':1,'split':2})
  out=m.assess(p,{'fiction':body});self.assertEqual(out['classification'],'STRUCTURAL_ANALOGY_CANDIDATE');self.assertFalse(out['automatic_promotion'])
 def test_wrong_source_and_invented_passage_are_rejected(self):
  body,p=self.packet()
  with self.assertRaisesRegex(ValueError,'SOURCE_ANATOMY_DIGEST'):m.assess(p,{'fiction':body+b'changed'})
  p['spans'][0]['span_sha256']='0'*64
  with self.assertRaisesRegex(ValueError,'SPAN_DIGEST'):m.assess(p,{'fiction':body})
if __name__=='__main__':unittest.main()
