import { readFileSync, writeFileSync } from 'node:fs';

function replaceOnce(path, before, after) {
  const source = readFileSync(path, 'utf8');
  if (!source.includes(before)) throw new Error(`Expected Stage 2 integration seam missing in ${path}`);
  if (source.indexOf(before) !== source.lastIndexOf(before)) throw new Error(`Stage 2 integration seam is not unique in ${path}`);
  writeFileSync(path, source.replace(before, after));
}

replaceOnce(
  'app/safe-harbor/app/safe-harbor-native-finalizer.js',
  "import { applyGen3Stage1Prehash } from './safe-harbor-gen3-evidence-contract.js';\n",
  "import { applyGen3Stage1Prehash } from './safe-harbor-gen3-evidence-contract.js';\nimport { applyAuthorshipMaturityEvidence, buildAuthorshipMaturityEvidence } from './safe-harbor-gen3-maturity-engine.js';\n"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-native-finalizer.js',
  "  if (context.includeGen3Stage1 === true) {\n    out = applyGen3Stage1Prehash(out, {\n      ...(context.gen3Context || {}),\n      segments: context.segments || context.gen3Context?.segments || {}\n    });\n  }\n  attachPacketCapabilities(out, mode);",
  "  if (context.includeGen3Stage1 === true) {\n    out = applyGen3Stage1Prehash(out, {\n      ...(context.gen3Context || {}),\n      segments: context.segments || context.gen3Context?.segments || {}\n    });\n  }\n  if (context.includeGen3Stage2 === true && hasSegments(context.segments)) {\n    const maturityEvidence = await buildAuthorshipMaturityEvidence(context.segments, {\n      promptTexts: context.stage2Context?.promptTexts || {},\n      controlProfiles: context.stage2Context?.controlProfiles || {}\n    });\n    out = applyAuthorshipMaturityEvidence(out, maturityEvidence);\n  }\n  attachPacketCapabilities(out, mode);"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-packet-pipeline.js',
  "import { attachGen3ReportContract } from './safe-harbor-gen3-report-contract.js';\n",
  "import { attachGen3ReportContract } from './safe-harbor-gen3-report-contract.js';\nimport { attachMaturityReport } from './safe-harbor-gen3-maturity-report.js';\n"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-packet-pipeline.js',
  "    includeGen3Stage1: true,\n    gen3Context: {\n      promptSetVersion: options.promptSetVersion || 'temporal-triad/v2',\n      uiVersion: options.uiVersion || 'pre-temporal-bloom',\n      reducedMotion: Boolean(options.reducedMotion),\n      promptTextDigests: options.promptTextDigests || {}\n    }\n  });",
  "    includeGen3Stage1: true,\n    includeGen3Stage2: true,\n    gen3Context: {\n      promptSetVersion: options.promptSetVersion || 'temporal-triad/v2',\n      uiVersion: options.uiVersion || 'pre-temporal-bloom',\n      reducedMotion: Boolean(options.reducedMotion),\n      promptTextDigests: options.promptTextDigests || {}\n    },\n    stage2Context: {\n      promptTexts: options.promptTexts || {},\n      controlProfiles: options.controlProfiles || {}\n    }\n  });"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-packet-pipeline.js',
  "  if (gen3EvidencePresent(out)) out = attachGen3ReportContract(out, options.reportContext || {});\n  return attachPipelineState(out);",
  "  if (gen3EvidencePresent(out)) {\n    out = attachGen3ReportContract(out, options.reportContext || {});\n    out = attachMaturityReport(out);\n  }\n  return attachPipelineState(out);"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-gen3-evidence-contract.js',
  "    },\n    blind_custody_challenge: existing.blind_custody_challenge || null,",
  "    },\n    authorship_maturity: existing.authorship_maturity || null,\n    blind_custody_challenge: existing.blind_custody_challenge || null,"
);

