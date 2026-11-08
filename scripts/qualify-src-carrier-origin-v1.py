#!/usr/bin/env python3
"""One bounded public origin-side comparison; no genuine receiver admission."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
from packages.research_carrier_v1 import core as c,fixture_factory as f,native_runner as n
REV='b3e69acf587d534eeef2e01d0bb5bdbdecdbd320'
BASE='packages/dome_world_exact/fixtures/a15-r0/SRC/'
REL='05-OPERATIONS/relations/representation-lift-candidates.jsonl'

def qualify(checkout):
    root=Path(checkout).resolve();head=subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip();c.need(head==REV,'ORIGINAL_CHECKOUT_REVISION_DRIFT')
    path=BASE+REL;raw=(root/path).read_bytes();committed=subprocess.check_output(['git','-C',str(root),'show',REV+':'+path]);c.need(raw==committed,'ORIGINAL_SOURCE_BYTES_DRIFT')
    source='SRC-REPRESENTATION-LIFT-REGISTRY';capture='GIT-SNAPSHOT-'+REV
    ref={'repository':'tauric-diana-613/TD613-TCP','revision':REV,'path':path,'blob':subprocess.check_output(['git','-C',str(root),'rev-parse',REV+':'+path],text=True).strip(),'lfs':None}
    asset=f.make_asset(REL,raw,source_id=source,capture_id=capture,asset_id='SRC-LIFT-REGISTRY',git=ref)
    packet=f.shell('SRC_PHASE2_TOMOGRAPHY',[asset],source_class='PUBLIC_SOURCE_BOUND',source_id=source,capture_id=capture,parameters={'snapshot_id':'src-20260824-p2-001'})
    packet.update(packet_id='SRC-PUBLIC-ORIGIN-ONLY',witnesses=[],relations=[],contradictions=[])
    current=json.loads((root/(BASE+'04-RECEIPTS/phase2/current-seal.json')).read_bytes())
    packet['epoch']={'snapshot_id':current['atelier_snapshot_id'],'seal_id':current['seal_id'],'projection_seal_id':current['projection_seal_id'],'binding_class':'ORIGINAL_SIDE_REFERENCE','replay_lineage':[]}
    packet['chronology']={'comparison_frame':'RECORDED_EPISODE_NO_RETROACTIVITY','as_of':'2026-08-24T10:31:53Z','withdrawn_ids':[],'events':[]}
    packet['origin_receipt']={'receipt_id':'SRC-ORIGIN-METHOD-RECEIPT','execution_id':'SRC-ORIGIN-METHOD-COMPARISON','evidence_class':'PUBLIC_REPOSITORY_ORIGIN_SIDE_EXECUTION','result_sha256':c.sha(c.canon(None))}
    f.finish(packet,origin_side_public=True)
    original=[json.loads(line) for line in (root/(BASE+'05-OPERATIONS/phase2/claim-evidence-tomography.jsonl')).read_text().splitlines() if line.strip()]
    c.need(c.canon(packet['method_result'])==c.canon(original),'ORIGINAL_METHOD_PARITY_FAILED')
    witness_rel='04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/witnessed-evidence.jsonl'
    witness_raw=(root/(BASE+witness_rel)).read_bytes()
    c.need(witness_raw==subprocess.check_output(['git','-C',str(root),'show',REV+':'+BASE+witness_rel]),'ORIGINAL_WITNESS_REGISTRY_DRIFT')
    witnessed=[json.loads(x) for x in witness_raw.decode().splitlines() if x.strip()]
    lookup={w['evidence_id']:(i+1,w) for i,w in enumerate(witnessed)}
    refs={eid for row in original for eid in row['evidence_ids']};c.need(refs<=lookup.keys(),'UNRESOLVED_ORIGINAL_WITNESS')
    witness_blob=subprocess.check_output(['git','-C',str(root),'rev-parse',REV+':'+BASE+witness_rel],text=True).strip()
    packet['witnesses']=[{'witness_id':eid,'asset_id':asset['asset_id'],
       'evidence_class':'ORIGIN_VALIDATED_EXTERNAL_REGISTRY_REFERENCE',
       'locator':{'reference_occurrences_in_asset':[i+1 for i,row in enumerate(original) if eid in row['evidence_ids']],
                  'witness_registry':{'repository':ref['repository'],'revision':REV,'path':BASE+witness_rel,'blob':witness_blob,
                     'sha256':c.sha(witness_raw),'record_ordinal':lookup[eid][0],'record':lookup[eid][1]}},
       'limitation':'Exact origin-validated registry reference; full witness registry and original remote source are not receiver-admitted or independently authenticated'} for eid in sorted(refs)]
    # Add the unchanged original projection manifest on the origin side only.
    # This checks consumed data and executable membership without new acquisition.
    seal_rel='04-RECEIPTS/phase2/projection-seal.json';seal_path=BASE+seal_rel
    seal_bytes=(root/seal_path).read_bytes();c.need(seal_bytes==subprocess.check_output(['git','-C',str(root),'show',REV+':'+seal_path]),'ORIGINAL_SEAL_SOURCE_DRIFT')
    seal_ref={'repository':ref['repository'],'revision':REV,'path':seal_path,'blob':subprocess.check_output(['git','-C',str(root),'rev-parse',REV+':'+seal_path],text=True).strip(),'lfs':None}
    packet['assets'].append(f.make_asset(seal_rel,seal_bytes,source_id=source,capture_id=capture,asset_id='SRC-PROJECTION-SEAL',git=seal_ref))
    packet['epoch']['binding_class']='CONSUMED_BYTES_VERIFIED'
    c.need(c.canon(n.run(packet,origin_side_public=True))==c.canon(original),'SEALED_ORIGIN_METHOD_RESULT_DIFFERED')
    encoded=c.encode(packet);refused=[]
    for label,fn in [('synthetic_receiver_packet',lambda:c.receiver_packet(encoded)),('recipient_make_return',lambda:c.make_return(encoded,return_id='NO-ADMISSION',recipient_id='NO-RECIPIENT',runner=n.run)),('recipient_native_runner',lambda:n.run(packet))]:
        try:fn()
        except c.ContractError as e:c.need(str(e)=='GENUINE_RECEIVER_ADMISSION_HELD','UNEXPECTED_ADMISSION_REFUSAL');refused.append(label)
        else:raise AssertionError('Genuine receiver admission accidentally enabled')
    c.need((root/path).read_bytes()==committed,'ORIGINAL_SOURCE_MUTATED')
    return {'schema':'td613.src.carrier-origin-qualification/v1','source_revision':REV,'input_git_blob':ref['blob'],'input_sha256':c.sha(raw),'native_executable_sha256':packet['method']['executable_sha256'],
      'native_rows_equal':len(original),'method_result_sha256':c.sha(c.canon(original)),'carrier_serialization':'PRESERVED_ON_ORIGIN_SIDE',
      'original_witness_references_preserved':len(refs),'witness_registry_sha256':c.sha(witness_raw),
      'receiver_admission_refusals':refused,'genuine_receiver_admissions':0,'genuine_reciprocal_returns':0,
      'source_capture_identity_kind':'REPOSITORY_SNAPSHOT_NOT_ORIGINAL_EPHEMERAL_CAPTURE','scientific_interpretation':'UNESTABLISHED','epoch_binding':'ORIGIN_CONSUMED_DATA_AND_EXECUTABLE_SEAL_MEMBERSHIP_VERIFIED_NOT_EXTERNAL_CUSTODY','authority':c.closed_authority()}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--src-checkout',required=True);p.add_argument('--output');a=p.parse_args();result=qualify(a.src_checkout);text=json.dumps(result,indent=2,sort_keys=True)+'\n'
    if a.output:
        with Path(a.output).open('x') as file:file.write(text)
    print(text)
if __name__=='__main__':sys.dont_write_bytecode=True;main()
