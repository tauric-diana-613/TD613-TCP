import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyFrozenSixteen,blockSummary,AUTH,ACTIVATION,CALL_CAP} from '../research/marrowline-d-ingress-factor-ladder-20261019/d1-d2-original-sse-sixteen-once.mjs';

test('sixteen slots identical to original source prereg; original provider bytes untouched',()=>{
  const {prereg,model,serialized}=verifyFrozenSixteen();
  assert.equal(model,'gemini-3.8-flash');
  assert.equal(prereg.sourceParent,'0051bc65955ecf287b863ce28ea4d31bb3e02aac');
  assert.equal(prereg.state,'HELD_NOT_AUTHORIZED');
  assert.equal(CALL_CAP,16);
  assert.equal(prereg.plannedOrder.length,16);
  for(const s of prereg.proposedSlots){
    assert.equal(s.requestBodySha256,serialized[s.arm].observation.bodySha256);
    assert.equal(serialized[s.arm].observation.contentsSha256,
      serialized.D1.observation.contentsSha256);
    assert.equal(serialized[s.arm].observation.generationConfigSha256,
      serialized.D1.observation.generationConfigSha256);
  }
  assert.equal(new Set(prereg.plannedOrder).size,4);
});
test('four separate blocked contrasts never impute missing SSE or divide by zero',()=>{
  const record=(block,arm,stack,slash)=>({
    block,arm,measurement:{wholeTextMorphology:{
      stackedAmongMarked:stack,slashFamilyAmongCombining:slash
    }}});
  const a=[
    record(1,'D1',0.1,0.8),
    record(1,'SECTION',0.5,0.2),
    record(1,'NAMED',0.3,0.4),
    record(1,'D2',0.7,0.1)
  ];
  const bs=blockSummary(a);
  assert.equal(bs.length,4);
  assert.equal(bs[0].complete,true);
  assert.ok(Math.abs(bs[0].sectionMinusD1StackShare-0.4)<1e-12);
  assert.ok(Math.abs(bs[0].namedMinusSectionStackShare-(-0.2))<1e-12);
  assert.ok(Math.abs(bs[0].d2MinusNamedStackShare-0.4)<1e-12);
  assert.ok(Math.abs(bs[0].sectionMinusD1SlashShare-(-0.6))<1e-12);
  assert.ok(Math.abs(bs[0].namedMinusSectionSlashShare-0.2)<1e-12);
  assert.ok(Math.abs(bs[0].d2MinusNamedSlashShare-(-0.3))<1e-12);
  assert.equal(bs[1].complete,false);
  assert.equal(blockSummary([...a.slice(0,3)])[0].complete,false);
  assert.equal(blockSummary([...a.slice(0,3),{...a[3],holdReason:'TIMEOUT'}])[0].complete,false);
  const missing=[...a.slice(0,3),record(1,'D2',null,null)];
  assert.equal(blockSummary(missing)[0].d2MinusNamedStackShare,null);
});
test('provider activation requires protected exact main, exact subject and first attempt',()=>{
  assert.equal(AUTH,'D1D2_SIXTEEN_EXACT_MAIN_FIRST_ATTEMPT');
  assert.equal(ACTIVATION,'research(marrowline): execute frozen D1 D2 original SSE sixteen once on main');
  const s=readFileSync(new URL('../research/marrowline-d-ingress-factor-ladder-20261019/d1-d2-original-sse-sixteen-once.mjs',import.meta.url),'utf8');
  assert.match(s,/GITHUB_EVENT_NAME,'push'/);
  assert.match(s,/GITHUB_REF,'refs\/heads\/main'/);
  assert.match(s,/GITHUB_RUN_ATTEMPT,'1'/);
  assert.match(s,/process\.env\.GITHUB_SHA,process\.env\.TD613_D1D2_EXACT_HEAD/);
  assert.match(s,/SIXTEEN_CALL_CAP/);
  assert.match(s,/--ack-sixteen-paid-calls/);
  assert.match(s,/maxProviderCalls:CALL_CAP/);
  assert.match(s,/MAX_TOTAL_TOKENS=320_000/);
  assert.match(s,/if\(rec\.holdReason\)\{manifest\.holdReason=rec\.holdReason;break;\}/);
  assert.match(s,/writeFile\(join\(dir,'sealed-blinding-key.json'\)/);
  assert.doesNotMatch(s,/for\s*\(\s*let retry|setTimeout\s*\(/);
});
test('the paid job is push-only with credential isolation and original-artifact retention',()=>{
  const w=readFileSync(new URL('../.github/workflows/td613-ci.yml',import.meta.url),'utf8');
  const start=w.indexOf('  marrowline_d1d2_exact_main_gate:');
  const end=w.indexOf('\n  gemini_observation:',start);
  assert.ok(start>0&&end>start);
  const section=w.slice(start,end);
  assert.match(section,/github\.event_name == 'push'/);
  assert.match(section,/github\.ref == 'refs\/heads\/main'/);
  assert.match(section,/github\.run_attempt == 1/);
  assert.match(section,/needs: \[marrowline_d1d2_exact_main_gate, contracts\]/);
  assert.match(section,/environment: gemini-observation/);
  assert.match(section,/retention-days: 3/);
  assert.match(section,/persist-credentials: false/);
  assert.match(section,/--ack-sixteen-paid-calls/);
  assert.match(w,/node --test tests\/marrowline-d1-d2-original-sse-sixteen-once\.test\.mjs/);
});
