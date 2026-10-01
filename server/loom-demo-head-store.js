import crypto from 'node:crypto';

export const LOOM_DEMO_HEAD_STORE_ENV = 'TD613_LOOM_DEMO_NEON_DATABASE_URL';
export const LOOM_DEMO_HEAD_TABLE = 'td613_loom_demo_heads';
export const LOOM_DEMO_RESERVATION_MS = 5 * 60 * 1000;

export class LoomDemoHeadStoreError extends Error {
  constructor(code, message, status=503, details={}) {
    super(message);
    this.name='LoomDemoHeadStoreError';
    this.code=code;
    this.status=status;
    this.details=details;
  }
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function parseNeon(connectionString, label) {
  let parsed;
  try { parsed=new URL(String(connectionString||'')); }
  catch { throw new LoomDemoHeadStoreError('LOOM_DEMO_HEAD_STORE_NOT_CONFIGURED', `${label} configuration is invalid`,503); }
  if(!['postgres:','postgresql:'].includes(parsed.protocol)||!/\.neon\.tech$/i.test(parsed.hostname)) {
    throw new LoomDemoHeadStoreError('LOOM_DEMO_HEAD_STORE_HOST_WITHHELD', `${label} is outside the admitted Neon boundary`,503);
  }
  return parsed;
}

function sameDatabase(left,right) {
  return left.hostname.toLowerCase()===right.hostname.toLowerCase() &&
    left.pathname.replace(/\/+$/,'')===right.pathname.replace(/\/+$/,'');
}

export function loomDemoHeadStoreConfiguration(environment=process.env) {
  const connectionString=String(environment[LOOM_DEMO_HEAD_STORE_ENV]||'');
  if(!connectionString) throw new LoomDemoHeadStoreError('LOOM_DEMO_HEAD_STORE_NOT_CONFIGURED','Dedicated Loom durable head custody is not configured',503);
  const parsed=parseNeon(connectionString,'Loom head store');
  const giving=String(environment.TD613_GIVING_NEON_DATABASE_URL||'');
  if(giving){
    const givingParsed=parseNeon(giving,'Giving database');
    if(sameDatabase(parsed,givingParsed)) {
      throw new LoomDemoHeadStoreError('LOOM_DEMO_HEAD_STORE_REUSES_GIVING','Loom durable custody must not reuse the Giving database',503);
    }
  }
  return Object.freeze({connectionString,endpoint:`https://${parsed.hostname}/sql`,database_digest:sha256(`${parsed.hostname}${parsed.pathname}`)});
}

function rowsFromNeon(body) {
  if(Array.isArray(body?.rows)&&body.rows.every(row=>!Array.isArray(row))) return body.rows;
  if(Array.isArray(body?.rows)&&Array.isArray(body?.fields)){
    const names=body.fields.map(field=>field.name);
    return body.rows.map(row=>Object.fromEntries(names.map((name,index)=>[name,row[index]])));
  }
  if(Array.isArray(body)&&body[0]?.rows) return rowsFromNeon(body[0]);
  return [];
}

async function neonSql(query,params=[],{fetchImpl=fetch,environment=process.env}={}) {
  const config=loomDemoHeadStoreConfiguration(environment);
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8_000);
  try{
    const response=await fetchImpl(config.endpoint,{
      method:'POST',
      redirect:'error',
      signal:controller.signal,
      headers:{
        Accept:'application/json',
        'Content-Type':'application/json',
        'Neon-Connection-String':config.connectionString,
        'Neon-Raw-Text-Output':'true',
        'Neon-Array-Mode':'true'
      },
      body:JSON.stringify({query,params})
    });
    if(!response.ok) throw new LoomDemoHeadStoreError('LOOM_DEMO_HEAD_STORE_UPSTREAM',`Loom head store returned HTTP ${response.status}`,502);
    return rowsFromNeon(await response.json());
  }catch(error){
    if(error instanceof LoomDemoHeadStoreError) throw error;
    if(error?.name==='AbortError') throw new LoomDemoHeadStoreError('LOOM_DEMO_HEAD_STORE_TIMEOUT','Loom head store did not answer inside its bounded window',504);
    throw new LoomDemoHeadStoreError('LOOM_DEMO_HEAD_STORE_UNAVAILABLE','Loom head store request failed',502);
  }finally{clearTimeout(timer);}
}

