// TD613 · Marrowline R2-W · Independent Authentic Whole-Frame Artistic Observation Executable
// Commission: TD613-MARROWLINE-R2-LIVE-RUNNER-20261123
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// SECURITY BOUNDARY: FAIL-CLOSED OFFLINE BY DEFAULT. Zero R2-U cross-estate execution.

import { pathToFileURL } from 'node:url';
import {
  R2_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256,
  executeR2ObservationExecutable,
  runEstateRunnerCli
} from './r2-runner-cli-common.mjs';

export { R2_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 };

export async function executeR2WObservation(options = {}) {
  return executeR2ObservationExecutable('R2-W', options);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runEstateRunnerCli('R2-W', process.argv.slice(2)).then((summary) => {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  }).catch((error) => {
    process.stderr.write(`${error?.code || error?.name || 'ERROR'}: ${error?.message || error}\n`);
    process.exitCode = 1;
  });
}
