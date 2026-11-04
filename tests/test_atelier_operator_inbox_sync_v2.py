"""Adversarial source-free tests for all three issue-bound operator inboxes."""
import hashlib
import importlib.util
import json
import pathlib
import sqlite3
import tempfile
import unittest
from unittest.mock import patch
import zipfile

SRC=pathlib.Path(__file__).resolve().parents[1]/"scripts"/"atelier-operator-inbox-sync-v2.py"
s=importlib.util.spec_from_file_location("td613_operator_sync_v2",SRC)
m=importlib.util.module_from_spec(s)
s.loader.exec_module(m)

class OperatorInboxV2(unittest.TestCase):
    def setUp(self):
        tmp=tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.top=pathlib.Path(tmp.name)
        self.repo=self.top/"gitcheckout"
        self.repo.mkdir()
        self.vault=self.top/"private-vault"
        self.original_root=m.ROOT
        m.ROOT=self.repo
        self.addCleanup(setattr,m,"ROOT",self.original_root)
        for estate in m.ESTATES:
            target=m.inbox_path(estate)
            target.mkdir(parents=True)
            (target/"README.md").write_text("tracked instructions",encoding="utf8")
            (target/".gitignore").write_text("*\n!.gitignore\n!README.md\n",encoding="utf8")
    def drop(self,estate,relative,text):
        file=m.inbox_path(estate)/relative
        file.parent.mkdir(parents=True,exist_ok=True)
        if isinstance(text,bytes):file.write_bytes(text)
        else:file.write_text(text,encoding="utf8")
        return file
    def test_all_three_estates_exact_hash_and_query(self):
        for estate,issue in m.ESTATES.items():
            sample="Contextual 𝌋 divergence and layered original history"
            self.drop(estate,"example.md",sample)
            report=m.sync(estate,issue,self.vault,f"gesture-{estate}-first",
                         operator_approved=True)
            self.assertEqual(report["new_entries"],1)
            self.assertTrue(report["local_query_ready"])
            self.assertEqual(report["issue"],issue)
            query=m.query(self.vault,estate,"divergence")
            self.assertEqual(len(query["results"]),1)
            self.assertEqual(query["results"][0]["source_sha256"],
                             hashlib.sha256(sample.encode("utf8")).hexdigest())
            self.assertEqual(m.verify(self.vault,estate)["entries"],1)
            receipt=pathlib.Path(report["receipt_path"])
            self.assertTrue(receipt.is_file())
            body=json.loads(receipt.read_text("utf8"))
            self.assertEqual(body["source_readback"],"BLOB_AND_INDEX_VERIFIED")
            self.assertEqual(body["scientific_source_admission"],False)
            self.assertEqual(body["native_work_identity"],"UNADJUDICATED")
    def test_replay_refused_new_gesture_is_unchanged(self):
        self.drop("SRC","f.md","one research datum")
        first=m.sync("SRC",1675,self.vault,"gesture-SRC-replay",
                     operator_approved=True)
        with self.assertRaisesRegex(ValueError,"GESTURE_ALREADY_CONSUMED"):
            m.sync("SRC",1675,self.vault,"gesture-SRC-replay",
                   operator_approved=True)
        new=m.sync("SRC",1675,self.vault,"gesture-SRC-second",
                   operator_approved=True)
        self.assertEqual(new["new_entries"],0)
        self.assertEqual(new["unchanged_entries"],1)
    def test_mutated_original_file_creates_new_local_revision(self):
        f=self.drop("WENDBINE","captures/p1.txt","old version of source")
        m.sync("WENDBINE",1676,self.vault,"gesture-WENDBINE-first",
               operator_approved=True)
        f.write_text("new version of source",encoding="utf8")
        result=m.sync("WENDBINE",1676,self.vault,"gesture-WENDBINE-second",
                      operator_approved=True)
        self.assertEqual(result["new_entries"],1)
        self.assertEqual(m.verify(self.vault,"WENDBINE")["entries"],2)
    def test_unauthorized_wrong_issue_inside_repo_and_no_files(self):
        self.drop("SRC","f.md","test sample")
        with self.assertRaisesRegex(ValueError,"ISSUE_GATE_AND_ESTATE_MISMATCH"):
            m.sync("SRC",1676,self.vault,"gesture-no",operator_approved=True)
        with self.assertRaisesRegex(ValueError,"FRESH_EXPLICIT_OPERATOR_GESTURE_REQUIRED"):
            m.sync("SRC",1675,self.vault,"gesture-no",operator_approved=False)
        with self.assertRaisesRegex(ValueError,"PRIVATE_VAULT_MUST_BE_OUTSIDE"):
            m.sync("SRC",1675,self.repo/"private","gesture-approved-inside",
                   operator_approved=True)
        with self.assertRaisesRegex(ValueError,"INBOX_EMPTY"):
            m.sync("EMSTD613",1677,self.vault,"gesture-em-empty",
                   operator_approved=True)
    def test_symlink_inbox_not_read(self):
        outside=self.top/"outside.md"
        outside.write_text("protected",encoding="utf8")
        link=m.inbox_path("SRC")/"escape.md"
        try:link.symlink_to(outside)
        except (OSError,NotImplementedError):
            self.skipTest("Windows symlink privilege unavailable")
        with self.assertRaisesRegex(ValueError,"SYMLINK"):
            m.sync("SRC",1675,self.vault,"gesture-symlink",
                   operator_approved=True)
    def test_unreadable_format_is_preserved_not_fabricated(self):
        self.drop("EMSTD613","archive.zip",b"PK"+b"\x00"*32)
        report=m.sync("EMSTD613",1677,self.vault,"gesture-em-archive",
                      operator_approved=True)
        self.assertEqual(report["new_entries"],1)
        self.assertEqual(m.query(self.vault,"EMSTD613","research")["results"],[])
        self.assertEqual(m.verify(self.vault,"EMSTD613")["entries"],1)
        self.assertIn("BINARY_RETAINED_NO_TEXT",
              pathlib.Path(report["receipt_path"]).read_text("utf8"))
    def test_readback_detects_vault_tampering(self):
        self.drop("SRC","good.md","source hash sentinel")
        x=m.sync("SRC",1675,self.vault,"gesture-SRC-tamper",
                 operator_approved=True)
        receipt=json.loads(pathlib.Path(x["receipt_path"]).read_text("utf8"))
        sha=receipt["records"][0]["source_sha256"]
        path=self.vault/"blobs"/sha[:2]/sha
        path.write_bytes(b"tampered")
        with self.assertRaisesRegex(ValueError,"PRIVATE_SOURCE_BLOB_MISSING_OR_CHANGED"):
            m.verify(self.vault,"SRC")
    def test_utf8_docx_and_html_derivatives_without_work_identity_promotion(self):
        self.drop("EMSTD613","notes.html",
          "<html><script>PRIVATE_SCRIPT</script><p>Cyberspace ancestry</p></html>")
        z=self.drop("EMSTD613","native.docx",b"")
        with zipfile.ZipFile(z,"w") as arch:
            arch.writestr("word/document.xml",
              '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Algedonic recurrence</w:t></w:r></w:p></w:body></w:document>')
        res=m.sync("EMSTD613",1677,self.vault,"gesture-EMSTD613-docx",
                   operator_approved=True)
        self.assertEqual(res["new_entries"],2)
        self.assertEqual(len(m.query(self.vault,"EMSTD613","Algedonic")["results"]),1)
        self.assertEqual(len(m.query(self.vault,"EMSTD613","Cyberspace")["results"]),1)
        self.assertEqual(len(m.query(self.vault,"EMSTD613","PRIVATE_SCRIPT")["results"]),0)
    def test_dry_run_does_not_claim_completed_ingestion(self):
        self.drop("SRC","test.md","one source fact")
        result=m.sync("SRC",1675,self.vault,"gesture-SRC-preview",
                      operator_approved=True,dry_run=True)
        self.assertEqual(result["state"],"SOURCE_FREE_PREFLIGHT_ONLY")
        self.assertFalse(self.vault.exists())
        # Dry-run must not consume the fresh gesture.
        done=m.sync("SRC",1675,self.vault,"gesture-SRC-preview",operator_approved=True)
        self.assertEqual(done["new_entries"],1)

if __name__=="__main__":
    unittest.main()
