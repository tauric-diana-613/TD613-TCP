#!/usr/bin/env python3
"""Independent native semantic reader over a source-bound local vector file.

The vector file is data, not an external service or Universal runtime. Every
native source digest is rechecked against the independent native text index.
"""
from pathlib import Path
from contextlib import closing
import argparse,sqlite3,importlib.util,hashlib,math,struct,heapq,json
HERE=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('native_encoder',HERE/'native-offline-onnx-v1.py');encoder=importlib.util.module_from_spec(s);s.loader.exec_module(encoder)
def search(source_index,vector_index,model_dir,query,estate,*,limit=20):
 if estate not in ('SRC','EMSTD613') or not isinstance(query,str) or not query.strip() or not 1<=limit<=100:raise ValueError('NATIVE_SEMANTIC_QUERY_REQUIRED')
 for p in (source_index,vector_index,model_dir):
  if not Path(p).is_absolute() or Path(p).is_symlink():raise ValueError('NATIVE_LOCAL_PATH_REQUIRED')
 model_hash=encoder.fingerprint(model_dir)
 with closing(sqlite3.connect(Path(source_index).as_uri()+'?mode=ro',uri=True)) as c:
  sources={sid:digest for sid,digest in c.execute('SELECT source_id,source_sha256 FROM records')}
  meta=dict(c.execute('SELECT key,value FROM meta'))
  if meta.get('estate')!=estate:raise ValueError('NATIVE_SEMANTIC_ESTATE_MISMATCH')
  for sid,digest,text in c.execute('SELECT source_id,source_sha256,text FROM records'):
   if hashlib.sha256(text.encode('utf8')).hexdigest()!=digest:raise ValueError('NATIVE_SOURCE_INDEX_TAMPERED')
 with closing(sqlite3.connect(Path(vector_index).as_uri()+'?mode=ro',uri=True)) as c:
  metadata=dict(c.execute('SELECT key,value FROM metadata'))
  if metadata.get('model_sha256')!=model_hash or metadata.get('state')!='COMPLETE_INDEX_REQUIRES_FRESH_SOURCE_REVALIDATION':raise ValueError('NATIVE_MODEL_OR_VECTOR_STATE_MISMATCH')
  data=c.execute('SELECT source_id,source_sha256,chunk_sha256,byte_offset,dims,vector FROM vectors WHERE estate=?',(estate,)).fetchall()
  if {r[0] for r in data}!=set(sources):raise ValueError('NATIVE_VECTOR_SOURCE_COVERAGE_INCOMPLETE')
  if any(sources.get(r[0])!=r[1] for r in data):raise ValueError('NATIVE_VECTOR_SOURCE_DIGEST_DRIFT')
 model=encoder.LocalSentenceEncoder(model_dir);q=model.encode([query])[0];ranked=[]
 for sid,digest,chunk_hash,offset,dims,blob in data:
  if len(blob)!=dims*4 or len(q)!=dims:raise ValueError('NATIVE_VECTOR_DIMENSION')
  vector=struct.unpack('<'+str(dims)+'f',blob)
  if not all(math.isfinite(v) for v in vector):raise ValueError('NATIVE_VECTOR_NONFINITE')
  norm=math.sqrt(sum(v*v for v in vector))
  if norm<=0:raise ValueError('NATIVE_VECTOR_ZERO')
  score=sum(a*b/norm for a,b in zip(q,vector))
  ranked.append({'source_id':sid,'source_sha256':digest,'chunk_sha256':chunk_hash,'byte_offset':offset,'score':float(score),'estate':estate,'retrieval_class':'LOCAL_SEMANTIC_CANDIDATE_NO_RELATION_PROMOTION'})
 return {'results':heapq.nlargest(limit,ranked,key=lambda x:(x['score'],x['source_id'],x['byte_offset'])),'model_sha256':model_hash,'independent_native_runtime':True,'scientific_parity':'REQUIRES_HUMAN_RELEVANCE_ADJUDICATION'}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--source-index',type=Path,required=True);p.add_argument('--vector-index',type=Path,required=True);p.add_argument('--model-dir',type=Path,required=True);p.add_argument('--estate',choices=['SRC','EMSTD613'],required=True);p.add_argument('query');a=p.parse_args();print(json.dumps(search(a.source_index,a.vector_index,a.model_dir,a.query,a.estate),ensure_ascii=False,indent=2))
