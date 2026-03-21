import assert from 'assert';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import {
  buildCadenceTransfer,
  extractCadenceProfile
} from '../app/engine/stylometry.js';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const browserEngineUrl = `${pathToFileURL(path.join(repoRoot, 'app', 'browser-engine.js')).href}?t=${Date.now()}`;

globalThis.window = {};
await import(browserEngineUrl);

const browserBuildCadenceTransfer = globalThis.window.TCP_ENGINE?.buildCadenceTransfer;
assert.equal(typeof browserBuildCadenceTransfer, 'function', 'Browser engine exposes buildCadenceTransfer');

const referenceVoice = `Honestly, I wasn't trying to make a speech. I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed. By the time I finished, I had used three qualifiers, two apologies, and the same phrase twice, which is apparently what I do when I'm buying time to say the hard part out loud.`;
const probeVoice = `Hey, if you're still out, grab the charger and use the side door. It sticks, so lean on it. If nobody hears you right away, wait a second and knock again. I'm in back unloading boxes, and I probably won't catch the first try.`;

const cases = [
  {
    id: 'reference_under_probe',
    text: referenceVoice,
    shell: {
      mode: 'borrowed',
      profile: extractCadenceProfile(probeVoice),
      strength: 0.9
    }
  },
  {
    id: 'probe_under_reference',
    text: probeVoice,
    shell: {
      mode: 'borrowed',
      profile: extractCadenceProfile(referenceVoice),
      strength: 0.9
    }
  },
  {
    id: 'operational_under_reflective',
    text: 'Door sticks. Knock twice. I am in back.',
    shell: {
      mode: 'borrowed',
      profile: extractCadenceProfile(`Honestly, I kept circling the point because every time I tried to leave, I found one more reason to stay, and then I stalled again because the room went quiet.`),
      strength: 0.88
    }
  },
  {
    id: 'protected_literal',
    text: 'Meet at 9:30, bring ID ZX-17.',
    shell: {
      mode: 'borrowed',
      profile: extractCadenceProfile(referenceVoice),
      strength: 0.9
    }
  }
];

for (const testCase of cases) {
  const nodeResult = buildCadenceTransfer(testCase.text, testCase.shell);
  const browserResult = browserBuildCadenceTransfer(testCase.text, testCase.shell);

  assert.equal(browserResult.text, nodeResult.text, `${testCase.id}: browser text matches Node`);
  assert.equal(browserResult.transferClass, nodeResult.transferClass, `${testCase.id}: transferClass matches`);
  assert.equal(browserResult.realizationTier, nodeResult.realizationTier, `${testCase.id}: realizationTier matches`);
  assert.deepEqual(browserResult.changedDimensions, nodeResult.changedDimensions, `${testCase.id}: changedDimensions match`);
  assert.deepEqual(
    (browserResult.lexemeSwaps || []).map((swap) => `${swap.family}:${swap.from}->${swap.to}`),
    (nodeResult.lexemeSwaps || []).map((swap) => `${swap.family}:${swap.from}->${swap.to}`),
    `${testCase.id}: lexemeSwaps match`
  );
}

console.log('browser-parity.test.mjs passed');
