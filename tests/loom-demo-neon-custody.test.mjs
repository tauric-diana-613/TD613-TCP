import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign as rsaSign } from 'node:crypto';
import custody from '../neon/functions/loom-custody/index.mjs';

const REQUEST_SCHEMA='td613.loom.demo-custody-request/v0.1';
const RESPONSE_SCHEMA='td613.loom.demo-custody-response/v0.1';
const RECEIPT_SCHEMA='td613.loom.demo-stage-receipt/v0.2';
const DB_URL='postgresql://loom:test@ep-loom-custody-test.neon.tech/neondb?sslmode=require';
const JWKS_URL='https://oidc.vercel.com/.well-known/jwks';
const SQL_URL='https://ep-loom-custody-test.neon.tech/sql';
const TEAM='tauric-diana-s-projects';
const OWNER_ID='team_pX5L7AFivMzMU1lH28Y6RIhX';
const PROJECT='td-613-tcp';

function canonicalJson(value){
  if(Array.isArray(value))return `[${value.map(canonicalJson).join(',')}]`;
  if(value&&typeof value==='object'){
    return `{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  if(typeof value==='number'&&!Number.isFinite(value))return 'null';
  return JSON.stringify(value??null);
}
async function sha256(value){
  const { createHash }=await import('node:crypto');
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}
function b64(value){return Buffer.from(JSON.stringify(value)).toString('base64url');}

function oidcFixture(){
  const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
  const jwk=publicKey.export({format:'jwk'});
  Object.assign(jwk,{kid:'td613-test-key',alg:'RS256',use:'sig'});
  const makeToken=({project=PROJECT,environment='production',owner=TEAM,ownerId=OWNER_ID}={})=>{
    const now=Math.floor(Date.now()/1000);
    const header={typ:'JWT',alg:'RS256',kid:jwk.kid};
    const payload={
      iss:`https://oidc.vercel.com/${TEAM}`,
      aud:`https://vercel.com/${TEAM}`,
      sub:`owner:${TEAM}:project:${project}:environment:${environment}`,
      owner,
      owner_id:ownerId,
      project,
      project_id:'prj_fixture',
      environment,
      iat:now-5,
      nbf:now-5,
      exp:now+600
    };
    const input=`${b64(header)}.${b64(payload)}`;
    return `${input}.${rsaSign('RSA-SHA256',Buffer.from(input),privateKey).toString('base64url')}`;
  };
  return {jwk,makeToken};
}

