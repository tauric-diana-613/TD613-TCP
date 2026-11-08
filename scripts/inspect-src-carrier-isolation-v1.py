#!/usr/bin/env python3
"""Inspect bounded host access; never starts an experimental model worker."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys

def inspect(package,history_root):
    package=Path(package).resolve();history=Path(history_root).resolve()
    code="import json,os;from pathlib import Path;print(json.dumps({'history_metadata_path_reachable':Path("+repr(str(history/'.git'))+").exists(),'network_namespace':os.readlink('/proc/self/ns/net'),'environment_keys':sorted(os.environ)}))"
    child=subprocess.run([sys.executable,'-I','-B','-c',code],cwd=package,env={'LANG':'C.UTF-8'},check=True,capture_output=True,text=True,timeout=15)
    observed=json.loads(child.stdout);observed['shares_supervisor_network_namespace']=observed.pop('network_namespace')==os.readlink('/proc/self/ns/net')
    try:
        bwrap=subprocess.run(['/usr/bin/bwrap','--unshare-user','--unshare-net','--ro-bind','/usr','/usr','--ro-bind','/lib','/lib','--proc','/proc','--dev','/dev','/usr/bin/true'],capture_output=True,text=True,timeout=5)
        sandbox_probe={'exit_code':bwrap.returncode,'stderr':bwrap.stderr.strip()}
    except (OSError,subprocess.TimeoutExpired) as exc:
        sandbox_probe={'status':'UNAVAILABLE_OR_TIMED_OUT','error_class':type(exc).__name__}
    return {'schema':'td613.carrier-host-isolation-inspection/v1','package_git_metadata_present':any(p.name=='.git' for p in package.rglob('*')),
      'bounded_python_process':observed,'bubblewrap_network_probe':sandbox_probe,
      'host_history_boundary':'NOT_ENFORCED' if observed['history_metadata_path_reachable'] else 'NOT_ESTABLISHED',
      'network_boundary':'NOT_ENFORCED' if observed['shares_supervisor_network_namespace'] else 'NOT_ESTABLISHED',
      'isolated_reasoning_worker_exposure':0,'genuine_source_admissions':0,'flight':'HELD_ISOLATION_AND_SPECIFIC_ADMISSION_CONTRACT'}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--package',required=True);p.add_argument('--history-root',required=True);p.add_argument('--output',required=True);a=p.parse_args();result=inspect(a.package,a.history_root)
    with Path(a.output).open('x') as f:json.dump(result,f,indent=2,sort_keys=True);f.write('\n')
    print(json.dumps(result,indent=2,sort_keys=True))
if __name__=='__main__':main()
