import assert from 'node:assert/strict';
import {
  PHASE39_AUDIENCES,
  detectEpistemicide,
  protectedMeaningResults,
  registerDrift,
  audienceRead,
  tooPrettyScore,
  plainSpeechRecovery,
  phase39Receipt,
  runPhase39
} from '../app/hush-phase39-engine.js';

assert.ok(PHASE39_AUDIENCES.includes('legal-intake'), 'Phase 39 should include legal-intake audience mode');
assert.ok(PHASE39_AUDIENCES.includes('coalition-review'), 'Phase 39 should include coalition-review audience mode');

const source = 'They retaliated after I reported the issue. This document is evidence. I refuse to soften this boundary.';
const output = 'There were tensions after I shared concerns about the situation. This context may help. I would prefer a calmer path.';

const epi = detectEpistemicide(source, output);
assert.ok(epi.length >= 2, 'Phase 39 should detect softened claim and evidence drift');
assert.ok(epi.some((warning) => warning.pattern === 'claim-softening'), 'retaliation to tension drift should trigger claim-softening');
assert.ok(epi.some((warning) => warning.pattern === 'protected-meaning-drift'), 'missing protected markers with softening should trigger drift');

const lockbox = protectedMeaningResults(source, output, 'retaliated\nevidence\nI refuse');
assert.ok(lockbox.some((item) => item.status === 'weakened' || item.status === 'lost'), 'lockbox should flag weakened or lost protected meanings');

const drift = registerDrift(source, output);
assert.ok(drift.claimSpecificity.delta < 0, 'claim specificity should decrease in softened output');
assert.ok(drift.softening.delta > 0, 'softening should increase in softened output');

const reader = audienceRead(source, output, 'legal-intake');
assert.ok(reader.some((warning) => warning.label === 'legal survivability'), 'legal-intake mode should flag lost claim specificity');

assert.ok(tooPrettyScore(source, output) > 0, 'over-polish risk should be non-zero when claims soften');

const plain = plainSpeechRecovery(source, output, 'retaliated\nevidence\nI refuse');
assert.ok(plain.includes('Plain recovery note'), 'plain speech recovery should carry missing-meaning note');

const receipt = phase39Receipt({ source, output, audience: 'legal-intake', lockboxText: 'retaliated\nevidence\nI refuse', mask: { id: 'test-mask', label: 'Test Mask' } });
assert.equal(receipt.schema, 'td613-hush-phase39-receipt/v1');
assert.equal(receipt.privateTextExcluded, true);
assert.equal(receipt.maskId, 'test-mask');
assert.equal(receipt.audienceThreatMode, 'legal-intake');
assert.ok(receipt.sourceHash.startsWith('fnv1a-'), 'receipt should include source hash');
assert.ok(receipt.outputHash.startsWith('fnv1a-'), 'receipt should include output hash');
assert.ok(!JSON.stringify(receipt).includes(source), 'receipt must not include source text');
assert.ok(!JSON.stringify(receipt).includes(output), 'receipt must not include output text');

const full = runPhase39({ source, output, audience: 'legal-intake', lockboxText: 'retaliated\nevidence\nI refuse' });
assert.ok(full.adversarialReaderWarnings.length, 'runPhase39 should return reader warnings');
assert.ok(full.epistemicideWarnings.length, 'runPhase39 should return alarm warnings');
assert.ok(full.receipt.privateTextExcluded, 'runPhase39 receipt should exclude private text');

console.log('Hush Phase 39 engine passes: reader, lockbox, alarm, drift, plain recovery, and clean receipt.');
