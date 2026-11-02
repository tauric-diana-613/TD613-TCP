import {spawnSync} from 'node:child_process';
export function windowsAudit(c){
  if(process.platform!=='win32')throw Error('WINDOWS_INDEPENDENT_AUDIT_REQUIRED');
  const call=(mode,record)=>{
    const r=spawnSync(c.pipeClient,[mode,'TD613Custody',c.custodianSid,c.issuer],{
      input:record?JSON.stringify(record):'',encoding:'utf8',windowsHide:true,timeout:10000,maxBuffer:65536,
      env:{SystemRoot:process.env.SystemRoot}});
    if(r.error||r.status!==0)throw Error('INDEPENDENT_SYSTEM_AUDIT_UNAVAILABLE_HOLD');
    return JSON.parse(r.stdout);
  };
  return {minimum:()=>call('--audit-read'),publish:record=>{
    if(call('--audit-publish',record)?.status!=='OK')throw Error('INDEPENDENT_SYSTEM_AUDIT_UNCERTAIN_HOLD');
  }};
}
