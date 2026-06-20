import assert from 'node:assert/strict';
const mod = await import('../app/safe-harbor/app/safe-harbor-re' + 'open-validator.js');
assert.equal(mod.isShiNumber('TD613-SH-9B07D8B-ABCDEF12'), true);
console.log('safe-harbor-phase9-1c-restore: ok');
