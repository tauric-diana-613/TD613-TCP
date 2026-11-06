import hashlib,json,math
from pathlib import Path

def canonical(v):return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode('utf8')
def digest(b):return hashlib.sha256(b).hexdigest()
def commitment(v):return digest(canonical(v))
def read_json(raw):
 def pairs(items):
  out={}
  for k,v in items:
   if k in out:raise ValueError('DUPLICATE_JSON_KEY')
   out[k]=v
  return out
 obj=json.loads(raw,object_pairs_hook=pairs,parse_constant=lambda _:(_ for _ in ()).throw(ValueError('NONFINITE_JSON')))
 def finite(v):
  if isinstance(v,float) and not math.isfinite(v):raise ValueError('NONFINITE_JSON')
  if isinstance(v,dict):
   for x in v.values():finite(x)
  if isinstance(v,list):
   for x in v:finite(x)
 finite(obj);return obj

def local_file(path):
 p=Path(path)
 if not p.is_absolute() or any(x.is_symlink() for x in (p,*p.parents)) or not p.is_file():raise ValueError('ABSOLUTE_NONLINK_FILE_REQUIRED')
 return p
