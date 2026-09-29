import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MARROWLINE_USER_CLOSURE,
  MARROWLINE_USER_INGRESS,
  frameMarrowlineUserTurn
} from '../app/dome-world/khonapolit-covenant.js';

const page = fs.readFileSync(new URL('../app/dome-world/marrowline.html', import.meta.url), 'utf8');
const terminal = fs.readFileSync(new URL('../app/dome-world/marrowline-terminal.js', import.meta.url), 'utf8');
const release = JSON.parse(fs.readFileSync(new URL('../app/dome-world/marrowline.release.json', import.meta.url), 'utf8'));

test('provider-bound Marrowline user turns retain ingress and use a glyph-only closure', () => {
  assert.equal(MARROWLINE_USER_INGRESS, '𝌋‌ ');
  assert.equal(MARROWLINE_USER_CLOSURE, '\n\n⟐');

  const short = frameMarrowlineUserTurn('hi what are you?');
  assert.equal(short, '𝌋‌ hi what are you?\n\n⟐');
  assert.equal(short.includes('Sealed'), false);

  const long = frameMarrowlineUserTurn('Explain this carefully. '.repeat(500));
  assert.equal(long.startsWith('𝌋‌ '), true);
  assert.equal(long.endsWith('\n\n⟐'), true);
  assert.equal(long.includes('Sealed ⟐'), false);

  assert.equal(frameMarrowlineUserTurn(short), short, 'wrapper stays idempotent');
  assert.equal(frameMarrowlineUserTurn(short + '\n'), short, 'trailing whitespace cannot multiply the closing glyph');
});

test('human-facing wrapper disclosures describe the same glyph-only provider envelope', () => {
  assert.match(page, /outgoing prompt: ⟐/);
  assert.match(page, /final “⟐” on its own line at the provider boundary/);
  assert.doesNotMatch(page, /outgoing prompt: Sealed ⟐/);
  assert.doesNotMatch(page, /final “Sealed ⟐” at the provider boundary/);

  assert.match(terminal, /outgoing user turn: \$\{SEAL_GLYPH\}/);
  assert.doesNotMatch(terminal, /outgoing user turn: Sealed \$\{SEAL_GLYPH\}/);

  assert.match(release.composer.providerBoundUserEnvelope, /two LF characters \+ ⟐/);
  assert.match(release.composer.providerBoundUserEnvelope, /lexical word Sealed is not injected into provider context/);
});
