import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import {
  CONTRADICTION_FREE_CREATIVE_TASK,
  HYDROGEN_BACKUP_EXPERIMENT_ID,
  HYDROGEN_PRIMARY_EXPERIMENT_ID,
  R1_SECTION_COVERAGE_CLAUSE_BOTH,
  R1_SECTION_COVERAGE_CLAUSE_PLAIN_FIRST,
  R1_TWO_HEADINGS_PLAIN_FIRST_LINE,
  R1_TWO_HEADINGS_ZALGO_BOTH_LINE,
  buildBackupArgonCompactManifest,
  buildHydrogenForensicPreflightManifest,
  buildPrimaryPrefixSeparatorManifest
} from '../research/marrowline-hydrogen-handoff-20261122/hydrogen-next-experiment-preflight.mjs';
import { FROZEN_STAGE1_SLOT_WIRE_MANIFEST } from '../research/marrowline-argon-post-rollback-reconciliation-20261122/argon-be-lexical-discriminator-preflight.mjs';

const FROZEN_R1_MANIFEST = Object.freeze({
  R1_S01: Object.freeze({
    bodySha256: 'f2fcdf77d7d14843447f061759f9d5817bc000e52698b5b78eb5f3f886022a02',
    modelAndBodySha256: '9c808d7de26887a55148ba62f05b1e12e4b896d825792c246727c3c6fb7b97ed',
    systemInstructionSha256: '78df5f9b5ad6ceefa8ce10071b40194e8ace56226fefef186ba4e1e5c7a1079c',
    contentsSha256: 'e056b75319141b145903441d1156bbf4f7fa3f15e14de5dd007cf812d8486998',
    generationConfigSha256: '38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c',
    countTokensRequestSha256: '578a43e1e0bc078766744703d1116963338207a6969c66e0673623107153c582',
    utf8Bytes: 1770
  }),
  R1_S02: Object.freeze({
    bodySha256: '29b3265a5060666c1b19f905a7a528a7613c6d6b9e8566156da3c2b5cb022399',
    modelAndBodySha256: '903d9aef749b34ffdb46b65c3c3766e5219497d5778900c06a7f599811e01d8e',
    systemInstructionSha256: '7c48aeda766e4e10c63b048f6cee990ec126baac8f5cd419769e410d0ca0274b',
    contentsSha256: 'e056b75319141b145903441d1156bbf4f7fa3f15e14de5dd007cf812d8486998',
    generationConfigSha256: '38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c',
    countTokensRequestSha256: '965fcb6cea4ca9b20681f783c3e22fecf83afd4552e7e75f117388665a078fc3',
    utf8Bytes: 1936
  })
});

test('Hydrogen forensic preflight executes zero network calls, removes contents conflicts, and locks exact R1/B1 digests', () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error('NETWORK_FORBIDDEN_IN_HYDROGEN_PREFLIGHT');
  };
  try {
    const manifest = buildHydrogenForensicPreflightManifest();
    assert.equal(manifest.paidProviderCallsExecuted, 0);
    assert.equal(manifest.liveDispatchSupportedByThisModule, false);

    // R1-01: Zero contents-vs-system heading or entire-passage coverage conflict in either arm
    assert.equal(CONTRADICTION_FREE_CREATIVE_TASK.includes('Do not use Markdown or headings.'), false);
    assert.equal(CONTRADICTION_FREE_CREATIVE_TASK.includes('entire passage'), false);
    assert.ok(CONTRADICTION_FREE_CREATIVE_TASK.includes('Follow the system section directives'));
    assert.ok(R1_TWO_HEADINGS_ZALGO_BOTH_LINE.includes('plain, unmarked standalone section headings'));
    assert.ok(R1_TWO_HEADINGS_PLAIN_FIRST_LINE.includes('plain, unmarked standalone section headings'));
    assert.equal(
      R1_TWO_HEADINGS_ZALGO_BOTH_LINE.replace(R1_SECTION_COVERAGE_CLAUSE_BOTH, R1_SECTION_COVERAGE_CLAUSE_PLAIN_FIRST),
      R1_TWO_HEADINGS_PLAIN_FIRST_LINE
    );

    const primary = buildPrimaryPrefixSeparatorManifest();
    assert.equal(primary.experimentId, HYDROGEN_PRIMARY_EXPERIMENT_ID);
    assert.equal(primary.slots.length, 2);
    assert.equal(primary.parity.contentsSha256Equal, true);
    assert.equal(primary.parity.generationConfigSha256Equal, true);
    assert.equal(primary.parity.contradictionRemovedFromContents, true);
    assert.equal(primary.parity.entirePassageCoverageConflictRemoved, true);
    assert.equal(primary.parity.singleSemanticClauseDiffVerified, true);

    for (const slot of primary.slots) {
      const expected = FROZEN_R1_MANIFEST[slot.slot];
      assert.ok(expected, `missing frozen R1 slot ${slot.slot}`);
      assert.equal(slot.observation.bodySha256, expected.bodySha256);
      assert.equal(slot.observation.modelAndBodySha256, expected.modelAndBodySha256);
      assert.equal(slot.observation.systemInstructionSha256, expected.systemInstructionSha256);
      assert.equal(slot.observation.contentsSha256, expected.contentsSha256);
      assert.equal(slot.observation.generationConfigSha256, expected.generationConfigSha256);
      assert.equal(slot.observation.utf8Bytes, expected.utf8Bytes);
      assert.equal(slot.countTokensRequestSha256, expected.countTokensRequestSha256);
    }

    const backup = buildBackupArgonCompactManifest();
    assert.equal(backup.experimentId, HYDROGEN_BACKUP_EXPERIMENT_ID);
    assert.equal(backup.comparisonClass, 'COMPOSITE_FEASIBILITY_AND_BASELINE_CONTRAST_NOT_SINGLE_FACTOR_ISOLATION');
    assert.equal(backup.priorOriginalWireArgonBaselineCount, 0);
    assert.equal(backup.replicatesPerArm, 1);
    assert.equal(backup.grandfatheredFromOldBESigningScaffold, false);
    assert.equal(backup.slots.length, 2);
    assert.equal(backup.parity.contentsSha256Equal, true);
    assert.equal(backup.parity.generationConfigSha256Equal, true);
    assert.equal(
      backup.slots[0].observation.bodySha256,
      FROZEN_STAGE1_SLOT_WIRE_MANIFEST.S01.bodySha256
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Committed HYDROGEN_NEXT_EXPERIMENT_PREFLIGHT.json is canonical UTF-8 without BOM, LF, and byte-identical to builder', () => {
  const jsonUrl = new URL('../research/marrowline-hydrogen-handoff-20261122/HYDROGEN_NEXT_EXPERIMENT_PREFLIGHT.json', import.meta.url);
  const rawBytes = fs.readFileSync(jsonUrl);
  assert.equal(
    rawBytes.length >= 3 && rawBytes[0] === 0xef && rawBytes[1] === 0xbb && rawBytes[2] === 0xbf,
    false,
    'UTF-8 BOM is forbidden'
  );
  const rawText = rawBytes.toString('utf8');
  assert.equal(rawText.includes('\r\n'), false, 'CRLF is forbidden; LF required');
  const regenerated = `${JSON.stringify(buildHydrogenForensicPreflightManifest(), null, 2)}\n`;
  assert.equal(rawText, regenerated, 'Committed JSON manifest must match builder output byte-for-byte');
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
