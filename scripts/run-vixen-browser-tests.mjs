#!/usr/bin/env node
/** Supported runner: Node22+, pinned Playwright + installed Chromium and Linux libraries.
 * Browser prerequisites have an explicit nonzero HOLD, never a test pass/skip.
 */
import {spawn} from 'node:child_process';
import {readdirSync} from 'node:fs';
const files=process.argv.slice(2);
if(!files.length)files.push(...readdirSync('tests').filter(f=>/^vixen-.*-browser\.test\.mjs$/.test(f)).sort().map(f=>'tests/'+f),'tests/vixen-browser-visual-witness.mjs','tests/vixen-foundry-webgl-canary.mjs');
let server;
try{
 const {chromium}=await import('playwright');
 let probe;
 try{probe=await chromium.launch({headless:true});await probe.close();}
 catch(error){console.error(JSON.stringify({status:'HELD_EXTERNAL_BROWSER_PREREQUISITE',assertions_executed:false,reason:error.message}));process.exitCode=2;}
 if(!process.exitCode){
  server=spawn('python3',['-m','http.server','6130','--bind','127.0.0.1','--directory','app'],{stdio:['ignore','ignore','pipe']});
  let serverError='';server.stderr.on('data',b=>serverError+=b);
  let ready=false;
  for(let attempt=0;attempt<50;attempt++){
   await new Promise(r=>setTimeout(r,100));
   if(server.exitCode!==null)throw Error('DEDICATED_SERVER_REQUIRED '+serverError);
   try{const r=await fetch('http://127.0.0.1:6130/encyclopedia/vix-cyb.html');if(r.ok){ready=true;break;}}catch(_){}
  }
  if(!ready)throw Error('BROWSER_SERVER_UNAVAILABLE '+serverError);
  for(const file of files){
   console.log('REAL_BROWSER_FILE '+file);
   const code=await new Promise((resolve,reject)=>{const p=spawn(process.execPath,[file],{stdio:'inherit'});p.on('error',reject);p.on('exit',resolve);});
   if(code!==0){process.exitCode=code||1;break;}
  }
 }
}catch(error){console.error(JSON.stringify({status:'HELD_RUNNER_OR_FAILED_EXECUTION',reason:error.message}));process.exitCode=2;}
finally{server?.kill();}
