import { readFileSync, writeFileSync } from 'node:fs';

const ledgerPath = 'docs/safe-harbor/gen3-implementation-ledger.md';
let ledger = readFileSync(ledgerPath, 'utf8');
const stage3Rows = [
  '| S3-001 | Temporal Bloom consumes the single counted-state authority | `main.js` sanitized counted-state bridge; `safe-harbor-temporal-bloom.js` presentation consumer | threshold-source parity and no-tokenizer tests | Stage 3 PR | implemented in branch; validation pending |',
  '| S3-002 | Hidden public counts and reciprocal recognition language | Temporal Bloom UI and CSS | 119/120/239/240/359/360 boundary and public DOM tests | Stage 3 PR | implemented in branch; validation pending |',
  '| S3-003 | Reduced motion, keyboard, screen reader, mobile focus | capture guards, ARIA live region, reduced-motion and iOS CSS | accessibility and UI contract tests | Stage 3 PR | implemented in branch; browser validation pending |',
  '| S3-004 | Countersignature UI and visible unsigned state | explicit user-gesture event and Stage 1 countersignature function | unsigned, signed-digest, and missing-digest tests | Stage 3 PR | implemented in branch; validation pending |',
  '| S3-005 | SHI exact match across packet, DOM, SVG | presentation core and renderer export gate | missing, malformed, and mismatch holds | Stage 3 PR | implemented in branch; validation pending |',
  '| S3-006 | Separate authority chronology | provenance panel and SVG metadata | timestamp non-collapse and historical-example tests | Stage 3 PR | implemented in branch; validation pending |',
  '| S3-007 | Deterministic PUA Provenance Attestation SVG | Stage 3 presentation core and renderer extension | deterministic metadata/SVG snapshots | Stage 3 PR | implemented in branch; validation pending |',
  '| S3-008 | Honest authority reduction for failures and collisions | provenance panel and renderer | adverse-state and imitation-collision snapshots | Stage 3 PR | implemented in branch; validation pending |',
  '| S3-009 | No telemetry and no serverless expansion | sanitized bridge, presentation modules, repository policy | source scans and serverless boundary checks | Stage 3 PR | implemented in branch; validation pending |'
].join('\n');
ledger = ledger.replace(
  /\| S3-001 \|[^\n]*\n\| S3-002 \|[^\n]*\n\| S3-003 \|[^\n]*\n\| S3-004 \|[^\n]*\n\| S3-005 \|[^\n]*\n\| S3-006 \|[^\n]*\n\| S3-007 \|[^\n]*\n\| S3-008 \|[^\n]*\n\| S3-009 \|[^\n]*/u,
  stage3Rows
);
writeFileSync(ledgerPath, ledger);

const readmePath = 'docs/safe-harbor/README.md';
let readme = readFileSync(readmePath, 'utf8');
if (!readme.includes('12. Gen3 Research Track R code-complete, research-gated, and unpromoted')) {
  readme = readme.replace(
    '11. Gen3 Release Wave A deployed once, observed post-propagation, and relocked\n',
    '11. Gen3 Release Wave A deployed once, observed post-propagation, and relocked\n12. Gen3 Research Track R code-complete, research-gated, and unpromoted\n13. Gen3 Stage 3 Temporal Bloom and provenance presentation under validation\n'
  );
}
const receiptLine = '- [Gen3 Stage 3 validation receipt](./gen3-stage3-validation-receipt.md)\n';
if (!readme.includes(receiptLine)) {
  readme = readme.replace(
    '- [Gen3 Research Track R implementation receipt](./gen3-track-r-implementation-receipt.md)\n',
    '- [Gen3 Research Track R implementation receipt](./gen3-track-r-implementation-receipt.md)\n' + receiptLine
  );
}
readme = readme.replace(
  'Research Track R remains separately gated. Stage 3 and Release Wave B remain pending.',
  'Research Track R landed through PR #538 / commit `f1e96ab5b2db2bdf096c7dbcb3a8bbb8cb4351b9`; its production promotion remains withheld. Stage 3 and Release Wave B remain pending validation and release.'
);
if (!readme.includes('For the complete Gen3 Wave B candidate')) {
  readme = readme.replace(
    '```\n\n## Claim ceiling',
    '```\n\nFor the complete Gen3 Wave B candidate, run:\n\n```bash\nnpm run test:safe-harbor:gen3:wave-b\n```\n\n## Claim ceiling'
  );
}
writeFileSync(readmePath, readme);

console.log('Safe Harbor Gen3 Stage 3 docs updated.');
