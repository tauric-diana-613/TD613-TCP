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
