/**
 * TD613 · Human Composer WebAuthn verification adapter / RGI19.
 *
 * Host ONLY. Never import in client-side Podium or accept a trust store from
 * task JSON. Credential enrollment and key registration MUST happen separately
 * through a verified human identity ceremony, not through this module.
 * This is a verification primitive; no live enrollment endpoint is installed.
 */
import {createHash,createPublicKey,verify,timingSafeEqual} from 'node:crypto';

export const HUMAN_WEBAUTHN_SCHEMA='td613.vixen.compose.human-webauthn/v1';
const SHA=/^[a-f0-9]{64}$/;
const REV=/^[a-f0-9]{40}$/;
const is=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const utf8=x=>Buffer.from(x,'utf8');
const fail=reason=>{throw Object.assign(new Error(reason),{code:reason})};
const b64=x=>Buffer.from(x).toString('base64url');
function decode(x,max=8192){
 if(typeof x!=='string'||x.length<8||x.length>max||!/^[A-Za-z0-9_-]+$/.test(x))fail('INVALID_AUTHENTICATOR_ENCODING');
 const raw=Buffer.from(x,'base64url');
 if(b64(raw)!==x)fail('NONCANONICAL_AUTHENTICATOR_ENCODING');
 return raw;
}
function stable(x) {
 if(Array.isArray(x))return x.map(stable);
 if(is(x))return Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])]));
 return x;
}
function digest(x){return createHash('sha256').update(x).digest()}
function equal(a,b){return a.length===b.length&&timingSafeEqual(a,b)}
export function encodeHumanComposeChallenge(challenge){
 if(!is(challenge)||challenge.schema!=='td613.vixen.podium.human-request/v1'||
 !SHA.test(challenge.score_digest)||!REV.test(challenge.source_revision)||
 !/^[a-f0-9]{48}$/.test(challenge.nonce)||
 challenge.approval_scope!=='LOCAL_RESEARCH_COMPOSITION_PREVIEW'||
 !Array.isArray(challenge.requested_effects)||
 challenge.complete_score?.score_digest!==challenge.score_digest||
 challenge.complete_score?.source_revision!==challenge.source_revision)fail('INVALID_EXACT_SCORE_CHALLENGE');
 // Every requested effect and the complete Score are bound into the challenge.
 return b64(digest(utf8(JSON.stringify(stable(challenge)))));
}
export function createWebAuthnHumanApprovalVerifier({
 rpId,allowedOrigins=[],credentials=[],consumeAssertion=null,now=()=>Date.now(),
 maxChallengeAgeMs=300000
}={}){
 if(typeof rpId!=='string'||!rpId||!Array.isArray(allowedOrigins)||!allowedOrigins.length||
 !allowedOrigins.every(o=>typeof o==='string'&&o.startsWith('https://'))||
 !Array.isArray(credentials)||typeof consumeAssertion!=='function')fail('HELD_TRUSTED_HOST_ENROLLMENT_OR_LEDGER_MISSING');
 const trusted=new Map();
 for(const c of credentials){
  if(!is(c)||typeof c.credential_id!=='string'||!c.credential_id||
    c.human_enrollment_verified!==true||typeof c.human_principal!=='string'||
    !c.human_principal||typeof c.public_key_spki_pem!=='string')fail('HELD_UNVERIFIED_CREDENTIAL_ENROLLMENT');
  if(trusted.has(c.credential_id))fail('DUPLICATE_HOST_CREDENTIAL');
  const key=createPublicKey(c.public_key_spki_pem);
  if(key.asymmetricKeyType!=='ec'||key.asymmetricKeyDetails?.namedCurve!=='prime256v1')
    fail('UNSUPPORTED_HOST_CREDENTIAL_KEY');
  trusted.set(c.credential_id,{...c,key});
 }
 return async function verifyHumanApproval({challenge,proof,score}={}){
  if(!is(proof)||!is(challenge)||score?.score_digest!==challenge.score_digest)
   fail('HELD_HUMAN_ASSERTION_AND_SCORE_REQUIRED');
  const c=trusted.get(proof.credential_id);
  if(!c)fail('HELD_CREDENTIAL_NOT_IN_INDEPENDENT_HOST_REGISTRY');
  const expected=encodeHumanComposeChallenge(challenge);
  const clientRaw=decode(proof.client_data_json_b64url);
  let client;try{client=JSON.parse(clientRaw.toString('utf8'))}catch{fail('INVALID_WEBAUTHN_CLIENT_DATA')}
  if(!is(client)||client.type!=='webauthn.get'||client.crossOrigin===true||
    !allowedOrigins.includes(client.origin)||client.challenge!==expected)
    fail('HELD_WEBAUTHN_ORIGIN_TYPE_OR_SCORE_CHALLENGE_MISMATCH');
  const auth=decode(proof.authenticator_data_b64url);
  if(auth.length<37)fail('INVALID_AUTHENTICATOR_DATA');
  if(!equal(auth.subarray(0,32),digest(utf8(rpId))))fail('HELD_WEBAUTHN_RPID_MISMATCH');
  const flags=auth[32];
  if((flags&0x01)===0||(flags&0x04)===0)fail('HELD_HUMAN_PRESENCE_AND_VERIFICATION_REQUIRED');
  const counter=auth.readUInt32BE(33);
  if(counter===0)fail('HELD_MONOTONIC_AUTHENTICATOR_COUNTER_REQUIRED');
  const signature=decode(proof.signature_b64url,2048);
  const signed=Buffer.concat([auth,digest(clientRaw)]);
  if(!verify('sha256',signed,c.key,signature))fail('HELD_WEBAUTHN_SIGNATURE_INVALID');
  const stamped=Number(challenge.created_at_ms);
  if(!Number.isSafeInteger(stamped)||stamped>now()||
     now()-stamped>maxChallengeAgeMs)fail('HELD_HUMAN_CHALLENGE_EXPIRED');
  const receipt=createHash('sha256').update(signed).update(signature).digest('hex');
  // MUST atomically consume (credential_id, nonce, score_digest) and update
  // the monotonic counter in durable storage. No in-memory fallback.
  if(await consumeAssertion({
     credential_id:c.credential_id,human_principal:c.human_principal,
     nonce:challenge.nonce,score_digest:challenge.score_digest,
     source_revision:challenge.source_revision,sign_count:counter,
     receipt_id:receipt
   })!==true)fail('HELD_REPLAY_OR_DURABLE_CUSTODY_UNAVAILABLE');
  return Object.freeze({
   authenticated_human:true,score_digest:challenge.score_digest,
   nonce:challenge.nonce,source_revision:challenge.source_revision,
   scope:challenge.approval_scope,human_principal:c.human_principal,
   independent_receipt_id:receipt,authenticator:'WEBAUTHN_P256_UV_UP',
   registry_source:'INDEPENDENT_HOST_ENROLLMENT'
  });
 };
}
