#!/usr/bin/env node
import { promoteStagedCandidate } from './lib/aperture-sync-lane.mjs';

const promotion = await promoteStagedCandidate();

console.log('Staged Aperture candidate promoted into the repo.');
console.log(JSON.stringify({
  version: promotion.repoAfter.version,
  schema: promotion.repoAfter.schema,
  featureVersion: promotion.repoAfter.featureVersion,
  cacheToken: promotion.cacheToken,
  report: '.aperture-staging/promotion.md',
  changed: [
    'app/aperture/tool.html',
    'app/aperture/index.html',
    'app/aperture/release.json',
    'app/asset-versions.js',
    'app/engine/td613-aperture.js'
  ]
}, null, 2));
