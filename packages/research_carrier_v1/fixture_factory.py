"""Explicitly fictional inputs for engineering tests; never infers a source class."""
import base64
from . import core,native_runner

def make_asset(path,raw,*,source_id='SYN-SOURCE',capture_id='SYN-CAPTURE',asset_id='SYN-ASSET',git=None):
    return {'asset_id':asset_id,'source_id':source_id,'capture_id':capture_id,'path':path,
            'sha256':core.sha(raw),'bytes_b64':base64.b64encode(raw).decode(),'git':git}

def shell(method_id,assets,*,source_class='SYNTHETIC',source_id='SYN-SOURCE',capture_id='SYN-CAPTURE',parameters=None):
    return {'schema':core.CARRIER,'packet_id':'SYN-PACKET','estate_id':'SRC','source_class':source_class,'source_id':source_id,'capture_id':capture_id,
      'assets':assets,'method':native_runner.descriptor(method_id),
      'epoch':{'snapshot_id':'SYN-SNAPSHOT','seal_id':'SYN-SEAL','projection_seal_id':'SYN-PROJECTION-SEAL','binding_class':'SYNTHETIC_DECLARATION','replay_lineage':[]},
      'parameters':parameters or {'snapshot_id':'SYN-SNAPSHOT'},'method_result':None,'evidence_states':[],
      'witnesses':[{'witness_id':'SYN-E1','asset_id':assets[0]['asset_id'],'evidence_class':'FICTIONAL_FIXTURE','locator':{'jsonl_line':1},'limitation':'Fictional input, no empirical credit'}],
      'relations':[{'relation_id':'SYN-REL-1','from_id':'SYN-A','to_id':'SYN-B','predicate':'DECLARED_INPUT_TO','graph_kind':'COMPILER','status':'DECLARED','witness_ids':['SYN-E1']},
                   {'relation_id':'SYN-REL-2','from_id':'SYN-A','to_id':'SYN-UNRESOLVED','predicate':'CANDIDATE_FOR','graph_kind':'NAVIGATIONAL','status':'UNRESOLVED','witness_ids':[]}],
      'chronology':{'comparison_frame':'RECORDED_EPISODE_NO_RETROACTIVITY','as_of':'2026-01-03T00:00:00Z','withdrawn_ids':['SYN-OLD-CLASSIFICATION'],
         'events':[{'event_id':'SYN-EVENT-1','sequence':1,'recorded_at':'2026-01-01T00:00:00Z','predecessor':None,'state':'PROPOSED'},
                   {'event_id':'SYN-EVENT-2','sequence':2,'recorded_at':'2026-01-02T00:00:00Z','predecessor':'SYN-EVENT-1','state':'HELD'}]},
      'contradictions':[{'record_id':'SYN-C1','claim':'SYN-CLAIM','status':'SUPPORTED'},{'record_id':'SYN-C2','claim':'SYN-CLAIM','status':'REJECTED'}],
      'origin_receipt':{'receipt_id':'SYN-ORIGIN-RECEIPT','execution_id':'SYN-ORIGIN-EXECUTION','evidence_class':'SYNTHETIC_NATIVE_EXECUTION','result_sha256':core.sha(core.canon(None))},
      'authority':core.closed_authority()}

def finish(c,*,origin_side_public=False):
    c['method_result']=native_runner.run(c,origin_side_public=origin_side_public)
    c['origin_receipt']['result_sha256']=core.sha(core.canon(c['method_result']))
    return c

def tomography():
    rows=[{'transformation_id':'SYN-T1','from_id':'SYN-A','to_id':'SYN-B','claim_effects':{'scope':'NARROWED','falsifiers':'MORE_SPECIFIC'},'evidence_ids':['SYN-E1'],'origin':'SYNTHETIC','adjudication_status':'HELD'}]
    raw=b'\n'.join(core.canon(x) for x in rows)+b'\n'
    c=finish(shell('SRC_PHASE2_TOMOGRAPHY',[make_asset('05-OPERATIONS/relations/representation-lift-candidates.jsonl',raw)]))
    c['evidence_states']=[{'pointer':'/0/delta_evidence','state':'UNKNOWN','reason':'Original builder leaves this dimension unknown'},
      {'pointer':'/0/composite_score','state':'NULL','reason':'Original has no composite score'},
      {'pointer':'/0/absent_evidence','state':'ABSENT','reason':'No recorded field'},
      {'pointer':'/0/withheld_evidence','state':'WITHHELD','reason':'Fictional withheld coordinate; no content staged'}]
    return c
