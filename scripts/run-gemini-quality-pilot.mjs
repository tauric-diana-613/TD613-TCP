import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { listGeminiGenerateContentModels } from '../server/gemini-model-discovery.js';
import { assessGeminiEligibility } from '../server/gemini-model-registry.js';
import { buildPrompt, quarantineCandidateRows } from '../server/hush-provider-contract.js';
import { parseProviderJson } from '../server/hush-generate-quality.js';

const schema = 'td613.hush-custody-quality-pilot/v0.1';
const models = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];
const timeoutMs = 12000;
const maxOutputTokens = 1536;
const key = process.env.GEMINI_API_KEY || '';
const startedAt = new Date().toISOString();
const emit = (receipt, exitCode = 0) => {
  const output = JSON.stringify(receipt, null, 2);
  if (key && output.includes(key)) {
    process.stdout.write(JSON.stringify({ schema, ok: false, error: 'credential-echo-rejected' }) + '\n');
    process.exitCode = 1;
  } else {
    process.stdout.write(output + '\n');
    process.exitCode = exitCode;
  }
};
let custody = null;
const fail = error => emit({ schema, ok: false, complete: false, custody, startedAt, completedAt: new Date().toISOString(), error }, 1);

async function main() {
  if (process.env.TD613_GEMINI_QUALITY_PILOT !== 'true'
    || process.env.GITHUB_EVENT_NAME !== 'workflow_dispatch'
    || process.env.GITHUB_REF !== 'refs/heads/main'
    || !/^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA || '')
    || !/^[1-9]\d*$/.test(process.env.GITHUB_RUN_ID || '')
    || !/^[1-9]\d*$/.test(process.env.GITHUB_RUN_ATTEMPT || '')) return fail('invalid-actions-pilot-context');
  custody = { sourceSha: process.env.GITHUB_SHA, runId: process.env.GITHUB_RUN_ID,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT, environment: 'gemini-quality-pilot', event: 'workflow_dispatch', ref: 'refs/heads/main' };
  if (!key) return fail('missing-gemini-api-key');
  const bytes = readFileSync(new URL('../tests/fixtures/gemini/hush-quality-pilot.json', import.meta.url));
  const fixture = JSON.parse(bytes);
  if (fixture.fictional !== true || fixture.cases?.length !== 3
    || fixture.cases.some(row => typeof row.contract?.sourceText !== 'string' || row.contract.sourceText.length > 2000 || row.contract.candidateCount !== 1)
    || new Set(fixture.cases.map(row => row.id)).size !== 3) return fail('invalid-fixed-pilot-fixtures');
  const listing = await listGeminiGenerateContentModels(key, { force: true });
  if (!listing.ok || !listing.complete) return fail('provider-listing-held');
  const rows = [];
  let generationCalls = 0;
  for (const model of models) {
    const eligibility = assessGeminiEligibility(model, { explicit: true, listing });
    for (const test of fixture.cases) {
      if (!eligibility.eligible) {
        rows.push({ model, fixture: test.id, state: 'HELD', reasons: eligibility.reasons, generationCalled: false });
        continue;
      }
      const prompt = buildPrompt(test.contract);
      const start = Date.now();
      const controller = new AbortController();
      let timer;
      generationCalls += 1;
      try {
        const result = await Promise.race([
          (async () => {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
              method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, signal: controller.signal,
              body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.22, topP: 0.64, responseMimeType: 'application/json', maxOutputTokens } })
            });
            return { response, payload: await response.json() };
          })(),
          new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('bounded-timeout')); }, timeoutMs); })
        ]);
        const text = (result.payload?.candidates?.[0]?.content?.parts || []).filter(part => part.thought !== true).map(part => typeof part.text === 'string' ? part.text : '').join('');
        const parsed = parseProviderJson(text.slice(0, 18000), test.contract);
        const audited = quarantineCandidateRows(parsed.candidates, test.contract);
        const hardGatesPassed = result.response.ok && audited.length === 1 && audited.every(row => row.passed);
        const tokens = result.payload?.usageMetadata?.totalTokenCount;
        rows.push({ model, fixture: test.id, generationCalled: true, status: result.response.status,
          elapsedMs: Date.now() - start, state: hardGatesPassed ? 'HARD_GATES_PASSED' : 'HELD',
          hardGatesPassed, candidates: audited, rawText: text.slice(0, 18000),
          totalTokenCount: Number.isFinite(tokens) && tokens >= 0 ? tokens : null,
          humanSemanticReview: 'REQUIRED' });
      } catch {
        rows.push({ model, fixture: test.id, generationCalled: true, state: 'HELD', error: 'provider-transport-or-body-failure', elapsedMs: Date.now() - start });
      } finally { clearTimeout(timer); }
    }
  }
  emit({ schema, ok: true, complete: true, custody, startedAt, completedAt: new Date().toISOString(),
    fixtureSha256: createHash('sha256').update(bytes).digest('hex'),
    limits: { maxGenerationCalls: 15, maxOutputTokensPerCall: maxOutputTokens, timeoutMsPerCall: timeoutMs, retries: 0 },
    generationCalls, providerListing: listing, rows,
    claimCeiling: 'fixed-synthetic-hush-custody-pilot-not-general-quality-ranking-or-release-authority',
    humanSemanticReview: 'REQUIRED', automaticRankingPromotion: false });
}
main().catch(() => fail('pilot-runner-failure'));
