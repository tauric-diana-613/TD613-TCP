#!/usr/bin/env node
import { exportRepoApertureToDownloads, normalizeCliPath } from './lib/aperture-sync-lane.mjs';

const outputDir = normalizeCliPath(process.argv[2] || '');
const manifest = await exportRepoApertureToDownloads(outputDir || undefined);

console.log('Repo-approved Aperture exported.');
console.log(JSON.stringify({
  version: manifest.artifact.version,
  schema: manifest.artifact.schema,
  outputs: manifest.outputs
}, null, 2));
