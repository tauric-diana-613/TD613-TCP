import fs from 'node:fs';

const manifestPath = 'vercel.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

manifest.functions ||= {};
delete manifest.functions['api/ash-keep-shell.js'];
delete manifest.functions['api/ash-keep-js-shell.js'];
manifest.functions['api/dome-world-shell.js'] = {
  maxDuration: 10,
  includeFiles: 'app/dome-world/{index.html,ash-keep.html,ash-keep.js}'
};

const desired = new Map([
  ['/dome-world/ash-keep.html', '/api/dome-world-shell?surface=ash-keep-html'],
  ['/app/dome-world/ash-keep.html', '/api/dome-world-shell?surface=ash-keep-html'],
  ['/dome-world/ash-keep.js', '/api/dome-world-shell?surface=ash-keep-js'],
  ['/app/dome-world/ash-keep.js', '/api/dome-world-shell?surface=ash-keep-js']
]);

const rewrites = Array.isArray(manifest.rewrites) ? manifest.rewrites : [];
for (const [source, destination] of desired) {
  const existing = rewrites.find(entry => entry.source === source);
  if (existing) existing.destination = destination;
  else {
    const fallback = source.startsWith('/app/') ? '/app/(.*)' : '/dome-world/(.*)';
    const fallbackIndex = rewrites.findIndex(entry => entry.source === fallback);
    const entry = { source, destination };
    if (fallbackIndex >= 0) rewrites.splice(fallbackIndex, 0, entry);
    else rewrites.push(entry);
  }
}
manifest.rewrites = rewrites;

for (const obsolete of ['api/ash-keep-shell.js', 'api/ash-keep-js-shell.js']) {
  if (fs.existsSync(obsolete)) fs.rmSync(obsolete);
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const functionCount = Object.keys(manifest.functions).length;
if (functionCount > 12) throw new Error(`Ash shell consolidation exceeded Vercel function budget: ${functionCount}/12`);
console.log(`Ash lifecycle surfaces consolidated through api/dome-world-shell.js (${functionCount}/12 functions).`);
