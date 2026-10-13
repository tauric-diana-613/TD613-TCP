import fs from 'node:fs';
import path from 'node:path';

let sealing = false;
function sealFailure(kind, value) {
  if (sealing) return;
  sealing = true;
  const error = value instanceof Error ? value : new Error(String(value));
  const receipt = {
    schema:'td613.static-contract-failure/v0.1',
    status:'HOLD_FOR_REPAIR',
    kind,
    test_file:path.relative(process.cwd(), process.argv[1] || 'unknown'),
    message:error.message,
    stack:error.stack || String(error),
    observed_at:new Date().toISOString(),
    browser_installed:false,
    deployment_authorized:false,
    authority_changed:false,
    human_closure_required:true
  };
  fs.mkdirSync('artifacts/static-contracts', { recursive:true });
  fs.writeFileSync('artifacts/static-contracts/latest-failure.json', `${JSON.stringify(receipt, null, 2)}\n`);
  console.error(`[TD613 static contract HOLD] ${receipt.test_file}: ${receipt.message}`);
  process.exitCode = 1;
}

process.once('uncaughtException', error => {
  sealFailure('uncaughtException', error);
  setImmediate(() => process.exit(1));
});
process.once('unhandledRejection', error => {
  sealFailure('unhandledRejection', error);
  setImmediate(() => process.exit(1));
});
