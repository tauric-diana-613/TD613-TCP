import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const record=JSON.parse(readFileSync(new URL('packages/rulefield/rulefields/research/BASELINE_PR1722_EXACT_BLOB_CUSTODY.json',root),'utf8'));
test('successor proves 99 inherited Living Rulefield blobs survived unchanged',()=>{
 assert.equal(record.schema,'td613.rulefield.succession.pre-reconciliation-custody/v1');
 assert.equal(record.baseCommit,'12dcc38adea8aeb04649900463566d67546cf025');
 assert.equal(record.records.length,99);
 assert.equal(record.originalWolframianBlobs,16);
 assert.equal(record.missing,0);assert.equal(record.modified,0);
 for(const item of record.records){
   const path=new URL(item.path,root);assert.equal(existsSync(path),true,item.path);
   const content=readFileSync(path);
   const blob=createHash('sha1').update(Buffer.from('blob '+content.length+String.fromCharCode(0))).update(content).digest('hex');
   assert.equal(blob,item.gitBlobSha1,'historical byte mismatch '+item.path);
 }
});
test('operator-scientific holds are a baseline constraint rather than a signature',()=>{
 assert.equal(record.protectedExperimentB,'HELD');
 assert.equal(record.humanScientificClosure,'RESERVED');
 assert.match(record.interpretation,/NEITHER_MAIN_MERGE NOR OPERATOR_CANONIZATION/);
});
