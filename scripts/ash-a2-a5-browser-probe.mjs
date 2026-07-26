import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const legacyPath = path.join(scriptsDir, 'ash-a2-a5-browser-probe-a13.mjs');
const tempPath = path.join(scriptsDir, `.ash-a2-a5-browser-probe-a14-${process.pid}.mjs`);

let source = await fs.readFile(legacyPath, 'utf8');
source = source
  .replaceAll('td613.ash.demo-registry/v0.1-a13', 'td613.ash.demo-registry/v0.2-a14')
  .replace('td613.ash.a2-a6-browser-observation/v0.2-a13-registry-settled-play', 'td613.ash.a2-a6-browser-observation/v0.3-a14-registry-settled-play');

if (source.includes('td613.ash.demo-registry/v0.1-a13')) {
  throw new Error('A14 current-registry observer adapter left a retired A13 registry token.');
}

try {
  await fs.writeFile(tempPath, source, 'utf8');
  await import(`${pathToFileURL(tempPath).href}?a14=${Date.now()}`);
} finally {
  await fs.rm(tempPath, { force:true });
}
