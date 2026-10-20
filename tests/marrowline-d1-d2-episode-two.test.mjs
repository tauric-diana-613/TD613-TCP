import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyFrozenSixteen,blockSummary,AUTH,ACTIVATION,CALL_CAP} from '../research/marrowline-d-ingress-factor-ladder-20261019/d1-d2-original-sse-episode-two.mjs';
import {observeGoogleSseTerminal} from '../research/marrowline-d-ingress-factor-ladder-20261019/d1d2-terminal-feedback-observer.mjs';

test('second original-Google episode preserves the fixed D1/D2 source identity and all sixteen arm hashes',()=>{
 const x=verifyFrozenSixteen();
 assert.equal(x.prereg.state,'HELD_NOT_AUTHORIZED');
 assert.equal(x.model,'gemini-3.8-flash');
 assert.equal(CALL_CAP,16);
 assert.equal(x.prereg.plannedOrder.length,16);
 assert.deepEqual(x.prereg.plannedOrder,
  ['D1','SECTION','NAMED','D2','SECTION','D2','D1','NAMED',
  'NAMED','D1','D2','SECTION','D2','NAMED','SECTION','D1']);
 assert.equal(x.serialized.D1.observation.bodySha256,
  '3ed432721c95d74396044ebc6cb389b5eecc5eb02f850968be7da1cd9c5918a7');
 for(const s of x.prereg.proposedSlots){
  assert.equal(s.requestBodySha256,x.serialized[s.arm].observation.bodySha256);
 }
 assert.equal(blockSummary([]).every(x=>!x.complete),true);
});
test('provider block feedback keeps the episode HELD despite generated creative text',()=>{
 const raw=Buffer.from([
   'data: '+JSON.stringify({candidates:[{content:{parts:[{text:'A\u0307\u0323'}]}}]})+'\n\n',
   'data: '+JSON.stringify({promptFeedback:{blockReason:'OTHER'}})+'\n\n'
 ].join(''));
 const t=observeGoogleSseTerminal(raw);
 assert.equal(t.hasCandidate,true);
 assert.equal(t.terminalBlockReason,'OTHER');
 assert.equal(t.latestCandidateFinish,null);
 assert.equal(t.completed,false);
});
test('fresh activation is a unique exact-main first attempt and cannot reuse the prior episode',()=>{
 const s=readFileSync(new URL('../research/marrowline-d-ingress-factor-ladder-20261019/d1-d2-original-sse-episode-two.mjs',import.meta.url),'utf8');
 assert.equal(AUTH,'D1D2_EPISODE_TWO_EXACT_MAIN_FIRST_ATTEMPT');
 assert.equal(ACTIVATION,'research(marrowline): execute D1 D2 original SSE episode two once on main');
 assert.match(s,/TD613_D1D2_EP2_AUTH/);
 assert.match(s,/GITHUB_RUN_ATTEMPT,'1'/);
 assert.match(s,/GITHUB_REF,'refs\/heads\/main'/);
 assert.match(s,/GITHUB_SHA,process\.env\.TD613_D1D2_EP2_EXACT_HEAD/);
 assert.match(s,/--ack-new-episode-sixteen-paid-calls/);
 assert.match(s,/observeGoogleSseTerminal\(raw\)/);
 assert.match(s,/UPSTREAM_TERMINAL_PROMPT_FEEDBACK_/);
 assert.match(s,/if\(rec\.holdReason\)\{manifest\.holdReason=rec\.holdReason;break;\}/);
 assert.doesNotMatch(s,/for\s*\(\s*let retry|setTimeout\s*\(/);
});
test('protected one-shot uses a unique commit subject; legacy episode cannot re-fire',()=>{
 const w=readFileSync(new URL('../.github/workflows/td613-ci.yml',import.meta.url),'utf8');
 const begin=w.indexOf('  marrowline_d1d2_ep2_exact_main_gate:');
 const end=w.indexOf('\n  gemini_observation:',begin);
 assert.ok(begin>0&&end>begin);
 const part=w.slice(begin,end);
 assert.match(part,/github\.event_name == 'push'/);
 assert.match(part,/github\.run_attempt == 1/);
 assert.match(part,/needs: \[marrowline_d1d2_ep2_exact_main_gate, contracts\]/);
 assert.match(part,/environment: gemini-observation/);
 assert.match(part,/retention-days: 3/);
 assert.match(part,/persist-credentials: false/);
 assert.match(part,/--ack-new-episode-sixteen-paid-calls/);
 assert.match(w,/node --test tests\/marrowline-d1-d2-episode-two.test.mjs/);
});
