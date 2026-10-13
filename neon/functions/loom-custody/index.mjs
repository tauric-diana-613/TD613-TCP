import { createHmac, createHash, createPublicKey, randomBytes, timingSafeEqual, verify as verifySignature } from 'node:crypto';

const REQUEST_SCHEMA='td613.loom.demo-custody-request/v0.1';
const RESPONSE_SCHEMA='td613.loom.demo-custody-response/v0.1';
const RECEIPT_SCHEMA='td613.loom.demo-stage-receipt/v0.2';
const RECEIPT_DOMAIN='TD613:LOOM-DEMO:STAGE-RECEIPT:v1';
const KEY_ID='td613-loom-demo-stage-v1';
const HEAD_TABLE='td613_loom_demo_heads';
const SIGNER_TABLE='td613_loom_demo_signer';
const RESERVATION_MS=5*60*1000;

const TEAM='tauric-diana-s-projects';
const PROJECT='td-613-tcp';
const ENVIRONMENT='production';
const OWNER_ID='team_pX5L7AFivMzMU1lH28Y6RIhX';
const TEAM_ISSUER=`https://oidc.vercel.com/${TEAM}`;
const GLOBAL_ISSUER='https://oidc.vercel.com';
const TEAM_AUDIENCE=`https://vercel.com/${TEAM}`;
const GLOBAL_AUDIENCE='https://vercel.com';
const SUBJECT=`owner:${TEAM}:project:${PROJECT}:environment:${ENVIRONMENT}`;

