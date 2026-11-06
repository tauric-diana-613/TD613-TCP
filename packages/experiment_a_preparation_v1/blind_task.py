"""Result-free synthetic calibration. Matching output cannot prove hidden execution."""
import argparse,subprocess
from pathlib import Path
from .common import read_json,canonical,commitment,digest
HERE=Path(__file__).resolve().parent
METHOD={'method_id':'WENDBINE_PUBLIC_COMPILER_V01','revision':'520e3db76af8f1c76618bd678456c543ec37b3e5','executable_sha256':'1e87e611524fc25ccb33c7ce63d51a7edfc92ea926c28ed2347c44f99fb45bb0'}
KEYS={'schema','episode_id','task_id','source_class','source_id','capture_id','method','inputs','authority'}
def validate(t):
 if set(t)!=KEYS or t.get('schema')!='td613.experiment-a.result-free-task/v1':raise ValueError('RESULT_FREE_CLOSED_SCHEMA')
 if t['source_class']!='SYNTHETIC':raise ValueError('GENUINE_ADMISSION_NOT_AUTHORIZED')
 if t['method']!=METHOD or t['authority']!={'admission':False,'flight':False,'scientific_promotion':False}:raise ValueError('METHOD_OR_AUTHORITY')
 if set(t['inputs'])!={'meta','posts','registry'}:raise ValueError('INPUT_CLOSURE')
 if any(not isinstance(t[k],str) or not t[k] for k in ('episode_id','task_id','source_id','capture_id')):raise ValueError('TASK_IDENTITY')
 return t
def execute(t,node):
 validate(t)
 for pin in read_json((HERE/'native/PINS.json').read_bytes()):
  if digest((HERE/pin['export_path']).read_bytes())!=pin['sha256']:raise ValueError('NATIVE_CODE_DRIFT')
 if not Path(node).is_absolute():raise ValueError('ABSOLUTE_NODE_REQUIRED')
 r=subprocess.run([node,str(HERE/'run-wendbine-task.mjs')],input=canonical(t['inputs']),capture_output=True,check=True,timeout=20)
 return read_json(r.stdout)
def returned(t,result,*,return_id,recipient_id):
 validate(t)
 if any(not isinstance(x,str) or not x for x in (return_id,recipient_id)):raise ValueError('RETURN_IDENTITIES')
 return {'schema':'td613.experiment-a.blind-return/v1','episode_id':t['episode_id'],'task_id':t['task_id'],'task_sha256':commitment(t),'return_id':return_id,'recipient_id':recipient_id,'result':result}
def compare(origin,ret,*,return_id,recipient_id):
 t=validate(origin['task'])
 if set(ret)!={'schema','episode_id','task_id','task_sha256','return_id','recipient_id','result'} or ret['schema']!='td613.experiment-a.blind-return/v1':raise ValueError('RETURN_SCHEMA')
 if origin['receipt_id'] in (return_id,recipient_id):raise ValueError('RECEIPT_IDENTITY_COLLAPSE')
 if any(ret[k]!=v for k,v in {'episode_id':t['episode_id'],'task_id':t['task_id'],'task_sha256':commitment(t),'return_id':return_id,'recipient_id':recipient_id}.items()):raise ValueError('RETURN_BINDING')
 return {'result_match':canonical(ret['result'])==canonical(origin['expected_result']),'origin_receipt_id':origin['receipt_id'],'return_id':return_id,'recipient_id':recipient_id,'recipient_execution_authenticated':False,'scientific_inference':'UNESTABLISHED','automatic_authorization':False}
def main():
 p=argparse.ArgumentParser();p.add_argument('task',type=Path);p.add_argument('output',type=Path);p.add_argument('--task-sha256',required=True);p.add_argument('--node-executable',required=True);p.add_argument('--node-sha256',required=True);p.add_argument('--return-id',required=True);p.add_argument('--recipient-id',required=True);a=p.parse_args()
 raw=a.task.read_bytes()
 if digest(raw)!=a.task_sha256 or digest(Path(a.node_executable).read_bytes())!=a.node_sha256:raise ValueError('INDEPENDENT_TASK_RUNTIME_PIN')
 t=read_json(raw);ret=returned(t,execute(t,a.node_executable),return_id=a.return_id,recipient_id=a.recipient_id)
 with a.output.open('xb') as f:f.write(canonical(ret))
if __name__=='__main__':main()
