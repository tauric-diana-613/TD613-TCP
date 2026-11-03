/** Independent JS translation of the pinned SRC lexical router. Synthetic replay only. */
import { createHash } from 'node:crypto';
const hash = value => createHash('sha256').update(value).digest('hex');
const stop = new Set(['a','an','and','as','at','by','for','from','in','into','of','on','or','sr','the','to','under','with']);
const whitespace = /[\t-\r\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+/gu;
const trimSpace = value => value.replace(/^[\t-\r\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+|[\t-\r\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+$/gu,'');
export function normalizeSpace(value) { return trimSpace(value.normalize('NFKC').replace(/[\u2011\u2013\u2014]/g,'-').replace(whitespace,' ')); }
// NFKC expands ligatures. These remaining Python casefold expansions introduce
// ASCII letters into the native ASCII-only key; source bytes remain untouched.
export function normalizeKey(value) { return normalizeSpace(value).replace(/[ßẞǰẖẗẘẙ]/g,c=>({'ß':'ss','ẞ':'ss','ǰ':'j\u030c','ẖ':'h\u0331','ẗ':'t\u0308','ẘ':'w\u030a','ẙ':'y\u030a'}[c])).toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim(); }
const words = value => new Set(normalizeKey(value).split(' ').filter(word => word.length>1&&!stop.has(word)));
const cpLength = value => Array.from(value).length;
const sid = (prefix,...parts) => prefix+':'+hash(parts.join('\x1f')).slice(0,24);
const compare = (a,b) => a<b?-1:a>b?1:0;
function time(value) {
  if(!value)return null;
  const m=/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,6}))?)?(Z|[+-]\d{2}:\d{2})?)?$/.exec(value);
  if(!m)return null;
  const [year,month,day]=m.slice(1,4).map(Number);
  if(year<1||month<1||month>12||day<1||day>new Date(Date.UTC(year,month,0)).getUTCDate()||Number(m[4]??0)>23||Number(m[5]??0)>59||Number(m[6]??0)>59)return null;
  const whole=value.replace(/\.\d{1,6}(?=Z|[+-]|$)/,'');
  const parsed=Date.parse(m[4]?(m[8]?whole:whole+'Z'):whole+'T00:00:00Z');
  return Number.isFinite(parsed)?BigInt(parsed)*1000n+BigInt((m[7]??'').padEnd(6,'0')):null;
}
function stripFrontmatter(text) {
  if(!text.startsWith('---'))return text;
  const marker=text.indexOf('\n---',3);
  return marker<0?text:text.slice(marker+4).replace(/^\n+/,'');
}
export function extractExploreTokens(document) {
  const found=[];
  const pattern=/(?<![\p{L}\p{N}_])Explore +([^.!?]{2,96})\./giu;
  for(const match of document.normalized_body.matchAll(pattern)) {
    const token=normalizeSpace(match[1]).replace(/^[ -:\t]+|[ -:\t]+$/g,'').replace(/\s+(?:[IVXLCDMİı]+|\d+)(?:\.\d+)*$/iu,'');
    if(cpLength(token)>=2&&cpLength(token)<=80)found.push(token);
  }
  return found;
}
export function signatureFromDocument(document) {
  const prefix=Array.from(document.normalized_body).slice(0,2200).join('');
  const patterns=[/(?:Author\s*:\s*)?(?<![\p{L}\p{N}_])SR\s*-\s*(.{3,180}?)(?=\s+(?:Preface|Abstract|Introduction|Executive Summary|Chapter\s+[IVXLCDMİı\d]+))/iu,/(?:Author\s*:\s*)?(?<![\p{L}\p{N}_])SR\s*-\s*([^.!?]{3,180}[.!?])/iu];
  for(const pattern of patterns) {
    const match=pattern.exec(prefix);
    if(match){const phrase=normalizeSpace(match[1]).replace(/[ .]+$/,'');if(cpLength(phrase)>=3&&cpLength(phrase)<=180)return phrase;}
  }
  return null;
}
export function lexicalCandidates(token,source,documents) {
  const key=normalizeKey(token),tokenWords=words(token),sourceTime=time(source.created)??time(source.publication_date),candidates=[];
  if(!key)return candidates;
  for(const target of documents) {
    if(target.entity_id===source.entity_id)continue;
    const titleKey=normalizeKey(target.title),titleWords=words(target.title);
    const exact=titleKey===key||titleKey.startsWith(key+' ')||(' '+titleKey+' ').includes(' '+key+' ');
    const coverage=tokenWords.size?[...tokenWords].filter(word=>titleWords.has(word)).length/tokenWords.size:0;
    if(!exact&&!(tokenWords.size>=2&&coverage>=0.66))continue;
    const targetTime=time(target.created)??time(target.publication_date),known=sourceTime!==null&&targetTime!==null;
    candidates.push({target_id:target.entity_id,target_title:target.title,target_created:target.created,
      match_kind:exact?'EXACT_OR_TITLE_SUBSTRING':'LEXICAL_OVERLAP_ONLY',token_word_coverage:Number(coverage.toFixed(4)),
      temporal_relation:known?(targetTime>sourceTime?'LATER':'PREEXISTING_OR_CONTEMPORANEOUS'):'TIME_UNRESOLVED',
      latency_seconds:known?Number((targetTime-sourceTime)/1000000n):null});
  }
  const rank={EXACT_OR_TITLE_SUBSTRING:0,LEXICAL_OVERLAP_ONLY:1};
  candidates.sort((a,b)=>rank[a.match_kind]-rank[b.match_kind]||b.token_word_coverage-a.token_word_coverage||compare(a.target_created||'9999',b.target_created||'9999')||compare(a.target_id,b.target_id));
  return candidates.slice(0,8);
}
export function classifyExplore(candidates) {
  for(const [kind,relation,status] of [
    ['EXACT_OR_TITLE_SUBSTRING','LATER','LATER_EXACT_RESOLUTION_CANDIDATE'],
    ['EXACT_OR_TITLE_SUBSTRING','PREEXISTING_OR_CONTEMPORANEOUS','PREEXISTING_DESTINATION_CANDIDATE'],
    ['LEXICAL_OVERLAP_ONLY','LATER','LATER_LEXICAL_CANDIDATE_HUMAN_REVIEW_REQUIRED'],
    ['LEXICAL_OVERLAP_ONLY','PREEXISTING_OR_CONTEMPORANEOUS','PREEXISTING_LEXICAL_CANDIDATE_HUMAN_REVIEW_REQUIRED']]) {
    if(candidates.some(c=>c.match_kind===kind&&c.temporal_relation===relation))return status;
  }
  return 'UNRESOLVED_MACHINE';
}
export function sourceNativeRouting(input) {
  if(input?.synthetic_only!==true||input.evidence_class!=='SYNTHETIC_REPLAY_ONLY'||!Array.isArray(input.documents))throw Error('SYNTHETIC_REPLAY_CONTRACT_REQUIRED');
  const identities=new Map();
  const documents=input.documents.map(doc=>{
    if(!/^zenodo:\d+$/.test(doc.entity_id)||identities.has(doc.entity_id)||!Buffer.isBuffer(doc.body_bytes)||!Buffer.isBuffer(doc.metadata_bytes)||doc.rights!=='INVENTED_SOURCE_FREE'||doc.body_sha256!==hash(doc.body_bytes)||doc.metadata_sha256!==hash(doc.metadata_bytes))throw Error('SOURCE_COORDINATE_OR_INTEGRITY_REFUSED');
    if(doc.graph && doc.graph!=='READER_CANDIDATE')throw Error('UNSUPPORTED_GRAPH_PROMOTION');
    const recordId=doc.entity_id.slice(7),stem='03-DERIVATIVES/text/zenodo/zenodo-'+recordId;
    if(doc.body_path!==stem+'-file-0.md'||doc.metadata_path!==stem+'-metadata.md')throw Error('SOURCE_PATH_IDENTITY_REFUSED');
    const body=stripFrontmatter(doc.body_bytes.toString('utf8'));
    let meta={};try{const text=stripFrontmatter(doc.metadata_bytes.toString('utf8'));const start=text.indexOf('{');if(start>=0)meta=JSON.parse(text.slice(start));}catch{/* Native invalid JSON produces empty metadata. */}
    const row={record_id:recordId,entity_id:doc.entity_id,title:String(meta.metadata?.title||doc.entity_id),created:meta.created??null,publication_date:meta.metadata?.publication_date??null,body_path:doc.body_path,metadata_path:doc.metadata_path,body,normalized_body:normalizeSpace(body)};
    identities.set(row.entity_id,{source_id:row.entity_id,body_path:doc.body_path,body_sha256:doc.body_sha256,metadata_path:doc.metadata_path,metadata_sha256:doc.metadata_sha256});return row;
  });
  documents.sort((a,b)=>compare(a.body_path,b.body_path));
  const observations=[],signatureGroups=new Map();
  for(const document of documents) {
    for(const [i,token] of extractExploreTokens(document).entries()) {
      const candidates=lexicalCandidates(token,document,documents),status=classifyExplore(candidates);
      observations.push({explore_observation_id:sid('src-prg-explore',document.entity_id,i+1,normalizeKey(token)),source_id:document.entity_id,source_title:document.title,source_created:document.created,raw_token:token,normalized_token:normalizeKey(token),machine_candidates:candidates,observation_status:status,human_disposition_required:status!=='UNRESOLVED_MACHINE',interpretive_limit:'Lexical/title candidates only; no semantic identity, causation, intentional puzzle or source promise.',witnesses:[document.entity_id,...candidates.map(c=>c.target_id)].map(id=>identities.get(id))});
    }
    const phrase=signatureFromDocument(document);
    if(phrase){const key=normalizeKey(phrase);if(!signatureGroups.has(key))signatureGroups.set(key,[]);signatureGroups.get(key).push({source_id:document.entity_id,source_title:document.title,source_created:document.created,raw_phrase:phrase,body_path:document.body_path});}
  }
  observations.sort((a,b)=>compare(a.source_created||'',b.source_created||'')||compare(a.source_id,b.source_id)||compare(a.raw_token,b.raw_token));
  const signatures=[...signatureGroups].sort(([a],[b])=>compare(a,b)).map(([key,members])=>({signature_observation_id:sid('src-prg-signature',key),normalized_signature:key,manifestation_count:members.length,observation_status:members.length>1?'RECURRING_EXACT_SIGNATURE':'SINGLETON_SIGNATURE',members:members.sort((a,b)=>compare(a.source_created||'',b.source_created||'')||compare(a.source_id,b.source_id)),coordinate_class:'UNRESOLVED',coordinate_inference_permitted:false}));
  return {evidence_class:'SYNTHETIC_REPLAY_ONLY',independent_empirical_replication_count:0,src_corpus_parity:'UNESTABLISHED',grammar_class:'ORIGINAL_SRC_EXPLORE_SENTENCE',source_rights_granted:false,scientific_identity:false,graph_promotion:false,observations,signatures};
}
