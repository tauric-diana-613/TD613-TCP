import { readFileSync, writeFileSync } from 'node:fs';

function replaceOnce(path, before, after) {
  const source = readFileSync(path, 'utf8');
  if (!source.includes(before)) throw new Error(`Wave B release seam missing in ${path}: ${before.slice(0, 120)}`);
  if (source.indexOf(before) !== source.lastIndexOf(before)) throw new Error(`Wave B release seam is not unique in ${path}: ${before.slice(0, 120)}`);
  writeFileSync(path, source.replace(before, after));
}

const releasePath = '.github/workflows/vercel-operator-release.yml';
replaceOnce(releasePath, '          safe_harbor_wave_a = required\n', '          safe_harbor_wave_b = required\n');
replaceOnce(
  releasePath,
  '          The gate will run the complete Safe Harbor Gen3 Wave A, Flow-Core, and Ash Keep AIA3 closures; choose one bounded credential route; deploy once; observe exact production content; and run the governed browser matrices. ⟐\n',
  '          The gate will run the complete Safe Harbor Gen3 Wave B, Research Track R boundary, Flow-Core, and Ash Keep AIA3 closures; choose one bounded credential route; deploy once; observe exact production content; and run the governed browser matrices. ⟐\n'
);
replaceOnce(
  releasePath,
  '      - name: Verify release-critical, Safe Harbor Wave A, Flow-Core, and Ash Keep AIA3 closure contracts\n',
  '      - name: Verify release-critical, Safe Harbor Wave B, Flow-Core, and Ash Keep AIA3 closure contracts\n'
);
replaceOnce(
  releasePath,
  `          npm run test:safe-harbor:gen3:wave-a
          npm run test:safe-harbor:phase9.1c
          npm run test:safe-harbor:current`,
  `          npm run test:safe-harbor:gen3:wave-b
          npm run test:safe-harbor:gen3:track-r
          npm run test:safe-harbor:phase9.1c
          npm run test:safe-harbor:current
          node tests/safe-harbor-gen3-wave-b-production-probe-contract.test.mjs`
);
replaceOnce(
  releasePath,
  '          node --check scripts/safe-harbor-gen3-wave-a-production-probe.mjs\n',
  `          node --check scripts/safe-harbor-gen3-wave-a-production-probe.mjs
          node --check scripts/safe-harbor-gen3-wave-b-production-assets.mjs
          node --check scripts/safe-harbor-gen3-wave-b-production-probe.mjs
`
);
replaceOnce(
  releasePath,
  `      - name: Observe the deployed Flow-Core browser matrix
`,
  `      - name: Observe deployed Safe Harbor Gen3 Wave B
        env:
          TD613_BASE_URL: \${{ steps.deployed.outputs.url }}
          TD613_SOURCE_PACKET_COMMIT: \${{ steps.authorize.outputs.selected_sha }}
          TD613_ARTIFACT_DIR: artifacts/safe-harbor-gen3-wave-b-production
        run: node scripts/safe-harbor-gen3-wave-b-production-probe.mjs

      - name: Observe the deployed Flow-Core browser matrix
`
);
replaceOnce(
  releasePath,
  `          const safeHarbor = JSON.parse(fs.readFileSync('artifacts/safe-harbor-gen3-wave-a-production/safe-harbor-gen3-wave-a-production-observation.json', 'utf8'));
          if (content.status !== 'PASS' || content.exact_source_content_verified !== true || content.application_tree_drift !== 'none') throw new Error('Exact production content observation held.');
          if (safeHarbor.status !== 'PASS') throw new Error('Production Safe Harbor Gen3 Wave A observation held.');
          if (safeHarbor.source_packet_commit !== content.source_packet_commit) throw new Error('Safe Harbor and Flow-Core observations disagree on the source packet.');
          if (safeHarbor.authority?.counts_as_identity_adjudication !== false || safeHarbor.authority?.counts_as_external_authorship_adjudication !== false || safeHarbor.authority?.authorizes_research_track_r_promotion !== false || safeHarbor.authority?.authorizes_wave_b !== false) throw new Error('Safe Harbor production observer widened authority.');
          if (runtime.status !== 'PASS') throw new Error('Production Flow-Core browser matrix held.');`,
  `          const safeHarborWaveA = JSON.parse(fs.readFileSync('artifacts/safe-harbor-gen3-wave-a-production/safe-harbor-gen3-wave-a-production-observation.json', 'utf8'));
          const safeHarborWaveB = JSON.parse(fs.readFileSync('artifacts/safe-harbor-gen3-wave-b-production/safe-harbor-gen3-wave-b-production-observation.json', 'utf8'));
          if (content.status !== 'PASS' || content.exact_source_content_verified !== true || content.application_tree_drift !== 'none') throw new Error('Exact production content observation held.');
          if (safeHarborWaveA.status !== 'PASS') throw new Error('Production Safe Harbor Gen3 Wave A observation held.');
          if (safeHarborWaveA.source_packet_commit !== content.source_packet_commit) throw new Error('Safe Harbor Wave A and Flow-Core observations disagree on the source packet.');
          if (safeHarborWaveA.authority?.counts_as_identity_adjudication !== false || safeHarborWaveA.authority?.counts_as_external_authorship_adjudication !== false || safeHarborWaveA.authority?.authorizes_research_track_r_promotion !== false || safeHarborWaveA.authority?.authorizes_wave_b !== false) throw new Error('Safe Harbor Wave A production observer widened authority.');
          if (safeHarborWaveB.status !== 'PASS') throw new Error('Production Safe Harbor Gen3 Wave B observation held.');
          if (safeHarborWaveB.source_packet_commit !== content.source_packet_commit) throw new Error('Safe Harbor Wave B and Flow-Core observations disagree on the source packet.');
          if (safeHarborWaveB.authority?.counts_as_identity_adjudication !== false || safeHarborWaveB.authority?.counts_as_external_authorship_adjudication !== false || safeHarborWaveB.authority?.authorizes_research_track_r_promotion !== false || safeHarborWaveB.authority?.authorizes_future_release !== false) throw new Error('Safe Harbor Wave B production observer widened authority.');
          if (runtime.status !== 'PASS') throw new Error('Production Flow-Core browser matrix held.');`
);
replaceOnce(
  releasePath,
  `          name: safe-harbor-wave-a-flowcore-and-ash-aia3-production-release-evidence
          path: |
            artifacts/safe-harbor-gen3-wave-a-production/
            artifacts/flowcore-production-observation/`,
  `          name: safe-harbor-wave-a-wave-b-flowcore-and-ash-aia3-production-release-evidence
          path: |
            artifacts/safe-harbor-gen3-wave-a-production/
            artifacts/safe-harbor-gen3-wave-b-production/
            artifacts/flowcore-production-observation/`
);
replaceOnce(
  releasePath,
  `          safe_harbor_gen3_wave_a = PASS
          safe_harbor_packet_creation = PASS
          safe_harbor_shi_exact_match = PASS
          safe_harbor_packet_restore = PASS
          safe_harbor_adverse_result_retention = PASS
          safe_harbor_raw_text_exclusion = PASS`,
  `          safe_harbor_gen3_wave_a = PASS
          safe_harbor_gen3_wave_b = PASS
          safe_harbor_packet_creation = PASS
          safe_harbor_shi_exact_match = PASS
          safe_harbor_packet_restore = PASS
          safe_harbor_adverse_result_retention = PASS
          safe_harbor_raw_text_exclusion = PASS
          temporal_bloom_desktop_1440x1000 = PASS
          temporal_bloom_mobile_390x844 = PASS
          temporal_bloom_reduced_motion = PASS
          temporal_bloom_public_counts_hidden = PASS
          provenance_authority_chronology = PASS
          provenance_countersignature_states = PASS
          provenance_deterministic_svg = PASS
          provenance_imitation_collision_reduction = PASS`
);
replaceOnce(releasePath, '          wave_b_authorized = false\n', '          future_safe_harbor_release_authorized = false\n');
replaceOnce(
  releasePath,
  '          The production observation closes the exact-source, Safe Harbor Gen3 Wave A runtime, Flow-Core runtime, Ash Keep AIA3 task-continuity, and retired-client delivery seams. It does not prove civil identity or universal authorship, promote Research Track R, authorize Wave B, satisfy the held adult empirical gate, authorize a child study, authorize public route promotion, or close the program. Sealed ⟐\n',
  '          The production observation closes the exact-source, Safe Harbor Gen3 Wave A and Wave B runtimes, Flow-Core runtime, Ash Keep AIA3 task-continuity, and retired-client delivery seams. It does not prove civil identity or universal authorship, promote Research Track R, authorize a future Safe Harbor release, satisfy the held adult empirical gate, authorize a child study, authorize public route promotion, or close the program. Sealed ⟐\n'
);

