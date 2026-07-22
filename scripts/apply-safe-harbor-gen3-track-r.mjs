import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const archiveBase64 = ['part-00.txt','part-01.txt','part-02.txt','part-03.txt','part-04.txt'].map((name) => readFileSync(new URL(`./track-r-payload/${name}`, import.meta.url), 'utf8').trim()).join('');
const archive = gunzipSync(Buffer.from(archiveBase64, 'base64'));
writeFileSync('/tmp/track-r-overlay.tar', archive);
execFileSync('tar', ['-xf', '/tmp/track-r-overlay.tar', '-C', '.'], { stdio: 'inherit' });
rmSync('/tmp/track-r-overlay.tar', { force: true });

const packagePath = 'package.json';
const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
pkg.scripts['test:safe-harbor:gen3:track-r'] = 'node tests/safe-harbor-gen3-track-r-blind-custody.test.mjs && node tests/safe-harbor-gen3-track-r-perturbation-invariance.test.mjs && node tests/safe-harbor-gen3-track-r-gate.test.mjs && node tests/safe-harbor-gen3-track-r-schema-contract.test.mjs';
writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

const readmePath = 'docs/safe-harbor/README.md';
let readme = readFileSync(readmePath, 'utf8');
const anchor = '- [Restorative Stylodynamics and Perturbation Invariance Mapping research annex](./restorative-stylodynamics-perturbation-invariance-annex-v0.1.md)\n';
if (!readme.includes(anchor)) throw new Error('Safe Harbor docs index anchor missing.');
const receiptLine = '- [Gen3 Research Track R implementation receipt](./gen3-track-r-implementation-receipt.md)\n';
if (!readme.includes(receiptLine)) readme = readme.replace(anchor, `${anchor}${receiptLine}`);
writeFileSync(readmePath, readme);

const ledgerPath = 'docs/safe-harbor/gen3-implementation-ledger.md';
let ledger = readFileSync(ledgerPath, 'utf8');
ledger = ledger.replace('| Research Track R | `safe-harbor-gen3-track-r-blind-custody-stylodynamics` | pending / research-gated | no baseline intake authority |', '| Research Track R | Track R implementation PR | implementation candidate / research-gated / unpromoted | no baseline intake authority |');
for (const id of ['R-001','R-002','R-003','R-004','R-005','R-006','R-007','R-008','R-009']) {
  const pattern = new RegExp(`(^\\| ${id} \\|[^\\n]*\\| )research-gated( \\|$)`, 'm');
  ledger = ledger.replace(pattern, `$1implemented / research-gated$2`);
}
ledger = ledger.replace('| R-010 | Twelve consented or synthetic-distinct triads before promotion | calibration ledger | calibration receipt | blocked until qualifying calibration corpus exists |', '| R-010 | Twelve consented or synthetic-distinct triads before promotion | calibration ledger | calibration receipt | blocked; qualifying calibration corpus not present |');
writeFileSync(ledgerPath, ledger);
console.log('Safe Harbor Gen3 Track R overlay applied.');
