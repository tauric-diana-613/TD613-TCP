import path from 'node:path';

const artifactRoot = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-a15-r0';
await import('./ash-a15-r0-preview-probe-core.mjs');

const previousArtifactDir = process.env.TD613_ARTIFACT_DIR;
process.env.TD613_ARTIFACT_DIR = path.join(artifactRoot, 'holonomy-loom-local-pocket');
try {
  await import('./holonomy-loom-local-pocket-browser-probe.mjs');
} finally {
  if (previousArtifactDir === undefined) delete process.env.TD613_ARTIFACT_DIR;
  else process.env.TD613_ARTIFACT_DIR = previousArtifactDir;
}
