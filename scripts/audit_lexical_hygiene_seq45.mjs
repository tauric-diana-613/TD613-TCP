import fs from 'node:fs';
import path from 'node:path';

const baseDir = 'research/matched-onboarding-differential';
const batteryDir = path.join(baseDir, 'battery');

const forbidden = [
  'TD613',
  'Aperture',
  'PRCS-A',
  'PRCSA',
  'FADT',
  'Safe Harbor',
  'SafeHarbor',
  'Atlas',
  'Pedagogue',
  'Temporal Custodian',
  'TemporalCustodian',
  'Western Horizon',
  'WesternHorizon',
  'Holonomy Loom',
  'Loom',
  'Marrowline',
  'Ash Moon',
  'Eclipse-Omega',
  'Cistern'
];

const results = {};
let totalViolations = 0;

const files = fs.readdirSync(batteryDir).filter(f => f.endsWith('.md'));

for (const file of files) {
  const content = fs.readFileSync(path.join(batteryDir, file), 'utf8');
  results[file] = {
    violations: 0,
    matches: []
  };

  for (const term of forbidden) {
    // Regex word boundary case-insensitive
    const regex = new RegExp(`\\b${term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const matches = content.match(regex);
    if (matches) {
      results[file].violations += matches.length;
      results[file].matches.push({ term, count: matches.length });
      totalViolations += matches.length;
    }
  }
}

const audit = {
  timestamp: new Date().toISOString(),
  totalFixtures: files.length,
  totalViolations,
  status: totalViolations === 0 ? "PASSED_ZERO_LEAKAGE" : "FAILED_LEAKAGE_DETECTED",
  fixtures: results
};

fs.writeFileSync(path.join(baseDir, '08-LEXICAL_HYGIENE_AUDIT.json'), JSON.stringify(audit, null, 2), 'utf8');
console.log(`Lexical hygiene audit completed. Total violations: ${totalViolations}. Status: ${audit.status}`);
