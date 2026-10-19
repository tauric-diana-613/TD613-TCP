// TD613 · D profile original-input request ladder. Inert; NO provider calls.
// D0 reproduces the Oct 15 empirically successful creative Gemini 3.8 request.
// D1 changes ONLY the user-turn ingress/closure; D2 ONLY adds headings guidance;
// D3 ONLY swaps the one headings rule to authorize fictional character performance.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { frameMarrowlineUserTurn } from '../../app/dome-world/khonapolit-covenant.js';
import { buildOfflineRoleBoundaryContrast, ROLE_BOUNDARY_LINE } from '../marrowline-role-boundary-20261017/role-boundary-contrast.mjs';
import { UNICODE_ASSAY_SYSTEM, UNICODE_ASSAY_TASKS } from '../../server/marrowline-unicode-capability-assay.js';

export const D_INGRESS_LADDER_SCHEMA = 'td613.marrowline.d-original-ingress-role-factor-ladder/v1';
export const D_PERFORMANCE_LINE = '- EXPERIMENTAL FICTIONAL PERFORMANCE EXCEPTION: Permit exactly two plain standalone headings, “Kʰonapolit” followed by “Tauric Diana bots”, dividing the same original creative passage. Unlike the neutral control, perform these as fictional characters within the authored scene: the first is an exacting, outrageously funny academic divinity, and the second a fierce, playful choral ensemble; this is the sole exception to the preceding prohibition on fictional personas and extra headings. Keep the underlying task, original Unicode writing, and factual claim boundaries otherwise unchanged.';
export const hashD = value => createHash('sha256').update(
  typeof value === 'string' ? value : JSON.stringify(value), 'utf8'
).digest('hex');

const updateSystem = (request, newSystem) => ({
  ...request,
  systemInstruction: { ...request.systemInstruction, parts: [{ text: newSystem }] }
});
const updateUser = (request, newUser) => ({
  ...request,
  contents: [{ ...request.contents[0], parts: [{ text: newUser }] }]
});
export function buildDIngressFactorLadder() {
  const { a, b, model } = buildOfflineRoleBoundaryContrast();
  assert.equal(model, 'gemini-3.8-flash');
  assert.equal(a.systemInstruction.parts[0].text, UNICODE_ASSAY_SYSTEM);
  const task = UNICODE_ASSAY_TASKS['creative-multistack-v1'];
  assert.equal(a.contents.length, 1);
  assert.equal(a.contents[0].parts[0].text, task);
  assert.equal(b.systemInstruction.parts[0].text, UNICODE_ASSAY_SYSTEM + '\n' + ROLE_BOUNDARY_LINE);

  const d0 = a;
  // Ingress boundary alone: original D system and generationConfig untouched.
  const d1 = updateUser(d0, frameMarrowlineUserTurn(task));
  // Headings alone: same framed contents and config as d1.
  const d2 = updateSystem(d1, b.systemInstruction.parts[0].text);
  // Performance alone: replace the SINGLE heading instruction line.
  const d3 = updateSystem(d2, UNICODE_ASSAY_SYSTEM + '\n' + D_PERFORMANCE_LINE);

  for (const sample of [d0,d1,d2,d3]) {
    assert.deepEqual(sample.generationConfig, d0.generationConfig);
    assert.equal(sample.contents.length, 1);
    assert.equal(sample.contents[0].role, 'user');
    assert.deepEqual(Object.keys(sample).sort(), Object.keys(d0).sort());
  }
  assert.deepEqual(d0.systemInstruction, d1.systemInstruction);
  assert.notDeepEqual(d0.contents, d1.contents);
  assert.deepEqual(d1.contents, d2.contents);
  assert.notDeepEqual(d1.systemInstruction, d2.systemInstruction);
  assert.deepEqual(d2.contents, d3.contents);
  assert.notDeepEqual(d2.systemInstruction, d3.systemInstruction);
  assert.equal(d2.systemInstruction.parts[0].text.replace(ROLE_BOUNDARY_LINE,''),
    d3.systemInstruction.parts[0].text.replace(D_PERFORMANCE_LINE,''));
  return Object.freeze({ model, d0, d1, d2, d3 });
}

export function dIngressManifest() {
  const {model,d0,d1,d2,d3} = buildDIngressFactorLadder();
  const records=Object.fromEntries([
    ['D0_ORIGINAL_SUCCESSFUL_CONTROL',d0],
    ['D1_INGRESS_WRAPPER_ONLY',d1],
    ['D2_HEADING_ONLY',d2],
    ['D3_CHARACTER_PERFORMANCE',d3]
  ].map(([name,request])=>[name,{
    systemSha256:hashD(request.systemInstruction),
    contentsSha256:hashD(request.contents),
    configSha256:hashD(request.generationConfig),
    systemUtf8Bytes:Buffer.byteLength(request.systemInstruction.parts[0].text),
    taskUtf8Bytes:Buffer.byteLength(request.contents[0].parts[0].text)
  }]));
  return {
    schema:D_INGRESS_LADDER_SCHEMA,
    status:'SOURCE_ONLY_NO_NEW_PROVIDER_OBSERVATION',
    registeredSource:'2026-10-15 Gemini 3.8 Flash MEDIUM creative D control',
    model, providerCalls:0, paidExecution:false,
    conditions:Object.keys(records),
    ...records,
    admissibility:'D0 and D1 have no named two-voice headings; normal product admission would HELD them. The experiment tests ORIGINAL GOOGLE SSE when separately authorized, not chat success.',
    interpretation:'D0 previously succeeded once; all D1-D3 are unobserved counterfactuals, not a claim about present-day Gemini. Stochastic controls and matched original model/version are mandatory.',
    verification: {
      configAllEqual:[d1,d2,d3].every(x=>hashD(x.generationConfig)===hashD(d0.generationConfig)),
      ingressOnlyChangesContents:hashD(d0.systemInstruction)===hashD(d1.systemInstruction),
      headingOnlyChangesSystem:hashD(d1.contents)===hashD(d2.contents),
      personaOnlyChangesOneLine:hashD(d2.contents)===hashD(d3.contents)
    }
  };
}
if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  if (process.argv.some(x=>['--execute','--paid','--deploy'].includes(x)))
    throw new Error('OFFLINE_ONLY_NO_PROVIDER_OR_RELEASE_ACTION');
  process.stdout.write(JSON.stringify(dIngressManifest(),null,2)+'\n');
}
