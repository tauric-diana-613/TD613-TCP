import assert from 'assert';
import {
  applyCadenceToText,
  applyCadenceShell,
  buildSemanticAuditBundle,
  buildCadenceTransfer,
  buildCadenceSignature,
  charTrigramProfile,
  compareTexts,
  extractCadenceProfile,
  functionWordProfile,
  recurrencePressure,
  segmentTextToIR,
  transformText
} from '../app/engine/stylometry.js';

const stripSurface = (text) => text
  .toLowerCase()
  .replace(/[^a-z0-9'\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const a = 'I keep a hush in my pocket, and the room remembers.';
const b = 'I keep a hush in my pocket, and the room remembers.';
const c = 'Brisk systems route plain text without pause.';
const same = compareTexts(a, b);
const diff = compareTexts(a, c);
const nativeTransfer = buildCadenceTransfer(a, { mode: 'native' });
const styleNearA = "I said I'd call when I got off the train, but the signal dropped and I had to walk the last few blocks. I'm here now, though, and the stairwell light is still flickering.";
const styleNearB = "I told you I'd ring when I left the bus, but the service cut out and I had to walk the last six blocks. I'm here now, though, and the hall light is still flickering.";
const styleFar = 'Arrival delayed. Signal dropped. Walked final blocks. Hall light flickers.';
const near = compareTexts(styleNearA, styleNearB);
const far = compareTexts(styleNearA, styleFar);

assert.equal(same.similarity, 1);
assert.equal(same.traceability, 1);
assert(same.similarity > diff.similarity);
assert(same.traceability >= diff.traceability);
assert(recurrencePressure(`line one\nline two\nline two`) > 0);
assert(typeof same.spreadDistance === 'number');
assert(typeof same.punctShapeDistance === 'number');
assert(typeof same.functionWordDistance === 'number');
assert(typeof same.wordLengthDistance === 'number');
assert(typeof same.charGramDistance === 'number');
assert(Object.keys(functionWordProfile('This is the sample and it is not alone.')).length > 0);
assert(Object.keys(charTrigramProfile('Signal route signal route')).length > 0);
assert(near.traceability > far.traceability);
assert(near.functionWordDistance < far.functionWordDistance);
assert(near.charGramDistance < far.charGramDistance);
assert.equal(nativeTransfer.transferClass, 'native');

const transformed = transformText('I do not know and I cannot stay.', { sent: 0, cont: 1, punc: 0 });
const wrappedTransfer = buildCadenceTransfer(
  'I do not know and I cannot stay.',
  { mode: 'synthetic', mod: { sent: 0, cont: 1, punc: 0 }, strength: 0.76 }
);
assert(transformed.includes("don't") || transformed.includes("can't"));

const contractedSemanticSource = "I'm not opening the west door because I don't have the badge and it isn't ready.";
const expandedSemanticOutput = 'I am not opening the west door because I do not have the badge and it is not ready.';
const contractedSourceIR = segmentTextToIR(contractedSemanticSource, { literals: [] });
const contractedSemanticAudit = buildSemanticAuditBundle(contractedSourceIR, expandedSemanticOutput, { literals: [] });
assert(contractedSemanticAudit.semanticAudit.propositionCoverage >= 0.9);
assert(contractedSemanticAudit.semanticAudit.actorCoverage >= 0.9);
assert(contractedSemanticAudit.semanticAudit.actionCoverage >= 0.9);
assert(contractedSemanticAudit.semanticAudit.objectCoverage >= 0.9);

const baseProfile = extractCadenceProfile(
  "Honestly, I kept circling the point because I wasn't ready to say the hard part."
);
const borrowedProfile = extractCadenceProfile(
  "Need the charger. Front door sticks. Knock twice if the light is out. I'm in back."
);
const swapped = applyCadenceShell(baseProfile, {
  mode: 'borrowed',
  profile: borrowedProfile,
  strength: 0.82
});
const transformedCadenceText = applyCadenceToText(
  'I do not know and I cannot stay.',
  { mode: 'borrowed', mod: { sent: -1, cont: 1, punc: 1 } }
);
const wrappedCadenceTransfer = buildCadenceTransfer(
  'I do not know and I cannot stay.',
  { mode: 'borrowed', mod: { sent: -1, cont: 1, punc: 1 } }
);
const shellShiftSource = "I kept circling the point because I wasn't ready to say the hard part, and then I stalled again because the room went quiet.";
const shellShiftedText = applyCadenceToText(
  shellShiftSource,
  {
    mode: 'borrowed',
    profile: borrowedProfile,
    strength: 0.82
  }
);
const shellShiftedProfile = extractCadenceProfile(shellShiftedText);
const shellSourceProfile = extractCadenceProfile(shellShiftSource);
const shellTransfer = buildCadenceTransfer(
  shellShiftSource,
  {
    mode: 'borrowed',
    profile: borrowedProfile,
    strength: 0.82
  }
);
const shellShiftCompare = compareTexts(shellShiftSource, shellShiftedText, {
  profileA: shellSourceProfile,
  profileB: shellShiftedProfile
});
const shellShiftDeltaCount = [
  Math.abs(shellShiftedProfile.avgSentenceLength - shellSourceProfile.avgSentenceLength) >= 1,
  Math.abs(shellShiftedProfile.sentenceCount - shellSourceProfile.sentenceCount) >= 1,
  Math.abs(shellShiftedProfile.contractionDensity - shellSourceProfile.contractionDensity) >= 0.012,
  Math.abs(shellShiftedProfile.lineBreakDensity - shellSourceProfile.lineBreakDensity) >= 0.04,
  shellShiftCompare.functionWordDistance >= 0.04
].filter(Boolean).length;
const connectiveSource = 'I do not know and I will wait because that door is stuck, but I am still outside.';
const connectiveShifted = applyCadenceToText(
  connectiveSource,
  {
    mode: 'borrowed',
    profile: borrowedProfile,
    strength: 0.82
  }
);
const connectorTarget = extractCadenceProfile(
  'Since the room stayed loud, I kept the note. Though the line dragged, I stayed. Then I left that mark behind.'
);
const connectorSource = 'Because the room stayed loud, I kept the note, but the line dragged, so I left this mark behind.';
const connectorTransfer = buildCadenceTransfer(
  connectorSource,
  {
    mode: 'borrowed',
    profile: connectorTarget,
    strength: 0.88
  },
  { retrieval: true }
);
const connectorShifted = connectorTransfer.text;
const connectorSourceProfile = extractCadenceProfile(connectorSource);
const connectorShiftedProfile = extractCadenceProfile(connectorShifted);
const connectorSourceToTarget = compareTexts(connectorSource, 'Since the room stayed loud, I kept the note. Though the line dragged, I stayed. Then I left that mark behind.', {
  profileA: connectorSourceProfile,
  profileB: connectorTarget
}).functionWordDistance;
const connectorShiftedToTarget = compareTexts(connectorShifted, 'Since the room stayed loud, I kept the note. Though the line dragged, I stayed. Then I left that mark behind.', {
  profileA: connectorShiftedProfile,
  profileB: connectorTarget
}).functionWordDistance;
const connectorShiftedLower = connectorShifted.toLowerCase();
const noNumberLeakTarget = extractCadenceProfile(
  "Need you to grab the charger on your way in. Front door sticks, so pull hard. If the downstairs light is off, knock twice. I'm in back."
);
const noNumberLeakSource = "Honestly, I was not trying to make a speech because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed. By the time I finished, which is apparently what I do, I was still buying time.";
const noNumberLeakShifted = applyCadenceToText(
  noNumberLeakSource,
  {
    mode: 'borrowed',
    profile: noNumberLeakTarget,
    strength: 0.9
  }
);
const noNumberLeakProfile = extractCadenceProfile(noNumberLeakShifted);
const noNumberLeakSourceProfile = extractCadenceProfile(noNumberLeakSource);
const literalSource = 'Meet me at 9:30, bring ID ZX-17, and keep "not for archive" exactly as written. Email hold@field.lab if the side-door note changes.';
const literalTransfer = buildCadenceTransfer(
  literalSource,
  {
    mode: 'borrowed',
    profile: borrowedProfile,
    strength: 0.9
  }
);
const mergeSource = 'Door sticks. Knock twice. I am in back.';
const mergeDonor = extractCadenceProfile(
  'Honestly, I kept circling the point because every time I tried to leave, I found one more reason to stay, and then I stalled again because the room went quiet.'
);
const mergeTransfer = buildCadenceTransfer(
  mergeSource,
  {
    mode: 'borrowed',
    profile: mergeDonor,
    strength: 0.88
  }
);
const mergeSourceProfile = extractCadenceProfile(mergeSource);
const mergeProfile = extractCadenceProfile(mergeTransfer.text);
const reverseContrastSource = 'Need the charger. Front door sticks. Knock twice if the light is out. I am in back.';
const reverseContrastDonor = extractCadenceProfile(
  'Honestly, I kept circling the point because every time I tried to leave, I found one more reason to stay, and then I stalled again because the room went quiet.'
);
const reverseContrastTransfer = buildCadenceTransfer(
  reverseContrastSource,
  {
    mode: 'borrowed',
    profile: reverseContrastDonor,
    strength: 0.9
  }
);
const reverseContrastSourceProfile = extractCadenceProfile(reverseContrastSource);
const reverseContrastProfile = extractCadenceProfile(reverseContrastTransfer.text);
const additiveGuardSource = 'Because the room stayed loud, I kept the note. But the line dragged. So I left this mark behind.';
const additiveGuardTransfer = buildCadenceTransfer(
  additiveGuardSource,
  {
    mode: 'borrowed',
    profile: reverseContrastDonor,
    strength: 0.9
  }
);
const additiveGlueCount = (additiveGuardTransfer.text.match(/(?:,\s+and\b|;\s+and\b|-\s+and\b)/gi) || []).length;
const additiveGuardLower = additiveGuardTransfer.text.toLowerCase();
const lowOpportunitySource = 'Stone settles under glass.';
const lowOpportunityTransfer = buildCadenceTransfer(
  lowOpportunitySource,
  {
    mode: 'borrowed',
    profile: borrowedProfile,
    strength: 0.9
  }
);
const truthGuardFormal = `I want to revise one phrase from my earlier recap before it starts hardening into the story. I wrote that the committee was considering a "service adjustment," which is technically true in the narrow memo sense and misleading in the lived one. What the table actually showed is that if the hiring freeze runs through Q3, the coordinator line stays empty for twelve more weeks and the intake queue either gets redistributed badly or evening hours shrink. Those are not abstract efficiencies. They are service consequences. Yes, we still have the same three provisional paths: temporary use of the analyst line, reduced evening coverage, or a reserve draw if finance confirms the rule and the dean signs off. But I do not want the language to get gentler than the problem just because we are waiting for the Thursday table.`;
const truthGuardRushed = `if youre late thats ok just dont start random jobs. check in west fence table first. glass + pallets first pass. saws stay under canopy b, kids stay off solvent side, paint only if wind chills out. 10:15 inventory stop still stands. pls bring water for real, not saying it to be annoying`;
const truthGuardFormalTransfer = buildCadenceTransfer(
  truthGuardFormal,
  {
    mode: 'borrowed',
    profile: extractCadenceProfile(truthGuardRushed),
    strength: 0.82,
    source: 'swapped'
  },
  { retrieval: true }
);
const truthGuardRushedTransfer = buildCadenceTransfer(
  truthGuardRushed,
  {
    mode: 'borrowed',
    profile: extractCadenceProfile(truthGuardFormal),
    strength: 0.82,
    source: 'swapped'
  },
  { retrieval: true }
);
const compressedSurfaceSource = 'If you are late, that is okay. Please do not start independent work before you check in at the west fence table first. Glass and pallets need a first pass. Saws stay under canopy B, and paint only if the wind settles. Please bring water.';
const compressedSurfaceTransfer = buildCadenceTransfer(
  compressedSurfaceSource,
  {
    mode: 'borrowed',
    profile: extractCadenceProfile(truthGuardRushed),
    strength: 0.82,
    source: 'swapped'
  },
  { retrieval: true }
);
const truthGuardFormalProfile = extractCadenceProfile(truthGuardFormal);
const truthGuardRushedProfile = extractCadenceProfile(truthGuardRushed);
const performanceReviewFormal = `Ahead of the formal review, I want to name the pattern as clearly as I can. You are consistently strong in onboarding and peer support. New staff trust your explanations, and multiple people pointed to your calm escalation style when procedures changed quickly this year. The harder part is documentation timing. We had reporting slips in three different months, and in each case the direct service was done but the written record lagged until the details were harder to rebuild. I am not treating that as a paperwork footnote. It affects handoff quality and makes later review more difficult than it needs to be. My goal for the review is to protect the mentoring strengths while making the documentation correction concrete rather than vague.`;
const performanceReviewRushed = `review gist: great w onboarding / ppl trust them / calm under change. real issue is docs lag. 3 diff months same thing - service got done, writeup came late, handoff got muddy. dont write it like "minor admin gap." not punitive either. needs concrete correction plan`;
const performanceReviewFormalTransfer = buildCadenceTransfer(
  performanceReviewFormal,
  {
    mode: 'borrowed',
    profile: extractCadenceProfile(performanceReviewRushed),
    strength: 0.82,
    source: 'swapped'
  },
  { retrieval: true }
);
const performanceReviewRushedTransfer = buildCadenceTransfer(
  performanceReviewRushed,
  {
    mode: 'borrowed',
    profile: extractCadenceProfile(performanceReviewFormal),
    strength: 0.82,
    source: 'swapped'
  },
  { retrieval: true }
);
const buildingAccessFormal = `Facilities team, quick flag from West Annex: Door 3 is reading badges but not actually unlatching. First bad read we can pin down is 08:19, and it is now holding up the courier run for Suite 118 because the cold bag cannot sit outside any longer. It does not look like a dead reader. The panel is green, the click sounds normal, and the door still holds. Early guess is that the overnight renewal push touched the validator, because staff whose badges renewed this morning are failing while one older temporary badge still clears. We have rerouted intake to south receiving for now, but please do not close this as a power issue unless someone physically checks the latch and the controller cache. If you need a witness on site, I am by the loading corridor.`;
const buildingAccessRushed = `west annex d3 still fake open. reader goes green + buzzes but door wont release. first hit was like 8:19 maybe 8:20. courier for suite 118 is here w fridge meds and he cant just wait in sun. weird part: my renewed badge fails, old temp badge worked once. not power i dont think. can someone pls check controller before they keep telling me to jiggle latch again`;
const buildingAccessFormalTransfer = buildCadenceTransfer(
  buildingAccessFormal,
  {
    mode: 'borrowed',
    profile: extractCadenceProfile(buildingAccessRushed),
    strength: 0.82,
    source: 'swapped'
  },
  { retrieval: true }
);
const buildingAccessRushedTransfer = buildCadenceTransfer(
  buildingAccessRushed,
  {
    mode: 'borrowed',
    profile: extractCadenceProfile(buildingAccessFormal),
    strength: 0.82,
    source: 'swapped'
  },
  { retrieval: true }
);
const reflectiveArtifactSource = `I am pretty content in life. Don't worry about where you came from. Keep doing what you're doing.

Don't stop doing martial arts. I needed that. I got into a lot of trouble without martial arts. And I blame mom for taking that away from me.

I want to say hi to him. Call him. Meet him I guess is what I'm trying to say. That's someone you should get more familiar with.`;
const reflectiveArtifactTransfer = buildCadenceTransfer(
  reflectiveArtifactSource,
  {
    mode: 'borrowed',
    personaId: 'spark',
    profile: borrowedProfile,
    strength: 0.88
  },
  { retrieval: true }
);
const narrativeArtifactSource = `I must keep reminding myself that this will work. Nobody I've ever shared the same room with has ever seen Cheers! Things are moving too fast to dissuade myself of this. On the ready, I pull out the next pack of Crushes, turn them over and spank its bottom like a bad boy. Twirl of the plastic, and bite of the tip, with an excited thumb that sparks but keeps missing the gas pedal. Two gulps: from the nerves, and, to placate them, from the coffee. The wall breaks with a shuddering, misanthropic swing. It's the middle of the night, and suddenly, I'm not alone.`;
const narrativeArtifactTransfer = buildCadenceTransfer(
  narrativeArtifactSource,
  {
    mode: 'borrowed',
    personaId: 'undertow',
    profile: mergeDonor,
    strength: 0.88
  },
  { retrieval: true }
);

assert.notEqual(swapped.avgSentenceLength, baseProfile.avgSentenceLength);
assert.notEqual(swapped.contractionDensity, baseProfile.contractionDensity);
assert.notEqual(swapped.recurrencePressure, baseProfile.recurrencePressure);
assert(typeof swapped.functionWordProfile === 'object');
assert(typeof swapped.wordLengthProfile === 'object');
assert(typeof swapped.charTrigramProfile === 'object');
assert(transformedCadenceText.includes("don't") || transformedCadenceText.includes("can't"));
assert.equal(transformed, wrappedTransfer.text);
assert.equal(transformedCadenceText, wrappedCadenceTransfer.text);
assert.notEqual(transformedCadenceText, 'I do not know and I cannot stay.');
assert.notEqual(shellShiftedText, shellShiftSource);
assert.equal(shellTransfer.text, shellShiftedText);
assert(shellTransfer.qualityGatePassed);
assert.equal(shellTransfer.transferClass, 'structural');
assert.ok(
  ['structural', 'lexical-structural'].includes(shellTransfer.realizationTier)
);
assert(typeof shellTransfer.opportunityProfile === 'object');
assert(typeof shellTransfer.lexicalShiftProfile === 'object');
assert(Array.isArray(shellTransfer.lexemeSwaps));
assert(Array.isArray(shellTransfer.realizationNotes));
assert(typeof shellTransfer.semanticRisk === 'number');
assert(typeof shellTransfer.apertureProtocol === 'object');
assert.equal(shellTransfer.apertureProtocol.toolIdentity, 'TD613 Aperture');
assert(shellTransfer.protectedLiteralCount === 0);
assert(shellTransfer.changedDimensions.filter((dimension) => dimension !== 'punctuation-shape').length >= 2);
assert(shellTransfer.passesApplied.length >= 2);
assert.notEqual(stripSurface(connectiveShifted), stripSurface(connectiveSource));
assert(shellShiftDeltaCount >= 2);
assert(
  connectorTransfer.transferClass === 'held' ||
  connectorTransfer.transferClass === 'rejected' ||
  stripSurface(connectorShifted) !== stripSurface(connectorSource)
);
assert(
  connectorTransfer.transferClass === 'held' ||
  connectorTransfer.transferClass === 'rejected' ||
  connectorShiftedLower.includes('since') ||
  connectorShiftedLower.includes('though') ||
  connectorShiftedLower.includes('then') ||
  connectorShiftedLower.includes('that')
);
assert(
  connectorTransfer.transferClass === 'held' ||
  connectorShiftedToTarget < connectorSourceToTarget
);
assert(!/\b\d+\b/.test(noNumberLeakShifted));
assert(
  noNumberLeakShifted.toLowerCase().includes('when') ||
  noNumberLeakShifted.includes("that's")
);
assert(noNumberLeakProfile.sentenceCount > noNumberLeakSourceProfile.sentenceCount);
assert(shellShiftedProfile.avgSentenceLength < shellSourceProfile.avgSentenceLength);
assert(shellShiftedProfile.sentenceCount >= shellSourceProfile.sentenceCount);
assert(
  Math.abs(shellShiftedProfile.avgSentenceLength - borrowedProfile.avgSentenceLength) <
  Math.abs(shellSourceProfile.avgSentenceLength - borrowedProfile.avgSentenceLength)
);
assert(literalTransfer.text.includes('9:30'));
assert(literalTransfer.text.includes('ZX-17'));
assert(literalTransfer.text.includes('"not for archive"'));
assert(literalTransfer.text.includes('hold@field.lab'));
assert(literalTransfer.protectedLiteralCount >= 4);
assert(
  mergeTransfer.transferClass === 'structural' ||
  mergeTransfer.changedDimensions.includes('sentence-count') ||
  mergeTransfer.changedDimensions.includes('sentence-mean')
);
assert(mergeProfile.sentenceCount <= mergeSourceProfile.sentenceCount);
assert(
  reverseContrastTransfer.transferClass === 'held' ||
  reverseContrastTransfer.transferClass === 'structural' ||
  reverseContrastTransfer.changedDimensions.includes('sentence-count') ||
  reverseContrastTransfer.changedDimensions.includes('sentence-mean')
);
assert(
  reverseContrastTransfer.transferClass === 'held' ||
  reverseContrastProfile.avgSentenceLength > reverseContrastSourceProfile.avgSentenceLength ||
  reverseContrastProfile.sentenceCount < reverseContrastSourceProfile.sentenceCount
);
assert(
  reverseContrastTransfer.transferClass !== 'held' ||
  reverseContrastTransfer.generationDocket?.status === 'held'
);
assert(additiveGlueCount <= 1);
assert(
  additiveGuardTransfer.transferClass === 'held' ||
  additiveGuardTransfer.transferClass === 'rejected' ||
  additiveGuardLower.includes('as') ||
  additiveGuardLower.includes('because') ||
  additiveGuardLower.includes('since') ||
  additiveGuardLower.includes('though') ||
  additiveGuardLower.includes('yet') ||
  additiveGuardLower.includes('but') ||
  additiveGuardLower.includes('so') ||
  additiveGuardLower.includes('then')
);
assert(
  additiveGuardTransfer.transferClass !== 'held' ||
  additiveGuardTransfer.generationDocket?.status === 'held'
);
assert(lowOpportunityTransfer.opportunityProfile.sentenceSplit === 0);
assert(lowOpportunityTransfer.opportunityProfile.sentenceMerge === 0);
assert(['weak', 'rejected', 'held'].includes(lowOpportunityTransfer.transferClass));
assert(
  lowOpportunityTransfer.transferClass !== 'held' ||
  lowOpportunityTransfer.generationDocket?.status === 'held'
);
assert.notEqual(lowOpportunityTransfer.transferClass, 'structural');
assert.ok(
  ['clause-pivot', 'persona-lexicon', 'pressure-current'].every((family) =>
    (reflectiveArtifactTransfer.retrievalTrace?.planSummary?.testedFamilyIds || []).includes(family)
  ),
  'reflective artifact probe reports the new V2 author families in the tested family set'
);
assert.equal(reflectiveArtifactTransfer.transferClass, 'structural');
assert.equal(narrativeArtifactTransfer.transferClass, 'structural');
assert.ok(
  !/(?:^|[.!?]\s+)[a-z]/.test(reflectiveArtifactTransfer.text) &&
  !/\b(?:and and|while while|while and|and while|but but|because because|since since|then then|yet yet)\b/i.test(reflectiveArtifactTransfer.text) &&
  !/;\s+[A-Z]/.test(reflectiveArtifactTransfer.text) &&
  !/\b(?:I|It|That|You|We|They|Don|Can|Won)\s*;\s*[A-Za-z]+\b/.test(reflectiveArtifactTransfer.text),
  'reflective artifact probe stays clear of lowercase leads, doubled connectors, semicolon fracture, and malformed contractions'
);
assert.ok(
  !/(?:^|[.!?]\s+)[a-z]/.test(narrativeArtifactTransfer.text) &&
  !/\b(?:and and|while while|while and|and while|but but|because because|since since|then then|yet yet)\b/i.test(narrativeArtifactTransfer.text) &&
  !/;\s+[A-Z]/.test(narrativeArtifactTransfer.text) &&
  !/\b(?:I|It|That|You|We|They|Don|Can|Won)\s*;\s*[A-Za-z]+\b/.test(narrativeArtifactTransfer.text),
  'narrative artifact probe stays clear of the maintained artifact patterns'
);
assert(truthGuardRushedProfile.abbreviationDensity > truthGuardFormalProfile.abbreviationDensity);
assert(truthGuardRushedProfile.orthographicLooseness > truthGuardFormalProfile.orthographicLooseness);
assert(truthGuardRushedProfile.fragmentPressure > truthGuardFormalProfile.fragmentPressure);
assert(truthGuardRushedProfile.conversationalPosture > truthGuardFormalProfile.conversationalPosture);
assert.equal(compressedSurfaceTransfer.borrowedShellOutcome, 'structural');
assert.equal(compressedSurfaceTransfer.transferClass, 'structural');
assert.notEqual(compressedSurfaceTransfer.text, compressedSurfaceSource);
assert(compressedSurfaceTransfer.changedDimensions.includes('abbreviation-posture'));
assert(compressedSurfaceTransfer.changedDimensions.includes('orthography-posture'));
assert(/pls|thats|dont|if youre/i.test(compressedSurfaceTransfer.text.toLowerCase()));
assert.equal(truthGuardFormalTransfer.borrowedShellOutcome, 'structural');
assert.equal(truthGuardFormalTransfer.transferClass, 'structural');
assert.notEqual(truthGuardFormalTransfer.text, truthGuardFormal);
assert(!truthGuardFormalTransfer.text.includes('$1'));
assert(!truthGuardFormalTransfer.text.includes('signals off'));
assert(truthGuardFormalTransfer.changedDimensions.includes('abbreviation-posture'));
assert((truthGuardFormalTransfer.donorProgress?.donorImprovement || 0) > 0.5);
assert.equal(truthGuardRushedTransfer.borrowedShellOutcome, 'structural');
assert.equal(truthGuardRushedTransfer.transferClass, 'structural');
assert.notEqual(truthGuardRushedTransfer.text, truthGuardRushed);
assert(truthGuardRushedTransfer.changedDimensions.includes('abbreviation-posture'));
assert((truthGuardRushedTransfer.donorProgress?.donorImprovement || 0) > 0.5);
assert.notEqual(performanceReviewFormalTransfer.text, performanceReviewFormal);
assert.notEqual(performanceReviewRushedTransfer.text, performanceReviewRushed);
assert(!['native', 'rejected'].includes(performanceReviewFormalTransfer.transferClass));
assert(!['native', 'rejected'].includes(performanceReviewRushedTransfer.transferClass));
assert(/review gist|docs lag|3 diff months|writeup/i.test(performanceReviewFormalTransfer.text.toLowerCase()));
assert(/documentation|written record|concrete correction plan|formal review/i.test(performanceReviewRushedTransfer.text.toLowerCase()));
assert(!/real provide is|service received done|handoff received muddy|calm under alter/i.test(performanceReviewRushedTransfer.text.toLowerCase()));
assert.equal(buildingAccessFormalTransfer.transferClass, 'structural');
assert.equal(buildingAccessFormalTransfer.borrowedShellOutcome, 'structural');
assert.notEqual(buildingAccessFormalTransfer.text, buildingAccessFormal);
assert(/west annex d3|reader goes green \+ buzzes|suite 118|controller cache|cold bag|fridge meds/i.test(buildingAccessFormalTransfer.text.toLowerCase()));
assert((buildingAccessFormalTransfer.donorProgress?.donorImprovementRatio || 0) >= 0.25);
assert.equal(buildingAccessRushedTransfer.transferClass, 'structural');
assert.equal(buildingAccessRushedTransfer.borrowedShellOutcome, 'structural');
assert.notEqual(buildingAccessRushedTransfer.text, buildingAccessRushed);
assert(/door 3|08:19|suite 118|overnight badge-renewal push|controller cache|south receiving/i.test(buildingAccessRushedTransfer.text.toLowerCase()));
assert((buildingAccessRushedTransfer.donorProgress?.donorImprovementRatio || 0) >= 0.45);

const signature = buildCadenceSignature(
  "I kept talking because the first version sounded too neat. Then I stopped, crossed it out, and started over."
);
const heatmapTotal = signature.heatmap.matrix.flat().reduce((sum, value) => sum + value, 0);

assert.equal(signature.axes.length, 7);
assert.equal(signature.heatmap.matrix.length, 4);
assert.equal(signature.heatmap.matrix[0].length, 4);
assert.equal(signature.dominantAxes.length, 3);
assert(Math.abs(heatmapTotal - 1) < 0.02);
assert(signature.axes.every((axis) => axis.normalized >= 0 && axis.normalized <= 1));

console.log('stylometry.test.mjs passed');
