#!/usr/bin/env python3
"""𝌋 TD613 Operator Inbox Sync V2 — local-only, issue-bound, fail-closed.

Moves operator-selected files from an ignored local Atelier inbox into a
separately controlled private vault. Builds a real SQLite FTS5 text index and
reads back exact copied bytes before recording a receipt. No network calls.
This does not sync remote providers, certify original authorship, decide Em
Work identities, or enter SRC canon. Issue authorization is an operator
attestation, not a cryptographic proof of chat identity.
"""
from __future__ import annotations
import argparse
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sqlite3
import sys
import uuid
import zipfile
from xml.etree import ElementTree
from datetime import datetime, timezone

ESTATES={"SRC":1675, "WENDBINE":1676, "EMSTD613":1677}
ROOT=Path(__file__).resolve().parents[1]
INBOX_PARTS=("packages","dome_world_exact","fixtures","a15-r0")
ALLOWED={".txt",".md",".markdown",".csv",".json",".jsonl",".html",".htm",
         ".pdf",".docx",".zip",".png",".jpg",".jpeg",".webp",".mp3",".mp4"}
PLAIN={".txt",".md",".markdown",".csv",".json",".jsonl"}
MAX_FILES=200
MAX_BYTES=32*1024*1024
MAX_TOTAL=256*1024*1024
MAX_TEXT=12*1024*1024

def digest(raw):
    return hashlib.sha256(raw).hexdigest()

def checked_local(path):
    p=Path(path)
    if not p.is_absolute():
        raise ValueError("ABSOLUTE_LOCAL_PATH_REQUIRED")
    if p.is_symlink() or any(x.is_symlink() for x in p.parents if x.exists()):
        raise ValueError("SYMLINKED_PATH_REFUSED")
    return p

def ensure_outside_repository(vault):
    vault=checked_local(vault)
    resolved=vault.resolve(strict=False)
    repo=checked_local(ROOT).resolve(strict=True)
    if resolved==repo or repo in resolved.parents:
        raise ValueError("PRIVATE_VAULT_MUST_BE_OUTSIDE_GIT_REPOSITORY")
    if vault.exists() and not vault.is_dir():
        raise ValueError("PRIVATE_VAULT_MUST_BE_DIRECTORY")
    return vault

def inbox_path(estate):
    if estate not in ESTATES:raise ValueError("UNKNOWN_NATIVE_ATELIER")
    return checked_local(ROOT.joinpath(*INBOX_PARTS,estate,"07-OPERATOR-INBOX"))

def enumerate_inbox(folder):
    folder=checked_local(folder)
    if not folder.is_dir():
        raise ValueError("LOCAL_INBOX_MISSING")
    found=[];total=0
    for parent,dirs,files in os.walk(folder,followlinks=False):
        dirs.sort();files.sort()
        for d in dirs:
            if (Path(parent)/d).is_symlink():
                raise ValueError("INBOX_DIRECTORY_SYMLINK_REFUSED")
        for name in files:
            p=Path(parent)/name
            rel=p.relative_to(folder)
            if p.is_symlink() or not p.is_file():
                raise ValueError("INBOX_FILE_SYMLINK_OR_SPECIAL_FILE_REFUSED")
            if name in (".gitignore","README.md") and p.parent==folder:
                continue
            if name.startswith(".") or name.endswith(".tmp"):
                continue
            if p.suffix.lower() not in ALLOWED:
                raise ValueError("UNSUPPORTED_INBOX_EXTENSION:"+p.suffix.lower())
            size=p.stat().st_size
            if size>MAX_BYTES or size==0:
                raise ValueError("INBOX_SOURCE_EMPTY_OR_OVERSIZE")
            total+=size
            if total>MAX_TOTAL:raise ValueError("INBOX_TOTAL_BYTE_BOUND")
            found.append((p,rel.as_posix()))
            if len(found)>MAX_FILES:
                raise ValueError("INBOX_FILE_COUNT_BOUND")
    return found

class TextOnlyHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.inside=0;self.items=[]
    def handle_starttag(self,tag,attrs):
        if tag in ("script","style","template"):self.inside+=1
    def handle_endtag(self,tag):
        if tag in ("script","style","template") and self.inside:self.inside-=1
    def handle_data(self,text):
        if not self.inside:self.items.append(text)