function fakeDatabase(jwk){
  const heads=new Map();
  let signer=null;
  let sqlMutations=0;
  const queries=[];

  const rows=items=>new Response(JSON.stringify({rows:items}),{
    status:200,
    headers:{'Content-Type':'application/json'}
  });

  const fetchImpl=async(url,init={})=>{
    if(url===JWKS_URL){
      return new Response(JSON.stringify({keys:[jwk]}),{
        status:200,
        headers:{'Content-Type':'application/json'}
      });
    }
    assert.equal(url,SQL_URL);
    assert.equal(init.headers['Neon-Connection-String'],DB_URL);
    const {query='',params=[]}=JSON.parse(init.body||'{}');
    queries.push({query,params:JSON.parse(JSON.stringify(params))});

    if(/SELECT key_material FROM td613_loom_demo_signer/i.test(query)){
      return rows(signer?[{key_material:signer}]:[]);
    }
    if(/INSERT INTO td613_loom_demo_signer/i.test(query)){
      sqlMutations++;
      if(!signer)signer=String(params[0]);
      return rows([]);
    }
    if(/DELETE FROM td613_loom_demo_heads WHERE expires_at<now\(\)/i.test(query)){
      return rows([]);
    }
    if(/INSERT INTO td613_loom_demo_heads/i.test(query)){
      sqlMutations++;
      const [activation_digest,pending_request_digest,pending_until,expires_at]=params;
      if(heads.has(activation_digest))return rows([]);
      heads.set(activation_digest,{
        activation_digest,
        head_receipt_digest:null,
        head_request_id:null,
        head_phase:null,
        pending_request_digest,
        pending_until,
        expires_at
      });
      return rows([{activation_digest}]);
    }
    if(/SET pending_request_digest=\$3/i.test(query)){
      sqlMutations++;
      const [activation_digest,predecessor_receipt_digest,pending_request_digest,pending_until]=params;
      const row=heads.get(activation_digest);
      if(!row||row.head_receipt_digest!==predecessor_receipt_digest||row.pending_request_digest)return rows([]);
      row.pending_request_digest=pending_request_digest;
      row.pending_until=pending_until;
      return rows([{activation_digest}]);
    }
    if(/SET head_receipt_digest=\$3/i.test(query)){
      sqlMutations++;
      const [activation_digest,request_digest,receipt_digest,request_id,phase,predecessor_digest]=params;
      const row=heads.get(activation_digest);
      if(!row||row.pending_request_digest!==request_digest)return rows([]);
      if(phase==='ACTIVATE'&&row.head_receipt_digest!==null)return rows([]);
      if(phase==='CONTINUE'&&row.head_receipt_digest!==predecessor_digest)return rows([]);
      Object.assign(row,{
        head_receipt_digest:receipt_digest,
        head_request_id:request_id,
        head_phase:phase,
        pending_request_digest:null,
        pending_until:null
      });
      return rows([{activation_digest}]);
    }
    if(/SELECT head_receipt_digest,head_request_id,head_phase/i.test(query)){
      const row=heads.get(params[0]);
      return rows(row?[{
        head_receipt_digest:row.head_receipt_digest,
        head_request_id:row.head_request_id,
        head_phase:row.head_phase
      }]:[]);
    }
    if(/DELETE FROM td613_loom_demo_heads[\s\S]*head_receipt_digest IS NULL/i.test(query)){
      sqlMutations++;
      const [activation_digest,request_digest]=params;
      const row=heads.get(activation_digest);
      if(!row||row.head_receipt_digest!==null||row.pending_request_digest!==request_digest)return rows([]);
      heads.delete(activation_digest);
      return rows([]);
    }
    if(/SET pending_request_digest=NULL,pending_until=NULL/i.test(query)){
      sqlMutations++;
      const [activation_digest,request_digest]=params;
      const row=heads.get(activation_digest);
      if(row&&row.pending_request_digest===request_digest){
        row.pending_request_digest=null;
        row.pending_until=null;
      }
      return rows([]);
    }
    throw new Error(`Unexpected SQL: ${query}`);
  };

  return {
    heads,
    queries,
    fetchImpl,
    get signer(){return signer;},
    get sqlMutations(){return sqlMutations;}
  };
}

async function call(token,body){
  const response=await custody.fetch(new Request('https://loom-custody.test/',{
    method:'POST',
    headers:{
      Authorization:`Bearer ${token}`,
      'Content-Type':'application/json'
    },
    body:JSON.stringify({schema:REQUEST_SCHEMA,...body})
  }));
  return {status:response.status,body:await response.json()};
}

