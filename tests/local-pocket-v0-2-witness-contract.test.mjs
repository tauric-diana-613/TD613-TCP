import assert from 'node:assert/strict';
import fs from 'node:fs';

const transition = fs.readFileSync('scripts/ash-a15-transition-trace-browser-probe.mjs', 'utf8');
const custody = fs.readFileSync('scripts/local-pocket-v0-2-exact-source-witness.mjs', 'utf8');
const browser = fs.readFileSync('scripts/local-pocket-v0-2-browser-witness.mjs', 'utf8');

assert.match(transition, /local-pocket-v0-2-exact-source-witness\.mjs/);
assert.ok(
  transition.indexOf('marrowline-loom-advisory-exact-source-witness.mjs') < transition.indexOf('local-pocket-v0-2-exact-source-witness.mjs'),
  'Local Pocket descendant assay must remain downstream of the inherited Marrowline descendant assay.'
);
assert.match(transition, /await import\(`\$\{pathToFileURL\(localPocketWitnessPath\)\.href\}/);

assert.match(custody, /td613\.local-pocket\.source-custody\/v0\.2-whole-tree-parity/);
assert.match(custody, /git\('rev-parse', 'HEAD\^\{tree\}'\)/);
assert.match(custody, /git\('fetch', '--no-tags', '--depth=1', 'origin', eventHead\)/);
assert.match(custody, /headTree = git\('rev-parse', `\$\{eventHead\}\^\{tree\}`\)/);
assert.match(custody, /wholeTreeEqual = checkoutTree === headTree/);
assert.match(custody, /commit_identity_equivalence_claimed: false/);
assert.match(custody, /tree_byte_equivalence_claimed: wholeTreeEqual/);
assert.match(custody, /if \(!wholeTreeEqual\) throw new Error/);
assert.match(custody, /local-pocket-v0-2-browser-witness\.mjs/);

assert.match(browser, /pathToFileURL\(pocketPath\)\.href/);
assert.match(browser, /page\.goto\(pocketUrl/);
assert.match(browser, /zero external requests after local load/);
assert.match(browser, /__TD613_PERSISTENCE_ATTEMPTS__/);
assert.match(browser, /__TD613_CLIPBOARD_WRITES__/);
assert.match(browser, /all seven canonical finding classes observed/);
assert.match(browser, /Pocket card contains no forbidden raw material/);
assert.match(browser, /Pocket card contains no local digest/);
assert.match(browser, /Pocket card contains no span coordinates/);
assert.match(browser, /Pocket card contains no route label shortcut/);
assert.match(browser, /draft mutation relocks message door/);
assert.match(browser, /draft mutation relocks card door/);
assert.match(browser, /mitigation immediately relocks message door/);
assert.match(browser, /fresh mitigated recheck opens message door/);
assert.match(browser, /clean state uses empty findings rather than fake Loom rule/);
assert.match(browser, /CHANGE-only journey does not display clear claim/);
assert.match(browser, /390x844 has no horizontal overflow/);
assert.match(browser, /reduced motion observed/);
assert.match(browser, /zero persistence attempts observed/);
assert.match(browser, /provider_live_call_performed: false/);
assert.match(browser, /deployment_authorized: false/);
assert.doesNotMatch(browser, /page\.route\(/, 'Local Pocket witness may not create a fake remote provider or server route.');
assert.doesNotMatch(browser, /TD613_BASE_URL/, 'Local Pocket browser witness must not require the TD613 HTTP runtime.');

console.log('Local Pocket v0.2 exact-source browser witness contract: PASS');
