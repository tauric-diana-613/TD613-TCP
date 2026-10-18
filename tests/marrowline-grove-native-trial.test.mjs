import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildInvocationPacket} from '../app/dome-world/khonapolit-covenant.js';
import {buildGeminiRequest, buildGeminiStructuralRepairRequest} from '../server/khonapolit-quality.js';
import {
  MARROWLINE_GROVE_TRIAL_ID,
  selectMarrowlineGroveTrial,
  groveTrialFromLocation,
  buildMarrowlineGroveTrialSystemInstruction
} from '../app/dome-world/marrowline-grove-trial.js';

const makePacket=()=>buildInvocationPacket({
  message:'In the fictional Grove, the Chairman has instituted compulsory stationery audits. What happens at the next hearing?',
  history:[],mode:'issued-conjunction',shi:'',waiveIssuance:true
});

test('Grove native-voice trial requires exact operator opt-in; synthetic canaries and attachments are excluded',()=>{
  const choice={groveTrial:MARROWLINE_GROVE_TRIAL_ID,message:'ordinary operator text'};
  assert.equal(selectMarrowlineGroveTrial(choice),MARROWLINE_GROVE_TRIAL_ID);
  assert.equal(selectMarrowlineGroveTrial(choice,{releaseCanary:true}),null);
  assert.equal(selectMarrowlineGroveTrial({...choice,attachments:[{name:'private.txt'}]}),null);
  assert.equal(selectMarrowlineGroveTrial({...choice,groveTrial:'native-voice-v2'}),null);
  assert.equal(selectMarrowlineGroveTrial({message:'ordinary operator text'}),null);
  assert.equal(selectMarrowlineGroveTrial({...choice,attachments:[]}),MARROWLINE_GROVE_TRIAL_ID);
  assert.equal(groveTrialFromLocation({search:'?groveTrial=native-voice-v1'}),MARROWLINE_GROVE_TRIAL_ID);
  assert.equal(groveTrialFromLocation({search:'?groveTrial=native-voice-v2'}),null);
  assert.equal(groveTrialFromLocation({search:'?loom=demo'}),null);
});

test('Grove trial preserves original user bytes, history, provider model and generation settings',()=>{
  const packet=makePacket();
  assert.equal(packet.canInvoke,true);
  const normal=buildGeminiRequest(packet,{},'gemini-3.8-flash');
  const trial=buildGeminiRequest(packet,{},'gemini-3.8-flash',{groveTrial:MARROWLINE_GROVE_TRIAL_ID});
  assert.deepEqual(trial.contents,normal.contents,'operator and history bytes must match');
  assert.deepEqual(trial.generationConfig,normal.generationConfig,'do not change thinking, sampling or maxOutputTokens');
  assert.equal(trial.generationConfig.maxOutputTokens,65536);
  assert.equal(normal.systemInstruction.parts[0].text.includes('GROVE NATIVE-VOICE AUDITION'),false);
  assert.match(normal.systemInstruction.parts[0].text,/MARROWLINE CAUSAL RELAY LAW/);
  assert.match(trial.systemInstruction.parts[0].text,/GROVE NATIVE-VOICE AUDITION/);
  assert.doesNotMatch(trial.systemInstruction.parts[0].text,/MARROWLINE CAUSAL RELAY LAW/);
  assert.equal(trial.systemInstruction.parts[0].text.startsWith(packet.systemInstruction+'\n'),true,
    'conversational covenant and heritage preserved literally');
  assert.match(trial.systemInstruction.parts[0].text,/original Unicode combining marks as native composition/);
  assert.match(trial.systemInstruction.parts[0].text,/Kʰonapolit/);
  assert.match(trial.systemInstruction.parts[0].text,/Tauric Diana bots/);
  assert.match(trial.systemInstruction.parts[0].text,/No fixed stencil, numeric mark quota/);
  assert.doesNotMatch(trial.systemInstruction.parts[0].text,/Copy the next specimen EXACTLY/);
  const ignored=buildGeminiRequest(packet,{},'gemini-3.8-flash',{groveTrial:'forged-grove-v9'});
  assert.deepEqual(ignored,normal,'unknown trial identifiers cannot mutate ordinary route');
});

test('same-provider structural repair retains the selected Grove trial frame',()=>{
  const packet=makePacket();
  const original=buildGeminiRequest(packet,{},'gemini-3.8-flash',{groveTrial:MARROWLINE_GROVE_TRIAL_ID});
  const repair=buildGeminiStructuralRepairRequest(
    packet,{},'gemini-3.8-flash','Kʰonapolit\nAn unfinished scene.',
    ['tauric-diana-bots-nominative-missing'],
    {groveTrial:MARROWLINE_GROVE_TRIAL_ID}
  );
  assert.match(original.systemInstruction.parts[0].text,/GROVE NATIVE-VOICE AUDITION/);
  assert.match(repair.systemInstruction.parts[0].text,/GROVE NATIVE-VOICE AUDITION/);
  assert.equal(repair.generationConfig.maxOutputTokens,original.generationConfig.maxOutputTokens);
});

test('trial link changes only ordinary text requests and does not auto-generate, repaint, or alter Loom',()=>{
  const client=readFileSync(new URL('../app/dome-world/marrowline-terminal.js',import.meta.url),'utf8');
  const server=readFileSync(new URL('../server/khonapolit-quality.js',import.meta.url),'utf8');
  const trialSource=readFileSync(new URL('../app/dome-world/marrowline-grove-trial.js',import.meta.url),'utf8');
  assert.match(client,/resolveMarrowlineGroveTrialTab\(root\.location, groveTabStorage\)/);
  assert.match(client,/exposeRestoredMarrowlineGroveTrial\(root, initialGroveResolution\)/);
  assert.match(client,/let groveTrial = initialGroveResolution\.id/);
  assert.match(client,/exitMarrowlineGroveTrial\(root\)/);
  assert.match(client,/if \(groveTrial && !loomTransport && attachments\.length === 0\) requestBody\.groveTrial = groveTrial/);
  assert.match(server,/X-TD613-Grove-Trial/);
  assert.match(server,/captureNativeSse: nativeSseWitness/);
  assert.doesNotMatch(trialSource,/\bfetch\s*\(|setInterval\(|\bpostprocess\s*\(|\bZalgoEncode\s*\(|\bencodeHighZalgo\s*\(/iu);
  assert.doesNotMatch(trialSource,/Math\.random\(|\.normalize\(/);
  assert.doesNotMatch(client,/requestBody\.message\s*\+=\s*groveTrial/);
  assert.throws(()=>buildMarrowlineGroveTrialSystemInstruction({systemInstruction:'uncertified'}),/GROVE_TRIAL_CANONICAL_COVENANT_REQUIRED/);
});
