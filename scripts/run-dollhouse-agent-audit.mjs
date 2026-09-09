#!/usr/bin/env node

import {
  loomComparedSurfacesToFadt,
  runAtlasAgent,
  runFadtAgent
} from '../app/engine/dollhouse-atlas-fadt.js';
import { compileLoomDemoScene } from '../app/dome-world/holonomy-loom/semantic-field.js';

function usage() {
  console.error('Usage: node scripts/run-dollhouse-agent-audit.mjs atlas [scene-index] | fadt [scene-index]');
  process.exitCode = 2;
}

const [agentRaw, sceneRaw] = process.argv.slice(2);
const agent = String(agentRaw || '').toLowerCase();
const defaultScene = agent === 'fadt' ? 5 : 3;
const sceneIndex = sceneRaw === undefined ? defaultScene : Number.parseInt(sceneRaw, 10);

if (!Number.isInteger(sceneIndex) || sceneIndex < 0 || sceneIndex > 7) {
  usage();
} else if (agent === 'atlas') {
  const scene = compileLoomDemoScene(sceneIndex, { sourceRevision: 'working-tree' });
  console.log(JSON.stringify(runAtlasAgent(scene), null, 2));
} else if (agent === 'fadt') {
  const scene = compileLoomDemoScene(sceneIndex, { sourceRevision: 'working-tree' });
  console.log(JSON.stringify(runFadtAgent(loomComparedSurfacesToFadt(scene)), null, 2));
} else {
  usage();
}
