#!/usr/bin/env node
import path from 'node:path';
import {
  APERTURE_DIR,
  APERTURE_TOOL_PATH,
  defaultDownloadsDir,
  normalizeCliPath,
  readHtmlArtifact,
  readText,
  sha256,
  summarizeArtifact,
  writeJson,
  writeText
} from './lib/aperture-sync-lane.mjs';
import {
  APERTURE_PEDAGOGUE_PACKAGE,
  composeShareableApertureHtml
} from './lib/aperture-pedagogue-package.mjs';

const requestedOutputDir = normalizeCliPath(process.argv[2] || '');
const outputDir = requestedOutputDir || defaultDownloadsDir();
const repo = await readHtmlArtifact(APERTURE_TOOL_PATH);
const surfaceModuleSource = await readText(path.join(APERTURE_DIR, 'pedagogue-surface.js'));
const discovery = JSON.parse(await readText(path.join(APERTURE_DIR, 'counter-tool-discovery.json')));
const packagedHtml = composeShareableApertureHtml({
  coreHtml: repo.html,
  surfaceModuleSource,
  discovery
});

const version = repo.metadata.version || 'unversioned';
const safeVersion = version.replace(/\./g, '_');
const canonicalPath = path.join(outputDir, 'Aperture.html');
const versionedPath = path.join(outputDir, `Aperture_${safeVersion}.html`);
const manifestPath = path.join(outputDir, `Aperture_${safeVersion}.manifest.json`);

await writeText(canonicalPath, packagedHtml);
await writeText(versionedPath, packagedHtml);

const manifest = {
  schema: 'td613.aperture.sync-lane.export/v1',
  exportedAt: new Date().toISOString(),
  source: APERTURE_TOOL_PATH,
  outputs: [canonicalPath, versionedPath],
  artifact: summarizeArtifact(repo),
  packaged: {
    bytes: Buffer.byteLength(packagedHtml),
    sha256: sha256(packagedHtml),
    pedagogueSurface: APERTURE_PEDAGOGUE_PACKAGE.schema,
    counterToolDiscovery: discovery.schema,
    singleFile: true,
    externalRuntimeDependency: false
  }
};

await writeJson(manifestPath, manifest);

console.log('Repo-approved Aperture exported with the Pedagogue surface inlined.');
console.log(JSON.stringify({
  version: manifest.artifact.version,
  schema: manifest.artifact.schema,
  outputs: manifest.outputs,
  packaged: manifest.packaged
}, null, 2));
