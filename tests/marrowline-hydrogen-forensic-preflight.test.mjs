import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import {
  CONTRADICTION_FREE_CREATIVE_TASK,
  HYDROGEN_BACKUP_EXPERIMENT_ID,
  HYDROGEN_PRIMARY_EXPERIMENT_ID,
  buildBackupArgonCompactManifest,
  buildHydrogenForensicPreflightManifest,
  buildPrimaryPrefixSeparatorManifest
} from '../research/marrowline-hydrogen-handoff-20261122/hydrogen-next-experiment-preflight.mjs';
import { FROZEN_STAGE1_SLOT_WIRE_MANIFEST } from '../research/marrowline-argon-post-rollback-reconciliation-20261122/argon-be-lexical-discriminator-preflight.mjs';

test('Hydrogen forensic preflight executes zero network calls and preserves parity', () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error('NETWORK_FORBIDDEN_IN_HYDROGEN_PREFLIGHT');
  };
  try {
    const manifest = buildHydrogenForensicPreflightManifest();
    assert.equal(manifest.paidProviderCallsExecuted, 0);
    assert.equal(manifest.liveDispatchSupportedByThisModule, false);

    const primary = buildPrimaryPrefixSeparatorManifest();
    assert.equal(primary.experimentId, HYDROGEN_PRIMARY_EXPERIMENT_ID);
    assert.equal(primary.slots.length, 2);
    assert.equal(primary.parity.contentsSha256Equal, true);
    assert.equal(primary.parity.generationConfigSha256Equal, true);
    assert.equal(primary.parity.contradictionRemovedFromContents, true);
    assert.equal(CONTRADICTION_FREE_CREATIVE_TASK.includes('Do not use Markdown or headings.'), false);
    assert.notEqual(
      primary.slots[0].observation.systemInstructionSha256,
      primary.slots[1].observation.systemInstructionSha256
    );
    assert.equal(
      primary.slots[0].observation.bodySha256 === primary.slots[1].observation.bodySha256,
      false
    );

    const backup = buildBackupArgonCompactManifest();
    assert.equal(backup.experimentId, HYDROGEN_BACKUP_EXPERIMENT_ID);
    assert.equal(backup.slots.length, 2);
    assert.equal(backup.parity.contentsSha256Equal, true);
    assert.equal(backup.parity.generationConfigSha256Equal, true);
    // Backup B1_S01 must match Argon's frozen S01 wire body exactly on gemini-4-argon
    assert.equal(
      backup.slots[0].observation.bodySha256,
      FROZEN_STAGE1_SLOT_WIRE_MANIFEST.S01.bodySha256
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Hydrogen preflight module contains no fetch/network dispatch and rejects live flags', () => {
  const source = fs.readFileSync(
    new URL('../research/marrowline-hydrogen-handoff-20261122/hydrogen-next-experiment-preflight.mjs', import.meta.url),
    'utf8'
  );
  assert.equal(/\bfetch\s*\(/.test(source), false);
  for (const flag of ['--execute', '--paid', '--deploy', '--dispatch']) {
    assert.throws(() => {
      execFileSync(
        process.execPath,
        ['research/marrowline-hydrogen-handoff-20261122/hydrogen-next-experiment-preflight.mjs', flag],
        { cwd: new URL('..', import.meta.url), stdio: 'pipe' }
      );
    });
  }
});
