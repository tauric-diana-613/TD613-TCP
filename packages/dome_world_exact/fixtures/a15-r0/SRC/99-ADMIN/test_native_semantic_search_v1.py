from contextlib import closing
from unittest.mock import patch
import pathlib,importlib.util,tempfile,hashlib,sqlite3,struct,unittest
p=pathlib.Path(__file__).with_name('native-semantic-search-v1.py');s=importlib.util.spec_from_file_location('native_sem',p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class NativeSemantic(unittest.TestCase):
 def test_checkpoint_fingerprint_includes_all_local_files(self):
  with tempfile.TemporaryDirectory() as folder:
   root=pathlib.Path(folder);f=root/'README.md';f.write_text('first licensed checkpoint card','utf8');a=m.encoder.fingerprint(root);f.write_text('changed checkpoint card','utf8');self.assertNotEqual(a,m.encoder.fingerprint(root))
 def test_checkpoint_registration_uses_case_sensitive_ordinal_order(self):
  with tempfile.TemporaryDirectory() as folder:
   root=pathlib.Path(folder)
   for name in ['config.json','README.md']:(root/name).write_bytes(name.encode())
   import json
   rows=[[name,hashlib.sha256(name.encode()).hexdigest()] for name in ['README.md','config.json']]
   expected=hashlib.sha256(json.dumps(rows,ensure_ascii=False,separators=(',',':')).encode('utf8')).hexdigest()
   self.assertEqual(m.encoder.fingerprint(root),expected)
 def test_standalone_query_and_source_digest_drift_control(self):
  with tempfile.TemporaryDirectory() as folder:
   root=pathlib.Path(folder);model=root/'model';model.mkdir();(model/'fixture.txt').write_text('software fixture only','utf8')
   source=root/'source.sqlite';vectors=root/'vectors.sqlite';body='fictional source'.encode();digest=hashlib.sha256(body).hexdigest()
   with closing(sqlite3.connect(source)) as c,c:
    c.executescript('CREATE TABLE records(source_id TEXT,source_sha256 TEXT,text TEXT); CREATE TABLE meta(key TEXT,value TEXT);')
    c.execute('INSERT INTO records VALUES(?,?,?)',('s1',digest,body.decode()));c.execute('INSERT INTO meta VALUES(?,?)',('estate','SRC'))
   with closing(sqlite3.connect(vectors)) as c,c:
    c.executescript('CREATE TABLE metadata(key TEXT,value TEXT);CREATE TABLE vectors(source_id TEXT,source_sha256 TEXT,chunk_sha256 TEXT,byte_offset INTEGER,dims INTEGER,vector BLOB,estate TEXT);')
    c.executemany('INSERT INTO metadata VALUES(?,?)',[('model_sha256',m.encoder.fingerprint(model)),('state','COMPLETE_INDEX_REQUIRES_FRESH_SOURCE_REVALIDATION')])
    c.execute('INSERT INTO vectors VALUES(?,?,?,?,?,?,?)',('s1',digest,digest,0,2,struct.pack('<ff',1,0),'SRC'))
   class FictionalEncoder:
    def __init__(self,*a):pass
    def encode(self,*a):return [[1,0]]
   with patch.object(m.encoder,'LocalSentenceEncoder',FictionalEncoder):
    out=m.search(source,vectors,model,'fixture','SRC');self.assertEqual(out['results'][0]['source_id'],'s1');self.assertTrue(out['independent_native_runtime'])
   exported=root/'independent.sqlite'
   built=m.build(source,exported,model,'SRC',reuse_vectors=vectors)
   self.assertEqual(built['vectors'],1);self.assertEqual(built['reused_source_bound_vectors'],1)
   with closing(sqlite3.connect(vectors)) as c,c:c.execute("UPDATE vectors SET source_sha256=?",('0'*64,))
   with self.assertRaisesRegex(ValueError,'SOURCE_DIGEST_DRIFT'):m.search(source,vectors,model,'fixture','SRC')
if __name__=='__main__':unittest.main()
