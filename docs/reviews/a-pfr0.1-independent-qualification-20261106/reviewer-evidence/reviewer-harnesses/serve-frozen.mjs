import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
const file=new URL('./frozen2/app/encyclopedia/vix-cyb.html',import.meta.url);
const bytes=fs.readFileSync(file);
const sha=crypto.createHash('sha256').update(bytes).digest('hex');
const log=fs.createWriteStream(new URL('./evidence/http.jsonl',import.meta.url),{flags:'a'});
http.createServer((req,res)=>{const ok=req.method==='GET'&&req.url==='/encyclopedia/vix-cyb.html';log.write(JSON.stringify({at:new Date().toISOString(),method:req.method,url:req.url,status:ok?200:404,sha256:ok?sha:null})+'\n');res.writeHead(ok?200:404,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(ok?bytes:'Not found');}).listen(6137,'127.0.0.1',()=>console.log(JSON.stringify({url:'http://127.0.0.1:6137/encyclopedia/vix-cyb.html',sha256:sha,source:'7b6b4887f646155ba62b5c1b7bc0afc382fcaa34',bind:'127.0.0.1',method:'GET-only static frozen bytes'})));
