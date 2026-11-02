import {createHmac,timingSafeEqual} from 'node:crypto';
import {canonical,digest} from '../experiment-b-resumable/journal.mjs';

// Reuses Safe Harbor's documented detached JWS request-signing mechanism under
// an explicit new purpose. Historical tokens, keys and scopes remain untouched.
// No signer, default key, ledger, grant issuer, network client or model dispatch.
export const SAFE_HARBOR_NAMESPACE=Object.freeze({principal:'tauric.diana.613',
  heritageKey:'Tauric Diana',covenantKey:'Khona\u200clit-po',
  canonicalCovenant:'Tauric Diana — Crimean heritage custodianship',displayCovenant:'Blood Rite 613',
  claimedPUA:'U+10D613',utf16:'\\uDBF5\\uDE13',bindingFragment:'#9B07D8B',sac:'SAC[X6ZNK5NO51]'});
const OPERATION='EXPERIMENT_B_NATIVE_DISPATCH';
const schema='TD613_SAFE_HARBOR_FLIGHT_DISPATCH_V1';
export const EXPERIMENT_B_CUSTODY_LANE='experiment-b-custody/v1';
// Wild Field proposals are carried intact for later prospective review. This
// creates no key, signature, approval, trusted scope or adaptive execution loop.
export function proposeSafeHarborUse({proposedPurpose,rationale,declaredAttribution,provenance}={}){
  if(![proposedPurpose,rationale,declaredAttribution].every(x=>typeof x==='string'&&x.trim())||
    provenance===undefined)throw Error('ATTRIBUTED_PROPOSAL_REQUIRED');
  const record={schema:'TD613_SAFE_HARBOR_USE_PROPOSAL_V1',status:'UNANTICIPATED_CANDIDATE',
    namespace:SAFE_HARBOR_NAMESPACE,proposedPurpose,rationale,declaredAttribution,
    attributionVerified:false,provenance,executionAuthorized:false,
    adoption:'SEPARATE_PROSPECTIVE_HUMAN_AND_INDEPENDENT_REVIEW_REQUIRED'};
  plainData(record);const text=canonical(record);if(Buffer.byteLength(text)>65536)throw Error('PROPOSAL_RECORD_BOUND_HOLD');
  return JSON.parse(text);
}
const hold=()=>{throw Error('SAFE_HARBOR_EXTERNAL_DISPATCH_AUTHORITY_REQUIRED');};
const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
// Portable Loom's data-before-digest discipline, scoped to this adapter: reject
// accessors/exotic objects rather than executing getters during canonicalization.
function plainData(v,budget={nodes:0},depth=0){
  if(++budget.nodes>10000||depth>24)hold();
  if(v===null||typeof v==='boolean')return;
  if(typeof v==='string'){if(v.length>65536)hold();return;}
  if(typeof v==='number'&&Number.isFinite(v))return;
  if(typeof v!=='object')hold();
  const array=Array.isArray(v),proto=Object.getPrototypeOf(v);
  if(!array&&proto!==Object.prototype&&proto!==null)hold();
  if(array&&Reflect.ownKeys(v).length!==v.length+1)hold();
  for(const key of Reflect.ownKeys(v)){
    if(array&&key==='length')continue;
    if(typeof key!=='string'||['__proto__','constructor','prototype'].includes(key))hold();
    const d=Object.getOwnPropertyDescriptor(v,key);if(!d||!('value' in d))hold();
    plainData(d.value,budget,depth+1);
  }
}
function decode(value){
  if(typeof value!=='string'||!value||!/^[A-Za-z0-9_-]+$/.test(value))hold();
  const bytes=Buffer.from(value,'base64url');if(bytes.toString('base64url')!==value)hold();return bytes;
}
function copyRoots(trustedIssuers){
  return new Map(Object.entries(trustedIssuers??{}).map(([id,r])=>{
    if(!r||typeof r.lane!=='string'||!r.lane||typeof r.application!=='string'||!r.application||r.application==='*'||
      typeof r.namespacePrincipal!=='string'||!r.namespacePrincipal||
      !Array.isArray(r.operations)||!r.operations.length||r.operations.some(op=>typeof op!=='string'||!op||op==='*')||
      ![r.validFrom,r.validUntil,r.maxPermitLifetimeMs].every(Number.isSafeInteger)||
      r.validFrom<0||r.validUntil<=r.validFrom||r.maxPermitLifetimeMs<1||
      !(typeof r.key==='string'||Buffer.isBuffer(r.key))||Buffer.byteLength(r.key)<32)hold();
    return [id,{key:Buffer.from(r.key),lane:r.lane,application:r.application,namespacePrincipal:r.namespacePrincipal,operations:[...r.operations],
      validFrom:r.validFrom,validUntil:r.validUntil,maxPermitLifetimeMs:r.maxPermitLifetimeMs}];
  }));
}
function verify(envelope,roots,scope,clock){
  plainData(envelope);
  if(!envelope||envelope.lane!==scope.lane||typeof envelope.payload!=='string'||Buffer.byteLength(envelope.payload)>65536||
    typeof envelope.detachedJws!=='string'||envelope.detachedJws.length>8192)hold();
  const parts=envelope.detachedJws.split('.');if(parts.length!==3||parts[1]!=='')hold();
  let header,payload;try{header=JSON.parse(decode(parts[0]).toString('utf8'));payload=JSON.parse(envelope.payload);}catch{hold();}
  plainData(header);plainData(payload);
  if(!header||typeof header!=='object'||!payload||typeof payload!=='object'||header.alg!=='HS256'||
    typeof header.kid!=='string'||Object.keys(header).some(k=>!['alg','kid','typ'].includes(k))||
    header.typ!=='TD613-SCOPED-AUTHORIZATION+JWS')hold();
  const root=roots.get(header.kid);
  if(!root||root.lane!==scope.lane||root.application!==scope.application||root.namespacePrincipal!==scope.namespace.principal||
    !root.operations.includes(scope.operation)||canonical(payload)!==envelope.payload)hold();
  const expected=createHmac('sha256',root.key).update(parts[0]+'.'+Buffer.from(envelope.payload).toString('base64url')).digest();
  const signature=decode(parts[2]);
  if(signature.length!==expected.length||!timingSafeEqual(signature,expected))hold();
  const {issuer,authorizationId,issuedAt,notBefore,expires,...actualScope}=payload;
  if(![clock,issuedAt,notBefore,expires].every(Number.isSafeInteger)||issuer!==header.kid||
    typeof authorizationId!=='string'||!authorizationId||issuedAt<root.validFrom||issuedAt>notBefore||
    notBefore>clock||expires<=clock||expires>root.validUntil||expires-issuedAt>root.maxPermitLifetimeMs||
    canonical(actualScope)!==canonical(scope))hold();
  return payload;
}
/** Reusable verification only. A new application must declare an exact scope,
 * explicit purpose/lane, and separately accepted purpose-limited trust roots.
 * This result is NOT consumption, source consent, a grant or execution authority.
 */
