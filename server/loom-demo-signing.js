import crypto from 'node:crypto';

export const LOOM_DEMO_SIGNING_ENV = 'TD613_LOOM_DEMO_SIGNING_SECRET';
export const LOOM_DEMO_SIGNING_DOMAIN = 'TD613:LOOM-DEMO:STAGE-RECEIPT:v1';
export const LOOM_DEMO_SIGNER_KEY_ID = 'td613-loom-demo-stage-v1';
export const LOOM_DEMO_AUTH_SCHEME = 'hmac-sha256';
export const LOOM_DEMO_MIN_SECRET_BYTES = 32;

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) return 'null';
  return JSON.stringify(value ?? null);
}

function constantTimeEqual(left, right) {
  const a=Buffer.from(String(left||''));
  const b=Buffer.from(String(right||''));
  return a.length>0 && a.length===b.length && crypto.timingSafeEqual(a,b);
}

function configuredOtherSecrets(environment=process.env) {
  return [
    environment.TD613_GIVING_ACCESS_SECRET,
    environment.TD613_GIVING_SESSION_SECRET,
    environment.TD613_GIVING_OWNER_SECRET,
    environment.DOME_WORLD_CHECKPOINT_SECRET,
    environment.MARROWLINE_OPERATOR_TOKEN
  ].map(value=>String(value||'')).filter(Boolean);
}

export function assertLoomDemoSigningSecret(secret, environment=process.env) {
  const value=String(secret||'');
  if(Buffer.byteLength(value,'utf8')<LOOM_DEMO_MIN_SECRET_BYTES) {
    throw new Error('LOOM_DEMO_SIGNING_SECRET_NOT_CONFIGURED');
  }
  if(configuredOtherSecrets(environment).some(other=>constantTimeEqual(value,other))) {
    throw new Error('LOOM_DEMO_SIGNING_SECRET_REUSED');
  }
  return value;
}

export function loomDemoReceiptSubject(receiptWithoutAuth) {
  return `${LOOM_DEMO_SIGNING_DOMAIN}\n${canonicalJson(receiptWithoutAuth)}`;
}

export function signLoomDemoStageReceipt(receiptWithoutAuth,{secret=process.env[LOOM_DEMO_SIGNING_ENV],environment=process.env}={}) {
  const key=assertLoomDemoSigningSecret(secret,environment);
  const tag=crypto.createHmac('sha256',key).update(loomDemoReceiptSubject(receiptWithoutAuth)).digest('base64url');
  return Object.freeze({
    ...JSON.parse(JSON.stringify(receiptWithoutAuth)),
    auth:Object.freeze({
      scheme:LOOM_DEMO_AUTH_SCHEME,
      key_id:LOOM_DEMO_SIGNER_KEY_ID,
      tag
    })
  });
}

export function verifyLoomDemoStageReceiptAuthentication(receipt,{secret=process.env[LOOM_DEMO_SIGNING_ENV],environment=process.env}={}) {
  const key=assertLoomDemoSigningSecret(secret,environment);
  if(!receipt||typeof receipt!=='object'||Array.isArray(receipt)) throw new Error('LOOM_DEMO_PREDECESSOR_AUTH_INVALID');
  const auth=receipt.auth;
  if(!auth||typeof auth!=='object'||Array.isArray(auth)||
     auth.scheme!==LOOM_DEMO_AUTH_SCHEME||
     auth.key_id!==LOOM_DEMO_SIGNER_KEY_ID||
     typeof auth.tag!=='string'||
     !/^[A-Za-z0-9_-]{43}$/.test(auth.tag)) {
    throw new Error('LOOM_DEMO_PREDECESSOR_AUTH_INVALID');
  }
  const {auth:ignored,...body}=receipt;
  const expected=crypto.createHmac('sha256',key).update(loomDemoReceiptSubject(body)).digest('base64url');
  if(!constantTimeEqual(auth.tag,expected)) throw new Error('LOOM_DEMO_PREDECESSOR_AUTH_INVALID');
  return JSON.parse(JSON.stringify(body));
}

export function loomDemoReceiptDigest(receipt) {
  return crypto.createHash('sha256').update(canonicalJson(receipt)).digest('hex');
}

export function loomDemoSigningConfiguration({secret=process.env[LOOM_DEMO_SIGNING_ENV],environment=process.env}={}) {
  try {
    assertLoomDemoSigningSecret(secret,environment);
    return Object.freeze({
      configured:true,
      environment_variable:LOOM_DEMO_SIGNING_ENV,
      scheme:LOOM_DEMO_AUTH_SCHEME,
      key_id:LOOM_DEMO_SIGNER_KEY_ID,
      domain:LOOM_DEMO_SIGNING_DOMAIN,
      cross_instance_predecessor_authentication:true,
      global_latest_state:false,
      replay_exclusion:false,
      fork_exclusion:false
    });
  } catch(error) {
    return Object.freeze({
      configured:false,
      environment_variable:LOOM_DEMO_SIGNING_ENV,
      scheme:LOOM_DEMO_AUTH_SCHEME,
      key_id:LOOM_DEMO_SIGNER_KEY_ID,
      domain:LOOM_DEMO_SIGNING_DOMAIN,
      error:error?.message||'LOOM_DEMO_SIGNING_SECRET_NOT_CONFIGURED',
      cross_instance_predecessor_authentication:false,
      global_latest_state:false,
      replay_exclusion:false,
      fork_exclusion:false
    });
  }
}
