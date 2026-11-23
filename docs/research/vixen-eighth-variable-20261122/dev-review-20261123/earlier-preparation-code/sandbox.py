import pathlib,subprocess,resource,os,json,time,datetime
ROOT=pathlib.Path(__file__).resolve().parents[1]
NODE='/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node'
def sandbox(argv,*,input_path=None,app=False,output=None,timeout=30):
 args=['/usr/bin/unshare','--user','--map-root-user','--net','/usr/bin/bwrap','--unshare-pid','--unshare-ipc','--unshare-uts','--die-with-parent','--new-session','--ro-bind','/usr','/usr','--ro-bind','/lib','/lib','--ro-bind','/lib64','/lib64','--symlink','usr/bin','/bin','--proc','/proc','--dev','/dev','--tmpfs','/tmp','--dir','/work','--chdir','/work','--clearenv','--setenv','PATH','/usr/bin:/bin','--setenv','LANG','C.UTF-8','--dir','/runner','--ro-bind',str(ROOT/'scripts'),'/runner','--ro-bind',str(ROOT/'protocol'),'/protocol']
 if input_path:args+=['--ro-bind',str(pathlib.Path(input_path).resolve()),'/input.pdf']
 if app:args+=['--ro-bind',str(ROOT/'baseline/app'),'/app','--dir','/runtime','--ro-bind',NODE,'/runtime/node']
 def limit():
  resource.setrlimit(resource.RLIMIT_CPU,(20,20));resource.setrlimit(resource.RLIMIT_AS,(1073741824,1073741824));resource.setrlimit(resource.RLIMIT_FSIZE,(33554432,33554432));resource.setrlimit(resource.RLIMIT_NOFILE,(128,128));resource.setrlimit(resource.RLIMIT_CORE,(0,0))
 start=time.monotonic();r=subprocess.run(args+argv,stdout=subprocess.PIPE,stderr=subprocess.PIPE,env={'PATH':'/usr/bin:/bin'},close_fds=True,timeout=timeout,preexec_fn=limit)
 receipt={'recorded_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'arguments':argv,'elapsed_seconds':time.monotonic()-start,'exit_code':r.returncode,'stdout_bytes':len(r.stdout),'stderr':r.stderr.decode(errors='replace'),'sandbox':'NETWORK_NAMESPACE_FILESYSTEM_ISOLATION_CLEARED_ENV','input_hash_bound_separately':True}
 if output:
  p=pathlib.Path(output);assert not p.exists();p.write_bytes(r.stdout);p.with_suffix(p.suffix+'.receipt.json').write_text(json.dumps(receipt,indent=2))
 return r,receipt
if __name__=='__main__':
 import sys
 r,receipt=sandbox(sys.argv[1:],app=True);print(json.dumps(receipt));print(r.stdout.decode(errors='replace'))
