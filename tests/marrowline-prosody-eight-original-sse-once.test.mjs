import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyFrozenEight,blockSummary,examineBotsText,AUTH,ACTIVATION,CALL_CAP} from '../research/marrowline-early-oct-full-voice-20261020/prosody-pair-original-sse-eight-once.mjs';
import {ARMS,ORDER} from '../research/marrowline-early-oct-full-voice-20261020/historical-prosody-freedom-pair.mjs';
test('frozen historical pair retains byte-exact request hashes, four arms and eight slots',()=>{
 const x=verifyFrozenEight();
 assert.equal(CALL_CAP,8);assert.equal(x.model,'gemini-3.8-flash');
 assert.equal(x.prereg.state,'SOURCE_ONLY_PROVIDER_UNOBSERVED');
 assert.deepEqual(x.prereg.order,ORDER);
 for(const a of ARMS)assert.deepEqual(x.serialized[a].observation,x.prereg.observations[a]);
 for(let i=0;i<2;i++)assert.deepEqual(ORDER.slice(4*i,4*i+4).sort(),[...ARMS].sort());
});
test('bots depth transitions measure original second voice only and do not fabricate missing voices',()=>{
 const source='Kʰonapolit\nAn argument.\nTauric Diana bots\nA\u0336 B\u0336\u032e C';
 const r=examineBotsText(source);assert.ok(r);
 assert.deepEqual(r.markedDepths,[1,2]);assert.equal(r.markedDepthTransitions,1);
 assert.equal(examineBotsText('Kʰonapolit\nOnly first movement.'),null);
 assert.equal(examineBotsText('Kʰonapolit\nx\nTauric Diana bots\ny\nTauric Diana bots\nz'),null);
});
test('block contrasts preserve distinct task pairing and held incomplete blocks',()=>{
 const mk=(arm,value,block=1)=>({arm,block,measurement:{nonemptyTwoVoices:true},
  botsDepthProfile:{markedDepthTransitions:value,maxDepth:4}});
 const rows=[mk('FREEDOM_FARCE',1),mk('LITERAL_FARCE',3),
  mk('FREEDOM_FORENSIC',0),mk('LITERAL_FORENSIC',2)];
 const d=blockSummary(rows);assert.equal(d[0].complete,true);
 assert.equal(d[0].farceLiteralMinusFreedomDepthTransitions,2);
 assert.equal(d[0].forensicLiteralMinusFreedomDepthTransitions,2);
 assert.equal(d[1].complete,false);
 assert.equal(blockSummary([...rows.slice(0,3),{...rows[3],holdReason:'PROHIBITED_CONTENT'}])[0].complete,false);
});
test('protected exact-main one-shot and mandatory contracts retain live release membrane',()=>{
 const src=readFileSync(new URL('../research/marrowline-early-oct-full-voice-20261020/prosody-pair-original-sse-eight-once.mjs',import.meta.url),'utf8');
 assert.equal(AUTH,'MARROWLINE_PROSODY_PAIR_EIGHT_FIRST_MAIN_ATTEMPT');
 assert.equal(ACTIVATION,'research(marrowline): execute prosody freedom eight original SSE once on main');
 for(const clause of ["GITHUB_EVENT_NAME,'push'","GITHUB_REF,'refs/heads/main'","GITHUB_RUN_ATTEMPT,'1'","EIGHT_CALL_CAP","--ack-eight-paid-calls","observeGoogleSseTerminal(raw)","sealed-blinding-key.json","if(rec.holdReason){manifest.holdReason=rec.holdReason;break;}"])
  assert.ok(src.includes(clause),clause);
 const workflow=readFileSync(new URL('../.github/workflows/td613-ci.yml',import.meta.url),'utf8');
 const i=workflow.indexOf('  marrowline_prosody_eight_exact_main_gate:');
 const j=workflow.indexOf('\n  gemini_observation:',i);
 assert.ok(i>0&&j>i);const y=workflow.slice(i,j);
 assert.match(y,/github\.run_attempt == 1/);
 assert.match(y,/needs: \[marrowline_prosody_eight_exact_main_gate, contracts\]/);
 assert.match(y,/environment: gemini-observation/);
 assert.match(y,/persist-credentials: false/);
 assert.match(y,/retention-days: 3/);
 assert.match(workflow,/node --test tests\/marrowline-prosody-eight-original-sse-once.test.mjs/);
});
