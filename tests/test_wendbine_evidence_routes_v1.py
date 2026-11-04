import hashlib, importlib.util, pathlib, sqlite3, tempfile, unittest
p=pathlib.Path(__file__).resolve().parents[1]/"scripts"/"wendbine-evidence-routes-v1.py"
s=importlib.util.spec_from_file_location("wendroutes",p)
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
def h(b):return hashlib.sha256(b).hexdigest()
class Routes(unittest.TestCase):
 def setUp(self):
  t=tempfile.TemporaryDirectory();self.addCleanup(t.cleanup)
  self.db=pathlib.Path(t.name)/"example.sqlite"
  with sqlite3.connect(self.db) as con:
   con.execute("CREATE TABLE sources(source_id TEXT)")
   con.execute("INSERT INTO sources VALUES('reddit:t3_abcde1')")
   con.execute("INSERT INTO sources VALUES('reddit:t3_abcde2')")
   con.execute("CREATE TABLE capture_versions(capture_id TEXT,source_id TEXT,captured_at_utc TEXT,title BLOB,selftext BLOB,title_sha256 TEXT,body_sha256 TEXT)")
   for i,b in enumerate(["Intro 𝌋. Explore narrative topology. See https://www.reddit.com/r/Wendbine/comments/abcde2/","Later capture with no extra links"]):
    body=b.encode("utf8");title=b"Example"
    con.execute("INSERT INTO capture_versions VALUES(?,?,?,?,?,?,?)",
       ("capture"+str(i),"reddit:t3_abcde1","2026-10-01T00:00:00Z",
        title,body,h(title),h(body)))
 def test_explicit_link_and_explore_are_candidates(self):
  out=m.observation_routes(self.db,"reddit:t3_abcde1")
  self.assertEqual(out["observed_capture_versions"],2)
  self.assertEqual(out["routes_total"],2)
  self.assertEqual(set(x["relation_type"] for x in out["observed_routes"]),
                   {"EXPLICIT_POST_LINK","EXPLICIT_EXPLORE_CUE"})
  link=next(x for x in out["observed_routes"] if x["relation_type"]=="EXPLICIT_POST_LINK")
  self.assertEqual(link["destination_id"],"reddit:t3_abcde2")
  self.assertTrue(link["destination_in_local_index"])
  self.assertFalse(link["direct_relation_promotion"])
  self.assertFalse(out["scientific_promotion"])
 def test_tampering_blocks_results(self):
  with sqlite3.connect(self.db) as con:
   con.execute("UPDATE capture_versions SET selftext=? WHERE capture_id='capture0'",(b"changed",))
  with self.assertRaisesRegex(ValueError,"SOURCE_CAPTURE_HASH_CHANGED"):
   m.observation_routes(self.db,"reddit:t3_abcde1")
 def test_bounded_and_unknown(self):
  out=m.observation_routes(self.db,"reddit:t3_zzzzz9")
  self.assertEqual(out["observed_capture_versions"],0)
  with self.assertRaises(ValueError):m.observation_routes(self.db,"bad-id")
if __name__=="__main__":unittest.main()
