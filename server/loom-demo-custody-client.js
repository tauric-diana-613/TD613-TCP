export const LOOM_DEMO_CUSTODY_REQUEST_SCHEMA = 'td613.loom.demo-custody-request/v0.1';
export const LOOM_DEMO_CUSTODY_RESPONSE_SCHEMA = 'td613.loom.demo-custody-response/v0.1';
export const LOOM_DEMO_CUSTODY_URL = '__TD613_LOOM_CUSTODY_URL__';

export class LoomDemoCustodyError extends Error {
  constructor(code,message,status=503,details={}){
    super(message);
    this.name='LoomDemoCustodyError';
    this.code=code;
    this.status=status;
    this.details=details;
  }
}

async function callCustody(operation,payload,{
  fetchImpl=fetch,
  environment=process.env,
  url=LOOM_DEMO_CUSTODY_URL
}={}){
  const token=String(environment.VERCEL_OIDC_TOKEN||'');
  if(!token) throw new LoomDemoCustodyError('LOOM_DEMO_VERCEL_OIDC_UNAVAILABLE','Vercel workload identity is unavailable',503);
  if(!/^https:\/\//.test(String(url||''))||String(url).includes('__TD613_')) {
    throw new LoomDemoCustodyError('LOOM_DEMO_CUSTODY_URL_NOT_CONFIGURED','Neon Loom custody service is not configured',503);
  }
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8_000);
  try{
    const response=await fetchImpl(url,{
      method:'POST',
      redirect:'error',
      signal:controller.signal,
      headers:{
        Accept:'application/json',
        'Content-Type':'application/json',
        Authorization:`Bearer ${token}`
      },
      body:JSON.stringify({
        schema:LOOM_DEMO_CUSTODY_REQUEST_SCHEMA,
        operation,
        ...payload
      })
    });
    let body=null;
    try{body=await response.json();}catch{}
    if(!response.ok||!body||body.schema!==LOOM_DEMO_CUSTODY_RESPONSE_SCHEMA||body.status!=='ok'){
      throw new LoomDemoCustodyError(
        body?.error||'LOOM_DEMO_CUSTODY_HELD',
        body?.message||`Neon Loom custody returned HTTP ${response.status}`,
        response.status||503,
        body?.details||{}
      );
    }
    return body;
  }catch(error){
    if(error instanceof LoomDemoCustodyError)throw error;
    if(error?.name==='AbortError')throw new LoomDemoCustodyError('LOOM_DEMO_CUSTODY_TIMEOUT','Neon Loom custody did not answer inside its bounded window',504);
    throw new LoomDemoCustodyError('LOOM_DEMO_CUSTODY_UNAVAILABLE','Neon Loom custody request failed',502);
  }finally{clearTimeout(timer);}
}

export async function reserveLoomDemoCustodyStage(input,options={}){
  return callCustody('reserve',input,options);
}
export async function commitLoomDemoCustodyStage(input,options={}){
  return callCustody('commit',input,options);
}
export async function releaseLoomDemoCustodyStage(input,options={}){
  return callCustody('release',input,options);
}

export function loomDemoCustodyReadiness({
  environment=process.env,
  url=LOOM_DEMO_CUSTODY_URL
}={}){
  const oidc=Boolean(environment.VERCEL_OIDC_TOKEN);
  const endpoint=/^https:\/\//.test(String(url||''))&&!String(url).includes('__TD613_');
  return Object.freeze({
    admitted:Boolean(oidc&&endpoint),
    vercel_oidc:oidc,
    neon_custody_endpoint:endpoint,
    cross_instance_predecessor_authentication:Boolean(oidc&&endpoint),
    durable_single_head:Boolean(oidc&&endpoint),
    replay_exclusion:Boolean(oidc&&endpoint),
    fork_exclusion:Boolean(oidc&&endpoint),
    vercel_project_secrets_required:false,
    provider_and_browser_witness_required:true
  });
}
