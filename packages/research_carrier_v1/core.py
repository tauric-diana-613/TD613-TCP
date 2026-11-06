"""Versioned carrier/return invariants. Validation grants no admission or Flight authority."""
import base64
import copy
from datetime import datetime
import hashlib
import json
import math
from pathlib import PurePosixPath
import re

CARRIER='td613.research-method-carrier/v1'
RETURN='td613.research-method-return/v1'
CAPSULE='td613.research-continuity-capsule/v1'
MAX_BYTES=8_000_000
HEX=re.compile(r'^[0-9a-f]{64}$')
ID=re.compile(r'^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$')
class ContractError(ValueError):pass

def need(test,message):
    if not test:raise ContractError(message)
def sha(raw):return hashlib.sha256(raw).hexdigest()
def pairs(items):
    out={}
    for k,v in items:
        need(k not in out,'DUPLICATE_JSON_KEY');out[k]=v
    return out
def finite(token):
    v=float(token);need(math.isfinite(v),'NONFINITE_NUMBER');return v
def bad_constant(token):raise ContractError('NONFINITE_NUMBER')
def domain(value,depth=0,budget=None):
    if budget is None:budget=[0]
    budget[0]+=1;need(depth<=40 and budget[0]<=100000,'BOUNDED_JSON_DOMAIN')
    if value is None or type(value) in (str,bool,int):return
    if type(value) is float:need(math.isfinite(value),'NONFINITE_NUMBER');return
    need(type(value) in (list,dict),'UNSUPPORTED_JSON_TYPE')
    if type(value) is dict:
        need(all(type(k) is str for k in value),'NONSTRING_KEY')
        for v in value.values():domain(v,depth+1,budget)
    else:
        for v in value:domain(v,depth+1,budget)
def canon(value):
    domain(value);raw=json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
    need(len(raw)<=MAX_BYTES,'BOUNDED_JSON_BYTES');return raw
def parse(raw):
    need(type(raw) is bytes and len(raw)<=MAX_BYTES,'BOUNDED_EXACT_BYTES_REQUIRED')
    try:v=json.loads(raw.decode('utf8'),object_pairs_hook=pairs,parse_float=finite,parse_constant=bad_constant)
    except (UnicodeError,ValueError,RecursionError) as e:raise ContractError('INVALID_JSON:'+str(e)) from e
    domain(v);return v
