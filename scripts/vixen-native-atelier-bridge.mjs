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
const privateDirectory=(repo,value)=>{
 const name=nonempty(value,2048);
 if(!isAbsolute(name)||!existsSync(name)||lstatSync(name).isSymbolicLink())HOLD('HELD_PRIVATE_MODEL_DIRECTORY_REQUIRED');
 const actual=realpathSync(name);
 if(inside(repo,actual)||!lstatSync(actual).isDirectory())HOLD('HELD_PRIVATE_MODEL_OUTSIDE_REPO_REQUIRED');
 return actual;
};
function executeNode(repo,script,args){
 if(!inside(repo,script)||!existsSync(script))HOLD('HELD_NATIVE_SOURCE_NOT_INSTALLED');
 try{
  return JSON.parse(execFileSync(process.execPath,[script,...args],{
   cwd:repo,encoding:'utf8',timeout:12000,maxBuffer:64000,
   env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}
  }));
 }catch(e){HOLD('HELD_NATIVE_NODE_EXECUTION_FAILED')}
}
function semanticRead(repo,estate,payload){
 const script=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0',estate,'99-ADMIN','native-semantic-search-v1.py']);
 const sourceIndex=privateFile(repo,payload.source_index_path);
 const vectorIndex=privateFile(repo,payload.vector_index_path);
 const modelDir=privateDirectory(repo,payload.model_dir);
 const args=['--source-index',sourceIndex,'--vector-index',vectorIndex,'--model-dir',modelDir,
  '--estate',estate,nonempty(payload.query,2000)];
 return {estate,kind:'ORIGINAL_NATIVE_EXECUTABLE',read_only:true,
  semantic_corpus_pairing_verified_by_original_runtime:true,
  relation_proven:false,scientific_credit:0,data:execute(repo,script,args)};
}
function pinnedNativeRoots(repo,estate,config){
 // Native scripts disagree by design on their --root contracts:
 // single-estate route takes <checkout>/packages/.../<ESTATE>, whereas
 // cross-estate loaders take <checkout> and append the estate subtree.
 // Resolve both explicitly rather than forwarding the same untyped path.
 const checkoutRoot=config?privateDirectory(repo,config.path):repo;
 const estateRoot=resolve(checkoutRoot,'packages','dome_world_exact','fixtures','a15-r0',estate);
 if(!inside(checkoutRoot,estateRoot)||!existsSync(estateRoot)||
    !lstatSync(estateRoot).isDirectory()||lstatSync(estateRoot).isSymbolicLink())
  HOLD('HELD_NATIVE_ESTATE_ROOT_MISSING');
 let gitTop=null,observed=null;
 try{
  gitTop=realpathSync(execFileSync('git',['-C',checkoutRoot,'rev-parse','--show-toplevel'],
    {encoding:'utf8',timeout:5000}).trim());
  observed=execFileSync('git',['-C',checkoutRoot,'rev-parse','HEAD'],
    {encoding:'utf8',timeout:5000}).trim();
 }catch(_){HOLD('HELD_NATIVE_SOURCE_CHECKOUT_INVALID')}
 if(gitTop!==checkoutRoot)HOLD('HELD_NATIVE_CHECKOUT_ROOT_CONTRACT_REQUIRED');
 if(config){
  const wanted=nonempty(config.git_head,40);
  if(!/^[0-9a-f]{40}$/.test(wanted))HOLD('HELD_NATIVE_PINNED_HEAD_REQUIRED');
  if(observed!==wanted)HOLD('HELD_NATIVE_SOURCE_CHECKOUT_HEAD_DRIFT');
 }
 return Object.freeze({checkoutRoot,estateRoot,
   source_revision:observed,root_contract:'CHECKOUT_AND_ESTATE_DISTINCT'});
}

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
function nativeText(repo,estate,payload,externalRoot=null){
  const root=externalRoot||safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0',estate]);
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
export function createNativeAtelierReadAdapters({repoRoot=process.cwd(),sourceCheckouts=null}={}){
  const repo=realpathSync(resolve(repoRoot));
  const wRoot=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0','WENDBINE']);
  const srcRoots=pinnedNativeRoots(repo,'SRC',sourceCheckouts?.SRC);
  const emRoots=pinnedNativeRoots(repo,'EMSTD613',sourceCheckouts?.EMSTD613);
  const pinnedSRC=srcRoots.estateRoot, pinnedEm=emRoots.estateRoot;
  const pinnedSRCCheckout=srcRoots.checkoutRoot,pinnedEmCheckout=emRoots.checkoutRoot;
  return Object.freeze({
    SRC_ATELIER:({operation,payload={}})=>{
      if(operation==='src_native_text')return nativeText(repo,'SRC',payload,pinnedSRC);
      if(operation==='src_native_semantic')return semanticRead(repo,'SRC',payload);
      if(operation==='src_native_projective_assay'){
       const script=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0','SRC','99-ADMIN','run-projective-routing-grammar-assay.py']);
       return {estate:'SRC',kind:'ORIGINAL_NATIVE_EXECUTABLE',read_only:true,scientific_credit:0,
        data:execute(repo,script,['--root',pinnedSRC])};
      }
      if(operation==='src_native_evidence_traverse'){
       const script=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0','SRC','99-ADMIN','src-evidence-rabbit-hole-v1.py']);
       return {estate:'SRC',kind:'ORIGINAL_NATIVE_EXECUTABLE',read_only:true,scientific_credit:0,
        data:execute(repo,script,['--src-root',pinnedSRC,nonempty(payload.entity_id,240),
         '--depth',String(bounded(payload.depth??2,4)),'--limit',String(bounded(payload.limit??15,40))])};
      }
      if(operation==='src_native_research_journey'){
       const script=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0','SRC','99-ADMIN','src-research-journey-v1.py']);
       return {estate:'SRC',kind:'ORIGINAL_NATIVE_EXECUTABLE',read_only:true,scientific_credit:0,
        data:execute(repo,script,['--root',pinnedSRC,'--index',privateFile(repo,payload.index_path),
         nonempty(payload.query,2000),'--depth',String(bounded(payload.depth??2,4)),
         '--limit',String(bounded(payload.limit??8,30))])};
      }
      if(operation!=='src_native_epoch_query')HOLD('HELD_SRC_NATIVE_OPERATION');
      const snapshot=nonempty(payload.snapshot_id,150),seal=nonempty(payload.seal_id,180);
      const action=String(payload.action||'summary');
      if(!['summary','resolve','trace','authority'].includes(action))HOLD('HELD_SRC_NATIVE_COMMAND');
      const script=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0','SRC','99-ADMIN','srcquery.py']);
      const args=['--root',pinnedSRC,'--snapshot-id',snapshot,'--seal-id',seal,action];
      if(action!=='summary')args.push(nonempty(payload.entity_id,250));
      if(action==='authority'&&payload.scope)args.push('--scope',nonempty(payload.scope,100));
      return {estate:'SRC',kind:'ORIGINAL_NATIVE_EXECUTABLE',read_only:true,scientific_credit:0,data:execute(repo,script,args)};
    },
    WENDBINE_ATELIER:({operation,payload={}})=>{
      if(operation==='wendbine_public_open_world_ceiling'){
       const script=safePublicRoot(repo,['scripts','wendbine-open-world-ceiling.mjs']);
       return {estate:'WENDBINE',kind:'TD613_DERIVED_OPEN_WORLD_NOVELTY_CEILING',
        read_only:true,private_index_accessed:false,source_estate_immutable:true,
        scientific_credit:0,original_author_intent_promotion:false,
        experiment_class:'RETROSPECTIVE_POSITIVE_ONLY_NO_NOVELTY_CALIBRATION',
        data:executeNode(repo,script,[])};
      }
      if(operation==='wendbine_public_directed_walk'){
       const script=safePublicRoot(repo,['scripts','wendbine-directed-walk-falsification.mjs']);
       return {estate:'WENDBINE',kind:'TD613_DERIVED_DIRECTED_WALK_FALSIFICATION',
        read_only:true,private_index_accessed:false,source_estate_immutable:true,
        experimental_model:'POST_HOC_EXPLORATORY',authorship_promotion:false,
        scientific_credit:0,data:executeNode(repo,script,[])};
      }
      if(operation==='wendbine_public_topology_rewire'){
       const script=safePublicRoot(repo,['scripts','wendbine-topology-rewire-challenge.mjs']);
       return {estate:'WENDBINE',kind:'TD613_DERIVED_TOPOLOGY_REWIRE_NEGATIVE_CONTROL',
        read_only:true,private_index_accessed:false,source_estate_immutable:true,
        synthetic_control_source_status:'COUNTERFACTUAL_NOT_ORIGINAL_EVIDENCE',
        authorship_promotion:false,scientific_credit:0,
        data:executeNode(repo,script,[])};
      }
      if(operation==='wendbine_public_frequency_null'){
       const script=safePublicRoot(repo,['scripts','wendbine-frequency-null-challenge.mjs']);
       return {estate:'WENDBINE',kind:'TD613_DERIVED_PUBLIC_FREQUENCY_NULL',
        read_only:true,private_index_accessed:false,source_estate_immutable:true,
        authorship_promotion:false,scientific_credit:0,
        data:executeNode(repo,script,[])};
      }
      if(operation==='wendbine_local_bitemporal_capture'){
       const script=safePublicRoot(repo,['scripts','wendbine-bitemporal-capture-v1.py']);
       const sourceId=nonempty(payload.source_id,80);
       if(!/^reddit:t3_[a-z0-9]{5,12}$/.test(sourceId))HOLD('HELD_NATIVE_WENDBINE_EXACT_SOURCE_ID');
       const cutoff=nonempty(payload.cutoff_utc,40);
       if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(cutoff))
        HOLD('HELD_NATIVE_UTC_CAPTURE_CUTOFF_REQUIRED');
       return {estate:'WENDBINE',kind:'TD613_LOCAL_CAPTURE_CLOCK_LENS',
        read_only:true,source_capture_index_only:true,private_index_accessed:true,
        independent_observation_clock_verified:false,historical_origin_proven:false,
        scientific_credit:0,data:execute(repo,script,['--wendbine-db',
         privateFile(repo,payload.index_path),'--source-id',sourceId,'--cutoff-utc',cutoff])};
      }
      if(operation==='wendbine_observed_evidence_routes'){
       const script=safePublicRoot(repo,['scripts','wendbine-evidence-routes-v1.py']);
       const sourceId=nonempty(payload.source_id,80);
       if(!/^reddit:t3_[a-z0-9]{5,12}$/.test(sourceId))HOLD('HELD_NATIVE_WENDBINE_EXACT_SOURCE_ID');
       return {estate:'WENDBINE',kind:'TD613_CAPTURE_BOUND_OBSERVATION_ENGINE',
        original_poster_authorship_of_instrument:false,source_bound:true,read_only:true,
        native_src_parity:'UNTESTED',causal_relation_promotion:false,scientific_credit:0,
        data:execute(repo,script,['--wendbine-db',privateFile(repo,payload.index_path),
         sourceId,'--limit',String(bounded(payload.limit??40,100))])};
      }
      // Host-only derived research methods execute the preserved original public compiler
      // and a separately attributed TD613 assay. They never enter Vixen's public bundle.
      if(['wendbine_public_reconstruction','wendbine_public_research_journey','wendbine_public_inventory','wendbine_public_sweep'].includes(operation)){
       const script=safePublicRoot(repo,['scripts','wendbine-proscenium-assay.mjs']);
       const mode=operation==='wendbine_public_reconstruction'?'assay':
        operation==='wendbine_public_research_journey'?'journey':operation==='wendbine_public_sweep'?'sweep':'inventory';
       const args=['--mode',mode];
       if(mode==='assay'||mode==='journey')args.push('--target-source-id',nonempty(payload.target_source_id,80));
       if(payload.as_of_day)args.push('--as-of-day',nonempty(payload.as_of_day,10));
       if(payload.question)args.push('--question',nonempty(payload.question,250));
       return {estate:'WENDBINE',kind:'ORIGINAL_COMPILER_PLUS_TD613_DERIVED_ASSAY',
        read_only:true,source_estate_immutable:true,private_index_accessed:false,
        performer_authorship_promotion:false,scientific_credit:0,
        data:executeNode(repo,script,args)};
      }
      if(operation==='wendbine_public_query'){
       const script=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0','WENDBINE','99-ADMIN','wendbine-query.mjs']);
       const action=String(payload.action||'summary');
       if(!['summary','search','recent','resolve'].includes(action))HOLD('HELD_WENDBINE_PUBLIC_QUERY_ACTION');
       const args=[action];
       if(action==='search'){
        const mode=String(payload.mode||'lexical');
        if(!['lexical','semantic'].includes(mode))HOLD('HELD_WENDBINE_SEARCH_MODE');
        args.push(nonempty(payload.query,1500),'--mode',mode,'--limit',String(bounded(payload.limit??10,30)));
       }else if(action==='recent')args.push('--limit',String(bounded(payload.limit??10,30)));
       else if(action==='resolve')args.push(nonempty(payload.entity_id,250));
       const requestedMode=action==='search'?String(payload.mode||'lexical'):null;
       return {estate:'WENDBINE',kind:'ORIGINAL_NATIVE_EXECUTABLE',
        public_index_only:true,read_only:true,scientific_credit:0,
        search_method:action==='search'?(requestedMode==='semantic'?
         'ORIGINAL_CONCEPT_WEIGHTED_LEXICAL_RANKING_NOT_EMBEDDING_SEMANTICS':'ORIGINAL_LEXICAL_RANKING'):null,
        embedding_model_executed:false,source_person_authorship_of_query_software:false,
        data:executeNode(repo,script,args)};
      }
      if(operation==='wendbine_sealed_epoch_query'){
       const script=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0','WENDBINE','99-ADMIN','wendbine-srcquery.mjs']);
       const action=String(payload.action||'summary'),route=String(payload.route||'AUDIT');
       if(!['summary','resolve','chronology','versions','relations'].includes(action)||
          !['EXPERIENTIAL','CUSTODIAL','AUDIT','IMPLEMENTATION'].includes(route))HOLD('HELD_WENDBINE_EPOCH_ROUTE');
       const args=['--root',wRoot,'--snapshot-id',nonempty(payload.snapshot_id,160),
        '--seal-id',nonempty(payload.seal_id,160),'--route',route,'--action',action];
       if(['resolve','versions'].includes(action))args.push('--id',nonempty(payload.entity_id,250));
       if(action==='relations'&&payload.entity_id)args.push('--id',nonempty(payload.entity_id,250));
       return {estate:'WENDBINE',kind:'ORIGINAL_NATIVE_EXECUTABLE',read_only:true,
        epoch_pinned:true,scientific_credit:0,data:executeNode(repo,script,args)};
      }
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
      if(operation==='em_native_text')return nativeText(repo,'EMSTD613',payload,pinnedEm);
      if(operation==='em_native_semantic')return semanticRead(repo,'EMSTD613',payload);
      if(operation==='em_native_work_route'){
       const script=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0','EMSTD613','99-ADMIN','em-work-route-v1.py']);
       return {estate:'EMSTD613',kind:'ORIGINAL_NATIVE_EXECUTABLE',read_only:true,scientific_credit:0,
        data:execute(repo,script,['--em-root',pinnedEm,nonempty(payload.work_id,250)])};
      }
      if(operation==='em_native_research_journey'){
       const script=safePublicRoot(repo,['packages','dome_world_exact','fixtures','a15-r0','EMSTD613','99-ADMIN','em-research-journey-v1.py']);
       return {estate:'EMSTD613',kind:'ORIGINAL_NATIVE_EXECUTABLE',read_only:true,scientific_credit:0,
        data:execute(repo,script,['--root',pinnedEm,'--index',privateFile(repo,payload.index_path),
         nonempty(payload.query,2000)])};
      }
      HOLD('HELD_EM_NATIVE_OPERATION');
    },
    CROSS_ATELIER:({operation,payload={}})=>{
      if(operation==='cross_atelier_semantic'){
       const wdb=privateFile(repo,payload.wendbine_db);
       const script=safePublicRoot(repo,['scripts','atelier-cross-estate-query-v1.py']);
       const modelSha=nonempty(payload.model_sha256,64);
       if(!/^[0-9a-f]{64}$/.test(modelSha))HOLD('HELD_SEMANTIC_MODEL_DIGEST');
       return {estate:'CROSS_ATELIER',kind:'ORIGINAL_NATIVE_EXECUTABLE',read_only:true,
        source_bound:true,relation_proven:false,scientific_credit:0,
        data:execute(repo,script,['--repo-root',repo,'--wendbine-db',wdb,
        '--src-checkout',pinnedSRCCheckout,'--em-checkout',pinnedEmCheckout,'semantic',
        '--query-vector-file',privateFile(repo,payload.query_vector_file),
        '--private-vectors',privateFile(repo,payload.vector_index_file),
        '--model-sha256',modelSha,'--limit',String(bounded(payload.limit??8,20))])};
      }
      if(operation!=='cross_atelier_lexical')HOLD('HELD_CROSS_ATELIER_OPERATION');
      const wdb=privateFile(repo,payload.wendbine_db);
      const script=safePublicRoot(repo,['scripts','atelier-cross-estate-query-v1.py']);
      const args=['--repo-root',repo,'--wendbine-db',wdb,'--src-checkout',pinnedSRCCheckout,
        '--em-checkout',pinnedEmCheckout,'lexical',nonempty(payload.query,2000),
        '--limit',String(bounded(payload.limit??8,20))];
      return {estate:'CROSS_ATELIER',kind:'ORIGINAL_NATIVE_EXECUTABLE',
        evidence_only:true,not_public_vixen_corpus:true,read_only:true,scientific_credit:0,
        data:execute(repo,script,args)};
    }
  });
}