const flowcorePath = '.github/workflows/flowcore-p0-p10-final-stitch.yml';
replaceOnce(
  flowcorePath,
  `      - 'docs/safe-harbor/gen3-wave-a-production-receipt.md'
`,
  `      - 'docs/safe-harbor/gen3-wave-a-production-receipt.md'
      - 'docs/safe-harbor/gen3-wave-b-release-gate-receipt.md'
      - 'docs/safe-harbor/gen3-wave-b-production-receipt.md'
`
);
replaceOnce(
  flowcorePath,
  `      - 'tests/safe-harbor-gen3-wave-a-production-probe-contract.test.mjs'
`,
  `      - 'tests/safe-harbor-gen3-wave-a-production-probe-contract.test.mjs'
      - 'scripts/safe-harbor-gen3-wave-b-production-assets.mjs'
      - 'scripts/safe-harbor-gen3-wave-b-production-probe.mjs'
      - 'tests/safe-harbor-gen3-wave-b-production-probe-contract.test.mjs'
`
);
replaceOnce(
  flowcorePath,
  `            && ! grep -Fxq 'docs/safe-harbor/gen3-wave-a-production-receipt.md' <<< "$CHANGED"; then`,
  `            && ! grep -Fxq 'docs/safe-harbor/gen3-wave-a-production-receipt.md' <<< "$CHANGED" \\
            && ! grep -Fxq 'docs/safe-harbor/gen3-wave-b-release-gate-receipt.md' <<< "$CHANGED" \\
            && ! grep -Fxq 'docs/safe-harbor/gen3-wave-b-production-receipt.md' <<< "$CHANGED"; then`
);
replaceOnce(
  flowcorePath,
  `          docs/safe-harbor/gen3-wave-a-production-receipt.md
`,
  `          docs/safe-harbor/gen3-wave-a-production-receipt.md
          docs/safe-harbor/gen3-wave-b-release-gate-receipt.md
          docs/safe-harbor/gen3-wave-b-production-receipt.md
`
);
replaceOnce(
  flowcorePath,
  `          tests/safe-harbor-gen3-wave-a-production-probe-contract.test.mjs
`,
  `          tests/safe-harbor-gen3-wave-a-production-probe-contract.test.mjs
          scripts/safe-harbor-gen3-wave-b-production-assets.mjs
          scripts/safe-harbor-gen3-wave-b-production-probe.mjs
          tests/safe-harbor-gen3-wave-b-production-probe-contract.test.mjs
`
);

