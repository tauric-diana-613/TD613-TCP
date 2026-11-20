import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const exists=p=>existsSync(new URL(p,root));
test('one dedicated Atlas After Hours home, historic dossier and 18 predecessor mirrors retained',()=>{
 for(const p of ['packages/atlas-after-hours/README.md','packages/atlas-after-hours/AGENTS.md',
 'packages/atlas-after-hours/AUDIT_REPAIR_LEDGER.md','scripts/build-atlas-after-hours-handoff.py',
 'ARCHIVE_INDEX.md','artifacts/atlas-after-hours/predecessor_source_custody_receipt.json']){
  assert.ok(exists(p),p);
 }
 const receipt=JSON.parse(readFileSync(new URL('artifacts/atlas-after-hours/predecessor_source_custody_receipt.json',root),'utf8'));
 assert.equal(receipt.restored.length,18);
 for(const x of receipt.restored){assert.ok(exists(x.path));assert.ok(exists(x.mirror));}
});
test('Atlas estate preserves separate identities and discloses scientific/release holds',()=>{
 const read=p=>readFileSync(new URL(p,root),'utf8');
 const home=read('packages/atlas-after-hours/README.md');
 const agents=read('packages/atlas-after-hours/AGENTS.md');
 const ledger=read('packages/atlas-after-hours/AUDIT_REPAIR_LEDGER.md');
 assert.match(home,/Packages?\/atlas-after-hours|packages\/atlas-after-hours/);
 assert.match(home,/187/);
 assert.match(home,/source-free/i);
 assert.match(agents,/operator.*closure|human.*closure/i);
 assert.match(agents,/Experiment B/);
 for(const name of ['Pedagogue','Aperture','Atlas','FADT','Temporal Custodian','Orchestrator'])assert.ok(ledger.includes(name));
 assert.match(ledger,/Not yet repaired/);
});
