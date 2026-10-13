import assert from 'assert';
import { checkHushDocsMemory } from '../app/engine/hush-docs-memory-check.js';

const docs = {
  README: 'app/hush.html Phase 30 Hush Evidence Cockpit',
  PHASE_MAP: 'Phase 30 Evidence Cockpit',
  INDEX: 'HUSH_PHASE_30_EVIDENCE_COCKPIT_SPEC.md HUSH_EVIDENCE_RECEIPT_SCHEMA.md',
  OPERATOR_MANUAL: 'claim ceiling human review',
  EPISTEMICIDE_AUDIT: 'Phase 30 unified evidence cockpit'
};
const result = checkHushDocsMemory({ docs });
assert.equal(result.version, 'phase-30');
assert.equal(result.passed, true);
assert.equal(result.missingMentions.length, 0);

const missing = checkHushDocsMemory({ docs: { ...docs, INDEX: '' } });
assert.equal(missing.passed, false);
assert(missing.missingMentions.some((item) => item.startsWith('INDEX:')));
console.log('hush-docs-memory-check tests passed');
