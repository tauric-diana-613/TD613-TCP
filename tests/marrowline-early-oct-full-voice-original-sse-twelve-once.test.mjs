import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyFrozenTwelve,blockSummary,AUTH,ACTIVATION,CALL_CAP} from '../research/marrowline-early-oct-full-voice-20261020/full-voice-original-sse-twelve-once.mjs';
import {ORDER,ARMS} from '../research/marrowline-early-oct-full-voice-20261020/full-voice-current-restored-offline.mjs';

test('twelve real two-voice full-packet source hashes and order are frozen',()=>{
 const x=verifyFrozenTwelve();
 assert.equal(CALL_CAP,12);
 assert.equal(x.model,'gemini-3.8-flash');
 assert.equal(x.prereg.state,'SOURCE_ONLY_NO_PROVIDER_EXECUTION');
 assert.deepEqual(x.prereg.order,ORDER);
 for(const a of ARMS)assert.equal(ORDER.filter(x=>x===a).length,3);
 for(let i=0;i<3;i++)assert.deepEqual(ORDER.slice(i*4,i*4+4).slice().sort(),[...ARMS].sort());
 for(const a of ARMS)assert.deepEqual(x.serialized[a].observation,x.prereg.armObservations[a]);
});
test('three within-task second-voice comparisons retain missing structural returns',()=>{
 const r=(block,arm,n,has=true)=>({
  block,arm,measurement:{nonemptyTwoVoices:has,
    voiceMorphology:has?[{}, {stackedAmongMarked:n}]:null}
 });
 const rows=[r(1,'CURRENT_FARCE',0.1),r(1,'RESTORED_FARCE',0.9),
  r(1,'CURRENT_FORENSIC',0.4),r(1,'RESTORED_FORENSIC',0.3)];
 const result=blockSummary(rows);
 assert.equal(result[0].complete,true);
 assert.ok(Math.abs(result[0].farceRestoredMinusCurrentBotsStack-0.8)<1e-10);
 assert.ok(Math.abs(result[0].forensicRestoredMinusCurrentBotsStack+0.1)<1e-10);
 assert.equal(result[1].complete,false);
 assert.equal(blockSummary(rows.slice(0,3))[0].complete,false);
 assert.equal(blockSummary([...rows.slice(0,3),r(1,'RESTORED_FORENSIC',null,false)])[0].forensicRestoredMinusCurrentBotsStack,null);
 assert.equal(blockSummary([...rows.slice(0,3),{...rows[3],holdReason:'OTHER'}])[0].complete,false);
});
test('twelve-call executor enforces exact-main one-time provenance and does not leak a new dispatch route',()=>{
 const s=readFileSync(new URL('../research/marrowline-early-oct-full-voice-20261020/full-voice-original-sse-twelve-once.mjs',import.meta.url),'utf8');
 assert.equal(AUTH,'MARROWLINE_FULL_VOICE_12_EXACT_MAIN_FIRST_ATTEMPT');
 assert.equal(ACTIVATION,'research(marrowline): execute early October full voice twelve SSE once on main');
 for(const t of ["GITHUB_EVENT_NAME,'push'","GITHUB_REF,'refs/heads/main'","GITHUB_RUN_ATTEMPT,'1'","TWELVE_CALL_CAP","--ack-twelve-paid-calls","observeGoogleSseTerminal(raw)","sealed-blinding-key.json","if(rec.holdReason){manifest.holdReason=rec.holdReason;break;}"])
  assert.ok(s.includes(t),t);
 assert.doesNotMatch(s,/for\s*\(\s*let retry|setTimeout\s*\(/);
 const w=readFileSync(new URL('../.github/workflows/td613-ci.yml',import.meta.url),'utf8');
 const a=w.indexOf('  marrowline_full_voice_twelve_exact_main_gate:');
 const b=w.indexOf('\n  gemini_observation:',a);
 assert.ok(a>0&&b>a);
 const gated=w.slice(a,b);
 assert.match(gated,/github\.run_attempt == 1/);
 assert.match(gated,/needs: \[marrowline_full_voice_twelve_exact_main_gate, contracts\]/);
 assert.match(gated,/environment: gemini-observation/);
 assert.match(gated,/retention-days: 3/);
 assert.match(gated,/persist-credentials: false/);
 assert.match(w,/node --test tests\/marrowline-early-oct-full-voice-original-sse-twelve-once.test.mjs/);
});
