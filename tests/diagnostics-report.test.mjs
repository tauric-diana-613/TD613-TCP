import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DIAGNOSTIC_BATTERY } from '../app/data/diagnostics.js';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const latestJsonPath = path.join(repoRoot, 'reports', 'diagnostics', 'latest.json');
const latestMdPath = path.join(repoRoot, 'reports', 'diagnostics', 'latest.md');
const apertureJsonPath = path.join(repoRoot, 'reports', 'diagnostics', 'aperture.latest.json');
const apertureMdPath = path.join(repoRoot, 'reports', 'diagnostics', 'aperture.latest.md');

assert.ok(fs.existsSync(latestJsonPath), 'diagnostics JSON report exists');
assert.ok(fs.existsSync(latestMdPath), 'diagnostics Markdown report exists');
assert.ok(fs.existsSync(apertureJsonPath), 'Aperture annex JSON report exists');
assert.ok(fs.existsSync(apertureMdPath), 'Aperture annex Markdown report exists');

const latestReport = JSON.parse(fs.readFileSync(latestJsonPath, 'utf8'));
assert.equal(latestReport.sections.swapPairs.length, DIAGNOSTIC_BATTERY.swapPairs.length, 'diagnostics JSON report includes swap section');
assert.equal(latestReport.sections.maskCases.length, DIAGNOSTIC_BATTERY.maskCases.length, 'diagnostics JSON report includes mask section');
assert.equal(latestReport.sections.trainerCases.length, DIAGNOSTIC_BATTERY.trainerCases.length, 'diagnostics JSON report includes trainer section');
assert.equal(latestReport.sections.retrievalCases.length, DIAGNOSTIC_BATTERY.retrievalCases.length, 'diagnostics JSON report includes retrieval section');
assert.equal(latestReport.sections.falseNeighborCases.length, DIAGNOSTIC_BATTERY.falseNeighborCases.length, 'diagnostics JSON report includes false-neighbor section');
assert.equal(latestReport.sections.generatorTransferCases.length, DIAGNOSTIC_BATTERY.retrievalCases.length, 'diagnostics JSON report includes generator transfer section');
assert.equal(latestReport.sections.generatorMaskCases.length, DIAGNOSTIC_BATTERY.maskCases.length, 'diagnostics JSON report includes generator mask section');
if (latestReport.sections.hushCases) {
  assert.ok(latestReport.sections.hushCases.length > 0, 'diagnostics JSON report includes Hush section');
}

assert.ok(latestReport.generatorAudit, 'diagnostics JSON report includes generator audit');
assert.equal(
  latestReport.generatorAudit.caseCount,
  DIAGNOSTIC_BATTERY.retrievalCases.length + DIAGNOSTIC_BATTERY.maskCases.length,
  'generator audit tracks retrieval and mask generator surfaces'
);
assert.equal(latestReport.generatorAudit.generatorVersionCounts.v2, latestReport.generatorAudit.caseCount, 'generator audit reports V2 as the active writer across tracked diagnostics cases');
assert.equal(latestReport.generatorAudit.protectedAnchorIntegrityMin, 1, 'generator audit reports preserved protected anchors');
assert.ok(latestReport.ontologyIntegrity, 'diagnostics JSON report includes ontology integrity audit');
assert.ok(latestReport.cadenceDuelIntegrity, 'diagnostics JSON report includes cadence duel integrity audit');
assert.ok(latestReport.toolability, 'diagnostics JSON report includes toolability audit');
assert.ok(latestReport.sampleAudit, 'diagnostics JSON report includes sample audit');
assert.ok(latestReport.personaAudit, 'diagnostics JSON report includes persona audit');
assert.ok(latestReport.workingDoctrine, 'diagnostics JSON report includes private TD613 Aperture working doctrine');
assert.ok(latestReport.annexes?.aperture, 'diagnostics JSON report includes Aperture annex diagnostics');
assert.ok(latestReport.annexes.aperture.passed, 'Aperture annex diagnostics pass');
assert.equal(latestReport.annexes.aperture.file, 'app/aperture/tool.html', 'Aperture annex diagnostics inspect the canonical tool body');
assert.equal(latestReport.annexes.aperture.version, '2.9.4', 'Aperture annex diagnostics report the expected version');
assert.equal(latestReport.annexes.aperture.meta['tool-name'], 'TD613 Aperture', 'Aperture annex diagnostics preserve the TD613 Aperture tool name');
assert.equal(latestReport.annexes.aperture.meta['observed-regime'], 'PRCS-A', 'Aperture annex diagnostics preserve the PRCS-A regime callout');
assert.ok(/^[a-f0-9]{64}$/i.test(latestReport.annexes.aperture.fingerprint.contentHashSha256), 'Aperture annex diagnostics expose a SHA-256 content hash');
assert.ok(latestReport.summary.annexCount >= 1, 'diagnostics JSON report includes annex count');
assert.ok(latestReport.summary.annexPassedCount >= 1, 'diagnostics JSON report includes passed annex count');

const latestMarkdown = fs.readFileSync(latestMdPath, 'utf8');
assert.ok(latestMarkdown.includes('## Generator Audit'), 'diagnostics Markdown report includes generator audit section');
assert.ok(latestMarkdown.includes('## Ontology Integrity'), 'diagnostics Markdown report includes ontology integrity section');
assert.ok(latestMarkdown.includes('## Cadence Duel Integrity'), 'diagnostics Markdown report includes cadence duel integrity section');
assert.ok(latestMarkdown.includes('## Toolability'), 'diagnostics Markdown report includes toolability section');
assert.ok(latestMarkdown.includes('## Sample Audit'), 'diagnostics Markdown report includes sample audit section');
assert.ok(latestMarkdown.includes('## Persona Audit'), 'diagnostics Markdown report includes persona audit section');
assert.ok(latestMarkdown.includes('## Private TD613 Aperture Working State'), 'diagnostics Markdown report includes private TD613 Aperture working-state section');
assert.ok(latestMarkdown.includes('## Annex Diagnostics'), 'diagnostics Markdown report includes annex diagnostics section');
assert.ok(latestMarkdown.includes('### TD613 Aperture'), 'diagnostics Markdown report includes TD613 Aperture annex section');

const apertureReport = JSON.parse(fs.readFileSync(apertureJsonPath, 'utf8'));
assert.ok(apertureReport.passed, 'standalone Aperture annex report passes');
assert.equal(apertureReport.file, 'app/aperture/tool.html', 'standalone Aperture annex report points to the canonical tool body');
assert.equal(apertureReport.meta['tool-name'], 'TD613 Aperture', 'standalone Aperture annex report preserves the TD613 Aperture tool name');
assert.equal(apertureReport.meta['observed-regime'], 'PRCS-A', 'standalone Aperture annex report preserves the PRCS-A regime callout');

const apertureMarkdown = fs.readFileSync(apertureMdPath, 'utf8');
assert.ok(apertureMarkdown.includes('# TD613 Aperture Annex Diagnostics'), 'Aperture annex Markdown report has a heading');
assert.ok(apertureMarkdown.includes('content_hash_sha256'), 'Aperture annex Markdown report includes content hash');

console.log('diagnostics-report.test.mjs passed');
