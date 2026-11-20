import {createNativeAtelierReadAdapters} from './vixen-native-atelier-bridge.mjs';
/**
 * 𝌋 Podium native source-only engine conduit.
 *
 * Connects all five declared Podium engine slots:
 *   APERTURE          (aperture-v32, td613-aperture, synthesis-salon-engine)
 *   ATLAS             (dollhouse-atlas-relational-custody, atlas-mathematical-engine, FADT)
 *   DOLLHOUSE         (dollhouse-skill-dispatcher, FADT reparative, temporal custodian)
 *   RULEFIELD         (role-boundary, cross-opera-warrant, observatory-vixen-corpus, salon, pedagogue)
 *   UNIVERSAL_ATELIER (strictly read-only Edition 1.4 local index & SHA-256 verifier)
 *
 * No module is fabricated when unavailable. This adapter is created only
 * by a human-directed host that explicitly selects the native-read-tools
 * lane. The CLI's flag is NOT cryptographic human authorization.
 * Engine results remain research proposals / audit receipts, not science.
 */
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,stat} from 'node:fs/promises';
import {resolve,sep,relative} from 'node:path';
import {existsSync} from 'node:fs';

const allowedRoles=Object.freeze(['PEDAGOGUE','APERTURE','ATLAS','FADT','TEMPORAL_CUSTODIAN']);
const evidenceRefs=Object.freeze([
 'app/encyclopedia/reference/vixen-podium.mjs',
 'app/encyclopedia/reference/podium/manifest.json',
 'app/encyclopedia/reference/vixen-operator-encounter.mjs',
 'app/encyclopedia/reference/vixen-read-gateway.mjs',
 'tests/vixen-podium.test.mjs'
]);
const VALID_REF_ID=/^(?:EDITION|[A-Z][A-Z0-9]*-[A-Z0-9][A-Z0-9_-]{0,95})$/;
const head=repoRoot=>{try{return execFileSync('git',['rev-parse','HEAD'],{cwd:repoRoot,encoding:'utf8'}).trim()}
 catch(_){return 'UNVERIFIED_LOCAL_REPO'}};

function resolveAssetBases(repoRoot,explicitSourceRoot){
 const candidates=explicitSourceRoot
  ?[resolve(explicitSourceRoot)]
  :[resolve(repoRoot,'app','encyclopedia'),resolve(repoRoot,'encyclopedia'),resolve(repoRoot)];
 let sourceRoot=candidates[0];
 for(const cand of candidates){
  if(existsSync(resolve(cand,'reference','manifest.json'))||existsSync(resolve(cand,'vixen-estate','synthesis-salon-engine.mjs'))){
   sourceRoot=cand;break;
  }
 }
 const engineRoot=existsSync(resolve(repoRoot,'app','engine'))
  ?resolve(repoRoot,'app','engine')
  :resolve(repoRoot,'engine');
 return {sourceRoot,engineRoot};
}

async function importOptional(filePath){
 try{
  if(!existsSync(filePath))return null;
  return await import(new URL(`file:///${filePath.replace(/\\/g,'/')}`).href);
 }catch(_){return null}
}

