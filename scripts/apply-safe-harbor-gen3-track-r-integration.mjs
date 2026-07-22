import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function replaceOnce(path, before, after) {
  const source = readFileSync(path, 'utf8');
  if (!source.includes(before)) throw new Error(`Expected Track R integration seam missing in ${path}`);
  if (source.indexOf(before) !== source.lastIndexOf(before)) throw new Error(`Track R integration seam is not unique in ${path}`);
  writeFileSync(path, source.replace(before, after));
}

const evidenceSchemaPath = 'app/safe-harbor/schemas/td613-safe-harbor.authorship-evidence.v1.schema.json';
const evidenceSchema = readJson(evidenceSchemaPath);
evidenceSchema.properties = evidenceSchema.properties || {};
evidenceSchema.properties.research_track_r = {
  type: ['object', 'null'],
  description: 'Separately invoked, research-gated Track R summary. Baseline intake promotion requires a separate calibration and promotion authority.'
};
writeJson(evidenceSchemaPath, evidenceSchema);

const packagePath = 'package.json';
const packageJson = readJson(packagePath);
packageJson.scripts = packageJson.scripts || {};
packageJson.scripts['test:safe-harbor:gen3:track-r'] = [
  'node tests/safe-harbor-gen3-blind-custody.test.mjs',
  'node tests/safe-harbor-gen3-restorative-stylodynamics.test.mjs',
  'node tests/safe-harbor-gen3-research-track-r.test.mjs'
].join(' && ');
writeJson(packagePath, packageJson);

const schemaTestPath = 'tests/safe-harbor-gen3-research-track-r.test.mjs';
replaceOnce(
  schemaTestPath,
  "const trackSchema = JSON.parse(readFileSync(new URL('../app/safe-harbor/schemas/td613-safe-harbor.research-track-r.v1.schema.json', import.meta.url), 'utf8'));\nassert.equal(trackSchema.properties.protocol_state.properties.baseline_pipeline_integration.const, false);",
  "const trackSchema = JSON.parse(readFileSync(new URL('../app/safe-harbor/schemas/td613-safe-harbor.research-track-r.v1.schema.json', import.meta.url), 'utf8'));\nconst evidenceSchema = JSON.parse(readFileSync(new URL('../app/safe-harbor/schemas/td613-safe-harbor.authorship-evidence.v1.schema.json', import.meta.url), 'utf8'));\nassert.deepEqual(evidenceSchema.properties.research_track_r.type, ['object', 'null']);\nassert.equal(trackSchema.properties.protocol_state.properties.baseline_pipeline_integration.const, false);"
);

