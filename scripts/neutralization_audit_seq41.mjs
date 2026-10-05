import fs from 'node:fs';
import path from 'node:path';

const FORBIDDEN_BESPOKE = [
  'TD613', 'Tauric Diana', 'Khonalit-po', 'Khona-lit-po', 'Safe Harbor',
  'Eclipse–Omega', 'Eclipse-Omega', 'PRCS-A', 'Aperture', 'Pedagogue',
  'Atlas', 'FADT', 'Dome-World', 'Flow-Core', 'Golden Egg',
  'Western Horizon', 'Marrowline', 'Holonomy Loom'
];

const FORBIDDEN_IN_A = [
  'claim ceiling', 'route memory', 'exogenous witness', 'empirical exteriority',
  'finite quotient', 'noninterference', 'state estimation', 'control plane',
  'data plane', 'path provenance', 'delegation token'
];

const EDITORIAL_PHRASES = [
  'this proves', 'this does not prove', 'must never', 'authority expires',
  'cannot retroactively', 'provenance does not confer', 'external receiver is not',
  'collapsing these states causes', 'unsafe persistent authority', 'privilege escalation',
  'false certification', 'epistemic delusion', 'fraudulent rewrite'
];

const fixturesDir = 'research/structural-extraction-hardening/fixtures';
const files = fs.readdirSync(fixturesDir);

const auditReport = {
  audited_at: new Date().toISOString(),
  all_fixtures_clean: true,
  fixture_reports: {}
};

for (const file of files) {
  if (!file.endsWith('.md')) continue;
  const content = fs.readFileSync(path.join(fixturesDir, file), 'utf8');
  const violations = [];

  // Check bespoke
  for (const term of FORBIDDEN_BESPOKE) {
    const re = new RegExp(`\\b${term.replace(/[-–]/g, '[-–]')}\\b`, 'gi');
    if (re.test(content)) violations.push({ type: 'FORBIDDEN_BESPOKE', term });
  }

  // Check editorial phrases
  for (const phrase of EDITORIAL_PHRASES) {
    const re = new RegExp(`\\b${phrase}\\b`, 'gi');
    if (re.test(content)) violations.push({ type: 'EDITORIAL_PHRASE', phrase });
  }

  // Check Arm A restrictions
  if (file === 'ARM_A_FIXTURE.md') {
    for (const term of FORBIDDEN_IN_A) {
      const re = new RegExp(`\\b${term}\\b`, 'gi');
      if (re.test(content)) violations.push({ type: 'ARM_A_PROHIBITED', term });
    }
  }

  const clean = violations.length === 0;
  if (!clean) auditReport.all_fixtures_clean = false;

  auditReport.fixture_reports[file] = {
    clean,
    violations
  };
}

fs.writeFileSync(
  'research/structural-extraction-hardening/10-LEXICAL_HYGIENE_AUDIT.json',
  JSON.stringify(auditReport, null, 2) + '\n',
  'utf8'
);

console.log('Lexical Hygiene Audit Complete.');
console.log('All fixtures clean:', auditReport.all_fixtures_clean);
if (!auditReport.all_fixtures_clean) {
  console.log(JSON.stringify(auditReport, null, 2));
}
