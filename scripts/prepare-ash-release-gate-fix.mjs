import fs from 'node:fs';

const path = 'app/dome-world/ash-lifecycle.js';
const source = fs.readFileSync(path, 'utf8');
const oldBlock = `  button.disabled = !(nativeReady && ui.lifecycle.gates.local_release);`;
const newBlock = `  const shouldDisable = !(nativeReady && ui.lifecycle.gates.local_release);\n  if (button.disabled !== shouldDisable) button.disabled = shouldDisable;`;

if (!source.includes(oldBlock)) {
  if (source.includes(newBlock)) {
    console.log('Ash release gate is already idempotent.');
    process.exit(0);
  }
  throw new Error('Ash release gate marker not found.');
}

const patched = source.replace(oldBlock, newBlock);
if ((patched.match(/const shouldDisable = !\(nativeReady && ui\.lifecycle\.gates\.local_release\);/g) || []).length !== 1) {
  throw new Error('Ash release gate repair did not produce exactly one guarded assignment.');
}
fs.writeFileSync(path, patched);
console.log('Prepared idempotent Ash release gate source.');
