import fs from 'node:fs';
import vm from 'node:vm';

const files = ['domeblox-hooks.js', 'domeblox-core.js'];
for (const file of files) {
  new vm.Script(
    fs.readFileSync(new URL('../app/dome-world/domeblox/' + file, import.meta.url), 'utf8'),
    { filename: file }
  );
}

const html = fs.readFileSync(
  new URL('../app/dome-world/domeblox/index.html', import.meta.url),
  'utf8'
);
for (const id of [
  'sourceNucleus', 'buildFamily', 'runAssay', 'runMoire',
  'compileConsequence', 'gameList', 'ledgerView'
]) {
  if (!html.includes(`id="${id}"`)) throw new Error('missing ' + id);
}
console.log('DomeBlox static contract PASS');
