#!/usr/bin/env node
/**
 * Research G7 issue-comment replay guard: pin to workflow-source commit
 * before checking out an independently mutable Atelier target branch.
 * This helper neither authorizes provider access nor invokes a provider.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeG7Gesture,claimG7GestureLocal} from
 '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/vixen-g7-epoch-custody.mjs';

const arg=(key)=>{const i=process.argv.indexOf('--'+key);
 return i<0?null:process.argv[i+1]};
export function parseG7WorkflowGesture(a){
 const lease=normalizeG7Gesture({
  source_revision:a.sourceRevision,issue_number:Number(a.issue),
  comment_id:Number(a.comment),author:a.author,command:a.command,
  workflow_run_id:Number(a.run),workflow_run_attempt:Number(a.attempt),
  predecessor_snapshot_id:a.predecessor
 });
 if(!a.root||!path.isAbsolute(a.root)||!a.out||!path.isAbsolute(a.out))
  throw Error('HELD_G7_GESTURE_PATHS_MUST_BE_ABSOLUTE');
 if(!['SRC','WENDBINE'].includes(a.estate))
  throw Error('HELD_G7_GESTURE_ESTATE_INVALID');
 if((a.estate==='SRC'&&lease.issue_number!==758)||
    (a.estate==='WENDBINE'&&lease.issue_number!==1308))
  throw Error('HELD_G7_GESTURE_ESTATE_ISSUE_MISMATCH');
 return lease;
}
export function claimG7WorkflowGesture(a){
 const lease=parseG7WorkflowGesture(a);
 const receipt=claimG7GestureLocal(a.root,lease);
 fs.mkdirSync(path.dirname(a.out),{recursive:true});
 fs.writeFileSync(a.out,JSON.stringify(lease,null,2)+'\n',{flag:'wx',mode:0o600});
 return Object.freeze({...receipt,run_id:lease.workflow_run_id,
  run_attempt:lease.workflow_run_attempt,comment_id:lease.comment_id,
  source_revision:lease.source_revision,
  external_origin_authenticated:false,
  persisted_remotely:false,
  requires_atomic_remote_fast_forward:true});
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const data={root:arg('root'),out:arg('out'),estate:arg('estate'),
  sourceRevision:arg('source-revision'),issue:arg('issue'),
  comment:arg('comment'),author:arg('author'),command:arg('command'),
  run:arg('run'),attempt:arg('attempt'),predecessor:arg('predecessor')};
 const result=claimG7WorkflowGesture(data);
 // A local claim is INSUFFICIENT until a separate Git push succeeds.
 process.stdout.write(JSON.stringify(result)+'\n');
}
