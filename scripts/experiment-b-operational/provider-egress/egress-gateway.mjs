import http from 'node:http';
import net from 'node:net';
import dns from 'node:dns/promises';
import fs from 'node:fs';
import {clientHelloServerName} from './tls-client-hello.mjs';
const allowed=new Set(['auth.openai.com:443','chatgpt.com:443']);
const socketPath='/bridge/gateway.sock';
const publicV4=ip=>{const p=ip.split('.').map(Number);return net.isIP(ip)===4 && !(
 p[0]===0||p[0]===10||p[0]===127||p[0]>=224||(p[0]===169&&p[1]===254)||(p[0]===172&&p[1]>=16&&p[1]<=31)||(p[0]===192&&p[1]===168)||(p[0]===100&&p[1]>=64&&p[1]<=127)||(p[0]===198&&[18,19].includes(p[1]))||(p[0]===192&&p[1]===0)||(p[0]===198&&p[1]===51&&p[2]===100)||(p[0]===203&&p[1]===0&&p[2]===113));};
const server=http.createServer({maxHeaderSize:8192},(_,response)=>{response.writeHead(403);response.end();});
let active=0;
server.on('connect',async(request,client,head)=>{
 if(!allowed.has(request.url)||active>=8){client.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');console.log(JSON.stringify({event:'origin_denied'}));return;}
 active++;let upstream,finished=false;
 const finish=()=>{if(finished)return;finished=true;active--;client.destroy();upstream?.destroy();};
 client.on('error',finish);client.on('close',finish);
 try{
  const host=request.url.slice(0,-4);
  const addresses=await dns.lookup(host,{family:4,all:true});
  if(!addresses.length||addresses.some(a=>!publicV4(a.address)))throw Error('PUBLIC_PROVIDER_ADDRESS_REQUIRED');
  if(client.destroyed){finish();return;}
  upstream=net.connect({host:addresses[0].address,port:443});
  upstream.setTimeout(300000,finish);client.setTimeout(300000,finish);
  upstream.once('error',finish);
  upstream.once('connect',()=>{
    client.write('HTTP/1.1 200 Connection Established\r\n\r\n');let hello=Buffer.from(head);
    const deadline=setTimeout(()=>{finish();},10000);
    const inspect=chunk=>{try{if(chunk)hello=Buffer.concat([hello,chunk]);const sni=clientHelloServerName(hello);if(sni===null)return;if(sni!==host)throw Error('TLS_ORIGIN_MISMATCH');clearTimeout(deadline);client.off('data',inspect);upstream.write(hello);client.pipe(upstream);upstream.pipe(client);console.log(JSON.stringify({event:'origin_connected',origin:host}));}catch{clearTimeout(deadline);finish();}};
    client.on('data',inspect);inspect();
  });
 }catch{client.end('HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\n\r\n');finish();}
});
server.headersTimeout=10000;server.requestTimeout=15000;
server.listen(socketPath,()=>{fs.chmodSync(socketPath,0o600);console.log(JSON.stringify({event:'gateway_ready',allowedOrigins:[...allowed]}));});
