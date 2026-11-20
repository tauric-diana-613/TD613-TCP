from contextlib import closing
import importlib.util,json,pathlib,tempfile,unittest
p=pathlib.Path(__file__).resolve().parents[1]/'scripts/atelier-native-reference-relations-v1.py'
s=importlib.util.spec_from_file_location('nativegraph',p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class NativeGraph(unittest.TestCase):
 def test_unassigned_manifestation_never_becomes_a_work(self):
  with tempfile.TemporaryDirectory() as folder:
   root=pathlib.Path(folder);src=root/'SRC';em=root/'EMSTD613'
   tables=[(src,'05-OPERATIONS/relations/typed-edges.jsonl',[{'edge_id':'e1','from_id':'a','to_id':'b','graph_kind':'CONTEXT','relation':'USES','evidence_ids':['fixture']}]),(em,'03-DERIVATIVES/derivative-index.jsonl',[]),(em,'01-MANIFESTS/work-manifestations.jsonl',[{'source_file_id':'wrapper','work_id':None,'relation':'EXCLUDED_NON_SUBSTANTIVE'}])]
   for base,rel,rows in tables:
    f=base/rel;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(''.join(json.dumps(r)+'\n' for r in rows),'utf8')
   edges=list(m.relations(src,em,[]))
   self.assertEqual(edges[0]['projection'],'SRC::CONTEXT')
   self.assertEqual(edges[1]['projection'],'EMSTD613::UNASSIGNED_NOT_A_WORK')
   self.assertIsNone(edges[1]['native_record']['work_id'])
   self.assertEqual(edges[1]['evidence_status'],'CANDIDATE')
if __name__=='__main__':unittest.main()
