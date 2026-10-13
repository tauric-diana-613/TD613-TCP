#!/usr/bin/env node

import { compileLoomDemoScene } from '../app/dome-world/holonomy-loom/semantic-field.js';
import {
  compileDollhousePortableProjection,
  operateDollhousePortableProjection,
  revalidateDollhousePortableReturn
} from '../app/engine/dollhouse-portable-aia-roundtrip.js';

function fail(message) {
  console.error(message);
  console.error('Usage: node scripts/run-dollhouse-portable-roundtrip.mjs [scene=3] [receiver=companion] [operation=EXPLAIN_STATE] [action]');
  process.exitCode = 2;
}

const [sceneRaw = '3', receiver = 'companion', operation = 'EXPLAIN_STATE', action] = process.argv.slice(2);
const sceneIndex = Number.parseInt(sceneRaw, 10);

if (!Number.isInteger(sceneIndex) || sceneIndex < 0 || sceneIndex > 7) {
  fail('scene must be an integer from 0 to 7');
} else {
  try {
    const packet = compileLoomDemoScene(sceneIndex, { sourceRevision: 'working-tree' });
    const projection = compileDollhousePortableProjection(packet, { receiver });
    const input = { operation };
    if (action) input.proposedAction = action;
    const candidate = operateDollhousePortableProjection(projection, input);
    const revalidation = revalidateDollhousePortableReturn(packet, candidate);
    console.log(JSON.stringify({ projection, candidate, revalidation }, null, 2));
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}
