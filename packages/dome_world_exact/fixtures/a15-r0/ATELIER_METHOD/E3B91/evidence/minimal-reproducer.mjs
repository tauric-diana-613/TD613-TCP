// Read-only candidate audit. Writes only fresh synthetic state beside this file.
// Usage: node minimal-reproducer.mjs /absolute/path/to/pinned-software-root
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const source=path.resolve(process.argv[2]??new URL('../audit-source/',import.meta.url).pathname);
const dir=path.join(source,'packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B8');
const {openCandidateProduct,ENCYCLOPEDIA}=await import(pathToFileURL(path.join(dir,'product-entry-v01.mjs')));
const workspace=fs.mkdtempSync(path.join(path.dirname(fileURLToPath(import.meta.url)),'minimal-synthetic-'));
const p=await openCandidateProduct({workspace,create:true});
const f=JSON.parse(fs.readFileSync(path.join(dir,'fixture-catalog.json'))).fixtures.find(f=>f.fixture_id==='TD_REFERENCE');
const d=(await p.request({action:'describeFixtures'})).find(x=>x.fixture_id==='TD_REFERENCE');
const staged=await p.request({action:'stageSyntheticFixture',fixture_id:f.fixture_id,source_id:'FIXTURE-MINIMAL',product_id:d.product_id,epoch:d.epoch,rights:d.rights,evidence_class:f.evidence_class,sha256:f.sha256,bytes:Buffer.from(f.bytes_base64,'base64')});
const bound={product_id:d.product_id,source_id:staged.source_id,receipt:staged.receipt};
const q={action:'execute',...bound,operation:'search',params:{query:'governance'}};
const pending=p.request(q); // Validation happens before the first async yield.
q.product_id=ENCYCLOPEDIA;
q.receipt='UNVALIDATED_RECEIPT';
const r=await pending;
console.log(JSON.stringify({finding:'B9-F01',expected_product:d.product_id,actual_product:r.product_id,expected_receipt:bound.receipt,actual_receipt:r.source_receipt,family:r.family,status:r.status,real_source_authority:r.source_authorized,scientific_authority:r.scientifically_validated},null,2));
let getter_calls=0;
const options=[];Object.defineProperty(options,'0',{enumerable:true,get(){getter_calls++;return 0}});options.length=1;
const r2=await p.request({action:'execute',...bound,operation:'search',params:{query:'governance',options}});
console.log(JSON.stringify({finding:'B9-F02',expected:'Accessor refused without invoking getter',getter_calls,status:r2.status,source_authorized:r2.source_authorized},null,2));
