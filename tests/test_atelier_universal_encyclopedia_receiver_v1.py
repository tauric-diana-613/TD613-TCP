import hashlib
import importlib.util
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("source_free_receiver", ROOT/"scripts/atelier-universal-encyclopedia-receiver-v1.py")
import sys
MOD = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MOD
SPEC.loader.exec_module(MOD)


def fixture(source="SRC-A", capture="CAP-1", packet="PKT-1", body="𝌋 synthetic evidence",
            methods=None, relations=None):
    item = {
        "schema": MOD.PACKET_SCHEMA, "packet_id": packet, "source_class":"SYNTHETIC",
        "source_id":source, "capture_id":capture,"source_text":body,
        "source_sha256":hashlib.sha256(body.encode("utf-8")).hexdigest(),
        "method_rows": methods if methods is not None else [
            {"schema":"claim-evidence-tomography/v1","delta_scope":"UNKNOWN",
             "delta_evidence":"UNKNOWN","composite_score":None,
             "falsifier":{"held": True,"count":1},"route":"unresolved"}],
        "relations": relations if relations is not None else [
            {"type":"mentions_record","target_source_id":"SRC-Z","status":"unresolved"}]
    }
    return (json.dumps(item,ensure_ascii=False,sort_keys=True,indent=2)+"\n").encode("utf-8")


class ReceiverTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.db = Path(self.temp.name)/"empty-receiver.sqlite"
        self.zero = MOD.create(self.db)

    def tearDown(self):
        self.temp.cleanup()

    def test_zero_initial_state_is_replayable(self):
        self.assertEqual(set(self.zero["counts"]),{"sources","captures","packets",
            "method_rows","relations","chunks","vectors"})
        self.assertTrue(all(v==0 for v in self.zero["counts"].values()))
        self.assertEqual(MOD.state(self.db)["counts"], self.zero["counts"])
        with self.assertRaises(MOD.ReceiverError):
            MOD.create(self.db)

    def test_exact_raw_packet_return_and_declared_unresolved_relation(self):
        raw=fixture()
        receipt=MOD.admit(self.db,raw)
        self.assertEqual(MOD.return_packet(self.db,"PKT-1"),raw)
        self.assertEqual(receipt["packet_sha256"],hashlib.sha256(raw).hexdigest())
        self.assertEqual(MOD.state(self.db)["counts"]["relations"],1)
        self.assertEqual(MOD.state(self.db)["counts"]["chunks"],0)

    def test_separate_source_and_capture_identifiers(self):
        MOD.admit(self.db,fixture())
        MOD.admit(self.db,fixture(capture="CAP-2",packet="PKT-2",body="new capture"))
        self.assertEqual(MOD.state(self.db)["counts"]["sources"],1)
        self.assertEqual(MOD.state(self.db)["counts"]["captures"],2)
        self.assertNotEqual(MOD.return_packet(self.db,"PKT-1"),MOD.return_packet(self.db,"PKT-2"))

    def test_strict_boolean_number_null_and_nested_typed_queries(self):
        rows=[{"delta_scope":"UNKNOWN","composite_score":None,
               "nested":{"active":True,"count":1}},
              {"delta_scope":"BROADER","composite_score":0,
               "nested":{"active":False,"count":1.0}}]
        MOD.admit(self.db,fixture(methods=rows))
        self.assertEqual(MOD.method_query(self.db,"nested.active",True)["total"],1)
        self.assertEqual(MOD.method_query(self.db,"nested.active",1)["total"],0)
        self.assertEqual(MOD.method_query(self.db,"nested.count",True)["total"],0)
        self.assertEqual(MOD.method_query(self.db,"nested.count",1)["total"],1)
        self.assertEqual(MOD.method_query(self.db,"nested.count",1.0)["total"],1)
        self.assertEqual(MOD.method_query(self.db,"composite_score",None)["total"],1)
        self.assertEqual(MOD.method_query(self.db,"absent_field",None)["total"],0)
        self.assertEqual(MOD.method_query(self.db,"delta_scope","UNKNOWN")["total"],1)

    def test_tamper_detection_and_schema_drift(self):
        raw=fixture()
        MOD.admit(self.db,raw)
        with sqlite3.connect(self.db) as db:
            db.execute("UPDATE packets SET payload=? WHERE packet_id=?", (b'{"corrupt":true}',"PKT-1"))
        with self.assertRaisesRegex(MOD.ReceiverError,"SHA-256"):
            MOD.return_packet(self.db,"PKT-1")
        with self.assertRaises(MOD.ReceiverError):
            MOD.method_query(self.db,"delta_scope","UNKNOWN")

    def test_json_nonfinite_method_values_fail_closed(self):
        raw=fixture()
        self.assertIn(b'"delta_scope": "UNKNOWN"',raw)
        altered=raw.replace(b'"delta_scope": "UNKNOWN"',b'"delta_scope": NaN')
        with self.assertRaisesRegex(MOD.ReceiverError,"Non-finite"):
            MOD.admit(self.db,altered)
        self.assertEqual(MOD.state(self.db)["counts"]["packets"],0)

    def test_bad_hash_rejection_is_non_mutating(self):
        obj=json.loads(fixture())
        obj["source_sha256"]="0"*64
        with self.assertRaisesRegex(MOD.ReceiverError,"digest"):
            MOD.admit(self.db,json.dumps(obj).encode())
        self.assertEqual(MOD.state(self.db)["counts"]["packets"],0)

    def test_protected_source_classes_rejected_and_duplicate_capture_refused(self):
        raw=fixture()
        obj=json.loads(raw)
        obj["source_class"]="PROTECTED"
        with self.assertRaisesRegex(MOD.ReceiverError,"synthetic"):
            MOD.admit(self.db,json.dumps(obj).encode())
        MOD.admit(self.db,raw)
        with self.assertRaises(sqlite3.IntegrityError):
            MOD.admit(self.db,fixture(packet="PKT-2"))
        self.assertEqual(MOD.state(self.db)["counts"]["packets"],1)

    def test_duplicate_json_keys_and_symlinks_rejected(self):
        raw=b'{"schema":"first","schema":"second"}'
        with self.assertRaises(MOD.ReceiverError):
            MOD.admit(self.db,raw)
        alias=Path(self.temp.name)/"alias.sqlite"
        alias.symlink_to(self.db)
        with self.assertRaisesRegex(MOD.ReceiverError,"Symlink"):
            MOD.state(alias)

    def test_method_pagination_and_type_refusals(self):
        rows=[{"status":"UNKNOWN","index":i} for i in range(7)]
        MOD.admit(self.db,fixture(methods=rows,relations=[]))
        part=MOD.method_query(self.db,"status","UNKNOWN",offset=3,limit=2)
        self.assertEqual(part["total"],7)
        self.assertEqual([r["method_row"]["index"] for r in part["rows"]],[3,4])
        self.assertTrue(part["has_more"])
        for kwargs in ({"limit":True},{"offset":-1},{"limit":101}):
            with self.assertRaises(MOD.ReceiverError):
                MOD.method_query(self.db,"status","UNKNOWN",**kwargs)


if __name__=="__main__":
    unittest.main()
