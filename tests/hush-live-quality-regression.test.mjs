import assert from 'assert';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { buildHushSwap } from '../app/engine/hush-swap.js';

function run(message, maskId = 'plain-witness') {
  const mask = getHushMask(maskId);
  assert(mask, `missing mask ${maskId}`);
  const result = buildHushSwap({ sourceText: message, mask, maskProfile: mask.profile, contextType: 'group-chat', options: { candidateCount: 24 } });
  const output = result.selectedOutput;
  assert.equal(result.version, 'phase-21');
  assert(output.trim().length > 0, `no output for ${message}`);
  assert.notEqual(output.trim(), message.trim(), 'output should not be unchanged');
  assert(result.payloadIntegrity, 'missing payload integrity');
  assert.equal(result.payloadIntegrity.passed, true, `payload integrity failed: ${JSON.stringify(result.payloadIntegrity)}`);
  return { result, output };
}

const sample1 = run('I saved the staffing note after Maya called. Please keep REF-23 and 5/18 together, but make it sound less like me.');
assert(sample1.output.includes('REF-23'));
assert(sample1.output.includes('5/18'));
assert(sample1.output.includes('Maya'));
assert(/staffing note/i.test(sample1.output));
assert(/saved/i.test(sample1.output));
assert(/called/i.test(sample1.output));
assert(!/\bon\.$/i.test(sample1.output));
assert(!/\bnot\.?$/i.test(sample1.output));

const sample2 = run('The vendor called twice after lunch. I logged INV-440 at 2:18 and told Jordan not to resend the spreadsheet until we know which version finance kept.', 'friendly-coworker');
assert(sample2.output.includes('INV-440'));
assert(sample2.output.includes('2:18'));
assert(/vendor/i.test(sample2.output));
assert(/called twice|vendor called/i.test(sample2.output));
assert(sample2.output.includes('Jordan'));
assert(/not resend|hold/i.test(sample2.output));
assert(/spreadsheet/i.test(sample2.output));
assert(/finance/i.test(sample2.output));
assert(/version/i.test(sample2.output));
assert(!/\b440 record\b/i.test(sample2.output));
assert(!/\b18\.\s*not\b/i.test(sample2.output));
assert(!/\bnot\.?$/i.test(sample2.output));

const sample3 = run('hey, quick thing: the file was there before noon. pls keep DOC-77 + 04/21 together bc that date is the whole point.');
assert(sample3.output.includes('DOC-77'));
assert(sample3.output.includes('04/21'));
assert(/file/i.test(sample3.output));
assert(/before noon/i.test(sample3.output));
assert(/whole point|because/i.test(sample3.output));
assert(!/\bon with\b/i.test(sample3.output));
assert(!/\bon\.$/i.test(sample3.output));

console.log('hush-live-quality-regression tests passed');
