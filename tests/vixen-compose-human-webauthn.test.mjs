import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,createSign,generateKeyPairSync} from 'node:crypto';
import {createWebAuthnHumanApprovalVerifier,encodeHumanComposeChallenge}
 from '../scripts/vixen-compose-human-webauthn.mjs';
const {publicKey,privateKey}=generateKeyPairSync('ec',{namedCurve:'P-256'});
const sha='a'.repeat(64),rev='b'.repeat(40),rpId='vixen.example.org';
const score={score_digest:sha,source_revision:rev};
const challenge={
 schema:'td613.vixen.podium.human-request/v1',score_digest:sha,source_revision:rev,
 nonce:'a'.repeat(48),approval_scope:'LOCAL_RESEARCH_COMPOSITION_PREVIEW',
 requested_effects:[{type:'VISUAL_FORM_CHANGE',source_ids:['SOURCE-1']}],
 complete_score:score,created_at_ms:1700000000000
};
const origin='https://vixen.example.org',credential_id='credential-test';
function assertion(c=challenge,{uv=true,originOverride=origin,signCount=1}={}){
 const client=Buffer.from(JSON.stringify({type:'webauthn.get',origin:originOverride,
   challenge:encodeHumanComposeChallenge(c)}));
 const rp=createHash('sha256').update(rpId).digest();
 const auth=Buffer.alloc(37);rp.copy(auth);auth[32]=uv?0x05:0x01;auth.writeUInt32BE(signCount,33);
 const signed=Buffer.concat([auth,createHash('sha256').update(client).digest()]);
 const signature=createSign('sha256').update(signed).end().sign(privateKey);
 return {credential_id,client_data_json_b64url:client.toString('base64url'),
  authenticator_data_b64url:auth.toString('base64url'),signature_b64url:signature.toString('base64url')};
}
const credential={credential_id,public_key_spki_pem:publicKey.export({type:'spki',format:'pem'}),
 human_principal:'ENROLLED_TEST_HUMAN',human_enrollment_verified:true};
function fixture(){
 let last=0;const used=new Set();
 const consumeAssertion=async x=>{
   if(x.sign_count<=last||used.has(x.nonce))return false;
   used.add(x.nonce);last=x.sign_count;return true;
 };
 return createWebAuthnHumanApprovalVerifier({
 rpId,allowedOrigins:[origin],credentials:[credential],consumeAssertion,
 now:()=>1700000000100
 });
}
test('denies missing independently enrolled credential and durable counter',()=>{
 assert.throws(()=>createWebAuthnHumanApprovalVerifier({rpId,allowedOrigins:[origin],credentials:[credential]}),/HELD_TRUSTED/);
 assert.throws(()=>createWebAuthnHumanApprovalVerifier({rpId,allowedOrigins:[origin],
  credentials:[{...credential,human_enrollment_verified:false}],consumeAssertion:async()=>true}),/HELD_UNVERIFIED/);
});
test('requires genuine user verification, origin and exact-score challenge',async()=>{
 const v=fixture();
 await assert.rejects(()=>v({challenge,proof:assertion(challenge,{uv:false}),score}),/PRESENCE_AND_VERIFICATION/);
 await assert.rejects(()=>v({challenge,proof:assertion(challenge,{originOverride:'https://other.example.org'}),score}),/ORIGIN_TYPE/);
 await assert.rejects(()=>v({challenge:{...challenge,score_digest:'c'.repeat(64)},proof:assertion(challenge),score}),/CHALLENGE|SCORE/);
});
test('cryptographic UV assertion is independently verified and replay-protected',async()=>{
 const v=fixture(),proof=assertion();
 const result=await v({challenge,score,proof});
 assert.equal(result.authenticated_human,true);
 assert.equal(result.human_principal,'ENROLLED_TEST_HUMAN');
 await assert.rejects(()=>v({challenge,score,proof}),/REPLAY/);
});
test('expired challenge and forged signature held',async()=>{
 const v=fixture();
 await assert.rejects(()=>v({challenge:{...challenge,created_at_ms:1699999000000},score,
   proof:assertion({...challenge,created_at_ms:1699999000000})}),/EXPIRED/);
 await assert.rejects(()=>v({challenge,score,
  proof:{...assertion(),signature_b64url:Buffer.alloc(72).toString('base64url')}}),/SIGNATURE_INVALID/);
});
