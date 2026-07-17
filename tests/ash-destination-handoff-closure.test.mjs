import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = p => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const opening = read('docs/ASH_KEEP_STRETCH11_OPENING.md');
const closure = read('docs/ASH_KEEP_STRETCH11_CLOSURE_RECEIPT.md');
const buildout = read('docs/ASH_KEEP_BUILDOUT_CLOSURE_RECEIPT.md');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const plan = read('docs/ASH_KEEP_BUILDOUT_PLAN_STRETCH11_AND_FINAL_CLOSURE.md');
const workflow = read('.github/workflows/ash-destination-handoff.yml');
const sacred = String.fromCodePoint(0x10D613);
for (const [name,doc] of Object.entries({ opening, closure, buildout, ledger, roadmap, plan })) {
  assert.ok(doc.includes(sacred), `${name} omitted U+10D613`);
  assert.equal(doc.includes('𐵓'), false, `${name} contains contaminating U+10D53`);
  assert.ok(doc.includes('𝌋‌'), `${name} omitted writerly lane`);
}
for (const token of [
  'GRANTED BY FRESH OPERATOR HANDOFF','Stretch 11 authorization = true','root api count at opening = 11',
  'G1 named destination and recipient','G8 what-left / what-remained custody accounting'
]) assert.ok(opening.includes(token), `opening omitted ${token}`);
for (const token of [
  'PENDING_EXACT_MAIN_EXTERNAL_SEAL','component maturity after local closure = 358 / 375','workstream G = 45 / 45',
  'transport capability = NAMED_SAME_ORIGIN_BROWSER_RECIPIENT_ONLY','SAME_ORIGIN_MESSAGE_CHANNEL',
  'DESTINATION_HOLD','RECIPIENT_MISMATCH_HOLD','PARTIAL_DELIVERY_HOLD','ROLLBACK_HOLD','REPLAY_HOLD',
  'production demonstration = PENDING_EXACT_MAIN_DEPLOYED_OBSERVATION'
]) assert.ok(closure.includes(token), `closure omitted ${token}`);
for (const token of [
  'CONDITIONAL_CLOSURE_RECEIPT','ASH_KEEP_11_STRETCH_BUILDOUT_CLOSED','FURTHER_STRETCH_NUMBERING_FORBIDDEN',
  'MAINTENANCE_ONLY','375 / 375 maturity','Cinder authority'
]) assert.ok(buildout.includes(token), `buildout omitted ${token}`);
assert.match(ledger, /G\. Destination-bound handoff \| \*\*45 \/ 45\*\*/);
assert.match(ledger, /component maturity after Stretch 11 local closure = 358 \/ 375/);
assert.match(ledger, /remaining component maturity = 17 \/ 375/);
assert.match(ledger, /transport-capable workstreams = 1 \/ 9/);
assert.match(roadmap, /Stretch 11 · Destination-Bound Handoff — CLOSED LOCALLY/);
assert.match(roadmap, /Ash Keep Buildout Closure — NOT A STRETCH/);
assert.match(plan, /Plan generation: `v3\.1/);
assert.match(plan, /no Stretch 12/i);
for (const token of [
  'name: Ash Destination Handoff','Ash Destination Handoff Validation','Ash Destination Handoff Deployed Observation',
  'test "$count" = "11"','ash-destination-handoff-probe.mjs','https://td613.com/app/dome-world/ash-destination-handoff.html'
]) assert.ok(workflow.includes(token), `workflow omitted ${token}`);
console.log('ash-destination-handoff-closure.test.mjs passed');