def extract(raw,suffix):
    """Returns (text, status). Extraction is a derivative, not a source claim."""
    if suffix in PLAIN:
        value=raw.decode("utf-8-sig",errors="strict")
        return value[:MAX_TEXT],("TEXT_EXTRACTED" if len(value)<=MAX_TEXT else "TEXT_TRUNCATED")
    if suffix in (".html",".htm"):
        parser=TextOnlyHTML()
        parser.feed(raw.decode("utf-8-sig",errors="strict"))
        value=" ".join(parser.items)
        return value[:MAX_TEXT],("HTML_EXTRACTED" if len(value)<=MAX_TEXT else "TEXT_TRUNCATED")
    if suffix==".docx":
        with zipfile.ZipFile(__import__("io").BytesIO(raw)) as archive:
            doc=archive.getinfo("word/document.xml")
            if doc.file_size>MAX_TEXT*2 or doc.compress_size==0:
                return "","DOCX_EXPANSION_BOUND_HELD"
            blob=archive.read(doc)
        root=ElementTree.fromstring(blob)
        text=" ".join(x.text or "" for x in root.iter()
                 if x.tag.endswith("}t"))
        return text[:MAX_TEXT],("DOCX_EXTRACTED" if len(text)<=MAX_TEXT else "TEXT_TRUNCATED")
    if suffix==".pdf":
        try:
            import pypdf
        except ImportError:
            return "","PDF_REQUIRES_LOCAL_PYPDF"
        reader=pypdf.PdfReader(__import__("io").BytesIO(raw))
        if reader.is_encrypted:
            return "","PDF_ENCRYPTED_HELD"
        pages=[];used=0
        for page in reader.pages:
            part=page.extract_text() or ""
            used+=len(part)
            if used>MAX_TEXT:
                return "\n".join(pages)[:MAX_TEXT],"TEXT_TRUNCATED"
            pages.append(part)
        return "\n".join(pages),"PDF_TEXT_EXTRACTED"
    return "","BINARY_RETAINED_NO_TEXT"

def open_db(vault):
    path=checked_local(vault/"atelier-index.sqlite")
    con=sqlite3.connect(path)
    con.execute("PRAGMA busy_timeout=5000")
    con.execute("PRAGMA foreign_keys=ON")
    con.executescript("""
      CREATE TABLE IF NOT EXISTS entries (
       record_id TEXT PRIMARY KEY,estate TEXT NOT NULL,issue_number INTEGER NOT NULL,
       original_filename TEXT NOT NULL,relative_path TEXT NOT NULL,
       source_sha256 TEXT NOT NULL,source_bytes INTEGER NOT NULL,
       source_id TEXT NOT NULL,source_attribution TEXT NOT NULL,
       extraction_status TEXT NOT NULL,derivative_sha256 TEXT NOT NULL,
       full_text TEXT NOT NULL,gesture_id TEXT NOT NULL);
      CREATE VIRTUAL TABLE IF NOT EXISTS fts
       USING fts5(record_id UNINDEXED,full_text,tokenize='unicode61 remove_diacritics 0');
      CREATE TABLE IF NOT EXISTS gestures (
       gesture_id TEXT PRIMARY KEY,estate TEXT NOT NULL,issue_number INTEGER NOT NULL,
       run_at TEXT NOT NULL,receipt_sha256 TEXT NOT NULL);
    """)
    return con

def save_blob(vault,raw,hashhex):
    target=vault/"blobs"/hashhex[:2]/hashhex
    target.parent.mkdir(parents=True,exist_ok=True)
    checked_local(target)
    if target.exists():
        if digest(target.read_bytes())!=hashhex:
            raise ValueError("EXISTING_VAULT_BLOB_HASH_DISAGREES")
    else:
        try:
            with target.open("xb") as stream:
                stream.write(raw)
                stream.flush();os.fsync(stream.fileno())
        except FileExistsError:
            if digest(target.read_bytes())!=hashhex:
                raise ValueError("CONCURRENT_VAULT_BLOB_HASH_DISAGREES")
    if digest(target.read_bytes())!=hashhex:
        raise ValueError("POST_COPY_BLOB_READBACK_FAILED")
    return target

