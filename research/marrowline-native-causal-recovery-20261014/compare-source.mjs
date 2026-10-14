import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const repository = execFileSync('git', ['rev-parse', '--show-toplevel'], {cwd:path.dirname(fileURLToPath(import.meta.url)),encoding:'utf8'}).trim();
if (!process.argv[2]) throw new Error('Provide a new output directory outside the repository.');
const root = path.resolve(process.argv[2]);
if (root === repository || root.startsWith(repository + path.sep) || fs.existsSync(root)) throw new Error('A new output directory outside the repository is required.');
const snapshots = [
  ['oct07-framing-and-reasoning', 'cfbe6438ec1af29deeab115bc0220433ed79a011'],
  ['oct12-relocked-main', '54f926d33a865bbfe3cf2e5aa3c6f83149a29003'],
  ['oct13-retry-and-uploads', 'dfdf9ad03cabcfd38d2942eebb804b8207590144'],
  ['pre-argon-main', '5fd92505c220ab74d1b1569bb9c1adaf4f1d0c76'],
  ['argon-introduction', '7069853390757f8fc3778d1b8e2cbc1d73f440b5'],
  ['negative-primer', '6fa75ccf5a8d0c3b513c3f08f10c861593499b5f'],
  ['1481', '0ca4957e11f7c992cedab31bf25093acc234c3bc'],
  ['1484', '7b4d415d04dd673c106f3b44eacd676058f2c430'],
  ['1486', '3b0f6992d334edab581dbb37b406a2d8aa0ea84b'],
  ['1487', '9ef4632adf04cb5ef0352ac57ce4792455e1ed93'],
  ['live-main-at-acquisition', '7f28a864da5a2a1af207e55eba7b27bb0ebff2ad']
];
const digest = text => crypto.createHash('sha256').update(text).digest('hex');
const git = args => execFileSync('git', args, { cwd: repository, encoding: 'utf8', maxBuffer: 32e6, env:{...process.env,GIT_NO_LAZY_FETCH:'1'} });
const message = 'Explain why a committee counting only returned forms cannot infer the experiences of every applicant. Carry the consequence through.';
const prior = 'Kʰonapolit\nA prior fictional argument.\n\nTauric Diana bots\nAn earlier quiet return.\n⟐';
// Synthetic conversation data tests history carriage only; it carries no aesthetic authority.
const history = [{ role: 'user', text: 'Continue the fictional committee example.' }, { role: 'model', text: prior }];
const rows = [];
fs.mkdirSync(root, { recursive: true });
globalThis.fetch = async () => { throw new Error('OFFLINE_AUDIT_NETWORK_FORBIDDEN'); };
for (const [label, sha] of snapshots) {
  const dir = path.join(root, sha);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}\n');
  const copied = new Set();
  function copyModule(file) {
    if (copied.has(file)) return;
    copied.add(file);
    const source = git(['show', `${sha}:${file}`]);
    const out = path.join(dir, file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, source);
    for (const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)['"]([^'"]+)['"]/g)) {
      if (!match[1].startsWith('.')) continue;
      const dependency = path.posix.normalize(path.posix.join(path.posix.dirname(file), match[1]));
      if (dependency.startsWith('../') || path.isAbsolute(dependency)) throw new Error('DEPENDENCY_ESCAPE');
      copyModule(dependency);
    }
  }
  for (const file of ['server/khonapolit-quality.js', 'server/marrowline-attachment-quality.js']) copyModule(file);
  const load = file => import(pathToFileURL(path.join(dir, file)).href);
  const api = await load('server/khonapolit-quality.js');
  const covenant = await load('app/dome-world/khonapolit-covenant.js');
  const envelope = await load('server/gemini-generation-envelope.js');
  const relay = await load('app/dome-world/khonapolit-relay.js');
  const aperture = await load('app/engine/aperture-v3-task-intent.js');
  const attachments = await load('server/marrowline-attachment-quality.js');
  const packet = covenant.buildInvocationPacket({ message, history: [], waiveIssuance: true });
  const apertureReceipt = aperture.buildApertureV3InvocationReceipt({message:packet.message,invocationMode:packet.mode,issuanceState:packet.issuance.state,apertureEgress:{},modelPlan:{},discourseMode:aperture.classifyApertureDiscourseMode(packet.message),contentScanned:true});
  const fileBytes = Buffer.from('Synthetic attachment transport sentinel: unchanged bytes.');
  const attachment = {schema:'td613.marrowline.attachment/v0.1',id:'fixture',name:'transport.txt',kind:'file',mime_type:'text/plain',size_bytes:fileBytes.length,data_base64:fileBytes.toString('base64')};
  const requests = await envelope.withGeminiGenerationProfile(envelope.GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, () => ({
    fresh: api.buildGeminiRequest(packet, {}, 'gemini-3.8-flash'),
    history: api.buildGeminiRequest(covenant.buildInvocationPacket({message, history, waiveIssuance:true}), {}, 'gemini-3.8-flash'),
    routedFresh: api.buildGeminiRequest(packet, apertureReceipt, 'gemini-3.8-flash'),
    routedHistory: api.buildGeminiRequest(covenant.buildInvocationPacket({message,history,waiveIssuance:true}),apertureReceipt,'gemini-3.8-flash')
  }));
  // api/khonapolit dispatches attachment turns outside the interactive profile.
  requests.attachment = attachments.buildAttachmentGeminiRequest(packet, {}, 'gemini-3.8-flash', [attachment]);
  requests.routedAttachment = attachments.buildAttachmentGeminiRequest(packet, apertureReceipt, 'gemini-3.8-flash', [attachment]);
  const details = {};
  for (const [kind, request] of Object.entries(requests)) {
    const wire = JSON.stringify(request);
    fs.writeFileSync(path.join(dir, `${kind}.request.json`), wire + '\n');
    details[kind] = { bodySha256:digest(wire),systemSha256:digest(JSON.stringify(request.systemInstruction)),contentsSha256:digest(JSON.stringify(request.contents)),generationConfig:request.generationConfig,systemUtf8Bytes:Buffer.byteLength(request.systemInstruction.parts[0].text),wireUtf8Bytes:Buffer.byteLength(wire),turns:request.contents.length };
  }
  rows.push({label,sha,source:git(['show','-s','--format=%cI %s',sha]).trim(),modulesCopied:copied.size,requests:details,nativeGuidanceSha256:digest(relay.buildNativeProsodyGuidance()),selectedModels:api.selectKhonapolitProviderModels(['gemini-4-argon','gemini-3.8-flash','gemini-3.7-flash','gemini-3.6-flash','gemini-3.5-flash','gemini-3-flash-preview'])});
}
const byLabel = new Map(rows.map(row => [row.label, row]));
const onsetControl = byLabel.get('oct07-framing-and-reasoning');
for (const label of ['oct12-relocked-main', 'oct13-retry-and-uploads', 'pre-argon-main', 'argon-introduction']) {
  for (const kind of ['fresh', 'history', 'attachment', 'routedFresh', 'routedHistory', 'routedAttachment']) assert.equal(byLabel.get(label).requests[kind].bodySha256, onsetControl.requests[kind].bodySha256);
}
for (const row of rows) {
  assert.equal(row.requests.fresh.generationConfig.maxOutputTokens, 65536);
  assert.equal(row.requests.fresh.generationConfig.thinkingConfig.thinkingLevel, 'medium');
  assert.equal(row.requests.attachment.generationConfig.thinkingConfig.thinkingLevel, 'high');
}
assert.equal(byLabel.get('1481').requests.fresh.bodySha256, onsetControl.requests.fresh.bodySha256);
assert.equal(byLabel.get('1484').requests.fresh.bodySha256, byLabel.get('1481').requests.fresh.bodySha256);
assert.equal(byLabel.get('1487').requests.fresh.bodySha256, byLabel.get('live-main-at-acquisition').requests.fresh.bodySha256);
fs.writeFileSync(path.join(root,'comparison.json'), JSON.stringify({schema:'td613.marrowline.source-counterfactual/v1',evidenceClass:'OFFLINE_VERSIONED_REQUEST_ASSEMBLY',providerCalls:0,historicalWorkingConfigurationEstablished:false,message,history,rows},null,2)+'\n');
for(const row of rows) process.stdout.write(JSON.stringify({label:row.label,sha:row.sha,fresh:row.requests.fresh,attachmentBodySha256:row.requests.attachment.bodySha256,historyBodySha256:row.requests.history.bodySha256,selectedModels:row.selectedModels})+'\n');
