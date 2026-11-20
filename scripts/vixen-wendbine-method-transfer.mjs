#!/usr/bin/env node
/**
 * TD613 host-only cross-domain computational transfer.
 * Native Wendbine public topology = research METHOD calibration, never Vixen Work.
 * Independently verified Vixen manuscripts = sole subject data.
 * An execution/differential receipt cannot establish scholarly method equivalence.
 */
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {loadOriginalPublicFixture} from './wendbine-proscenium-assay.mjs';

const digest=s=>createHash('sha256').update(s).digest('hex');
const assert=(v,s)=>{if(!v)throw Error(s);};
const tokenize=s=>[...new Set(String(s||'').toLowerCase().match(/[a-z][a-z0-9]{2,}/g)||[])];
const normalized=s=>String(s||'').toLowerCase().replace(/[_\W]+/g,' ').replace(/\s+/g,' ').trim();
const hits=(q,str)=>{const index=new Set(tokenize(str));return tokenize(q).filter(w=>index.has(w)).length};
function scoreWork(doc,query,profile,{ablate=false,permute=false,titleOnly=false}={}){
 const body=titleOnly?'':doc.body;
 const lexicalBody=hits(query,body);
 const lexicalTitle=hits(query,doc.title);
 const bodyNorm=normalized(body);
 const matched=profile.concept_nodes.filter(node=>{
  const label=permute?profile.concept_nodes[(profile.concept_nodes.indexOf(node)+1)%profile.concept_nodes.length].label:node.label;
  const labelNorm=normalized(label);
  return labelNorm.length>2&&(' '+bodyNorm+' ').includes(' '+labelNorm+' ');
 }).map(node=>node.label).slice(0,64);
 // The public concept cooccurrence graph informs a non-causal structural
 // bonus. No typed source edge is transplanted as a relation between Works.
 const matchedSet=new Set(matched);
 const cooccurrence=ablate?0:profile.cooccurrence_overlay.filter(edge=>{
  const a=edge.from.slice('concept:'.length),b=edge.to.slice('concept:'.length);
  return matchedSet.has(a)&&matchedSet.has(b);
 }).length;
 const result={work_id:doc.work_id,body_query_hits:lexicalBody,
  title_query_hits:lexicalTitle,
  source_concept_term_hits:matched.length,
  matched_public_concept_names:matched.slice(0,12),
  public_cooccurrence_overlap_pairs:cooccurrence,
  graph_mapping:'HEURISTIC_COOCCURRENCE_PROJECTION_NOT_SOURCE_TYPED_RELATION'};
 return {...result,score:Number((5*lexicalBody+2*lexicalTitle+matched.length*0.15+cooccurrence*0.05).toFixed(4))};
}
const rank=items=>[...items].sort((a,b)=>b.score-a.score||a.work_id.localeCompare(b.work_id));
function scoredPair(documents,query,profile,opts={}){
 return rank(documents.map(d=>scoreWork(d,query,profile,opts)));
}
export function compareVerifiedVixenDocuments({documents,proofs,query,publicProfile,publicPosts,compilerReceipt}){
 assert(Array.isArray(documents)&&documents.length===2&&
  new Set(documents.map(x=>x.work_id)).size===2,'HELD_TWO_DISTINCT_VIXEN_WORKS');
 assert(Array.isArray(proofs)&&proofs.length===2,'HELD_VIXEN_PROOFS_REQUIRED');
 assert(typeof query==='string'&&query.trim().length>=5&&query.length<=240,'HELD_TRANSFER_QUERY_BOUNDS');
 assert(publicProfile?.concept_nodes?.length>0&&Array.isArray(publicProfile.cooccurrence_overlay),
  'HELD_ORIGINAL_STRUCTURAL_PROFILE_REQUIRED');
 assert(Array.isArray(publicPosts)&&publicPosts.length>0,'HELD_ORIGINAL_PUBLIC_SOURCES_REQUIRED');
 for(let i=0;i<2;i++){
  const d=documents[i],p=proofs[i];
  assert(/^emwork_[0-9a-f]{24}$/.test(d.work_id||'')&&p.work_id===d.work_id,
   'HELD_FOREIGN_OR_UNREGISTERED_VIXEN_WORK');
  assert(typeof d.body==='string'&&d.body.length<=400000&&d.body.length>0,
   'HELD_VERIFIED_BODY_REQUIRED');
  assert(digest(Buffer.from(d.body,'utf8'))===p.verified_derivative_sha256&&
   p.derivative_bytes_rehashed===true&&/^emsrc_[0-9a-f]{24}$/.test(p.source_file_id||''),
   'HELD_VIXEN_DERIVATIVE_DIGEST_MISMATCH');
 }
 const baseline=scoredPair(documents,query,publicProfile);
 const titleOnly=scoredPair(documents,query,publicProfile,{titleOnly:true});
 const ablated=scoredPair(documents,query,publicProfile,{ablate:true});
 const permuted=scoredPair(documents,query,publicProfile,{permute:true});
 const decoy=publicPosts.map(p=>({
  source_id:p.source_id,title:p.technical_header,
  shared_tokens:hits(query,p.technical_header)
 })).sort((a,b)=>a.shared_tokens-b.shared_tokens||a.source_id.localeCompare(b.source_id))[0];
 const decoyScored=scoredPair(documents,decoy.title,publicProfile);
 const reversed=scoredPair([...documents].reverse(),query,publicProfile);
 const invariant=JSON.stringify(reversed)===JSON.stringify(baseline);
 const queryChange=baseline.some((v,i)=>v.score!==titleOnly.find(x=>x.work_id===v.work_id)?.score);
 return {schema:'td613.vixen.wendbine-transfer-witness/v1',
  state:'HELD_CROSS_DOMAIN_ADAPTATION_NOT_NATIVE_METHOD_PARITY',
  source_estate:'ORIGINAL_PUBLIC_WENDBINE_REGISTRY_SEPARATE',
  subject_estate:'VIXEN_EXPERIMENT_A_VERIFIED_WORKS_ONLY',
  source_compiler_digest:compilerReceipt.original_compiler_digest,
  public_snapshot_compiled:true,
  public_source_bodies_admitted:0,private_index_accessed:false,
  original_performer_authorship_promoted:false,
  subject_source_proofs:proofs,subject_work_count:2,
  query_sha256:digest(Buffer.from(query,'utf8')),
  counterfactuals:{
   C0_full_body_and_public_method_profile:{ranking:baseline},
   C1_title_only:{ranking:titleOnly,body_computation_removed:true},
   C2_public_concept_label_permutation:{ranking:permuted},
   C3_public_cooccurrence_ablation:{ranking:ablated},
   C4_source_bound_technical_decoy:{public_source_id:decoy.source_id,shared_query_tokens:decoy.shared_tokens,
    independence_proven:false,ranking:decoyScored},
   C5_work_order_reversal:{invariant,ranking:reversed}
  },
  real_body_impacts_query_score:queryChange,
  transfer_claim:'PUBLIC_TOPOLOGY_AS_CALIBRATION_PRIOR_NOT_AUTHOR_OR_CAUSAL_TRUTH',
  native_algorithm_equivalence:'HELD_UNPROVEN',
  effect_of_transfer:'MEASURED_COMPUTATION_ON_VERIFIED_SOURCE_BYTES_ONLY',
  statistical_significance:'UNTESTED',scientific_credit:0,human_closure_required:true,
  source_admission_authority:false,public_ui_identity_changes:0};
}

