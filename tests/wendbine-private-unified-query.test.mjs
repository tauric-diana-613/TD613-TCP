import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const p=path.join(root,'99-ADMIN/wendbine-private-unified-query.py');
const source=fs.readFileSync(p,'utf8');
assert.match(source,/p0-archived-source-field-receipts-20260922-v06\.json/);
assert.match(source,/p1p2-archived-source-field-receipts-20260922-v07\.json/);
assert.match(source,/SOURCE_FIELD_HASH_MISMATCH/);
assert.match(source,/SOURCE_BODY_STATE_MISMATCH/);
assert.match(source,/PRIVATE_INDEX_60_SOURCE_CARDINALITY_MISMATCH/);
assert.match(source,/58,2/);
let res=spawnSync('python',['-c','import ast,sys; ast.parse(open(sys.argv[1], encoding="utf8").read())',p],{encoding:'utf8'});
assert.equal(res.status,0,'Unified private query must parse as valid Python: '+res.stderr);
res=spawnSync('python',[p,'--db','/nonexistent-private-wendbine-60.sqlite','status'],{encoding:'utf8'});
assert.notEqual(res.status,0,'Missing or imaginary private index may not claim 60-source success.');
for(const name of ['README.md','CONNECTOR_ENTRY.md']){
 const t=fs.readFileSync(path.join(root,name),'utf8');
 assert.match(t,/CURRENT 60\/60/);
 assert.match(t,/wendbine-private-unified-query\.py/);
 assert.match(t,/58 nonempty bodies|58 text bodies/);
}
console.log('Wendbine 60-source private query: source-receipt gate, Python parse, missing-store refusal and current docs passed.');