async function ensureTable(options={}) {
  await neonSql(`CREATE TABLE IF NOT EXISTS ${LOOM_DEMO_HEAD_TABLE} (
    activation_digest text PRIMARY KEY,
    head_receipt_digest text,
    head_request_id text,
    head_phase text,
    pending_request_digest text,
    pending_until timestamptz,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,[],options);
  await neonSql(`CREATE INDEX IF NOT EXISTS td613_loom_demo_heads_expiry_idx
    ON ${LOOM_DEMO_HEAD_TABLE} (expires_at)`,[],options);
}

async function cleanup(options={}) {
  await neonSql(`DELETE FROM ${LOOM_DEMO_HEAD_TABLE} WHERE expires_at < now()`,[],options);
}

export async function reserveLoomDemoStage({
  activationDigest,
  phase,
  requestDigest,
  predecessorReceiptDigest=null,
  expiresAt,
  fetchImpl=fetch,
  environment=process.env,
  now=Date.now()
}={}) {
  if(!/^[a-f0-9]{64}$/.test(String(activationDigest||''))||
     !/^[a-f0-9]{64}$/.test(String(requestDigest||''))||
     !['ACTIVATE','CONTINUE'].includes(phase)||
     !Number.isSafeInteger(expiresAt)||
     expiresAt<=now||
     (phase==='ACTIVATE'&&predecessorReceiptDigest!==null)||
     (phase==='CONTINUE'&&!/^[a-f0-9]{64}$/.test(String(predecessorReceiptDigest||'')))) {
    throw new LoomDemoHeadStoreError('LOOM_DEMO_HEAD_RESERVATION_INVALID','Loom stage reservation is malformed',400);
  }
  const options={fetchImpl,environment};
  await ensureTable(options);
  await cleanup(options);
  const pendingUntil=new Date(Math.min(expiresAt,now+LOOM_DEMO_RESERVATION_MS)).toISOString();
  const expiry=new Date(expiresAt).toISOString();

  let rows;
  if(phase==='ACTIVATE'){
    rows=await neonSql(`INSERT INTO ${LOOM_DEMO_HEAD_TABLE}
      (activation_digest,head_receipt_digest,head_request_id,head_phase,pending_request_digest,pending_until,expires_at)
      VALUES ($1,NULL,NULL,NULL,$2,$3::timestamptz,$4::timestamptz)
      ON CONFLICT (activation_digest) DO NOTHING
      RETURNING activation_digest`,[
        activationDigest,requestDigest,pendingUntil,expiry
      ],options);
  }else{
    rows=await neonSql(`UPDATE ${LOOM_DEMO_HEAD_TABLE}
      SET pending_request_digest=$3,
          pending_until=$4::timestamptz,
          updated_at=now()
      WHERE activation_digest=$1
        AND head_receipt_digest=$2
        AND expires_at>now()
        AND (pending_request_digest IS NULL OR pending_until<now())
      RETURNING activation_digest`,[
        activationDigest,predecessorReceiptDigest,requestDigest,pendingUntil
      ],options);
  }

  if(!rows.length) {
    throw new LoomDemoHeadStoreError('LOOM_DEMO_HEAD_CONFLICT','The Loom stage is stale, replayed, forked, or already in flight',409,{
      replay_or_fork_detected:true
    });
  }

  return Object.freeze({
    schema:'td613.loom.demo-head-reservation/v0.1',
    activation_digest:activationDigest,
    phase,
    request_digest:requestDigest,
    predecessor_receipt_digest:predecessorReceiptDigest,
    pending_until:pendingUntil,
    durable:true,
    payload_logged:false
  });
}

export async function commitLoomDemoStage({
  activationDigest,
  phase,
  requestId,
  requestDigest,
  receiptDigest,
  fetchImpl=fetch,
  environment=process.env
}={}) {
  if(!/^[a-f0-9]{64}$/.test(String(activationDigest||''))||
     !/^[a-f0-9]{64}$/.test(String(requestDigest||''))||
     !/^[a-f0-9]{64}$/.test(String(receiptDigest||''))||
     !['ACTIVATE','CONTINUE'].includes(phase)||
     typeof requestId!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(requestId)) {
    throw new LoomDemoHeadStoreError('LOOM_DEMO_HEAD_COMMIT_INVALID','Loom head commit is malformed',400);
  }
  const rows=await neonSql(`UPDATE ${LOOM_DEMO_HEAD_TABLE}
    SET head_receipt_digest=$3,
        head_request_id=$4,
        head_phase=$5,
        pending_request_digest=NULL,
        pending_until=NULL,
        updated_at=now()
    WHERE activation_digest=$1
      AND pending_request_digest=$2
      AND expires_at>now()
    RETURNING activation_digest`,[
      activationDigest,requestDigest,receiptDigest,requestId,phase
    ],{fetchImpl,environment});
  if(!rows.length) throw new LoomDemoHeadStoreError('LOOM_DEMO_HEAD_COMMIT_HELD','The reserved Loom stage could not become the durable current head',409);
  return Object.freeze({
    schema:'td613.loom.demo-head/v0.1',
    activation_digest:activationDigest,
    head_receipt_digest:receiptDigest,
    head_request_id:requestId,
    head_phase:phase,
    durable:true,
    payload_logged:false
  });
}

export async function releaseLoomDemoStageReservation({
  activationDigest,
  requestDigest,
  phase,
  fetchImpl=fetch,
  environment=process.env
}={}) {
  if(!/^[a-f0-9]{64}$/.test(String(activationDigest||''))||!/^[a-f0-9]{64}$/.test(String(requestDigest||''))) return false;
  const options={fetchImpl,environment};
  if(phase==='ACTIVATE'){
    const rows=await neonSql(`DELETE FROM ${LOOM_DEMO_HEAD_TABLE}
      WHERE activation_digest=$1
        AND head_receipt_digest IS NULL
        AND pending_request_digest=$2
      RETURNING activation_digest`,[activationDigest,requestDigest],options);
    return rows.length>0;
  }
  const rows=await neonSql(`UPDATE ${LOOM_DEMO_HEAD_TABLE}
    SET pending_request_digest=NULL,pending_until=NULL,updated_at=now()
    WHERE activation_digest=$1
      AND pending_request_digest=$2
    RETURNING activation_digest`,[activationDigest,requestDigest],options);
  return rows.length>0;
}

export async function readLoomDemoHead({activationDigest,fetchImpl=fetch,environment=process.env}={}) {
  if(!/^[a-f0-9]{64}$/.test(String(activationDigest||''))) return null;
  await ensureTable({fetchImpl,environment});
  const rows=await neonSql(`SELECT activation_digest,head_receipt_digest,head_request_id,head_phase,
      pending_request_digest,expires_at
    FROM ${LOOM_DEMO_HEAD_TABLE}
    WHERE activation_digest=$1 AND expires_at>now()
    LIMIT 1`,[activationDigest],{fetchImpl,environment});
  return rows[0]||null;
}

export function loomDemoHeadStoreReadiness(environment=process.env) {
  try{
    const config=loomDemoHeadStoreConfiguration(environment);
    return Object.freeze({
      configured:true,
      environment_variable:LOOM_DEMO_HEAD_STORE_ENV,
      database_digest:config.database_digest,
      durable_compare_and_swap:true,
      replay_exclusion:true,
      fork_exclusion:true,
      payload_logged:false
    });
  }catch(error){
    return Object.freeze({
      configured:false,
      environment_variable:LOOM_DEMO_HEAD_STORE_ENV,
      error:error?.code||error?.message||'LOOM_DEMO_HEAD_STORE_NOT_CONFIGURED',
      database_digest:null,
      durable_compare_and_swap:false,
      replay_exclusion:false,
      fork_exclusion:false,
      payload_logged:false
    });
  }
}

export const _loomDemoHeadStoreInternals=Object.freeze({rowsFromNeon,sameDatabase});
