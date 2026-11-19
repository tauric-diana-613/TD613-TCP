/**
 * Vixen original-manuscript mathematics. The public wardrobe is derived only
 * from custody-verified Experiment-A Work bodies (NOT the TCC/RC host catalogue).
 * It assigns no new folio IDs, theorem status, research subjects or empirical credit.
 */
import {loadExperimentABodyBySourceId,shardForWorkIndex,computeSha256HexAsync} from './corpus-experiment-a.mjs';
import {scoreUnifiedSynthesisCandidates} from './synthesis-salon-engine.mjs';

export const WORK_MATH_SCHEMA='emstd613.vixen.original-work-math/v1';
// Issue immutable source-backed entries; a caller's cloned receipt cannot
// promote an arbitrary snippet into an admitted scholarly manifestation.
const ISSUED_WORK_MATH_ENTRIES=new WeakSet();
const MATH_FORMS=Object.freeze([
 {kind:'MATH_FENCE',re:/\`{3}(?:math|latex|tex)[^\n]*\n([\s\S]{2,1800}?)\`{3}/gi},
 {kind:'DISPLAY_TEX',re:/\\\[([\s\S]{2,1800}?)\\\]/g},
 {kind:'DISPLAY_TEX',re:/\$\$([\s\S]{2,1800}?)\$\$/g},
 {kind:'EQUATION_ENV',re:/\\begin\{(equation\*?|align\*?|gather\*?)\}([\s\S]{2,1800}?)\\end\{\1\}/g},
 {kind:'INLINE_TEX',re:/\\\((.{3,320}?)\\\)/g},
 {kind:'INLINE_TEX',re:/\$(?!\$)([^\n$]{4,320}?)\$(?!\$)/g}
]);
const plain=s=>typeof s==='string'?s.trim():'';
const eligibleLiteral=s=>Boolean(s&&s.length>=3&&s.length<=1800&&!/data:image|https?:\/\/|<script|<\/script/i.test(s));
// Verified source bytes establish quotation integrity, not mathematical identity.
// Be conservative: Markdown checklists, code settings, citations and prose
// wrapped in TeX may not masquerade as original mathematical passages.
const balancedBraces=s=>{
 let depth=0;
 for(const c of s){
  if(c==='{')depth++;
  else if(c==='}'&&--depth<0)return false;
 }
 return depth===0;
};
const mathematicalExpression=s=>{
 const t=plain(s);
 if(!eligibleLiteral(t)||!balancedBraces(t)||
    /^\s*(?:>|\||#{1,6}\s|--|[-*+]\s|\x60|!\[|\d+[.)]\s+\*\*)/.test(t)||
    /https?:\/\/|<\/?[A-Za-z]|\]\(|\[\^|\b(?:std::|cite:)\b|\*\*|\x60/.test(t))return false;
 if(/^(?:where|note|figure|table|source|chapter|reference|example|in this|the following|the|this|for|from|with|during|under|our)\s/i.test(t))return false;
 if(/^[A-Za-z][A-Za-z\s-]{2,}$/.test(t))return false;
 // A formatting macro or lone operator is not a mathematical statement.
 const mathCommand=/\\(?:d?frac|tfrac|sum|prod|i?int|oint|lim|sqrt|partial|nabla)(?![A-Za-z])/;
 const equal=t.indexOf('=');
 const inequality=/^\s*\(?(?:[A-Za-z]\w{0,3}|\d+)\s*[<>]\s*(?:[A-Za-z]\w{0,3}|\d+)/;
 if(equal<0&&!mathCommand.test(t)&&!inequality.test(t))return false;
 if(equal>=0){
  const left=t.slice(0,equal).trim().replace(/\\$/,'').trim();
  const right=t.slice(equal+1).trim();
  if(!/[\p{L}\p{N}]/u.test(left)||!/[\p{L}\p{N}]/u.test(right)||
     (!mathCommand.test(t)&&!/^(?:\\[A-Za-z]+|\(?[A-Za-z]{1,4}(?=[\s({_^+*/-]|$)|\d)/.test(left))||
     /^['"\x60]/.test(right)||(!mathCommand.test(t)&&left.split(/\s+/).length>7))return false;
  if(/^(?:[A-Z][A-Z0-9_]{5,}|[a-z][A-Za-z]{6,})\s*$/.test(left)&&
     !mathCommand.test(t)&&!/[+*/^{}()\[\]∑∫]/.test(t))return false;
 }
 if(!mathCommand.test(t)&&t.split(/\s+/).length>14)return false;
 if(equal<0&&!mathCommand.test(t)&&
    (/^\\(?:approx|rightarrow|leq|geq|times|cdot)\b/.test(t)||t.split(/\s+/).length<2))return false;
 return true;
};
const mathLine=s=>{
 const t=plain(s);
 if(t.length<5||t.length>260||/^\s*(?:[\x60#>|]|[-*+]\s|\d+[.)]\s)/.test(t)||
    /(?:https?:\/\/|\$|\\\[|\\\]|\\\(|\\\)|\x60{3})/.test(t))return false;
 return mathematicalExpression(t);
};
export function extractOriginalMathPassages(text,{max=4}={}){
 if(typeof text!=='string')return Object.freeze([]);
 const matches=[];
 for(const form of MATH_FORMS){
  form.re.lastIndex=0;
  for(const m of text.matchAll(form.re)){
   const literal=plain(m[form.kind==='EQUATION_ENV'?2:1]);
   if(form.kind==='DISPLAY_TEX'&&m.index>0&&/[A-Za-z0-9]/.test(text[m.index-1]))continue;
   if(!mathematicalExpression(literal))continue;
   matches.push({kind:form.kind,literal,offset_utf16:m.index});
  }
 }
 const lines=text.split('\n');let pos=0;
 for(const line of lines){
  const t=plain(line);
  if(mathLine(t)&&eligibleLiteral(t))matches.push({kind:'EXACT_MATH_LINE',literal:t,offset_utf16:pos+line.indexOf(t)});
  pos+=line.length+1;
 }
 matches.sort((a,b)=>a.offset_utf16-b.offset_utf16||a.kind.localeCompare(b.kind));
 const unique=[];const seen=new Set();
 for(const m of matches){
  const key=m.literal.replace(/\s+/g,' ').toLowerCase();
  if(seen.has(key))continue;
  // Prevent an inline expression from duplicating a display expression.
  if(unique.some(p=>p.offset_utf16<=m.offset_utf16&&m.offset_utf16<p.offset_utf16+p.literal.length))continue;
  seen.add(key);unique.push(Object.freeze({
   kind:m.kind,literal:m.literal.slice(0,1000),offset_utf16:m.offset_utf16,
   observed_in:'ORIGINAL_SOURCE_DERIVATIVE',independent_proof:false
  }));
  if(unique.length>=max)break;
 }
 return Object.freeze(unique);
}
export async function buildOriginalWorkMathWardrobe(corpus,{
 readSource=loadExperimentABodyBySourceId,maxPassagesPerWork=4
}={}){
 if(!Array.isArray(corpus?.works))throw new TypeError('WORKS_SOURCE_ROSTER_REQUIRED');
 const seen=new Set(),entries=[],unavailable=[],empty=[];
 for(let i=0;i<corpus.works.length;i++){
  const work=corpus.works[i];
  if(!work||!/^emwork_[0-9a-f]{24}$/.test(work.work_id)||seen.has(work.work_id))
   throw new TypeError('ORIGINAL_WORK_COORDINATE_INVALID');
  seen.add(work.work_id);
  const linked=Array.isArray(work.linked_sources)?work.linked_sources:[];
  const sorted=[...linked].filter(s=>s&&typeof s.source_file_id==='string')
   .sort((a,b)=>Number(!/markdown|\.md$/i.test(a.media_type||a.original_filename||''))-
                   Number(!/markdown|\.md$/i.test(b.media_type||b.original_filename||'')));
  let selected=null;
  for(const source of sorted){
   let verified;
   try{verified=await readSource(source.source_file_id,{hintShard:shardForWorkIndex(i)});}
   catch(error){unavailable.push(Object.freeze({work_id:work.work_id,source_file_id:source.source_file_id,
     reason:'SOURCE_LOAD_OR_SHA_VERIFICATION_FAILED'}));continue;}
   if(!verified||verified.source_file_id!==source.source_file_id ||
      (verified.work_id&&verified.work_id!==work.work_id)||
      verified.body_sha256_verified!==true||verified.readable===false||
      typeof verified.text_body!=='string'||
      !/^[0-9a-f]{64}$/i.test(source.sha256||'')){
    unavailable.push(Object.freeze({work_id:work.work_id,source_file_id:source.source_file_id,
      reason:'BODY_UNAVAILABLE_OR_UNVERIFIED'}));continue;
   }
   // Independently rehash even when a plugged-in source reader asserts a
   // verified flag. The derivative text digest and original source-file
   // digest refer to distinct substrates and must never be conflated.
   const expected=verified.derivative_sha256||verified.body_sha256||null;
   if(!/^[0-9a-f]{64}$/i.test(expected||'')||
      (await computeSha256HexAsync(verified.text_body))!==expected){
     unavailable.push(Object.freeze({work_id:work.work_id,source_file_id:source.source_file_id,
       reason:'DERIVATIVE_BODY_SHA256_MISMATCH_OR_ABSENT'}));continue;
   }
   const passages=extractOriginalMathPassages(verified.text_body,{max:maxPassagesPerWork});
   if(!passages.length)continue;
   selected=Object.freeze({
    work_id:work.work_id,title:work.display_title||work.declared_title||work.work_id,
    source_file_id:source.source_file_id,original_filename:source.original_filename||null,
    declared_source_sha256:source.sha256||null,
    derivative_sha256:verified.derivative_sha256||verified.body_sha256||null,
    source_body_sha256_verified:true,source_role:'PERFORMER_WORK_MANIFESTATION',
    source_excerpts:passages,
    empirical_credit:0,host_instrument_authorship:false
   });
   ISSUED_WORK_MATH_ENTRIES.add(selected);
   break;
  }
  if(selected)entries.push(selected);else empty.push(work.work_id);
 }
 return Object.freeze({
  schema:WORK_MATH_SCHEMA,source_register:'ORIGINAL_EXPERIMENT_A_WORKS',
  source_data_kind:'CUSTODY_VERIFIED_MANUSCRIPT_TEXT',entries:Object.freeze(entries),
  verified_work_math_count:entries.length,examined_work_count:corpus.works.length,
  no_verified_math_excerpt_count:empty.length,
  source_refusals:Object.freeze(unavailable),technical_formula_promotions:0,
  empirical_credit:0,scientific_conclusions_authorized:false
 });
}
export function scoreOriginalWorkMath(corpus,entry,{operatorQuestion=''}={}){
 const work=corpus?.works?.find(w=>w.work_id===entry?.work_id);
 if(!work||!ISSUED_WORK_MATH_ENTRIES.has(entry)||entry.source_body_sha256_verified!==true ||
    !work.linked_sources?.some(s=>s.source_file_id===entry.source_file_id &&
      s.sha256===entry.declared_source_sha256)||
    !entry.source_excerpts?.length)
   throw new TypeError('UNVERIFIED_OR_FOREIGN_MATHEMATICAL_MANUSCRIPT');
 const humanQuestion=plain(operatorQuestion).slice(0,240);
 const sourceContext=[work.work_id,work.display_title||work.declared_title||'',
  entry.source_excerpts[0].literal].join(' · ').slice(0,1100);
 const ranked=scoreUnifiedSynthesisCandidates(corpus,{
  sourceContext,operatorQuestion:humanQuestion,candidateLimit:4
 });
 return Object.freeze({
  schema:WORK_MATH_SCHEMA,work_id:work.work_id,source_file_id:entry.source_file_id,
  derivative_sha256:entry.derivative_sha256,
  excerpt_offset_utf16:entry.source_excerpts[0].offset_utf16,
  excerpt_literal:entry.source_excerpts[0].literal,
  source_body_sha256_verified:true,
  ranking_scope:'CORPUS_WIDE_CANDIDATES_CONDITIONED_BY_VERIFIED_SOURCE_PASSAGE',
  human_question_supplied:Boolean(humanQuestion),
  method:'BROWSER_UNIFIED_SCORE_WITH_SRC_METADATA_ADAPTER',
  candidate_count:ranked.candidate_count,top_candidate:ranked.top_candidate?
   {id:ranked.top_candidate.id,title:ranked.top_candidate.title,score:ranked.top_candidate.score}:null,
  candidates:Object.freeze(ranked.candidates.map(x=>Object.freeze({
   id:x.id,title:x.title,score:x.score,falsifier:x.falsifier||null,
   breakdown:Object.freeze({...x.breakdown})
  }))),
  engine_evidence_basis:ranked.src_atelier?.evidence_basis||null,
  scientific_authority:'UNRATIFIED_CANDIDATE_PROPOSAL',
  empirical_credit:0,native_host_tools_executed:false
 });
}
