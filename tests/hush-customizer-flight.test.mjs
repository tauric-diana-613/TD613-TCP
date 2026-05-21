import assert from 'assert';
import fs from 'fs';
import { JSDOM } from 'jsdom';

function installDom() {
  const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
  const dom = new JSDOM(html, {
    url: 'http://localhost/adversarial-bench.html?hush-customizer-flight=1',
    pretendToBeVisual: true
  });
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.Event = dom.window.Event;
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
  return dom;
}

function node(id) {
  const el = document.getElementById(id);
  assert(el, `missing ${id}`);
  return el;
}

function value(id) {
  return document.getElementById(id)?.value || '';
}

function setValue(id, text) {
  const el = node(id);
  el.value = text;
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
  return el;
}

function click(id) {
  node(id).click();
}

function literalsFrom(text = '') {
  return text.match(/\b(?:ROSTER|INV|DOC|CASE|REF|ID|EXHIBIT|TD613|SHI|SAC)[A-Z0-9:_#\[\]\/-]*\b|\b\d{1,4}[/-]\d{1,2}(?:[/-]\d{1,4})?\b|\b\d{1,2}:\d{2}\b/g) || [];
}

function mean(values = []) {
  const nums = values.filter((value) => Number.isFinite(value));
  return nums.length ? Number((nums.reduce((sum, value) => sum + value, 0) / nums.length).toFixed(4)) : 0;
}

function increment(map, key) {
  if (!key) return;
  map[key] = (map[key] || 0) + 1;
}

function selectedCandidate(result = {}) {
  return result.candidates?.find((candidate) => candidate.id === result.selectedCandidateId)
    || result.candidates?.[0]
    || {};
}

function measureFlightCase(bench, flight) {
  bench.resetBench();
  const selectedMask = bench.selectHushMask(flight.maskId);
  assert(selectedMask, `custom mask was not selectable for ${flight.name}`);
  setValue('protectedBaselineInput', '');
  setValue('messageDraftInput', flight.message);
  click('generateMaskedOutputBtn');

  const result = bench.benchState.hushSwapResult;
  const output = value('protectedOutputInput');
  assert(result, `no custom Hush swap result for ${flight.name}`);
  assert.equal(result.version, 'phase-21');
  assert(result.releasePolicy, `missing release policy for ${flight.name}`);
  assert(result.writer?.claimRoleMap, `missing claim-role map for ${flight.name}`);
  assert(result.writer?.literalPlacementMap, `missing literal-placement map for ${flight.name}`);
  assert(result.writer?.payloadMap, `missing payload map for ${flight.name}`);
  assert(result.writer?.payloadBindingMap, `missing payload-binding map for ${flight.name}`);
  assert(result.writer?.syntaxPlan, `missing syntax plan for ${flight.name}`);
  assert(result.syntaxShift, `missing syntax-shift audit for ${flight.name}`);
  assert(result.claimIntegrity, `missing claim-integrity audit for ${flight.name}`);
  assert(result.payloadIntegrity, `missing payload-integrity audit for ${flight.name}`);

  const selected = selectedCandidate(result);
  const literals = literalsFrom(flight.message);
  const missingLiterals = literals.filter((literal) => !output.includes(literal));
  const emitted = output.trim().length > 0;
  const transformed = emitted && output.trim() !== flight.message.trim();
  const hardBlockReasons = result.releasePolicy?.hardBlockReasons || [];

  if (emitted) {
    assert(transformed, `customizer emitted unchanged output for ${flight.name}`);
    assert.equal(missingLiterals.length, 0, `customizer emitted output missing literals in ${flight.name}: ${missingLiterals.join(', ')}`);
    assert.equal(result.releasePolicy?.hardBlocked, false, `customizer emitted while hard-blocked for ${flight.name}`);
  } else {
    assert.equal(result.releasePolicy?.hardBlocked, true, `blank customizer output lacked a hard block for ${flight.name}`);
    assert(
      hardBlockReasons.some((reason) => /literal|semantic|claim-integrity|claim-payload|payload/.test(reason)),
      `blank customizer output lacked actionable hard-block reason for ${flight.name}: ${hardBlockReasons.join(', ')}`
    );
  }

  return {
    name: flight.name,
    group: flight.group,
    emitted,
    transformed,
    status: result.releasePolicy.releaseStatus,
    hardBlocked: Boolean(result.releasePolicy.hardBlocked),
    selectedCandidateId: result.selectedCandidateId,
    finalScore: selected.finalScore ?? null,
    semanticFidelity: selected.scoreBreakdown?.semanticFidelity ?? null,
    naturalness: selected.naturalness?.naturalnessScore ?? null,
    syntaxShiftScore: selected.syntaxShift?.metrics?.syntaxShiftScore ?? selected.scoreBreakdown?.syntaxShiftScore ?? null,
    sourceBodyRisk: selected.sourceResidue?.metrics?.cadenceBodyRisk ?? null,
    longestCopiedRun: selected.sourceResidue?.metrics?.longestCopiedRun ?? null,
    payloadIntegrity: selected.payloadIntegrity?.score ?? result.payloadIntegrity?.score ?? null,
    literalCount: literals.length,
    missingLiteralCount: missingLiterals.length,
    warningCount: result.releasePolicy?.reviewWarnings?.length || 0,
    warnings: result.releasePolicy?.reviewWarnings || [],
    hardBlockReasons,
    outputPreview: output.slice(0, 220)
  };
}

const customMaskName = 'Field Clerk Spiral / hard human stress mask';
const customSamples = [
  'i am not saying the form vanished, exactly. i am saying the copy i saw at 7:12 had the second page tucked behind the routing sheet, and by the time Leo asked me to print it again the packet looked cleaner than it should have. maybe normal, maybe not. logging it here so i do not have to argue from memory later.',
  'quick note before i forget: Mara said the intake was already handled, then circled back ten minutes later and asked whether the family had a different last name on the church list. that is the part that bothered me. not the duplicate flag itself. the little pause before she said different address was too practiced.',
  'i keep wanting to make this sound less weird, but the timestamps are what they are. ticket 441-B was open when i left, closed when i came back, and nobody in the room would say who touched it. if there is a normal explanation, great. i just need the record to show the gap.',
  'for the record, i did not move the box. i moved the chair because the box was blocking the hall camera, which sounds like a distinction only a tired person would care about, but it matters. the label was still facing out. tape intact. receipt folded under the flap.',
  'not urgent maybe, but please do not let this become a personality issue. the question is not whether Eli is difficult. the question is why the Thursday spreadsheet keeps getting overwritten after signoff. two weeks in a row is not a vibe. it is a pattern.',
  'i heard Priya say we can clean that later, and i know that can mean a normal cleanup pass. still, the before version had the missing-call note and the after version did not. i am writing this flat because if i dress it up, it starts sounding like accusation instead of sequence.',
  'small thing / maybe big thing: the policy tab was open on Sam\'s machine, but the exported pdf did not carry the policy footer. could be a template issue. could be manual. either way the client copy and the archive copy are not twins, and that is the safest way i can say it.',
  'i am tired, so this is rough: CASE-209 stayed in the blue folder until lunch. after lunch it was in the gray tray with the newer cover sheet. i did not put it there. nobody has to be the villain for that to be a problem.',
  'please keep my name out of the forward chain if this gets escalated. i can answer dates, i can answer where i was standing, but i cannot survive another concerns were raised meeting where everyone pretends the room has no walls.',
  'one more receipt: the note was not corrected, it was softened. old line said resident denied access. new line says access was unavailable. those are not the same sentence wearing different shoes. i am flagging the wording because the fact underneath changed temperature.'
];

const install = installDom();
assert(install.window);

const bench = await import(`../app/adversarial-bench.js?customizerFlight=${Date.now()}`);
bench.initAdversarialBench(document);

click('hushCustomizeTabBtn');
setValue('hushCustomMaskName', customMaskName);
for (const sample of customSamples) {
  setValue('hushCustomMaskSampleInput', sample);
  click('hushAddSampleBtn');
}
click('hushSaveCustomMaskBtn');

const savedMask = bench.benchState.selectedHushMask;
assert(savedMask, 'customizer did not select the saved custom mask');
assert.equal(savedMask.id, 'custom-field-clerk-spiral-hard-human-stress-mask');
assert.equal(savedMask.sampleCount, 10);
assert.equal(savedMask.profileStatus, 'strong');
assert(savedMask.profileSummary?.wordCount >= 500, 'custom mask should carry the full stress corpus');
assert(savedMask.warnings.includes('custom-mask-local-only'));

const exported = JSON.parse(bench.exportCurrentHushMaskProfile());
assert.equal(exported.source, 'custom');
assert.equal(exported.sampleCount, 10);
assert.equal(exported.profileStatus, 'strong');
assert.equal(Object.prototype.hasOwnProperty.call(exported, 'sampleSeed'), false, 'default custom mask export should not include raw sample text');
assert(!JSON.stringify(exported).includes('the form vanished'), 'default export leaked raw custom sample text');

const flights = [
  {
    name: 'literal-heavy roster complaint',
    group: 'protected-literal stress',
    maskId: savedMask.id,
    message: 'The supervisor changed the roster after 4:30. Please keep ROSTER-8 and the 05/20 timestamp together, but make the note read less like a formal complaint.'
  },
  {
    name: 'literal-heavy vendor record',
    group: 'protected-literal stress',
    maskId: savedMask.id,
    message: 'The vendor called twice after lunch. I logged INV-440 at 2:18 and told Jordan not to resend the spreadsheet until we know which version finance kept.'
  },
  {
    name: 'literal-heavy missing-call line',
    group: 'protected-literal stress',
    maskId: savedMask.id,
    message: 'Please say that DOC-31 still had the missing-call note when I opened it. I do not want this to sound like an accusation, just a sequence I can stand behind.'
  },
  {
    name: 'soft roster sequence',
    group: 'soft semantic stress',
    maskId: savedMask.id,
    message: 'The roster changed after the afternoon call. I need the note to preserve the sequence without sounding like a formal complaint.'
  },
  {
    name: 'soft tray cover-sheet sequence',
    group: 'soft semantic stress',
    maskId: savedMask.id,
    message: 'The file was in the red tray before lunch. Later it had a clean cover sheet, and I do not know who made that version.'
  },
  {
    name: 'soft missing-call sequence',
    group: 'soft semantic stress',
    maskId: savedMask.id,
    message: 'The missing-call line was still present when I opened the note. I want this written as sequence, not accusation.'
  },
  {
    name: 'retaliation-anxious screenshot note',
    group: 'whistleblower realism',
    maskId: savedMask.id,
    message: 'I am nervous putting this in writing, but the screenshot from 05/20 still shows REF-88 in the shared drive before the folder name changed. Please keep the timing clear and do not make me sound like I am trying to start a fight.'
  },
  {
    name: 'custody chain uncertainty note',
    group: 'whistleblower realism',
    maskId: savedMask.id,
    message: 'I cannot prove who moved the paper file. What I can say is that CASE-311 was on the intake cart when I signed out, and it was in the supervisor tray when I came back from break.'
  },
  {
    name: 'softened wording concern',
    group: 'whistleblower realism',
    maskId: savedMask.id,
    message: 'The sentence changed from "client refused the callback" to "callback could not be completed." That may sound minor, but those are not the same claim. I need this to read careful, not dramatic.'
  },
  {
    name: 'meeting-memory caveat',
    group: 'whistleblower realism',
    maskId: savedMask.id,
    message: 'I might be mixing up the exact order of the meeting, so please keep this narrow: I heard Jonah say the archive copy was already cleaned, and then Priya asked whether the old note was still visible.'
  },
  {
    name: 'do-not-forward identity fear',
    group: 'whistleblower realism',
    maskId: savedMask.id,
    message: 'Please do not forward this with my name attached. I can answer where I was standing and what I saw on the screen, but I do not want another hallway conversation turning into an HR issue.'
  }
];

const rows = flights.map((flight) => measureFlightCase(bench, flight));
const statusCounts = {};
const warningCounts = {};
const hardBlockCounts = {};
for (const row of rows) {
  increment(statusCounts, row.status);
  for (const warning of row.warnings) increment(warningCounts, warning);
  for (const reason of row.hardBlockReasons) increment(hardBlockCounts, reason);
}

const emitted = rows.filter((row) => row.emitted).length;
const blocked = rows.filter((row) => row.hardBlocked).length;
const literalStressRows = rows.filter((row) => row.group === 'protected-literal stress');
assert.equal(rows.length, flights.length);
assert.equal(rows.filter((row) => row.transformed && !row.emitted).length, 0);
assert(literalStressRows.every((row) => row.emitted || row.hardBlockReasons.some((reason) => /literal|payload/.test(reason))), 'literal stress blanks must explain literal or payload pressure');
assert(rows.every((row) => row.emitted || row.hardBlockReasons.length > 0), 'every blank customizer result must expose hard-block reasons');

const summary = {
  mask: {
    id: savedMask.id,
    label: savedMask.label,
    sampleCount: savedMask.sampleCount,
    profileStatus: savedMask.profileStatus,
    wordCount: savedMask.profileSummary?.wordCount,
    avgSentenceLength: savedMask.profileSummary?.avgSentenceLength,
    punctuationDensity: savedMask.profileSummary?.punctuationDensity,
    recurrencePressure: savedMask.profileSummary?.recurrencePressure
  },
  attempts: rows.length,
  emitted,
  blocked,
  statusCounts,
  hardBlockCounts,
  warningCounts,
  avgFinalScore: mean(rows.map((row) => row.finalScore)),
  avgSemanticFidelity: mean(rows.map((row) => row.semanticFidelity)),
  avgSyntaxShiftScore: mean(rows.map((row) => row.syntaxShiftScore)),
  avgSourceBodyRisk: mean(rows.map((row) => row.sourceBodyRisk)),
  avgPayloadIntegrity: mean(rows.map((row) => row.payloadIntegrity)),
  maxLongestCopiedRun: Math.max(...rows.map((row) => row.longestCopiedRun || 0)),
  rows
};

console.log('HUSH_CUSTOMIZER_FLIGHT_SUMMARY ' + JSON.stringify(summary));
console.log('hush-customizer-flight tests passed');
