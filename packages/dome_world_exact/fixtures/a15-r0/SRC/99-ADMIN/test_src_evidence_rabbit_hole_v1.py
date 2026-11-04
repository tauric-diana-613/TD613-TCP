import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("src_evidence_rabbit_hole",HERE/"src-evidence-rabbit-hole-v1.py")
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

class NativeSRCExploration(unittest.TestCase):
    def setUp(self):
        temp=tempfile.TemporaryDirectory();self.addCleanup(temp.cleanup)
        self.root=Path(temp.name)
        records={
          m.EDGE_PATH:[
            {"edge_id":"e1","from_id":"A","to_id":"B","relation":"FORMALIZES",
             "graph_kind":"CONCEPTUAL","evidence_ids":["ev1"],"adjudication_status":"WITNESSED"},
            {"edge_id":"e2","from_id":"B","to_id":"C","relation":"USES",
             "graph_kind":"METHOD","evidence_ids":["ev2"],"adjudication_status":"WITNESSED"},
            {"edge_id":"e3","from_id":"A","to_id":"D","relation":"POSSIBLY_INFORMS",
             "graph_kind":"PROVENANCE","evidence_ids":[],"adjudication_status":"UNRESOLVED"},
            {"edge_id":"e4","from_id":"C","to_id":"A","relation":"RETURN",
             "graph_kind":"CONCEPTUAL","evidence_ids":["ev4"],"adjudication_status":"WITNESSED"}
          ],
          m.ROLE_PATH:[
            {"contextual_role_assertion_id":"role1","subject_id":"A","architecture_id":"Z",
             "role_normalized":"CANDIDATE_INPUT","scope":{"slot":"one"},
             "evidence_ids":["role_ev1"],"observation_status":"WITNESSED"}
          ],
          m.MAP_PATH:[
            {"map_manifestation_id":"A","snapshot_id":"s1","nodes":[1,2],
             "edges":[],"evidence_ids":["map1"],
             "enumeration_completeness":"METADATA_ONLY_PARTIAL"}
          ]
        }
        for rel,rows in records.items():
            f=self.root/rel;f.parent.mkdir(parents=True,exist_ok=True)
            f.write_text("".join(json.dumps(x)+"\n" for x in rows),encoding="utf8")
    def test_bounded_two_step_cross_stratum_never_lifts_to_new_edge(self):
        out=m.explore(self.root,"A",depth=2)
        self.assertEqual([x["edge_id"] for x in out["witnessed_typed_routes"]],["e1","e2"])
        self.assertEqual(out["witnessed_typed_routes"][1]["path_length"],2)
        self.assertTrue(out["witnessed_typed_routes"][1]["stratum_change_requires_new_witness"])
        self.assertFalse(out["witnessed_typed_routes"][1]["candidate_direct_relation_admitted"])
        self.assertEqual(out["witnessed_typed_routes"][0]["graph_kind"],"CONCEPTUAL")
        self.assertEqual(out["witnessed_typed_routes"][1]["graph_kind"],"METHOD")
        self.assertEqual(len(out["held_typed_routes"]),1)
        self.assertEqual(out["contextual_roles"][0]["scope"],{"slot":"one"})
        self.assertEqual(out["canon_map_observations"][0]["edge_count"],0)
        self.assertIn("SEEK_INDEPENDENT_DIRECT_EDGE_WITNESS_FOR_MULTI_HOP_CANDIDATE",out["candidate_next_tests"])
        self.assertFalse(out["heterostratigraphic_synthesis_proven"])
    def test_root_missing_and_unknown_node_fail_closed(self):
        out=m.explore(self.root,"never-observed")
        self.assertEqual(out["witnessed_typed_routes"],[])
        self.assertIn("NO_OUTGOING_EDGE_RECORDED_DO_NOT_INFER_ABSENCE_FROM_CORPUS",out["candidate_next_tests"])
        with self.assertRaisesRegex(ValueError,"SRC_DEPTH_BOUNDED"):
            m.explore(self.root,"A",depth=8)
        with self.assertRaisesRegex(ValueError,"SRC_LIMIT_BOUNDED"):
            m.explore(self.root,"A",limit=0)
        with self.assertRaisesRegex(ValueError,"SRC_ABSOLUTE_NATIVE_ROOT_REQUIRED"):
            m.explore(Path("not-absolute"),"A")
    def test_modified_registry_fingerprint_changes(self):
        before=m.explore(self.root,"A")["registry_sha256"]["typed_edges"]
        with (self.root/m.EDGE_PATH).open("a",encoding="utf8") as stream:
            stream.write(json.dumps({"edge_id":"new","from_id":"A","to_id":"E",
                "graph_kind":"EMPIRICAL","relation":"CONTRADICTS",
                "adjudication_status":"UNRESOLVED","evidence_ids":[]})+"\n")
        after=m.explore(self.root,"A")["registry_sha256"]["typed_edges"]
        self.assertNotEqual(before,after)
    def test_disagreement_shuffle_and_role_withdrawal_do_not_resolve_science(self):
        file=self.root/m.EDGE_PATH
        rows=[json.loads(x) for x in file.read_text('utf8').splitlines()]
        rows.append({'edge_id':'opposed','from_id':'A','to_id':'B','relation':'DISAGREES_WITH_FORMALIZATION','graph_kind':'CONCEPTUAL','evidence_ids':['synthetic-opposing-span'],'adjudication_status':'WITNESSED'})
        file.write_text(''.join(json.dumps(x)+'\n' for x in reversed(rows)),'utf8')
        (self.root/m.ROLE_PATH).write_text('','utf8')
        out=m.explore(self.root,'A',depth=2)
        relations={e['relation'] for e in out['witnessed_typed_routes']}
        self.assertIn('FORMALIZES',relations);self.assertIn('DISAGREES_WITH_FORMALIZATION',relations)
        self.assertEqual(out['contextual_roles'],[])
        self.assertFalse(out['heterostratigraphic_synthesis_proven'])
        self.assertTrue(all(not e['candidate_direct_relation_admitted'] for e in out['witnessed_typed_routes']))
if __name__=="__main__":unittest.main()
