import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {digest} from '../scripts/experiment-b-resumable/journal.mjs';
import {CustodyStore} from '../scripts/experiment-b-operational/custodian/store.mjs';
export const key=Buffer.from('SYNTHETIC_PUBLIC_ISSUER_ROOT_NEVER_PRODUCTION_000001');
export const checkpointKey=Buffer.from('SYNTHETIC_PUBLIC_CHECKPOINT_ROOT_NOT_ISSUER_000001');
export const issuer='SYNTHETIC_EXPERIMENT_B_CUSTODIAN';
export const audience='SYNTHETIC_CONTROLLER_AUDIENCE';
export const context={experiment:'SYNTHETIC',episode:'SYNTHETIC_EPISODE',audience,shi:'TD613-SH-9B07D8B-A1B2C3D4',
  ...Object.fromEntries(['safeHarborPacketReplayDigest','safeHarborPacketRecordDigest','planDigest','policyDigest','sourceManifestDigest','decisionsDigest','executionAuthorizationDigest'].map(k=>[k,digest(k)]))};
export const binding=(suffix='1')=>({dispatchId:'SYNTHETIC_DISPATCH_'+suffix,attempt:'SYNTHETIC_TURN_'+suffix+'/attempt-1',captureId:'SYNTHETIC_CAPTURE_'+suffix,
  image:'SYNTHETIC_IMAGE',...Object.fromEntries(['executableSHA256','promptSHA256','argumentsDigest','runtimePolicyDigest','inputMeasurementDigest'].map(k=>[k,digest(k)]))});
export function mandate(){const b=binding();return {id:'SYNTHETIC_MANDATE',context,expires:100000,maxPermits:3,allowedAttempts:['1','2','3'].map(x=>binding(x).attempt),
  permitLifetimeMs:10000,operatorAuthorizationEvidenceDigest:digest('SYNTHETIC_GESTURE_NOT_HUMAN_AUTHORITY'),
  bindingPolicy:{executableSHA256:b.executableSHA256,runtimePolicyDigest:b.runtimePolicyDigest,image:b.image}};}
export function open(paths,now=()=>1000){return new CustodyStore({...paths,key,checkpointKey,issuer,audience,now});}
export function fixture(t){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'td613-custodian-synthetic-'));
  t.after(()=>{if(path.dirname(dir)!==os.tmpdir()||!path.basename(dir).startsWith('td613-custodian-synthetic-'))throw Error('TEST_CLEANUP_BOUNDARY');fs.rmSync(dir,{recursive:true,force:true});});
  const paths={database:path.join(dir,'synthetic.sqlite'),anchorLog:path.join(dir,'synthetic-anchor.jsonl')};
  CustodyStore.initializeEmpty(paths);const store=open(paths);store.approveMandate(mandate());
  return {dir,paths,store};
}