export async function createPodiumNativeReadAdapters({repoRoot=process.cwd(),sourceRoot:explicitSourceRoot=null,nativeSourceCheckouts=null}={}){
 const adapters={};
 const {sourceRoot,engineRoot}=resolveAssetBases(repoRoot,explicitSourceRoot);

 const apertureV32=await importOptional(resolve(engineRoot,'aperture-v32-typed-epistemic-deficit.js'));
 const td613Aperture=await importOptional(resolve(engineRoot,'td613-aperture.js'));
 const salonEngine=await importOptional(resolve(sourceRoot,'vixen-estate','synthesis-salon-engine.mjs'));
 const srcEngines=await importOptional(resolve(sourceRoot,'vixen-estate','src-atelier-engines.mjs'));
 const atlasCustody=await importOptional(resolve(engineRoot,'dollhouse-atlas-relational-custody.js'));
 const atlasMath=await importOptional(resolve(engineRoot,'atlas-mathematical-engine.js'));
 const fadtAssist=await importOptional(resolve(engineRoot,'dollhouse-fadt-reparative-assistance.js'));
 const dollhouse=await importOptional(resolve(engineRoot,'dollhouse-skill-dispatcher.js'));
 const temporal=await importOptional(resolve(engineRoot,'dollhouse-temporal-custodian.js'));
 const pedagogue=await importOptional(resolve(engineRoot,'dollhouse-pedagogue-dromological.js'));
 const roleBoundary=await importOptional(resolve(sourceRoot,'vixen-estate','role-boundary.mjs'));
 const crossWarrant=await importOptional(resolve(sourceRoot,'vixen-estate','cross-opera-warrant.mjs'));
 const vixenCorpusMod=await importOptional(resolve(sourceRoot,'vixen-estate','observatory-vixen-corpus.mjs'));

 let cachedCorpus=null;
 async function loadLocalVixenCorpus(){
  if(cachedCorpus)return cachedCorpus;
  const htmlPath=resolve(sourceRoot,'vix-cyb.html');
  const html=await readFile(htmlPath,'utf8');
  const m=html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
  if(!m)throw Error('HELD_VIXEN_CORPUS_NOT_FOUND');
  cachedCorpus=JSON.parse(m[1]);
  return cachedCorpus;
 }

 // 1. APERTURE adapter
 if(apertureV32||td613Aperture||salonEngine){
  adapters.APERTURE=async ({operation,payload={}})=>{
   if(operation==='audit_epistemic_deficit'){
    if(!apertureV32?.auditTypedEpistemicDeficit)throw Error('HELD_APERTURE_MODULE_UNAVAILABLE');
    return apertureV32.auditTypedEpistemicDeficit(payload);
   }
   if(operation==='evaluate_probe_stability'){
    if(!apertureV32?.evaluateCandidateProbeStability)throw Error('HELD_APERTURE_MODULE_UNAVAILABLE');
    return apertureV32.evaluateCandidateProbeStability(payload);
   }
   if(operation==='compute_matrix_svd'){
    if(!apertureV32?.computeMatrixSvd)throw Error('HELD_APERTURE_MODULE_UNAVAILABLE');
    const matrix=Array.isArray(payload)?payload:payload?.matrix;
    return apertureV32.computeMatrixSvd(matrix);
   }
   if(operation==='td613_governed_exposure'){
    if(!td613Aperture)throw Error('HELD_TD613_APERTURE_UNAVAILABLE');
    if(payload?.transfer_review)return td613Aperture.reviewTD613ApertureTransfer(payload);
    return td613Aperture.buildTD613GovernedExposureSchema(payload||{});
   }
   if(operation==='observatory_diagnostics'){
    if(!salonEngine?.computeSalonObservatoryDiagnostics)throw Error('HELD_SALON_ENGINE_UNAVAILABLE');
    return salonEngine.computeSalonObservatoryDiagnostics(payload||{});
   }
   throw Error('HELD_APERTURE_OPERATION');
  };
 }

 // 2. ATLAS adapter
 if(atlasCustody||atlasMath||fadtAssist){
  adapters.ATLAS=async ({operation,payload={}})=>{
   if(operation==='compare_routes'){
    if(!atlasCustody?.auditAtlasHolonomyHistoryParity)throw Error('HELD_ATLAS_CUSTODY_UNAVAILABLE');
    return atlasCustody.auditAtlasHolonomyHistoryParity(payload.trajectoryA||{},payload.trajectoryB||{});
   }
   if(operation==='trace_relations'){
    if(!atlasCustody?.classifyAtlasRelationIdentity)throw Error('HELD_ATLAS_CUSTODY_UNAVAILABLE');
    return atlasCustody.classifyAtlasRelationIdentity(payload.left||{},payload.right||{});
   }
   if(operation==='atlas_math_dispatch'){
    if(!atlasMath?.dispatchAtlasMathematicalOperation)throw Error('HELD_ATLAS_MATH_UNAVAILABLE');
    if(typeof payload?.capability!=='string'||!payload.capability.trim())throw Error('HELD_ATLAS_CAPABILITY_REQUIRED');
    return atlasMath.dispatchAtlasMathematicalOperation(payload.capability,payload.input||{},payload.options||{});
   }
   if(operation==='fadt_fiber_audit'){
    if(!fadtAssist?.computeFadtFiberBounds)throw Error('HELD_FADT_UNAVAILABLE');
    return fadtAssist.computeFadtFiberBounds(payload.fiber_rows||payload.rows||payload.fibers||[]);
   }
   if(operation==='fadt_coordinate_recovery'){
    if(!fadtAssist?.evaluateFadtCoordinateRecovery)throw Error('HELD_FADT_UNAVAILABLE');
    return fadtAssist.evaluateFadtCoordinateRecovery(
     payload.fiber_rows||payload.rows||payload.fibers||payload.colliding_rows||[],
     payload.candidate_coordinates||payload.coordinates||[]
    );
   }
   if(operation==='fadt_discrepancy'){
    if(!fadtAssist?.evaluateFadtDiscrepancyIdentity)throw Error('HELD_FADT_UNAVAILABLE');
    return fadtAssist.evaluateFadtDiscrepancyIdentity(payload.candidate_rule||payload.rule,payload.fiber_rows||payload.rows||payload.fibers||[]);
   }
   if(operation==='vixen_semantic_search'){
    const searchMod=await importOptional(resolve(sourceRoot,'vixen-estate','semantic-semiotic-search.mjs'));
    if(!searchMod?.loadSemanticSemioticEngine)throw Error('HELD_SEMANTIC_SEMIOTIC_SEARCH_UNAVAILABLE');
    const engine=await searchMod.loadSemanticSemioticEngine();
    // The machine receipt has a strict 50 KB envelope. Honor the caller's
    // finite hit bound instead of accidentally returning the default 20 hits.
    const limitIn=Number(payload.limit??payload.options?.limit??8);
    if(!Number.isInteger(limitIn)||limitIn<1||limitIn>12)
      throw Error('HELD_ATLAS_SEARCH_LIMIT_1_TO_12');
    const searchOpts={...(payload.options||{}),...(payload.mode?{mode:payload.mode}:{}),limit:limitIn};
    return engine.search(String(payload.query||''),searchOpts);
   }
   throw Error('HELD_ATLAS_OPERATION');
  };
 }

 // 3. DOLLHOUSE adapter
 if(dollhouse||fadtAssist||temporal){
  adapters.DOLLHOUSE=async ({operation,payload={}})=>{
   if(operation==='audit'){
    if(typeof dollhouse?.runDollhouseSkillAudit!=='function')throw Error('HELD_DOLLHOUSE_UNAVAILABLE');
    if(!payload||!payload.domain_inputs||typeof payload.domain_inputs!=='object'||
       Array.isArray(payload.domain_inputs))throw Error('HELD_DOLLHOUSE_INPUTS_REQUIRED');
    // Compose the exact declared five-role specimen rather than forwarding
    // arbitrary file paths, overwrite flags or unverified release authority.
    const spec={
     task_scope:'VIXEN_PODIUM_NATIVE_FIVE_ROLE_AUDIT',
     evidence_class:'SYNTHETIC_TEST_FIXTURE',
     source_revision:head(repoRoot),roles:[...allowedRoles],
     include_orchestrator:true,evidence_references:[...evidenceRefs],
     domain_inputs:payload.domain_inputs
    };
    const run=await dollhouse.runDollhouseSkillAudit(spec);
    const m=run.machine_receipt;
    return {schema:m.schema,source_revision:m.source_revision,
     source_revision_verified:m.source_revision_verified,
     roles_attempted:m.roles_attempted,roles_executed:m.roles_executed,
     missing_inputs:m.missing_inputs,specialist_findings:m.specialist_findings,
     orchestrator:m.orchestrator,empirical_replication_count:0,
     claimant:'SYNTHETIC_NATIVE_AUDIT_NOT_HUMAN_ADJUDICATION'};
   }
   if(operation==='fadt_reparative_packet'){
    if(!fadtAssist?.compileFadtReparativePacket)throw Error('HELD_FADT_UNAVAILABLE');
    return fadtAssist.compileFadtReparativePacket(payload||{});
   }
   if(operation==='temporal_non_retroactivity'){
    if(!temporal?.auditTemporalLedgerNonRetroactivity)throw Error('HELD_TEMPORAL_UNAVAILABLE');
    const entries=Array.isArray(payload)?payload:(payload.ledger_entries||payload.entries||[]);
    const baseline=Array.isArray(payload)?null:(payload.baseline_entries??null);
    return temporal.auditTemporalLedgerNonRetroactivity(entries,baseline);
   }
   throw Error('HELD_DOLLHOUSE_OPERATION');
  };
 }

 // 4. RULEFIELD adapter (role separation, cross-opera warrants, salon & pedagogue)
 if(roleBoundary||crossWarrant||vixenCorpusMod||salonEngine||pedagogue){
  adapters.RULEFIELD=async ({operation,payload={}})=>{
   if(operation==='assess_roles'){
    const separation=roleBoundary?.assertStageRoleSeparation?roleBoundary.assertStageRoleSeparation():null;
    // Role and original Work identity come from the local source intake,
    // never an untrusted caller-supplied synthetic research corpus.
    const corpus=await loadLocalVixenCorpus();
    const targetId=Object.prototype.hasOwnProperty.call(payload||{},'work_id')
     ?String(payload.work_id??''):String(corpus.works?.[0]?.work_id||'');
    const workObj=corpus.works?.find(w=>w.work_id===targetId)||null;
    const performer=roleBoundary?.castVixenPerformer&&workObj?roleBoundary.castVixenPerformer(workObj,corpus):null;
    const operaEvent=roleBoundary?.stageVixenOperaEvent&&performer
     ?roleBoundary.stageVixenOperaEvent(String(payload?.action||'INSPECT_WORK'),performer,{target:targetId,note:'BOUNDED_READ_ONLY_AUDIT'})
     :null;
    const operahouse=roleBoundary?.readOperahouseStatus?roleBoundary.readOperahouseStatus({state:'LOCAL_READ_ONLY'}):null;
    const sourceObj=(Array.isArray(corpus.sources)&&corpus.sources.find(s=>s.work_id===targetId||s.source_file_id===payload?.source_file_id))||{work_id:targetId,source_file_id:payload?.source_file_id||'UNSPECIFIED'};
    const warrant=crossWarrant?.inspectVixenCrossOperaWarrant&&workObj
     ?crossWarrant.inspectVixenCrossOperaWarrant({work:workObj,source:sourceObj})
     :null;
    const census=vixenCorpusMod?.completeVixenSourceCensus?vixenCorpusMod.completeVixenSourceCensus(corpus):null;
    return {
     schema:'emstd613.vixen.rulefield-assessment/v1',
     roles_separated:separation,
     source_work_state:workObj?'SOURCE_ROSTER_MATCHED':'HELD_UNKNOWN_VIXEN_WORK',
     operahouse_status:operahouse,
     staged_opera_event:operaEvent,
     cross_opera_warrant:warrant,
     vixen_source_census:census,
     empirical_replication_credit:0,
     human_closure_required:true
    };
   }
   if(operation==='propose_rulefield'){
    if(!salonEngine?.composeSalonPlan)throw Error('HELD_SALON_ENGINE_UNAVAILABLE');
    const corpus=payload?.corpus||await loadLocalVixenCorpus();
    const workA=payload?.work_ids?.[0]||corpus.works?.[0]?.work_id;
    const workB=payload?.work_ids?.[1]||corpus.works?.[1]?.work_id;
    const trackId=payload?.track_id||corpus.giveback_tracks?.[0]?.id;
    const protocolId=payload?.protocol_id||corpus.instruments?.[0]?.instrument_id;
    const plan=salonEngine.composeSalonPlan(corpus,{
     work_ids:[workA,workB],
     track_id:trackId,
     protocol_id:protocolId,
     route_order:payload?.route_order||'A_B',
     lag_ticks:payload?.lag_ticks??36,
     active_clock_id:payload?.active_clock_id||'k',
     question:payload?.question||null,
     method:payload?.method||null
    });
    const conjectures=salonEngine.synthesizeOutsidePerspectiveConjectures
     ?salonEngine.synthesizeOutsidePerspectiveConjectures(corpus,{
       lagTicks:payload?.lag_ticks??36,
       filterCluster:payload?.filter_cluster||null,
       limit:payload?.limit??7
      })
     :null;
    const headline=salonEngine.deriveSynthesisHeadline
     ?salonEngine.deriveSynthesisHeadline({
       corpus,
       activePlan:plan,
       operatorQuestion:payload?.question||null,
       operatorMethod:payload?.method||null,
       customSubtitle:payload?.pattern_subtitle||null,
       selectedCandidateId:payload?.selected_candidate_id||null,
       lagTicks:payload?.lag_ticks??36
      })
     :null;
    return {
     schema:'emstd613.vixen.rulefield-proposal/v1',
     plan,
     conjectures,
     synthesis_headline:headline,
     scientific_promotion_authority:false,
     empirical_replication_credit:0,
     human_closure_required:true
    };
   }
   if(operation==='score_unified_candidates'){
    if(!salonEngine?.scoreUnifiedSynthesisCandidates)throw Error('HELD_SALON_SCORING_UNAVAILABLE');
    const corpus=payload?.corpus||await loadLocalVixenCorpus();
    const lag=Number.isFinite(Number(payload?.lag_ticks))?Number(payload.lag_ticks):36;
    const scored=salonEngine.scoreUnifiedSynthesisCandidates({
     corpus,
     activePlan:payload?.active_plan||null,
     refraction:payload?.refraction||null,
     supplementalSources:Array.isArray(payload?.supplemental_sources)?payload.supplemental_sources:[],
     podiumEvents:Array.isArray(payload?.podium_events)?payload.podium_events:[],
     operatorQuestion:payload?.question||payload?.operator_question||null,
     operatorMethod:payload?.method||payload?.operator_method||null,
     lagTicks:lag,
     benchPair:payload?.bench_pair||'c1_c2_valid',
     benchSnapshots:Array.isArray(payload?.bench_snapshots)?payload.bench_snapshots:[],
     withdrawnCount:Number(payload?.withdrawn_count||0)
    });
    const c3Rows=(corpus.works||[]).filter(w=>w.cluster==='C3').map(w=>({support:Array.isArray(w.planes)?w.planes:[]}));
    const c1Rows=(corpus.works||[]).filter(w=>w.cluster==='C1').map(w=>({support:Array.isArray(w.planes)?w.planes:[]}));
    const fadtNativeC3=fadtAssist?.computeFadtFiberBounds&&c3Rows.length
     ?fadtAssist.computeFadtFiberBounds(c3Rows)
     :null;
    const fadtNativeC1=fadtAssist?.computeFadtFiberBounds&&c1Rows.length
     ?fadtAssist.computeFadtFiberBounds(c1Rows)
     :null;
    const topCand=scored.top_candidate||scored.candidates?.[0]||null;
    const topMatrix=topCand?.svd_matrix||[[1,0.25+(lag/180)],[0,0.85]];
    const apertureNativeSvd=apertureV32?.computeMatrixSvd
     ?apertureV32.computeMatrixSvd(topMatrix)
     :null;
    const srcAtelierTelemetry=srcEngines?.evaluateCorpusWithSrcEngines
     ?srcEngines.evaluateCorpusWithSrcEngines(corpus,{operatorQuestion:payload.operatorQuestion||'',activePlan:payload.activePlan||null})
     :null;
    return {
     schema:'emstd613.vixen.unified-candidate-scores/v1',
     lag_ticks:lag,
     top_candidate:topCand?{
      id:topCand.id,
      title:topCand.title,
      patternSubtitle:topCand.patternSubtitle,
      headerTagline:topCand.headerTagline,
      heroStatement:topCand.heroStatement,
      leftSpine:topCand.leftSpine,
      score:topCand.score,
      breakdown:topCand.breakdown
     }:null,
     candidates:scored.candidates.map(c=>({
      id:c.id,
      title:c.title,
      patternSubtitle:c.patternSubtitle,
      headerTagline:c.headerTagline,
      heroStatement:c.heroStatement,
      leftSpine:c.leftSpine,
      regime:c.regime,
      score:c.score,
      breakdown:c.breakdown
     })),
     fadt_profile:scored.fadt_profile,
     native_cross_checks:{
      fadt_exact_c3:fadtNativeC3?{disposition:fadtNativeC3.disposition,gap_cardinality:fadtNativeC3.irreducible_gap_cardinality,intersection:fadtNativeC3.intersection_support}:null,
      fadt_gap_c1:fadtNativeC1?{disposition:fadtNativeC1.disposition,gap_cardinality:fadtNativeC1.irreducible_gap_cardinality,gap:fadtNativeC1.irreducible_gap}:null,
      aperture_svd_top:apertureNativeSvd?{kappa:apertureNativeSvd.condition_number,rank:apertureNativeSvd.rank,sigma:apertureNativeSvd.singular_values}:null,
      src_atelier_tomography:srcAtelierTelemetry?.phase2_tomography||null,
      src_atelier_projective:srcAtelierTelemetry?.projective_routing||null
     },
     empirical_replication_credit:0,
     scientific_promotion_authority:false,
     human_closure_required:true
    };
   }
   if(operation==='pedagogue_cadence'){
    if(!pedagogue?.auditDollhouseDromologicalCadence)throw Error('HELD_RULEFIELD_PEDAGOGUE_UNAVAILABLE');
    return pedagogue.auditDollhouseDromologicalCadence(payload||{});
   }
   if(operation==='pedagogue_institutional_time'){
    if(!pedagogue?.auditDollhouseInstitutionalTime)throw Error('HELD_RULEFIELD_PEDAGOGUE_UNAVAILABLE');
    return pedagogue.auditDollhouseInstitutionalTime(payload||{});
   }
   throw Error('HELD_RULEFIELD_OPERATION');
  };
 }

 // 5. UNIVERSAL_ATELIER read-only local Edition 1.4 reference index adapter
 const refDir=resolve(sourceRoot,'reference');
 if(existsSync(resolve(refDir,'manifest.json'))&&existsSync(resolve(refDir,'directory.json'))){
  let refCache=null;
  async function loadRefIndex(){
   if(refCache)return refCache;
   const manifest=JSON.parse(await readFile(resolve(refDir,'manifest.json'),'utf8'));
   const directory=JSON.parse(await readFile(resolve(refDir,'directory.json'),'utf8'));
   const graph=existsSync(resolve(refDir,'graph.json'))
    ?JSON.parse(await readFile(resolve(refDir,'graph.json'),'utf8'))
    :{edges:[]};
   const byId=new Map((Array.isArray(directory)?directory:[]).map(r=>[r.id,r]));
   refCache={manifest,directory,graph,byId};
   return refCache;
  }
  async function readVerifiedRecord(id){
   if(!VALID_REF_ID.test(String(id||'')))throw Error('HELD_UNIVERSAL_INVALID_ID');
   if(id==='EDITION'){
    const {manifest}=await loadRefIndex();
    return {id:'EDITION',edition_version:manifest.edition_version,counts:manifest.counts,corpus_sha256:manifest.corpus_sha256};
   }
   const recPath=resolve(refDir,'records',`${id}.json`);
   if(!recPath.startsWith(refDir+sep)||relative(refDir,recPath).startsWith('..'))throw Error('HELD_UNIVERSAL_PATH_ESCAPE');
   const st=await stat(recPath).catch(()=>null);
   if(!st||!st.isFile()||st.size>250000)throw Error('HELD_UNIVERSAL_RECORD_NOT_FOUND');
   const bytes=await readFile(recPath);
   const raw=bytes.toString('utf8');
   const canonical=raw.endsWith('\n')?raw.slice(0,-1):raw;
   const actualSha=createHash('sha256').update(Buffer.from(canonical,'utf8')).digest('hex');
   const parsed=JSON.parse(raw);
   const {byId}=await loadRefIndex();
   const dirEntry=byId.get(id)||null;
   return {parsed,dirEntry,actualSha,digestMatch:Boolean(dirEntry&&dirEntry.record_sha256===actualSha)};
  }

  adapters.UNIVERSAL_ATELIER=async ({operation,payload={}})=>{
   const {manifest,directory,graph,byId}=await loadRefIndex();
   if(operation==='search'){
    const q=String(payload.query??payload.q??'').normalize('NFKC').toLowerCase().trim();
    const tokens=q.split(/\s+/).filter(Boolean);
    const familyFilter=payload.family?String(payload.family).normalize('NFKC').toLowerCase():'';
    const limit=Math.max(1,Math.min(40,Number(payload.limit)||12));
    const hits=[];
    for(const item of directory){
     if(familyFilter&&!String(item.family||'').toLowerCase().includes(familyFilter))continue;
     if(tokens.length===0){hits.push({score:1,entry:item});continue;}
     const hay=[item.id,item.label,item.kind,item.family,item.status,...(item.aliases||[]),...(item.source_keys||[])]
      .filter(Boolean).join(' ').normalize('NFKC').toLowerCase();
     let matched=0;
     for(const tok of tokens)if(hay.includes(tok))matched+=1;
     if(matched>0)hits.push({score:matched/tokens.length,entry:item});
    }
    hits.sort((a,b)=>b.score-a.score||String(a.entry.id).localeCompare(String(b.entry.id)));
    return {
     schema:'td613.vixen.universal-read-search/v1',
     edition:manifest.edition_version,
     query:q,
     total_matches:hits.length,
     hits:hits.slice(0,limit).map(h=>({score:h.score,...h.entry})),
     authority:'READ_ONLY',
     source_authentication:'UNCLAIMED_LOCAL_MIRROR'
    };
   }
   if(operation==='get'){
    const res=await readVerifiedRecord(payload.id);
    if(payload.id==='EDITION')return res;
    if(!res.digestMatch)throw Error('HELD_UNIVERSAL_DIGEST_MISMATCH');
    return {
     schema:'td613.vixen.universal-read-record/v1',
     edition:manifest.edition_version,
     id:payload.id,
     record_sha256:res.actualSha,
     directory:res.dirEntry,
     record:res.parsed,
     authority:'READ_ONLY'
    };
   }
   if(operation==='cite'){
    const res=await readVerifiedRecord(payload.id);
    if(!res.digestMatch&&payload.id!=='EDITION')throw Error('HELD_UNIVERSAL_DIGEST_MISMATCH');
    return {
     schema:'td613.vixen.universal-read-cite/v1',
     edition:manifest.edition_version,
     id:payload.id,
     label:res.dirEntry?.label||res.parsed?.label||null,
     family:res.dirEntry?.family||null,
     source_keys:res.dirEntry?.source_keys||res.parsed?.sources||[],
     html_anchor:res.dirEntry?.html_anchor||null,
     html_line:res.dirEntry?.html_line||null,
     record_path:res.dirEntry?.record_path||null,
     record_sha256:res.actualSha,
     evidence_class:res.parsed?.evidence_class||null,
     claim_ceiling:res.parsed?.claim_ceiling||null,
     authority:'READ_ONLY'
    };
   }
   if(operation==='neighbors'){
    const id=String(payload.id||'');
    if(!VALID_REF_ID.test(id))throw Error('HELD_UNIVERSAL_INVALID_ID');
    const edges=Array.isArray(graph.edges)?graph.edges:[];
    const outgoing=edges.filter(e=>e.source===id).slice(0,50);
    const incoming=edges.filter(e=>e.target===id).slice(0,50);
    return {schema:'td613.vixen.universal-read-neighbors/v1',id,outgoing,incoming,authority:'READ_ONLY'};
   }
   if(operation==='route'){
    const from=String(payload.from||'');
    const to=String(payload.to||'');
    if(!VALID_REF_ID.test(from)||!VALID_REF_ID.test(to))throw Error('HELD_UNIVERSAL_INVALID_ID');
    const edges=Array.isArray(graph.edges)?graph.edges:[];
    const adj=new Map();
    for(const e of edges){
     if(!adj.has(e.source))adj.set(e.source,[]);
     adj.get(e.source).push({next:e.target,type:e.type,dir:'out'});
     if(!adj.has(e.target))adj.set(e.target,[]);
     adj.get(e.target).push({next:e.source,type:e.type,dir:'in'});
    }
    const queue=[[from,[]]],seen=new Set([from]);
    let path=null;
    while(queue.length&&!path){
     const [cur,steps]=queue.shift();
     if(cur===to){path=steps;break;}
     if(steps.length>=5)continue;
     for(const edge of (adj.get(cur)||[])){
      if(seen.has(edge.next))continue;
      seen.add(edge.next);
      queue.push([edge.next,[...steps,{from:cur,to:edge.next,type:edge.type,direction:edge.dir}]]);
     }
    }
    return {schema:'td613.vixen.universal-read-route/v1',from,to,found:Boolean(path),steps:path||[],authority:'READ_ONLY'};
   }
   if(operation==='context'){
    const id=String(payload.id||'');
    const res=await readVerifiedRecord(id);
    if(!res.digestMatch&&id!=='EDITION')throw Error('HELD_UNIVERSAL_DIGEST_MISMATCH');
    const edges=Array.isArray(graph.edges)?graph.edges:[];
    return {
     schema:'td613.vixen.universal-read-context/v1',
     edition:manifest.edition_version,
     id,
     entry:res.dirEntry||byId.get(id)||null,
     record_sha256:res.actualSha,
     outgoing:edges.filter(e=>e.source===id).slice(0,20),
     incoming:edges.filter(e=>e.target===id).slice(0,20),
     authority:'READ_ONLY'
    };
   }
   if(operation==='verify'){
    const res=await readVerifiedRecord(payload.id);
    return {
     schema:'td613.vixen.universal-read-verify/v1',
     id:payload.id,
     digest_verified:res.digestMatch,
     expected_sha256:res.dirEntry?.record_sha256||null,
     actual_sha256:res.actualSha,
     authority:'READ_ONLY'
    };
   }
   throw Error('HELD_UNIVERSAL_ATELIER_OPERATION');
  };
 }

 if(srcEngines){
  adapters.SRC_ATELIER=async({operation,payload={}}={})=>{
   if(['src_verified_vixen_work_pair','src_verified_vixen_original_projective_differential',
       'src_verified_vixen_original_typed_traversal',
       'src_verified_vixen_original_phase2'].includes(operation)){
    // Read only the two explicitly requested Vixen Works. The SRC engine
    // supplies computation; SRC's research corpus supplies no input.
    const workIds=payload.work_ids;
    if(!Array.isArray(workIds)||workIds.length!==2||
       new Set(workIds).size!==2||
       !workIds.every(id=>typeof id==='string'&&/^emwork_[0-9a-f]{24}$/.test(id)))
     throw Error('HELD_TWO_DISTINCT_VIXEN_WORK_IDS_REQUIRED');
    const query=typeof payload.query==='string'?payload.query.trim():'';
    if(query.length<9||query.length>240||!/^Explore\s+\S/i.test(query))
     throw Error('HELD_EXPLICIT_SRC_COMPUTATIONAL_QUERY_REQUIRED');
    const corpus=await loadLocalVixenCorpus();
    if(corpus.works?.length!==32||
       corpus.works.reduce((n,w)=>n+(w.linked_sources?.length||0),0)!==53)
     throw Error('HELD_VIXEN_CORPUS_CENSUS_DRIFT');
    const reader=await importOptional(resolve(sourceRoot,'vixen-estate','corpus-experiment-a.mjs'));
    if(typeof reader?.loadExperimentABodyBySourceId!=='function')
     throw Error('HELD_ORIGINAL_VIXEN_BODY_READER_UNAVAILABLE');
    const sourceProofs=[],documents=[];
    for(const workId of workIds){
     const index=corpus.works.findIndex(w=>w.work_id===workId);
     if(index<0)throw Error('HELD_FOREIGN_OR_UNREGISTERED_VIXEN_WORK');
     const work=corpus.works[index];
     let selected=null;
     for(const source of work.linked_sources||[]){
      if(!/^emsrc_[0-9a-f]{24}$/.test(source.source_file_id||'')||
         !/^[0-9a-f]{64}$/i.test(source.sha256||''))
       throw Error('HELD_INVALID_VIXEN_SOURCE_MANIFESTATION');
      const body=await reader.loadExperimentABodyBySourceId(source.source_file_id,{
       hintShard:reader.shardForWorkIndex(index)
      });
      if(!body||typeof body.text_body!=='string')continue;
      if(body.readable===false||body.body_sha256_verified!==true||
         body.source_file_id!==source.source_file_id||
         (body.work_id&&body.work_id!==workId))
       throw Error('HELD_UNVERIFIED_VIXEN_SOURCE_BODY');
      const expectedDigest=body.derivative_sha256||body.body_sha256;
      if(!/^[0-9a-f]{64}$/i.test(expectedDigest||'')||
         createHash('sha256').update(body.text_body,'utf8').digest('hex')!==expectedDigest)
       throw Error('HELD_VIXEN_DERIVATIVE_DIGEST_MISMATCH');
      if(body.text_body.length>400000)throw Error('HELD_VIXEN_SOURCE_BODY_TOO_LARGE');
      selected={source,body,derivativeDigest:expectedDigest};
      break;
     }
     if(!selected)throw Error('HELD_VIXEN_WORK_HAS_NO_VERIFIED_READABLE_BODY');
     sourceProofs.push(Object.freeze({
      work_id:workId,source_file_id:selected.source.source_file_id,
      declared_original_source_sha256:selected.source.sha256,
      verified_derivative_sha256:selected.derivativeDigest,
      derivative_bytes_rehashed:true,authorship:work.authorship||'UNRESOLVED'
     }));
     documents.push({
      record_id:workId,work_id:workId,title:work.display_title||work.declared_title||workId,
      cluster:work.cluster||'',body:selected.body.text_body,created:work.created||null
     });
    }
    if(operation==='src_verified_vixen_original_phase2'){
     // Original SRC Python functions run against short-lived Vixen host registers.
     // No historical compiler role, authority or evidence delta is invented.
     const script=resolve(repoRoot,'scripts','vixen-src-original-phase2-host.py');
     if(!existsSync(script))throw Error('HELD_SRC_ORIGINAL_PHASE2_HOST_UNAVAILABLE');
     const packet={
      query,
      catalogue:corpus.works.map(w=>({
       work_id:w.work_id,title:w.display_title||w.declared_title||w.work_id,
       protocols:Array.isArray(w.protocols)?w.protocols:[],
       linked_sources:(w.linked_sources||[]).map(s=>({
        source_file_id:s.source_file_id,original_sha256:s.sha256
       }))
      })),
      selected:documents.map((d,i)=>({
       work_id:d.work_id,source_file_id:sourceProofs[i].source_file_id,
       original_sha256:sourceProofs[i].declared_original_source_sha256,
       derivative_sha256:sourceProofs[i].verified_derivative_sha256,body:d.body
      }))
     };
     const python=process.env.TD613_NATIVE_PYTHON||(process.platform==='win32'?'python':'python3');
     let replay;
     try{
      replay=JSON.parse(execFileSync(python,[script],{
       cwd:repoRoot,input:JSON.stringify(packet),encoding:'utf8',timeout:20000,
       maxBuffer:4*1024*1024,
       env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1'}
      }));
     }catch(e){
      throw Error('HELD_SRC_ORIGINAL_PHASE2_EXECUTION: '+String(e?.message||'UNKNOWN').slice(0,180));
     }
     if(replay?.native_python_executed!==true||
        replay.original_method!=='build-phase2-assays.py'||
        replay.catalogue_work_count!==32||replay.manifestation_count!==53||
        replay.source_proofs?.length!==2||
        !/^[0-9a-f]{64}$/.test(replay.original_method_sha256||'')||
        replay.source_proofs.some((p,i)=>
         p.work_id!==sourceProofs[i].work_id||
         p.source_file_id!==sourceProofs[i].source_file_id||
         p.derivative_sha256!==sourceProofs[i].verified_derivative_sha256)||
        replay.contextual_roles?.length!==6||
        replay.compilation_passes?.length!==2||
        replay.tomography?.length!==2||
        replay.original_historical_compilation_proven!==false||
        replay.original_src_historical_registries_used!==false)
      throw Error('HELD_SRC_ORIGINAL_PHASE2_VIXEN_RECEIPT_MISMATCH');
     return{
      schema:'td613.vixen.original-src-phase2-podium/v1',
      method:'ORIGINAL_SRC_PHASE2_CONTEXT_COMPILER_EVIDENCE_TOMOGRAPHY',
      source_estate:'VIXEN_EXPERIMENT_A_ONLY',
      native_python_executed:true,
      original_native_phase2:replay,source_proofs:sourceProofs,
      historical_compilation_proven:false,
      original_native_equivalence:'HELD_UNPROVEN',
      read_only:true,scholarly_relation_admission:false,
      authorship_promotion:false,scientific_credit:0,
      empirical_replication_credit:0,human_closure_required:true
     };
    }
    if(operation==='src_verified_vixen_original_typed_traversal'){
     // The unchanged original SRC Python evidence traverser receives only
     // Vixen's own local catalogue links and independently rehashed readable
     // derivatives. Its ephemeral registries never enter either source estate.
     const script=resolve(repoRoot,'scripts','vixen-src-original-typed-traversal.py');
     if(!existsSync(script))throw Error('HELD_ORIGINAL_SRC_TYPED_VIXEN_BRIDGE_UNAVAILABLE');
     const packet={
      query,
      catalogue:corpus.works.map(w=>({
       work_id:w.work_id,
       linked_sources:(w.linked_sources||[]).map(s=>({
        source_file_id:s.source_file_id,original_sha256:s.sha256
       }))
      })),
      selected:documents.map((d,i)=>({
       work_id:d.work_id,source_file_id:sourceProofs[i].source_file_id,
       original_sha256:sourceProofs[i].declared_original_source_sha256,
       derivative_sha256:sourceProofs[i].verified_derivative_sha256,
       body:d.body
      }))
     };
     const python=process.env.TD613_NATIVE_PYTHON||(process.platform==='win32'?'python':'python3');
     let replay;
     try{
      replay=JSON.parse(execFileSync(python,[script],{
       cwd:repoRoot,input:JSON.stringify(packet),encoding:'utf8',timeout:20000,
       maxBuffer:4*1024*1024,
       env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1'}
      }));
     }catch(e){
      throw Error('HELD_ORIGINAL_SRC_TYPED_VIXEN_EXECUTION: '+String(e?.message||'UNKNOWN').slice(0,180));
     }
     if(replay?.original_python_executed!==true||
        replay.original_function!=='src-evidence-rabbit-hole-v1.py:explore'||
        replay.catalogue_work_count!==32||replay.recorded_manifestation_count!==53||
        replay.selected_verified_derivatives?.length!==2||
        replay.selected_verified_derivatives.some((p,i)=>
         p.work_id!==sourceProofs[i].work_id||
         p.source_file_id!==sourceProofs[i].source_file_id||
         p.derivative_sha256!==sourceProofs[i].verified_derivative_sha256))
      throw Error('HELD_ORIGINAL_SRC_TYPED_VIXEN_RECEIPT_MISMATCH');
     return {
      schema:'td613.vixen.src-native-typed-vixen-podium/v1',
      method:'ORIGINAL_SRC_TYPED_EVIDENCE_TRAVERSAL',
      source_estate:'VIXEN_EXPERIMENT_A_ONLY',
      native_python_executed:true,
      original_native_traversal:replay,
      source_proofs:sourceProofs,
      reader_route_status:'ADAPTED_CATALOGUE_AND_VERIFIED_DERIVATIVES_ONLY',
      body_lexical_relevance:'NOT_USED_FOR_TYPED_TRAVERSAL',
      read_only:true,authorship_promotion:false,
      scholarly_relation_admission:false,
      scientific_credit:0,empirical_replication_credit:0,
      human_closure_required:true
     };
    }
    const projective=srcEngines.runSrcProjectiveRouting(documents,documents);
    let originalDifferential=null;
    if(operation==='src_verified_vixen_original_projective_differential'){
     const python=process.env.TD613_NATIVE_PYTHON||(process.platform==='win32'?'python':'python3');
     const script=resolve(repoRoot,'scripts','vixen-src-original-projective-differential.py');
     if(!existsSync(script))throw Error('HELD_SRC_ORIGINAL_PYTHON_REPLAY_SCRIPT_UNAVAILABLE');
     const packet={query,documents:documents.map((d,i)=>({
      record_id:d.work_id,title:d.title,body:d.body,created:d.created,
      body_sha256:sourceProofs[i].verified_derivative_sha256
     }))};
     let replay;
     try{
      replay=JSON.parse(execFileSync(python,[script],{
       cwd:repoRoot,input:JSON.stringify(packet),encoding:'utf8',
       timeout:20000,maxBuffer:4*1024*1024,
       env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1'}
      }));
     }catch(e){
      throw Error('HELD_SRC_ORIGINAL_PYTHON_REPLAY_FAILED: '+String(e?.message||'UNKNOWN').slice(0,180));
     }
     if(replay?.native_python_executed!==true||
       replay.verified_vixen_derivatives?.length!==sourceProofs.length||
       replay.verified_vixen_derivatives.some((p,i)=>
        p.work_id!==sourceProofs[i].work_id||
        p.sha256!==sourceProofs[i].verified_derivative_sha256))
      throw Error('HELD_SRC_PYTHON_DERIVATIVE_RECEIPT_MISMATCH');
     const jsEdges=projective.links.map(edge=>{
      const cue=projective.cues.find(x=>x.cue_id===edge.cue_id);
      return [edge.source_record_id,cue?.normalized_target||'',
       edge.target_record_id,edge.match_type,edge.temporal_relationship].join('|');
     }).sort();
     const pythonEdges=replay.real_body_edges;
     const jsSet=new Set(jsEdges),pythonSet=new Set(pythonEdges);
     const queryControl=srcEngines.runSrcProjectiveRouting([{
      record_id:documents[0].record_id,title:documents[0].title,
      body:query.replace(/[.!?]+$/,'')+'.',created:documents[0].created
     }],documents);
     const jsProbe=[...new Set(queryControl.links.map(x=>
      x.target_record_id+'|'+x.match_type))].sort();
     const pyProbe=[...new Set(replay.operator_query_probe.candidates.map(x=>
      x.work_id+'|'+x.match_type))].sort();
     originalDifferential={
      schema:'td613.vixen.src-original-projective-differential/v1',
      original_python_replay:replay,
      javascript_engine:projective.method,
      real_work_comparison:{
       javascript_edge_count:jsEdges.length,original_python_edge_count:replay.real_body_edge_count,
       javascript_only:jsEdges.filter(x=>!pythonSet.has(x)).slice(0,32),
       python_only:pythonEdges.filter(x=>!jsSet.has(x)).slice(0,32),
       comparison_complete:!replay.real_body_edges_truncated,
       observed_original_cues:projective.cue_count>0||replay.real_body_observation_count>0,
       exact_agreement:replay.real_body_edges_truncated?'HELD_TRUNCATED':
        JSON.stringify(jsEdges)===JSON.stringify(pythonEdges)
      },
      synthetic_query_probe:{
       evidence_class:'SYNTHETIC_OPERATOR_QUERY_NOT_MANUSCRIPT',
       original_python:pyProbe,javascript:jsProbe,
       exact_agreement:JSON.stringify(jsProbe)===JSON.stringify(pyProbe)
      },
      full_method_equivalence:'HELD_UNPROVEN',
      scientific_credit:0,human_closure_required:true
     };
    }
    const conditioned=srcEngines.deriveSrcQueryConditionedWeights(query,'src_projective',null);
    const scored=documents.map((doc,i)=>({
     work_id:doc.work_id,source_file_id:sourceProofs[i].source_file_id,
     ...srcEngines.scoreSrcUntypicalDocument(conditioned.analysis,{
      work_id:doc.work_id,title:doc.title,cluster:doc.cluster
     },doc.body)
    }));
    return {
     schema:originalDifferential?'td613.vixen.src-verified-native-projective-differential/v1':'td613.vixen.src-verified-work-pair/v1',
     method:'SRC_VERIFIED_VIXEN_WORK_PAIR_COMPUTATION',
     source_estate:'VIXEN_EXPERIMENT_A_ONLY',
     computational_engine:'SRC_ATELIER_ISOMORPHIC',
     native_python_executed:Boolean(originalDifferential),
     original_native_differential:originalDifferential,
     read_only:true,query_regime:conditioned.regimeId,
     source_proofs:sourceProofs,scored_works:scored,
     projective_routing:{
      method:projective.method,document_count:projective.document_count,
      cue_count:projective.cue_count,candidate_link_count:projective.candidate_link_count,
      field_marker_hits:projective.field_marker_hits
     },
     observed_compiler_executions:0,observed_transformations:0,
     scientific_credit:0,empirical_replication_credit:0,
     authorship_promotion:false,human_closure_required:true
    };
   }
   if(operation==='src_projective_routing'){
    const docs=Array.isArray(payload.documents)?payload.documents:[];
    const catalog=Array.isArray(payload.catalog)?payload.catalog:docs;
    const res=srcEngines.runSrcProjectiveRouting(docs,catalog,{
     stripTrailingNumerals:payload.stripTrailingNumerals!==false
    });
    return{
     ...res,
     authority:'ADVISORY_ONLY',
     empirical_replication_credit:0,
     human_closure_required:true
    };
   }
   if(operation==='src_phase2_tomography'){
    const lifts=Array.isArray(payload.lift_candidates)?payload.lift_candidates:[];
    const res=srcEngines.runSrcPhase2Tomography(lifts,{snapshot:payload.snapshot});
    return{
     ...res,
     authority:'ADVISORY_ONLY',
     empirical_replication_credit:0,
     human_closure_required:true
    };
   }
   if(operation==='src_phase2_context_roles'){
    const inputs=Array.isArray(payload.compiler_inputs)?payload.compiler_inputs:[];
    const edges=Array.isArray(payload.recompilation_edges)?payload.recompilation_edges:[];
    const res=srcEngines.runSrcPhase2ContextRoles(inputs,edges,{snapshot:payload.snapshot});
    return{
     ...res,
     authority:'ADVISORY_ONLY',
     empirical_replication_credit:0,
     human_closure_required:true
    };
   }
   if(operation==='src_rabbit_hole_traversal'){
    if(payload.action&&payload.rootData){
     return srcEngines.runSrcNativeQuery({
      action:payload.action,
      entity_id:payload.entity_id||null,
      rootData:payload.rootData,
      requestedSnapshot:payload.requestedSnapshot,
      requestedSeal:payload.requestedSeal,
      depth:payload.depth,
      limit:payload.limit
     });
    }
    const seed=String(payload.seed_id||'');
    if(!seed)throw Error('HELD_SRC_SEED_REQUIRED');
    if(payload.graph&&typeof payload.graph==='object'){
     return{
      ...srcEngines.traverseSrcTypedStrata(payload.graph,seed,{depth:payload.depth,limit:payload.limit}),
      authority:'ADVISORY_ONLY',
      empirical_replication_credit:0,
      human_closure_required:true
     };
    }
    const searchMod=await importOptional(resolve(sourceRoot,'vixen-estate','semantic-semiotic-search.mjs'));
    if(!searchMod?.loadSemanticSemioticEngine)throw Error('HELD_SEMANTIC_SEMIOTIC_SEARCH_UNAVAILABLE');
    const engine=await searchMod.loadSemanticSemioticEngine();
    const res=srcEngines.traverseSrcTypedStrata({adjacency:engine.graphAdjacency},seed,{depth:payload.depth,limit:payload.limit});
    return{
     ...res,
     authority:'ADVISORY_ONLY',
     empirical_replication_credit:0,
     human_closure_required:true
    };
   }
   if(operation==='src_untypical_retrieval'){
    const searchMod=await importOptional(resolve(sourceRoot,'vixen-estate','semantic-semiotic-search.mjs'));
    if(!searchMod?.loadSemanticSemioticEngine)throw Error('HELD_SEMANTIC_SEMIOTIC_SEARCH_UNAVAILABLE');
    const engine=await searchMod.loadSemanticSemioticEngine();
    const queryStr=String(payload.query||'');
    const mode=payload.mode||'src_projective';
    const cond=srcEngines.deriveSrcQueryConditionedWeights(queryStr,mode,null);
    // Podium refuses >50k-byte native adapter receipts; bound the
    // SRC search lane without changing the core index or evidence limits.
    const requestedLimit=Number(payload.options?.limit)||8;
    const searchResult=await engine.search(queryStr,{...(payload.options||{}),mode,
     limit:Math.max(1,Math.min(8,requestedLimit))});
    return{
     ...searchResult,
     src_conditioning:{
      regime_id:cond.regimeId,
      weights:cond.weights,
      matched_signatures:cond.analysis.matchedSignatures,
      explore_cue:cond.analysis.exploreCue,
      active_strata:cond.analysis.activeStrata
     },
     contract:'EMSTD613_SUBJECT_ONLY_NO_FOREIGN_SRC_BODIES',
     empirical_replication_credit:0,
     human_closure_required:true
    };
   }
   if(operation==='src_heterostratigraphic_audit'){
    const res=srcEngines.runSrcHeterostratigraphicAudit({
     corpus:payload.corpus||null,
     operatorQuestion:String(payload.operator_question??payload.operatorQuestion??''),
     activePlan:payload.active_plan||payload.activePlan||null,
     candidateEnvelope:payload.candidate_envelope||payload.candidateEnvelope||null
    });
    return{
     ...res,
     authority:'ADVISORY_ONLY',
     empirical_replication_credit:0,
     human_closure_required:true
    };
   }
   throw Error('HELD_SRC_ATELIER_OPERATION');
  };
 }

 // Original native engines remain separate from browser-side interpretive adapters.
 // Native Python never executes in public Vixen; only an explicitly authorized Podium host can call it.
 let originalNative=null;
 try {originalNative=createNativeAtelierReadAdapters({repoRoot,sourceCheckouts:nativeSourceCheckouts});}
 catch(_) {originalNative=null;} // Portable read-only ZIPs may intentionally omit original estates.
 if(originalNative){
  const adapted=adapters.SRC_ATELIER;
  adapters.SRC_ATELIER=async(request)=>{
   if(['src_native_epoch_query','src_native_text','src_native_semantic','src_native_projective_assay','src_native_evidence_traverse','src_native_research_journey'].includes(request.operation))
    return originalNative.SRC_ATELIER(request);
   if(typeof adapted==='function')return adapted(request);
   throw Error('HELD_SRC_BROWSER_ADAPTER_UNAVAILABLE');
  };
  adapters.WENDBINE_ATELIER=async(request)=>{
   if(request.operation==='wendbine_maestro_research_step'){
    const maestro=await importOptional(resolve(repoRoot,'scripts','wendbine-maestro-research-loop.mjs'));
    if(typeof maestro?.invokeMaestroMethodLoop!=='function')
     throw Error('HELD_WENDBINE_MAESTRO_METHOD_LOOP_UNAVAILABLE');
    return await maestro.invokeMaestroMethodLoop(request.payload||{});
   }
   if(request.operation==='wendbine_verified_vixen_method_transfer'){
    const method=await importOptional(resolve(repoRoot,'scripts','vixen-wendbine-method-transfer.mjs'));
    if(typeof method?.runNativeVixenWendbineTransfer!=='function')
     throw Error('HELD_NATIVE_WENDBINE_TRANSFER_MODULE_UNAVAILABLE');
    return await method.runNativeVixenWendbineTransfer({repoRoot,
     work_ids:request.payload?.work_ids,query:request.payload?.query});
   }
   return originalNative.WENDBINE_ATELIER(request);
  };
  adapters.EM_ATELIER=async(request)=>{
   if(request.operation==='em_verified_vixen_native_span_identity'){
    const module=await importOptional(resolve(repoRoot,'scripts','vixen-em-native-work-transfer.mjs'));
    if(typeof module?.runVixenEmNativeWorkQualification!=='function')
     throw Error('HELD_EM_VIXEN_NATIVE_SOURCE_CONTROL_UNAVAILABLE');
    return module.runVixenEmNativeWorkQualification({
     repoRoot,work_ids:request.payload?.work_ids
    });
   }
   return originalNative.EM_ATELIER(request);
  };
  adapters.CROSS_ATELIER=async(request)=>originalNative.CROSS_ATELIER(request);
 }
 return Object.freeze(adapters);
}
