import hashlib
import importlib.util
import json
from pathlib import Path
import sqlite3
import sys
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
def imported(name, path):
    spec=importlib.util.spec_from_file_location(name,path)
    mod=importlib.util.module_from_spec(spec)
    sys.modules[name]=mod
    spec.loader.exec_module(mod)
    return mod

adapter=imported("td613_src_method_adapter",ROOT/"scripts/atelier-src-method-adapter-v1.py")
receiver=imported("td613_qualification_receiver",ROOT/"scripts/atelier-universal-encyclopedia-receiver-v1.py")
native=imported("td613_original_src_phase2_builder",ROOT/"packages/dome_world_exact/fixtures/a15-r0/SRC/99-ADMIN/build-phase2-assays.py")


class NativeMethodAdapterTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.root=Path(self.temp.name)
        path=self.root/"05-OPERATIONS/relations/representation-lift-candidates.jsonl"
        path.parent.mkdir(parents=True)
        # The original SRC method is executed, not reimplemented by the adapter.
        lift={"transformation_id":"T-SYN-1","from_id":"SRC-FROM","to_id":"SRC-TO",
              "claim_effects":{"scope":"NARROWED","falsifiers":"MORE_SPECIFIC",
                               "semantic_core":"PRESERVED"},
              "evidence_ids":["E-SYN-1"],"origin":"SYNTHETIC",
              "adjudication_status":"SOURCE_FREE_FIXTURE"}
        path.write_text(json.dumps(lift)+"\n",encoding="utf-8")
        _, original=native.conservation_and_tomography(self.root,"SYN-SNAPSHOT")
        self.assertEqual(len(original),1)
        self.native_rows=original
        self.method_path=self.root/"tomography.jsonl"
        self.method_path.write_text("".join(json.dumps(x,ensure_ascii=False,sort_keys=True)+"\n"
                                            for x in original),encoding="utf-8")
        self.sha=hashlib.sha256(self.method_path.read_bytes()).hexdigest()
        self.bundle=adapter.load(self.method_path,snapshot="SYN-SNAPSHOT",
                                 seal_binding="RESOLVE_MATCHED_CURRENT_SEAL",
                                 expected_sha256=self.sha)

    def tearDown(self):
        self.temp.cleanup()

    def test_unchanged_native_builder_differential(self):
        self.assertEqual(self.bundle["rows"],self.native_rows)
        row=self.bundle["rows"][0]
        self.assertEqual(row["schema_version"],"claim-evidence-tomography/v1")
        self.assertEqual(row["delta_scope"],"NARROWED")
        self.assertEqual(row["delta_evidence"],"UNKNOWN")
        self.assertEqual(row["delta_asserted_authority"],"UNKNOWN")
        self.assertIsNone(row["composite_score"])

    def test_snapshot_seal_and_digest_all_required(self):
        for replace in ({"snapshot":"WRONG"},{"seal_binding":"WRONG"},
                        {"expected_sha256":"0"*64}):
            params={"snapshot":"SYN-SNAPSHOT","seal_binding":"RESOLVE_MATCHED_CURRENT_SEAL",
                    "expected_sha256":self.sha}
            params.update(replace)
            with self.assertRaises(adapter.AdapterError):
                adapter.load(self.method_path,**params)

    def test_typed_query_never_replaces_unknown_and_null(self):
        self.assertEqual(adapter.query(self.bundle,"delta_evidence","UNKNOWN")["total"],1)
        self.assertEqual(adapter.query(self.bundle,"composite_score",None)["total"],1)
        self.assertEqual(adapter.query(self.bundle,"absent_field",None)["total"],0)
        self.assertEqual(adapter.query(self.bundle,"composite_score",False)["total"],0)
        self.assertEqual(adapter.query(self.bundle,"delta_scope","NARROWED")["total"],1)
        self.assertEqual(adapter.query(self.bundle,"other_observed_effects.falsifiers",
                                       "MORE_SPECIFIC")["total"],1)

    def test_synthetic_packet_roundtrip_receiver_exact_bytes(self):
        packet=adapter.synthetic_packet(self.bundle,packet_id="SRC-SYN-PACKET",
                                        source_id="SRC-SYN",capture_id="SNAP-SYN",
                                        synthetic_only=True)
        db=self.root/"empty.sqlite"
        receiver.create(db)
        receiver.admit(db,packet)
        self.assertEqual(receiver.return_packet(db,"SRC-SYN-PACKET"),packet)
        rows=receiver.method_query(db,"delta_evidence","UNKNOWN")["rows"]
        self.assertEqual(rows[0]["method_row"],self.native_rows[0])
        self.assertEqual(receiver.state(db)["counts"]["chunks"],0)

    def test_synthetic_source_class_is_explicit_not_custody_attestation(self):
        with self.assertRaises(adapter.AdapterError):
            adapter.synthetic_packet(self.bundle,packet_id="A",source_id="S",capture_id="C")
        packet=adapter.synthetic_packet(self.bundle,packet_id="A",source_id="S",capture_id="C",
                                        synthetic_only=True)
        self.assertEqual(json.loads(packet)["source_class"],"SYNTHETIC")

    def test_holonomy_proposal_cannot_masquerade_as_native_tomography(self):
        proposal={**self.native_rows[0],"schema_version":"holonomy-tomography-crossover/v1"}
        self.method_path.write_text(json.dumps(proposal)+"\n",encoding="utf-8")
        dig=hashlib.sha256(self.method_path.read_bytes()).hexdigest()
        with self.assertRaisesRegex(adapter.AdapterError,"schema"):
            adapter.load(self.method_path,snapshot="SYN-SNAPSHOT",
                         seal_binding="RESOLVE_MATCHED_CURRENT_SEAL",expected_sha256=dig)

    def test_pagination_and_record_digests(self):
        row=self.native_rows[0]
        self.method_path.write_text("".join(json.dumps({**row,"claim_evidence_tomography_id":str(i)},
                             sort_keys=True)+"\n" for i in range(7)),encoding="utf-8")
        dig=hashlib.sha256(self.method_path.read_bytes()).hexdigest()
        bundle=adapter.load(self.method_path,snapshot="SYN-SNAPSHOT",
                            seal_binding="RESOLVE_MATCHED_CURRENT_SEAL",expected_sha256=dig)
        res=adapter.query(bundle,"delta_evidence","UNKNOWN",offset=2,limit=2)
        self.assertEqual(res["total"],7)
        self.assertTrue(res["has_more"])
        self.assertEqual([z["ordinal"] for z in res["rows"]],[2,3])

    def test_nonfinite_json_method_values_fail_closed(self):
        text=self.method_path.read_text(encoding="utf-8")
        self.assertIn('"delta_scope": "NARROWED"',text)
        self.method_path.write_text(text.replace('"delta_scope": "NARROWED"',
                                                 '"delta_scope": NaN'),encoding="utf-8")
        dig=hashlib.sha256(self.method_path.read_bytes()).hexdigest()
        with self.assertRaisesRegex(adapter.AdapterError,"Non-finite"):
            adapter.load(self.method_path,snapshot="SYN-SNAPSHOT",
                         seal_binding="RESOLVE_MATCHED_CURRENT_SEAL",expected_sha256=dig)

    def test_source_byte_tamper_refused(self):
        self.method_path.write_bytes(self.method_path.read_bytes()+b"\n")
        with self.assertRaisesRegex(adapter.AdapterError,"digest"):
            adapter.load(self.method_path,snapshot="SYN-SNAPSHOT",
                         seal_binding="RESOLVE_MATCHED_CURRENT_SEAL",expected_sha256=self.sha)


if __name__=="__main__":
    unittest.main()
