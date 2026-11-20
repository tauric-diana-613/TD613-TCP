#!/usr/bin/env python3
"""Standalone derivative-to-Work journey with explicit identity sensitivity."""
from pathlib import Path
import argparse,hashlib,importlib.util,json
HERE=Path(__file__).resolve().parent
def module(name,file):
 s=importlib.util.spec_from_file_location(name,HERE/file);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
native=module('em_journey_native','em-native-text-search-v1.py')
work=module('em_journey_work','em-work-route-v1.py')
def explore(root,index,query,*,limit=5):
 if type(limit) is not int or not 1<=limit<=20:raise ValueError('EM_JOURNEY_LIMIT')
 native.verify(root,index,'EMSTD613')
 derivatives,_=work.load(root,work.TABLES['derivatives'])
 links,_=work.load(root,work.TABLES['links'])
 works,_=work.load(root,work.TABLES['work'])
 bypath={x.get('derivative_relative_path'):x for x in derivatives}
 events=[]
 for hit in native.search(index,query,limit=limit)['results']:
  rel=hit['source_id'].removeprefix('derivative:');source=bypath.get(rel)
  if not source or source.get('derivative_sha256')!=hit['sha256']:raise ValueError('EM_DERIVATIVE_REGISTRY_HASH_MISMATCH')
  sid=source['source_file_id'];ids=sorted({x['work_id'] for x in links if x.get('source_file_id')==sid})
  events.append({'citation':native.cite(index,hit['source_id']),'source_file_id':sid,'works':[work.route(root,x) for x in ids],'extraction_status':source.get('extraction_status'),'motif_is_not_mechanism':True})
 return {'schema':'td613.em.research-journey/v1','query':query,'events':events,'identity_sensitivity':{'operational_works':len(works),'supported_collapse':sum(x.get('minimum_independent_work_contribution',1) for x in works),'supported_split':sum(x.get('maximum_independent_work_contribution',1) for x in works),'human_gated_groups':sum(bool(x.get('human_gate_required')) for x in works)},'next_questions':['Does the proposed result survive splitting all supported Work bundles?','Which source-specific operator separates a shared motif from a mechanism?','What hostile alternative could explain the apparent lineage without common origin?'],'lineage_proven':False,'scientific_methods_executed':'IDENTITY_JOINS_AND_SENSITIVITY_ARITHMETIC_ONLY','human_adjudication_reserved':True}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);p.add_argument('--index',type=Path,required=True);p.add_argument('query');a=p.parse_args();print(json.dumps(explore(a.root,a.index,a.query),ensure_ascii=False,indent=2))
