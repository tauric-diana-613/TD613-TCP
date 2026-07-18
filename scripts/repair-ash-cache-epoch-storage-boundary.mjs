import fs from 'node:fs';

const PROBE_PATH = 'scripts/ash-keep-production-probe.mjs';
const CONTRACT_PATH = 'tests/ash-keep-production-closure-contract.test.mjs';
const SELF_PATH = 'scripts/repair-ash-cache-epoch-storage-boundary.mjs';
const WORKFLOW_PATH = '.github/workflows/repair-ash-cache-epoch-storage-boundary.yml';

function replaceOnce(source, from, to, label) {
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one seam, observed ${count}.`);
  return source.replace(from, to);
}

let probe = fs.readFileSync(PROBE_PATH, 'utf8');
probe = replaceOnce(
  probe,
  `const ALLOWED_LOCAL_KEYS = new Set([\n  'td613.ash-keep.current-case',\n  'td613.ash-keep.preferences'\n]);`,
  `const ALLOWED_LOCAL_KEYS = new Set([\n  'td613.ash-keep.current-case',\n  'td613.ash-keep.preferences',\n  'td613.ash.cache-flush.epoch'\n]);`,
  'allowed maintenance storage key'
);
fs.writeFileSync(PROBE_PATH, probe);

let contract = fs.readFileSync(CONTRACT_PATH, 'utf8');
contract = replaceOnce(
  contract,
  `assert.match(probe, /transmission_performed === false/);`,
  `assert.match(probe, /transmission_performed === false/);\nassert.match(probe, /ALLOWED_LOCAL_KEYS[\\s\\S]*td613\\.ash\\.cache-flush\\.epoch/, 'Cache epoch must remain an allowed maintenance key after case creation');`,
  'maintenance-key closure contract'
);
fs.writeFileSync(CONTRACT_PATH, contract);

for (const path of [SELF_PATH, WORKFLOW_PATH]) {
  if (fs.existsSync(path)) fs.rmSync(path);
}

console.log('Ash cache epoch storage boundary repaired: maintenance marker permitted, case storage boundary unchanged.');
