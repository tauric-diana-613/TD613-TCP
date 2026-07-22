import { readFileSync, writeFileSync } from 'node:fs';

function replaceOnce(path, before, after) {
  const source = readFileSync(path, 'utf8');
  if (!source.includes(before)) throw new Error(`Expected integration seam missing in ${path}`);
  if (source.indexOf(before) !== source.lastIndexOf(before)) throw new Error(`Integration seam is not unique in ${path}`);
  writeFileSync(path, source.replace(before, after));
}

replaceOnce(
  'app/safe-harbor/app/safe-harbor-native-finalizer.js',
  "import { buildPhase5ReplayHardening, applyPhase5Quarantine, detectStaleV3 } from './safe-harbor-phase5-replay-hardening.js';\n",
  "import { buildPhase5ReplayHardening, applyPhase5Quarantine, detectStaleV3 } from './safe-harbor-phase5-replay-hardening.js';\nimport { applyGen3Stage1Prehash } from './safe-harbor-gen3-evidence-contract.js';\n"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-native-finalizer.js',
  "  'forensic_authorship',\n  'signature.sig',",
  "  'forensic_authorship',\n  'binding_provenance.entrant_authorship_binding',\n  'temporal_lineage.entrant_countersignature_authority',\n  'gen3_evidence_contract',\n  'signature.sig',"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-native-finalizer.js',
  "  const out = clone(packet);\n",
  "  let out = clone(packet);\n"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-native-finalizer.js',
  "  await attachNativeV3Issuance(out, { allowV3Rebuild: context.allowV3Rebuild === true });\n  attachPacketCapabilities(out, mode);",
  "  await attachNativeV3Issuance(out, { allowV3Rebuild: context.allowV3Rebuild === true });\n  if (context.includeGen3Stage1 === true) {\n    out = applyGen3Stage1Prehash(out, {\n      ...(context.gen3Context || {}),\n      segments: context.segments || context.gen3Context?.segments || {}\n    });\n  }\n  attachPacketCapabilities(out, mode);"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-packet-pipeline.js',
  "import { verifyHashReplay } from './safe-harbor-authority-verifier.js?v=202606290125';\n",
  "import { verifyHashReplay } from './safe-harbor-authority-verifier.js?v=202606290125';\nimport { finalizeGen3Stage1Overlay } from './safe-harbor-gen3-evidence-contract.js';\n"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-packet-pipeline.js',
  "    allowV3Rebuild: false,\n    rawTextExportAllowed: false\n  });\n  return normalizePacketThroughPipeline(finalized, saved, { ...options, skipFinalize: true });",
  "    allowV3Rebuild: false,\n    rawTextExportAllowed: false,\n    includeGen3Stage1: true,\n    gen3Context: {\n      promptSetVersion: options.promptSetVersion || 'temporal-triad/v2',\n      uiVersion: options.uiVersion || 'pre-temporal-bloom',\n      reducedMotion: Boolean(options.reducedMotion),\n      promptTextDigests: options.promptTextDigests || {}\n    }\n  });\n  const overlaid = finalizeGen3Stage1Overlay(finalized);\n  return normalizePacketThroughPipeline(overlaid, saved, { ...options, skipFinalize: true });"
);

replaceOnce(
  'package.json',
  '    "test:safe-harbor:current": "npm run test:safe-harbor:phase7 && npm run test:safe-harbor:phase8 && npm run test:safe-harbor:phase9 && npm run test:safe-harbor:phase9.1 && npm run test:safe-harbor:ui-surfaces && npm run test:safe-harbor:phase9.1b && npm run test:safe-harbor:phase9.1c && node tests/tcp-smoke.test.mjs",\n',
  '    "test:safe-harbor:current": "npm run test:safe-harbor:phase7 && npm run test:safe-harbor:phase8 && npm run test:safe-harbor:phase9 && npm run test:safe-harbor:phase9.1 && npm run test:safe-harbor:ui-surfaces && npm run test:safe-harbor:phase9.1b && npm run test:safe-harbor:phase9.1c && node tests/tcp-smoke.test.mjs",\n    "test:safe-harbor:gen3:stage1": "node tests/safe-harbor-gen3-stage1-evidence-contract.test.mjs",\n'
);

replaceOnce(
  'tests/safe-harbor-gen3-stage1-evidence-contract.test.mjs',
  "    intake: { ts_utc: '2026-07-22T00:00:00Z', status: 'issued' },",
  "    binding_provenance: {\n      schema_version: 'td613.safe-harbor.binding-provenance/v1',\n      principal: 'tauric.diana.613',\n      claim: {},\n      canonical_declaration: {},\n      binding_event: { recorded_ts_utc: '2025-08-11T03:58:39Z' },\n      legacy_corpus_root: {},\n      symbol_roles: {},\n      evidence_status: {},\n      claim_ceiling: 'Synthetic fixture; packet-internal custody only.'\n    },\n    intake: { ts_utc: '2026-07-22T00:00:00Z', status: 'issued' },"
);

replaceOnce(
  'tests/safe-harbor-gen3-stage1-evidence-contract.test.mjs',
  "const finalized = await finalizeSafeHarborPacket(prehash, {\n  mode: 'native',\n  segments,\n  includePhase5: true,\n  includeTamperFixtures: false\n});\nconst overlaid = finalizeGen3Stage1Overlay(finalized);",
  "const baselineFinalized = await finalizeSafeHarborPacket(packetFixture(), {\n  mode: 'native',\n  segments,\n  includePhase5: true,\n  includeTamperFixtures: false\n});\nconst finalized = await finalizeSafeHarborPacket(packetFixture(), {\n  mode: 'native',\n  segments,\n  includePhase5: true,\n  includeTamperFixtures: false,\n  includeGen3Stage1: true,\n  gen3Context: { promptSetVersion: 'temporal-triad/v2' }\n});\nassert.equal(finalized.issuance.stylometric_fingerprint_v3, baselineFinalized.issuance.stylometric_fingerprint_v3, 'Stage 1 must not migrate the SH3 fingerprint preimage');\nassert.equal(finalized.issuance.badge_number_v3, baselineFinalized.issuance.badge_number_v3, 'Stage 1 must not migrate the SH3 credential');\nconst overlaid = finalizeGen3Stage1Overlay(finalized);"
);

replaceOnce(
  'tests/safe-harbor-gen3-stage1-evidence-contract.test.mjs',
  "assert.equal(buildSamplingSufficiency({ future_self: makeWords('a', 119), past_self: makeWords('b', 120), higher_self: makeWords('c', 240) }).lanes.higher_self.state, 'comparative');\n",
  "assert.equal(buildSamplingSufficiency({ future_self: makeWords('a', 119), past_self: makeWords('b', 120), higher_self: makeWords('c', 240) }).lanes.higher_self.state, 'comparative');\nassert.equal(buildSamplingSufficiency({ future_self: makeWords('a', 239), past_self: makeWords('b', 359), higher_self: makeWords('c', 360) }).lanes.future_self.state, 'provisional');\nassert.equal(buildSamplingSufficiency({ future_self: makeWords('a', 239), past_self: makeWords('b', 359), higher_self: makeWords('c', 360) }).lanes.past_self.state, 'comparative');\nassert.equal(buildSamplingSufficiency({ future_self: makeWords('a', 239), past_self: makeWords('b', 359), higher_self: makeWords('c', 360) }).lanes.higher_self.state, 'stability-eligible');\n"
);

console.log('safe-harbor-gen3-stage1 integration patch applied');
