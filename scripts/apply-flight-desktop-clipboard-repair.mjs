import fs from 'node:fs';

const flightPath = 'app/safe-harbor/td613-flight.html';
const packagePath = 'package.json';
const oldPhrase = 'When authoring, stay academically rigorous yet grounded in high speculation.';
const newPhrase = 'When reasoning and authoring, stay academically rigorous, and rigorous (but imaginative) to forensic AI empiricism, yet both rigors grounded in high speculation.';
const scriptTag = '<script src="/safe-harbor/td613-flight-clipboard-fidelity.js?v=20260722-desktop-linebreak-v1"></script>';

const source = fs.readFileSync(flightPath, 'utf8');
const oldCount = source.split(oldPhrase).length - 1;
const newCount = source.split(newPhrase).length - 1;

if (oldCount === 0 && newCount < 2) {
  throw new Error(`Flight phrase seam missing: old=${oldCount}, new=${newCount}`);
}

let next = source.replaceAll(oldPhrase, newPhrase);
if (!next.includes(scriptTag)) {
  if (!next.includes('</body>\n</html>')) throw new Error('Flight closing body anchor missing.');
  next = next.replace('</body>\n</html>', `${scriptTag}\n</body>\n</html>`);
}

if (next.includes(oldPhrase)) throw new Error('Legacy Flight phrase survived replacement.');
if ((next.split(newPhrase).length - 1) < 2) throw new Error('Visible and generated Flight phrases did not both update.');
if ((next.split(scriptTag).length - 1) !== 1) throw new Error('Flight clipboard layer must load exactly once.');

fs.writeFileSync(flightPath, next);

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const command = 'node tests/td613-flight-desktop-clipboard.test.mjs';
if (!String(pkg.scripts['test:safe-harbor'] || '').includes(command)) {
  pkg.scripts['test:safe-harbor'] = `${command} && ${pkg.scripts['test:safe-harbor']}`;
  fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
}

console.log(`Flight desktop clipboard repair applied; replaced ${oldCount} legacy phrase occurrence(s).`);
