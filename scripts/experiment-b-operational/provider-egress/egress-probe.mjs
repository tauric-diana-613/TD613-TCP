import http from 'node:http';
import net from 'node:net';
import tls from 'node:tls';
import fs from 'node:fs';
async function connect(authority){return new Promise(resolve=>{
 const request=http.request({hostname:'127.0.0.1',port:8787,method:'CONNECT',path:authority});
 request.on('connect',(response,socket)=>resolve({status:response.statusCode,socket}));
 request.on('error',()=>resolve({status:'PROXY_ERROR'}));request.setTimeout(15000,()=>{request.destroy();resolve({status:'TIMEOUT'});});request.end();
});}
const result={evidenceClass:'ACTUAL_ORIGIN_GATEWAY_PROBE',modelRequests:0};
for(const authority of ['example.com:443','api.openai.com:443','127.0.0.1:443','169.254.169.254:443','auth.openai.com:80','chatgpt.com.attacker.invalid:443']){
 const r=await connect(authority);result[authority]=r.status;r.socket?.destroy();
}
for(const authority of ['auth.openai.com:443','chatgpt.com:443']){
 const r=await connect(authority);result[authority]={connectStatus:r.status};
 if(r.status===200){result[authority].verifiedTLS=await new Promise(resolve=>{const secure=tls.connect({socket:r.socket,servername:authority.split(':')[0],rejectUnauthorized:true},()=>{resolve(secure.authorized);secure.destroy();});secure.on('error',()=>resolve(false));secure.setTimeout(10000,()=>{secure.destroy();resolve(false);});});}else r.socket?.destroy();
}
result.directNetwork=await new Promise(resolve=>{const s=net.connect({host:'192.0.2.1',port:443});s.on('connect',()=>{s.destroy();resolve('UNEXPECTED_SUCCESS');});s.on('error',e=>resolve(e.code));s.setTimeout(1000,()=>{s.destroy();resolve('TIMEOUT');});});
const mismatch=await connect('auth.openai.com:443');
result.tlsOriginMismatchDenied=mismatch.status===200?await new Promise(resolve=>{const secure=tls.connect({socket:mismatch.socket,servername:'example.com',rejectUnauthorized:false},()=>{secure.destroy();resolve(false);});secure.on('error',()=>resolve(true));secure.on('close',()=>resolve(true));secure.setTimeout(10000,()=>{secure.destroy();resolve(false);});}):false;
result.credentialEnvironment=Object.keys(process.env).filter(n=>/OPENAI_API_KEY|GEMINI|ANTHROPIC|ACCESS_TOKEN|REFRESH_TOKEN/.test(n));
result.ambientAuthFile=fs.existsSync('/scratch/.codex/auth.json');
console.log(JSON.stringify(result));
const denied=['example.com:443','api.openai.com:443','127.0.0.1:443','169.254.169.254:443','auth.openai.com:80','chatgpt.com.attacker.invalid:443'];
if(!['ENETUNREACH','EHOSTUNREACH','EACCES','EPERM'].includes(result.directNetwork)||denied.some(key=>result[key]!==403)||result.credentialEnvironment.length||result.ambientAuthFile||!result['auth.openai.com:443'].verifiedTLS||!result['chatgpt.com:443'].verifiedTLS||!result.tlsOriginMismatchDenied)process.exitCode=1;
