import {digest,canonical} from '../experiment-b-resumable/journal.mjs';
export const STRICT='STRICT_EFFECTIVE_CONTEXT_WARRANT';
export const OBSERVATIONAL='CONDITIONAL_OBSERVATIONAL_COMPARISON';
export const CLAIM_RESTRICTIONS=Object.freeze(['NO_EXACT_SERVED_TOKEN_WARRANT','NO_EFFECTIVE_PROVIDER_CEILING_WARRANT',
  'NO_EQUAL_HIDDEN_COMPUTE_WARRANT','NO_LOSSLESS_PROVIDER_RETENTION_WARRANT','OBSERVATIONAL_OUTPUT_COMPARISON_ONLY']);
const fail=c=>{throw Object.assign(Error(c),{code:c});};
export const finiteProduct=(a,b)=>{const v=a*b;if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||a<0||b<0||!Number.isSafeInteger(v))fail('RESOURCE_OVERFLOW_HOLD');return v;};
export function evidenceMode(p){
  if(!p)return STRICT;
  if(![STRICT,OBSERVATIONAL].includes(p.mode)||p.version!==1)fail('D04_EVIDENCE_STANDARD_REQUIRED');
  if(p.mode===OBSERVATIONAL&&(p.model!=='gpt-6.1-sol'||p.effort!=='xhigh'||
    p.planningContext!==500000||p.planningGuard!==450000||p.outputReservation!==25000||
    canonical(p.claimRestrictions)!==canonical(CLAIM_RESTRICTIONS)))fail('OBSERVATIONAL_POLICY_SCOPE_REQUIRED');
  return p.mode;
}
export function observationalMeasurement(text,p){
  if(evidenceMode(p)!==OBSERVATIONAL||typeof text!=='string'||!text.isWellFormed())fail('OBSERVATIONAL_TEXT_POLICY_REQUIRED');
  const payloadBytes=Buffer.byteLength(text);
  return {kind:'OBSERVABLE_BYTE_PLANNING_PROXY',payloadBytes,planningProxyUnits:payloadBytes,
    proxyDefinition:'ONE_SUBMITTED_UTF8_BYTE_PER_ADMINISTRATIVE_UNIT_NOT_TOKENS',
    measuredTokens:null,upperBound:null,providerReportedTokens:null,unknownOverhead:true,
    hiddenProviderEnvelope:'UNKNOWN',effectiveOutputCeiling:'UNKNOWN',providerRetainedContext:'UNKNOWN',
    promptSHA256:digest(Buffer.from(text)),evidenceDigest:digest(p)};
}
export function validateObservationalRecord(m,text,p){
  if(canonical(m)!==canonical(observationalMeasurement(text,p)))fail('OBSERVATIONAL_PROXY_ATTESTATION_CONFLICT');
  return {...m,guardTokens:null};
}
export function planningMonitor(m,p){
  evidenceMode(p);
  if(m.planningProxyUnits+p.outputReservation>=p.planningGuard)fail('OBSERVATIONAL_PLANNING_MARGIN_HOLD');
  return {units:m.planningProxyUnits+p.outputReservation,unitClass:'ADMINISTRATIVE_PROXY_NOT_PROVIDER_TOKENS',
    effectiveLimitEnforced:false,hiddenOverhead:'UNKNOWN'};
}
export function plannedAuthority(lanes){
  if(!Array.isArray(lanes)||!lanes.length)fail('FROZEN_PRIVATE_SCHEDULE_REQUIRED');
  let perArm=0;
  for(const lane of lanes){if(!Array.isArray(lane.sourceOrder)||!lane.sourceOrder.length||new Set(lane.sourceOrder).size!==lane.sourceOrder.length)fail('COMPLETE_LANE_REQUIRED');
    perArm+=2*lane.sourceOrder.length+2;if(!Number.isSafeInteger(perArm))fail('SCHEDULE_OVERFLOW_HOLD');}
  const attempts=finiteProduct(2,perArm),administrativeUnits=finiteProduct(attempts,450000);
  if(!Number.isSafeInteger(attempts)||!Number.isSafeInteger(administrativeUnits))fail('RESOURCE_OVERFLOW_HOLD');
  return {attempts,perArm,administrativeUnits,units:'ADMINISTRATIVE_CONTEXT_RESERVATION_NOT_PROVIDER_TOKENS'};
}
export function validateObservationalResources(plan,p){
  const a=plannedAuthority(plan.lanes);
  if(plan.context.inputLimit!==500000||plan.context.outputLimit!==25000||plan.model.requested!=='gpt-6.1-sol'||plan.model.effort!=='xhigh'||
    p.accountClass!=='subscription-only'||p.maxUSD!==0||p.reservationUSD!==0||p.maxRejectedRetries!==0||
    p.accountingBasis!=='administrative-context-reservation'||p.maxEpisodeAttempts!==a.attempts||
    p.maxWindowAttempts>a.attempts||p.reservationTokens!==450000||p.maxAccountedTokens!==a.administrativeUnits)
    fail('OBSERVATIONAL_FINITE_MATCHED_AUTHORITY_REQUIRED');
  return a;
}
export function observedFailure(result){
  const keys=['compaction','truncation','contextError','incompleteTurn','sourceOmission','unequalOpportunity'];
  return keys.find(k=>result.observations?.[k]===true)??null;
}
