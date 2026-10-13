#!/usr/bin/env node
import {
  APERTURE_TOOL_PATH,
  findDefaultDownloadsAperture,
  normalizeCliPath,
  readHtmlArtifact,
  summarizeComparison
} from './lib/aperture-sync-lane.mjs';

const requested = normalizeCliPath(process.argv[2] || '');
const candidatePath = requested || await findDefaultDownloadsAperture();

if (!candidatePath) {
  console.error('No Aperture HTML path supplied and no default Downloads copy was found.');
  console.error('Usage: npm run aperture:compare -- "C:\\Users\\timst\\Downloads\\Aperture_vX_Y_Z.html"');
  process.exit(1);
}

const candidate = await readHtmlArtifact(candidatePath);
const repo = await readHtmlArtifact(APERTURE_TOOL_PATH);
const comparison = summarizeComparison(candidate, repo);

console.log(JSON.stringify(comparison, null, 2));
