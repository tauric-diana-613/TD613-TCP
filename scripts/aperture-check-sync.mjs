#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  APERTURE_INDEX_PATH,
  APERTURE_TOOL_PATH,
  ASSET_VERSIONS_PATH,
  readHtmlArtifact,
  readText
} from './lib/aperture-sync-lane.mjs';

const tool = await readHtmlArtifact(APERTURE_TOOL_PATH);
const index = await readHtmlArtifact(APERTURE_INDEX_PATH);
const assetVersions = await readText(ASSET_VERSIONS_PATH);

const indexVersion = index.metadata.version;
const iframeToken = index.metadata.cacheToken;
const assetToken = assetVersions.match(/\baperture:\s*['"]([^'"]+)['"]/)?.[1] || null;

assert.ok(tool.metadata.version, 'app/aperture/tool.html has no detected Aperture version');
assert.equal(indexVersion, tool.metadata.version, 'app/aperture/index.html aperture-version does not match tool.html');
assert.ok(iframeToken, 'app/aperture/index.html iframe cache token missing');
assert.equal(assetToken, iframeToken, 'app/asset-versions.js aperture token does not match index iframe token');
assert.ok(tool.metadata.blocks.doctrineKernel, 'Doctrine kernel block missing from tool.html');
assert.ok(tool.metadata.globals.gatewayEmbed, 'Gateway embed global missing from tool.html');

console.log(JSON.stringify({
  status: 'pass',
  version: tool.metadata.version,
  schema: tool.metadata.schema,
  featureVersion: tool.metadata.featureVersion,
  cacheToken: iframeToken,
  duplicateIdWarnings: tool.metadata.duplicateIds.length,
  mojibakeSignals: tool.metadata.mojibakeSignals
}, null, 2));