replaceOnce(
  'app/safe-harbor/schemas/td613-safe-harbor.authorship-evidence.v1.schema.json',
  '    "stability_receipt": { "$ref": "#/$defs/stabilityReceipt" },\n    "blind_custody_challenge": { "type": ["object", "null"] },',
  '    "stability_receipt": { "$ref": "#/$defs/stabilityReceipt" },\n    "authorship_maturity": { "type": ["object", "null"] },\n    "blind_custody_challenge": { "type": ["object", "null"] },'
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-gen3-maturity-engine.js',
  "  out.authorship_evidence.authorship_maturity = {\n    schema_version: maturityEvidence.schema_version,\n    engine_version: maturityEvidence.engine_version,\n    window_policy: clone(maturityEvidence.window_policy),",
  "  out.authorship_evidence.authorship_maturity = {\n    schema_version: maturityEvidence.schema_version,\n    engine_version: maturityEvidence.engine_version,\n    window_policy: clone(maturityEvidence.window_policy),\n    lane_sufficiency: Object.fromEntries(LANES.map((lane) => [lane, maturityEvidence?.lanes?.[lane]?.sufficiency_state || 'insufficient'])),\n    local_window_evidence_index: Object.fromEntries(LANES.map((lane) => [lane, (maturityEvidence?.lanes?.[lane]?.local_windows || []).map((window) => ({\n      evidence_id: window.evidence_id,\n      evidence_digest: window.evidence_digest,\n      observed_words: window.observed_words,\n      complete: window.complete,\n      raw_text_included: false\n    }))])),"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-gen3-maturity-engine.js',
  "  evidence.evidence_digest = await taggedDigest({ ...evidence, evidence_digest: undefined });\n  return evidence;",
  "  const evidenceForDigest = clone(evidence);\n  delete evidenceForDigest.evidence_digest;\n  evidence.evidence_digest = await taggedDigest(evidenceForDigest);\n  return evidence;"
);

replaceOnce(
  'app/safe-harbor/app/safe-harbor-gen3-maturity-report.js',
  "  base.stage2_report_audit = {\n    schema_version: 'td613.safe-harbor.stage2-report-audit/v1',\n    status: base.evidence_link_audit.status === 'pass' && base.anti_flattery_audit.status === 'pass'\n      ? 'pass'\n      : 'review-required',\n    evidence_id_count: measurementIds.length,\n    claim_ceiling_active: true,\n    raw_text_consumed: false\n  };\n  return base;",
  "  base.interpretation_provenance.stage2_report_audit = {\n    schema_version: 'td613.safe-harbor.stage2-report-audit/v1',\n    status: base.evidence_link_audit.status === 'pass' && base.anti_flattery_audit.status === 'pass'\n      ? 'pass'\n      : 'review-required',\n    evidence_id_count: measurementIds.length,\n    claim_ceiling_active: true,\n    raw_text_consumed: false\n  };\n  return base;"
);

replaceOnce(
  'tests/safe-harbor-gen3-stage2-maturity-report.test.mjs',
  "assert.equal(report.stage2_report_audit.status, 'pass');\nassert.equal(report.stage2_report_audit.raw_text_consumed, false);\nassert.equal(report.stage2_report_audit.claim_ceiling_active, true);\nassert.ok(report.stage2_report_audit.evidence_id_count >= 9);",
  "assert.equal(report.interpretation_provenance.stage2_report_audit.status, 'pass');\nassert.equal(report.interpretation_provenance.stage2_report_audit.raw_text_consumed, false);\nassert.equal(report.interpretation_provenance.stage2_report_audit.claim_ceiling_active, true);\nassert.ok(report.interpretation_provenance.stage2_report_audit.evidence_id_count >= 9);"
);

replaceOnce(
  'tests/safe-harbor-gen3-stage2-maturity-report.test.mjs',
  "assert.equal(attached.forensic_authorship.gen3_report_contract.stage2_report_audit.status, 'pass');",
  "assert.equal(attached.forensic_authorship.gen3_report_contract.interpretation_provenance.stage2_report_audit.status, 'pass');"
);

replaceOnce(
  'package.json',
  '    "test:safe-harbor:gen3:stage1": "node tests/safe-harbor-gen3-stage1-evidence-contract.test.mjs",\n',
  '    "test:safe-harbor:gen3:stage1": "node tests/safe-harbor-gen3-stage1-evidence-contract.test.mjs",\n    "test:safe-harbor:gen3:stage2:engine": "node tests/safe-harbor-gen3-stage2-maturity-engine.test.mjs",\n    "test:safe-harbor:gen3:stage2:report": "node tests/safe-harbor-gen3-stage2-maturity-report.test.mjs",\n    "test:safe-harbor:gen3:stage2:schema": "node tests/safe-harbor-gen3-stage2-schema-contract.test.mjs",\n    "test:safe-harbor:gen3:stage2": "npm run test:safe-harbor:gen3:stage2:engine && npm run test:safe-harbor:gen3:stage2:report && npm run test:safe-harbor:gen3:stage2:schema",\n'
);

console.log('safe-harbor-gen3-stage2 integration patch applied');
