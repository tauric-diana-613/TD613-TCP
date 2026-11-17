/**
 * Vixen / TD613 native Atelier host bridge.
 * Exact original Python executables are retained in their own research estates.
 * Machine-only, local checkout, explicitly host-authorized, read-only operations.
 * No source-body or private index data enters the public Vixen browser bundle.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, lstatSync, realpathSync} from 'node:fs';
import {resolve, isAbsolute, relative, sep} from 'node:path';

const HOLD=(code)=>{const e=new Error(code);e.code=code;throw e;};
const nonempty=(value,limit=300)=>typeof value==='string' && value.trim() && value.length<=limit ? value.trim() : HOLD('HELD_NATIVE_INPUT_REQUIRED');
const bounded=(n,maximum=20)=>Number.isInteger(n)&&n>=1&&n<=maximum?n:HOLD('HELD_NATIVE_LIMIT_INVALID');
const inside=(root,p)=>{const d=relative(root,p);return d==='' || (d!=='..'&&!d.startsWith('..'+sep)&&!isAbsolute(d));};
const safePublicRoot=(repo,parts)=>{
  const path=resolve(repo,...parts);
  if(!inside(repo,path)||!existsSync(path))HOLD('HELD_NATIVE_SOURCE_NOT_INSTALLED');
  return path;
};
const privateFile=(repo,value)=>{
  const name=nonempty(value,2048);
  if(!isAbsolute(name)||!existsSync(name)||lstatSync(name).isSymbolicLink())HOLD('HELD_PRIVATE_INDEX_PATH_REQUIRED');
  const actual=realpathSync(name);
  if(inside(repo,actual)||!lstatSync(actual).isFile())HOLD('HELD_PRIVATE_INDEX_OUTSIDE_REPO_REQUIRED');
  return actual;
};
const PY=process.env.TD613_NATIVE_PYTHON || (process.platform==='win32'?'python':'python3');
function execute(repo,script,args){
  if(!inside(repo,script)||!existsSync(script))HOLD('HELD_NATIVE_SOURCE_NOT_INSTALLED');
  try{
    const stdout=execFileSync(PY,[script,...args],{
      cwd:repo,encoding:'utf8',timeout:12000,maxBuffer:64000,
      env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1'}
    });
    return JSON.parse(stdout);
  }catch(e){
    if(e.code==='ENOENT')HOLD('HELD_NATIVE_PYTHON_UNAVAILABLE');
    HOLD('HELD_NATIVE_ENGINE_EXECUTION_FAILED');
  }
}
function nativeText(repo,estate,payload){
  const root=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0',estate]);
  const script=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0',estate,'99-ADMIN',
    estate==='SRC'?'src-native-text-search-v1.py':'em-native-text-search-v1.py']);
  const index=privateFile(repo,payload.index_path);
  const action=nonempty(payload.action||'verify',32);
  if(!['verify','search','get','cite','context','facets'].includes(action))HOLD('HELD_NATIVE_WRITE_OPERATION');
  const args=['--root',root,'--index',index,'--estate',estate,action];
  if(action==='search'){
    args.push(nonempty(payload.query,2000),'--mode',String(payload.mode||'lexical'));
    if(!['lexical','phrase','exact'].includes(String(payload.mode||'lexical')))HOLD('HELD_NATIVE_SEARCH_MODE');
    args.push('--limit',String(bounded(payload.limit??10,30)));
  }else if(['get','cite','context'].includes(action))args.push(nonempty(payload.source_id,250));
  return {estate,kind:'ORIGINAL_NATIVE_EXECUTABLE',read_only:true,scientific_credit:0,
    data:execute(repo,script,args)};
}
export function createNativeAtelierReadAdapters({repoRoot=process.cwd()}={}){
  const repo=realpathSync(resolve(repoRoot));
  const srcRoot=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0','SRC']);
  const wRoot=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0','WENDBINE']);
  const emRoot=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0','EMSTD613']);
  return Object.freeze({
    SRC_ATELIER:({operation,payload={}})=>{
      if(operation==='src_native_text')return nativeText(repo,'SRC',payload);
      if(operation!=='src_native_epoch_query')HOLD('HELD_SRC_NATIVE_OPERATION');
      const snapshot=nonempty(payload.snapshot_id,150),seal=nonempty(payload.seal_id,180);
      const action=String(payload.action||'summary');
      if(!['summary','resolve','trace','authority'].includes(action))HOLD('HELD_SRC_NATIVE_COMMAND');
      const script=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0','SRC','99-ADMIN','srcquery.py']);
      const args=['--root',srcRoot,'--snapshot-id',snapshot,'--seal-id',seal,action];
      if(action!=='summary')args.push(nonempty(payload.entity_id,250));
      if(action==='authority'&&payload.scope)args.push('--scope',nonempty(payload.scope,100));
      return {estate:'SRC',kind:'ORIGINAL_NATIVE_EXECUTABLE',read_only:true,scientific_credit:0,data:execute(repo,script,args)};
    },
    WENDBINE_ATELIER:({operation,payload={}})=>{
      if(!['wendbine_private_status','wendbine_private_search'].includes(operation))HOLD('HELD_WENDBINE_NATIVE_OPERATION');
      const script=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0','WENDBINE','99-ADMIN','wendbine-private-unified-query.py']);
      const index=privateFile(repo,payload.index_path);
      const args=['--db',index,operation==='wendbine_private_status'?'status':'search'];
      if(operation==='wendbine_private_search'){
        const mode=String(payload.mode||'exact');
        if(!['exact','fts'].includes(mode))HOLD('HELD_WENDBINE_QUERY_MODE');
        args.push(nonempty(payload.query,2000),'--mode',mode,'--limit',String(bounded(payload.limit??10,30)));
      }
      return {estate:'WENDBINE',kind:'ORIGINAL_NATIVE_EXECUTABLE',read_only:true,
        original_corpus_remains_separate:true,scientific_credit:0,data:execute(repo,script,args)};
    },
    EM_ATELIER:({operation,payload={}})=>{
      if(operation!=='em_native_text')HOLD('HELD_EM_NATIVE_OPERATION');
      return nativeText(repo,'EMSTD613',payload);
    },
    CROSS_ATELIER:({operation,payload={}})=>{
      if(operation!=='cross_atelier_lexical')HOLD('HELD_CROSS_ATELIER_OPERATION');
      const wdb=privateFile(repo,payload.wendbine_db);
      const script=safePublicRoot(repo,['scripts','atelier-cross-estate-query-v1.py']);
      const args=['--repo-root',repo,'--wendbine-db',wdb,'--src-checkout',srcRoot,
        '--em-checkout',emRoot,'lexical',nonempty(payload.query,2000),
        '--limit',String(bounded(payload.limit??8,20))];
      return {estate:'CROSS_ATELIER',kind:'ORIGINAL_NATIVE_EXECUTABLE',
        evidence_only:true,not_public_vixen_corpus:true,read_only:true,scientific_credit:0,
        data:execute(repo,script,args)};
    }
  });
}