export async function runNativeVixenWendbineTransfer({repoRoot=process.cwd(),work_ids,query}={}){
 assert(Array.isArray(work_ids)&&work_ids.length===2&&new Set(work_ids).size===2&&
   work_ids.every(x=>typeof x==='string'&&/^emwork_[0-9a-f]{24}$/.test(x)),
   'HELD_TWO_DISTINCT_VIXEN_WORK_IDS_REQUIRED');
 const sourceRoot=resolve(repoRoot,'app','encyclopedia');
 const html=await readFile(resolve(sourceRoot,'vix-cyb.html'),'utf8');
 const m=html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 assert(m,'HELD_ORIGINAL_VIXEN_CORPUS_MISSING');
 const corpus=JSON.parse(m[1]);
 assert(corpus.works?.length===32&&corpus.works.reduce((n,w)=>n+(w.linked_sources||[]).length,0)===53,
  'HELD_VIXEN_CORPUS_CENSUS_DRIFT');
 const reader=await import(pathToFileURL(resolve(sourceRoot,'vixen-estate','corpus-experiment-a.mjs')).href);
 assert(typeof reader.loadExperimentABodyBySourceId==='function','HELD_VIXEN_SOURCE_READER_MISSING');
 const proofs=[],documents=[];
 for(const workId of work_ids){
  const index=corpus.works.findIndex(x=>x.work_id===workId);
  assert(index>=0,'HELD_FOREIGN_OR_UNREGISTERED_VIXEN_WORK');
  const work=corpus.works[index];let selected=null;
  for(const source of work.linked_sources||[]){
   assert(/^emsrc_[0-9a-f]{24}$/.test(source.source_file_id||'')&&
    /^[a-f0-9]{64}$/i.test(source.sha256||''),'HELD_INVALID_VIXEN_MANIFESTATION');
   const body=await reader.loadExperimentABodyBySourceId(source.source_file_id,{
    hintShard:reader.shardForWorkIndex(index)});
   if(!body||typeof body.text_body!=='string')continue;
   assert(body.readable!==false&&body.body_sha256_verified===true&&
    body.source_file_id===source.source_file_id&&(!body.work_id||body.work_id===workId),
    'HELD_UNVERIFIED_VIXEN_SOURCE_BODY');
   const derivativeDigest=body.derivative_sha256||body.body_sha256;
   assert(/^[a-f0-9]{64}$/i.test(derivativeDigest||'')&&
    digest(Buffer.from(body.text_body,'utf8'))===derivativeDigest,
    'HELD_VIXEN_DERIVATIVE_DIGEST_MISMATCH');
   selected={source,body,derivativeDigest};break;
  }
  assert(selected,'HELD_VIXEN_WORK_UNREADABLE');
  proofs.push({work_id:workId,source_file_id:selected.source.source_file_id,
   declared_original_source_sha256:selected.source.sha256,
   verified_derivative_sha256:selected.derivativeDigest,
   derivative_bytes_rehashed:true,authorship:work.authorship||'UNRESOLVED'});
  documents.push({work_id:workId,title:work.display_title||work.declared_title||workId,
   body:selected.body.text_body});
 }
 const native=await loadOriginalPublicFixture();
 const compilerPath=resolve(repoRoot,'packages','dome_world_exact','fixtures','a15-r0',
  'WENDBINE','99-ADMIN','wendbine-compile.mjs');
 const compiler=await import(pathToFileURL(compilerPath).href);
 const profile=compiler.compilePublicCorpus(native.meta,native.posts,native.relations);
 assert(native.compiler_receipt.topology_digest===digest(Buffer.from(JSON.stringify(profile))),
  'HELD_ORIGINAL_COMPILER_DIGEST_DRIFT');
 return compareVerifiedVixenDocuments({documents,proofs,query,publicProfile:profile,
  publicPosts:native.posts,compilerReceipt:native.compiler_receipt});
}
