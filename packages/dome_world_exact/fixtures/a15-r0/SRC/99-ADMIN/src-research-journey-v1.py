#!/usr/bin/env python3
"""Bounded native SRC research journey; original projective method is retained.

Typed registry edges, contextual roles, Explore title candidates, chronology and
the nine formal/eight reader distinction are separate outputs. No promotion.
"""
from pathlib import Path
from collections import deque
import argparse,hashlib,importlib.util,json,sys,re

HERE=Path(__file__).resolve().parent
def module(name,file):
    s=importlib.util.spec_from_file_location(name,HERE/file)
    m=importlib.util.module_from_spec(s);sys.modules[name]=m;s.loader.exec_module(m);return m
native=module('src_journey_native','src-native-text-search-v1.py')
typed=module('src_journey_typed','src-evidence-rabbit-hole-v1.py')
projective=module('src_journey_original_projective','run-projective-routing-grammar-assay.py')

def explore(root,index,query,*,depth=2,limit=12,documents=None):
    if type(depth) is not int or not 0<=depth<=4 or type(limit) is not int or not 1<=limit<=50:
        raise ValueError('SRC_JOURNEY_BOUNDS')
    native.verify(root,index,'SRC')
    docs=projective.load_documents(root) if documents is None else documents
    byid={d.entity_id:d for d in docs}
    ranked=native.search(index,query,limit=100)
    seeds=[]
    for h in ranked['results']:
        match=re.search(r'zenodo-(\d+)-file-0\.md$',h['source_id'])
        if match and 'zenodo:'+match[1] in byid:
            eid='zenodo:'+match[1]
            if eid not in seeds:seeds.append(eid)
        if len(seeds)>=3:break
    frontier=deque((sid,0,[]) for sid in seeds);seen=set();events=[]
    while frontier and len(events)<limit:
        sid,level,history=frontier.popleft()
        if sid in seen:continue
        seen.add(sid);doc=byid[sid]
        body=(Path(root)/doc.body_path).read_bytes()
        tokens=projective.extract_explore_tokens(doc)
        # Reuse the original chronological, title-substring and lexical classes.
        routes=[]
        for token in tokens:
            candidates=projective.lexical_candidates(token,doc,docs)
            routes.append({'token':token,'status':projective.classify_explore(candidates),'candidates':candidates,'evidence_class':'ORIGINAL_PROJECTIVE_LEXICAL_CANDIDATE'})
            if level<depth:
                for candidate in candidates:
                    if candidate['target_id'] in byid:frontier.append((candidate['target_id'],level+1,history+[sid]))
        events.append({'entity_id':sid,'depth':level,'route_history':history,'source':{'relative_path':doc.body_path,'sha256':hashlib.sha256(body).hexdigest(),'source_class':'NATIVE_DERIVATIVE_NOT_ORIGINAL_PDF'},'typed_strata':typed.explore(root,sid,depth=min(depth,4),limit=40),'projective_routes':routes})
    return {'schema':'td613.src.research-journey/v1','query':query,'seed_entities':seeds,'events':events,'pending_frontier':len(frontier),'bounded':True,'formal_canon_layers':9,'experiential_reader_routes':8,'projections_are_distinct':True,'method_sha256':hashlib.sha256((HERE/'run-projective-routing-grammar-assay.py').read_bytes()).hexdigest(),'next_questions':['Which original passage witnesses a proposed relation independently of the route?','Does withdrawing a contextual role change the interpretation while the path remains?','Does a time-shuffled control retain title similarity but change historical classification?'],'automatic_relation_promotion':False,'full_scientific_parity':'HELD_HUMAN_COMPARATIVE_ADJUDICATION_REQUIRED'}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);p.add_argument('--index',type=Path,required=True);p.add_argument('query');p.add_argument('--depth',type=int,default=2);p.add_argument('--limit',type=int,default=12);a=p.parse_args()
    print(json.dumps(explore(a.root,a.index,a.query,depth=a.depth,limit=a.limit),ensure_ascii=False,indent=2))
