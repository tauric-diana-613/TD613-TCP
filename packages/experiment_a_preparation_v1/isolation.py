"""Owned fictional sentinel challenges only; never real secret/source probes."""
import json,os,shutil,socket,subprocess,sys,tempfile,threading
from pathlib import Path
CLASSES=('repository_history','unapproved_source','provider_credential','experiment_b_corpus','experiment_b_prompt','gold','rankings','prior_experiment_a_unblinding','supervisory_context','withheld_evaluation','shared_storage')
def probe(package):
 with tempfile.TemporaryDirectory(prefix='td613-sentinels-') as f:
  root=Path(f);targets={}
  for k in CLASSES:
   p=root/k/'fictional.sentinel';p.parent.mkdir(mode=0o700);p.write_text('FICTIONAL_SENTINEL:'+k);targets[k]=str(p)
  server=socket.socket();server.bind(('127.0.0.1',0));server.listen(1);server.settimeout(2);port=server.getsockname()[1]
  def respond():
   try:
    c,_=server.accept()
    with c:c.sendall(b'FICTIONAL_NETWORK_SENTINEL')
   except OSError:pass
  thread=threading.Thread(target=respond,daemon=True);thread.start()
  code="""import json,os,socket,sys
from pathlib import Path
out={}
for k,p in json.loads(sys.argv[1]).items():
 try:out[k]=Path(p).read_text().startswith('FICTIONAL_SENTINEL:')
 except OSError:out[k]=False
s=socket.socket();s.settimeout(1)
try:s.connect(('127.0.0.1',int(sys.argv[2])));network=s.recv(64)==b'FICTIONAL_NETWORK_SENTINEL'
except OSError:network=False
finally:s.close()
print(json.dumps({'forbidden_sentinel_readable':out,'host_loopback_reachable':network,'environment_keys':sorted(os.environ),'shared_network_namespace':os.readlink('/proc/self/ns/net')==sys.argv[3]}))
"""
  try:
   r=subprocess.run([sys.executable,'-I','-B','-c',code,json.dumps(targets),str(port),os.readlink('/proc/self/ns/net')],cwd=package,env={'LANG':'C.UTF-8'},capture_output=True,text=True,check=True,timeout=8);observed=json.loads(r.stdout)
  finally:server.close();thread.join(timeout=1)
  sandbox={}
  for name,args in [('bubblewrap',['bwrap','--unshare-all','--die-with-parent','--ro-bind','/usr','/usr','--ro-bind','/lib','/lib','--proc','/proc','--dev','/dev','/usr/bin/true']),('unshare',['unshare','--user','--map-root-user','--net','--mount','/usr/bin/true'])]:
   if not shutil.which(args[0]):sandbox[name]={'status':'UNAVAILABLE'};continue
   try:
    p=subprocess.run(args,capture_output=True,text=True,timeout=5);sandbox[name]={'exit_code':p.returncode,'stderr':p.stderr.strip()[:800],'qualification':'BOOTSTRAP_ONLY_NOT_FULL_ISOLATION_PROOF'}
   except subprocess.TimeoutExpired:sandbox[name]={'status':'TIMEOUT','seconds':5}
 return {'schema':'td613.execution-boundary-adversarial-inspection/v1','probe_input_class':'OWNED_FICTIONAL_SENTINELS_ONLY','observed':observed,'candidate_os_sandbox_bootstraps':sandbox,'package_os_isolation':'HELD','provider_context_and_retention_isolation':'UNOBSERVED','external_egress_test':'NOT_PERFORMED; host loopback and namespace only','model_sessions_started':0,'genuine_source_admissions':0,'automatic_authorization':False}
