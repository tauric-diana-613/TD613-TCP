import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {need,exactKeys,integer} from './errors.mjs';
import {canonical,planDigest,validatePlan,validateRelease,prepareDatasets,measureCapacity,aggregateReport} from './capacity.mjs';
import {requireModelMapping} from './tokenizer.mjs';
import {parseTextZip} from './zip.mjs';
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const OPERATIONS=['READ_DESIGNATED_ARCHIVE','HASH_DESIGNATED_ARCHIVE','DECOMPRESS_TEXT_MEMBERS','TOKENIZE_OFFLINE','WRITE_PRIVATE_CUSTODY','EXPORT_APPROVED_AGGREGATES'];
export function verifySizingDecision({decision,signature,trust,accessor,now=Date.now()}){
 need(decision&&signature&&trust,'FUTURE_OFFLINE_AUTHORIZATION_REQUIRED');
 exactKeys(decision,['schema','purpose','issuer','accessor','archive_realpath','archive_sha256','private_output_realpath','publication_realpath','plan_sha256','max_arm_tokens','accepted_model_tokenizer_profile_sha256','permitted_operations','export','not_before','expires','nonce'],'INVALID_AUTHORIZATION');
 need(decision.schema==='td613.private-sizing-decision/v1'&&decision.purpose==='PRIVATE_OFFLINE_CAPACITY_ONLY'&&decision.accessor===accessor&&typeof accessor==='string','INVALID_AUTHORIZATION');
 integer(decision.max_arm_tokens,1,Number.MAX_SAFE_INTEGER,'INVALID_AUTHORIZATION');validateRelease(decision.export);
 need(['archive_realpath','private_output_realpath','publication_realpath'].every(k=>typeof decision[k]==='string'&&path.isAbsolute(decision[k])),'INVALID_AUTHORIZATION');
 need(typeof decision.issuer==='string'&&Object.hasOwn(trust,decision.issuer),'INVALID_AUTHORIZATION');
 need(Array.isArray(decision.permitted_operations)&&decision.permitted_operations.length===OPERATIONS.length&&OPERATIONS.every(x=>decision.permitted_operations.includes(x)),'INVALID_AUTHORIZATION');
 need(typeof decision.not_before==='string'&&typeof decision.expires==='string'&&Date.parse(decision.not_before)<=now&&Date.parse(decision.expires)>now,'AUTHORIZATION_EXPIRED_OR_NOT_ACTIVE');
 need(/^[A-Za-z0-9_-]{24,96}$/.test(decision.nonce)&&/^[a-f0-9]{64}$/.test(decision.archive_sha256||'')&&/^[a-f0-9]{64}$/.test(decision.plan_sha256||''),'INVALID_AUTHORIZATION');
 let valid=false;try{valid=crypto.verify(null,Buffer.from('TD613_PRIVATE_SIZING_V1\0'+canonical(decision)),trust[decision.issuer],Buffer.from(signature,'base64'));}catch{}
 need(valid,'INVALID_AUTHORIZATION_SIGNATURE');return decision;
}
function outside(target,root){const relative=path.relative(root,target);return relative!==''&&(relative.startsWith('..'+path.sep)||relative==='..'||path.isAbsolute(relative));}
export function runPrivateSizing({archivePath,privateOutputPath,plan,membership,modelProfile,decision,signature,trust,accessor,publicationRoot,now}){
 // All authorization and model checks occur BEFORE any archive/path inspection or archive open.
 const approved=verifySizingDecision({decision,signature,trust,accessor,now});
 need(approved.plan_sha256===planDigest({plan,membership}),'UNAPPROVED_SCOPE_CHANGE');validatePlan(plan,approved.max_arm_tokens);
 const tokenizer=requireModelMapping(modelProfile,approved,plan.model,plan.effort);
 need(plan.output_ceiling<=modelProfile.max_output_tokens&&plan.input_ceiling+plan.output_ceiling<=modelProfile.context_tokens,'MODEL_OR_EFFORT_PROFILE_UNAPPROVED');
 need(path.isAbsolute(archivePath)&&path.isAbsolute(privateOutputPath)&&path.isAbsolute(publicationRoot),'DESIGNATED_LOCATION_REQUIRED');
 let archiveReal,outputReal,publicationReal;
 try{archiveReal=fs.realpathSync(archivePath);outputReal=fs.realpathSync(privateOutputPath);publicationReal=fs.realpathSync(publicationRoot);}catch{need(false,'DESIGNATED_LOCATION_UNAVAILABLE');}
 need(archiveReal===approved.archive_realpath&&outputReal===approved.private_output_realpath&&publicationReal===approved.publication_realpath&&outside(outputReal,publicationReal)&&outside(archiveReal,publicationReal),'DESIGNATED_LOCATION_REFUSED');
 const nonceFile=path.join(outputReal,'sizing-'+approved.nonce+'.json');let privateFd;
 try{privateFd=fs.openSync(nonceFile,'wx',0o600);}catch{need(false,'CUSTODY_NONCE_OR_OUTPUT_REFUSED');}
 const audit={schema:'td613.private-sizing-custody/v1',authorization_sha256:sha(canonical(approved)),phase:'AUTHORIZED_NOT_EXPOSED',plan_sha256:approved.plan_sha256};
 let archiveFd;
 const persist=value=>{const data=Buffer.from(JSON.stringify(value));let written=0;while(written<data.length)written+=fs.writeSync(privateFd,data,written,data.length-written,written);fs.ftruncateSync(privateFd,data.length);fs.fsyncSync(privateFd);};
 try{
  persist(audit);
  const expectedStat=fs.statSync(archiveReal);need(expectedStat.isFile()&&expectedStat.size<=32*1024*1024,'ARCHIVE_LIMIT');
  archiveFd=fs.openSync(archiveReal,'r');const before=fs.fstatSync(archiveFd);need(before.dev===expectedStat.dev&&before.ino===expectedStat.ino&&before.size===expectedStat.size,'ARCHIVE_CHANGED');
  const bytes=Buffer.alloc(before.size);let read=0;while(read<bytes.length){const n=fs.readSync(archiveFd,bytes,read,bytes.length-read,read);need(n>0,'ARCHIVE_CHANGED');read+=n;}
  const after=fs.fstatSync(archiveFd);need(after.size===before.size&&after.mtimeMs===before.mtimeMs&&sha(bytes)===approved.archive_sha256,'ARCHIVE_CHANGED');
  const members=parseTextZip(bytes),datasets=prepareDatasets(members,membership,plan.documents_per_evidence);
  const measurement=measureCapacity({plan,datasets,tokenizer,approvedCeiling:approved.max_arm_tokens});
  const report=aggregateReport(measurement,approved.export);
  const privateReceipt={...audit,phase:'SIZED_OFFLINE',archive_sha256:sha(bytes),archive_order:members.map(m=>({original_index:m.original_index,name:m.name,sha256:sha(m.bytes),bytes:m.bytes.length})),measurement:measurement.private_record,aggregate_sha256:sha(canonical(report)),operator_mapping_accepted:true,provider_mapping_independently_attested:false};
  persist(privateReceipt);return report;
 }catch(error){persist({...audit,phase:'FAILED_HELD',code:typeof error.code==='string'&&error.name==='SizingError'?error.code:'INTERNAL_FAILURE'});throw error;}
 finally{if(archiveFd!==undefined)fs.closeSync(archiveFd);fs.closeSync(privateFd);}
}
