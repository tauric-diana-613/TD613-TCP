#!/usr/bin/env python3
"""Bounded original SRC research-state inventory; no runtime recovery or migration."""
import argparse
import collections
import hashlib
import json
from pathlib import Path
import subprocess

REV='b3e69acf587d534eeef2e01d0bb5bdbdecdbd320'
BASE='packages/dome_world_exact/fixtures/a15-r0/SRC/'
SURFACES={
 'snapshot_epoch':['04-RECEIPTS/phase2/current-seal.json','04-RECEIPTS/phase2/projection-seal.json'],
 'method_configuration':['01-MANIFESTS/phase2/interface-registry.json','aia/surface-declaration.json','06-INSTRUMENTS/PROJECTIVE_ROUTING_GRAMMAR.md'],
 'investigations_and_trails':['04-RECEIPTS/assays/2026-08-24-phase2-kiln/coverage-ledger.jsonl','05-OPERATIONS/phase2/researcher-proposed-trails.jsonl','06-INSTRUMENTS/phase2/inspired-assay-notebook.jsonl'],
 'hypotheses':['05-OPERATIONS/hypotheses/2026-08-23-amari-seeds.jsonl','05-OPERATIONS/hypotheses/2026-08-24-amari-recompilation-topology-seeds.jsonl'],
 'refusal_and_authority_contracts':['CONNECTOR_ENTRY.md','06-INSTRUMENTS/QUERY_RECIPES.md','06-INSTRUMENTS/SURFACE_WITHDRAWAL_ASSAY.md'],
 'versioned_inputs_outputs':['05-OPERATIONS/relations/representation-lift-candidates.jsonl','05-OPERATIONS/phase2/claim-evidence-tomography.jsonl','05-OPERATIONS/relations/recompilation-edges.jsonl','05-OPERATIONS/phase2/contextual-role-assertions.jsonl'],
 'historical_execution_and_capture_receipts':['04-RECEIPTS/phase2/transition-receipt.json','04-RECEIPTS/phase2/preflight.json','01-MANIFESTS/phase2/journal.jsonl']}
STATUS_KEYS={'state','status','adjudication_status','observation_status','promotion','source_status','control_resolution'}

def sha(raw):return hashlib.sha256(raw).hexdigest()
def inventory(checkout):
    checkout=Path(checkout).resolve();head=subprocess.check_output(['git','-C',str(checkout),'rev-parse','HEAD'],text=True).strip()
    if head!=REV:raise ValueError('INVENTORY_SOURCE_REVISION_DRIFT')
    out={'schema':'td613.src.research-state-inventory/v1','source_revision':REV,'selection':'BOUNDED_DECLARED_PATHS_NOT_FULL_RUNTIME_STATE','surfaces':{},
      'unavailable_state':[{'surface':s,'state':'UNRECORDED_OR_UNAVAILABLE','claim':'Not recovered by this bounded file inventory; absence here supplies no proof of historical nonexistence'} for s in ['ephemeral_research_session_memory','paused_in_process_continuation','hidden_model_state','unsaved_work_conversations','human_decisions_not_committed_as_records','private_original_vault_runtime']],
      'authority':{'migration':False,'succession':False,'execute_on_restore':False,'human_closure_required':True}}
    for category,paths in SURFACES.items():
        results=[]
        for rel in paths:
            path=BASE+rel
            try:raw=subprocess.check_output(['git','-C',str(checkout),'show',REV+':'+path],stderr=subprocess.PIPE)
            except subprocess.CalledProcessError:
                results.append({'path':rel,'status':'MISSING_AT_PINNED_REVISION'});continue
            if (checkout/path).read_bytes()!=raw:raise ValueError('ORIGINAL_INVENTORY_BYTES_DIFFER:'+rel)
            row={'path':rel,'sha256':sha(raw),'bytes':len(raw),'git_blob':subprocess.check_output(['git','-C',str(checkout),'rev-parse',REV+':'+path],text=True).strip(),'status':'RECOVERABLE_RECORD_BYTES'}
            if rel.endswith('.jsonl'):
                records=[json.loads(x) for x in raw.decode('utf-8-sig').splitlines() if x.strip()];counts=collections.Counter();keys=collections.Counter()
                for item in records:
                    if not isinstance(item,dict):continue
                    keys.update(item.keys())
                    for k in STATUS_KEYS:
                        value=item.get(k)
                        if isinstance(value,str):counts[k+':'+value]+=1
                row.update(record_count=len(records),status_observations=dict(sorted(counts.items())),field_names=sorted(keys))
            elif rel.endswith('.json'):
                obj=json.loads(raw.decode('utf-8-sig'));row['field_names']=sorted(obj) if isinstance(obj,dict) else []
                if rel.endswith('current-seal.json'):out['recorded_snapshot_identity']=obj
            results.append(row)
        out['surfaces'][category]=results
    out['pending_human_decisions']='NO_COMPLETE_RUNTIME_DECISION_REGISTER_ESTABLISHED; proposed/held status strings retained in their original evidence classes'
    out['research_session_identity']='SNAPSHOT_IDENTITIES_RECOVERED; complete independent session identity/state not established'
    return out

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--src-checkout',required=True);p.add_argument('--output',required=True);a=p.parse_args();result=inventory(a.src_checkout)
    with Path(a.output).open('x') as f:json.dump(result,f,ensure_ascii=False,indent=2,sort_keys=True);f.write('\n')
    print(json.dumps({'categories':len(result['surfaces']),'paths':sum(map(len,result['surfaces'].values())),'recorded_snapshot':result.get('recorded_snapshot_identity'),'unavailable_surfaces':len(result['unavailable_state'])},indent=2))
if __name__=='__main__':main()
