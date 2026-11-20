#!/usr/bin/env node
/**
 * TD613 / Vixen host-only Wendbine methodology reconstruction assay.
 * Original public source estate, original compiler and authorship stay separate.
 * Public snapshot date filtering is RETROSPECTIVE, not historical capture replay.
 * No I/O except reading registered fixtures and writing a bounded stdout receipt.
 */
import {readFileSync, realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {dirname, resolve, relative, isAbsolute, sep} from 'node:path';

const HERE=dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT=resolve(HERE,'../packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const GRAPHS=Object.freeze(['G_D','G_A','G_F','G_I','G_T','G_P','G_R','G_O','G_X']);
const EVIDENCE_CLASSES=Object.freeze(['SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
 'SOURCE_EXPLICIT_NEGATIVE_RELATION','SOURCE_EXPLICIT_SYNTHESIS','SOURCE_EXPLICIT_PROGRAM','SOURCE_EXPLICIT_SEQUENCE']);
const MAX_POSTS=10000, MAX_EDGES=200000;
const sha=x=>createHash('sha256').update(x).digest('hex');
const assert=(ok,code)=>{if(!ok)throw Error(code)};
const isDay=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T00:00:00Z'))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
const tok=x=>[...new Set(String(x||'').toLowerCase().match(/[a-z][a-z0-9]{2,}/g)||[])].sort();
const set=x=>new Set(x);
const overlap=(a,b)=>{const B=set(b);return a.filter(x=>B.has(x)).length};
const sorted=arr=>[...arr].sort((a,b)=>String(a).localeCompare(String(b),'en'));
const restrictPath=(root,p)=>{const d=relative(root,p);return d===''||(!isAbsolute(d)&&d!=='..'&&!d.startsWith('..'+sep));};

export function validateNativeMaterials(meta,posts,relations){
 assert(meta?.schema==='wendbine-public-corpus-snapshot/v0.1','HELD_UNREGISTERED_SNAPSHOT_SCHEMA');
 assert(meta.scope?.private_google_group_admitted===false && meta.rights?.full_post_bodies_copied===false,
  'HELD_SOURCE_RIGHTS_OR_PRIVATE_BOUNDARY');
 assert(Array.isArray(posts)&&posts.length>0&&posts.length<=MAX_POSTS,'HELD_UNBOUNDED_SOURCE_INPUT');
 assert(Array.isArray(relations)&&relations.length<=MAX_EDGES,'HELD_UNBOUNDED_RELATION_INPUT');
 assert(posts.length===meta.coverage?.admitted_source_count,'HELD_COVERAGE_MISMATCH');
 const ids=new Set();
 for(const p of posts){
  assert(p?.snapshot_id===meta.snapshot_id&& /^reddit:t3_[a-z0-9]{5,12}$/.test(p.source_id), 'HELD_SOURCE_CUSTODY');
  assert(!ids.has(p.source_id),'HELD_DUPLICATE_SOURCE');ids.add(p.source_id);
  assert(p.community==='r/Wendbine'&&p.source_text_stored===false&&p.real_person_identity_adjudicated===false,
   'HELD_SOURCE_PERSON_BOUNDARY');
  assert(isDay(p.public_date)&&p.time_precision==='DAY','HELD_DATE_PRECISION');
  assert(Array.isArray(p.declared_concepts)&&Array.isArray(p.source_flags)&&typeof p.technical_header==='string',
   'HELD_SOURCE_FIELDS');
 }
 for(const e of relations){
  assert(ids.has(e.source_id),'HELD_RELATION_UNADMITTED_SOURCE');
  assert(GRAPHS.includes(e.graph),'HELD_UNREGISTERED_GRAPH_FAMILY');
  assert(EVIDENCE_CLASSES.includes(e.evidence_class),
   'HELD_RELATION_EVIDENCE_PROMOTION');
  assert(['from','relation','to'].every(k=>typeof e[k]==='string'&&e[k].length>0),
   'HELD_MALFORMED_RELATION');
 }
 return {graph_families:GRAPHS,admitted_sources:ids.size,source_relation_count:relations.length};
}

// A classifier trained ONLY on earlier-day public records. The held-out
// target contributes its title as the explicitly disclosed query surface and
// its actual labels only to post-prediction scoring. No same-day ordering.
function predict(question,training,edges,{permute=false,ablate=false}={}){
 const q=tok(question);if(!q.length)return {state:'ABSTAIN_NO_QUERY',graph_families:[],neighbor_concepts:[],witnesses:[]};
 const vocab=sorted(new Set(training.flatMap(p=>p.declared_concepts)));
 const permutation=new Map(vocab.map((v,i)=>[v,vocab[(i+1)%vocab.length]]));
 const ranked=training.map(p=>{
  const concepts=permute?p.declared_concepts.map(x=>permutation.get(x)):p.declared_concepts;
  const terms=tok([p.technical_header,p.normalized_summary||'',...concepts].join(' '));
  const n=overlap(q,terms);
  return {p,concepts,n,score:n/Math.sqrt(Math.max(1,q.length)*Math.max(1,terms.length))};
 }).filter(row=>row.n>0).sort((a,b)=>b.score-a.score||a.p.source_id.localeCompare(b.p.source_id));
 if(!ranked.length)return {state:'ABSTAIN_NO_EARLIER_MATCH',graph_families:[],neighbor_concepts:[],witnesses:[]};
 const chosen=ranked.slice(0,Math.min(5,ranked.length));
 const scoreConcept=new Map(),scoreGraph=new Map();
 for(const r of chosen){
  for(const c of r.concepts)scoreConcept.set(c,(scoreConcept.get(c)||0)+r.score);
  if(!ablate)for(const e of edges.filter(e=>e.source_id===r.p.source_id))
   scoreGraph.set(e.graph,(scoreGraph.get(e.graph)||0)+r.score);
 }
 const rank=map=>[...map].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(row=>row[0]);
 return {state:'BOUNDED_PREDICTION_UNADJUDICATED',
  graph_families:rank(scoreGraph).slice(0,3),neighbor_concepts:rank(scoreConcept).slice(0,5),
  witnesses:chosen.map(x=>({source_id:x.p.source_id,public_date:x.p.public_date,
   title_query_token_overlap:x.n,rank_score:Number(x.score.toFixed(6))})),
  admission:'EARLIER_PUBLIC_DAY_AND_DISCLOSED_TITLE_ONLY'};
}
const score=(prediction,target,edges)=>{
 const actualGraphs=sorted(new Set(edges.filter(e=>e.source_id===target.source_id).map(e=>e.graph)));
 const actualConcepts=sorted(new Set(target.declared_concepts));
 const g=prediction.graph_families.filter(x=>actualGraphs.includes(x));
 const c=prediction.neighbor_concepts.filter(x=>actualConcepts.includes(x));
 return {graph_hits:g.length,graph_predicted:prediction.graph_families.length,
  graph_actual:actualGraphs.length,neighbor_hits:c.length,
  neighbor_predicted:prediction.neighbor_concepts.length,neighbor_actual:actualConcepts.length,
  rank_claim:'DESCRIPTIVE_ONLY_NOT_A_SIGNIFICANCE_TEST'};
};

export function runReconstructionAssay({meta,posts,relations,mode='assay',target_source_id=null,question=null,as_of_day=null}){
 const validated=validateNativeMaterials(meta,posts,relations);
 assert(['assay','journey','inventory'].includes(mode),'HELD_NATIVE_ASSAY_MODE');
 if(as_of_day!==null)assert(isDay(as_of_day),'HELD_INVALID_ASOF_DAY');
 const ordered=[...posts].sort((a,b)=>a.public_date.localeCompare(b.public_date)||a.source_id.localeCompare(b.source_id));
 const target=target_source_id?posts.find(p=>p.source_id===target_source_id):null;
 if(target_source_id)assert(target,'HELD_UNREGISTERED_TARGET');
 const day=as_of_day||target?.public_date||meta.window.end_utc.slice(0,10);
 const candidates=ordered.filter(p=>p.public_date<day&&p.source_id!==target_source_id);
 const earlierIds=set(candidates.map(p=>p.source_id));
 const earlierEdges=relations.filter(e=>earlierIds.has(e.source_id));
 const noFuture=candidates.every(p=>p.public_date<day);
 assert(noFuture,'HELD_FUTURE_PUBLICATION_LEAK');
 const common={schema:'td613.wendbine.proscenium-assay/v1',
  role:{source:'ORIGINAL_PUBLIC_WENDBINE_WORK',original_compiler:'TD613_HISTORICAL_FIXTURE_EXECUTABLE',
   assay:'TD613_DERIVED_HOST_INSTRUMENT',vixen:'INDEPENDENT_RESEARCH_OPERAHOUSE_NOT_VIXEN_PERFORMER'},
  snapshot_id:meta.snapshot_id,coverage_state:meta.coverage.state,
  evidence_count:validated.admitted_sources,source_relation_count:validated.source_relation_count,
  as_of_day:day,asof_semantics:'RETROSPECTIVE_PUBLIC_DATE_FILTER_NOT_HISTORICAL_CAPTURE_REPLAY',
  same_day_order:'UNRESOLVED_ALL_SAME_DAY_POSTS_EXCLUDED',
  private_state_accessed:false,source_bodies_copied:false,source_author_identity_adjudicated:false,
  human_closure_required:true,scientific_credit:0,source_promotion:false,
  historical_replay_established:false,original_performer_authorship_of_td613_tools:false};
 if(mode==='inventory')return {...common,state:'HELD_COVERAGE_NOT_EXHAUSTIVE',
  available_source_days:sorted(new Set(ordered.map(p=>p.public_date))),
  earlier_day_source_count:candidates.length,earlier_day_relation_count:earlierEdges.length,
  next_action:'ACQUIRE_INDEPENDENT_CAPTURE_WITH_BOUNDED_TIMESTAMPS_FOR_HISTORICAL_REPLAY'};
 assert(target,'HELD_TARGET_REQUIRED');
 assert(target.public_date===day,'HELD_ASSAY_TARGET_DAY_MISMATCH');
 const title=question===null?target.technical_header:String(question);
 assert(title.length>0&&title.length<=250,'HELD_TITLE_QUERY_BOUNDS');
 const baseline=predict(title,candidates,earlierEdges);
 const reverse=[...candidates].reverse();
 const shuffled=predict(title,reverse,earlierEdges);
 const permuted=predict(title,candidates,earlierEdges,{permute:true});
 const ablated=predict(title,candidates,earlierEdges,{ablate:true});
 const targetTokens=tok(title);
 const decoySource=[...candidates].sort((a,b)=>
  overlap(targetTokens,tok(a.technical_header))-overlap(targetTokens,tok(b.technical_header))||
  a.source_id.localeCompare(b.source_id))[0]||null;
 const decoy=predict(decoySource?.technical_header||'',candidates,earlierEdges);
 const baselineScore=score(baseline,target,relations);
 const results={C0:{kind:'BASELINE_EARLIER_PUBLIC_ONLY',prediction:baseline,scoring:baselineScore},
  C1:{kind:'ORDER_SHUFFLE_DETERMINISM_SANITY_ONLY',prediction:shuffled,
   identical_to_baseline:JSON.stringify(shuffled)===JSON.stringify(baseline),
   warning:'ORDER_INVARIANCE_IS_NOT_RECONSTRUCTION_EVIDENCE'},
  C2:{kind:'CONCEPT_LABEL_PERMUTATION',prediction:permuted,scoring:score(permuted,target,relations)},
  C3:{kind:'TYPED_EDGE_ABLATION',prediction:ablated,scoring:score(ablated,target,relations)},
  C4:{kind:'EARLIER_REGISTERED_TECHNICAL_POST_MIN_LEXICAL_OVERLAP_DECOY',
   decoy_source_id:decoySource?.source_id||null,
   declared_lexical_overlap:decoySource?overlap(targetTokens,tok(decoySource.technical_header)):null,
   semantic_independence_proven:false,
   prediction:decoy,scoring:score(decoy,target,relations)}};
 const caution='SINGLE_TARGET_DIAGNOSTIC_NO_PREREGISTERED_MULTI_TARGET_OR_HISTORICAL_CAPTURE_WITNESS';
 const core={...common,state:'HELD_RECONSTRUCTION_NOT_ADJUDICATED',
  target_source_id:target.source_id,disclosed_query_surface:'TARGET_TECHNICAL_HEADER_OR_OPERATOR_QUERY',
  query_sha256:sha(Buffer.from(title,'utf8')),earlier_day_source_count:candidates.length,
  earlier_day_relation_count:earlierEdges.length,source_id_ordering_not_chronology:true,
  controls:results,claim_ceiling:caution,
  evidence_class:'RETROSPECTIVE_PUBLIC_SNAPSHOT_METHODOLOGY_PROBE',
  forbidden_promotions:['PRIVATE_STATE','AUTHOR_INTENT','HISTORICAL_ASOF_REPLAY','METHOD_PARITY','VIXEN_AUTHORSHIP','CAUSAL_EDGE']};
 if(mode==='assay')return core;
 const witnessed=baseline.witnesses;
 const nextSteps=[
  {action:'INSPECT_BOUND_PUBLIC_POST',source_id:witnessed[0]?.source_id??null,
   reason:'Verify earlier source assertions before testing any proposed relation',human_action_required:true},
  {action:'ACQUIRE_INDEPENDENT_CAPTURE_CLOCK',source_id:target.source_id,
   reason:'Day-level publication dates cannot establish actual observation at the historical cutoff',human_action_required:true},
  {action:'RUN_HELDOUT_MULTI_TARGET_PREREG',source_id:target.source_id,
   reason:'Demand baseline improvement over label-permutation, ablation and decoy controls',human_action_required:true}
 ];
 return {...core,journey:{schema:'td613.wendbine.maestro-research-plan/v1',
   hypothesis:'Earlier publicly published typed topology constrains title-disclosed held-out placement',
   alternate_hypotheses:['GENERIC_TECHNICAL_VOCABULARY_OVERLAP','RETROSPECTIVE_CAPTURE_BIAS','TITLE_LEAKAGE'],
   evidence_for:witnessed.map(x=>x.source_id),
   evidence_against:results.C2.scoring.graph_hits>=baselineScore.graph_hits?'PERMUTATION_NOT_WORSE_THAN_BASELINE':null,
   next_steps:nextSteps,adaptive_rule:'STOP_OR_REVISE_IF_NEGATIVE_CONTROL_MATCHES_OR_OUTPERFORMS_BASELINE',
   loop_state:'WAITING_FOR_NEW_OPERATOR_OR_INDEPENDENT_EVIDENCE',
   can_proceed_without_new_evidence:false,automated_hypothesis_promotion:false}};
}

// Finite archive-wide sensitivity sweep. This is retrospective exploration;
// it is not the untouched v0.1 preregistered held-out experiment.
export function runRetrospectiveSweep({meta,posts,relations}){
 validateNativeMaterials(meta,posts,relations);
 const firstDay=sorted(new Set(posts.map(p=>p.public_date)))[0];
 const eligible=posts.filter(p=>p.public_date>firstDay).sort((a,b)=>
  a.public_date.localeCompare(b.public_date)||a.source_id.localeCompare(b.source_id));
 const rows=eligible.map(target=>{
  const receipt=runReconstructionAssay({meta,posts,relations,mode:'assay',target_source_id:target.source_id});
  const s=receipt.controls;
  return {source_id:target.source_id,public_day:target.public_date,
   earlier_source_count:receipt.earlier_day_source_count,
   baseline_graph_hits:s.C0.scoring.graph_hits,
   label_permutation_graph_hits:s.C2.scoring.graph_hits,
   edge_ablation_graph_hits:s.C3.scoring.graph_hits,
   technical_decoy_graph_hits:s.C4.scoring.graph_hits,
   baseline_neighbor_hits:s.C0.scoring.neighbor_hits,
   decoy_source_id:s.C4.decoy_source_id,
   baseline_abstained:s.C0.prediction.state.startsWith('ABSTAIN'),
   control_order_witness:s.C1.identical_to_baseline,
   positive_witness_source_ids:s.C0.prediction.witnesses.map(x=>x.source_id)};
 });
 const sum=k=>rows.reduce((n,x)=>n+x[k],0);
 const strict=rows.filter(r=>r.baseline_graph_hits>r.label_permutation_graph_hits&&
  r.baseline_graph_hits>r.technical_decoy_graph_hits).length;
 return {schema:'td613.wendbine.public-retrospective-sweep/v1',
  state:'HELD_EXPLORATORY_SWEEP_NOT_PREREGISTERED',
  snapshot_id:meta.snapshot_id,coverage_state:meta.coverage.state,
  baseline_source_count:posts.length,target_count:rows.length,earliest_public_day:firstDay,
  chronology:'STRICTLY_EARLIER_PUBLISHED_DAY_NO_SAME_DAY_ORDER',
  observation_clock:'NOT_HISTORICALLY_ATTESTED_BY_THIS_SNAPSHOT',
  query_leakage:'TECHNICAL_HEADER_DISCLOSED',
  negative_control_source:'EARLIER_PUBLIC_REGISTERED_TECHNICAL_POST',
  aggregates:{baseline_graph_hits:sum('baseline_graph_hits'),
   label_permutation_graph_hits:sum('label_permutation_graph_hits'),
   edge_ablation_graph_hits:sum('edge_ablation_graph_hits'),
   technical_decoy_graph_hits:sum('technical_decoy_graph_hits'),
   baseline_neighbor_hits:sum('baseline_neighbor_hits'),
   baseline_abstentions:rows.filter(r=>r.baseline_abstained).length,
   baseline_beats_both_adversarial_graph_controls:strict},
  per_target:rows,statistical_significance:'UNTESTED',
  source_bodies_copied:false,private_state_accessed:false,
  scientific_credit:0,human_closure_required:true,method_parity:'HELD_UNPROVEN',
  claim_ceiling:'DESCRIPTIVE_RETROSPECTIVE_DIAGNOSTIC_NOT_INDEPENDENT_VALIDATION'};
}

export async function loadOriginalPublicFixture(root=DEFAULT_ROOT){
 const directory=realpathSync(root);
 const paths={snapshot:'01-MANIFESTS/public-reddit-48h-snapshot-v01.json',
  sources:'01-MANIFESTS/public-reddit-48h-source-registry-v01.jsonl',
  relations:'01-MANIFESTS/typed-relation-registry-v01.json',
  original_compiler:'99-ADMIN/wendbine-compile.mjs'};
 const raw={}; const digests={};
 for(const [name,p] of Object.entries(paths)){
  const full=realpathSync(resolve(directory,p));
  assert(restrictPath(directory,full),'HELD_SOURCE_PATH_ESCAPE');
  raw[name]=readFileSync(full);
  digests[name]={relative_path:p,sha256:sha(raw[name]),byte_count:raw[name].length};
 }
 const meta=JSON.parse(raw.snapshot.toString('utf8'));
 const posts=raw.sources.toString('utf8').split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
 const relationDoc=JSON.parse(raw.relations.toString('utf8'));
 assert(relationDoc.schema==='wendbine-typed-relation-registry/v0.1'&&relationDoc.snapshot_id===meta.snapshot_id,
  'HELD_RELATION_REGISTRY_MISMATCH');
 assert(Array.isArray(relationDoc.fields)&&relationDoc.fields.join('|')==='source_id|graph|from|relation|to|evidence_class',
  'HELD_RELATION_FIELD_ORDER');
 const relations=relationDoc.relations.map(r=>Object.fromEntries(relationDoc.fields.map((f,i)=>[f,r[i]])));
 validateNativeMaterials(meta,posts,relations);
 // Execute the ORIGINAL in-memory compiler, avoiding its filesystem writer.
 const compiler=await import(pathToFileURL(resolve(directory,paths.original_compiler)).href);
 assert(typeof compiler.compilePublicCorpus==='function','HELD_ORIGINAL_COMPILER_MISSING');
 const compiled=compiler.compilePublicCorpus(meta,posts,relations);
 assert(compiled.compiled_from.source_count===posts.length&&compiled.typed_relation_edges.length===relations.length,
  'HELD_ORIGINAL_COMPILER_DIFFERENTIAL');
 return {meta,posts,relations,digests,compiler_receipt:{original_compiler_executed:true,
  original_compiler_digest:digests.original_compiler.sha256,
  source_count:compiled.compiled_from.source_count,
  typed_relation_count:compiled.typed_relation_edges.length,
  topology_digest:sha(Buffer.from(JSON.stringify(compiled)))} };
}

export async function runNativeWendbineAssay(opts={}){
 const native=await loadOriginalPublicFixture();
 const result=opts.mode==='sweep'?runRetrospectiveSweep(native):runReconstructionAssay({...native,...opts});
 return {...result,original_compiler_receipt:native.compiler_receipt,source_byte_custody:native.digests,
  vixen_work_import_count:0,original_archive_modified:false};
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const args=process.argv.slice(2);const get=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:null};
  const allowed=new Set(['--mode','--target-source-id','--as-of-day','--question']);
  for(let i=0;i<args.length;i+=2)assert(allowed.has(args[i])&&i+1<args.length,'HELD_UNKNOWN_CLI_ARGUMENT');
  const result=await runNativeWendbineAssay({mode:get('--mode')||'inventory',
   target_source_id:get('--target-source-id'),as_of_day:get('--as-of-day'),question:get('--question')});
  process.stdout.write(JSON.stringify(result)+'\n');
 }catch(e){process.stderr.write(JSON.stringify({state:'HELD',reason:String(e.message||e)})+'\n');process.exitCode=2;}
}
