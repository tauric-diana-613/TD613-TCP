/**
 * PEFB-20261103 / PE05 · Two physically independent EMPTY prospective products.
 * Source-free fixture-only harness. Neither side may admit real sources or Flight.
 * Wrapped candidate preserves existing E3B91 native-method closure and security policy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { openCandidateProduct, ATELIER, ENCYCLOPEDIA } from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B8/product-entry-v01.mjs';

const fail = code => { throw Object.assign(new Error(code), { code }); };
const need = (p,code) => { if (!p) fail(code); };
const allow = new Set(['status','describeFixtures','inspectAdmissionReadiness','stageSyntheticFixture','execute','readback','withdraw','threeOriginTrace']);
function safeDir(value) {
  need(typeof value==='string'&&path.isAbsolute(value),'PE05_ABSOLUTE_DIRECTORY');
  need(fs.existsSync(value)&&fs.lstatSync(value).isDirectory()&&!fs.lstatSync(value).isSymbolicLink()&&fs.realpathSync(value)===value,'PE05_REAL_DIRECTORY_REQUIRED');
  return value;
}
function safeRequest(q) {
  need(q!==null&&typeof q==='object'&&!Array.isArray(q)&&Object.getPrototypeOf(q)===Object.prototype,'PE05_PLAIN_REQUEST_REQUIRED');
  const fields=Object.getOwnPropertyDescriptors(q);
  for(const [k,d] of Object.entries(fields))need('value' in d&&!['__proto__','constructor','prototype'].includes(k),'PE05_ACCESSOR_REFUSED');
  need('action' in fields&&typeof fields.action.value==='string'&&allow.has(fields.action.value),'PE05_ACTION_DENIED');
  return q;
}
function wrapped(api,product) {
  return Object.freeze({
    product_id:product,
    root_receipt:api.root_receipt,
    async request(input) {
      const q=safeRequest(input);
      const action=q.action;
      if(['stageSyntheticFixture','execute','readback','withdraw','threeOriginTrace'].includes(action))
        need(q.product_id===product,'PE05_CROSS_PRODUCT_REQUEST_REFUSED');
      need(product===ATELIER||action!=='threeOriginTrace','PE05_ENCYCLOPEDIA_TRACE_REFUSED');
      const result=await api.request(q);
      if(action==='describeFixtures')return result.filter(x=>x.product_id===product);
      if(action==='status')return {
        product_id:product,
        instance_id:result.constitution.instance_id,
        mode:result.constitution.mode,
        historical_product:false,
        state:'EMPTY_OR_SYNTHETIC_ONLY',
        real_sources_admitted:0,
        source_authorized:false,
        native_corpus_verified:false,
        scientifically_validated:false,
        original_connector:'HELD_ORIGINAL_PRODUCT_ENTRY_ABSENT',
        candidate_status:result,
      };
      return result;
    }
  });
}
/** Workspaces are supplied locally by the operator. Creation requires EMPTY dirs.
 * Reopen requires BOTH independently retained root receipts.
 */
export async function openTwinProducts({atelierWorkspace,encyclopediaWorkspace,create=false,rootReceipts}={}) {
  const a=safeDir(atelierWorkspace),e=safeDir(encyclopediaWorkspace);
  need(a!==e&&!a.startsWith(e+path.sep)&&!e.startsWith(a+path.sep),'PE05_INDEPENDENT_WORKSPACES_REQUIRED');
  if(create){
    need(fs.readdirSync(a).length===0&&fs.readdirSync(e).length===0,'PE05_FRESH_WORKSPACES_REQUIRED');
    need(rootReceipts===undefined,'PE05_CREATION_NO_OLD_RECEIPTS');
  }else need(rootReceipts&&typeof rootReceipts.atelier==='string'&&typeof rootReceipts.encyclopedia==='string','PE05_BOTH_INDEPENDENT_RECEIPTS_REQUIRED');
  const atelier=await openCandidateProduct({workspace:a,mode:'PRODUCT_RECIPIENT',create, ...(!create?{root_receipt:rootReceipts.atelier}:{})});
  const encyclopedia=await openCandidateProduct({workspace:e,mode:'PRODUCT_RECIPIENT',create, ...(!create?{root_receipt:rootReceipts.encyclopedia}:{})});
  const ta=wrapped(atelier,ATELIER),te=wrapped(encyclopedia,ENCYCLOPEDIA);
  const [as,es]=await Promise.all([ta.request({action:'status'}),te.request({action:'status'})]);
  need(as.instance_id!==es.instance_id&&as.real_sources_admitted===0&&es.real_sources_admitted===0,'PE05_PRODUCT_IDENTITY_COLLISION');
  return Object.freeze({atelier:ta,encyclopedia:te,rootReceipts:Object.freeze({atelier:ta.root_receipt,encyclopedia:te.root_receipt}),
    claim_ceiling:'TWO_DISTINCT_SYNTHETIC_INSTANCES_NOT_HISTORICAL_CONNECTOR_NOT_REAL_SOURCE'});
}
