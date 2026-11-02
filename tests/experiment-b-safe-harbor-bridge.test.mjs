import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createHash,createHmac} from 'node:crypto';
import {canonical,digest} from '../scripts/experiment-b-resumable/journal.mjs';
import {SAFE_HARBOR_NAMESPACE,EXPERIMENT_B_CUSTODY_LANE,createSafeHarborDispatchBridge,verifySafeHarborScopedJws,proposeSafeHarborUse} from '../scripts/experiment-b-operational/safe-harbor-dispatch-bridge.mjs';
import {operatorTemplate,checkOperatorInput} from '../scripts/experiment-b-operational/prepare-safe-harbor-custody.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
// Public, fixed allowlist only. Sparse local checkout may read these Git blobs;
// CI reads the same committed files. No source corpus member or private file I/O.
const publicFiles=['app/safe-harbor/app/binding-provenance.js','app/safe-harbor/corpus/binding_provenance_manifest.json',
  'app/safe-harbor/reference/td613_trust_profile.json','app/safe-harbor/app/safe-harbor-authority-verifier.js'];
function publicSource(name){
  assert(publicFiles.includes(name));const url=new URL('../'+name,import.meta.url);
  if(fs.existsSync(url))return fs.readFileSync(url,'utf8');
  try{return execFileSync('git',['show','HEAD:'+name],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});}
  catch{throw Error('PUBLIC_SAFE_HARBOR_SOURCE_REQUIRED');}
}
test('public namespace preserves scalar, covenant, fragment, SAC and unsigned claim ceiling',()=>{
  const sandbox={window:{}};vm.runInNewContext(publicSource(publicFiles[0]),sandbox);
  const p=sandbox.window.TD613_SAFE_HARBOR_BINDING_PROVENANCE;
  const m=JSON.parse(publicSource(publicFiles[1])),t=JSON.parse(publicSource(publicFiles[2]));
  assert.equal(p.principal,SAFE_HARBOR_NAMESPACE.principal);assert.notEqual(p.principal,'Tawanna C. Miller');
  assert.equal(p.claim.claimed_pua,SAFE_HARBOR_NAMESPACE.claimedPUA);
  assert.equal(p.claim.utf16_surrogate_pair,SAFE_HARBOR_NAMESPACE.utf16);
  assert.equal('\uDBF5\uDE13'.codePointAt(0),0x10d613);assert.equal([...String.fromCodePoint(0x10d613)].length,1);
  assert.equal(p.symbol_roles.ingress_sigil.character.codePointAt(0),0x1d30b);
  assert.equal(t.safe_harbor_surface_policy.khona_lit_po,'Khona\u200clit-po');
  assert.equal(SAFE_HARBOR_NAMESPACE.covenantKey,t.safe_harbor_surface_policy.khona_lit_po);
  assert.equal(SAFE_HARBOR_NAMESPACE.heritageKey,'Tauric Diana');
  assert.equal(SAFE_HARBOR_NAMESPACE.canonicalCovenant,'Tauric Diana — Crimean heritage custodianship');
  assert.equal(SAFE_HARBOR_NAMESPACE.displayCovenant,'Blood Rite 613');
  assert.equal('#'+m.claim.binding_fragment,SAFE_HARBOR_NAMESPACE.bindingFragment);
  assert.equal(m.canonical_declaration.sha256.slice(0,7).toUpperCase(),m.claim.binding_fragment);
  assert.equal('SAC['+m.legacy_corpus_root.short_code+']',SAFE_HARBOR_NAMESPACE.sac);
  assert.equal(t.sac,m.legacy_corpus_root.short_code);assert.equal(p.binding_event.signature_status,'unsigned');
  assert.equal(m.binding_event.signature_value,null);assert.match(p.claim_ceiling,/not independent proof/);
  assert.match(m.supplemental_artifacts.find(a=>a.name==='ns_request_signed_example.json').relationship,/key published; not authenticity/);
});
test('ordered public leaf metadata replays the declared provenance root without reading corpus members',()=>{
  const m=JSON.parse(publicSource(publicFiles[1]));
  const leaves=m.legacy_corpus_root.leaves.map(l=>({name:l.name,sha256:l.sha256,size:l.size}));
  const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
  assert.equal(hash(leaves),m.legacy_corpus_root.sha256);
  assert.notEqual(hash([...leaves].reverse()),m.legacy_corpus_root.sha256);
});
test('actual v2 SHI replay is reproducible without a signing key; altered fingerprint fails',()=>{
  const source=publicSource(publicFiles[3]).split('export async function verifyV3Replay')[0]
    .replace(/^import .*;\r?\n/,'').replaceAll('export function ','function ');
  const sandbox={};vm.runInNewContext(source+'\n globalThis.v2={expectedV2BadgeNumber,verifyV2Replay};',sandbox);
  const packet={canon:{principal:SAFE_HARBOR_NAMESPACE.principal,binding_fragment:'#9B07D8B'},issuance:{stylometric_fingerprint:'SYNTHETIC_ONLY_NOT_AN_ENTRANT'}};
  packet.issuance.badge_number=sandbox.v2.expectedV2BadgeNumber(packet);
  assert.match(packet.issuance.badge_number,/^TD613-SH-9B07D8B-[0-9A-F]{8}$/);
  assert.equal(sandbox.v2.verifyV2Replay(packet).status,'pass');
  packet.issuance.stylometric_fingerprint+='CHANGED';assert.equal(sandbox.v2.verifyV2Replay(packet).status,'fail');
});
test('actual Safe Harbor replay excludes signature overlays; a full packet record commitment detects their change',()=>{
  const source=publicSource(publicFiles[3]).split('export async function verifyV3Replay')[0]
    .replace(/^import .*;\r?\n/,'').replaceAll('export function ','function ');
  const sandbox={};vm.runInNewContext(source+'\n globalThis.material=packetHashReplayMaterial;',sandbox);
  const a={canon:{principal:SAFE_HARBOR_NAMESPACE.principal},signature:{status:'sealed',sig:'SYNTHETIC_A'},signature_overlay_authority:{verified:false}};
  const b={...a,signature:{status:'sealed',sig:'SYNTHETIC_B'},signature_overlay_authority:{verified:true}};
  assert.equal(canonical(sandbox.material(a)),canonical(sandbox.material(b)));
  assert.notEqual(digest(Buffer.from(JSON.stringify(a))),digest(Buffer.from(JSON.stringify(b))));
});

