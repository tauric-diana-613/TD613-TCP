import { readFileSync, writeFileSync } from 'node:fs';

function replaceOnce(path, before, after) {
  const source = readFileSync(path, 'utf8');
  if (!source.includes(before)) throw new Error(`Expected integration seam missing in ${path}`);
  if (source.indexOf(before) !== source.lastIndexOf(before)) throw new Error(`Integration seam is not unique in ${path}`);
  writeFileSync(path, source.replace(before, after));
}

replaceOnce(
  'app/safe-harbor/app/safe-harbor-native-finalizer.js',
  "import { applyGen3Stage1Prehash } from './safe-harbor-gen3-evidence-contract.js';\n",
  "import { applyGen3Stage1Prehash } from './safe-harbor-gen3-evidence-contract.js';\nimport { applyGen3Stage2Prehash } from './safe-harbor-gen3-authorship-maturity.js';\n"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-native-finalizer.js',
  "  if (context.includeGen3Stage1 === true) {\n    out = applyGen3Stage1Prehash(out, {\n      ...(context.gen3Context || {}),\n      segments: context.segments || context.gen3Context?.segments || {}\n    });\n  }\n  attachPacketCapabilities(out, mode);",
  "  if (context.includeGen3Stage1 === true) {\n    out = applyGen3Stage1Prehash(out, {\n      ...(context.gen3Context || {}),\n      segments: context.segments || context.gen3Context?.segments || {}\n    });\n  }\n  if (context.includeGen3Stage2 === true) {\n    out = await applyGen3Stage2Prehash(out, {\n      ...(context.gen3Context || {}),\n      segments: context.segments || context.gen3Context?.segments || {},\n      promptVocabularyByLane: context.gen3Context?.promptVocabularyByLane || {}\n    });\n  }\n  attachPacketCapabilities(out, mode);"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-packet-pipeline.js',
  "import { attachGen3ReportContract } from './safe-harbor-gen3-report-contract.js';\n",
  "import { attachGen3ReportContract } from './safe-harbor-gen3-report-contract.js';\nimport { attachStage2InterpretiveReport } from './safe-harbor-gen3-authorship-maturity.js';\n"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-packet-pipeline.js',
  "    includeGen3Stage1: true,\n    gen3Context: {",
  "    includeGen3Stage1: true,\n    includeGen3Stage2: true,\n    gen3Context: {"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-packet-pipeline.js',
  "      promptTextDigests: options.promptTextDigests || {}\n    }",
  "      promptTextDigests: options.promptTextDigests || {},\n      promptVocabularyByLane: options.promptVocabularyByLane || {}\n    }"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-packet-pipeline.js',
  "  if (gen3EvidencePresent(out)) out = attachGen3ReportContract(out, options.reportContext || {});\n  return attachPipelineState(out);",
  "  if (gen3EvidencePresent(out)) {\n    out = attachGen3ReportContract(out, options.reportContext || {});\n    out = attachStage2InterpretiveReport(out);\n  }\n  return attachPipelineState(out);"
);

replaceOnce(
  'package.json',
  '    "test:safe-harbor:gen3:stage1": "node tests/safe-harbor-gen3-stage1-evidence-contract.test.mjs",\n',
  '    "test:safe-harbor:gen3:stage1": "node tests/safe-harbor-gen3-stage1-evidence-contract.test.mjs",\n    "test:safe-harbor:gen3:stage2": "node tests/safe-harbor-gen3-stage2-authorship-maturity.test.mjs",\n    "test:safe-harbor:gen3:wave-a": "npm run test:safe-harbor:gen3:stage1 && node tests/safe-harbor-gen3-stage1-report-contract.test.mjs && node tests/safe-harbor-gen3-stage1-schema-contract.test.mjs && npm run test:safe-harbor:gen3:stage2",\n'
);

console.log('safe-harbor-gen3-stage2 integration patch applied');
