import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (filePath) => fs.readFileSync(path.join(root, filePath), 'utf8');

const pageSize = read('app/giving/history/giving-page-size.js');
assert.match(pageSize, /const FEC_SOURCE_ID = 'fec-schedule-a';/, 'Giving must identify the OpenFEC source explicitly');
assert.match(pageSize, /const FEC_BOUNDARY_PAGE_SIZE = 100;/, 'OpenFEC provider-friendly browser ceiling remains available');
assert.match(pageSize, /const PAGE_SIZE = 300;/, 'non-FEC absolute browser ceiling remains available');
assert.match(pageSize, /Math\.min\(sourceCeiling, Math\.floor\(requested\)\)/, 'the legacy fetch shim may narrow a request but may never widen the client page budget');

const resilience = read('app/giving/history/giving-fec-resilience.js');
assert.match(resilience, /const FEC_BOUNDARY_PAGE_SIZE = 100;/, 'FEC resilience must preserve one provider-friendly boundary page');
assert.match(resilience, /const MAX_BOUNDARY_PAGES = 1;/, 'one explicit Giving gesture may cross only one FEC browser boundary');
assert.match(resilience, /automatic_continuation: false/, 'FEC response metadata must declare that hidden continuation replay is disabled');
assert.match(resilience, /continuation_exposed: Boolean\(page\.continuation\)/, 'deeper FEC evidence must remain reachable through the ordinary explicit Continue route');
assert.doesNotMatch(resilience, /while \(continuation/, 'FEC browser resilience must not silently loop across continuation tokens');
assert.doesNotMatch(resilience, /records\.push\(\.\.\.pageRecords\)/, 'FEC browser resilience must not coalesce hidden provider pages into one dossier update');

const pagingLoader = read('app/giving/history/giving-review-paging.js');
assert.match(pagingLoader, /giving-page-size\.js\?v=20260814-1/, 'FEC page-size repair must retain its proven browser asset epoch');
assert.match(pagingLoader, /giving-fec-resilience\.js\?v=20260814-1/, 'FEC resilience wrapper retains the stable child URL and is cache-revalidated by the fresh repair entry');

const bootstrap = read('app/giving/history/giving-bootstrap.js');
assert.match(bootstrap, /GIVING_ASSET_EPOCH = '20260816-4'/, 'Giving coordinated module graph remains sealed');
assert.match(bootstrap, /giving-shared-access\.js/, 'Giving shared-access control must ship inside the coordinated browser module graph');

await import('./giving-pedagogue-hydration.test.mjs');
await import('./giving-pedagogue-second-pass.test.mjs');

console.log('giving-fec-boundary-page.test.mjs passed: FEC returns one bounded provider page, exposes continuation for an explicit next gesture, and carries the Pedagogue second-pass route-memory witness.');