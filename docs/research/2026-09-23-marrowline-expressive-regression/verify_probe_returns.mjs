// Evidence-only reproducibility. No model calls or production text mutation.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const manifest = [
  ['probe-01-as-exported.md', 19475, 'e76c0fa3caefeefe032b30a277fd3da4e4f94bda5b43e649a973675d524940fd'],
  ['probe-02-as-exported.md', 24210, 'f60aec411a247b9621745082fa798dfdaf53cfa446f35bbc0a084bca51cd63b6'],
  ['probe-02-longer-as-exported.md', 33397, 'c524299836dc06e37306cfab016da1e07514674ffa49488c4a4c2330b5e93201']
];
const texts = new Map();
for (const [name, bytes, sha256] of manifest) {
  const raw = readFileSync(new URL(name, import.meta.url));
  assert.equal(raw.length, bytes, name);
  assert.equal(createHash('sha256').update(raw).digest('hex'), sha256, name);
  texts.set(name, raw.toString('utf8'));
  console.log(JSON.stringify({ name, bytes, sha256, exportChange: 'one terminal LF appended' }));
}

const base = 'The clerk brought eight chairs for one witness and charged the empty seats for their testimony. We left the invoice beside the cooling fan.';
assert.equal([...base].length, 139);
for (const name of ['probe-02-as-exported.md', 'probe-02-longer-as-exported.md']) {
  for (const number of [1, 2]) {
    const part = texts.get(name).split('#### Specimen ' + number + ':')[1].split(/\n####? /)[0];
    const specimen = part.split('\n').find(line => /\p{M}/u.test(line));
    assert.ok(specimen);
    const stripped = specimen.replace(/\p{M}/gu, '');
    const sameBase = stripped === base;
    const count = [...specimen.matchAll(/\p{M}/gu)].length;
    const longer = name.includes('longer');
    assert.equal(sameBase, !(longer && number === 2));
    assert.equal(count, number === 2 ? 417 : longer ? 114 : 139);
    console.log(JSON.stringify({ name, specimen: number, sameBase, combiningMarks: count }));
  }
}
const posterior = lambda => (.8 * lambda + .8 ** 8 * (1 - lambda)) / (lambda + (.8 ** 8 + .2 ** 8) * (1 - lambda));
assert.ok(Math.abs(posterior(.5) - 63006 / 76027) < 1e-14);
assert.ok(Math.abs(posterior(.05) - .9522296965206611) < 1e-14);
console.log(JSON.stringify({ posterior: [0, .05, .5, 1].map(lambda => ({ lambda, p: posterior(lambda) })), repairGainPercentagePoints: (28 / 31 - .8) * 100 }));
for (const form of ['NFC', 'NFKC']) assert.equal('A\u0338'.normalize(form), 'A\u0338');
console.log('Verified exports, base-text controls, arithmetic and overlay normalization witness.');
