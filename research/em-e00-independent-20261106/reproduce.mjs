// Public sanitized examples. These are separate from the concealed battery.
// node reproduce.mjs /absolute/exact-head/TD613-TCP [output-directory]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {StrongUnion,digest} from './strong-union.mjs';
const repo=path.resolve(process.argv[2]||'../TD613-TCP'),out=path.resolve(process.argv[3]||'.');
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
if(head!=='7488e5fd2b4fc0b2f222e0214f21129bbe143a17')throw Error('EXACT_HEAD_REQUIRED');
const load=p=>import(pathToFileURL(path.join(repo,p)));
const {EmUniversalReciprocalBridge:Bridge}=await load('packages/em_unified_synthesis/em-universal-reciprocal-bridge.mjs');
const {UniversalAtelierEstate:Atelier,UniversalEncyclopediaEstate:Encyclopedia}=await load('packages/cross_atelier_interoperability/universal-estates-bridge.mjs');
const {EmUnifiedTheorySynthesisEngine:Synthesis}=await load('packages/em_unified_synthesis/em-unified-theory-synthesis.mjs');
const results={schema:'td613.e00.public-reproducer/v1',head,tests:[],integrated_arms:{}};
function check(name,fn){try{const x=fn();results.tests.push({name,...x});}catch(e){results.tests.push({name,criterion_met:false,harness_error:String(e.stack)});}}
const bytes=Buffer.from('Synthetic observation: channel state is green. π 𝌋');
for(const kind of ['candidate','strong_union'])check('integrated_'+kind,()=>{
  const b=kind==='candidate'?new Bridge():null,union=b?null:new StrongUnion();
  const atelier=b?.atelier||new Atelier(),encyclopedia=b?.encyclopedia||new Encyclopedia();
  const events=[];let sequence=0;
  const event=(operation,fn)=>{const t=performance.now(),value=fn();events.push({sequence:++sequence,operation,wall_ms:performance.now()-t});return value;};
  const init=event('initialize_and_load_reference',()=>b?b.initialize():{atelier_zero_row_witness:atelier.initialize(),encyclopedia_census:encyclopedia.loadReferenceCorpus()});
  event('source_read_and_admit',()=>b?b.admitEmSource({sourceId:'public:root',filename:'fictional.txt',rawBytes:bytes,acquisitionId:'public:acq'}):union.admitSourceRoot({root_id:'public:root',source_id:'public:root',raw_bytes:bytes,acquisition_id:'public:acq'}));
  event('stage_exact_passage',()=>b?b.stageEmPassageIntoAtelier({recordId:'public:record',sourceId:'public:root',byteOffset:0,length:bytes.length}):atelier.prepareAndAdmitRecord({id:'public:record',kind:'contract',label:'Em Passage Staging',family:'covenant',status:'ADMITTED',evidence_class:'SYNTHETIC_RESEARCH_WITNESS',claim_ceiling:'Research witness only.',body:bytes.toString('utf8'),synthetic:true},{adjudicatorRole:'ORCHESTRATOR',humanReviewRef:'SAC[X6ZNK5NO51]'}));
  const reference=event('reference_query',()=>b?b.queryEncyclopediaReference('Aperture'):encyclopedia.queryReferenceCorpus({search:'Aperture',limit:20}));
  const matches=b?reference.matches_found:reference.length;
  const request={ruleId:'public:rule',premises:['public:root'],targetClaimId:'public:claim',claimStatement:'Synthetic observation: channel state is green.',sourceCaptureSpanProof:{source_id:'public:root',start:0,end:bytes.length,span_sha256:digest(bytes)}};
  const warrant=event('proof_check_and_derivation',()=>b?b.groundTheoryWarrant(request):union.ground(request));
  const query=()=>b?b.warrantEngine.computeLeastFixedPoint().P.has('public:claim'):union.query('public:claim').grounded;
  const before=event('query_before_withdrawal',query);
  event('withdraw_root',()=>b?b.warrantEngine.withdrawSourceRoot('public:root'):union.withdrawSourceRoot({root_id:'public:root'}));
  const after=event('query_after_withdrawal',query);
  b?.close();if(!b)atelier.receiver?.close();
  const recorded={events,reference_matches:matches,reference_record_count:init.encyclopedia_census.record_count,source_reads:1,source_bytes:bytes.length,reference_query_calls:1,warrant_query_calls:2,terminal_outputs:{before,after},correction_latency_external_ops:events.length-events.findIndex(e=>e.operation==='withdraw_root'),source_warrant_fidelity:Number(before===true&&after===false),proof_checked:!!(warrant.span_proof_verified??warrant.grounded)};
  results.integrated_arms[kind]=recorded;
  return {criterion_met:before&&!after&&matches>0&&recorded.proof_checked,observation:recorded};
});
check('unsupported_empty_mapping_refused',()=>{const e=new Synthesis();for(const id of ['a','b'])e.extractWorkAnatomy({workId:id,title:id,domain:'FICTIONAL'});const o=e.synthesizeCrossDomainCandidate({candidateId:'public:c',workAId:'a',workBId:'b',proposedPredictions:[{metric:'fictional',minimum_effect:1}]});return {criterion_met:o.verdict==='NO_UNIFICATION_WARRANTED',observation:{verdict:o.verdict}};});
check('content_mismatch_refused',()=>{const b=new Bridge();b.admitEmSource({sourceId:'public:r',filename:'fictional.txt',rawBytes:bytes});const o=b.groundTheoryWarrant({ruleId:'public:bad',premises:['public:r'],targetClaimId:'public:bad',claimStatement:'The channel state is crimson.',sourceCaptureSpanProof:{source_id:'public:r',start:0,end:bytes.length,span_sha256:digest(bytes)}});return {criterion_met:!o.is_grounded_in_lfp,observation:o};});
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'public-reproduction.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify({executed:results.tests.length,criterion_met:results.tests.filter(t=>t.criterion_met).length,harness_errors:results.tests.filter(t=>t.harness_error).length,integrated:results.integrated_arms},null,2));
