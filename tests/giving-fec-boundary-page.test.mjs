import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (filePath) => fs.readFileSync(path.join(root, filePath), 'utf8');

const pageSize = read('app/giving/history/giving-page-size.js');
assert.match(pageSize, /const FEC_SOURCE_ID = 'fec-schedule-a';/, 'Giving must identify the OpenFEC source explicitly');
assert.match(pageSize, /const FEC_BOUNDARY_PAGE_SIZE = 100;/, 'OpenFEC must stay at one provider page per Giving boundary');
assert.match(pageSize, /body\.payload\.source_instance_id === FEC_SOURCE_ID/, 'FEC page-size override must be source-specific');
assert.match(pageSize, /\? FEC_BOUNDARY_PAGE_SIZE\s*:\s*PAGE_SIZE;/, 'non-FEC sources must retain the 300-row Giving page size');

const resilience = read('app/giving/history/giving-fec-resilience.js');
assert.match(resilience, /const TARGET_RECORDS = 300;/, 'FEC client may still assemble up to 300 retained records');
assert.match(resilience, /const MAX_BOUNDARY_PAGES = 3;/, 'FEC client boundary traversal must remain bounded');
assert.match(resilience, /const MAX_ZERO_PROGRESS_REPLAYS = 1;/, 'zero-progress FEC replay must have a hard fuse');
assert.match(resilience, /pageRecords\.length === 0 && nextContinuation/, 'FEC resilience must detect replay without evidence progress');
assert.match(resilience, /continuation = null;\s*break;/, 'FEC no-progress replay must terminate continuation traversal');
assert.match(resilience, /zero_progress_replays:/, 'FEC client receipt must expose no-progress replay count');

const pagingLoader = read('app/giving/history/giving-review-paging.js');
assert.match(pagingLoader, /giving-page-size\.js\?v=20260814-1/, 'FEC page-size repair must use a fresh browser asset epoch');
assert.match(pagingLoader, /giving-fec-resilience\.js\?v=20260814-1/, 'FEC resilience repair must use a fresh browser asset epoch');

const bootstrap = read('app/giving/history/giving-bootstrap.js');
assert.match(bootstrap, /GIVING_ASSET_EPOCH = '20260814-1'/, 'Giving bootstrap must refresh the repaired module graph');

console.log('giving-fec-boundary-page.test.mjs passed: one OpenFEC provider page per boundary with a one-replay no-progress fuse.');
