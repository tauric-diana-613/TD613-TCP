from contextlib import closing
import importlib.util,pathlib,tempfile,sqlite3,unittest
p=pathlib.Path(__file__).with_name("src-native-text-search-v1.py")
s=importlib.util.spec_from_file_location("native",p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class Reference(unittest.TestCase):
 def test_exact_unicode_phrase_pagination_readback_and_fts_tamper(self):
  with tempfile.TemporaryDirectory() as folder:
   root=pathlib.Path(folder)/"estate";text=root/"03-DERIVATIVES/text";text.mkdir(parents=True)
   for i,body in enumerate(["𝌋 alpha beta source","alpha distant beta","alpha beta second"]):(text/f"{i}.md").write_text(body,encoding="utf8")
   db=pathlib.Path(folder)/"index.sqlite";m.build(root,db,"SRC")
   self.assertEqual(m.search(db,"alpha beta",mode="phrase")["total"],2)
   self.assertEqual(m.search(db,"𝌋",mode="exact")["total"],1)
   pages=[m.search(db,"alpha",limit=1,offset=i)["results"][0]["source_id"] for i in range(3)]
   self.assertEqual(len(set(pages)),3)
   self.assertEqual(m.context(db,pages[0])["text"],"𝌋 alpha beta source")
   self.assertFalse(m.cite(db,pages[0])["source_origin_inferred"])
   with closing(sqlite3.connect(db)) as con,con:con.execute("DELETE FROM fts")
   with self.assertRaisesRegex(ValueError,"FTS_MIRROR_TAMPERED"):m.verify(root,db,"SRC")
if __name__=="__main__":unittest.main()
