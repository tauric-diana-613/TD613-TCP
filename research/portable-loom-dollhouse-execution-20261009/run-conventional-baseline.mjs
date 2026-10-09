import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { evaluateConventionalCase, sha256 } from './conventional-baseline.mjs';

// Fixed corpus only. No key argument, key access, networking, models or retries.
const [bindingPath, outPath] = process.argv.slice(2);
if (!bindingPath || !outPath || process.argv.length !== 4) throw new Error('Usage: node run-conventional-baseline.mjs <binding.json> <new-output-directory>');
const cwd = process.cwd(), output = resolve(outPath);
if (existsSync(output)) throw new Error('Attempt directory already exists; original attempt cannot be overwritten.');
const bindingBytes = readFileSync(bindingPath), binding = JSON.parse(bindingBytes);
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (binding.schema !== 'td613.loom.dollhouse-execution-binding/v0.1' || !/^[a-f0-9]{40}$/.test(head)) throw new Error('Invalid source binding.');
for (const f of binding.input_and_source_records) {
  const p = resolve(cwd, f.path);
  if (!p.startsWith(cwd + '/') || sha256(readFileSync(p)) !== f.sha256) throw new Error(`Source/input mismatch: ${f.path}`);
  const committed = execFileSync('git', ['show', `${head}:${f.path}`]);
  if (sha256(committed) !== f.sha256) throw new Error(`Uncommitted source/input: ${f.path}`);
}
const corpusBytes = readFileSync(binding.corpus_path), corpus = JSON.parse(corpusBytes);
if (corpus.cases.length !== 12 || new Set(corpus.cases.map(c => c.case_id)).size !== 12) throw new Error('Fixed twelve-case corpus required.');
mkdirSync(output, { recursive: false });
const request = { schema: 'td613.loom.local-attempt/v0.1', arm: 'E', attempt: 1,
  premeasurement_commit: head, binding_sha256: sha256(bindingBytes), corpus_sha256: sha256(corpusBytes),
  evidence_class: 'LOCAL_STRUCTURAL_TEST', fixture_origin: 'SYNTHETIC_AUDIT_FIXTURE',
  model_calls: 0, retries: 0, started_at: new Date().toISOString(),
  repetition_rule: 'Three deterministic repetitions per fixed case; one unique case, not three empirical witnesses.' };
writeFileSync(join(output, 'request.json'), JSON.stringify(request, null, 2) + '\n', { flag: 'wx' });
let stdout = '';
for (const c of corpus.cases) for (let repetition = 1; repetition <= 3; repetition++) {
  const start = process.hrtime.bigint();
  const result = evaluateConventionalCase(c);
  stdout += JSON.stringify({ case_id: c.case_id, repetition, input_sha256: sha256(JSON.stringify(c)),
    duration_ns: Number(process.hrtime.bigint() - start), result }) + '\n';
  writeFileSync(join(output, 'responses.jsonl'), stdout);
}
writeFileSync(join(output, 'completion.json'), JSON.stringify({ ...request, ended_at: new Date().toISOString(),
  completed_outputs: 36, unique_cases: 12, responses_sha256: sha256(stdout), model_calls: 0, api_spend_usd: 0 }, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ status: 'CAPTURED', outputs: 36, unique_cases: 12, model_calls: 0, output }));
