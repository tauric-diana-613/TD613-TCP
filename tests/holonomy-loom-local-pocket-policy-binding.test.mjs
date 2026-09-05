import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  LOCAL_POCKET_ARTIFACT_SCHEMA as CANONICAL_ARTIFACT_SCHEMA,
  LOCAL_POCKET_CANONICAL_ROUTE_MODE,
  LOCAL_POCKET_EXPORT_SCHEMA as CANONICAL_EXPORT_SCHEMA
} from '../app/dome-world/holonomy-loom-local-pocket-policy.js';
import {
  LOCAL_POCKET_ARTIFACT_SCHEMA,
  LOCAL_POCKET_EXPORT_SCHEMA,
  buildLocalPocketManifest
} from '../scripts/holonomy-loom-local-pocket-v0-2-builder.mjs';

const builderSource = await readFile(
  new URL('../scripts/holonomy-loom-local-pocket-v0-2-builder.mjs', import.meta.url),
  'utf8'
);
const manifest = buildLocalPocketManifest();

assert.equal(LOCAL_POCKET_ARTIFACT_SCHEMA, CANONICAL_ARTIFACT_SCHEMA);
assert.equal(LOCAL_POCKET_EXPORT_SCHEMA, CANONICAL_EXPORT_SCHEMA);
assert.equal(manifest.schema, CANONICAL_ARTIFACT_SCHEMA);
assert.equal(manifest.route_mode, LOCAL_POCKET_CANONICAL_ROUTE_MODE);

assert.match(builderSource, /holonomy-loom-local-pocket-policy\.js/);
assert.equal(builderSource.includes("'td613.holonomy-loom.local-pocket-artifact/v0.2'"), false);
assert.equal(builderSource.includes("'td613.holonomy-loom.local-pocket-export/v0.2-born-minimized'"), false);
assert.equal(builderSource.includes("routeMode: 'LOCAL_POCKET'"), false);
assert.equal(builderSource.includes("route_mode: 'LOCAL_POCKET'"), false);

console.log('Holonomy Loom Local Pocket canonical policy binding: PASS');
