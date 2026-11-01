import { spawn } from 'node:child_process';
import fs from 'node:fs';
const permitted=['PATH','HOME','USERPROFILE','CODEX_HOME','LOCALAPPDATA','APPDATA','ProgramFiles','SystemRoot','SYSTEMROOT','windir','TEMP','TMP','LANG','LC_ALL','HTTPS_PROXY','HTTP_PROXY','NO_PROXY','SSL_CERT_FILE'];
const env=Object.fromEntries(permitted.filter(key=>typeof process.env[key]==='string').map(key=>[key,process.env[key]]));
const methods=['initialize','account/read','account/rateLimits/read'];
const child=spawn('codex',['app-server','--stdio','-c','analytics.enabled=false'],{env,windowsHide:true,stdio:['pipe','pipe','ignore']});
const result={evidenceClass:'NATIVE_NON_INFERENTIAL_ACCOUNT_METADATA',observedAt:new Date().toISOString(),methods,modelRequests:0,accountIdentityRetained:false,credentialsRetained:false};
let buffer='',finished=false;
const finish=()=>{
 if(finished)return;finished=true;clearTimeout(timer);child.stdin.end();child.kill();
 fs.writeFileSync('work/operational/account-metadata-receipt.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
};
const send=(id,method,params)=>{if(!methods.includes(method))throw Error('RPC_METHOD_REFUSED');child.stdin.write(JSON.stringify({id,method,params})+'\n');};
const timer=setTimeout(()=>{result.status='METADATA_READ_TIMEOUT';finish();},45000);
child.on('error',error=>{result.status='METADATA_INTERFACE_UNAVAILABLE';result.errorCode=error.code;finish();});
child.stdin.on('error',()=>{result.status='METADATA_INTERFACE_CLOSED';finish();});
child.stdout.setEncoding('utf8');
child.stdout.on('data',chunk=>{
 buffer+=chunk;if(buffer.length>1024*1024){result.status='METADATA_STREAM_BOUND';finish();return;}
 let newline;
 while(!finished&&(newline=buffer.indexOf('\n'))>=0){
  const line=buffer.slice(0,newline);buffer=buffer.slice(newline+1);let message;try{message=JSON.parse(line);}catch{continue;}
  if(message.id===1){
   if(message.error){result.status='INITIALIZATION_REJECTED';result.rpcCode=message.error.code;finish();return;}
   child.stdin.write(JSON.stringify({method:'initialized'})+'\n');send(2,'account/read',{refreshToken:false});
  }else if(message.id===2){
   if(message.error){result.accountRead='unavailable';result.accountRpcCode=message.error.code;}
   else {const a=message.result?.account;result.authRoute=['chatgpt','apiKey'].includes(a?.type)?a.type:null;result.planType=['free','go','plus','pro','prolite','promax','team','self_serve_business_prolite','self_serve_business_usage_based','business','ent26','enterprise_cbp_automation','enterprise_cbp_usage_based','enterprise','edu','edu_plus','edu_pro','sci','sci_plus','unknown'].includes(a?.planType)?a.planType:null;result.requiresOpenaiAuth=typeof message.result?.requiresOpenaiAuth==='boolean'?message.result.requiresOpenaiAuth:null;}
   send(3,'account/rateLimits/read',null);
  }else if(message.id===3){
   if(message.error){result.quotaRead='unavailable';result.quotaRpcCode=message.error.code;}
   else {const q=message.result;const pick=w=>w?{usedPercent:w.usedPercent??null,windowDurationMins:w.windowDurationMins??null,resetsAt:w.resetsAt??null}:null;result.ordinaryUsageAllowed=q?.ordinaryUsageAllowed??null;result.primary=pick(q?.rateLimits?.primary);result.secondary=pick(q?.rateLimits?.secondary);result.spendControlReached=q?.rateLimits?.spendControlReached??null;}
   result.status='METADATA_READ_COMPLETED';finish();
  }
 }
});
child.on('exit',()=>{if(!finished){result.status='METADATA_INTERFACE_EXITED';finish();}});
send(1,'initialize',{clientInfo:{name:'td613_non_inferential_metadata',version:'1.0.0'},capabilities:{experimentalApi:true}});
