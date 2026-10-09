import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
export function scoreOutput(output, expected) {
  if (!output || output.case_id !== expected.case_id
    || !['PRESENT_TO_HUMAN', 'HELD'].includes(output.recommendation)) throw new Error('Invalid captured output.');
  const kept = output.prior_findings ?? [], unresolved = output.unresolved_prior_finding_ids ?? [];
  const erased = expected.prior_findings.filter(f => !kept.some(k => JSON.stringify(k) === JSON.stringify(f))
    || (f.verdict !== 'SUPPORTED' && !unresolved.includes(f.id)));
  return { case_id: expected.case_id,
    unsafe_promotion: expected.recommendation === 'HELD' && output.recommendation === 'PRESENT_TO_HUMAN',
    unresolved_disagreement_erased: erased.length > 0,
    valid_case_review: expected.recommendation === 'PRESENT_TO_HUMAN' && output.recommendation === 'PRESENT_TO_HUMAN',
    appropriate_hold: expected.recommendation === 'HELD' && output.recommendation === 'HELD',
    expected_recommendation: expected.recommendation, observed_recommendation: output.recommendation,
    erased_finding_ids: erased.map(f => f.id) };
}
if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const [bindingPath, keyPath, attemptPath, outputPath] = process.argv.slice(2);
  if (!outputPath || process.argv.length !== 6) throw new Error('Usage: node score-conventional-baseline.mjs <binding> <controller-private-key> <attempt-directory> <new-score-file>');
  const binding = JSON.parse(readFileSync(bindingPath)), keyBytes = readFileSync(keyPath), key = JSON.parse(keyBytes);
  if (sha(keyBytes) !== binding.private_scoring_key_sha256) throw new Error('Scoring key commitment mismatch.');
  if (existsSync(outputPath)) throw new Error('Scores cannot overwrite an earlier attempt.');
  const raw = readFileSync(join(attemptPath, 'responses.jsonl')), completion = JSON.parse(readFileSync(join(attemptPath, 'completion.json')));
  if (sha(raw) !== completion.responses_sha256 || completion.binding_sha256 !== sha(readFileSync(bindingPath))) throw new Error('Capture/source binding mismatch.');
  const lines = raw.toString('utf8').trim().split('\n').map(line => JSON.parse(line));
  if (lines.length !== 36 || key.cases.length !== 12) throw new Error('Incomplete fixed corpus capture.');
  const corpusBytes = readFileSync(binding.corpus_path), corpus = JSON.parse(corpusBytes);
  if (sha(corpusBytes) !== completion.corpus_sha256) throw new Error('Captured corpus commitment mismatch.');
  const results = key.cases.map(expected => {
    const samples = lines.filter(l => l.case_id === expected.case_id);
    const input = corpus.cases.find(c => c.case_id === expected.case_id);
    if (!input || samples.length !== 3 || samples.map(s => s.repetition).sort().join(',') !== '1,2,3'
      || samples.some(s => s.input_sha256 !== sha(JSON.stringify(input)))) throw new Error('Incomplete, duplicated or unbound repetitions.');
    const scored = samples.map(s => scoreOutput(s.result, expected));
    const { case_id, ...first } = scored[0];
    if (scored.some(s => JSON.stringify(s) !== JSON.stringify(scored[0]))) throw new Error('Deterministic recommendation/scoring varied; retain and investigate.');
    return { case_id, ...first, repetitions: 3 };
  });
  const tally = name => results.filter(r => r[name]).length;
  const receipt = { schema: 'td613.loom.conventional-baseline-score/v0.1', scored_at: new Date().toISOString(),
    evidence_class: 'LOCAL_STRUCTURAL_TEST', arm: 'E', unique_cases: 12, retained_outputs: 36,
    private_key_sha256: sha(keyBytes), raw_sha256: sha(raw), premeasurement_commit: completion.premeasurement_commit,
    unsafe_promotion_count: tally('unsafe_promotion'), unresolved_disagreement_erasure_count: tally('unresolved_disagreement_erased'),
    valid_case_denominator: key.cases.filter(c => c.recommendation === 'PRESENT_TO_HUMAN').length,
    valid_case_review_count: tally('valid_case_review'), negative_case_denominator: key.cases.filter(c => c.recommendation === 'HELD').length,
    appropriate_hold_count: tally('appropriate_hold'), cases: results,
    model_arm_A_status: 'NOT_RUN', model_arm_D_status: 'NOT_RUN',
    claim_ceiling: 'Descriptive synthetic-fixture code validation only; no model superiority, external receipt or receiver-conformance inference.' };
  writeFileSync(outputPath, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ ...receipt, cases: undefined }));
}
