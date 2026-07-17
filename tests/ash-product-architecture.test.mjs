import { spawnSync } from 'node:child_process';

const lanes = [
  ['shell', 'tests/product-architecture/shell.test.mjs'],
  ['lifecycle', 'tests/product-architecture/lifecycle.test.mjs'],
  ['ledger', 'tests/product-architecture/ledger.test.mjs'],
  ['aperture-closure', 'tests/aperture-composition/closure.test.mjs']
];

for (const [name, file] of lanes) {
  console.log(`ash-product-architecture lane: ${name}`);
  const result = spawnSync(process.execPath, [file], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Ash product architecture lane failed: ${name}`);
}

console.log('ash-product-architecture.test.mjs passed');
