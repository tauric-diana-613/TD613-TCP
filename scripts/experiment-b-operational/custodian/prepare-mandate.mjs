import {ARMS,rounds,validatePlan} from '../../experiment-b-resumable/engine.mjs';
import {digest} from '../../experiment-b-resumable/journal.mjs';
/** Administrative derivation from a lawfully frozen private plan. Never reads
 * source bodies, signs, submits a permit or invents corpus/schedule membership.
 */
export function prepareMandate({plan,context,id,expires,permitLifetimeMs,bindingPolicy,operatorAuthorizationEvidenceDigest}){
  validatePlan(plan);
  if(context?.planDigest!==digest(plan)||context.experiment!==plan.experiment||context.episode!==plan.episode)throw Error('FROZEN_PRIVATE_PLAN_BINDING_REQUIRED');
  const allowedAttempts=[];
  for(const lane of plan.lanes)for(let r=0;r<rounds(lane).length;r++)for(const arm of ARMS){
    if(!Number.isSafeInteger(allowedAttempts.length+1))throw Error('FINITE_SCHEDULE_OVERFLOW');
    allowedAttempts.push(lane.id+'/'+r+'/'+arm+'/attempt-1');
  }
  return {id,context,expires,permitLifetimeMs,bindingPolicy,operatorAuthorizationEvidenceDigest,maxPermits:allowedAttempts.length,allowedAttempts};
}
