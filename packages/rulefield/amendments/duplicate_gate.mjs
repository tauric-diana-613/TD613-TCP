/**
 * 𝌋 Rulefield prior-entry collision sieve. Deterministic and source-free.
 * The detector distinguishes strict text/ID matches from merely plausible
 * lexical overlap. It never proves two scientific propositions equivalent.
 * Existing anchors, source quotations, falsifiers and controls are not attempts
 * to introduce a new canonical Rulefield entry.
 */
const strict=x=>String(x??'').normalize('NFC').toLocaleLowerCase('en-US')
 .replace(/\r\n?/g,'\n').replace(/\s+/g,' ').trim().replace(/[.。]+$/u,'').trim();
// Similarity-only lexical projection; unlike strict, this may erase math symbols.
const normalize=x=>String(x??'').normalize('NFKC').toLocaleLowerCase('en-US')
 .replace(/[\u2018\u2019]/g,"'").replace(/[\u2010-\u2015]/g,'-')
 .replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
const tokens=x=>normalize(x).split(' ').filter(Boolean);
const KINDS=new Set(['PROPOSE_RULE','PROPOSE_RELATION','PROPOSE_PROJECTION',
 'PROPOSE_PREDICTION','PROPOSE_GEOMETRY','PROPOSE_CONSEQUENCE','PROPOSE_ASSAY',
 'PROPOSE_AMBIANCE_OBSERVER_ASSAY','REFRACT_RULE']);
const LOCATIONS=['proposed_entry.statement','proposed_entry.rule','proposed_entry.title',
 'proposed_entry.id','candidate_rule.statement','candidate_rule.rule','candidate_rule.id',
 'candidate_crossing.statement','candidate_crossing.id','proposed_rule_id',
 'proposed_crossing_id','rule_statement','crossing_statement','proposed_text',
 'statement','proposed_rule','new_entry.statement','new_entry.id',
 'nks.proposed_new_rule','hypothesis','proposed_queue_title','proposed_queue_id',
 'new_entry.queue_id'];
const at=(o,path)=>path.split('.').reduce((v,k)=>v?.[k],o);
function proposedTexts(item){
 if(!KINDS.has(item.kind))return [];
 return LOCATIONS.flatMap(path=>typeof at(item,path)==='string'&&at(item,path).trim()
  ?[{field:path,text:at(item,path).trim()}]:[]);
}
function corpus(index){
 return [
  ...index.rules.map(r=>({id:r.id,kind:'RULE',lane:r.lane,
   texts:[r.statement,r.record?.rule].filter(x=>typeof x==='string'&&x.trim())
    .map(text=>({field:'statement',text}))})),
  ...index.crossings.map(r=>({id:r.id,kind:'CROSSING',lane:r.lane,
   texts:[r.statement].filter(x=>typeof x==='string'&&x.trim())
    .map(text=>({field:'statement',text}))})),
  ...index.priority_queue.map(r=>({id:r.id,kind:'PRIORITY',lane:'OPERATOR_PRIORITY_QUEUE',
   texts:[r.title].filter(x=>typeof x==='string'&&x.trim())
    .map(text=>({field:'queue_title',text}))}))
 ];
}
function jaccard(a,b){
 const x=new Set(tokens(a)),y=new Set(tokens(b));
 if(x.size<8||y.size<8)return 0;
 let n=0;for(const t of x)if(y.has(t))n++;
 return n/(x.size+y.size-n||1);
}
const priority={EXACT_EXISTING_ENTRY:0,EXPLICIT_ID_COLLISION:0,EXACT_INTRA_PACKET:0,
 POSSIBLE_EXISTING_OVERLAP:1,POSSIBLE_INTRA_PACKET_OVERLAP:1};
