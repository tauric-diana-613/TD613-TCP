import io
import json
import stat
import tempfile
import unittest
import warnings
import zipfile
from pathlib import Path
import hashlib
import importlib.util
S = importlib.util.spec_from_file_location("rulefield_intake",Path(__file__).resolve().parent.parent/"scripts/rulefield-intake.py")
m = importlib.util.module_from_spec(S); S.loader.exec_module(m)

def package(payload=b"example", path="packages/rulefield/synthetic.txt"):
    manifest={"schema":"td613.rulefield.portable-handoff/v1","source_exact_git_head":"a"*40,
        "files":[{"path":path,"size_bytes":len(payload),"sha256":hashlib.sha256(payload).hexdigest()}]}
    data=io.BytesIO()
    with zipfile.ZipFile(data,"w",zipfile.ZIP_DEFLATED) as z:
        z.writestr(path,payload)
        z.writestr("RULEFIELD_HANDOFF_MANIFEST.json",json.dumps(manifest))
        z.writestr("RULEFIELD_HANDOFF_README.md","source-free")
    return data.getvalue()

class HandoffIntakeTest(unittest.TestCase):
    def test_valid_manifest(self):
        z,ma,infos=m.open_validated(package())
        self.assertEqual(len(ma["files"]),1)
    def test_nested_one_level_artifact(self):
        outer=io.BytesIO()
        with zipfile.ZipFile(outer,"w") as z:z.writestr("handoff.zip",package())
        z,ma,infos=m.open_validated(outer.getvalue())
        self.assertEqual(len(ma["files"]),1)
    def test_tampered_data(self):
        raw=package()
        z=zipfile.ZipFile(io.BytesIO(raw))
        entries={n:z.read(n) for n in z.namelist()}
        entries["packages/rulefield/synthetic.txt"]=b"tampered"
        buf=io.BytesIO()
        with zipfile.ZipFile(buf,"w") as w:
            for n,d in entries.items():w.writestr(n,d)
        with self.assertRaisesRegex(ValueError,"HASH_MISMATCH"):m.open_validated(buf.getvalue())
    def test_path_traversal(self):
        with self.assertRaisesRegex(ValueError,"ARCHIVE_TRAVERSAL"):
            m.open_validated(package(path="packages/rulefield/../evil.txt"))
    def test_symlink(self):
        b=io.BytesIO()
        with zipfile.ZipFile(b,"w") as z:
            s=zipfile.ZipInfo("packages/rulefield/link")
            s.create_system=3;s.external_attr=(stat.S_IFLNK|0o777)<<16
            z.writestr(s,b"../evil")
            z.writestr("RULEFIELD_HANDOFF_MANIFEST.json","{}")
        with self.assertRaisesRegex(ValueError,"SYMLINK"):
            m.open_validated(b.getvalue())
    def test_duplicate_paths(self):
        b=io.BytesIO()
        with warnings.catch_warnings():
            warnings.simplefilter("ignore",UserWarning)
            with zipfile.ZipFile(b,"w") as z:
                z.writestr("packages/rulefield/a.txt","1")
                z.writestr("packages/rulefield/a.txt","2")
                z.writestr("RULEFIELD_HANDOFF_MANIFEST.json","{}")
        with self.assertRaisesRegex(ValueError,"DUPLICATE"):
            m.open_validated(b.getvalue())
    def test_quarantine_does_not_mutate_repository(self):
        z,manifest,infos=m.open_validated(package())
        with tempfile.TemporaryDirectory() as tmp:
            r=m.stage(z,manifest,Path("demo.zip"),Path(tmp),"b"*64)
            self.assertFalse(r["canonical_source_mutated"])
            self.assertTrue((Path(tmp)/("b"*20)/"RULEFIELD_INTAKE_REPORT.md").exists())

if __name__=="__main__":unittest.main()
