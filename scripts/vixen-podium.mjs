#!/usr/bin/env node
/**
 * 𝌋 Vixen Podium · machine-only operator collaboration CLI.
 * Reads public Vixen catalogue and Universal Edition 1.4 assets on disk;
 * deliberately performs no external network requests or file mutations.
 *
 * node scripts/vixen-podium.mjs --manifest
 * node scripts/vixen-podium.mjs --input path/to/task-batch.json
 * cat task-batch.json | node scripts/vixen-podium.mjs --stdin
 */
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,resolve,join,sep,relative} from 'node:path';
// Native module imports are resolved below from the verified public asset root.
// This supports both the repository layout and the exact-head preview ZIP.

const defaultRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const options=process.argv.slice(2);
const getFlag=name=>options.indexOf(name)>=0?options[options.indexOf(name)+1]:null;
const input=getFlag('--input');
const directory=getFlag('--root')||defaultRoot;
const appRoot=(await stat(join(directory,'app','encyclopedia','vix-cyb.html')).then(()=>join(directory,'app')).catch(()=>directory));
const sourceRoot=resolve(appRoot,'encyclopedia');
const {createVixenPodium,PODIUM_SCHEMA}=await import(pathToFileURL(join(sourceRoot,'reference','vixen-podium.mjs')).href);
const {createVixenReferenceMembrane}=await import(pathToFileURL(join(sourceRoot,'reference','vixen-read-gateway.mjs')).href);
const base='http://127.0.0.1:6130/encyclopedia/reference/';
const OUTPUT_CEILING=200000;
const fileTransport=async(uri,req)=>{
 const u=new URL(uri);
 if(u.origin!=='http://127.0.0.1:6130'||req?.method!=='GET')
  return new Response('FORBIDDEN',{status:403});
 const key=u.pathname.slice('/encyclopedia/'.length);
 if(!u.pathname.startsWith('/encyclopedia/reference/')||!/^reference\/(?:manifest|directory|graph)\.json$|^reference\/records\/[A-Z][A-Z0-9_-]{1,95}\.json$/.test(key))
  return new Response('FORBIDDEN',{status:403});
 const path=resolve(sourceRoot,key);
 if(!path.startsWith(sourceRoot+sep)||relative(sourceRoot,path).startsWith('..'))
  return new Response('FORBIDDEN',{status:403});
 try{
  const entry=await stat(path);
  if(!entry.isFile()||entry.size>2000000)return new Response('TOO_LARGE',{status:413});
  const bytes=await readFile(path);
  return new Response(bytes,{status:200,headers:{'content-length':String(bytes.length),'content-type':'application/json; charset=utf-8'}});
 }catch(_){return new Response('NOT_FOUND',{status:404})}
};
function parsePageCorpus(html){
 const match=html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 if(!match)throw Error('PODIUM_VIXEN_CORPUS_NOT_FOUND');
 return JSON.parse(match[1]);
}
const manifestPath=join(sourceRoot,'reference','podium','manifest.json');
if(options.includes('--manifest')){
 console.log(await readFile(manifestPath,'utf8'));process.exit(0);
}
let tasks;
try{
 let raw;
 if(input)raw=await readFile(resolve(input),'utf8');
 else if(options.includes('--stdin')||!process.stdin.isTTY){
  raw=await new Promise((yes,no)=>{let s='';process.stdin.setEncoding('utf8');
   process.stdin.on('data',c=>{s+=c;if(s.length>OUTPUT_CEILING)no(Error('PODIUM_INPUT_SIZE_LIMIT'))});
   process.stdin.on('end',()=>yes(s));process.stdin.on('error',no)});
 }else throw Error('PODIUM_TASK_INPUT_REQUIRED');
 if(!raw||raw.length>OUTPUT_CEILING)throw Error('PODIUM_INPUT_EMPTY_OR_OVERSIZE');
 const parsed=JSON.parse(raw);
 tasks=Array.isArray(parsed)?parsed:[parsed];
 if(tasks.length>24)throw Error('PODIUM_BATCH_LIMIT_24');
 const corpus=parsePageCorpus(await readFile(join(sourceRoot,'vix-cyb.html'),'utf8'));
 const membrane=createVixenReferenceMembrane({
  baseURL:base,fetcher:fileTransport,cryptoProvider:globalThis.crypto
 });
 const podium=createVixenPodium({corpus,membrane,sourceRevision:'LOCAL_CHECKOUT_UNVERIFIED',
  operatorAuthorized:false,engineAdapters:{}});
 const results=[];
 for(const task of tasks)results.push(await podium.dispatch(task));
 const output={schema:'td613.vixen.podium.cli-batch/v1',task_schema:PODIUM_SCHEMA,
  source_custody:'LOCAL_PUBLIC_ASSETS_ONLY',remote_custody:'NOT_CLAIMED',results,
  route_history:podium.history(),authority:'READ_ONLY_HUMAN_CLOSURE_RESERVED'};
 console.log(JSON.stringify(output,null,2));
}catch(e){
 console.error(JSON.stringify({schema:'td613.vixen.podium.cli-error/v1',
  status:'HELD',error:String(e?.message||'PODIUM_EXECUTION_ERROR').slice(0,300),
  release_authority:false}));
 process.exitCode=2;
}
