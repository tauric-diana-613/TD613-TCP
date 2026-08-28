#!/usr/bin/env python3
import itertools, json

STATES=list(itertools.product((0,1), repeat=3))

def row(pred): return [1 if pred(s) else 0 for s in STATES]
def rank(A):
    M=[list(map(float,r)) for r in A]
    if not M: return 0
    m,n=len(M),len(M[0]); rr=0; tol=1e-10
    for c in range(n):
        pivot=max(range(rr,m), key=lambda i: abs(M[i][c]), default=rr)
        if rr>=m or abs(M[pivot][c])<=tol: continue
        M[rr],M[pivot]=M[pivot],M[rr]
        pv=M[rr][c]; M[rr]=[v/pv for v in M[rr]]
        for i in range(m):
            if i==rr: continue
            f=M[i][c]
            if abs(f)>tol: M[i]=[a-f*b for a,b in zip(M[i],M[rr])]
        rr+=1
        if rr==m: break
    return rr

def identifiable(H,c): return rank(H)==rank(H+[c])

norm=[1]*8
D=row(lambda s:s[0]); B=row(lambda s:s[1]); F=row(lambda s:s[2])
H0=[norm,D,B,F]
claim=row(lambda s:any(s))
C={
 'DIRECT_UNION': claim,
 'DIRECT_NONE': row(lambda s:not any(s)),
 'PAIR_DB': row(lambda s:s[0] and s[1]),
 'PAIR_DF': row(lambda s:s[0] and s[2]),
 'PAIR_BF': row(lambda s:s[1] and s[2]),
 'TRIPLE_DBF': row(lambda s:all(s)),
 'EXACTLY_ONE': row(lambda s:sum(s)==1),
 'AT_LEAST_TWO': row(lambda s:sum(s)>=2),
}
base_rank=rank(H0)
results={}
for name,h in C.items():
    H=H0+[h]
    results[name]={
      'rank_gain':rank(H)-base_rank,
      'post_rank':rank(H),
      'full_state_nullity':8-rank(H),
      'claim_identifiable':identifiable(H,claim),
    }

resolvers=[k for k,v in results.items() if v['claim_identifiable']]
primitive=['PAIR_DB','PAIR_DF','PAIR_BF','TRIPLE_DBF']
min_primitive=None
for r in range(1,len(primitive)+1):
    found=[]
    for names in itertools.combinations(primitive,r):
        if identifiable(H0+[C[n] for n in names],claim): found.append(list(names))
    if found:
        min_primitive={'action_count':r,'sets':found}; break

aggregate=[k for k in C if k not in ('DIRECT_UNION','DIRECT_NONE')]
min_aggregate=None
for r in range(1,4):
    found=[]
    for names in itertools.combinations(aggregate,r):
        if identifiable(H0+[C[n] for n in names],claim): found.append(list(names))
    if found:
        min_aggregate={'action_count':r,'sets':found}; break

out={
 'schema':'td613.claim-conditioned-next-observation-selector/v0.1',
 'source_fixture':'ESB-PISA source-derived eight-cell joint-exposure geometry',
 'target_claim':'exact union prevalence P(D or B or F)',
 'base':{'rank':base_rank,'nullity':8-base_rank,'claim_identifiable':identifiable(H0,claim)},
 'one_action_candidates':results,
 'one_action_claim_resolvers':resolvers,
 'primitive_overlap_minimum':min_primitive,
 'non_direct_aggregate_minimum':min_aggregate,
 'selector_disposition':{
   'claim_resolution':'DIRECT_UNION_OR_DIRECT_NONE_RESOLVES_IN_ONE_ACTION',
   'optimality':'ABSTAIN_UNTIL_COST_AND_UNCERTAINTY_GEOMETRY_DECLARED',
   'full_state':'REMAINS_UNDERIDENTIFIED_AFTER_ONE_ACTION_CLAIM_STOP'
 },
 'anti_equivalences':[
   'rank_gain != claim gain',
   'claim resolution != full-state identification',
   'one-action resolver != optimal action without cost/noise geometry',
   'candidate availability != need for another observation after claim resolution'
 ],
 'claim_ceiling':[
   'TD613-authored selector fixture',
   'source-derived marginals/exposure semantics only',
   'not SR doctrine',
   'not proof candidate observations are feasible or equally noisy'
 ]
}
print(json.dumps(out,indent=2,sort_keys=True))
