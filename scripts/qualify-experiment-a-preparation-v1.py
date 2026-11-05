#!/usr/bin/env python3
"""Observed software calibration and owned canaries. Never starts a model."""
import argparse,json,shutil,subprocess,sys,uuid
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from packages.experiment_a_preparation_v1 import kit,blind_task,ledger,isolation
from packages.experiment_a_preparation_v1.common import canonical,digest,read_json,commitment

def qualify(out):
 run_id=uuid.uuid4().hex;origin_id='origin-calibration-'+run_id;recipient_id='recipient-calibration-'+run_id;return_id='return-calibration-'+run_id
 out=Path(out).absolute()
 if out.exists():raise ValueError('EXCLUSIVE_CALIBRATION_DIRECTORY')
 out.mkdir(mode=0o700);sup=out/'supervisory';ev=out/'evaluation';ex=out/'execution';sup.mkdir(mode=0o700);ev.mkdir(mode=0o700)
 exp=kit.export(ex);closure=kit.verify(ex,exp['manifest_sha256']);task=kit.fictional_task();node=Path(shutil.which('node')).resolve();nodehash=digest(node.read_bytes())
 origin={'receipt_id':origin_id,'task':task,'expected_result':blind_task.execute(task,str(node))};(ev/'retained-origin.json').write_bytes(canonical(origin))
 journal=sup/'attempts.jsonl';pin=ledger.create(journal);event={'schema':'td613.experiment-attempt-event/v1','episode_id':task['episode_id'],'attempt_id':'calibration-attempt-'+run_id,'origin_receipt_id':origin['receipt_id'],'source_class':'SYNTHETIC','input_sha256':exp['task_sha256']}
 for stage in ('PREPARED','STARTED'):pin=ledger.append(journal,{**event,'event':stage},pin)
 target=out/'synthetic-return.json'
 r=subprocess.run([sys.executable,'-I','-B',str(ex/'run.py'),str(ex/'TASK.json'),str(target),'--task-sha256',exp['task_sha256'],'--node-executable',str(node),'--node-sha256',nodehash,'--return-id',return_id,'--recipient-id',recipient_id],cwd=ex,env={'LANG':'C.UTF-8'},capture_output=True,text=True,timeout=25)
 if r.returncode:raise RuntimeError(r.stderr[:1200])
 ret=read_json(target.read_bytes());comparison=blind_task.compare(origin,ret,return_id=return_id,recipient_id=recipient_id)
 if not comparison['result_match']:raise ValueError('SYNTHETIC_RESULT_MISMATCH')
 for stage in ('RETURNED','COMPARED','CLOSED'):pin=ledger.append(journal,{**event,'event':stage,'recipient_receipt_id':ret['return_id'],'output_sha256':digest(target.read_bytes()),'comparison_sha256':commitment(comparison)},pin)
 # Challenge actual synthetic evaluation visibility in addition to class canaries.
 check="from pathlib import Path;import sys;print(Path(sys.argv[1]).is_file() and 'expected_result' in Path(sys.argv[1]).read_text())"
 visible=subprocess.check_output([sys.executable,'-I','-B','-c',check,str(ev/'retained-origin.json')],cwd=ex,env={'LANG':'C.UTF-8'},text=True).strip()=='True'
 classes={'schema':'td613.experiment-a.artifact-separation/v1','classes':{'supervisory':{'id':'supervisory-calibration-'+run_id,'directory':'supervisory','mode':oct(sup.stat().st_mode&0o777),'ledger_pin':pin},'execution':{'id':'execution-calibration-'+run_id,'directory':'execution','manifest_sha256':exp['manifest_sha256'],'task_sha256':exp['task_sha256']},'evaluation':{'id':'evaluation-calibration-'+run_id,'directory':'evaluation','mode':oct(ev.stat().st_mode&0o777),'origin_witness_sha256':digest((ev/'retained-origin.json').read_bytes()),'material_class':'SYNTHETIC_EXPECTATION_ONLY'}},'logical_separation':True,'os_independent_custody':'UNQUALIFIED','synthetic_evaluation_readable_from_child':visible}
 (sup/'separation-manifest.json').write_bytes(canonical(classes))
 result={'calibration_run_id':run_id,'schema':'td613.experiment-a.preparation-qualification/v1','source_class':'SYNTHETIC','export':closure,'manifest_sha256':exp['manifest_sha256'],'task_sha256':exp['task_sha256'],'native_code_pins':read_json((kit.PACKAGE/'native/PINS.json').read_bytes()),'observed_software_process':{'exit_code':r.returncode,'python':sys.version.split()[0],'python_executable_sha256':digest(Path(sys.executable).read_bytes()),'node_version':subprocess.check_output([str(node),'--version'],text=True).strip(),'node_executable_sha256':nodehash},'comparison':comparison,'attempt_ledger_checkpoint':pin,'separation_manifest':classes,'isolation':isolation.probe(ex),'genuine_database_execution':'HELD','genuine_source_admissions':0,'model_sessions_started':0,'protected_flights':'HELD'}
 (sup/'qualification.json').write_bytes(canonical(result));return result
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('new_output',type=Path);p.add_argument('--receipt',type=Path,required=True);a=p.parse_args();r=qualify(a.new_output)
 with a.receipt.open('x',encoding='utf8') as f:json.dump(r,f,ensure_ascii=False,indent=2);f.write('\n')
 print(json.dumps({'synthetic_result_match':r['comparison']['result_match'],'payload_files':r['export']['files'],'isolation':r['isolation']['package_os_isolation'],'model_sessions':0,'genuine_admissions':0},indent=2))
