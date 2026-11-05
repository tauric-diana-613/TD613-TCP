"""Origin-only population/span crosswalk. Hash integrity is not external origin."""
from collections import Counter,defaultdict
import datetime as dt,re
from .common import digest
SID=re.compile(r'^reddit:t3_[a-z0-9]{5,12}$');GRAPHS={'G_D','G_A','G_F','G_I','G_T','G_P','G_R','G_O','G_X'};LINKS={'MANIFESTATION','NAVIGATIONAL','EXPLICIT_WENDBINE_POST_LINK'}
def instant(v):
 if not isinstance(v,str):raise ValueError('EXPLICIT_UTC_INSTANT')
 try:t=dt.datetime.fromisoformat(v.replace('Z','+00:00'))
 except (ValueError,OverflowError) as e:raise ValueError('INVALID_INSTANT') from e
 if t.tzinfo is None or t.utcoffset()!=dt.timedelta(0):raise ValueError('UTC_REQUIRED')
 return t
def sid(v):
 if not isinstance(v,str) or not SID.fullmatch(v):raise ValueError('SOURCE_ID')
 return v
def verify_capture(r):
 s=sid(r.get('source_id'))
 if not isinstance(r.get('capture_id'),str) or not r['capture_id']:raise ValueError('CAPTURE_ID')
 if r.get('time_precision')!='SECOND':raise ValueError('EXPLICIT_CAPTURE_PRECISION')
 if instant(r['captured_at_utc'])<instant(r['published_at_utc']):raise ValueError('CAPTURE_PRECEDES_PUBLICATION')
 m=re.match(r'^https://www\.reddit\.com/r/Wendbine/comments/([a-z0-9]{5,12})(?:/|$)',r.get('canonical_url',''))
 if not m or 'reddit:t3_'+m[1]!=s:raise ValueError('URL_IDENTITY_SUBSTITUTION')
 states={}
 for field,h in [('title','title_sha256'),('selftext','body_sha256')]:
  if field not in r:states[field]='ABSENT';continue
  b=r[field]
  if b is None:states[field]='EXPLICIT_NULL';continue
  if type(b) is not bytes:raise ValueError('EXACT_UTF8_BYTES')
  b.decode('utf8')
  if digest(b)!=r.get(h):raise ValueError('CAPTURE_DIGEST')
  states[field]='NONEMPTY_BYTES' if b else 'EXPLICIT_EMPTY_BYTES'
 states['disclosure']='WITHHELD' if r.get('withheld') is True else 'ORIGIN_LOCAL_ONLY';return states
def verify_span(c,x):
 f={'body':'selftext','selftext':'selftext','title':'title'}.get(x.get('source_field'));b=c.get(f)
 if not isinstance(b,bytes):raise ValueError('SOURCE_SPAN_UNAVAILABLE')
 if x.get('source_sha256')!=digest(b):raise ValueError('UNIVERSAL_SOURCE_DIGEST')
 at=x.get('byte_offset');text=x.get('text')
 if type(at) is not int or at<0 or not isinstance(text,str):raise ValueError('TYPED_SPAN')
 raw=text.encode();b[:at].decode('utf8')
 if at+len(raw)>len(b) or b[at:at+len(raw)]!=raw or digest(raw)!=x.get('chunk_sha256'):raise ValueError('UNIVERSAL_SPAN_DRIFT')
 return f,at,at+len(raw)