def sync(estate,issue,vault,gesture,*,operator_approved=False,dry_run=False):
    if estate not in ESTATES or issue!=ESTATES[estate]:
        raise ValueError("ISSUE_GATE_AND_ESTATE_MISMATCH")
    if not operator_approved or not isinstance(gesture,str) or not 8<=len(gesture)<=160:
        raise ValueError("FRESH_EXPLICIT_OPERATOR_GESTURE_REQUIRED")
    if any(c.isspace() for c in gesture):
        raise ValueError("GESTURE_ID_MUST_BE_SINGLE_TOKEN")
    folder=inbox_path(estate)
    files=enumerate_inbox(folder)
    if not files:
        raise ValueError("INBOX_EMPTY_NOT_A_SUCCESSFUL_SYNC")
    vault=ensure_outside_repository(vault)
    results=[];bytes_total=0
    for src,relative in files:
        raw=src.read_bytes()
        if len(raw)>MAX_BYTES or not raw or len(raw)!=src.stat().st_size:
            raise ValueError("INBOX_SOURCE_CHANGED_DURING_READ")
        hashhex=digest(raw)
        text,status=extract(raw,src.suffix.lower())
        # A local file is not an observed provider record or an identified Work.
        record_id="localfile:"+digest(json.dumps(
            [estate,relative,hashhex],ensure_ascii=False,separators=(",",":")).encode("utf8"))
        results.append({"record_id":record_id,"estate":estate,"issue_number":issue,
          "relative_path":relative,"original_filename":src.name,"bytes":len(raw),
          "source_sha256":hashhex,"source_id":"operator-local:"+hashhex,
          "source_attribution":"OPERATOR_UPLOADED_NOT_PROVIDER_AUTHENTICATED",
          "extraction_status":status,
          "derivative_sha256":digest(text.encode("utf8")),"full_text":text,
          "_raw":raw})
        bytes_total+=len(raw)
    if dry_run:
        return {"state":"SOURCE_FREE_PREFLIGHT_ONLY","estate":estate,"issue":issue,
            "files":[{k:v for k,v in o.items() if k not in ("_raw","full_text")}
                     for o in results],
            "operator_approval_not_consumed":True}
    vault.mkdir(parents=True,exist_ok=True)
    # Prevent source bytes being silently placed inside git after mkdir.
    vault=ensure_outside_repository(vault)
    con=open_db(vault)
    try:
        if con.execute("SELECT 1 FROM gestures WHERE gesture_id=?",(gesture,)).fetchone():
            raise ValueError("GESTURE_ALREADY_CONSUMED")
        for obj in results:
            save_blob(vault,obj["_raw"],obj["source_sha256"])
        con.execute("BEGIN IMMEDIATE")
        inserted=0;unchanged=0
        for obj in results:
            if con.execute("SELECT 1 FROM entries WHERE record_id=?",
                           (obj["record_id"],)).fetchone():
                unchanged+=1
                continue
            con.execute("INSERT INTO entries VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
              (obj["record_id"],estate,issue,obj["original_filename"],
               obj["relative_path"],obj["source_sha256"],obj["bytes"],
               obj["source_id"],obj["source_attribution"],obj["extraction_status"],
               obj["derivative_sha256"],obj["full_text"],gesture))
            if obj["full_text"]:
                con.execute("INSERT INTO fts(record_id,full_text) VALUES(?,?)",
                            (obj["record_id"],obj["full_text"]))
            inserted+=1
        # Verify exact copied bytes and extracted text from persisted storage.
        for obj in results:
            srcpath=vault/"blobs"/obj["source_sha256"][:2]/obj["source_sha256"]
            if digest(srcpath.read_bytes())!=obj["source_sha256"]:
                raise ValueError("VAULT_BLOB_READBACK_FAILURE")
            row=con.execute(
                "SELECT source_sha256,derivative_sha256,full_text FROM entries WHERE record_id=?",
                (obj["record_id"],)).fetchone()
            if not row or row[0]!=obj["source_sha256"] or \
                 row[1]!=digest(row[2].encode("utf8")):
                raise ValueError("INDEX_SOURCE_READBACK_FAILURE")
        receipt={"schema":"td613.operator-local-sync/v2","estate":estate,
            "issue_number":issue,"gesture_id":gesture,
            "run_at":datetime.now(timezone.utc).isoformat(),
            "files_seen":len(files),"new_entries":inserted,"unchanged_entries":unchanged,
            "bytes_read":bytes_total,
            "source_readback":"BLOB_AND_INDEX_VERIFIED",
            "source_provenance":"OPERATOR_LOCAL_FILE_NOT_PROVIDER_AUTHENTICATED",
            "native_work_identity":"UNADJUDICATED",
            "scientific_source_admission":False,
            "provider_remote_sync_performed":False,
            "original_files_left_unmodified":True,
            "index_location":"PRIVATE_VAULT_SQLITE",
            "records":[{k:v for k,v in obj.items()
                        if k not in ("_raw","full_text")} for obj in results]}
        payload=json.dumps(receipt,ensure_ascii=False,sort_keys=True,indent=2).encode("utf8")
        con.execute("INSERT INTO gestures VALUES(?,?,?,?,?)",
                    (gesture,estate,issue,receipt["run_at"],digest(payload)))
        con.commit()
        receipts=vault/"receipts"
        receipts.mkdir(parents=True,exist_ok=True)
        file=receipts/("sync-"+digest(gesture.encode("utf8"))[:18]+".json")
        if file.exists():
            raise ValueError("RECEIPT_ALREADY_EXISTS_CONFLICT")
        with file.open("xb") as stream:stream.write(payload)
        return {"state":"LOCAL_BYTES_INDEXED_AND_VERIFIED_NOT_NATIVE_SCIENTIFIC_PARITY",
                "estate":estate,"issue":issue,
                "new_entries":inserted,"unchanged_entries":unchanged,
                "receipt_path":str(file),"receipt_sha256":digest(payload),
                "local_query_ready":True,
                "provider_authenticity":"UNTESTED",
                "scientific_promotion":False}
    except BaseException:
        con.rollback()
        raise
    finally:
        con.close()

