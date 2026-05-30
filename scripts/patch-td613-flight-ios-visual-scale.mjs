import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';
const marker = '/* PR87_SENTINEL TD613 Flight iOS visual-scale input shim */';

function removeFailedShim(source) {
  let out = source;
  while (out.includes(marker)) {
    const start = out.indexOf(marker);
    const nextPr85 = out.indexOf('/* PR85_FINAL_SENTINEL TD613 Flight mobile repair */', start + marker.length);
    const nextStyle = out.indexOf('\n</style>', start + marker.length);
    const nextGeneric = out.indexOf('\n/* ', start + marker.length);
    const candidates = [nextPr85, nextStyle, nextGeneric].filter((value) => value > start);
    if (!candidates.length) throw new Error('Could not find end of PR87 shim block');
    const end = Math.min(...candidates);
    out = out.slice(0, start) + out.slice(end);
  }
  return out;
}

for (const path of [htmlPath, pr85Path]) {
  const before = fs.readFileSync(path, 'utf8');
  const after = removeFailedShim(before);
  fs.writeFileSync(path, after);
}

console.log('Removed failed TD613 Flight PR87 visual-scale shim. No replacement scaling applied.');