def qualify(a_posts,b_manifestations,b_captures,c_captures,*,universal_chunks=None,relations=(),correction_edges=()):
 aset={};bset={};cset=defaultdict(list);caps={};states=Counter()
 for r in a_posts:
  s=sid(r['source_id'])
  if s in aset or r.get('time_precision')!='DAY' or r.get('source_text_stored') is not False:raise ValueError('A_IDENTITY_PRECISION_OR_METADATA')
  aset[s]=r
 for r in b_manifestations:
  s=sid(r['source_id'])
  if s in bset or not r.get('manifestation_id'):raise ValueError('B_MANIFESTATION_IDENTITY')
  bset[s]=r
 for r in c_captures:
  st=verify_capture(r)
  if r['capture_id'] in caps:raise ValueError('DUPLICATE_CAPTURE')
  caps[r['capture_id']]=r;cset[r['source_id']].append(r);states.update([st['title']+' / '+st['selftext']])
 def bound(b,c):return isinstance(c.get('title'),bytes) and isinstance(c.get('selftext'),bytes) and all(isinstance(b.get(k),str) and re.fullmatch('[0-9a-f]{64}',b[k]) for k in ('body_sha256_utf8','title_sha256_utf8')) and c.get('body_sha256')==b['body_sha256_utf8'] and c.get('title_sha256')==b['title_sha256_utf8']
 seen=set();exact=compatible=unbound=0;conflicts=[]
 for r in b_captures:
  s=sid(r['source_id']);cid=r.get('capture_id')
  if not isinstance(cid,str) or cid in seen or s not in bset or r.get('manifestation_id')!=bset[s]['manifestation_id']:raise ValueError('B_CAPTURE_IDENTITY')
  seen.add(cid)
  if cid in caps:
   c=caps[cid]
   if c['source_id']!=s or not bound(r,c) or instant(c['captured_at_utc'])!=instant(r['observed_at']):raise ValueError('SAME_CAPTURE_CHANGED_IDENTITY')
   exact+=1
  elif any(bound(r,c) for c in cset.get(s,[])):compatible+=1
  else:unbound+=1
 for s,r in aset.items():
  for c in cset.get(s,[]):
   if instant(c['published_at_utc']).date().isoformat()!=r.get('public_date'):conflicts.append({'source_id':s,'state':'PUBLICATION_DAY_DISAGREEMENT'})
 graphs=Counter()
 for e in relations:
  g=e.get('graph');graphs[g]+=1
  if g not in GRAPHS|LINKS or not e.get('source_witness') or (g in GRAPHS and e.get('kind')!='SCIENTIFIC_LEGACY') or (g in LINKS and e.get('kind')!='CAPTURE_OR_RETRIEVAL'):raise ValueError('GRAPH_TYPE_OR_WITNESS_PROMOTION')
 for e in correction_edges:
  if not e.get('source_witness') or e.get('status') not in ('HISTORICAL_RECORDED','UNADJUDICATED'):raise ValueError('UNWITNESSED_CORRECTION')
 spans=defaultdict(list);unique=set()
 for x in universal_chunks or []:
  k=(x.get('capture_id'),x.get('source_field'),x.get('byte_offset'))
  if k in unique:raise ValueError('DUPLICATE_UNIVERSAL_SPAN')
  unique.add(k);c=caps.get(x.get('capture_id'))
  if not c or c['source_id']!=x.get('source_id'):raise ValueError('UNIVERSAL_CAPTURE_BINDING')
  f,start,end=verify_span(c,x);spans[(c['capture_id'],f)].append((start,end))
 missing=0
 for c in c_captures:
  for f in ('title','selftext'):
   b=c.get(f)
   if not isinstance(b,bytes):continue
   covered=0
   for start,end in sorted(spans[(c['capture_id'],f)]):
    if start>covered:break
    covered=max(covered,end)
   if covered!=len(b):missing+=1
 held=not caps or bool(set(aset)-set(cset) or set(aset)-set(bset) or unbound or conflicts or universal_chunks is None or missing)
 return {'schema':'td613.wendbine.origin-custody-crosswalk/v1','populations':{'A_public_references':len(aset),'B_manifestations':len(bset),'B_captures':len(seen),'C_sources':len(cset),'C_captures':len(caps)},'A_source_membership':{'in_B':len(set(aset)&set(bset)),'in_C':len(set(aset)&set(cset)),'missing_from_B':sorted(set(aset)-set(bset)),'missing_from_C':sorted(set(aset)-set(cset))},'capture_relationships':{'EXACT_IDENTITY':exact,'BYTE_COMPATIBLE_DISTINCT_CAPTURE':compatible,'UNBOUND_OLD_CAPTURE':unbound},'C_field_states':dict(states),'chronology_conflicts':conflicts,'graph_counts':dict(graphs),'universal_readback':'HELD_NOT_SUPPLIED' if universal_chunks is None else 'EXACT_SPANS_COMPLETE' if not missing else 'HELD_INCOMPLETE_SPAN_COVERAGE','universal_missing_nonempty_fields':missing,'origin_byte_readback':'VERIFIED' if caps else 'HELD_NO_LOCAL_CAPTURE_ROWS','crosswalk_disposition':'HELD' if held else 'BOUNDED_IDENTITIES_AND_READBACK_CHECKED','source_provenance':'INTERNAL_ORIGIN_BYTES_AND_DECLARED_METADATA_ONLY','external_origin_authentication':'UNESTABLISHED_BY_HASHES','path_provenance':'UNOBSERVED','scientific_state_migration':'UNESTABLISHED','receiver_admission':False,'automatic_authorization':False}