function canonicalJson(value){
  if(Array.isArray(value))return `[${value.map(canonicalJson).join(',')}]`;
  if(value&&typeof value==='object'){
    return `{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  if(typeof value==='number'&&!Number.isFinite(value))return 'null';
  return JSON.stringify(value??null);
}
function sha256(value){return createHash('sha256').update(typeof value==='string'?value:canonicalJson(value)).digest('hex');}
function b64urlToBuffer(value){
  const normalized=String(value||'').replace(/-/g,'+').replace(/_/g,'/');
  return Buffer.from(normalized+'='.repeat((4-normalized.length%4)%4),'base64');
}
function constantTimeEqual(a,b){
  const left=Buffer.from(String(a||'')),right=Buffer.from(String(b||''));
  return left.length>0&&left.length===right.length&&timingSafeEqual(left,right);
}
function json(status,body){
  return new Response(JSON.stringify(body),{
    status,
    headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0'}
  });
}
function held(error,status=409,message=error,details={}){
  return json(status,{schema:RESPONSE_SCHEMA,status:'held',error,message,details});
}
function rowsFromNeon(body){
  if(Array.isArray(body?.rows)&&body.rows.every(row=>!Array.isArray(row)))return body.rows;
  if(Array.isArray(body?.rows)&&Array.isArray(body?.fields)){
    const names=body.fields.map(field=>field.name);
    return body.rows.map(row=>Object.fromEntries(names.map((name,index)=>[name,row[index]])));
  }
  if(Array.isArray(body)&&body[0]?.rows)return rowsFromNeon(body[0]);
  return [];
}
async function sql(query,params=[]){
  const connectionString=String(process.env.DATABASE_URL||'');
  if(!connectionString)throw Object.assign(new Error('NEON_DATABASE_URL_UNAVAILABLE'),{status:503});
  const parsed=new URL(connectionString);
  const response=await fetch(`https://${parsed.hostname}/sql`,{
    method:'POST',
    headers:{
      Accept:'application/json',
      'Content-Type':'application/json',
      'Neon-Connection-String':connectionString,
      'Neon-Raw-Text-Output':'true',
      'Neon-Array-Mode':'true'
    },
    body:JSON.stringify({query,params})
  });
  if(!response.ok)throw Object.assign(new Error(`NEON_SQL_HTTP_${response.status}`),{status:502});
  return rowsFromNeon(await response.json());
}
async function verifyVercelOidc(token){
  const parts=String(token||'').split('.');
  if(parts.length!==3)throw new Error('OIDC_SHAPE');
  const [h,p,s]=parts;
  const header=JSON.parse(b64urlToBuffer(h).toString('utf8'));
  const claims=JSON.parse(b64urlToBuffer(p).toString('utf8'));
  if(header.alg!=='RS256'||!header.kid)throw new Error('OIDC_HEADER');

  const jwksResponse=await fetch('https://oidc.vercel.com/.well-known/jwks');
  if(!jwksResponse.ok)throw new Error('OIDC_JWKS');
  const jwks=await jwksResponse.json();
  const jwk=jwks.keys?.find(key=>key.kid===header.kid&&key.kty==='RSA');
  if(!jwk)throw new Error('OIDC_KID');
  const key=createPublicKey({key:jwk,format:'jwk'});
  if(!verifySignature('RSA-SHA256',Buffer.from(`${h}.${p}`),key,b64urlToBuffer(s)))throw new Error('OIDC_SIGNATURE');

  const now=Math.floor(Date.now()/1000);
  if(![TEAM_ISSUER,GLOBAL_ISSUER].includes(claims.iss))throw new Error('OIDC_ISSUER');
  const audiences=Array.isArray(claims.aud)?claims.aud:[claims.aud];
  if(!audiences.some(a=>[TEAM_AUDIENCE,GLOBAL_AUDIENCE].includes(a)))throw new Error('OIDC_AUDIENCE');
  if(claims.sub!==SUBJECT)throw new Error('OIDC_SUBJECT');
  if(claims.owner!==TEAM||claims.owner_id!==OWNER_ID||claims.project!==PROJECT||claims.environment!==ENVIRONMENT)throw new Error('OIDC_SCOPE');
  if(!Number.isFinite(claims.exp)||claims.exp<now-30)throw new Error('OIDC_EXPIRED');
  if(Number.isFinite(claims.nbf)&&claims.nbf>now+30)throw new Error('OIDC_NOT_YET_VALID');
  return claims;
}
async function signerKey(){
  let rows=await sql(`SELECT key_material FROM ${SIGNER_TABLE} WHERE singleton=1 LIMIT 1`);
  if(rows[0]?.key_material)return String(rows[0].key_material);
  const generated=randomBytes(48).toString('base64url');
  await sql(`INSERT INTO ${SIGNER_TABLE} (singleton,key_material)
    VALUES (1,$1)
    ON CONFLICT (singleton) DO NOTHING`,[generated]);
  rows=await sql(`SELECT key_material FROM ${SIGNER_TABLE} WHERE singleton=1 LIMIT 1`);
  if(!rows[0]?.key_material)throw Object.assign(new Error('LOOM_SIGNER_UNAVAILABLE'),{status:503});
  return String(rows[0].key_material);
}
function receiptSubject(body){return `${RECEIPT_DOMAIN}\n${canonicalJson(body)}`;}
function signReceipt(body,key){
  return {
    ...JSON.parse(JSON.stringify(body)),
    auth:{
      scheme:'hmac-sha256',
      key_id:KEY_ID,
      tag:createHmac('sha256',key).update(receiptSubject(body)).digest('base64url')
    }
  };
}
function verifyReceipt(receipt,key){
  if(!receipt||typeof receipt!=='object'||Array.isArray(receipt))throw new Error('LOOM_DEMO_PREDECESSOR_AUTH_INVALID');
  const auth=receipt.auth;
  if(!auth||auth.scheme!=='hmac-sha256'||auth.key_id!==KEY_ID||typeof auth.tag!=='string')throw new Error('LOOM_DEMO_PREDECESSOR_AUTH_INVALID');
  const {auth:ignored,...body}=receipt;
  const expected=createHmac('sha256',key).update(receiptSubject(body)).digest('base64url');
  if(!constantTimeEqual(auth.tag,expected))throw new Error('LOOM_DEMO_PREDECESSOR_AUTH_INVALID');
  return body;
}
async function cleanupExpired(){
  await sql(`DELETE FROM ${HEAD_TABLE} WHERE expires_at<now()`);
}
async function reserve(body){
  const {
    activation_digest,phase,request_digest,predecessor,
    predecessor_receipt_digest,expires_at
  }=body;
  if(!/^[a-f0-9]{64}$/.test(String(activation_digest||''))||
     !/^[a-f0-9]{64}$/.test(String(request_digest||''))||
     !['ACTIVATE','CONTINUE'].includes(phase)||
     !Number.isSafeInteger(expires_at)||
     expires_at<=Date.now()){
    return held('LOOM_DEMO_HEAD_RESERVATION_INVALID',400);
  }
  const key=await signerKey();
  let predecessorDigest=null;
  if(phase==='CONTINUE'){
    const predecessorBody=verifyReceipt(predecessor,key);
    if(predecessorBody.schema!==RECEIPT_SCHEMA||
       predecessorBody.activation_digest!==activation_digest||
       !['ACTIVATE','CONTINUE'].includes(predecessorBody.phase)||
       predecessorBody.expires_at!==expires_at||
       predecessorBody.admission_state!=='ADMITTED'||
       predecessorBody.authority_transferred!==false){
      return held('LOOM_DEMO_PREDECESSOR_SCOPE_INVALID',409);
    }
    predecessorDigest=sha256(predecessor);
    if(predecessorDigest!==predecessor_receipt_digest)return held('LOOM_DEMO_PREDECESSOR_DIGEST_MISMATCH',409);
  }else if(predecessor!==null&&predecessor!==undefined){
    return held('LOOM_DEMO_PREDECESSOR_UNEXPECTED',400);
  }

  await cleanupExpired();
  const pendingUntil=new Date(Math.min(expires_at,Date.now()+RESERVATION_MS)).toISOString();
  const expiry=new Date(expires_at).toISOString();
  let rows;
  if(phase==='ACTIVATE'){
    rows=await sql(`INSERT INTO ${HEAD_TABLE}
      (activation_digest,head_receipt_digest,head_request_id,head_phase,pending_request_digest,pending_until,expires_at)
      VALUES ($1,NULL,NULL,NULL,$2,$3::timestamptz,$4::timestamptz)
      ON CONFLICT (activation_digest) DO NOTHING
      RETURNING activation_digest`,[activation_digest,request_digest,pendingUntil,expiry]);
  }else{
    rows=await sql(`UPDATE ${HEAD_TABLE}
      SET pending_request_digest=$3,pending_until=$4::timestamptz,updated_at=now()
      WHERE activation_digest=$1
        AND head_receipt_digest=$2
        AND expires_at>now()
        AND (pending_request_digest IS NULL OR pending_until<now())
      RETURNING activation_digest`,[activation_digest,predecessorDigest,request_digest,pendingUntil]);
  }
  if(!rows.length)return held('LOOM_DEMO_HEAD_CONFLICT',409,'The Loom stage is stale, replayed, forked, or already in flight.');
  return json(200,{
    schema:RESPONSE_SCHEMA,status:'ok',
    reservation:{activation_digest,phase,request_digest,predecessor_receipt_digest:predecessorDigest,pending_until:pendingUntil}
  });
}
async function commit(body){
  const stage=body.stage_body;
  const expectedPolicy=stage?.phase==='ACTIVATE'?'AIA_ONLY':'SELECTED_FILES_BOUND';
  if(!stage||stage.schema!==RECEIPT_SCHEMA||
     !/^[a-f0-9]{64}$/.test(String(stage.activation_digest||''))||
     typeof stage.request_id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(stage.request_id)||
     !/^[a-f0-9]{64}$/.test(String(stage.request_digest||''))||
     !/^[a-f0-9]{64}$/.test(String(stage.current_input_digest||''))||
     !(stage.prior_result_digest===null||/^[a-f0-9]{64}$/.test(String(stage.prior_result_digest||'')))||
     !/^[a-f0-9]{64}$/.test(String(stage.result_digest||''))||
     !['ACTIVATE','CONTINUE'].includes(stage.phase)||
     !(stage.predecessor_receipt_digest===null||/^[a-f0-9]{64}$/.test(String(stage.predecessor_receipt_digest||'')))||
     !Number.isSafeInteger(stage.expires_at)||
     stage.expires_at<=Date.now()||
     stage.admission_state!=='ADMITTED'||
     stage.stage_policy!==expectedPolicy||
     stage.authority_transferred!==false||
     (stage.phase==='ACTIVATE'&&stage.predecessor_receipt_digest!==null)||
     (stage.phase==='CONTINUE'&&stage.predecessor_receipt_digest===null)){
    return held('LOOM_DEMO_HEAD_COMMIT_INVALID',400);
  }
  const key=await signerKey();
  const receipt=signReceipt(stage,key);
  const receiptDigest=sha256(receipt);
  const rows=stage.phase==='ACTIVATE'
    ? await sql(`UPDATE ${HEAD_TABLE}
        SET head_receipt_digest=$3,
            head_request_id=$4,
            head_phase=$5,
            pending_request_digest=NULL,
            pending_until=NULL,
            updated_at=now()
        WHERE activation_digest=$1
          AND pending_request_digest=$2
          AND head_receipt_digest IS NULL
          AND expires_at>now()
        RETURNING activation_digest`,[
          stage.activation_digest,stage.request_digest,receiptDigest,stage.request_id,stage.phase
        ])
    : await sql(`UPDATE ${HEAD_TABLE}
        SET head_receipt_digest=$3,
            head_request_id=$4,
            head_phase=$5,
            pending_request_digest=NULL,
            pending_until=NULL,
            updated_at=now()
        WHERE activation_digest=$1
          AND pending_request_digest=$2
          AND head_receipt_digest=$6
          AND expires_at>now()
        RETURNING activation_digest`,[
          stage.activation_digest,stage.request_digest,receiptDigest,stage.request_id,stage.phase,stage.predecessor_receipt_digest
        ]);
  if(!rows.length){
    rows=await sql(`SELECT head_receipt_digest,head_request_id,head_phase
      FROM ${HEAD_TABLE}
      WHERE activation_digest=$1 AND expires_at>now()
      LIMIT 1`,[stage.activation_digest]);
    const row=rows[0];
    if(row?.head_receipt_digest!==receiptDigest||
       row?.head_request_id!==stage.request_id||
       row?.head_phase!==stage.phase){
      return held('LOOM_DEMO_HEAD_COMMIT_HELD',409);
    }
  }
  return json(200,{
    schema:RESPONSE_SCHEMA,status:'ok',
    stage_receipt:receipt,
    head:{receipt_digest:receiptDigest,durable:true,payload_logged:false}
  });
}
async function release(body){
  const {activation_digest,request_digest,phase}=body;
  if(!/^[a-f0-9]{64}$/.test(String(activation_digest||''))||
     !/^[a-f0-9]{64}$/.test(String(request_digest||''))||
     !['ACTIVATE','CONTINUE'].includes(phase)){
    return held('LOOM_DEMO_HEAD_RELEASE_INVALID',400);
  }
  if(phase==='ACTIVATE'){
    await sql(`DELETE FROM ${HEAD_TABLE}
      WHERE activation_digest=$1
        AND head_receipt_digest IS NULL
        AND pending_request_digest=$2`,[activation_digest,request_digest]);
  }else{
    await sql(`UPDATE ${HEAD_TABLE}
      SET pending_request_digest=NULL,pending_until=NULL,updated_at=now()
      WHERE activation_digest=$1 AND pending_request_digest=$2`,[activation_digest,request_digest]);
  }
  return json(200,{schema:RESPONSE_SCHEMA,status:'ok',released:true});
}

export default {
  async fetch(request){
    if(request.method!=='POST')return held('method-not-allowed',405);
    const auth=request.headers.get('authorization')||'';
    if(!auth.startsWith('Bearer '))return held('vercel-oidc-required',401);
    try{
      await verifyVercelOidc(auth.slice(7));
      const body=await request.json();
      if(body?.schema!==REQUEST_SCHEMA)return held('LOOM_DEMO_CUSTODY_SCHEMA_INVALID',400);
      if(body.operation==='reserve')return await reserve(body);
      if(body.operation==='commit')return await commit(body);
      if(body.operation==='release')return await release(body);
      return held('LOOM_DEMO_CUSTODY_OPERATION_INVALID',400);
    }catch(error){
      return held(error?.message||'LOOM_DEMO_CUSTODY_HELD',error?.status||403);
    }
  }
};
