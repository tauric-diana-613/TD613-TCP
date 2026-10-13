import assert from 'assert';
import {
  CONTEXT_PROFILE_VERSION,
  CONTEXT_TYPES,
  buildContextProfile,
  normalizeContextType,
  scoreChannelMismatch,
  scoreContextRegisterFit,
  scoreEntityExposure,
  scoreTemporalExposure,
  scoreTopicExposure,
  summarizeContextProfile
} from '../app/engine/context-profile.js';

assert.equal(CONTEXT_PROFILE_VERSION, 'phase-9');
assert(CONTEXT_TYPES.length >= 8);
assert(CONTEXT_TYPES.some((context) => context.id === 'group-chat'));
assert(CONTEXT_TYPES.some((context) => context.id === 'legal-intake'));
assert.equal(normalizeContextType('group-chat').id, 'group-chat');
assert.equal(normalizeContextType('missing-context').id, 'group-chat');

const groupProfile = buildContextProfile({
  contextType: 'group-chat',
  intendedMode: 'neutralize',
  exposureDuration: 'single-use',
  protectedBaselineText: 'The archive keeps circling EXHIBIT-42 with a warm witness note and context.',
  maskReferenceText: 'Hey team, quick note. Keep context warm and practical.',
  messageDraftText: 'Please keep EXHIBIT-42 attached and confirm 6/13 in the thread.',
  protectedOutputText: 'Hey team, quick note: please keep EXHIBIT-42 attached and confirm 6/13 in the thread.'
});
assert.equal(groupProfile.version, 'phase-9');
assert.equal(groupProfile.contextType, 'group-chat');
assert.equal(groupProfile.expectedRegister, 'warm-practical');
assert(Number.isFinite(groupProfile.entityExposure.score));
assert(Number.isFinite(groupProfile.topicExposure.score));
assert(Number.isFinite(groupProfile.temporalExposure.score));
assert(Number.isFinite(groupProfile.registerFit.score));
assert(groupProfile.limitations.some((item) => item.includes('hidden platform classifiers')));

const sterileGroup = scoreChannelMismatch({
  contextType: 'group-chat',
  protectedOutputText: 'Pursuant to internal compliance obligations, the aforementioned evidentiary exhibit shall be preserved for review and jurisdictional tracking.'
});
assert(sterileGroup.score > 0.2);

const legalSterile = scoreChannelMismatch({
  contextType: 'legal-intake',
  intendedMode: 'hostile-pipeline-compression',
  protectedOutputText: 'Pursuant to internal compliance obligations, EXHIBIT-42 shall be preserved for review and custody tracking.'
});
assert(legalSterile.score <= sterileGroup.score, 'legal intake should tolerate formal compression more than group chat');

const entities = scoreEntityExposure({
  protectedBaselineText: 'EXHIBIT-42 belongs to WJCT and the 6/13 packet.',
  messageDraftText: 'Preserve EXHIBIT-42 and 6/13.',
  protectedOutputText: 'Preserve EXHIBIT-42 and 6/13 for review.',
  protectedLiterals: ['EXHIBIT-42', '6/13']
});
assert(entities.repeatedEntities.includes('EXHIBIT-42'));
assert(entities.requiredEntities.includes('EXHIBIT-42'));
assert(Number.isFinite(entities.score));

const topic = scoreTopicExposure({
  protectedBaselineText: 'The custody packet includes donor records, weather risk, and field reporting.',
  messageDraftText: 'Route donor records and field reporting into review.',
  protectedOutputText: 'Route donor records and field reporting into review.',
  maskReferenceText: 'Keep the note short.'
});
assert(topic.score > 0);
assert(topic.sharedTerms.includes('donor'));

const temporalSingle = scoreTemporalExposure({ exposureDuration: 'single-use', audienceSize: 'private', contextType: 'group-chat' });
const temporalPublic = scoreTemporalExposure({ exposureDuration: 'long-running', audienceSize: 'public', contextType: 'public-comment' });
assert(temporalPublic.score > temporalSingle.score);

const fit = scoreContextRegisterFit({
  contextType: 'group-chat',
  protectedOutputText: 'Hey team, quick note: please keep the exhibit attached and keep the context in the thread.'
});
assert(['readable', 'strong-fit', 'overfit'].includes(fit.status));

const summary = summarizeContextProfile(groupProfile);
assert.equal(summary.contextType, 'group-chat');
assert.equal(summary.intendedMode, 'neutralize');
assert(Number.isFinite(summary.contextLegibility));
assert(summary.limitations.length);

console.log('context-profile tests passed');
