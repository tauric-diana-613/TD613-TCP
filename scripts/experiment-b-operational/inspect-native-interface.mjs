import {spawnSync} from 'node:child_process';
import {PINNED_IMAGE} from './docker-capture-runtime.mjs';
import {digest} from '../experiment-b-resumable/journal.mjs';
import {NATIVE_SETTINGS} from './native-settings.mjs';
// Offline diagnostic only: none of these commands creates a model turn.
const base=['run','--rm','--network','none','--read-only','--cap-drop','ALL',
  '--security-opt','no-new-privileges=true','--user','65534:65534',
  '--tmpfs','/scratch:rw,noexec,nosuid,nodev,size=16m,uid=65534,gid=65534',
  '--env','HOME=/scratch','--env','CODEX_HOME=/scratch',
  '--entrypoint','/usr/local/bin/codex',PINNED_IMAGE];
const settings=NATIVE_SETTINGS;
const overrides=Object.entries(settings).flatMap(([k,v])=>['-c',`${k}=${JSON.stringify(v)}`]);
const runs=[['execHelp',['exec','--help']],['features',[...overrides,'features','list']],
  ['startupConfig',[...overrides,'app-server','--print-startup-config']]];
const observations={};
for(const [name,args] of runs){
  const r=spawnSync('docker',[...base,...args],{encoding:'utf8',windowsHide:true,timeout:30000,maxBuffer:1024*1024,stdio:['ignore','pipe','pipe']});
  observations[name]={exitCode:r.status,errorCode:r.error?.code??null,stdoutSHA256:digest(Buffer.from(r.stdout??'')),
    stderrSHA256:digest(Buffer.from(r.stderr??''))};
  // These are offline container diagnostics, never a logged-in account result.
  if(r.status!==0)observations[name].configurationDiagnostics=(r.stderr??'').split('\n').slice(0,14);
  if(name==='execHelp')observations[name].documentedFlags=['--ignore-user-config','--ignore-rules','--output-last-message','--json','--ephemeral','--strict-config'].filter(x=>r.stdout?.includes(x));
  if(name==='features'){
    observations[name].configuredFeatureStates=Object.fromEntries(Object.keys(settings).filter(k=>k.startsWith('features.')).map(k=>{
      const key=k.slice(9),found=(r.stdout??'').match(new RegExp('^'+key+'\\s+.*\\s+(true|false)\\s*$','m'));
      return [key,found?found[1]==='true':null];}));
    observations[name].allRequestedFeatureStatesObserved=Object.entries(observations[name].configuredFeatureStates).every(([k,v])=>v===settings['features.'+k]);
  }
}
console.log(JSON.stringify({evidenceClass:'ACTUAL_OFFLINE_NATIVE_NON_INFERENTIAL_INTERFACE',image:PINNED_IMAGE,
  observations,requestedSettings:settings,nativeModelTokensPrecount:'NOT_ESTABLISHED',
  effectiveSubscriptionContextAndOutputCeilings:'NOT_ATTESTED',servedModel:'NOT_OBSERVED',modelRequests:0},null,2));
if(Object.values(observations).some(o=>o.exitCode!==0)||!observations.features.allRequestedFeatureStatesObserved)process.exitCode=1;
