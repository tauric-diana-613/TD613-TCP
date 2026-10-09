// Derived from the established workload scope; independent assay service, not a custody mutation.
import { createPublicKey, verify as verifySignature } from 'node:crypto';
const TEAM='tauric-diana-s-projects';
const PROJECT='td-613-tcp';
const ENVIRONMENT='production';
const OWNER_ID='team_pX5L7AFivMzMU1lH28Y6RIhX';
const TEAM_ISSUER=`https://oidc.vercel.com/${TEAM}`;
const GLOBAL_ISSUER='https://oidc.vercel.com';
const TEAM_AUDIENCE=`https://vercel.com/${TEAM}`;
const GLOBAL_AUDIENCE='https://vercel.com';
const SUBJECT=`owner:${TEAM}:project:${PROJECT}:environment:${ENVIRONMENT}`;

function b64urlToBuffer(value){
  const normalized=String(value||'').replace(/-/g,'+').replace(/_/g,'/');
  return Buffer.from(normalized+'='.repeat((4-normalized.length%4)%4),'base64');
}
export async function verifyVercelOidc(token,{fetchImpl=fetch,at=Date.now()}={}){
  const parts=String(token||'').split('.');
  if(parts.length!==3)throw new Error('OIDC_SHAPE');
  const [h,p,s]=parts;
  const header=JSON.parse(b64urlToBuffer(h).toString('utf8'));
  const claims=JSON.parse(b64urlToBuffer(p).toString('utf8'));
  if(header.alg!=='RS256'||!header.kid)throw new Error('OIDC_HEADER');

  const jwksResponse=await fetchImpl('https://oidc.vercel.com/.well-known/jwks',{redirect:'error',signal:AbortSignal.timeout(8000)});
  if(!jwksResponse.ok)throw new Error('OIDC_JWKS');
  const jwks=await jwksResponse.json();
  const jwk=jwks.keys?.find(key=>key.kid===header.kid&&key.kty==='RSA');
  if(!jwk)throw new Error('OIDC_KID');
  const key=createPublicKey({key:jwk,format:'jwk'});
  if(!verifySignature('RSA-SHA256',Buffer.from(`${h}.${p}`),key,b64urlToBuffer(s)))throw new Error('OIDC_SIGNATURE');

  const now=Math.floor(at/1000);
  if(![TEAM_ISSUER,GLOBAL_ISSUER].includes(claims.iss))throw new Error('OIDC_ISSUER');
  const audiences=Array.isArray(claims.aud)?claims.aud:[claims.aud];
  if(!audiences.some(a=>[TEAM_AUDIENCE,GLOBAL_AUDIENCE].includes(a)))throw new Error('OIDC_AUDIENCE');
  if(claims.sub!==SUBJECT)throw new Error('OIDC_SUBJECT');
  if(claims.owner!==TEAM||claims.owner_id!==OWNER_ID||claims.project!==PROJECT||claims.environment!==ENVIRONMENT)throw new Error('OIDC_SCOPE');
  if(!Number.isFinite(claims.exp)||claims.exp<=now)throw new Error('OIDC_EXPIRED');
  if(Number.isFinite(claims.nbf)&&claims.nbf>now)throw new Error('OIDC_NOT_YET_VALID');
  return claims;
}
