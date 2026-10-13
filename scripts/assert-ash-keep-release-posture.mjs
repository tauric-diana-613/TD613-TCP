import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const ARTIFACT_ROOT = path.resolve('artifacts');
const release = JSON.parse(await fs.readFile('app/aperture/release.json', 'utf8'));
const receiptText = await fs.readFile('app/dome-world/docs/ASH_KEEP_V1_PRODUCTION_DEMO_RECEIPT.md', 'utf8');
const ash = release.ash || {};

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(ash.version === 'v1.0-alpha', 'Unexpected Ash Keep version.');
assert(ash.phase === 'ASH_KEEP_CASE_MAP_RUNTIME', 'Unexpected Ash Keep phase.');
assert(ash.transport === false, 'Release posture silently activated transport.');
assert(ash.automaticCinder === false, 'Release posture silently activated Cinder.');

let posture;
if (ash.status === 'IMPLEMENTATION_IN_PROGRESS' && ash.productionStatus === 'PREVIEW_PENDING') {
  assert(receiptText.includes('NOT_YET_EARNED'), 'Preview posture requires NOT_YET_EARNED receipt state.');
  assert(receiptText.includes('PROMOTION_WITHHELD'), 'Preview posture requires PROMOTION_WITHHELD receipt state.');
  posture = 'PREVIEW_PENDING';
} else if (ash.status === 'IMPLEMENTED_PRODUCTION_DEMONSTRATED' && ash.productionStatus === 'PRODUCTION_DEMONSTRATED') {
  assert(!receiptText.includes('NOT_YET_EARNED'), 'Production posture cannot retain NOT_YET_EARNED.');
  assert(receiptText.includes('IMPLEMENTED_PRODUCTION_DEMONSTRATED'), 'Production posture requires durable implemented status.');
  assert(receiptText.includes('PRODUCTION_DEMONSTRATED'), 'Production posture requires durable production status.');
  assert(receiptText.includes('Operator closure: `PRODUCTION_DEMONSTRATED`'), 'Production posture requires explicit operator closure.');
  posture = 'PRODUCTION_DEMONSTRATED';
} else {
  throw new Error(`Unrecognized or incoherent Ash Keep release posture: ${ash.status} / ${ash.productionStatus}`);
}

const body = {
  schema: 'td613.ash-keep.release-posture-verification/v0.1',
  ash_version: ash.version,
  ash_phase: ash.phase,
  status: ash.status,
  production_status: ash.productionStatus,
  posture,
  transport: ash.transport,
  automatic_cinder: ash.automaticCinder,
  receipt_sha256: sha256(receiptText),
  posture_preserved: true,
  promotion_authorized: false
};
const serializedBody = `${JSON.stringify(body, null, 2)}\n`;
const output = {
  ...body,
  verification_sha256: sha256(serializedBody)
};
const serializedOutput = `${JSON.stringify(output, null, 2)}\n`;
const receiptPath = String(process.env.TD613_RELEASE_POSTURE_RECEIPT_PATH || '').trim();

if (receiptPath) {
  const resolved = path.resolve(receiptPath);
  if (!resolved.startsWith(`${ARTIFACT_ROOT}${path.sep}`)) {
    throw new Error('Release posture receipt path must remain inside artifacts/.');
  }
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  await fs.writeFile(resolved, serializedOutput, 'utf8');
}

process.stdout.write(serializedOutput);
