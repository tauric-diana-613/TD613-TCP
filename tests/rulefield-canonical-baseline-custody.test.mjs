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
 const crosswalkPath=new URL('packages/atlas-after-hours/HISTORICAL_RULEFIELD_MANIFEST_DISPOSITION.json',root);
 const integrated=new URL('packages/atlas-after-hours/CROSS_ESTATE_MAINLINE_INTEGRATION_GATE.md',root);
 const accepted=(existsSync(integrated)&&existsSync(crosswalkPath))
    ? JSON.parse(readFileSync(crosswalkPath,'utf8')).predecessor_rulefield_blob_divergences : [];
 const approvals=new Map(accepted.map(x=>[x.path,x]));
 assert.equal(approvals.size,accepted.length,'duplicate successor exception');
 assert.deepEqual([...approvals.keys()].sort(),
   accepted.length ? ['packages/rulefield/lab/README.md','packages/rulefield/lab/tool_registry.json'] : []);
 for(const item of record.records){
   const path=new URL(item.path,root);assert.equal(existsSync(path),true,item.path);
   const content=readFileSync(path);
   const blob=createHash('sha1').update(Buffer.from('blob '+content.length+String.fromCharCode(0))).update(content).digest('hex');
   const successor=approvals.get(item.path);
   if(successor){
     assert.equal(successor.inherited_rulefield_blob_sha1,item.gitBlobSha1,'baseline witness may not be rewritten');
     assert.equal(blob,successor.atlas_successor_blob_sha1,'Atlas divergence must match explicitly recorded exact Git blob');
   } else {
     assert.equal(blob,item.gitBlobSha1,'historical byte mismatch '+item.path);
   }
 }
});
test('operator-scientific holds are a baseline constraint rather than a signature',()=>{
 assert.equal(record.protectedExperimentB,'HELD');
 assert.equal(record.humanScientificClosure,'RESERVED');
 assert.match(record.interpretation,/NEITHER_MAIN_MERGE NOR OPERATOR_CANONIZATION/);
});
