import importlib.util,pathlib,tempfile,unittest
p=pathlib.Path(__file__).with_name("em-native-text-search-v1.py")
s=importlib.util.spec_from_file_location("nativefts",p)
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class NativeSearch(unittest.TestCase):
 def test_search_verify_and_original_derivative_integrity(self):
  with tempfile.TemporaryDirectory() as folder:
   root=pathlib.Path(folder)/"native";f=root/"03-DERIVATIVES"/"text"/"one.md"
   f.parent.mkdir(parents=True);f.write_text("Forensic relational geometry and 𝌋",encoding="utf8")
   db=pathlib.Path(folder)/"native.sqlite"
   result=m.build(root,db,"EMSTD613")
   self.assertEqual(result["indexed_derivatives"],1)
   self.assertEqual(len(m.search(db,"geometry")["results"]),1)
   self.assertTrue(m.verify(root,db,"EMSTD613")["verified"])
   f.write_text("replaced observation",encoding="utf8")
   with self.assertRaisesRegex(ValueError,"NATIVE_SOURCE_CHECKOUT_DRIFT"):
    m.verify(root,db,"EMSTD613")
if __name__=="__main__":unittest.main()
