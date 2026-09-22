import assert from 'node:assert/strict';
import fs from 'node:fs';
const ci=fs.readFileSync('.github/workflows/td613-ci.yml','utf8');
const gate=fs.readFileSync('.github/workflows/vercel-relock-safety.yml','utf8');
const root='packages/dome_world_exact/fixtures/a15-r0/WENDBINE';
assert.doesNotMatch(ci,/^\s*schedule:\s*$/m,'The SRC-style operator sync must never run on a cron.');
assert.doesNotMatch(ci,/wendbine-autosync/,'The ordinary CI validation workflow must never own Wendbine acquisition.');
const workflows=fs.readdirSync('.github/workflows').filter(x=>/\.ya?ml$/.test(x)).sort();
const established=['pages.yml','td613-ci.yml','vercel-operator-release.yml','vercel-relock-safety.yml'].sort();
assert.deepEqual(workflows.filter(x=>x!=='vercel-production-reobserve.yml'),established,
 'Wendbine must respect both the historical four-lane estate and the current main fifth production re-observation lane.');
assert.ok(workflows.length===4||workflows.length===5,'No sixth workflow may be introduced for Wendbine.');
assert.match(gate,/github\.event\.issue\.number == 758/,'SRC gate remains separately bounded.');
assert.match(gate,/github\.event\.comment\.body == '\/src-zenodo-sync ATELIER'/);
assert.ok(gate.split('  wendbine-operator-sync:')[0].includes('group: td613-vercel-production-release'),
 'The production relock lane retains its established job-scoped concurrency lock.');
const isolatedJob=gate.split('  wendbine-operator-sync:')[1];
assert.ok(isolatedJob,'A distinct Wendbine manual-sync job must exist.');
assert.doesNotMatch(isolatedJob,/td613-vercel-production-release/,
 'The Wendbine research job must not inherit the production lock.');
assert.match(gate,/  wendbine-operator-sync:\s*\n/);
const job=gate.split('  wendbine-operator-sync:')[1];
assert.ok(job,'The independent Wendbine gate exists.');
assert.match(job,/github\.event\.issue\.number == 1308/);
assert.match(job,/github\.event\.issue\.pull_request == null/);
assert.match(job,/github\.event\.comment\.body == '\/wendbine-sync ATELIER'/);
assert.match(job,/ATELIER_PR: '1134'/);
assert.match(job,/ATELIER_BRANCH: research\/wendbine-public-atelier-sync-20260913/);
assert.match(job,/wendbine-src-autosync\.mjs/);
assert.match(job,/source-capture\.sealed\.json/);
assert.match(job,/07-ARCHIVE-LEDGER\/syncs/);
assert.match(job,/WENDBINE_WRITE_MEMBRANE_VIOLATION/);
assert.match(job,/Gate #\$GATE_ISSUE DORMANT/);
assert.doesNotMatch(job,/^\s*schedule:\s*$/m);
assert.doesNotMatch(job,/vercel-operator-release\.yml/,'Research synchronization creates no Vercel authority.');
const reader=fs.readFileSync(root+'/99-ADMIN/wendbine-srcquery.mjs','utf8');
assert.match(reader,/EXPLICIT_SRC_SNAPSHOT_AND_SEAL_REQUIRED/);
assert.match(reader,/REGISTRY_HASH_MISMATCH/);
console.log('Wendbine SRC-like operator-only #1308 gate PASS: four workflows, no cron, separate SRC #758, one gesture and DORMANT return.');