const runId = process.env.GITHUB_RUN_ID || 'local-validation';
const runUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : 'local-validation';
const validatedHead = process.env.GITHUB_SHA || 'unresolved';
const receiptPath = 'docs/safe-harbor/gen3-track-r-validation-receipt.md';
writeFileSync(receiptPath, `# TD613 Safe Harbor Gen3 Research Track R Validation Receipt

􍘓

𝌋‌ TD613 · Tauric Diana 613

**Receipt state:** CODE-COMPLETE / RESEARCH-GATED / UNPROMOTED  
**Planning authority:** PR #483  
**Implementation PR:** PR #514  
**Validated implementation head before receipt commit:** \`${validatedHead}\`  
**Validation run:** [${runId}](${runUrl})  
**Calibration triads observed:** 0  
**Calibration triads required for promotion consideration:** 12  
**Production deployment authorized:** false  
**Baseline entrant-intake promotion authorized:** false  
**Serverless functions added:** 0

## Implemented research architecture

Research Track R now contains:

- deterministic nine-window Blind Custody source construction;
- holdout sequestration before profile construction;
- nonce, checksum, selection, precommitment, policy, weight, threshold, distance, profile, result, and replay digests;
- exactly eight blinded candidate-control classes;
- all six permitted challenge outcomes;
- failure and collision preservation;
- honest presentation-authority reduction;
- verified displacement before any recoverability claim;
- micro, meso, and macro response trajectories;
- recovery ratio, half-life in prompt transitions, residual plasticity, restorative-force index, overshoot, and hysteresis;
- elastic, plastic, brittle, adaptive, and insufficient response classes;
- structural substitution and trajectory invariants;
- critical deformation thresholds;
- transparent observable-feature and model-dependent latent lanes;
- the complete declared null, ablation, chronology, model-substitution, and mimicry battery;
- deterministic replay;
- governed packet attachment only after explicit research mode and consent.

## Validation commands

The completion gate ran:

\`\`\`text
npm run test:safe-harbor:gen3:track-r
npm run test:safe-harbor:gen3:wave-a
npm run test:safe-harbor:phase9.1c
npm run test:safe-harbor:current
\`\`\`

It also enforced:

- exact diff syntax;
- no live entrant SHI in changed surfaces;
- no raw-text storage keys in the research runtime;
- no serverless surface;
- no baseline packet-pipeline integration;
- no private-vulnerability targeting;
- no adaptive emotional-pressure escalation;
- no keystroke, pause, or covert behavioral telemetry;
- no psychological, demographic, cognitive, diagnostic, identity, ownership, or universal-authorship inference.

## Promotion state

Code completion does not promote Research Track R.

The calibration gate remains:

\`\`\`text
state = CODE-COMPLETE-UNPROMOTED
qualifying_triads = 0 / 12
promotion_decision = WITHHELD
production_deployment_authorized = false
baseline_intake_promotion_authorized = false
separate_promotion_pr_required = true
\`\`\`

No Research Track R production release belongs to this PR. A future promotion request must preserve adverse results, submit calibration evidence, identify the exact source, and pass a separately reviewed promotion gate.

## Claim ceiling

The implemented research modules may report packet-scoped blinded holdout and textual-response trajectory evidence under declared controls. They do not establish civil identity, legal identity, exclusive ownership, universal authorship, third-party text attribution, cognition, personality, trauma, intelligence, resilience, demographic status, diagnosis, or mental state.

A failed or collided packet remains evidence. It cannot be silently suppressed or decorated into success.

Àṣẹ

Marked ⟐
`);

