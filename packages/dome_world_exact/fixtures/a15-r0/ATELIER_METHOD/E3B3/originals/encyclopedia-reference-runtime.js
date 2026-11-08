// Embedded by build-encyclopedia-reference.mjs. Read-only research retrieval.
(() => {
  'use strict';
  const parseLines=id=>document.getElementById(id).textContent.trim().split('\n').filter(Boolean).map(JSON.parse);
  const manifest=JSON.parse(document.getElementById('td613-reference-manifest').textContent);
  const intakeSchema=JSON.parse(document.getElementById('td613-reference-intake-schema').textContent);
  const records=parseLines('td613-reference-records'), directory=parseLines('td613-reference-directory');
  const byId=new Map(records.map(r=>[r.id,r])), locations=new Map(directory.map(r=>[r.id,r]));
  const clone=value=>JSON.parse(JSON.stringify(value));
  const normalize=value=>String(value??'').normalize('NFKC').toLocaleLowerCase('en').replace(/[–—‐‑]/g,'-');
  const tokens=value=>normalize(value).match(/[\p{L}\p{N}_]+(?:-[\p{L}\p{N}_]+)*/gu)||[];
  const flat=value=>typeof value==='string'?value:Array.isArray(value)?value.map(flat).join(' '):value&&typeof value==='object'?Object.values(value).map(flat).join(' '):String(value??'');
  const docs=new Map(records.map(r=>[r.id,{title:normalize(r.label),aliases:normalize((r.aliases||[]).join(' ')),body:normalize(flat(r.record)+' '+flat(r.supplement)),terms:tokens(flat(r.record)+' '+flat(r.supplement))}]));
  const df=new Map();for(const d of docs.values())for(const token of new Set(d.terms))df.set(token,(df.get(token)||0)+1);
  const avgLength=[...docs.values()].reduce((sum,d)=>sum+d.terms.length,0)/records.length;
  const out=new Map(),incoming=new Map();for(const r of records){out.set(r.id,[]);incoming.set(r.id,[])}
  for(const r of records)for(const edge of r.links){if(byId.has(edge.target)){out.get(r.id).push(edge);incoming.get(edge.target).push({source:r.id,type:edge.type})}}
  const select=(value,filter)=>filter==null||(Array.isArray(filter)?filter:[filter]).some(f=>normalize(value).includes(normalize(f)));
  const cite=id=>{const r=byId.get(id),l=locations.get(id);return r?clone({id:r.id,label:r.label,kind:r.kind,claim_ceiling:r.claim_ceiling,evidence_class:r.evidence_class,record_sha256:l.record_sha256,canonical_json_pointer:r.origin.json_pointer,canonical_payload_sha256:manifest.canonical_payload_sha256,edition_source_commit:manifest.edition_source_commit,artifact_source_commit:null,artifact_source_commit_note:'Resolve the repository/deployment receipt independently; this generated file cannot authenticate its own Git commit.',html_line:l.html_line,html_anchor:l.html_anchor,source_ids:r.links.filter(x=>x.type==='cites_source').map(x=>x.target)}):null};
  function search(query={},options={}){
    const spec=typeof query==='string'?{q:query,...options}:{...query};
    const q=String(spec.q||''),phrases=[...q.matchAll(/"([^"]+)"/g)].map(x=>normalize(x[1]));
    const terms=tokens(q.replace(/"[^"]+"/g,'')),filters=spec.filter||{},exclude=tokens(spec.exclude||'');
    const hits=[];
    for(const r of records){
      if(!select(r.kind,filters.kind)||!select(r.family,filters.family)||!select(r.status,filters.status)||!select(r.evidence_class,filters.evidence_class))continue;
      if(filters.source&&!(Array.isArray(filters.source)?filters.source:[filters.source]).some(s=>r.source_keys.includes(String(s).replace(/^SRC-/,''))))continue;
      const d=docs.get(r.id),text=normalize(r.id)+' '+d.title+' '+d.aliases+' '+d.body;
      if(phrases.some(p=>!text.includes(p))||exclude.some(t=>text.includes(t)))continue;
      const matched=terms.filter(t=>text.includes(t));if(terms.length&&(spec.match==='any'?!matched.length:matched.length!==terms.length))continue;
      let score=0;const reasons=[];
      if(q&&normalize(r.id)===normalize(q)){score+=1000;reasons.push('exact_id')}
      if(q&&d.title===normalize(q)){score+=200;reasons.push('exact_title')}
      for(const t of matched){const tf=d.terms.filter(x=>x===t).length,idf=Math.log(1+(records.length-(df.get(t)||0)+.5)/((df.get(t)||0)+.5));score+=idf*(tf*2.2/(tf+1.2*(.25+.75*d.terms.length/avgLength))||.1);if(d.title.includes(t)){score+=15;reasons.push('title:'+t)}if(d.aliases.includes(t)){score+=8;reasons.push('alias:'+t)}}
      if(phrases.length){score+=phrases.length*20;reasons.push('required_phrase')}
      hits.push({id:r.id,label:r.label,kind:r.kind,family:r.family,status:r.status,evidence_class:r.evidence_class,score:Number(score.toFixed(5)),matched,why:[...new Set(reasons)],claim_ceiling:r.claim_ceiling,citation:cite(r.id)});
    }
    hits.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));const offset=Math.max(0,Number(spec.offset)||0),limit=Math.min(100,Math.max(1,Number(spec.limit)||10));
    return clone({query:spec,total:hits.length,offset,limit,has_more:offset+limit<hits.length,hits:hits.slice(offset,offset+limit),ranking:'Deterministic weighted lexical/BM25 ranking; score measures retrieval relevance, never evidence quality.'});
  }
  function neighbors(id,{direction='both',type=null}={}){if(!byId.has(id))return null;return clone({id,outgoing:direction==='incoming'?[]:out.get(id).filter(e=>!type||e.type===type),incoming:direction==='outgoing'?[]:incoming.get(id).filter(e=>!type||e.type===type),meaning:'Edges preserve explicit citations/references and lexical cross-references; a path supplies no new theorem or empirical authority.'})}
  function route(from,to,{maxDepth=4,types=null}={}){
    if(!byId.has(from)||!byId.has(to))return {found:false,reason:'unknown_record'};
    const queue=[{id:from,path:[]}],seen=new Set([from]);
    while(queue.length){const item=queue.shift();if(item.id===to)return clone({found:true,from,to,path:item.path,meaning:'Bibliographic/reference path, not a proof of scientific implication.'});if(item.path.length>=Math.min(8,maxDepth))continue;for(const e of out.get(item.id)){if(types&&!types.includes(e.type)||seen.has(e.target))continue;seen.add(e.target);queue.push({id:e.target,path:[...item.path,{source:item.id,...e}]})}}
    return {found:false,from,to,reason:'no_declared_path_within_bound'};
  }
  function context(id,{maxRecords=12}={}){const r=byId.get(id);if(!r)return null;const ids=[id,...r.links.filter(e=>e.type==='cites_source').map(e=>e.target),...r.links.map(e=>e.target)];return clone({root:id,records:[...new Set(ids)].slice(0,Math.min(100,maxRecords)).map(k=>({record:byId.get(k),citation:cite(k)})),truncated:new Set(ids).size>Math.min(100,maxRecords),missing_evidence:'Consult each original record and source note; absence of a field supplies no positive evidence.'})}
  async function verify(){const issues=[];for(const r of records){const bytes=new TextEncoder().encode(JSON.stringify(r).replace(/</g,'\\u003c'));const digest=await crypto.subtle.digest('SHA-256',bytes);const hex=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');if(hex!==locations.get(r.id).record_sha256)issues.push(r.id)}return {verified:records.length-issues.length,total:records.length,mismatches:issues,scope:'Integrity of generated retrieval records only (single-line JSON with less-than characters escaped, excluding the line terminator); source origin, scientific truth and current deployment identity require their own evidence.'}}
  async function prepareImport(input){const text=typeof input==='string'?input:JSON.stringify(input,null,2),report=window.TD613Intake.inspect(text,intakeSchema);if(report.record&&byId.has(report.record.record_id)){report.errors.push('Record ID already exists; revisions require a fresh ID.');report.valid=false}if(!report.valid)return clone(report);const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return clone({schema:'td613.research-proposal/v1',disposition:'PROPOSED',input_sha256:[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join(''),original_json:text,record:report.record,authority:report.authority,publication_eligible:report.publication_eligible})}
  window.TD613Reference=Object.freeze({schema:manifest.schema,manifest:()=>clone(manifest),search,get:id=>byId.has(id)?clone(byId.get(id)):null,cite,neighbors,route,context,citedBy:id=>clone(incoming.get(id)||[]),facets:()=>clone(manifest.facets),verify,prepareImport,intakeSchema:()=>clone(intakeSchema),export:()=>clone({manifest,directory,records,intakeSchema})});
})();


// TD613 unified research view adapter. Preserves 843 canonical records and
// presents separately typed accession records in the original reader sections.
// Research status and source provenance are retained from the machine record.
(() => {
 'use strict';
 if (!window.TD613Reference || typeof BY_ID==='undefined' || typeof SEARCH_RECORDS==='undefined') return;
 const rows=window.TD613Reference.export().records.filter(r=>r.id.startsWith('R-')||r.id.startsWith('ASSESS-')||r.id.startsWith('PROGRAM-'));
 for(const r of rows){
  if(BY_ID.has(r.id))continue;
  const research=r.record||{};
  const title=r.label||research.title||r.id;
  const limit=r.claim_ceiling||'Consult the source record for limitations.';
  const sources=Array.isArray(research.sources)?research.sources.filter(v=>typeof v==='string'):[];
  if(r.kind==='glossary'){
   const term={id:r.id,term:title,category:r.family,status:r.status||'SOURCE_STAGED',description:[research.body,limit].filter(Boolean).join('\\n\\n'),sources};
   GLOSSARY_LIST.push(term);
   BY_ID.set(r.id,{type:'glossary',item:term});
  }else{
   const item={id:r.id,title,evidence_class:r.evidence_class,status:r.status,
    finding:research.body||research.description||'Research inventory and status note; original source record remains authoritative.',
    description:research.body||research.description||'Research inventory and status note.',
    ceiling:limit,sources};
   LABS_LIST.push(item);
   BY_ID.set(r.id,{type:'labs',item});
  }
  const e=BY_ID.get(r.id);
  SEARCH_RECORDS.push({id:r.id,...e,hay:JSON.stringify({record:r.record,supplement:r.supplement,label:r.label}).normalize('NFKC').toLowerCase()});
 }
 const lexiconStat=document.querySelector('.stat-btn[data-view="lexicon"] .stat-value');
 if(lexiconStat)lexiconStat.textContent=String(GLOSSARY_LIST.length);
 const lexIntro=document.querySelector('#view-lexicon .intro');
 if(lexIntro)lexIntro.textContent=GLOSSARY_LIST.length+' annotated concepts and source-grounded accessions. Each finding retains its scope, status and original sources.';
 const labsTab=document.querySelector('[data-evidence-kind="labs"]');
 if(labsTab)labsTab.textContent='Research records '+LABS_LIST.length;
 const evidenceCaption=document.querySelector('#view-evidence .intro');
 if(evidenceCaption)evidenceCaption.textContent='Inspect research crosswalks, laboratory results, individually indexed proposal assessments, accession notes and unresolved questions. The source-level qualifications remain intact.';
 if(typeof UI!=='undefined'){
  if(UI.view==='lexicon'&&typeof renderLexicon==='function')renderLexicon();
  if(UI.view==='evidence'&&typeof renderEvidence==='function')renderEvidence();
 }
})();
