/** Atlas After Hours provenance guard: 187 original Antigravity source paths, not a claim of all-byte equivalence. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(readFileSync(new URL('../ATLAS_EIGHTH_ORDER_SUCCESSOR_MANIFEST.json',import.meta.url)));
const source=JSON.parse(readFileSync(new URL('../artifacts/atlas-after-hours/predecessor_source_custody_receipt.json',import.meta.url)));
const EIGHTH_ORDER_ADDITIONS=new Set([
 'ATLAS_EIGHTH_ORDER_ADJUDICATION.md','ATLAS_EIGHTH_ORDER_RUNBOOK.md',
 'THE_HOME_THAT_SURVIVED_ITS_INHABITANTS.md',
 'artifacts/atlas-after-hours/counterworld-loom/berlantian_reparative_counterworlds.json',
 'artifacts/atlas-after-hours/reparative_consequence_docket.json',
 'dossier/THE_HOME_THAT_SURVIVED_ITS_INHABITANTS.md',
 'packages/rulefield/lab/eighth_order_reparative_consequence.mjs',
 'scripts/rulefield.mjs','scripts/run-eighth-order-reparative-trial.mjs',
 'tests/rulefield-eighth-order-reparative-consequence.test.mjs'
]);
const original=manifest.files.map(f=>f.path).filter(p=>!EIGHTH_ORDER_ADDITIONS.has(p));
test('original Antigravity 187-entry packet has no omitted path in Atlas succession',()=>{
 assert.equal(manifest.files.length,197);
 assert.equal(EIGHTH_ORDER_ADDITIONS.size,10);
 assert.equal(original.length,187);
 assert.equal(new Set(original).size,187);
 for(const p of original)assert.ok(existsSync(new URL('../'+p,import.meta.url)),'lost historical file path: '+p);
});
test('original ZIP is an external custody source rather than a byte-exact archive committed to Git',()=>{
 assert.equal(source.zipSha256,'98f4767fa1d6c4d792aeeca43c1c2105ce037b8468965b7a9961ca9be63e9db6');
 assert.equal(existsSync(new URL('../TD613_Atlas_After_Hours_Complete_Trial_Packet_20261108(1).zip',import.meta.url)),false);
 assert.equal(source.status,'COMPLETE_18_OF_18_PREDECESSOR_DOCS');
 assert.equal(source.restored.length,18);
 // ARCHIVE_INDEX is successor-edited; never assert full 187-file original-byte parity.
 const current=readFileSync(new URL('../ARCHIVE_INDEX.md',import.meta.url));
 const gitBlob=createHash('sha1').update(Buffer.from('blob '+current.length+String.fromCharCode(0))).update(current).digest('hex');
 assert.notEqual(gitBlob,'47329ec30ac2df0005d84841dc98ad59afa4932a');
});
