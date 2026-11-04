from pathlib import Path
from contextlib import closing
import importlib.util,json,hashlib,sqlite3,datetime,collections
R=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('gold_source',R/'u/scripts/universal-atelier-sourcebound-readonly-v1.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
db=next(Path(x) for x in (R/'db-discovery-private.txt').read_text().splitlines() if Path(x).name=='wendbine-combined-observed.sqlite')
base=Path('packages/dome_world_exact/fixtures/a15-r0')
rows=list(m.load_sources(db,(R/'u').resolve(),native_checkouts={'SRC':(R/'so').resolve(),'EMSTD613':(R/'eo').resolve()}))
topics={
 'SRC':[
  ('Explore','How can a reader follow an open research lead to a later source?', 'Find source-declared Explore cues with unresolved or later title candidates.', 'Find a native SRC passage containing an Explore research cue.'),
  ('provenance','How can a research claim be traced back to its recorded source?', 'Find native research passages discussing provenance and source tracing.', 'Find native SRC text explicitly discussing provenance.')],
 'EMSTD613':[
  ('algedonic','How might a feedback system signal strain or overload?', 'Find native research discussing algedonic signals in system design.', 'Find Em source text explicitly discussing algedonic signals.'),
  ('stylometry','How could writing patterns be compared without assuming an author identity?', 'Find native discussion of stylometry and textual comparison.', 'Find Em source text explicitly mentioning stylometry.')],
 'WENDBINE':[
  ('observability','What can be learned about a system from what it lets us observe?', 'Find observed posts discussing observability and its limits.', 'Find captured Wendbine text explicitly discussing observability.'),
  ('provenance','How can a claim be traced back to its source?', 'Find observed posts discussing provenance rather than generic source similarity.', 'Find captured Wendbine text explicitly discussing provenance.')]
}
cases=[];coverage={};uncertainties=[]
for estate in topics:
 source={}
 for row in rows:
  if row['estate']!=estate or not row['text'].strip():continue
  if estate=='SRC' and not row['source_id'].endswith('-file-0.md'):continue
  source.setdefault(row['source_id'],row)
 coverage[estate]=len(source)
 for topic,(anchor,*queries) in enumerate(topics[estate],1):
  positives=[r for _,r in sorted(source.items()) if anchor.casefold() in r['text'].casefold()]
  negatives=[r for _,r in sorted(source.items()) if anchor.casefold() not in r['text'].casefold() and any(v in r['text'].casefold() for v in ['system','source','research','control'])]
  if not positives or not negatives:raise ValueError('NO_SOURCE_VERIFIED_CANDIDATE_TOPIC:'+estate+':'+anchor)
  positives=positives[:3];negatives=negatives[:3]
  for difficulty,query in zip(['VAGUE','INTERMEDIATE','SPECIFIC'],queries):
   witnesses=[]
   for row in positives:
    # Casefold is used to select a witness; the exact returned bytes are hashed.
    at=row['text'].lower().find(anchor.lower());assert at>=0
    offset=len(row['text'][:at].encode('utf8'));span=row['text'][max(0,at-120):at+len(anchor)+240]
    witnesses.append({'estate':estate,'source_id':row['source_id'],'capture_id':row.get('capture_id'),'source_sha256':row['sha256'],'anchor_byte_offset':offset,'anchor':anchor,'candidate_passage':span,'passage_sha256':hashlib.sha256(span.encode('utf8')).hexdigest(),'source_kind':row['source_kind'],'evidence_class':'LITERAL_SOURCE_WITNESS_NOT_INDEPENDENT_RELEVANCE_APPROVAL'})
   cases.append({'query_id':f'{estate}-{topic}-{difficulty}','target_estate':estate,'difficulty':difficulty,'query':query,'relevant_source_ids':[x['source_id'] for x in positives],'decoy_source_ids':[x['source_id'] for x in negatives],'witnesses':witnesses,'decoy_rule':'RELATED_GENERAL_RESEARCH_VOCABULARY_WITHOUT_THIS_LITERAL_ANCHOR; semantic irrelevance remains unadjudicated','annotation_status':'CANDIDATE_AGENT_SOURCE_VERIFIED_HUMAN_REVIEW_REQUIRED','uncertainty':'Literal anchor establishes passage occurrence only. Relevance, exhaustiveness and decoy validity need independent human adjudication.'})
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
packet={'schema':'td613.atelier-gold-queries/v1','preregistered_at_utc':now,'status':'PROSPECTIVE_CANDIDATE_NOT_INDEPENDENTLY_APPROVED','candidate_author':'Interactive engineering session; not an independent human judge','source_pins':{'SRC':'b3e69acf587d534eeef2e01d0bb5bdbdecdbd320','EMSTD613':'70b5a0f9e94626cba6068f41c6117e7978800bbd','WENDBINE':'74abfb857e37a3e6d9d711c17428c96c4b07ecfd'},'source_scope_counts':coverage,'evaluation_rules':{'k':20,'unit':'UNIQUE_ESTATE_SOURCE_ID; chunks/captures deduplicate before truncation','metrics':['recall@20','reciprocal_rank','decoy_hits','exact_source_span_hash_validity'],'baseline':'PER_ESTATE_SQLITE_FTS5_BM25','model_outputs_used_for_annotation':False,'full_corpus_recall_inferred':False,'no_automatic_parity':True,'lexical_anchor_selection_bias':'Known and explicit; this is a candidate engineering benchmark, not independently approved semantic ground truth.'},'cases':cases,'independent_review_required':['Every vague/intermediate relevance judgment','Semantic validity of every decoy','Completeness of positive labels','Hold or change interpretation-sensitive judgments','Review frozen candidate before approving a later independently versioned gold edition']}
dest=R/'candidate-gold-v1.private.json'
blob=(json.dumps(packet,ensure_ascii=False,indent=2)+'\n').encode('utf8')
with dest.open('xb') as f:f.write(blob)
manifest={'schema':'td613.candidate-gold-freeze/v1','sha256':hashlib.sha256(blob).hexdigest(),'bytes':len(blob),'registered_at_utc':now,'queries':len(cases),'queries_by_estate':dict(collections.Counter(c['target_estate'] for c in cases)),'difficulties':dict(collections.Counter(c['difficulty'] for c in cases)),'source_scope_counts':coverage,'human_approved':False,'model_ranking_observed_before_freeze':False,'private_annotations_retained_locally':True}
(R/'candidate-gold-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n','utf8')
print(json.dumps(manifest))
