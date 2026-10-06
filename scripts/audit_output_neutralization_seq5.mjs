import fs from 'node:fs';
import path from 'node:path';

const rawDir = 'research/sequence-5-differential-replication/11-RAW_RECEIVER_OUTPUTS';
const files = fs.readdirSync(rawDir).filter(f => f.endsWith('.txt'));

const forbiddenTerms = [
  'td613', 'aperture', 'prcs-a', 'safe harbor', 'dollhouse', 'pedagogue',
  'atlas', 'fadt', 'temporal custodian', 'ash moon', 'tauric diana',
  's != o != e', 's \ne \o', 'doctrine'
];

let violations = 0;
const report = {};

for (const file of files) {
  const content = fs.readFileSync(path.join(rawDir, file), 'utf8').toLowerCase();
  const hits = forbiddenTerms.filter(term => content.includes(term));
  report[file] = hits;
  if (hits.length > 0) violations += hits.length;
}

console.log(`OUTPUT NEUTRALIZATION AUDIT: ${files.length} files audited.`);
console.log(`Total forbidden term hits: ${violations}`);

if (violations === 0) {
  console.log('AUDIT PASSED: 100% CLEAN NEUTRALIZED OUTPUTS');
} else {
  console.error('AUDIT FAILED: VIOLATIONS FOUND');
  process.exit(1);
}
