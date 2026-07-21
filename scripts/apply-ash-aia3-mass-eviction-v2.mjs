import fs from 'node:fs';
import assert from 'node:assert/strict';

const shell = fs.readFileSync('api/dome-world-shell.js', 'utf8');
for (const token of [
  'td613.dome-world.shell/v1.5-aia3-mass-eviction',
  '20260720-aia3-mass-eviction-v2',
  'ash-cache-preflight',
  'ASH_VERSIONED_MODULES',
  'CDN-Cache-Control',
  'Vercel-CDN-Cache-Control'
]) assert(shell.includes(token), `Guarded shell state omitted ${token}`);

const path = 'vercel.json';
const vercel = JSON.parse(fs.readFileSync(path, 'utf8'));
const required = ['/dome-world/ash-(.*)', '/app/dome-world/ash-(.*)'];
for (const source of required) {
  const current = vercel.headers.find(entry => entry.source === source);
  if (current) {
    current.headers = [{ key:'Cache-Control', value:'no-store, max-age=0, must-revalidate' }];
    continue;
  }
  const generic = vercel.headers.findIndex(entry => entry.source === '/dome-world/(.*)');
  const entry = { source, headers:[{ key:'Cache-Control', value:'no-store, max-age=0, must-revalidate' }] };
  vercel.headers.splice(generic < 0 ? vercel.headers.length : generic, 0, entry);
}
fs.writeFileSync(path, `${JSON.stringify(vercel, null, 2)}\n`);
console.log(JSON.stringify({ status:'PATCHED', sources:required }, null, 2));
