import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const script = fileURLToPath(new URL('../research/marrowline-finite-descent-20261015/run-pair.mjs', import.meta.url));
// Strip credentials from the test process: no synthetic test may spend real provider credits.
const { GEMINI_API_KEY: _key, TD613_FINITE_DESCENT_MAX_USD: _bound, TD613_FINITE_DESCENT_OUT: _output, ...safeEnv } = process.env;
const invoke = args => spawnSync(process.execPath, [script, ...args], {
  encoding: 'utf8', timeout: 20000, env: safeEnv
});

test('finite descent preflight has two identical provider request fields without generating', () => {
  const run = invoke([]);
  assert.equal(run.status, 0, run.stderr);
  const plan = JSON.parse(run.stdout);
  assert.equal(plan.sourceOnly, true);
  assert.equal(plan.expectedProviderCalls, 2);
  assert.equal(plan.automaticRetries, 0);
  assert.equal(plan.maxOutputTokensPerCall, 12288);
  assert.deepEqual(plan.requestFingerprints.map(x => x.requestedModel),
    ['gemini-3.8-flash', 'gemini-3.6-flash']);
  for (const field of ['systemSha256', 'contentsSha256', 'generationConfigSha256']) {
    assert.equal(plan.requestFingerprints[0][field], plan.requestFingerprints[1][field], field);
  }
  assert.ok(plan.requestFingerprints.every(x => x.requestBodyUtf8Bytes <= 85000));
  assert.ok(plan.publishedRateUpperEstimateUsd > 0);
  assert.ok(plan.publishedRateUpperEstimateUsd < 0.25);
  assert.equal(plan.hardUsdCapGuaranteed, false);
});

test('paid execution rejects missing human acknowledgment and reviewed bound before fetch', () => {
  const noAck = invoke(['--execute']);
  assert.notEqual(noAck.status, 0);
  assert.match(noAck.stderr, /PAID_EXPERIMENT_NOT_ACKNOWLEDGED/);
  const noBound = invoke(['--execute', '--ack-paid']);
  assert.notEqual(noBound.status, 0);
  assert.match(noBound.stderr, /REVIEWED_SPENDING_BOUND_REQUIRED/);
});

test('finite descent episode encrypts and decrypts without leaking the key', () => {
  const dir = mkdtempSync(join(tmpdir(), 'td613-finite-seal-'));
  try {
    const input = join(dir, 'original.txt'), sealed = join(dir, 'sealed.enc'), plain = join(dir, 'recovered.txt');
    const witness = 'test-only\\u0301 provider/native Unicode and exact continuation\\n';
    const key = 'SYNTHETIC_TEST_KEY_NEVER_REAL_1234567890';
    writeFileSync(input, witness);
    const cryptoScript = fileURLToPath(new URL('../research/marrowline-finite-descent-20261015/seal-archive.mjs', import.meta.url));
    const invokeCrypto = (mode, a, b) => spawnSync(process.execPath,
      [cryptoScript, mode, a, b], {encoding: 'utf8',env:{...safeEnv,GEMINI_API_KEY:key}});
    const enc = invokeCrypto('encrypt', input, sealed);
    assert.equal(enc.status, 0, enc.stderr);
    const bytes = readFileSync(sealed);
    assert.equal(bytes.includes(Buffer.from(witness)), false);
    assert.equal(bytes.includes(Buffer.from(key)), false);
    const dec = invokeCrypto('decrypt', sealed, plain);
    assert.equal(dec.status, 0, dec.stderr);
    assert.equal(readFileSync(plain,'utf8'), witness);
    bytes[bytes.length-1] ^= 1;
    const broken=join(dir,'tampered.enc');
    writeFileSync(broken,bytes);
    const fail=invokeCrypto('decrypt',broken,join(dir,'tampered.txt'));
    assert.notEqual(fail.status,0,'AES-GCM authentication rejects changed ciphertext');
  } finally { rmSync(dir,{recursive:true,force:true}); }
});

test('production-native khonapolit canary preflight is network-free and bounded', () => {
  const routeScript = fileURLToPath(new URL('../research/marrowline-finite-descent-20261015/run-khonapolit-canary.mjs', import.meta.url));
  const run = spawnSync(process.execPath, [routeScript], {encoding:'utf8',env:safeEnv,timeout:15000});
  assert.equal(run.status,0,run.stderr);
  const plan=JSON.parse(run.stdout);
  assert.equal(plan.preflight,true);
  assert.equal(plan.maxCalls,2);
  assert.equal(plan.maxTotalRequests,2);
  assert.equal(plan.retries,0);
  assert.equal(plan.repairsDisabledByCanaryHeader,true);
  assert.equal(plan.productionUrl,'https://td613.com/api/khonapolit');
  assert.deepEqual(plan.models,['gemini-3.8-flash','gemini-3.6-flash']);
  const withoutAck=spawnSync(process.execPath,[routeScript,'--execute'],
    {encoding:'utf8',env:safeEnv,timeout:15000});
  assert.notEqual(withoutAck.status,0);
  assert.match(withoutAck.stderr,/PAID_REQUEST_ACKNOWLEDGEMENT_REQUIRED/);
});

test('same-model A/B preflight changes only the user clause and never calls production', () => {
 const script=fileURLToPath(new URL('../research/marrowline-finite-descent-20261015/run-same-model-cue.mjs',import.meta.url));
 const x=spawnSync(process.execPath,[script],{encoding:'utf8',env:safeEnv,timeout:15000});
 assert.equal(x.status,0,x.stderr);
 const plan=JSON.parse(x.stdout);
 assert.equal(plan.preflight,true);
 assert.equal(plan.countLimit,2);
 assert.equal(plan.retries,0);
 assert.equal(plan.model,'gemini-3.8-flash');
 assert.equal(plan.onlyChangedFactor,'added lower-priority user-message cue');
 assert.deepEqual(plan.conditions.map(c=>c.name),['A_REPLICATE','B_VERTICAL_CUE']);
 assert.notEqual(plan.conditions[0].bodySha256,plan.conditions[1].bodySha256);
 const stop=spawnSync(process.execPath,[script,'--execute'],{encoding:'utf8',env:safeEnv,timeout:15000});
 assert.notEqual(stop.status,0);
 assert.match(stop.stderr,/OPERATOR_PAID_ACK_REQUIRED/);
});