const round=n=>Math.round(n*1000)/1000;
export function detectPriorEntryCollisions(proposals,index){
 const canon=corpus(index),past=[],results=[];
 for(const item of proposals){
  const matches=[],fields=proposedTexts(item);
  for(const field of fields){
   if(/(?:^|\.)id$/.test(field.field)||field.field==='proposed_rule_id'||
      field.field==='proposed_crossing_id'||field.field==='proposed_queue_id'){
    const found=canon.find(r=>r.id===field.text);
    if(found)matches.push({match_type:'EXPLICIT_ID_COLLISION',candidate_field:field.field,
     candidate_excerpt:field.text,matched_kind:found.kind,matched_id:found.id,
     matched_lane:found.lane,similarity:1,comparison:'ID_COLLISION',
     explanation:'An existing entry ID cannot be silently reused for a new entry.'});
    continue;
   }
   const norm=normalize(field.text),queueTitle=field.field==='proposed_queue_title';
   if(!norm||(!queueTitle&&(norm.length<32||tokens(field.text).length<5)))continue;
   const targets=[...canon.map(r=>({...r,scope:'EXISTING'})),
    ...past.map(r=>({...r,scope:'CURRENT_PACKET'}))];
   for(const target of targets){
    for(const prior of target.texts){
     if(target.kind==='PRIORITY'&&!queueTitle)continue;
     if(queueTitle&&target.kind!=='PRIORITY')continue;
     if(strict(prior.text)===strict(field.text)){
      matches.push({match_type:target.scope==='EXISTING'?'EXACT_EXISTING_ENTRY':'EXACT_INTRA_PACKET',
       candidate_field:field.field,candidate_excerpt:field.text.slice(0,200),
       matched_kind:target.kind,matched_id:target.id,matched_lane:target.lane,
       matched_field:prior.field,matched_excerpt:prior.text.slice(0,200),
       similarity:1,comparison:'NORMALIZED_TEXT_EXACT',
       explanation:'Identical normalized research statement; not a new Rulefield entry.'});
     }else if(field.field!=='label'&&field.field!=='relation.type'&&tokens(field.text).length>=9){
      const score=jaccard(field.text,prior.text);
      if(score>=0.78)matches.push({
       match_type:target.scope==='EXISTING'?'POSSIBLE_EXISTING_OVERLAP':'POSSIBLE_INTRA_PACKET_OVERLAP',
       candidate_field:field.field,candidate_excerpt:field.text.slice(0,200),
       matched_kind:target.kind,matched_id:target.id,matched_lane:target.lane,
       matched_field:prior.field,matched_excerpt:prior.text.slice(0,200),
       similarity:round(score),comparison:'TOKEN_SET_JACCARD',
       explanation:'High lexical overlap is not proof of conceptual equivalence; human review required.'});
     }
    }
   }
  }
  matches.sort((a,b)=>(priority[a.match_type]-priority[b.match_type])||
   (b.similarity??-1)-(a.similarity??-1)||
   String(a.matched_id).localeCompare(String(b.matched_id))||
   a.candidate_field.localeCompare(b.candidate_field));
  const seen=new Set(),deduped=matches.filter(x=>{
   const key=x.match_type+'|'+x.matched_id+'|'+x.candidate_field;
   if(seen.has(key))return false;seen.add(key);return true;
  });
  const declared=item.duplicate_disclosure?.suspected_existing_ids;
  if(Array.isArray(declared))for(const id of declared){
   const found=canon.find(r=>r.id===id);
   if(found&&!deduped.some(x=>x.matched_id===found.id))deduped.push({
    match_type:'POSSIBLE_EXISTING_OVERLAP',
    candidate_field:'duplicate_disclosure.suspected_existing_ids',
    candidate_excerpt:'HUMAN_OR_AGENT_DISCLOSED_POTENTIAL_PRIOR_ENTRY',
    matched_kind:found.kind,matched_id:found.id,matched_lane:found.lane,
    similarity:null,comparison:'DECLARED_POTENTIAL_MATCH',
    explanation:'The applicant disclosed a prior entry requiring human disposition.'});
  }
  const exact=deduped.some(x=>priority[x.match_type]===0);
  results.push({proposal:item.id,
   status:exact?'HELD_EXISTING_ENTRY_DUPLICATE':deduped.length?
    'HELD_POSSIBLE_ENTRY_OVERLAP':'NO_DUPLICATE_FOUND',
   matches:deduped,
   source_corpus_scanned:{rules:index.rules.length,crossings:index.crossings.length,
    queue_positions:index.priority_queue.length,preceding_proposals:past.length},
   interpretation:'Neither lexical overlap nor its absence proves conceptual identity or novelty; human review is required for flagged matches. Existing anchor references alone are permitted.'});
  past.push({id:item.id,kind:'PROPOSED_CANDIDATE',lane:'CURRENT_PACKET',
   texts:fields.filter(x=>!/(?:^|\.)id$/.test(x.field)&&
    x.field!=='proposed_rule_id'&&x.field!=='proposed_crossing_id'&&x.field!=='proposed_queue_id')});
 }
 return results;
}