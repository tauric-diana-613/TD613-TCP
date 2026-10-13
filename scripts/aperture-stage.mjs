#!/usr/bin/env node
import { normalizeCliPath, writeStage } from './lib/aperture-sync-lane.mjs';

const candidatePath = normalizeCliPath(process.argv[2] || '');

if (!candidatePath) {
  console.error('Usage: npm run aperture:stage -- "C:\\Users\\timst\\Downloads\\Aperture_vX_Y_Z.html"');
  process.exit(1);
}

const manifest = await writeStage(candidatePath);

console.log('Aperture candidate staged without mutating the live repo.');
console.log(JSON.stringify({
  stagedPath: manifest.stagedPath,
  report: '.aperture-staging/report.md',
  status: manifest.comparison.status,
  recommendation: manifest.comparison.recommendation,
  candidateVersion: manifest.candidate.version,
  repoVersion: manifest.repo.version
}, null, 2));