test('Neon custody verifies Vercel production identity, signs stages and excludes replay/fork',async()=>{
  const originalFetch=globalThis.fetch;
  const originalDb=process.env.DATABASE_URL;
  const {jwk,makeToken}=oidcFixture();
  const db=fakeDatabase(jwk);
  globalThis.fetch=db.fetchImpl;
  process.env.DATABASE_URL=DB_URL;

  try{
    const token=makeToken();
    const activation='a'.repeat(64);
    const activateRequest='b'.repeat(64);
    const expires=Date.now()+10*60*1000;

    const reserved=await call(token,{
      operation:'reserve',
      activation_digest:activation,
      phase:'ACTIVATE',
      request_digest:activateRequest,
      predecessor:null,
      predecessor_receipt_digest:null,
      expires_at:expires
    });
    assert.equal(reserved.status,200);
    assert.equal(reserved.body.schema,RESPONSE_SCHEMA);
    assert.equal(reserved.body.status,'ok');

    const activateStage={
      schema:RECEIPT_SCHEMA,
      activation_digest:activation,
      phase:'ACTIVATE',
      request_id:'activate-1',
      request_digest:activateRequest,
      current_input_digest:'c'.repeat(64),
      prior_result_digest:null,
      result_digest:'d'.repeat(64),
      predecessor_receipt_digest:null,
      expires_at:expires,
      admission_state:'ADMITTED',
      stage_policy:'AIA_ONLY',
      authority_transferred:false
    };
    const committed=await call(token,{operation:'commit',stage_body:activateStage});
    assert.equal(committed.status,200);
    assert.match(committed.body.stage_receipt.auth.tag,/^[A-Za-z0-9_-]{43}$/);
    assert.equal(committed.body.head.receipt_digest,await sha256(committed.body.stage_receipt));
    assert.ok(db.signer&&db.signer.length>=43);
    assert.equal(JSON.stringify(committed.body).includes(db.signer),false);

    const predecessor=committed.body.stage_receipt;
    const predecessorDigest=await sha256(predecessor);
    const continueRequest='e'.repeat(64);

    const continueReserve=await call(token,{
      operation:'reserve',
      activation_digest:activation,
      phase:'CONTINUE',
      request_digest:continueRequest,
      predecessor,
      predecessor_receipt_digest:predecessorDigest,
      expires_at:expires
    });
    assert.equal(continueReserve.status,200);

    const continueStage={
      schema:RECEIPT_SCHEMA,
      activation_digest:activation,
      phase:'CONTINUE',
      request_id:'continue-1',
      request_digest:continueRequest,
      current_input_digest:'f'.repeat(64),
      prior_result_digest:null,
      result_digest:'1'.repeat(64),
      predecessor_receipt_digest:predecessorDigest,
      expires_at:expires,
      admission_state:'ADMITTED',
      stage_policy:'SELECTED_FILES_BOUND',
      authority_transferred:false
    };
    const continueCommit=await call(token,{operation:'commit',stage_body:continueStage});
    assert.equal(continueCommit.status,200);

    const fork=await call(token,{
      operation:'reserve',
      activation_digest:activation,
      phase:'CONTINUE',
      request_digest:'2'.repeat(64),
      predecessor,
      predecessor_receipt_digest:predecessorDigest,
      expires_at:expires
    });
    assert.equal(fork.status,409);
    assert.equal(fork.body.error,'LOOM_DEMO_HEAD_CONFLICT');

    const tampered=JSON.parse(JSON.stringify(predecessor));
    tampered.result_digest='9'.repeat(64);
    const tamperedAttempt=await call(token,{
      operation:'reserve',
      activation_digest:activation,
      phase:'CONTINUE',
      request_digest:'3'.repeat(64),
      predecessor:tampered,
      predecessor_receipt_digest:await sha256(tampered),
      expires_at:expires
    });
    assert.equal(tamperedAttempt.status,403);
    assert.equal(tamperedAttempt.body.error,'LOOM_DEMO_PREDECESSOR_AUTH_INVALID');

    const durable=db.heads.get(activation);
    assert.equal(durable.head_receipt_digest,continueCommit.body.head.receipt_digest);
    assert.equal(JSON.stringify(durable).includes('State A'),false);
    assert.equal(JSON.stringify(durable).includes('workstreams'),false);
  }finally{
    globalThis.fetch=originalFetch;
    if(originalDb===undefined)delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL=originalDb;
  }
});

test('Neon custody rejects the wrong Vercel project before SQL custody mutation',async()=>{
  const originalFetch=globalThis.fetch;
  const originalDb=process.env.DATABASE_URL;
  const {jwk,makeToken}=oidcFixture();
  const db=fakeDatabase(jwk);
  globalThis.fetch=db.fetchImpl;
  process.env.DATABASE_URL=DB_URL;

  try{
    const before=db.sqlMutations;
    const response=await call(makeToken({project:'not-td613'}),{
      operation:'reserve',
      activation_digest:'a'.repeat(64),
      phase:'ACTIVATE',
      request_digest:'b'.repeat(64),
      predecessor:null,
      predecessor_receipt_digest:null,
      expires_at:Date.now()+60_000
    });
    assert.equal(response.status,403);
    assert.equal(response.body.error,'OIDC_SUBJECT');
    assert.equal(db.sqlMutations,before);
  }finally{
    globalThis.fetch=originalFetch;
    if(originalDb===undefined)delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL=originalDb;
  }
});
