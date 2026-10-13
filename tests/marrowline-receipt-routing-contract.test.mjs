import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
const terminal = fs.readFileSync('app/dome-world/marrowline-terminal.js', 'utf8');

test('Receipt panel exposes sanitized live Gemini routing diagnostics only inside Receipt', () => {
  for (const id of ['receiptFrontierTrace', 'metricModelAvailability', 'metricModelAttempts', 'metricModelCooling', 'geminiLedgerTotal', 'geminiLedgerRoutes']) {
    assert.match(page, new RegExp(`id="${id}"`));
  }
  assert.match(page, /Gemini availability/);
  assert.match(page, /Attempted this turn/);
  assert.match(page, /Cooling/);
  assert.match(terminal, /receipt\?\.modelPolicy\?\.callableModels/);
  assert.match(terminal, /receipt\?\.provider\?\.attempts/);
  assert.match(terminal, /row\?\.state\?\.state === 'cooling_down'/);
  assert.match(terminal, /join\(' → '\)/);
  assert.match(terminal, /join\(' · '\)/);
  assert.match(terminal, /FRONTIER · \$\{trace \|\| '—'\}/);
  assert.match(terminal, /summarizeGeminiBrowserLedger/);
  assert.match(page, /Coverage: this browser’s interactive receipts only/);
  assert.match(page, /provider-side daily total remains externally authoritative/);
  assert.doesNotMatch(terminal, /TASK PRESERVED\$\{routeNote\}/);
  assert.doesNotMatch(page, /Excluded:/);
});

test('Receipt model labels are compact human diagnostics, not provider secrets', () => {
  assert.match(terminal, /id === 'gemini-3-flash-preview'\) return '3 Flash Preview'/);
  assert.match(terminal, /\^gemini-\(3/);
  assert.doesNotMatch(terminal, /GEMINI_API_KEY/);
});


test('Receipt opens with human controls, bounded JSON, and an explained advanced capture', () => {
  const css=fs.readFileSync('app/dome-world/marrowline-desktop-repair.css','utf8');
  for(const id of ['copyKhonapolitReceipt','sealLastResponse','armMarrowlineEpisodeWitness','copyMarrowlineEpisodeWitness']){
    assert.equal((page.match(new RegExp(`id="${id}"`,'g'))||[]).length,1);
    assert.ok(page.indexOf(`id="${id}"`)<page.indexOf('id="khonapolitReceipt"'),`${id} above JSON`);
  }
  assert.match(page,/Advanced · one-turn record/);
  assert.match(page,/One turn only: no screenshot, hidden provider ingress/i);
  assert.match(page,/id="copyMarrowlineEpisodeWitness"[^>]*disabled/);
  assert.match(page,/Seal marks the latest unsealed reply closed/);
  assert.match(css,/#receiptPanel #khonapolitReceipt\{max-height:min\(55dvh,600px\)!important/);
  assert.match(terminal,/receiptActionStatus/);
});
