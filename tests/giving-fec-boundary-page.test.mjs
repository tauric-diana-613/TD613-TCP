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
assert.match(resilience, /const TARGET_RECORDS = 300;/, 'FEC client may still assemble a bounded continuation window');
assert.match(resilience, /const MAX_BOUNDARY_PAGES = 3;/, 'FEC client boundary traversal must remain bounded');
assert.match(resilience, /const MAX_ZERO_PROGRESS_REPLAYS = 1;/, 'zero-progress FEC replay must have a hard fuse');
assert.match(resilience, /pageRecords\.length === 0 && nextContinuation/, 'FEC resilience must detect replay without evidence progress');
assert.match(resilience, /continuation = null;\s*break;/, 'FEC no-progress replay must terminate continuation traversal');
assert.match(resilience, /zero_progress_replays:/, 'FEC client receipt must expose no-progress replay count');

const pagingLoader = read('app/giving/history/giving-review-paging.js');
assert.match(pagingLoader, /giving-page-size\.js\?v=20260814-1/, 'FEC page-size repair must use a fresh browser asset epoch');
assert.match(pagingLoader, /giving-fec-resilience\.js\?v=20260814-1/, 'FEC resilience repair must use a fresh browser asset epoch');

const bootstrap = read('app/giving/history/giving-bootstrap.js');
assert.match(bootstrap, /GIVING_ASSET_EPOCH = '20260816-4'/, 'Giving bootstrap must refresh the complete coordinated module graph');
assert.match(bootstrap, /giving-shared-access\.js/, 'Giving shared-access control must ship inside the coordinated browser module graph');

console.log('giving-fec-boundary-page.test.mjs passed: source ceilings remain compatible while bounded client pages cannot be widened.');