// Explicitly synthetic signature and consume transport. Never an operational
// signer, independent authority, durable replay ledger or accepted trust root.
const key='SYNTHETIC_PUBLIC_TEST_ONLY_NOT_AN_OPERATOR_KEY';
const issuer='SYNTHETIC_SAFE_HARBOR';
const context={experiment:'SYNTHETIC',episode:'SYNTHETIC',shi:'TD613-SH-9B07D8B-A1B2C3D4',
  ...Object.fromEntries(['safeHarborPacketReplayDigest','safeHarborPacketRecordDigest','planDigest','policyDigest','sourceManifestDigest','decisionsDigest','executionAuthorizationDigest'].map(k=>[k,digest(k)]))};
const binding={dispatchId:'SYNTHETIC-DISPATCH',attempt:'SYNTHETIC-ATTEMPT',captureId:'SYNTHETIC-CAPTURE',image:'SYNTHETIC_IMAGE',
  ...Object.fromEntries(['executableSHA256','promptSHA256','argumentsDigest','runtimePolicyDigest','inputMeasurementDigest'].map(k=>[k,digest(k)]))};
const payload=()=>({schema:'TD613_SAFE_HARBOR_FLIGHT_DISPATCH_V1',application:'EXPERIMENT_B',lane:EXPERIMENT_B_CUSTODY_LANE,operation:'EXPERIMENT_B_NATIVE_DISPATCH',namespace:SAFE_HARBOR_NAMESPACE,
  context,binding,issuer,authorizationId:'SYNTHETIC-AUTHORIZATION',issuedAt:500,notBefore:500,expires:2000});