def keys(obj,required):need(type(obj) is dict and set(obj)==set(required),'EXACT_SCHEMA_KEYS_REQUIRED')
def ident(v):need(type(v) is str and ID.fullmatch(v) is not None,'INVALID_ID')
def digest(v):need(type(v) is str and HEX.fullmatch(v) is not None,'INVALID_SHA256')
def timestamp(v):
    need(type(v) is str and re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z',v),'UTC_RECORDING_TIME_REQUIRED')
    try:return datetime.fromisoformat(v.replace('Z','+00:00'))
    except ValueError as e:raise ContractError('INVALID_RECORDING_TIME') from e
def relative(path):
    need(type(path) is str and path and '\\' not in path and not any(ord(x)<32 for x in path) and not PurePosixPath(path).is_absolute()
         and all(p not in ('..','.','.git') for p in path.split('/')) and all(path.split('/')),'UNSAFE_ASSET_PATH')
    return path

def authority(value):
    keys(value,['source_admission','flight','execute_on_restore','merge','deployment','release','human_closure_required'])
    need(value['human_closure_required'] is True and all(value[k] is False for k in value if k!='human_closure_required'),'AUTHORITY_WIDENING')
def closed_authority():return {k:False for k in ['source_admission','flight','execute_on_restore','merge','deployment','release']}|{'human_closure_required':True}

def git_ref(value,synthetic=False):
    if synthetic:need(value is None,'SYNTHETIC_ASSET_CANNOT_CLAIM_GIT_ORIGIN');return
    keys(value,['repository','revision','path','blob','lfs'])
    need(type(value['repository']) is str and value['repository'],'REPOSITORY_REFERENCE_REQUIRED')
    for k in ['revision','blob']:need(type(value[k]) is str and re.fullmatch('[0-9a-f]{40}',value[k]),'INVALID_GIT_ID')
    relative(value['path'])
    if value['lfs'] is not None:
        lfs=value['lfs'];keys(lfs,['sha256','bytes','pointer_b64']);digest(lfs['sha256']);need(type(lfs['bytes']) is int and lfs['bytes']>=0,'INVALID_LFS_SIZE')
        try:pointer=base64.b64decode(lfs['pointer_b64'],validate=True)
        except (TypeError,ValueError) as e:raise ContractError('INVALID_LFS_POINTER') from e
        expected=f"version https://git-lfs.github.com/spec/v1\noid sha256:{lfs['sha256']}\nsize {lfs['bytes']}\n".encode()
        need(pointer==expected and hashlib.sha1(b'blob '+str(len(pointer)).encode()+b'\0'+pointer).hexdigest()==value['blob'],'LFS_POINTER_GIT_BINDING_MISMATCH')

def asset_bytes(asset,source_class):
    keys(asset,['asset_id','source_id','capture_id','path','sha256','bytes_b64','git'])
    for k in ['asset_id','source_id','capture_id']:ident(asset[k])
    relative(asset['path']);digest(asset['sha256']);git_ref(asset['git'],source_class=='SYNTHETIC')
    try:raw=base64.b64decode(asset['bytes_b64'],validate=True)
    except (ValueError,TypeError) as e:raise ContractError('INVALID_SOURCE_BYTES') from e
    need(sha(raw)==asset['sha256'],'SOURCE_BYTES_DIGEST_MISMATCH')
    if asset['git'] is not None:
        ref=asset['git'];lfs=ref['lfs']
        if lfs is None:need(hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==ref['blob'],'GIT_BLOB_PAYLOAD_MISMATCH')
        else:need(sha(raw)==lfs['sha256'] and len(raw)==lfs['bytes'],'LFS_PAYLOAD_MISMATCH')
    return raw

MISSING=object()
def at(value,pointer):
    need(type(pointer) is str and (pointer=='' or pointer.startswith('/')),'JSON_POINTER_REQUIRED')
    for token in pointer.split('/')[1:]:
        token=token.replace('~1','/').replace('~0','~')
        if type(value) is dict:value=value.get(token,MISSING)
        elif type(value) is list and token.isdecimal():value=value[int(token)] if int(token)<len(value) else MISSING
        else:return MISSING
    return value

def validate(c):
    domain(c)
    keys(c,['schema','packet_id','estate_id','source_class','source_id','capture_id','assets','method','epoch','parameters','method_result','evidence_states','witnesses','relations','chronology','contradictions','origin_receipt','authority'])
    need(c['schema']==CARRIER,'CARRIER_SCHEMA');need(c['source_class'] in ('SYNTHETIC','PUBLIC_SOURCE_BOUND','PROTECTED'),'SOURCE_CLASS')
    for k in ['packet_id','estate_id','source_id','capture_id']:ident(c[k])
    authority(c['authority']);need(type(c['assets']) is list and 0<len(c['assets'])<=1000,'SOURCE_ASSETS_REQUIRED')
    asset_ids=set();paths=set()
    for a in c['assets']:
        asset_bytes(a,c['source_class']);need(a['asset_id'] not in asset_ids and a['path'] not in paths,'DUPLICATE_SOURCE_ASSET');asset_ids.add(a['asset_id']);paths.add(a['path'])
        need(a['source_id']==c['source_id'] and a['capture_id']==c['capture_id'],'SOURCE_CAPTURE_BINDING_MISMATCH')
    m=c['method'];keys(m,['method_id','version','entrypoint','executable_sha256','executable_git','semantic_contract'])
    ident(m['method_id']);ident(m['version']);digest(m['executable_sha256']);git_ref(m['executable_git'])
    need(type(m['semantic_contract']) is dict and m['semantic_contract'],'METHOD_SEMANTICS_REQUIRED')
    ep=c['epoch'];keys(ep,['snapshot_id','seal_id','projection_seal_id','binding_class','replay_lineage'])
    for k in ['snapshot_id','seal_id','projection_seal_id']:ident(ep[k])
    need(ep['binding_class'] in ('SYNTHETIC_DECLARATION','ORIGINAL_SIDE_REFERENCE','CONSUMED_BYTES_VERIFIED'),'EPOCH_BINDING_CLASS')
    need(type(ep['replay_lineage']) is list,'REPLAY_LINEAGE_REQUIRED')
    for r in ep['replay_lineage']:
        keys(r,['path','retained_sha256','replayed_sha256','transform']);relative(r['path']);digest(r['retained_sha256']);digest(r['replayed_sha256']);need(r['transform']=='LF_TO_CRLF_EXACT_SEAL_MATCH','UNSUPPORTED_REPLAY_TRANSFORM')
    need(type(c['parameters']) is dict,'EXACT_METHOD_PARAMETERS_REQUIRED')
    need(type(c['witnesses']) is list,'WITNESSES_LIST_REQUIRED');wids=set()
    for w in c['witnesses']:
        keys(w,['witness_id','asset_id','evidence_class','locator','limitation']);ident(w['witness_id']);need(w['witness_id'] not in wids and w['asset_id'] in asset_ids,'INVALID_WITNESS_BINDING');wids.add(w['witness_id'])
        need(type(w['evidence_class']) is str and type(w['locator']) is dict and type(w['limitation']) is str,'TYPED_WITNESS_REQUIRED')
    need(type(c['evidence_states']) is list,'EVIDENCE_STATES_REQUIRED');pointers=set()
    for e in c['evidence_states']:
        keys(e,['pointer','state','reason']);need(e['pointer'] not in pointers,'DUPLICATE_EVIDENCE_COORDINATE');pointers.add(e['pointer']);v=at(c['method_result'],e['pointer'])
        state=e['state'];need(state in ('PRESENT','UNKNOWN','NULL','ABSENT','WITHHELD'),'INVALID_EVIDENCE_STATE')
        need(type(e['reason']) is str,'EVIDENCE_REASON_REQUIRED')
        if state=='UNKNOWN':need(v=='UNKNOWN' and type(v) is str,'UNKNOWN_COLLAPSED')
        elif state=='NULL':need(v is None,'NULL_COLLAPSED')
        elif state=='ABSENT':need(v is MISSING,'ABSENCE_COLLAPSED')
        elif state=='WITHHELD':need(v is MISSING and bool(e['reason']),'WITHHELD_EVIDENCE_LEAKED_OR_UNEXPLAINED')
        else:need(v is not MISSING,'PRESENT_EVIDENCE_MISSING')
    need(type(c['relations']) is list,'TYPED_RELATIONS_REQUIRED');rids=set()
    for r in c['relations']:
        keys(r,['relation_id','from_id','to_id','predicate','graph_kind','status','witness_ids'])
        for k in ['relation_id','from_id','to_id','predicate','graph_kind']:ident(r[k])
        need(r['relation_id'] not in rids,'DUPLICATE_RELATION');rids.add(r['relation_id'])
        need(r['status'] in ('DECLARED','UNRESOLVED') and type(r['witness_ids']) is list and all(x in wids for x in r['witness_ids']),'INVALID_TYPED_RELATION')
        if r['status']=='DECLARED':need(bool(r['witness_ids']),'DECLARED_RELATION_NEEDS_WITNESS')
    ch=c['chronology'];keys(ch,['comparison_frame','as_of','withdrawn_ids','events'])
    need(ch['comparison_frame']=='RECORDED_EPISODE_NO_RETROACTIVITY','INCOMPATIBLE_CHRONOLOGY');as_of=timestamp(ch['as_of'])
    need(type(ch['withdrawn_ids']) is list and len(set(ch['withdrawn_ids']))==len(ch['withdrawn_ids']),'WITHDRAWAL_IDENTITIES_REQUIRED')
    for v in ch['withdrawn_ids']:ident(v)
    need(type(ch['events']) is list,'RECORDED_EVENT_LIST_REQUIRED');prev=None;seq=0;time=None;ids=set()
    for e in ch['events']:
        keys(e,['event_id','sequence','recorded_at','predecessor','state']);ident(e['event_id']);t=timestamp(e['recorded_at'])
        need(e['event_id'] not in ids and type(e['sequence']) is int and e['sequence']>seq and (time is None or t>=time),'CHRONOLOGY_ORDER_VIOLATION')
        need(t<=as_of,'EVENT_AFTER_COMPARISON_FRAME')
        need(e['predecessor']==prev and e['state'] in ('PAUSED','HELD','PROPOSED','UNRESOLVED','RECORDED','WITHDRAWN'),'CHRONOLOGY_PREDECESSOR_OR_STATE')
        prev=e['event_id'];seq=e['sequence'];time=t;ids.add(prev)
    need(type(c['contradictions']) is list,'CONTRADICTIONS_MUST_REMAIN_EXPLICIT')
    receipt=c['origin_receipt'];keys(receipt,['receipt_id','execution_id','evidence_class','result_sha256']);ident(receipt['receipt_id']);ident(receipt['execution_id'])
    need(receipt['result_sha256']==sha(canon(c['method_result'])),'ORIGIN_RESULT_DIGEST_MISMATCH')
    return c

def encode(c):validate(c);return canon(c)
def decode(raw):return validate(parse(raw))

def make_return(origin_raw,*,return_id,recipient_id,runner=None):
    c=decode(origin_raw);need(c['source_class']=='SYNTHETIC','GENUINE_RECEIVER_ADMISSION_HELD');ident(return_id);ident(recipient_id)
    result=runner(c) if runner else copy.deepcopy(c['method_result'])
    returned=copy.deepcopy(c);returned['method_result']=result
    # Preserve origin receipt; changed output cannot receive a forged origin digest.
    out={'schema':RETURN,'return_id':return_id,'recipient_id':recipient_id,'origin_packet_id':c['packet_id'],
      'origin_bytes_sha256':sha(origin_raw),'returned_carrier':returned,
      'execution':{'mode':'NATIVE_REEXECUTION' if runner else 'SERIALIZATION_ONLY','method_sha256':c['method']['executable_sha256'],
       'parameters_sha256':sha(canon(c['parameters'])),'semantic_contract_sha256':sha(canon(c['method']['semantic_contract'])),
       'result_sha256':sha(canon(result))}}
    return canon(out)

def compare(origin_raw,returned_raw,*,return_id,recipient_id,origin_runner=None):
    """Independent caller-retained origin required; returned self-digests grant no trust."""
    origin=decode(origin_raw);r=parse(returned_raw)
    keys(r,['schema','return_id','recipient_id','origin_packet_id','origin_bytes_sha256','returned_carrier','execution'])
    need(r['schema']==RETURN and r['return_id']==return_id and r['recipient_id']==recipient_id,'RETURN_IDENTITY_MISMATCH')
    need(r['return_id']!=origin['origin_receipt']['receipt_id'],'RETURN_CANNOT_REUSE_ORIGIN_RECEIPT')
    need(r['origin_packet_id']==origin['packet_id'] and r['origin_bytes_sha256']==sha(origin_raw),'ORIGIN_PACKET_BINDING_MISMATCH')
    actual=validate(r['returned_carrier']);need(canon(actual)==canon(origin),'CARRIER_IDENTITY_OR_TYPED_VALUE_CHANGED')
    x=r['execution'];keys(x,['mode','method_sha256','parameters_sha256','semantic_contract_sha256','result_sha256'])
    need(x['mode'] in ('NATIVE_REEXECUTION','SERIALIZATION_ONLY'),'UNSUPPORTED_EXECUTION_MODE')
    need(x['method_sha256']==origin['method']['executable_sha256'] and x['parameters_sha256']==sha(canon(origin['parameters'])) and x['semantic_contract_sha256']==sha(canon(origin['method']['semantic_contract'])) and x['result_sha256']==sha(canon(actual['method_result'])),'METHOD_SEMANTICS_OR_EXECUTION_BINDING_CHANGED')
    native=False
    if origin_runner is not None and x['mode']=='NATIVE_REEXECUTION':
        expected=origin_runner(copy.deepcopy(origin));need(canon(expected)==canon(actual['method_result']),'NATIVE_OPERATION_RESULT_DIVERGED');native=True
    return {'schema':'td613.research-method-comparison/v1','serialization':'PRESERVED',
      'native_operation':'ORIGIN_REEXECUTION_MATCHED' if native else 'UNESTABLISHED',
      'source_class':origin['source_class'],'epoch_binding':'ORIGIN_RUNNER_VALIDATED_WITHIN_METHOD_SCOPE' if native else 'UNESTABLISHED_WITHOUT_ORIGIN_RUNNER','genuine_receiver_admission':'UNEXECUTED' if origin['source_class']!='SYNTHETIC' else 'NOT_APPLICABLE_SYNTHETIC',
      'scientific_interpretation':'UNESTABLISHED','independent_external_origin':'UNESTABLISHED','recipient_execution_authenticated':False,
      'origin_sha256':sha(origin_raw),'return_sha256':sha(returned_raw),'return_id':return_id,'recipient_id':recipient_id,
      'authority':closed_authority()}

def receiver_packet(origin_raw):
    c=decode(origin_raw);need(c['source_class']=='SYNTHETIC','GENUINE_RECEIVER_ADMISSION_HELD')
    text=origin_raw.decode('utf8')
    return canon({'schema':'td613.synthetic-research-packet/v1','packet_id':c['packet_id'],'source_class':'SYNTHETIC',
      'source_id':c['source_id'],'capture_id':c['capture_id'],'source_text':text,'source_sha256':sha(origin_raw),
      'method_rows':[{'carrier_sha256':sha(origin_raw),'method_result':c['method_result']}],'relations':[]})

def restore_capsule(raw,*,expected_sha256=None):
    need(expected_sha256 is not None and sha(raw)==expected_sha256,'INDEPENDENT_CAPSULE_PIN_REQUIRED_OR_MISMATCH')
    c=parse(raw);keys(c,['schema','capsule_id','estate_id','version','predecessor_sha256','snapshot_refs','method_configs','investigations','hypotheses','refusals','io_lineage','pending_human_decisions','execution_receipts','missing_state','authority'])
    need(c['schema']==CAPSULE and type(c['version']) is int and c['version']==1,'CAPSULE_VERSION');ident(c['capsule_id']);ident(c['estate_id']);authority(c['authority'])
    if c['predecessor_sha256'] is not None:digest(c['predecessor_sha256'])
    for field in ['snapshot_refs','method_configs','investigations','hypotheses','refusals','io_lineage','pending_human_decisions','execution_receipts','missing_state']:need(type(c[field]) is list,'CAPSULE_STATE_LIST_REQUIRED')
    for state in c['investigations']:
        keys(state,['investigation_id','state','source_reference','recorded_at','limitations']);ident(state['investigation_id']);need(state['state'] in ('PAUSED','HELD','PROPOSED','UNRESOLVED','RECORDED'),'UNSUPPORTED_INVESTIGATION_STATE');timestamp(state['recorded_at'])
    return {'restored_state':copy.deepcopy(c),'execution':'NOT_REQUESTED_OR_AUTHORIZED','promotion':'NONE','authority':closed_authority()}
