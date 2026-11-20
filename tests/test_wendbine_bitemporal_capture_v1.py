import datetime as dt
import hashlib
import importlib.util
import pathlib
import sqlite3
import tempfile
import unittest

SCRIPT=pathlib.Path(__file__).resolve().parents[1]/"scripts"/"wendbine-bitemporal-capture-v1.py"
spec=importlib.util.spec_from_file_location("wendbine_bitemporal",SCRIPT)
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

def unix(value):
 return int(dt.datetime.fromisoformat(value.replace("Z","+00:00")).timestamp())
def sh(text):
 return hashlib.sha256(text).hexdigest()

class BitemporalCaptureLens(unittest.TestCase):
 def setUp(self):
  t=tempfile.TemporaryDirectory()
  self.addCleanup(t.cleanup)
  self.db=pathlib.Path(t.name)/"operator-private-test.sqlite"
  with sqlite3.connect(self.db) as con:
   con.execute("CREATE TABLE sources(source_id TEXT,source_created_utc INTEGER)")
   con.execute("INSERT INTO sources VALUES(?,?)",
     ("reddit:t3_abcde1",unix("2026-09-10T00:00:00Z")))
   con.execute("""CREATE TABLE capture_versions(capture_id TEXT,source_id TEXT,
      captured_at_utc TEXT,title BLOB,selftext BLOB,title_sha256 TEXT,body_sha256 TEXT)""")
   for cid,when,body in (
     ("capture-1","2026-09-11T10:00:00Z",b"First observed text"),
     ("capture-2","2026-09-12T10:00:00Z",b"Later version with extra route")):
    title=b"Example title"
    con.execute("INSERT INTO capture_versions VALUES(?,?,?,?,?,?,?)",
      (cid,"reddit:t3_abcde1",when,title,body,sh(title),sh(body)))
 def result(self,cutoff):
  return m.observed_capture_at(self.db,"reddit:t3_abcde1",cutoff)
 def test_pre_first_capture_is_held_even_after_publication(self):
  report=self.result("2026-09-10T15:00:00Z")
  self.assertEqual(report["state"],"HELD_NOT_IN_LOCAL_CAPTURE_BY_CUTOFF")
  self.assertEqual(report["local_capture_versions_total"],2)
  self.assertEqual(report["local_capture_versions_no_later_than_cutoff"],0)
  self.assertIsNone(report["selected_capture"])
  self.assertFalse(report["historical_event_realization_proven"])
  self.assertFalse(report["historical_capture_origin_verified"])
 def test_cutoffs_select_only_observed_historical_bytes(self):
  first=self.result("2026-09-11T11:00:00Z")
  self.assertEqual(first["selected_capture"]["capture_id"],"capture-1")
  self.assertEqual(first["future_captures_excluded"],1)
  second=self.result("2026-09-12T11:00:00Z")
  self.assertEqual(second["selected_capture"]["capture_id"],"capture-2")
  self.assertFalse(second["private_source_bodies_returned"])
  self.assertNotIn("Later version",str(second))
  self.assertEqual(second["scientific_credit"],0)
 def test_bad_source_hash_refuses_all_results(self):
  with sqlite3.connect(self.db) as con:
   con.execute("UPDATE capture_versions SET selftext=? WHERE capture_id='capture-1'",
      (b"TAMPERED",))
  with self.assertRaisesRegex(ValueError,"CAPTURE_VERSION_FIELD_DIGEST_MISMATCH"):
   self.result("2026-09-13T00:00:00Z")
 def test_early_captured_timestamp_cannot_precede_source_publication(self):
  with sqlite3.connect(self.db) as con:
   con.execute("UPDATE capture_versions SET captured_at_utc=? WHERE capture_id='capture-1'",
      ("2026-09-09T10:00:00Z",))
  with self.assertRaisesRegex(ValueError,"CAPTURE_BEFORE_PUBLICATION_TIME_ANOMALY"):
   self.result("2026-09-13T00:00:00Z")
 def test_timezones_and_unknown_source_are_held(self):
  with self.assertRaisesRegex(ValueError,"UTC_TIMEZONE_REQUIRED"):
   self.result("2026-09-11T11:00:00-04:00")
  with self.assertRaisesRegex(ValueError,"UTC_TIMEZONE_REQUIRED"):
   self.result("2026-09-11T11:00:00")
  with self.assertRaisesRegex(ValueError,"TARGET_NOT_IN_LOCAL_SOURCE_REGISTRY"):
   m.observed_capture_at(self.db,"reddit:t3_zzzzz9","2026-09-13T00:00:00Z")

if __name__=="__main__":
 unittest.main()
