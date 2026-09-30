import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const indexHtml = await readFile(new URL('../app/aperture/index.html', import.meta.url), 'utf8');
const discovery = JSON.parse(await readFile(new URL('../app/aperture/counter-tool-discovery.json', import.meta.url), 'utf8'));
const vercel = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));

const canonicalRoute = 'https://td613.com/aperture/';
const apertureRedirects = new Map(
  (vercel.redirects || [])
    .filter((route) => route.destination === '/aperture/')
    .map((route) => [route.source, route])
);

assert.match(
  indexHtml,
  /<link\s+rel=["']canonical["']\s+href=["']https:\/\/td613\.com\/aperture\/["']\s*>/i,
  'Aperture entry document must declare /aperture/ as its canonical public route'
);
assert.match(
  indexHtml,
  /<meta\s+name=["']td613-public-route["']\s+content=["']https:\/\/td613\.com\/aperture\/["']\s*>/i,
  'Aperture entry metadata must expose the canonical public route'
);
assert.equal(discovery.canonical_public_route, canonicalRoute, 'Aperture machine discovery must identify the canonical public route');
assert.equal(apertureRedirects.get('/aperture')?.permanent, true, '/aperture must permanently normalize to /aperture/');
assert.equal(apertureRedirects.get('/aperture/index.html')?.permanent, true, '/aperture/index.html must permanently normalize to /aperture/');
assert.equal(apertureRedirects.size, 2, 'Aperture canonicalization must stay narrow and explicit');

console.log('Aperture canonical route contract: pass');
