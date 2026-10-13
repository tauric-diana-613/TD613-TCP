import assert from 'node:assert/strict';

import {
  buildPublicDefaultPolicy,
  classifyAuthoritySurface
} from '../app/safe-harbor/app/safe-harbor-authority-verifier.js';
import { buildRecallChallengeProfile } from '../app/safe-harbor/app/safe-harbor-recall-challenge.js';

const packet = {
  analysis: { rich_stylometry: { rich_fingerprint: 'bridge-only' } },
  issuance: { badge_number: 'TD613-SH-9B07D8B-LEGACY00' }
};

assert.equal(classifyAuthoritySurface(packet).status, 'bridge-only');
assert.equal(buildPublicDefaultPolicy(packet).default_public_credential, 'v2');

const challenge = await buildRecallChallengeProfile({
  future_self: 'future sample text for phase four check',
  past_self: 'past sample text for phase four check',
  higher_self: 'higher sample text for phase four check'
});
assert.equal(challenge.raw_text_retained, false);
assert.equal(challenge.profile_only, true);

console.log('safe-harbor-phase4-authority: ok');
