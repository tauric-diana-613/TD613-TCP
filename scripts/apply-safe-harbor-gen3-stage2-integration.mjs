import { readFileSync, writeFileSync } from 'node:fs';

function read(path) {
  return readFileSync(path, 'utf8');
}

function replaceOnce(path, before, after) {
  const source = read(path);
  if (!source.includes(before)) throw new Error(`Expected integration seam missing in ${path}`);
  if (source.indexOf(before) !== source.lastIndexOf(before)) throw new Error(`Integration seam is not unique in ${path}`);
  writeFileSync(path, source.replace(before, after));
}

const finalizerPath = 'app/safe-harbor/app/safe-harbor-native-finalizer.js';
const pipelinePath = 'app/safe-harbor/app/safe-harbor-packet-pipeline.js';
const packagePath = 'package.json';
const alreadyIntegrated = [
  read(finalizerPath).includes("import { applyControlledGen3Stage2Prehash } from './safe-harbor-gen3-stage2-controls.js';"),
  read(finalizerPath).includes('out = await applyControlledGen3Stage2Prehash(out, {'),
  read(pipelinePath).includes("import { attachStage2ControlReport } from './safe-harbor-gen3-stage2-controls.js';"),
  read(pipelinePath).includes('out = attachStage2ControlReport(out);'),
  read(packagePath).includes('"test:safe-harbor:gen3:stage2": "node tests/safe-harbor-gen3-stage2-authorship-maturity.test.mjs && node tests/safe-harbor-gen3-stage2-controls.test.mjs"')
].every(Boolean);

if (alreadyIntegrated) {
  console.log('safe-harbor-gen3-stage2 controlled integration already present; bounded patch is a no-op');
  process.exit(0);
}

replaceOnce(
  finalizerPath,
  "import { applyGen3Stage1Prehash } from './safe-harbor-gen3-evidence-contract.js';\n",
  "import { applyGen3Stage1Prehash } from './safe-harbor-gen3-evidence-contract.js';\nimport { applyControlledGen3Stage2Prehash } from './safe-harbor-gen3-stage2-controls.js';\n"
);

replaceOnce(
  finalizerPath,
  "  if (context.includeGen3Stage1 === true) {\n    out = applyGen3Stage1Prehash(out, {\n      ...(context.gen3Context || {}),\n      segments: context.segments || context.gen3Context?.segments || {}\n    });\n  }\n  attachPacketCapabilities(out, mode);",
  "  if (context.includeGen3Stage1 === true) {\n    out = applyGen3Stage1Prehash(out, {\n      ...(context.gen3Context || {}),\n      segments: context.segments || context.gen3Context?.segments || {}\n    });\n  }\n  if (context.includeGen3Stage2 === true) {\n    out = await applyControlledGen3Stage2Prehash(out, {\n      ...(context.gen3Context || {}),\n      segments: context.segments || context.gen3Context?.segments || {},\n      promptVocabularyByLane: context.gen3Context?.promptVocabularyByLane || {},\n      promptControlSegments: context.gen3Context?.promptControlSegments || {},\n      promptTextsByLane: context.gen3Context?.promptTextsByLane || {},\n      controlProfiles: context.gen3Context?.controlProfiles || {},\n      entrantSwapProfile: context.gen3Context?.entrantSwapProfile || null\n    });\n  }\n  attachPacketCapabilities(out, mode);"
);

replaceOnce(
  pipelinePath,
  "import { attachGen3ReportContract } from './safe-harbor-gen3-report-contract.js';\n",
  "import { attachGen3ReportContract } from './safe-harbor-gen3-report-contract.js';\nimport { attachStage2InterpretiveReport } from './safe-harbor-gen3-authorship-maturity.js';\nimport { attachStage2ControlReport } from './safe-harbor-gen3-stage2-controls.js';\n"
);

replaceOnce(
  pipelinePath,
  "    includeGen3Stage1: true,\n    gen3Context: {",
  "    includeGen3Stage1: true,\n    includeGen3Stage2: true,\n    gen3Context: {"
);

replaceOnce(
  pipelinePath,
  "      promptTextDigests: options.promptTextDigests || {}\n    }",
  "      promptTextDigests: options.promptTextDigests || {},\n      promptVocabularyByLane: options.promptVocabularyByLane || {},\n      promptControlSegments: options.promptControlSegments || {},\n      promptTextsByLane: options.promptTextsByLane || {},\n      controlProfiles: options.controlProfiles || {},\n      entrantSwapProfile: options.entrantSwapProfile || null\n    }"
);

replaceOnce(
  pipelinePath,
  "  if (gen3EvidencePresent(out)) out = attachGen3ReportContract(out, options.reportContext || {});\n  return attachPipelineState(out);",
  "  if (gen3EvidencePresent(out)) {\n    out = attachGen3ReportContract(out, options.reportContext || {});\n    out = attachStage2InterpretiveReport(out);\n    out = attachStage2ControlReport(out);\n  }\n  return attachPipelineState(out);"
);

replaceOnce(
  packagePath,
  '    "test:safe-harbor:gen3:stage1": "node tests/safe-harbor-gen3-stage1-evidence-contract.test.mjs",\n',
  '    "test:safe-harbor:gen3:stage1": "node tests/safe-harbor-gen3-stage1-evidence-contract.test.mjs",\n    "test:safe-harbor:gen3:stage2": "node tests/safe-harbor-gen3-stage2-authorship-maturity.test.mjs && node tests/safe-harbor-gen3-stage2-controls.test.mjs",\n    "test:safe-harbor:gen3:wave-a": "npm run test:safe-harbor:gen3:stage1 && node tests/safe-harbor-gen3-stage1-report-contract.test.mjs && node tests/safe-harbor-gen3-stage1-schema-contract.test.mjs && npm run test:safe-harbor:gen3:stage2 && node tests/safe-harbor-gen3-stage2-integration.test.mjs",\n'
);

console.log('safe-harbor-gen3-stage2 controlled integration patch applied');