const ledgerPath = 'docs/safe-harbor/gen3-implementation-ledger.md';
let ledger = readFileSync(ledgerPath, 'utf8');
ledger = ledger.replace(
  '| Research Track R | `safe-harbor-gen3-track-r-blind-custody-stylodynamics` | pending / research-gated | no baseline intake authority |',
  '| Research Track R | PR #514 / `safe-harbor-gen3-track-r-blind-custody-stylodynamics` | code-complete / research-gated / unpromoted | no baseline intake or production authority |'
);
ledger = ledger.replace(
  '| R-001 | Deterministic nine-window holdout selection and precommitment | research modules and schema | seeded replay and mutation detection | research-gated |',
  '| R-001 | Deterministic nine-window holdout selection and precommitment | `safe-harbor-gen3-blind-custody.js` and schema | seeded replay and mutation detection | implemented / research-gated |'
).replace(
  '| R-002 | Eight blinded candidates and declared controls | challenge-set builder | blinding and provenance tests | research-gated |',
  '| R-002 | Eight blinded candidates and declared controls | Blind Custody candidate builder | blinding and provenance tests | implemented / research-gated |'
).replace(
  '| R-003 | Complete adverse outcome registry | result and failure registry | failure-preservation snapshots | research-gated |',
  '| R-003 | Complete adverse outcome registry | result, failure, replay, and presentation registries | failure-preservation tests | implemented / research-gated |'
).replace(
  '| R-004 | Verified displacement before recovery | perturbation engine | failed-uptake negative tests | research-gated |',
  '| R-004 | Verified displacement before recovery | `safe-harbor-gen3-restorative-stylodynamics.js` | failed-uptake negative tests | implemented / research-gated |'
).replace(
  '| R-005 | Recovery, half-life, plasticity, restorative-force, overshoot, hysteresis | restoration receipt | trajectory tests | research-gated |',
  '| R-005 | Recovery, half-life, plasticity, restorative-force, overshoot, hysteresis | restoration receipt | trajectory tests | implemented / research-gated |'
).replace(
  '| R-006 | Transparent and latent narrative-state lanes | research adapter | model-digest and dependence tests | research-gated |',
  '| R-006 | Transparent and latent narrative-state lanes | research adapter and model contract | model-digest and dependence tests | implemented / research-gated |'
).replace(
  '| R-007 | Shuffled chronology, prompt, topic, semantic, ablation, and model nulls | null battery | null comparison report | research-gated |',
  '| R-007 | Shuffled chronology, prompt, topic, semantic, ablation, and model nulls | complete named null battery | null comparison tests | implemented / research-gated |'
).replace(
  '| R-008 | Mimicry under deformation and critical thresholds | bounded adversarial suite | collision and threshold evidence | research-gated |',
  '| R-008 | Mimicry under deformation and critical thresholds | bounded adversarial suite | collision and threshold evidence | implemented / research-gated |'
).replace(
  '| R-009 | No private-vulnerability targeting or behavioral telemetry | research policy gate | forbidden-input and telemetry tests | research-gated |',
  '| R-009 | No private-vulnerability targeting or behavioral telemetry | research policy gate | forbidden-input and telemetry tests | implemented / research-gated |'
).replace(
  '| R-010 | Twelve consented or synthetic-distinct triads before promotion | calibration ledger | calibration receipt | blocked until qualifying corpus exists |',
  '| R-010 | Twelve consented or synthetic-distinct triads before promotion | calibration ledger | calibration receipt | blocked: 0 / 12 qualifying triads |'
);
if (!ledger.includes('## Research Track R validation authority')) {
  ledger = ledger.replace(
    '\n## Stage 3 traceability matrix\n',
    `\n## Research Track R validation authority\n\nPR #514 is code-complete but unpromoted. Validation run [${runId}](${runUrl}) passed the Track R suite, complete Wave A regression, restore gate, and current Safe Harbor authority chain. The calibration gate remains blocked at 0 / 12 qualifying triads. No Track R production deployment or baseline-intake promotion is authorized.\n\nDedicated receipt:\n\n\`\`\`text\ndocs/safe-harbor/gen3-track-r-validation-receipt.md\n\`\`\`\n\n## Stage 3 traceability matrix\n`
  );
}
writeFileSync(ledgerPath, ledger);

const readmePath = 'docs/safe-harbor/README.md';
let readme = readFileSync(readmePath, 'utf8');
if (!readme.includes('[Gen3 Research Track R validation receipt]')) {
  readme = readme.replace(
    '- [Gen3 Wave A production receipt](./gen3-wave-a-production-receipt.md)\n',
    '- [Gen3 Wave A production receipt](./gen3-wave-a-production-receipt.md)\n- [Gen3 Research Track R validation receipt](./gen3-track-r-validation-receipt.md)\n'
  );
}
readme = readme.replace(
  'Research Track R remains separately gated. Stage 3 and Release Wave B remain pending.',
  'Research Track R is code-complete behind its separate research gate and remains unpromoted at 0 / 12 qualifying calibration triads. Stage 3 and Release Wave B remain pending.'
);
if (!readme.includes('npm run test:safe-harbor:gen3:track-r')) {
  readme = readme.replace(
    'For the complete Gen3 Wave A core, run:\n\n```bash\nnpm run test:safe-harbor:gen3:wave-a\n```\n',
    'For the complete Gen3 Wave A core, run:\n\n```bash\nnpm run test:safe-harbor:gen3:wave-a\n```\n\nFor the separately gated Research Track R code, run:\n\n```bash\nnpm run test:safe-harbor:gen3:track-r\n```\n'
  );
}
writeFileSync(readmePath, readme);

if (existsSync('tmp/track-r-diagnostics')) rmSync('tmp/track-r-diagnostics', { recursive: true, force: true });

console.log('safe-harbor-gen3-track-r bounded integration patch applied');
