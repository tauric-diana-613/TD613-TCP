import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const checkout=process.argv[2];
assert.ok(typeof checkout==='string'&&path.isAbsolute(checkout),'PINNED_SOURCE_CHECKOUT_REQUIRED');
const get=path=>import(pathToFileURL(path.join(checkout,path)).href);
const sha=b=>createHash('sha256').update(b).digest('hex');
const {runGA01IntegratedSyntheticEpisode}=await get('scripts/ga01-integrated-sourcefree-products-v01.mjs');
const {openSyntheticReceiver}=await get('scripts/reciprocal-receiver-sourcefree-v01.mjs');
const {openSourceFreeCohortPolicy,projectExactTDReferenceToNativeIntake}=await get('scripts/ga03-sourcefree-revocation-and-td-projection-v01.mjs');
const temporary=t=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'ga03-independent-'));
 t.after(()=>fs.rmSync(root,{force:true,recursive:true}));return root};

test('Independent GA03: mediated retrieval refuses an existing synthetic receiver copy after withdrawal',async t=>{
 const home=temporary(t),w=await runGA01IntegratedSyntheticEpisode({workspaceRoot:home});
 assert.equal(w.original_sources_admitted,0);
 const store=path.join(home,'RECEIVER'),route='WENDBINE_ATELIER_TO_UNIVERSAL_ENCYCLOPEDIA';
 const id='FIXTURE:W-GA01-ORIGINAL';
 const recordPath=path.join(store,sha(route),sha(id)+'.json');
 const receipt=sha(fs.readFileSync(recordPath));
 const controlRoot=path.join(home,'COHORT');fs.mkdirSync(controlRoot,{mode:0o700});
 const policy=openSourceFreeCohortPolicy({root:controlRoot,create:true});
 const guarded=policy.controlledReceiver({repoRoot:checkout,store,route,sourceId:id,recordReceipt:receipt});
 assert.equal(guarded.retrieve().source_id,id);
 assert.equal((await guarded.execute()).source_id,id);
 policy.withdraw();
 assert.throws(()=>guarded.retrieve(),/GA03_COHORT_ACCESS_WITHDRAWN/);
 await assert.rejects(guarded.execute(),/GA03_COHORT_ACCESS_WITHDRAWN/);
 const reopened=openSourceFreeCohortPolicy({root:controlRoot,retainedReceipt:policy.rootReceipt});
 assert.throws(()=>reopened.assertAllowed(id),/GA03_COHORT_ACCESS_WITHDRAWN/);
 // This remains a negative control: unmediated legacy APIs can still read it.
 assert.equal(openSyntheticReceiver({repoRoot:checkout,store,route}).retrieve(id,receipt).source_id,id);
 assert.equal(reopened.state().global_unmediated_revocation,'HELD');
});
test('Independent GA03: no byte-identity promotion from TD reference to native intake',t=>{
 const catalog=JSON.parse(fs.readFileSync(path.join(checkout,
 'packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B8/fixture-catalog.json'),'utf8'));
 const original=Buffer.from(catalog.fixtures.find(x=>x.fixture_id==='TD_REFERENCE').bytes_base64,'base64');
 const p=projectExactTDReferenceToNativeIntake(original);
 assert.equal(p.lineage.original_sha256,sha(original));
 assert.equal(p.lineage.derived_sha256,sha(p.derivedBytes));
 assert.notEqual(p.lineage.original_sha256,p.lineage.derived_sha256);
 assert.equal(p.projected.title,'Tú puedes clonarme, pero no tienes mis genes.');
 assert.equal(p.projected.body,'collapse governance topology');
 assert.equal(p.lineage.other_original_records_not_transferred,1);
});
test('Independent GA03: policy file tampering results in refusal rather than fresh authorization',t=>{
 const root=temporary(t),p=openSourceFreeCohortPolicy({root,create:true});
 const f=path.join(root,'COHORT.json');
 fs.appendFileSync(f,'synthetic alteration');
 assert.throws(()=>p.assertAllowed('FIXTURE-W-GA01'),/GA03_POLICY_MANIFEST_TAMPER/);
});
