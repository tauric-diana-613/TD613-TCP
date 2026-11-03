/**
 * PEFB-20261103 PE02 · Offline SOURCE-FREE, synthetic-only local index host.
 * No decryption function. No real records. No provider/network/archive ingest.
 * Caller retains receipt OUTSIDE root; no service-backed monotonicity is claimed.
 * POSIX file primitives are demonstrated; Windows reparse/ACL assurances HELD.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {queryLocalPage,verifyReopenedJsonl} from './wendbine-gatee-sourcefree-v02.mjs';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const fail=s=>{throw Object.assign(Error(s),{code:s})};
const yes=(v,s)=>{if(!v)fail(s)};
const norm=s=>{yes(typeof s==='string'&&path.isAbsolute(s),'PE02_ABSOLUTE_ROOT_REQUIRED');
 yes(fs.existsSync(s)&&fs.lstatSync(s).isDirectory()&&!fs.lstatSync(s).isSymbolicLink()&&fs.realpathSync(s)===s,'PE02_ROOT_SYMLINK_OR_MISSING');return s};
const dir=p=>{yes(fs.existsSync(p)&&fs.lstatSync(p).isDirectory()&&!fs.lstatSync(p).isSymbolicLink()&&fs.realpathSync(p)===p,'PE02_SUBDIR_INVALID')};
const regular=p=>{yes(fs.existsSync(p)&&fs.lstatSync(p).isFile()&&!fs.lstatSync(p).isSymbolicLink()&&fs.realpathSync(p)===p,'PE02_FILE_INVALID');return fs.readFileSync(p)};
const write=(p,bytes)=>{const fd=fs.openSync(p,'wx',0o600);try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd)}finally{fs.closeSync(fd)}};
const flushDir=p=>{if(process.platform!=='win32'){const fd=fs.openSync(p,'r');try{fs.fsyncSync(fd)}finally{fs.closeSync(fd)}}};
function rowsValid(rows) {
 yes(Array.isArray(rows)&&rows.length>0&&rows.length<=10000,'PE02_FIXTURE_CARDINALITY');
 const ids=new Set();
 for(const r of rows){
  yes(r&&typeof r==='object'&&r.evidence_class==='SYNTHETIC_LOCAL_ONLY'&&r.rights==='PRIVATE_ONLY'&&
    typeof r.source_id==='string'&&/^FIXTURE-[A-Z0-9_-]{3,60}$/.test(r.source_id)&&!ids.has(r.source_id)&&
    typeof r.selftext==='string'&&typeof r.title==='string'&&typeof r.published_at==='string'&&
    typeof r.capture_id==='string'&&typeof r.snapshotId==='string'&&r.snapshotId.startsWith('SYNTHETIC_')&&
    typeof r.sealId==='string'&&r.sealId.startsWith('SYNTHETIC_')&&
    hash(Buffer.from(r.selftext))===r.body_sha256_utf8&&hash(Buffer.from(r.title))===r.title_sha256_utf8,
    'PE02_REAL_OR_TAMPERED_RECORD_REFUSED');
  ids.add(r.source_id);
 }
 yes(rows.every(r=>r.snapshotId===rows[0].snapshotId&&r.sealId===rows[0].sealId),'PE02_CROSS_EPOCH');
}
export function createSyntheticLocalIndex({root,records}){
 const home=norm(root);yes(fs.readdirSync(home).length===0,'PE02_EXCLUSIVE_EMPTY_ROOT_REQUIRED');
 rowsValid(records);
 const folder=path.join(home,'INDEX');fs.mkdirSync(folder,{mode:0o700});
 const content=Buffer.from(records.map(r=>JSON.stringify(r)).join('\n')+'\n');
 const indexFile=path.join(folder,'records.jsonl');
 write(indexFile,content);
 const info={schema:'td613.pe02.synthetic-offline-index/v1',evidence_class:'SYNTHETIC_LOCAL_ONLY',
  file_sha256:hash(content),file_length:content.length,count:records.length,
  snapshotId:records[0].snapshotId,sealId:records[0].sealId,real_sources_admitted:0};
 const manifest=Buffer.from(JSON.stringify(info)+'\n');write(path.join(folder,'COMMITTED.json'),manifest);
 flushDir(folder);flushDir(home);
 return Object.freeze({root_receipt:hash(manifest),manifest:info,claim_ceiling:'SYNTHETIC_FILE_CUSTODY_ONLY_NO_EXTERNAL_TRUST_ROOT'});
}
export function openSyntheticLocalIndex({root,root_receipt,allowFixture,cursorKey}){
 const home=norm(root),folder=path.join(home,'INDEX');dir(folder);
 yes(fs.readdirSync(home).length===1&&fs.readdirSync(folder).sort().join(',')==='COMMITTED.json,records.jsonl','PE02_UNEXPECTED_OR_INTERRUPTED_STATE');
 const manifestRaw=regular(path.join(folder,'COMMITTED.json'));
 yes(typeof root_receipt==='string'&&root_receipt===hash(manifestRaw),'PE02_INDEPENDENT_RETAINED_ROOT_RECEIPT_REQUIRED');
 let info;try{info=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(manifestRaw))}catch{fail('PE02_MANIFEST_PARSE')}
 yes(info.schema==='td613.pe02.synthetic-offline-index/v1'&&info.evidence_class==='SYNTHETIC_LOCAL_ONLY'&&info.real_sources_admitted===0,'PE02_REAL_SOURCE_CEILING');
 const bytes=regular(path.join(folder,'records.jsonl'));
 const rows=verifyReopenedJsonl({bytes,expectedSha256:info.file_sha256,expectedLength:info.file_length,expectedCount:info.count,
  snapshotId:info.snapshotId,sealId:info.sealId});
 rowsValid(rows);
 yes(typeof allowFixture==='function'&&Buffer.isBuffer(cursorKey)&&cursorKey.length>=16,'PE02_LOCAL_AUTHORIZATION_REQUIRED');
 return Object.freeze({info,query({kind='search',term,limit=50,cursor=null}){
  // Re-read and revalidate against independently retained root on EACH query.
  openSyntheticLocalIndex({root:home,root_receipt,allowFixture,cursorKey,recursionGuard:true});
  return queryLocalPage({records:rows,kind,term,limit,cursor,cursorKey,
   allowSource:r=>Boolean(allowFixture(r.source_id,r))});
 }});
}