const rootWindow={application:'EXPERIMENT_B',validFrom:0,validUntil:3000,maxPermitLifetimeMs:2000};
function signed(p=payload(),header={alg:'HS256',kid:issuer,typ:'TD613-SCOPED-AUTHORIZATION+JWS'}){
  const text=canonical(p),head=Buffer.from(JSON.stringify(header)).toString('base64url');
  return {lane:p.lane,payload:text,detachedJws:head+'..'+createHmac('sha256',key).update(head+'.'+Buffer.from(text).toString('base64url')).digest('base64url')};
}
function fixture(envelope=signed(),consume){
  const seen=new Set();let calls=0;
  const service=createSafeHarborDispatchBridge({context,trustedIssuers:{[issuer]:{key,...rootWindow,lane:EXPERIMENT_B_CUSTODY_LANE,namespacePrincipal:SAFE_HARBOR_NAMESPACE.principal,operations:['EXPERIMENT_B_NATIVE_DISPATCH']}},
    loadEnvelope:async()=>envelope,now:()=>1000,consumeAtomically:async r=>{calls++;if(consume)return consume(r);const id=r.issuer+':'+r.authorizationId;if(seen.has(id))return false;seen.add(id);return true;}});
  return {service,calls:()=>calls};
}
test('SYNTHETIC dedicated Experiment B receipt reaches authorizeAndConsume ABI and rejects replay',async()=>{
  const f=fixture();assert.equal(await f.service.authorizeAndConsume(binding),true);
  await assert.rejects(f.service.authorizeAndConsume(binding),/EXTERNAL_DISPATCH/);assert.equal(f.calls(),2);
});
test('SYNTHETIC bridge requires signature, exact purpose/namespace/context/binding and never trusts overlay verified Boolean',async()=>{
  const bad=[{payload:payload(),verified:true},signed({...payload(),operation:'EXPERIMENT_B_ADMISSION_ONLY'}),
    signed({...payload(),expires:1000}),signed({...payload(),namespace:{...SAFE_HARBOR_NAMESPACE,principal:'OTHER'}}),
    signed({...payload(),context:{...context,episode:'OTHER'}}),signed({...payload(),binding:{...binding,promptSHA256:digest('OTHER')}}),
    signed({...payload(),context:{...context,safeHarborPacketRecordDigest:digest('OTHER_PACKET')}}),
    signed({...payload(),notBefore:1500}),signed({...payload(),issuedAt:-1}),
    signed({...payload(),expires:4000}),signed({...payload(),expires:2800}),
    signed({...payload(),lane:'jws'}),signed({...payload(),issuer:'UNTRUSTED'}),
    {...signed(),lane:'td613:signature-lane'},{lane:'jws',detachedJws:'SYNTHETIC_NO_AUTHORITY',verified:true},
    signed(payload(),{alg:'none',kid:issuer,typ:'TD613-SCOPED-AUTHORIZATION+JWS'}),
    signed(payload(),{alg:'HS256',kid:issuer,typ:'TD613-SCOPED-AUTHORIZATION+JWS',b64:false,crit:['b64']}),
    signed(payload(),{alg:'HS256',kid:issuer,typ:'JWT'})];
  const tampered=signed();tampered.payload=canonical({...payload(),authorizationId:'TAMPERED'});bad.push(tampered);
  for(const envelope of bad){const f=fixture(envelope);await assert.rejects(f.service.authorizeAndConsume(binding));assert.equal(f.calls(),0);}
});
test('SYNTHETIC verifier can be reused only with an explicit accepted new purpose; it cannot widen Flight',async()=>{
  const p={...payload(),operation:'SYNTHETIC_OTHER_PURPOSE'};
  const {issuer:unusedIssuer,authorizationId:unusedId,issuedAt:unusedIssued,notBefore:unusedNotBefore,expires:unusedExpiry,...scope}=p;
  const trustedIssuers={[issuer]:{key,...rootWindow,lane:EXPERIMENT_B_CUSTODY_LANE,namespacePrincipal:SAFE_HARBOR_NAMESPACE.principal,operations:['EXPERIMENT_B_NATIVE_DISPATCH']}};
  assert.throws(()=>verifySafeHarborScopedJws({envelope:signed(p),trustedIssuers,scope,now:1000}));
  trustedIssuers[issuer].operations.push('SYNTHETIC_OTHER_PURPOSE');
  assert.equal(verifySafeHarborScopedJws({envelope:signed(p),trustedIssuers,scope,now:1000}).operation,p.operation);
  assert.throws(()=>verifySafeHarborScopedJws({envelope:signed(p),trustedIssuers,scope:{...scope,operation:'*'},now:1000}));
  await assert.rejects(fixture(signed(p)).service.authorizeAndConsume(binding));
});
test('SYNTHETIC a valid signature cannot carry authority between applications or namespace principals',()=>{
  const trustedIssuers={[issuer]:{key,...rootWindow,lane:EXPERIMENT_B_CUSTODY_LANE,namespacePrincipal:SAFE_HARBOR_NAMESPACE.principal,operations:['EXPERIMENT_B_NATIVE_DISPATCH']}};
  for(const patch of [{application:'LOOM'},{application:'DOME_WORLD'},{application:'MANIFEST'},
    {namespace:{principal:'SYNTHETIC_INDEPENDENT_OWNER'}}]){
    const p={...payload(),...patch};const {issuer:i,authorizationId:a,issuedAt:t,notBefore:n,expires:e,...scope}=p;
    assert.throws(()=>verifySafeHarborScopedJws({envelope:signed(p),trustedIssuers,scope,now:1000}),/EXTERNAL_DISPATCH/);
  }
  // A genuinely separate owner may adopt the reusable verifier with its OWN
  // explicit trust configuration. This synthetic declaration creates no such owner.
  const p={...payload(),application:'MANIFEST',namespace:{principal:'SYNTHETIC_INDEPENDENT_OWNER'}};
  const {issuer:i,authorizationId:a,issuedAt:t,notBefore:n,expires:e,...scope}=p;
  const ownRoots={[issuer]:{...trustedIssuers[issuer],application:'MANIFEST',namespacePrincipal:p.namespace.principal}};
  assert.equal(verifySafeHarborScopedJws({envelope:signed(p),trustedIssuers:ownRoots,scope,now:1000}).application,'MANIFEST');
});
test('SYNTHETIC external consume refusal or absence cannot become dispatch permission',async()=>{
  for(const result of [false,undefined,{verified:true}])await assert.rejects(fixture(signed(),()=>result).service.authorizeAndConsume(binding),/EXTERNAL_DISPATCH/);
  assert.throws(()=>createSafeHarborDispatchBridge({context}),/EXTERNAL_DISPATCH/);
  assert.throws(()=>createSafeHarborDispatchBridge(),/EXTERNAL_DISPATCH/);
  const f=fixture(signed(),()=>{throw Error('SYNTHETIC_LEDGER_UNAVAILABLE');});await assert.rejects(f.service.authorizeAndConsume(binding),/LEDGER_UNAVAILABLE/);
});
test('SYNTHETIC Wild Field proposal retains novel scope and provenance without becoming authorization',async()=>{
  const proposal=proposeSafeHarborUse({proposedPurpose:'SYNTHETIC_UNFORESEEN_VERIFICATION',rationale:'A new mathematical verifier is proposed.',declaredAttribution:'SYNTHETIC_AUTHOR',provenance:{record:'SYNTHETIC_ONLY'}});
  assert.equal(proposal.status,'UNANTICIPATED_CANDIDATE');assert.equal(proposal.executionAuthorized,false);
  assert.equal(proposal.attributionVerified,false);assert.equal(proposal.provenance.record,'SYNTHETIC_ONLY');
  const f=fixture(proposal);await assert.rejects(f.service.authorizeAndConsume(binding));assert.equal(f.calls(),0);
  assert.throws(()=>proposeSafeHarborUse({proposedPurpose:'MISSING_ATTRIBUTION'}),/ATTRIBUTED_PROPOSAL/);
});
test('operator setup prefills public bindings, lists missing inputs and never treats preparation as authority',()=>{
  const input=operatorTemplate(),r=checkOperatorInput(input);
  assert.equal(input.namespace.covenantKey,'Khona\u200clit-po');assert(r.missing.includes('custodian.serviceModule'));
  assert.equal(r.executionAuthorized,false);assert.equal(r.liveAuthority,'NOT_ATTESTED');
  assert.equal(r.status,'CUSTODY_SETUP_INPUTS_REQUIRED');assert.equal(input.context.shi,null);
  assert.throws(()=>checkOperatorInput({...input,secret:'NOT_A_REAL_SECRET'}),/UNDECLARED_FIELD/);
  assert.throws(()=>checkOperatorInput({...input,custodian:{...input.custodian,privateKey:'NOT_A_REAL_KEY'}}),/UNDECLARED_FIELD/);
  assert.throws(()=>checkOperatorInput({...input,context:{...input.context,planDigest:'INVENTED'}}),/VALUE_INVALID/);
});
test('SYNTHETIC setup pins external module bytes without importing it; CLI refuses overwrite',t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'td613-custody-setup-'));
  t.after(()=>{assert.equal(path.dirname(dir),os.tmpdir());assert(path.basename(dir).startsWith('td613-custody-setup-'));fs.rmSync(dir,{recursive:true,force:true});});
  const file=path.join(dir,'synthetic.mjs'),text="throw Error('MUST_NOT_BE_IMPORTED');\n";
  fs.writeFileSync(file,text);const input=operatorTemplate();input.context={...context};
  input.custodian={serviceModule:file,moduleSHA256:digest(text),independentAcceptanceDigest:'a'.repeat(64)};
  const r=checkOperatorInput(input);assert.equal(r.modulePin,'MATCH');assert.equal(r.executionAuthorized,false);
  assert.equal(r.status,'CUSTODY_SETUP_PREPARED_FOR_INDEPENDENT_ACCEPTANCE');
  input.custodian.moduleSHA256='0'.repeat(64);assert.throws(()=>checkOperatorInput(input),/DIGEST_MISMATCH/);
  const cli=fileURLToPath(new URL('../scripts/experiment-b-operational/prepare-safe-harbor-custody.mjs',import.meta.url));
  const setup=path.join(dir,'operator-input.json');
  execFileSync(process.execPath,[cli,'--prepare',setup],{stdio:['ignore','pipe','pipe']});
  const before=fs.readFileSync(setup);assert.throws(()=>execFileSync(process.execPath,[cli,'--prepare',setup],{stdio:['ignore','pipe','pipe']}));
  assert(fs.readFileSync(setup).equals(before));
});