export function verifySafeHarborScopedJws({envelope,trustedIssuers,scope,now=Date.now()}={}){
  plainData(scope);
  if(!scope||typeof scope.lane!=='string'||!scope.lane||!scope.operation||scope.operation==='*'||
    typeof scope.application!=='string'||!scope.application||scope.application==='*'||
    typeof scope.namespace?.principal!=='string'||!scope.namespace.principal)hold();
  return verify(envelope,copyRoots(trustedIssuers),JSON.parse(canonical(scope)),now);
}
function contextRequired(c){
  plainData(c);
  if(!c||!c.experiment||!c.episode||!/^TD613-SH-9B07D8B-[A-F0-9]{8}$/.test(c.shi??'')||
    !['safeHarborPacketReplayDigest','safeHarborPacketRecordDigest','planDigest','policyDigest','sourceManifestDigest','decisionsDigest','executionAuthorizationDigest'].every(k=>sha(c[k])))hold();
}

/** Installed ONLY inside the independently accepted external dispatch module.
 * loadEnvelope retrieves the actual operator-authorized Experiment B receipt.
 * consumeAtomically must implement durable UNIQUE(issuer, authorizationId) plus
 * attempt/dispatch exclusion and expiry recheck in the consumption transaction;
 * a process-local Set is not a production service.
 * trustedIssuers are provisioned outside the generator, under a human mandate.
 * This module verifies that supplied trust configuration; it cannot establish
 * the mandate, key custody, independent acceptance or database durability itself.
 */
export function createSafeHarborDispatchBridge({context,trustedIssuers,loadEnvelope,consumeAtomically,now=Date.now}={}){
  contextRequired(context);
  if(!trustedIssuers||typeof loadEnvelope!=='function'||typeof consumeAtomically!=='function'||typeof now!=='function')hold();
  const frozenContext=JSON.parse(canonical(context));
  const roots=copyRoots(trustedIssuers);
  if(![...roots.values()].some(r=>r.lane===EXPERIMENT_B_CUSTODY_LANE&&r.application==='EXPERIMENT_B'&&
    r.namespacePrincipal===SAFE_HARBOR_NAMESPACE.principal&&r.operations.includes(OPERATION)))hold();
  return Object.freeze({async authorizeAndConsume(binding){
    plainData(binding);
    if(!binding?.dispatchId||!binding.attempt||!binding.captureId||
      !['executableSHA256','promptSHA256','argumentsDigest','runtimePolicyDigest','inputMeasurementDigest'].every(k=>sha(binding[k]))||!binding.image)hold();
    // Snapshot before asynchronous resolution. Sign and compare the whole runtime
    // binding, including CLI/image/capture/prompt/policy/input-measurement identity.
    const frozenBinding=JSON.parse(canonical(binding));
    const envelope=await loadEnvelope(structuredClone(frozenBinding));
    const payload=verify(envelope,roots,{schema,application:'EXPERIMENT_B',lane:EXPERIMENT_B_CUSTODY_LANE,operation:OPERATION,
      namespace:SAFE_HARBOR_NAMESPACE,context:frozenContext,binding:frozenBinding},now());
    // A verified overlay is necessary but not sufficient: external durable
    // consumption must succeed before the existing runtime may start a child.
    const accepted=await consumeAtomically({issuer:payload.issuer,authorizationId:payload.authorizationId,
      namespacePrincipal:payload.namespace.principal,scopeDigest:digest(payload),expires:payload.expires,
      dispatchId:frozenBinding.dispatchId,attempt:frozenBinding.attempt});
    if(accepted!==true)hold();return true;
  }});
}