def query(vault,estate,phrase,limit=25):
    if estate not in ESTATES or not 1<=limit<=100:
        raise ValueError("QUERY_ESTATE_OR_LIMIT_INVALID")
    db=checked_local(ensure_outside_repository(vault)/"atelier-index.sqlite")
    if not db.is_file():
        raise ValueError("PRIVATE_INDEX_NOT_FOUND")
    parts=re.findall(r"(?u)\w+",phrase)
    if not parts:raise ValueError("QUERY_TERM_REQUIRED")
    match=" OR ".join('"'+token.replace('"','""')+'"' for token in parts[:16])
    con=sqlite3.connect(db.as_uri()+"?mode=ro",uri=True)
    try:
        rows=con.execute("""SELECT e.record_id,e.source_id,e.relative_path,
            e.source_sha256,e.derivative_sha256,e.extraction_status,bm25(fts)
            FROM fts JOIN entries e ON e.record_id=fts.record_id
            WHERE e.estate=? AND fts MATCH ? ORDER BY bm25(fts),e.record_id LIMIT ?""",
            (estate,match,limit)).fetchall()
        return {"schema":"td613.operator-inbox-query/v2","estate":estate,
            "method":"LOCAL_FTS5_LEXICAL_NOT_SEMANTIC",
            "results":[{"record_id":a,"source_id":b,"relative_path":c,
                "source_sha256":d,"derivative_sha256":e,
                "extraction_status":f,"bm25_score":score,
                "evidence_class":"SOURCE_BOUND_LOCAL_DERIVATIVE"}
                       for a,b,c,d,e,f,score in rows]}
    finally:con.close()

def verify(vault,estate):
    if estate not in ESTATES:raise ValueError("ESTATE_INVALID")
    vault=ensure_outside_repository(vault)
    db=checked_local(vault/"atelier-index.sqlite")
    if not db.is_file():raise ValueError("PRIVATE_INDEX_NOT_FOUND")
    con=sqlite3.connect(db.as_uri()+"?mode=ro",uri=True)
    try:
        if con.execute("PRAGMA integrity_check").fetchone()[0]!="ok":
            raise ValueError("SQLITE_INTEGRITY_FAILED")
        rows=con.execute(
            "SELECT source_sha256,source_bytes,derivative_sha256,full_text FROM entries WHERE estate=?",
            (estate,)).fetchall()
        for hashhex,size,text_hash,extracted in rows:
            p=checked_local(vault/"blobs"/hashhex[:2]/hashhex)
            if not p.is_file() or p.stat().st_size!=size or digest(p.read_bytes())!=hashhex:
                raise ValueError("PRIVATE_SOURCE_BLOB_MISSING_OR_CHANGED")
            if digest(extracted.encode("utf8"))!=text_hash:
                raise ValueError("PRIVATE_SEARCH_TEXT_CHANGED")
        return {"state":"LOCAL_SOURCE_AND_TEXT_INTEGRITY_VERIFIED",
                "estate":estate,"entries":len(rows),
                "provider_origin_authenticated":False,"research_synthesis_verified":False}
    finally:con.close()

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("command",choices=["sync","query","verify"])
    parser.add_argument("--estate",choices=tuple(ESTATES),required=True)
    parser.add_argument("--vault",type=Path,required=True)
    parser.add_argument("--issue",type=int)
    parser.add_argument("--gesture")
    parser.add_argument("--operator-approved-this-run",action="store_true")
    parser.add_argument("--dry-run",action="store_true")
    parser.add_argument("--phrase")
    parser.add_argument("--limit",type=int,default=25)
    a=parser.parse_args()
    if a.command=="sync":
        result=sync(a.estate,a.issue,a.vault,a.gesture,
                operator_approved=a.operator_approved_this_run,dry_run=a.dry_run)
    elif a.command=="query":result=query(a.vault,a.estate,a.phrase or "",limit=a.limit)
    else:result=verify(a.vault,a.estate)
    print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=="__main__":main()
