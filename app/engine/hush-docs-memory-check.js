export const HUSH_DOCS_MEMORY_CHECK_VERSION = 'phase-30';

const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

export function checkHushDocsMemory(input = {}) {
  const docs = input.docs || {};
  const currentPhase = input.currentPhase || 'Phase 30';
  const required = {
    README: ['app/hush.html', currentPhase, 'Hush Evidence Cockpit'],
    PHASE_MAP: [currentPhase, 'Evidence Cockpit'],
    INDEX: ['HUSH_PHASE_30_EVIDENCE_COCKPIT_SPEC.md', 'HUSH_EVIDENCE_RECEIPT_SCHEMA.md'],
    OPERATOR_MANUAL: ['claim ceiling', 'human review'],
    EPISTEMICIDE_AUDIT: ['Phase 30', 'unified evidence cockpit']
  };
  const missingMentions = [];
  for (const [docName, needles] of Object.entries(required)) {
    const text = String(docs[docName] || '');
    for (const needle of needles) if (!text.includes(needle)) missingMentions.push(`${docName}:${needle}`);
  }
  const staleMentions = [];
  if (String(docs.README || '').includes('Phase 0 through Phase 29.')) staleMentions.push('README:phase-29-terminal-claim');
  return { version: HUSH_DOCS_MEMORY_CHECK_VERSION, currentPhase, requiredDocs: Object.keys(required), missingMentions, staleMentions, passed: missingMentions.length === 0 && staleMentions.length === 0 };
}

export function summarizeHushDocsMemoryCheck(result = {}) {
  return { version: result.version || HUSH_DOCS_MEMORY_CHECK_VERSION, currentPhase: result.currentPhase || 'Phase 30', missingMentions: list(result.missingMentions), staleMentions: list(result.staleMentions), passed: result.passed === true };
}