const gateTestPath = 'tests/vercel-operator-release-gate.test.mjs';
replaceOnce(
  gateTestPath,
  "assert.match(workflow, /flowcore-release-content-probe\\.mjs/);\n",
  `assert.match(workflow, /flowcore-release-content-probe\\.mjs/);
assert.match(workflow, /npm run test:safe-harbor:gen3:wave-b/);
assert.match(workflow, /npm run test:safe-harbor:gen3:track-r/);
assert.match(workflow, /safe-harbor-gen3-wave-b-production-probe-contract\\.test\\.mjs/);
assert.match(workflow, /safe-harbor-gen3-wave-b-production-assets\\.mjs/);
assert.match(workflow, /safe-harbor-gen3-wave-b-production-probe\\.mjs/);
assert.match(workflow, /Observe deployed Safe Harbor Gen3 Wave B/);
assert.match(workflow, /safe-harbor-gen3-wave-b-production-observation\\.json/);
assert.match(workflow, /safe_harbor_gen3_wave_b = PASS/);
assert.match(workflow, /temporal_bloom_desktop_1440x1000 = PASS/);
assert.match(workflow, /temporal_bloom_mobile_390x844 = PASS/);
assert.match(workflow, /provenance_deterministic_svg = PASS/);
assert.match(workflow, /provenance_imitation_collision_reduction = PASS/);
assert.match(workflow, /future_safe_harbor_release_authorized = false/);
`
);

const readmePath = 'docs/safe-harbor/README.md';
replaceOnce(
  readmePath,
  '13. Gen3 Stage 3 Temporal Bloom and provenance presentation under validation\n',
  '13. Gen3 Stage 3 Temporal Bloom and provenance presentation landed and validated\n14. Gen3 Release Wave B gate authored; production release pending\n'
);
replaceOnce(
  readmePath,
  '- [Gen3 Stage 3 validation receipt](./gen3-stage3-validation-receipt.md)\n',
  '- [Gen3 Stage 3 validation receipt](./gen3-stage3-validation-receipt.md)\n- [Gen3 Wave B release-gate receipt](./gen3-wave-b-release-gate-receipt.md)\n'
);
replaceOnce(
  readmePath,
  'Research Track R landed through PR #538 / commit `f1e96ab5b2db2bdf096c7dbcb3a8bbb8cb4351b9`; its production promotion remains withheld. Stage 3 and Release Wave B remain pending validation and release.',
  'Research Track R landed through PR #538 / commit `f1e96ab5b2db2bdf096c7dbcb3a8bbb8cb4351b9`; its production promotion remains withheld. Stage 3 landed through PR #544 / commit `1032b29c703a758f0f4570f9b392c040c465aa7b` after successful validation run `29962920463`. Release Wave B remains pending its exact-source production gate.'
);

console.log('Safe Harbor Gen3 Wave B release-gate seams applied.');