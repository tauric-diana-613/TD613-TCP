import { exportRepoApertureToDownloads } from './lib/aperture-sync-lane.mjs';

const apertureExport = await exportRepoApertureToDownloads();
console.log('[TD613 consolidated CI] maintained Aperture download prepared');
console.log(JSON.stringify({
  schema:'td613.workflow-estate.aperture-download-preflight/v0.1',
  version:apertureExport.artifact.version,
  outputs:apertureExport.outputs,
  deployment_authorized:false,
  authority_changed:false
}, null, 2));

await import('./run-td613-consolidated-contracts-worker.mjs');
