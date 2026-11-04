#!/usr/bin/env python3
import copy, json

INITIAL={
  'authority': {'empirical': True, 'genealogical': True},
  'active_evidence': [],
  'custody': []
}
OBS='h_legacy_source_claim'

def O_h(state):
    s=copy.deepcopy(state)
    if s['authority']['empirical']:
        if OBS not in s['active_evidence']:
            s['active_evidence'].append(OBS)
        s['custody'].append({'event':'OBSERVATION_ACQUIRED','observation':OBS,'active_after':True})
    else:
        s['custody'].append({'event':'OBSERVATION_HELD_AUTHORITY_INSUFFICIENT','observation':OBS,'active_after':False})
    return s

def G_L(state):
    s=copy.deepcopy(state)
    prior_empirical=s['authority']['empirical']
    s['authority']['empirical']=False
    s['authority']['genealogical']=True
    removed=[]
    if OBS in s['active_evidence']:
        s['active_evidence'].remove(OBS); removed.append(OBS)
    s['custody'].append({
      'event':'SOURCE_RECLASSIFIED_LEGACY',
      'prior_empirical_authority':prior_empirical,
      'empirical_authority_after':False,
      'genealogical_after':True,
      'deactivated_active_evidence':removed
    })
    return s

def current_projection(s):
    return {'authority':s['authority'],'active_evidence':sorted(s['active_evidence'])}

route_OG=G_L(O_h(INITIAL))
route_GO=O_h(G_L(INITIAL))

out={
 'schema':'td613.typed-update-order-custody-assay/v0.1',
 'source_rule_basis':'SR Legacy Papers Classification: genealogy retained; empirical/canonical/field-defining authority withdrawn; source preserved',
 'operators':{
   'O_h':'TD613-authored empirical-observation acquisition candidate conditioned on current empirical authority',
   'G_L':'TD613-authored Legacy authority retyping fixture preserving genealogy and deactivating source-dependent active empirical evidence'
 },
 'routes':{
   'G_L_o_O_h':route_OG,
   'O_h_o_G_L':route_GO,
 },
 'current_endpoint_equal':current_projection(route_OG)==current_projection(route_GO),
 'custody_equal':route_OG['custody']==route_GO['custody'],
 'current_endpoint':current_projection(route_OG),
 'bounded_result':[
   'SAME_ACTIVE_ENDPOINT_WITNESSED_IN_FIXTURE',
   'DIFFERENT_TYPED_CUSTODY_HISTORY_WITNESSED_IN_FIXTURE',
   'UPDATE_ORDER_VISIBLE_IN_CUSTODY_NOT_CURRENT_PROJECTION_WITNESSED_IN_FIXTURE'
 ],
 'nonclaims':[
   'not an SR runtime simulation',
   'not empirical proof that a specific legacy source was previously used then withdrawn',
   'not a category theorem',
   'not holonomy',
   'not proof all G/O pairs behave this way'
 ]
}
print(json.dumps(out,indent=2,sort_keys=True))
