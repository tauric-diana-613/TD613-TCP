import fs from 'node:fs';
import assert from 'node:assert/strict';

const shellPath = 'api/dome-world-shell.js';
const vercelPath = 'vercel.json';

function replaceOne(source, from, to, label) {
  const count = source.split(from).length - 1;
  assert.equal(count, 1, `${label}: expected one match, observed ${count}`);
  return source.replace(from, to);
}

let shell = fs.readFileSync(shellPath, 'utf8');
shell = replaceOne(shell,
  "export const DOME_WORLD_SHELL_VERSION = 'td613.dome-world.shell/v1.4-lifecycle-cache-boundary';",
  "export const DOME_WORLD_SHELL_VERSION = 'td613.dome-world.shell/v1.5-aia3-mass-eviction';",
  'shell version');
shell = replaceOne(shell,
  "export const ASH_KEEP_SHELL_VERSION = 'td613.ash-keep.shell/v0.3-lifecycle-cache-boundary';",
  "export const ASH_KEEP_SHELL_VERSION = 'td613.ash-keep.shell/v0.4-aia3-mass-eviction';",
  'Ash shell version');
shell = replaceOne(shell,
  "export const ASH_CACHE_TRANSITION_CONTRACT = 'td613.ash.cache-transition/v0.3-v7-readiness-boundary';",
  "export const ASH_CACHE_TRANSITION_CONTRACT = 'td613.ash.cache-transition/v0.4-aia3-mass-eviction';",
  'cache contract');
shell = replaceOne(shell,
  "export const ASH_LIFECYCLE_ASSET_EPOCH = '20260718-canonical-membrane-v7-readiness-boundary';",
  "export const ASH_LIFECYCLE_ASSET_EPOCH = '20260720-aia3-mass-eviction-v2';",
  'lifecycle asset epoch');

const cookieBlock = `const ASH_MASS_EVICTION_EPOCH = '20260720-aia3-mass-eviction-v2';
const ASH_MASS_EVICTION_COOKIE = 'td613_ash_cache_epoch';

function readCookie(req, name) {
  const source = String(req?.headers?.cookie || '');
  for (const part of source.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    if (key !== name) continue;
    try { return decodeURIComponent(part.slice(index + 1).trim()); }
    catch { return part.slice(index + 1).trim(); }
  }
  return null;
}

function applyAshMassEvictionHeaders(req, res, surface) {
  if (surface !== 'ash-keep-html') return Object.freeze({ applied:false, reason:'NON_ASH_HTML' });
  const observed = readCookie(req, ASH_MASS_EVICTION_COOKIE) === ASH_MASS_EVICTION_EPOCH;
  res.setHeader('X-TD613-Ash-Mass-Eviction', observed ? 'ALREADY_OBSERVED' : ASH_MASS_EVICTION_EPOCH);
  if (observed) return Object.freeze({ applied:false, reason:'EPOCH_COOKIE_PRESENT' });
  res.setHeader('Clear-Site-Data', '"cache"');
  res.setHeader('Set-Cookie', \
    \`\${ASH_MASS_EVICTION_COOKIE}=\${encodeURIComponent(ASH_MASS_EVICTION_EPOCH)}; Path=/dome-world; Max-Age=31536000; SameSite=Lax; Secure\`);
  return Object.freeze({ applied:true, epoch:ASH_MASS_EVICTION_EPOCH, indexeddb_preserved:true, local_storage_preserved:true, session_storage_preserved:true });
}

`;
shell = replaceOne(shell,
  "const DOME_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'index.html');",
  `${cookieBlock}const DOME_SOURCE_PATH = path.join(process.cwd(), 'app', 'dome-world', 'index.html');`,
  'mass-eviction cookie block');

shell = replaceOne(shell,
  "schema:'td613.ash.cache-transition-response/v0.4-v7-readiness-boundary',",
  "schema:'td613.ash.cache-transition-response/v0.5-aia3-mass-eviction',",
  'cache response schema');

shell = replaceOne(shell,
  "  const surface = requestedSurface(req);\n  if (!['GET', 'HEAD'].includes(method)) {",
  "  const surface = requestedSurface(req);\n  applyAshMassEvictionHeaders(req, res, surface);\n  if (!['GET', 'HEAD'].includes(method)) {",
  'handler eviction hook');

fs.writeFileSync(shellPath, shell);

const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
const ashNoStoreSources = ['/dome-world/ash-(.*)', '/app/dome-world/ash-(.*)'];
for (const source of ashNoStoreSources) {
  if (vercel.headers.some(entry => entry.source === source)) continue;
  const genericIndex = vercel.headers.findIndex(entry => entry.source === '/dome-world/(.*)');
  const entry = { source, headers:[{ key:'Cache-Control', value:'no-store, max-age=0, must-revalidate' }] };
  vercel.headers.splice(genericIndex < 0 ? vercel.headers.length : genericIndex, 0, entry);
}
fs.writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);

console.log(JSON.stringify({ status:'PATCHED', shell:shellPath, vercel:vercelPath }, null, 2));
