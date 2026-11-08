/**
 * 𝌋 Vixen ↔ Universal Encyclopedia · Source-bound read-only reference membrane.
 * Not the Universal Atelier SQLite receiver and never a postflight admission path.
 * Operator-facing route: /encyclopedia/vix-cyb.html
 * No external providers, POST, private sources, e-commerce, or production mutation.
 */
export const MEMBRANE_SCHEMA = 'td613.vixen.universal-reference-membrane/v1';
export const REFERENCE_COUNTS = Object.freeze({records:1141,edges:2131,edition:'1.4'});
const VALID_ID = /^[A-Z][A-Z0-9]*-[A-Z0-9][A-Z0-9_-]{0,95}$/;
const MAX_INDEX_BYTES = 2_000_000;
const MAX_RECORD_BYTES = 250_000;
const READABLE_REFUSALS = Object.freeze({
  FILE_SCHEME_NOT_BACKEND_BOUND:'This page cannot verify its separately served reference estate from a local file URL.',
  REFERENCE_NETWORK_UNAVAILABLE:'The independently hosted Universal reference collection did not answer.',
  REFERENCE_SCHEMA_MISMATCH:'The returned reference edition is outside the declared compatibility contract.',
  REFERENCE_CENSUS_MISMATCH:'The source index did not satisfy its declared census and identity uniqueness.',
  REFERENCE_NOT_LOADED:'A deliberate opening of the reference estate has not yet been completed.',
  RECORD_NOT_IN_EDITION:'This identifier does not occur in the selected Universal reference edition.',
  RECORD_PATH_OUTSIDE_ESTATE:'A source locator would cross the reference-estate boundary.',
  RECORD_DIGEST_MISMATCH:'Retrieved source bytes differ from the recorded SHA-256.',
  RECORD_SCHEMA_MISMATCH:'The verified bytes are not a record of the requested identity.',
  WEBCRYPTO_UNAVAILABLE:'No independent browser SHA-256 verifier was available.',
  BOUNDARY_REFUSAL:'The request would cross into an unauthorised origin or method.'
});
export class BridgeHold extends Error{
  constructor(code, detail=''){super(READABLE_REFUSALS[code]||detail||code);this.name='BridgeHold';this.code=code;this.detail=detail}
}
export function isReferenceId(id){return typeof id==='string'&&VALID_ID.test(id)}
export function normalizeSourceQuery(value){return String(value??'').normalize('NFKC').trim().slice(0,200)}
function safeURL(url, expectedOrigin){
  let result;try{result=new URL(url)}catch(_){throw new BridgeHold('BOUNDARY_REFUSAL','INVALID_URL')}
  if(result.origin!==expectedOrigin || !['http:','https:'].includes(result.protocol))throw new BridgeHold('BOUNDARY_REFUSAL','CROSS_ORIGIN_OR_SCHEME');
  return result;
}
async function boundedFetch(fetcher,url,expectedOrigin,maxBytes){
  const u=safeURL(url,expectedOrigin);
  let response;
  try{response=await fetcher(u.href,{method:'GET',credentials:'omit',cache:'no-store',redirect:'error',mode:'same-origin'})}
  catch(e){throw new BridgeHold('REFERENCE_NETWORK_UNAVAILABLE',String(e&&e.message||e))}
  if(!response||!response.ok)throw new BridgeHold('REFERENCE_NETWORK_UNAVAILABLE','HTTP_'+(response?.status??'UNAVAILABLE'));
  if(response.url&&safeURL(response.url,expectedOrigin).href!==u.href)throw new BridgeHold('BOUNDARY_REFUSAL','REDIRECTED_URL');
  const length=Number(response.headers?.get?.('content-length')||0);
  if(length>maxBytes)throw new BridgeHold('BOUNDARY_REFUSAL','SIZE_LIMIT');
  let raw;try{raw=await response.text()}catch(_){throw new BridgeHold('REFERENCE_NETWORK_UNAVAILABLE','BODY_READ_FAILURE')}
  const bytes=new TextEncoder().encode(raw);
  if(bytes.byteLength>maxBytes)throw new BridgeHold('BOUNDARY_REFUSAL','BODY_SIZE_LIMIT');
  return {raw,bytes,url:u.href};
}
function decodeJson(text,code){
  try{return JSON.parse(text)}catch(_){throw new BridgeHold(code,'INVALID_JSON')}
}
function toHex(buffer){return Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('')}
export function createVixenReferenceMembrane({
  baseURL = new URL('../reference/',import.meta.url).href,
  fetcher = globalThis.fetch?.bind(globalThis),
  cryptoProvider = globalThis.crypto
}={}){
  const root=new URL(baseURL);
  if(!['http:','https:'].includes(root.protocol)){return Object.freeze({status:()=>({state:'HELD',reason:'FILE_SCHEME_NOT_BACKEND_BOUND'}),open:async()=>{throw new BridgeHold('FILE_SCHEME_NOT_BACKEND_BOUND')}})}
  if(typeof fetcher!=='function')throw new BridgeHold('REFERENCE_NETWORK_UNAVAILABLE','FETCH_NOT_AVAILABLE');
  const origin=root.origin;
  const base=()=>safeURL(root.href,origin);
  const state={status:'UNOPENED',manifest:null,dir:null,graph:null,byId:null,events:[],counter:0,error:null};
  const stamp=(action,information={})=>{const event=Object.freeze({sequence:++state.counter,estate:'VIXEN_RESEARCH_INQUIRY',action,...information});state.events.push(event);return event};
  const status=()=>Object.freeze({state:state.status,edition:state.manifest?.edition_version||null,records:state.dir?.length||0,edges:state.graph?.edges?.length||0,error:state.error,cryptographic_index_authentication:'NOT_CLAIMED',authority:'READ_ONLY'});
  async function open(){
    if(state.status==='CENSUS_MATCHED')return status();
    state.status='CHECKING';state.error=null;stamp('OPEN_REFERENCE_REQUESTED');
    try{
      const paths=['manifest.json','directory.json','graph.json'];
      const response=await Promise.all(paths.map(p=>boundedFetch(fetcher,new URL(p,base()).href,origin,MAX_INDEX_BYTES)));
      const [manifest,dir,graph]=response.map(x=>decodeJson(x.raw,'REFERENCE_SCHEMA_MISMATCH'));
      if(manifest?.schema!=='td613.encyclopedia.reference/v1'||String(manifest.edition_version)!==REFERENCE_COUNTS.edition)throw new BridgeHold('REFERENCE_SCHEMA_MISMATCH');
      if(manifest.record_count!==REFERENCE_COUNTS.records||!Array.isArray(dir)||dir.length!==REFERENCE_COUNTS.records||!Array.isArray(graph?.edges)||graph.edges.length!==REFERENCE_COUNTS.edges)throw new BridgeHold('REFERENCE_CENSUS_MISMATCH');
      const byId=new Map();
      for(const row of dir){
        if(!isReferenceId(row?.id)||byId.has(row.id)||typeof row.label!=='string'||typeof row.record_sha256!=='string'||!/^[a-f0-9]{64}$/.test(row.record_sha256))throw new BridgeHold('REFERENCE_CENSUS_MISMATCH','INVALID_INDEX_ENTRY');
        const expected='reference/records/'+row.id+'.json';
        if(row.record_path!==expected)throw new BridgeHold('RECORD_PATH_OUTSIDE_ESTATE',row.id);
        byId.set(row.id,Object.freeze({...row}))
      }
      state.manifest=manifest;state.dir=dir.map(x=>Object.freeze({...x}));state.graph=graph;state.byId=byId;
      state.status='CENSUS_MATCHED';stamp('REFERENCE_CENSUS_MATCHED',{records:dir.length,edges:graph.edges.length,edition:manifest.edition_version});
      return status();
    }catch(e){const code=e instanceof BridgeHold?e.code:'REFERENCE_NETWORK_UNAVAILABLE';state.status='HELD';state.error=code;stamp('REFERENCE_HELD',{reason:code});throw e}
  }
  function mustOpen(){if(state.status!=='CENSUS_MATCHED')throw new BridgeHold('REFERENCE_NOT_LOADED')}
  function search(query,{limit=24,kind='ALL'}={}){
    mustOpen();const q=normalizeSourceQuery(query).toLocaleLowerCase();const size=Math.min(48,Math.max(1,Math.floor(Number(limit)||24)));
    const results=[];
    if(!q)return [];
    for(const row of state.dir){
      if(kind!=='ALL'&&row.kind!==kind)continue;
      const hay=[row.id,row.label,row.family,...(Array.isArray(row.aliases)?row.aliases:[])].join(' ').toLocaleLowerCase();
      if(hay.includes(q))results.push(Object.freeze({estate:'UNIVERSAL_REFERENCE',id:row.id,label:row.label,kind:row.kind,status:row.status,record_sha256:row.record_sha256,claim_role:'SEARCH_MATCH_ONLY_NOT_ENTAILMENT'}));
      if(results.length>=size)break;
    }
    stamp('SEARCH_REFERENCE',{query:q,returned:results.length,classification:'LEXICAL_MATCH_ONLY'});
    return results;
  }
  function related(id,{limit=24}={}){
    mustOpen();if(!isReferenceId(id)||!state.byId.has(id))throw new BridgeHold('RECORD_NOT_IN_EDITION');
    const count=Math.min(48,Math.max(1,Math.floor(Number(limit)||24)));
    const edges=state.graph.edges.filter(e=>e.source===id||e.target===id).slice(0,count).map(e=>Object.freeze({source:e.source,target:e.target,type:e.type,relation_warrant:'RECORDED_GRAPH_EDGE_NOT_CAUSAL_PROOF'}));
    stamp('TRACE_REFERENCE_RELATIONS',{id,count:edges.length});
    return edges;
  }
  async function getRecord(id){
    mustOpen();if(!isReferenceId(id)||!state.byId.has(id))throw new BridgeHold('RECORD_NOT_IN_EDITION',String(id));
    const row=state.byId.get(id);
    const u=safeURL(new URL('../'+row.record_path,base()).href,origin);
    // Exact record path is checked above; no search user text can become a file path.
    const payload=await boundedFetch(fetcher,u.href,origin,MAX_RECORD_BYTES);
    if(!cryptoProvider?.subtle?.digest)throw new BridgeHold('WEBCRYPTO_UNAVAILABLE');
    const digest=toHex(await cryptoProvider.subtle.digest('SHA-256',payload.bytes));
    if(digest!==row.record_sha256){stamp('SOURCE_DIGEST_REFUSED',{id,expected:row.record_sha256,actual:digest});throw new BridgeHold('RECORD_DIGEST_MISMATCH')}
    const record=decodeJson(payload.raw,'RECORD_SCHEMA_MISMATCH');
    if(record?.id!==id||record?.kind!==row.kind||record?.label!==row.label){stamp('RECORD_IDENTITY_REFUSED',{id});throw new BridgeHold('RECORD_SCHEMA_MISMATCH')}
    const witness=Object.freeze({estate:'UNIVERSAL_REFERENCE',id,record,source_path:row.record_path,record_sha256:digest,verified_at_interaction:true,warrant:'SOURCE_BYTES_VERIFIED_NOT_CLAIM_ENTAILMENT',authorization:'READ_ONLY'});
    stamp('SOURCE_WITNESSED',{id,record_sha256:digest,source_path:row.record_path});
    return witness;
  }
  const rest=()=>{stamp('OPERATOR_REST');return status()};
  const history=()=>Object.freeze(state.events.slice());
  return Object.freeze({schema:MEMBRANE_SCHEMA,status,open,search,related,getRecord,rest,history});
}
