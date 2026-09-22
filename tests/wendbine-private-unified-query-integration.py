"""Synthetic 60-source SQLite / v06+v07 custody integration. No third-party source text."""
import importlib.util
import sqlite3
import json
import tempfile
import hashlib
from pathlib import Path

MODULE = Path(__file__).resolve().parent.parent / "packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-private-unified-query.py"
spec = importlib.util.spec_from_file_location("wendbine_private_unified_query", MODULE)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
h = lambda s: hashlib.sha256(s.encode("utf8")).hexdigest()

with tempfile.TemporaryDirectory(prefix="wendbine-60-synthetic-") as d:
    db = Path(d) / "private.sqlite"
    conn = sqlite3.connect(db)
    conn.executescript("""CREATE TABLE sources(source_id TEXT PRIMARY KEY,canonical_url TEXT,group_name TEXT,created_utc REAL,title TEXT,selftext TEXT,body_state TEXT,provider TEXT,title_sha256 TEXT,selftext_sha256 TEXT,body_utf8_bytes INTEGER,source_edited TEXT,archive_retrieved_on REAL);
CREATE VIRTUAL TABLE source_fts USING fts5(source_id UNINDEXED,title,selftext,tokenize="unicode61");""")
    p0, p12 = [], []
    for i in range(60):
        sid = "reddit:t3_synthetic" + str(i).zfill(3)
        url = "https://www.reddit.com/r/Wendbine/comments/synthetic" + str(i).zfill(3) + "/wendbine/"
        title = "Wendbine"
        state = "VERIFIED_EMPTY_BODY_MEDIA_OR_LINK_POST" if i >= 58 else "ARCHIVED_TEXT_BODY_PRESENT"
        body = "" if i >= 58 else ("Synthetic observability ∴ " + str(i) if i == 0 else "Synthetic bounded evidence " + str(i))
        ts = 1789000000 + i
        rec = dict(source_id=sid, canonical_url=url, title_sha256_utf8=h(title), body_sha256_utf8=h(body), body_utf8_bytes=len(body.encode()), source_created_utc=ts)
        if i < 33:
            p0.append(rec)
        else:
            p12.append(dict(source_id=sid, canonical_url=url, archive_copies=[dict(rec, body_state=state)]))
        conn.execute("INSERT INTO sources VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", (sid, url, "P0" if i < 33 else "P1P2", ts, title, body, state, "SYNTHETIC", h(title), h(body), len(body.encode()), "false", ts+1))
        conn.execute("INSERT INTO source_fts VALUES (?,?,?)", (sid,title,body))
    conn.commit()
    p0_path, p12_path = Path(d)/"p0.json", Path(d)/"p12.json"
    p0_path.write_text(json.dumps(dict(source_count=33,records=p0)))
    p12_path.write_text(json.dumps(dict(source_count=27,records=p12)))
    read,status = m.verify_index(db,p0_path,p12_path)
    assert (status["source_objects"],status["nonempty_text_bodies"],status["empty_media_link_selftext"]) == (60,58,2)
    hits=m.query(read,"observability",mode="exact")
    assert len(hits)==1 and hits[0]["source_id"]=="reddit:t3_synthetic000"
    assert m.query(read,"observability",mode="fts")
    read.close()
    conn.execute("UPDATE sources SET selftext='tampered' WHERE source_id='reddit:t3_synthetic000'")
    conn.commit()
    conn.close()
    try:
        m.verify_index(db,p0_path,p12_path)
    except ValueError as exc:
        assert "SOURCE_FIELD_HASH_MISMATCH" in str(exc)
    else:
        raise AssertionError("Tampered source must fail before query.")
print("Wendbine unified private 60-source synthetic SQLite and source receipt test PASS")
