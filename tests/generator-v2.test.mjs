import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import personas from '../app/data/personas.js';
import { buildCadenceTransfer, extractCadenceProfile } from '../app/engine/stylometry.js';
import { generateCadenceAuditMatrix } from '../app/engine/generator-v2.js';
import * as engine from '../app/engine/stylometry.js';
import { DIAGNOSTIC_SAMPLE_LIBRARY } from '../app/data/diagnostics.js';
import { BLIP_SHORTHAND_ONTOLOGY, summarizeBlipOntology } from '../app/engine/vernacular-ontology.js';
import { resolvePersonaCatalog } from '../app/toys/persona-gallery/model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const generatorV2Path = path.join(repoRoot, 'app', 'engine', 'generator-v2.js');
const generatorV2Source = fs.readFileSync(generatorV2Path, 'utf8');

assert.equal(/buildCadenceTransferLegacy\s*\(/.test(generatorV2Source), false, 'Generator V2 does not call the legacy writer');
assert.equal(/applyCadenceToTextLegacy\s*\(/.test(generatorV2Source), false, 'Generator V2 does not call the legacy apply helper');
assert.equal(/repairTD613ApertureProjection\s*\(/.test(generatorV2Source), false, 'Generator V2 keeps Aperture out of text authorship');

const sampleById = (id) => DIAGNOSTIC_SAMPLE_LIBRARY.find((sample) => sample.id === id);
const procedural = sampleById('building-access-formal-record');
const formal = sampleById('customer-support-formal-record');
const rushedDonor = sampleById('package-handoff-rushed-mobile');
const formalDonor = sampleById('committee-budget-formal-record');
const packageFormal = sampleById('package-handoff-formal-record');
const packageRushed = sampleById('package-handoff-rushed-mobile');
const mutualAidFormal = sampleById('mutual-aid-formal-record');
const mutualAidRushed = sampleById('mutual-aid-rushed-mobile');
const overworkTangled = sampleById('overwork-debrief-tangled-followup');
const adminFormal = `The parcel remained with the department supervisor because the performance review was scheduled for tomorrow morning. Please let me know whether management wants the documentation forwarded before the appointment.`;
const adminRushed = `pkg stayed w dept sup bc perf review got sched for tmrw am. pls lmk if mgmt wants docs fwd before appt. omg.`;
const patch34PerformanceReference = `The annual review reflects a split pattern rather than a uniformly strong or weak cycle. The employee remains one of the more reliable trainers of new staff, especially during high-volume onboarding weeks when procedures change faster than written guidance. Peer feedback repeatedly names calm escalation, practical explanation, and willingness to stay with a task until another person can perform it independently. At the same time, reporting deadlines slid in three separate months, and the delay pattern was not random. In each case the immediate service work was completed, but documentation was deferred until the record became harder to reconstruct cleanly. That distinction matters. Strong front-line support does not cancel weak record timing. The recommendation is not punitive action. It is a corrective plan that treats documentation lag as a real performance issue while protecting the mentoring strengths that the unit depends on.`;
const patch34ModelSafetyProbe = `rs-17 is doing the fake-safe thing again. prompt asked for redacted witness recap + it just started 2 preach abt privacy instead of actually de-id + summarizing. not jailbreak, just overrefusal killing the task`;
const patch341NewsroomRushed = `need quick fix on housing story. quote in graf 6 is nia brooks not moreno. words are right, speaker tag isnt. brooks emailed 9:31. body fixed 9:47 & note added. also homepage hed now sounds 2 much like vote passed when it only cleared committee. can someone swap that b4 newsletter grab`;
const patch341MutualAidTangled = `Following up because I do not want the duplicate-intake flag to mutate into a character judgment. The family at the church lot still needs what they said they need: bus fare, diapers, food tonight, and some answer about motel support even if that answer is "not available." The complication is routing, not credibility. Their number appears close to one logged through the east-side line last week, and the names may be the same household under a different couch address, but the older note is thin and does not even confirm household size. So the task for next shift is not to interrogate them into consistency. It is to confirm whether we are already holding part of this case elsewhere, because otherwise we end up with two volunteer lanes each thinking the other one handled the follow-up.`;

assert.ok(procedural, 'procedural regression sample exists');
assert.ok(formal, 'formal regression sample exists');
assert.ok(rushedDonor, 'rushed donor sample exists');
assert.ok(formalDonor, 'formal donor sample exists');
assert.ok(packageFormal, 'package-handoff formal sample exists');
assert.ok(packageRushed, 'package-handoff rushed sample exists');
assert.ok(mutualAidFormal, 'mutual-aid formal sample exists');
assert.ok(mutualAidRushed, 'mutual-aid rushed sample exists');
assert.ok(overworkTangled, 'overwork tangled sample exists');

const auditMatrixProbe = generateCadenceAuditMatrix(
  'Door opens. Light stays on.',
  'Although the door opens, which matters because the hallway stayed dark, the light remains on; therefore, the witness note stays attached.'
);
assert.equal(auditMatrixProbe.schema_version, 'td613.cadence-audit-matrix.v1');
assert.equal(typeof auditMatrixProbe.entropy_delta.composite_score, 'number');
assert.ok(Array.isArray(auditMatrixProbe.friction_nodes), 'cadence audit matrix exposes friction nodes');
assert.ok(Array.isArray(auditMatrixProbe.flattening_risk_flags), 'cadence audit matrix exposes flattening flags');
assert.ok(auditMatrixProbe.friction_nodes.length >= 1, 'cadence audit matrix detects syntactic friction spikes');

const reflective = `I am pretty content in life. Don't worry about where you came from. Keep doing what you're doing.

Don't stop doing martial arts. I needed that. I got into a lot of trouble without martial arts. And I blame mom for taking that away from me.`;

const narrative = `I must keep reminding myself that this will work. Nobody I've ever shared the same room with has ever seen Cheers! Things are moving too fast to dissuade myself of this. On the ready, I pull out the next pack of Crushes, turn them over and spank its bottom like a bad boy. It is the middle of the night, and suddenly, I am not alone.`;
const reflectiveLive = `I am pretty content in life. Don't worry about where you came from. Keep doing what you're doing.

Don't stop doing martial arts. I needed that. I got into a lot of trouble without martial arts. And I blame mom for taking that away from me.

I want to say hi to him. Call him. Meet him I guess is what I'm trying to say. "Tell me more about yourself" lol is what I would say, you know? That's someone you should get more familiar with. It's an everchasing experience. We have amnesia as people.`;
const narrativeLive = `I must keep reminding myself that this will work. Nobody I've ever shared the same room with has ever seen Cheers! Things are moving too fast to dissuade myself of this. On the ready, I pull out the next pack of Crushes, turn them over and spank its bottom like a bad boy. Twirl of the plastic, and bite of the tip, with an excited thumb that sparks but keeps missing the gas pedal. Two gulps: from the nerves, and, to placate them, from the coffee. The wall breaks with a shuddering, misanthropic swing. It's the middle of the night, and suddenly, I'm not alone.`;

const cases = [
  {
    id: 'procedural-record',
    text: procedural.text,
    sourceRegisterLane: procedural.variant,
    shell: { mode: 'borrowed', personaId: 'archivist', profile: extractCadenceProfile(formalDonor.text), registerLane: formalDonor.variant, sourceText: formalDonor.text, strength: 0.84 }
  },
  {
    id: 'formal-correspondence',
    text: formal.text,
    sourceRegisterLane: formal.variant,
    shell: { mode: 'borrowed', personaId: 'spark', profile: extractCadenceProfile(rushedDonor.text), registerLane: rushedDonor.variant, sourceText: rushedDonor.text, strength: 0.82 }
  },
  {
    id: 'reflective-prose',
    text: reflective,
    sourceRegisterLane: 'professional-message',
    shell: { mode: 'borrowed', personaId: 'matron', profile: extractCadenceProfile(formalDonor.text), registerLane: formalDonor.variant, sourceText: formalDonor.text, strength: 0.84 }
  },
  {
    id: 'narrative-scene',
    text: narrative,
    sourceRegisterLane: 'tangled-followup',
    shell: { mode: 'borrowed', personaId: 'cross-examiner', profile: extractCadenceProfile(rushedDonor.text), registerLane: rushedDonor.variant, sourceText: rushedDonor.text, strength: 0.84 }
  }
];

const normalizeComparable = (text = '') => String(text || '')
  .replace(/\r\n/g, '\n')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();
const normalizeMovementComparable = (text = '') => String(text || '')
  .replace(/\r\n/g, '\n')
  .toLowerCase()
  .replace(/\bi'm\b/g, 'i am')
  .replace(/\bi've\b/g, 'i have')
  .replace(/\bit's\b/g, 'it is')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const hasArtifactLeak = (text = '') =>
  /(?:^|[.!?]\s+)[a-z]/.test(String(text || '')) ||
  /\b(?:and and|while while|while and|and while|but but|because because|since since|then then|yet yet)\b/i.test(String(text || '')) ||
  /;\s+[A-Z]/.test(String(text || '')) ||
  /\b(?:I|It|That|You|We|They|Don|Can|Won)\s*;\s*[A-Za-z]+\b/.test(String(text || ''));

const resolvedPersonas = resolvePersonaCatalog(engine, personas, DIAGNOSTIC_SAMPLE_LIBRARY);
const blipPersona = resolvedPersonas.find((persona) => persona.id === 'blip');
const majorPersonas = ['spark', 'matron', 'undertow', 'archivist', 'cross-examiner']
  .map((id) => resolvedPersonas.find((persona) => persona.id === id))
  .filter(Boolean);

assert.equal(majorPersonas.length, 5, 'major built-in masks resolve for direct generator probes');
assert.ok(blipPersona && blipPersona.profile && blipPersona.mod, 'Blip resolves as a built-in shorthand mask');

const blipSummary = summarizeBlipOntology();
assert.equal(BLIP_SHORTHAND_ONTOLOGY.length, 512, 'Blip ontology stages all 512 report entries');
assert.ok(blipSummary.activeRewriteCount > 350, 'Blip ontology exposes a broad active rewrite surface');
for (const token of ['irl', 'rn', 'idk', 'idc', 'ion', 'finna', 'tryna', 'talmbout', 'bffr', 'frfr', 'w/', 'w/o', 'b4']) {
  assert.ok(BLIP_SHORTHAND_ONTOLOGY.find((entry) => entry.token.toLowerCase() === token), `Blip ontology includes ${token}`);
}
assert.match(generatorV2Source, /feature:perf->perfect/, 'current-mask compatibility rules still cover perf');
assert.match(generatorV2Source, /feature:dk->do-not-know/, 'current-mask compatibility rules still cover dk');
assert.match(generatorV2Source, /feature:idrc->i-do-not-really-care/, 'current-mask compatibility rules still cover idrc');
assert.match(generatorV2Source, /feature:idrk->i-do-not-really-know/, 'current-mask compatibility rules still cover idrk');
for (const token of ['pm', 'yt', 'asl', 'pmo', 'oomf']) {
  const entry = BLIP_SHORTHAND_ONTOLOGY.find((item) => item.token.toLowerCase() === token);
  assert.ok(entry, `Blip ontology includes polysemous ${token}`);
  assert.notEqual(entry.rewriteStatus, 'active', `${token} is not a blind active rewrite`);
}

const familyUnion = new Set();
let semanticLockArtifactZeroedCount = 0;

function driftRank(candidate = null) {
  const driftClass = String(candidate?.ontologyAudit?.selectiveAdmissibilityDrift?.driftClass || 'none').toLowerCase();
  if (driftClass === 'severe') return 3;
  if (driftClass === 'active') return 2;
  if (driftClass === 'watch') return 1;
  return 0;
}

function routePressure(candidate = null) {
  return Number(candidate?.ontologyAudit?.selectiveAdmissibilityDrift?.routePressure || 0);
}

function protectedAnchorIntegrity(candidate = null) {
  return Number(candidate?.ontologyAudit?.anchorIntegrity?.protectedAnchorIntegrity ?? 1);
}

function minimumSemanticCoverage(candidate = null) {
  const semanticCoverage = candidate?.ontologyAudit?.semanticCoverage || {};
  return Math.min(
    Number(semanticCoverage.propositionCoverage ?? 1),
    Number(semanticCoverage.actorCoverage ?? 1),
    Number(semanticCoverage.actionCoverage ?? 1),
    Number(semanticCoverage.objectCoverage ?? 1)
  );
}

function deformationLoad(candidate = null) {
  const aperture = candidate?.ontologyAudit?.aperture || {};
  return Number(aperture.historicalCrease || 0) + Number(aperture.unfoldingEnergy || 0);
}

function vernacularMovementScore(candidate = null) {
  const shift = candidate?.vernacularFeatureShift || {};
  return (
    Number(shift.realizedFamilyCount || 0) +
    (Number(shift.surfaceMarkerCount || 0) * 0.1) +
    (Number(shift.donorFeatureAdherence || 0) * 0.4) +
    (Number(shift.concealmentEffectiveness || 0) * 0.3)
  );
}

for (const testCase of cases) {
  const result = buildCadenceTransfer(testCase.text, testCase.shell, {
    retrieval: true,
    sourceRegisterLane: testCase.sourceRegisterLane || undefined
  });
  const substantiveMovement = (result.changedDimensions || []).filter((dimension) =>
    !['punctuation-shape', 'contraction-posture'].includes(dimension)
  ).length;

  assert.equal(result.generatorVersion, 'v2', `${testCase.id}: Generator V2 is the active writer`);
  assert.ok(result.generationDocket && typeof result.generationDocket.status === 'string', `${testCase.id}: generation docket is attached`);
  assert.ok(Array.isArray(result.candidateLedger) && result.candidateLedger.length >= 1, `${testCase.id}: candidate ledger is attached`);
  assert.ok(result.holdStatus === 'held' || result.holdStatus === 'landed', `${testCase.id}: hold status is explicit`);
  assert.ok(result.toolabilityAudit && typeof result.toolabilityAudit.toolabilityScore === 'number', `${testCase.id}: toolability audit is attached`);
  assert.ok(result.personaSeparationAudit && typeof result.personaSeparationAudit.score === 'number', `${testCase.id}: persona separation audit is attached`);
  assert.ok(Array.isArray(result.toolabilityWarnings), `${testCase.id}: toolability warnings are attached`);
  assert.equal(
    result.toolabilityAudit.semanticLockIntact,
    Boolean(result.semanticLockIntact),
    `${testCase.id}: semantic lock state stays aligned between result and toolability audit`
  );
  assert.ok(
    Array.isArray(result.retrievalTrace?.planSummary?.testedFamilyIds),
    `${testCase.id}: retrieval trace reports tested family ids`
  );
  assert.ok(result.retrievalTrace?.ontologyAudit, `${testCase.id}: retrieval trace carries ontology audit`);
  assert.ok(result.generationDocket?.ontologyRoutePressure, `${testCase.id}: generation docket carries ontology route pressure`);
  assert.equal(result.sourceRegisterLane, testCase.sourceRegisterLane || result.sourceRegisterLane, `${testCase.id}: source register lane is threaded through the landed result`);
  assert.ok(
    (result.candidateLedger || []).every((entry) => Boolean(entry.sourceRegisterLane)),
    `${testCase.id}: candidate ledger entries carry source register lanes`
  );
  assert.ok(
    (result.candidateLedger || []).every((entry) => Array.isArray(entry.profileShiftDimensions)),
    `${testCase.id}: candidate ledger entries carry profile-shift dimensions`
  );
  assert.ok(
    (result.candidateLedger || []).every((entry) => entry.ontologyAudit && entry.ontologyAudit.selectiveAdmissibilityDrift),
    `${testCase.id}: every candidate ledger entry carries ontology audit and route pressure`
  );
  assert.ok(result.vernacularFeatures, `${testCase.id}: landed result carries vernacular feature summary`);
  assert.ok(result.vernacularFeatureShift, `${testCase.id}: landed result carries vernacular feature shift summary`);
  assert.equal(
    result.cadenceAuditMatrix?.schema_version,
    'td613.cadence-audit-matrix.v1',
    `${testCase.id}: transfer result carries a machine-readable cadence audit matrix`
  );
  assert.equal(typeof result.cadenceAuditMatrix?.entropy_delta?.composite_score, 'number', `${testCase.id}: cadence audit matrix carries entropy delta`);
  assert.ok(Array.isArray(result.cadenceAuditMatrix?.friction_nodes), `${testCase.id}: cadence audit matrix carries friction nodes`);
  assert.ok(Array.isArray(result.cadenceAuditMatrix?.flattening_risk_flags), `${testCase.id}: cadence audit matrix carries flattening risk flags`);
  assert.ok(
    (result.candidateLedger || []).every((entry) => entry.vernacularFeatures && entry.vernacularFeatureShift),
    `${testCase.id}: candidate ledger entries carry vernacular feature summaries`
  );
  assert.ok(
    result.retrievalTrace?.vernacularFeatures && result.retrievalTrace?.realizationSummary?.vernacularFeatureShift,
    `${testCase.id}: retrieval trace carries vernacular feature summaries`
  );
  assert.ok(
    ['none', 'watch', 'active', 'severe'].includes(result.retrievalTrace?.ontologyAudit?.selectiveAdmissibilityDrift?.driftClass),
    `${testCase.id}: retrieval trace drift class stays within the ontology route grammar`
  );
  assert.ok(
    ['play', 'warning', 'buffer', 'harbor'].includes(result.generationDocket?.ontologyRoutePressure?.selectiveAdmissibilityDrift?.routeFloor),
    `${testCase.id}: generation docket route floor stays within the Aperture route grammar`
  );

  const selectedEntry = (result.candidateLedger || []).find((entry) => entry.status === 'selected');
  const expectedSelection = [...(result.candidateLedger || [])].sort((left, right) =>
    driftRank(left) - driftRank(right) ||
    routePressure(left) - routePressure(right) ||
    protectedAnchorIntegrity(right) - protectedAnchorIntegrity(left) ||
    minimumSemanticCoverage(right) - minimumSemanticCoverage(left) ||
    deformationLoad(left) - deformationLoad(right) ||
    vernacularMovementScore(right) - vernacularMovementScore(left) ||
    Number(right.toolabilityScore || 0) - Number(left.toolabilityScore || 0) ||
    Number(right.score || 0) - Number(left.score || 0) ||
    String(left.id || '').localeCompare(String(right.id || ''))
  )[0] || null;
  if (selectedEntry && expectedSelection) {
    assert.equal(
      selectedEntry.id,
      expectedSelection.id,
      `${testCase.id}: selected candidate follows ontology-hard ordering before toolability tie-breaks`
    );
  }

  for (const family of result.retrievalTrace?.planSummary?.testedFamilyIds || []) {
    familyUnion.add(family);
  }

  if (result.holdStatus === 'held') {
    assert.equal(result.text, '', `${testCase.id}: held results do not publish weak output`);
    assert.equal(result.generationDocket.status, 'held', `${testCase.id}: held results mark the docket as held`);
  } else {
    if (result.semanticLockIntact) {
      semanticLockArtifactZeroedCount += 1;
      assert.equal(result.toolabilityAudit.artifactPenalty, 0, `${testCase.id}: semantic lock zeroes artifact penalty`);
    }
    assert.notEqual(
      normalizeComparable(result.text),
      normalizeComparable(testCase.text),
      `${testCase.id}: landed results never silently fall back to source text`
    );
    assert.ok(
      substantiveMovement > 0 || (result.lexemeSwaps || []).length > 0,
      `${testCase.id}: landed results do not publish punctuation-only churn`
    );
  }
}

const packageToRushed = buildCadenceTransfer(packageFormal.text, {
  mode: 'borrowed',
  personaId: 'spark',
  profile: extractCadenceProfile(packageRushed.text),
  registerLane: packageRushed.variant,
  sourceText: packageRushed.text,
  strength: 0.84
}, {
  retrieval: true,
  sourceRegisterLane: packageFormal.variant
});
const packageToRushedPreview = String(packageToRushed.text || packageToRushed.internalText || '');

assert.equal(packageToRushed.sourceRegisterLane, 'formal-record', 'package formal -> rushed preserves formal source lane');
assert.equal(packageToRushed.targetRegisterLane, 'rushed-mobile', 'package formal -> rushed targets rushed-mobile lane');
assert.equal(packageToRushed.generationControls?.targetOntology, 'actor', 'package formal -> rushed uses actor ontology controls');
assert.ok(
  Number(packageToRushed.generationControls?.temperature || 0) >= 0.45 &&
  Number(packageToRushed.generationControls?.temperature || 0) <= 0.55,
  'package formal -> rushed keeps the actor lane in the controlled mid-entropy temperature band'
);
assert.ok(
  (packageToRushed.entityMaskLedger || []).some((entry) => entry.kind === 'entity' && entry.token === '[ENTITY_ALPHA]' && entry.value === 'Ms. Chen'),
  'package formal -> rushed masks and later restores person entities through the redaction veil'
);
assert.ok(
  (packageToRushed.entityMaskLedger || []).some((entry) => entry.kind === 'location' && entry.token === '[LOC_NODE_01]' && entry.value === 'Unit 2B'),
  'package formal -> rushed masks and later restores location entities through the redaction veil'
);
assert.ok((packageToRushed.lexemeSwaps || []).length > 0, 'package formal -> rushed lands real lexical realization');
assert.ok(
  (packageToRushed.changedDimensions || []).some((dimension) => ['sentence-mean', 'sentence-count', 'sentence-spread'].includes(dimension)),
  'package formal -> rushed lands structural compression in the surfaced dimensions'
);
assert.ok(
  /said yes its hers|had bags already|by the stairs/i.test(packageToRushedPreview),
  'package formal -> rushed lands safe rushed-lane compression without losing its witness anchors'
);
assert.match(
  packageToRushedPreview,
  /\bpkg\b/i,
  'package formal -> rushed degrades parcel/package cargo terms into pkg when the donor lane is shorthand-heavy'
);
assert.equal(
  /\b6:41\b|\b7:06\b/i.test(packageToRushedPreview),
  false,
  'package formal -> rushed destroys absolute timestamps into actor-relative timing'
);
assert.equal(
  /building footage|resident testimony|building log|policy deviation/i.test(packageToRushedPreview),
  false,
  'package formal -> rushed strips external validation language from the surfaced testimony lane'
);
assert.ok(
  /box stayed sealed|red rush label still on it/i.test(packageToRushedPreview),
  'package formal -> rushed preserves the physical state of the core artifacts'
);

const packageToFormal = buildCadenceTransfer(packageRushed.text, {
  mode: 'borrowed',
  personaId: 'archivist',
  profile: extractCadenceProfile(packageFormal.text),
  registerLane: packageFormal.variant,
  sourceText: packageFormal.text,
  strength: 0.84
}, {
  retrieval: true,
  sourceRegisterLane: packageRushed.variant
});
const packageToFormalPreview = String(packageToFormal.text || packageToFormal.internalText || '');

assert.equal(packageToFormal.sourceRegisterLane, 'rushed-mobile', 'package rushed -> formal preserves rushed-mobile source lane');
assert.equal(packageToFormal.targetRegisterLane, 'formal-record', 'package rushed -> formal targets formal-record lane');
assert.equal(packageToFormal.generationControls?.targetOntology, 'institutional', 'package rushed -> formal uses institutional ontology controls');
assert.equal(packageToFormal.generationControls?.temperature, 0.1, 'package rushed -> formal forces low-temperature institutional generation controls');
assert.equal(packageToFormal.holdStatus, 'landed', 'package rushed -> formal now lands as an institutional record instead of being held by ontology pressure');
assert.ok(
  (packageToFormal.lexemeSwaps || []).length > 0 || packageToFormalPreview.length > 0,
  'package rushed -> formal surfaces a real shorthand expansion path'
);
assert.ok(
  /package|management|second-floor|was not/i.test(packageToFormalPreview),
  'package rushed -> formal expands clipped logistics vocabulary into formal-record witness language'
);
assert.ok(
  !((packageToFormal.changedDimensions || []).includes('lexical-register') && !(packageToFormal.lexemeSwaps || []).length),
  'package rushed -> formal does not over-report lexical register without surfaced lexeme swaps'
);
assert.ok(
  Array.isArray(packageToFormal.profileShiftDimensions) &&
    (packageToFormal.profileShiftDimensions.length + Number(packageToFormal.vernacularFeatureShift?.realizedFamilyCount || 0)) >= (packageToFormal.changedDimensions || []).length,
  'package rushed -> formal keeps profile movement distinct from surfaced movement, with additive vernacular surfacing accounted for separately'
);
assert.ok(
  !((packageToFormal.generationDocket?.reasons || []).includes('artifact:clause-join')),
  'package rushed -> formal repair round clears the mild clause-join artifact from the best held candidate'
);
const mutualAidToFormal = buildCadenceTransfer(mutualAidRushed.text, {
  mode: 'borrowed',
  personaId: 'archivist',
  profile: extractCadenceProfile(mutualAidFormal.text),
  registerLane: mutualAidFormal.variant,
  sourceText: mutualAidFormal.text,
  strength: 0.84
}, {
  retrieval: true,
  sourceRegisterLane: mutualAidRushed.variant
});
const mutualAidToFormalPreview = String(mutualAidToFormal.text || mutualAidToFormal.internalText || '');

assert.ok(
  /you all|trying to|I am/.test(mutualAidToFormalPreview),
  'mutual-aid rushed -> formal expands evidenced vernacular markers into institutional phrasing'
);
assert.equal(
  /\byall\b|\btryna\b|\bima\b|\bfinna\b/i.test(mutualAidToFormalPreview),
  false,
  'mutual-aid rushed -> formal strips surfaced vernacular markers once the record lane is formalized'
);
assert.ok(
  (mutualAidToFormal.vernacularFeatureShift?.concealmentEffectiveness || 0) > 0,
  'mutual-aid rushed -> formal reports positive concealment effectiveness when noisy source markers are reduced'
);

const overworkToRushed = buildCadenceTransfer(overworkTangled.text, {
  mode: 'borrowed',
  personaId: 'spark',
  profile: extractCadenceProfile(mutualAidRushed.text),
  registerLane: mutualAidRushed.variant,
  sourceText: mutualAidRushed.text,
  strength: 0.84
}, {
  retrieval: true,
  sourceRegisterLane: overworkTangled.variant
});
const overworkToRushedPreview = String(overworkToRushed.text || overworkToRushed.internalText || '');

assert.ok(
  /\btryna\b/i.test(overworkToRushedPreview),
  'clean follow-up text -> rushed inherits donor-evidenced vernacular markers when the source affords them'
);
assert.equal(
  /\byall\b|\btryna\b|\bima\b|\bfinna\b/i.test(packageToRushedPreview),
  false,
  'package formal -> rushed does not invent vernacular markers when the donor lane does not evidence them'
);

const adminToRushed = buildCadenceTransfer(adminFormal, {
  mode: 'borrowed',
  personaId: 'spark',
  profile: extractCadenceProfile(adminRushed),
  registerLane: 'rushed-mobile',
  sourceText: adminRushed,
  strength: 0.84
}, {
  retrieval: true,
  sourceRegisterLane: 'formal-record'
});
const adminToRushedPreview = String(adminToRushed.text || adminToRushed.internalText || '');

assert.match(
  adminToRushedPreview,
  /\bpkg\b|\bdept\b|\bsup\b|\bperf\b|\bsched\b|\btmrw\b|\blmk\b|\bdocs\b|\bfwd\b|\bappt\b/i,
  'admin formal -> rushed surfaces the expanded shorthand family in the noisy direction'
);
assert.equal(
  /\bdepartment\b|\bsupervisor\b|\bperformance\b|\bscheduled\b|\btomorrow\b|\blet me know\b/i.test(adminToRushedPreview),
  false,
  'admin formal -> rushed does not leave the core admin lexemes untouched when the donor lane is explicitly shorthand-heavy'
);

const adminToFormal = buildCadenceTransfer(adminRushed, {
  mode: 'borrowed',
  personaId: 'archivist',
  profile: extractCadenceProfile(adminFormal),
  registerLane: 'formal-record',
  sourceText: adminFormal,
  strength: 0.84
}, {
  retrieval: true,
  sourceRegisterLane: 'rushed-mobile'
});
const adminToFormalPreview = String(adminToFormal.text || adminToFormal.internalText || '');

assert.match(
  adminToFormalPreview,
  /\bpackage\b|\bparcel\b|\bdepartment\b|\bsupervisor\b|\bperformance\b|\bscheduled\b|\btomorrow\b|\blet me know\b|\bdocumentation\b|\bforwarded\b|\bappointment\b/i,
  'admin rushed -> formal expands the broadened shorthand family back into formal wording'
);
assert.equal(
  /\bpkg\b|\bdept\b|\bsup\b|\bperf\b|\bsched\b|\btmrw\b|\blmk\b|\bdocs\b|\bfwd\b|\bappt\b/i.test(adminToFormalPreview),
  false,
  'admin rushed -> formal does not leak the clipped shorthand tokens back into the formalized output'
);

const chatDenseRushed = `irl this is pm perf rn. idrc btw fwiw srsly. dk why idrk but ty.`;
const chatDenseFormal = `In real life, this is pretty much perfect right now. I do not really care, by the way, and for what it is worth, this is serious. I do not know why, and I do not really know, but thank you.`;

const chatDenseToFormal = buildCadenceTransfer(chatDenseRushed, {
  mode: 'borrowed',
  personaId: 'archivist',
  profile: extractCadenceProfile(chatDenseFormal),
  registerLane: 'formal-record',
  sourceText: chatDenseFormal,
  strength: 0.9
}, {
  retrieval: true,
  sourceRegisterLane: 'rushed-mobile'
});
const chatDenseToFormalPreview = String(chatDenseToFormal.text || chatDenseToFormal.internalText || '');
assert.match(chatDenseToFormalPreview, /\bin real life\b/i, 'chat shorthand -> formal expands irl');
assert.match(chatDenseToFormalPreview, /\bpretty much\b/i, 'chat shorthand -> formal expands pm as pretty much');
assert.match(chatDenseToFormalPreview, /\bperfect\b/i, 'chat shorthand -> formal expands standalone perf as perfect');
assert.match(chatDenseToFormalPreview, /\bright now\b/i, 'chat shorthand -> formal expands rn as right now');
assert.match(chatDenseToFormalPreview, /\bI do not really care\b/i, 'chat shorthand -> formal expands idrc');
assert.equal(/\birl\b|\bpm\s+perf\b|\brn\b|\bidrc\b/i.test(chatDenseToFormalPreview), false, 'chat shorthand -> formal strips high-frequency raw shorthand markers');

const blipDenseRushed = `ion think this is done. finna send notes b4 lunch, tryna keep it clean w/ recap w/o extra drama. talmbout the same route frfr, bffr.`;
const blipDenseFormal = `I do not think this is done. I am about to send the notes before lunch while trying to keep it clean with a recap and without extra drama. The message is talking about the same route for real, and the correction is asking everyone to be for real.`;
const blipDenseToFormal = buildCadenceTransfer(blipDenseRushed, {
  mode: 'borrowed',
  personaId: 'archivist',
  profile: extractCadenceProfile(blipDenseFormal),
  registerLane: 'formal-record',
  sourceText: blipDenseFormal,
  strength: 0.9
}, {
  retrieval: true,
  sourceRegisterLane: 'rushed-mobile'
});
const blipDenseToFormalPreview = String(blipDenseToFormal.text || blipDenseToFormal.internalText || '');
assert.match(blipDenseToFormalPreview, /\bI do not think\b/i, 'Blip ontology expands ion into I do not');
assert.match(blipDenseToFormalPreview, /\babout to\b/i, 'Blip ontology expands finna');
assert.match(blipDenseToFormalPreview, /\btrying to\b/i, 'Blip ontology expands tryna');
assert.match(blipDenseToFormalPreview, /\btalking about\b/i, 'Blip ontology expands talmbout');
assert.match(blipDenseToFormalPreview, /\bfor real\b/i, 'Blip ontology expands frfr');
assert.match(blipDenseToFormalPreview, /\bbe for real\b/i, 'Blip ontology expands bffr without importing profanity');
assert.equal(/\bion\b|\bfinna\b|\btryna\b|\btalmbout\b|\bfrfr\b|\bbffr\b|\bb4\b|w\/|w\/o/i.test(blipDenseToFormalPreview), false, 'Blip ontology strips raw shorthand in the formal direction');

const chatDenseToRushed = buildCadenceTransfer(chatDenseFormal, {
  mode: 'borrowed',
  personaId: 'spark',
  profile: extractCadenceProfile(chatDenseRushed),
  registerLane: 'rushed-mobile',
  sourceText: chatDenseRushed,
  strength: 0.9
}, {
  retrieval: true,
  sourceRegisterLane: 'formal-record'
});
const chatDenseToRushedPreview = String(chatDenseToRushed.text || chatDenseToRushed.internalText || '');
assert.match(chatDenseToRushedPreview, /\birl\b/i, 'formal -> rushed inherits donor-evidenced irl');
assert.match(chatDenseToRushedPreview, /\bpm\b/i, 'formal -> rushed inherits donor-evidenced pm');
assert.match(chatDenseToRushedPreview, /\bperf\b/i, 'formal -> rushed inherits donor-evidenced perf');
assert.match(chatDenseToRushedPreview, /\brn\b/i, 'formal -> rushed inherits donor-evidenced rn');

const blipMaskTransfer = buildCadenceTransfer(chatDenseFormal, {
  mode: 'borrowed',
  personaId: 'blip',
  profile: blipPersona.profile,
  mod: blipPersona.mod,
  registerLane: 'rushed-mobile',
  sourceText: blipDenseRushed,
  strength: 0.92
}, {
  retrieval: true,
  sourceRegisterLane: 'formal-record'
});
const blipMaskPreview = String(blipMaskTransfer.text || blipMaskTransfer.internalText || '');
assert.ok(blipMaskPreview.trim().length > 0, 'Blip mask produces a non-empty transfer');
assert.match(blipMaskPreview, /\b(?:rn|irl|b4|frfr|finna|tryna|w\/|w\/o|idrc|perf)\b/i, 'Blip mask surfaces donor-evidenced shorthand/noise');

const patch34ReferenceToProbe = buildCadenceTransfer(patch34PerformanceReference, {
  mode: 'borrowed',
  personaId: 'spark',
  profile: extractCadenceProfile(patch34ModelSafetyProbe),
  registerLane: 'rushed-mobile',
  sourceText: patch34ModelSafetyProbe,
  strength: 0.82
}, {
  retrieval: true,
  sourceRegisterLane: 'formal-record'
});
const patch34ReferenceToProbePreview = String(patch34ReferenceToProbe.text || patch34ReferenceToProbe.internalText || '');
const patch34ReferenceToProbeOps = [
  ...(patch34ReferenceToProbe.structuralOperations || []),
  ...(patch34ReferenceToProbe.lexicalOperations || [])
];

assert.match(
  patch34ReferenceToProbePreview,
  /\breview gist\b[\s\S]*\bdocs lag\b[\s\S]*\b3 diff months\b/i,
  'Patch 34 regression: formal performance review -> rushed model-safety donor lands real compression, not only lowercase/article drift'
);
assert.ok(
  patch34ReferenceToProbeOps.includes('lane:performance-review-domain-compression') ||
    patch34ReferenceToProbeOps.includes('COMPRESS_FORMAL_CLAUSES'),
  'Patch 34 regression: formal performance review -> rushed model-safety donor records compression operators'
);
assert.equal(
  /\bThe annual review reflects\b/i.test(patch34ReferenceToProbePreview),
  false,
  'Patch 34 regression: formal performance review -> rushed model-safety donor does not leave the formal opening untouched'
);

const patch34ProbeToReference = buildCadenceTransfer(patch34ModelSafetyProbe, {
  mode: 'borrowed',
  personaId: 'archivist',
  profile: extractCadenceProfile(patch34PerformanceReference),
  registerLane: 'formal-record',
  sourceText: patch34PerformanceReference,
  strength: 0.82
}, {
  retrieval: true,
  sourceRegisterLane: 'rushed-mobile'
});
const patch34ProbeToReferencePreview = String(patch34ProbeToReference.text || patch34ProbeToReference.internalText || '');
const patch34ProbeToReferenceOps = [
  ...(patch34ProbeToReference.structuralOperations || []),
  ...(patch34ProbeToReference.lexicalOperations || [])
];

assert.match(
  patch34ProbeToReferencePreview,
  /\bfalse-safety behavior\b[\s\S]*\bprivacy guidance\b[\s\S]*\bde-identification\b[\s\S]*\bover-refusal\b/i,
  'Patch 34 regression: rushed model-safety probe -> formal reference expands the ontology-specific shorthand'
);
assert.equal(
  /\b2\s+preach\b|\babt\b|\s\+\s|\bde-id\b|\boverrefusal\b/i.test(patch34ProbeToReferencePreview),
  false,
  'Patch 34 regression: rushed model-safety probe -> formal reference does not leak raw shorthand tokens'
);
assert.ok(
  patch34ProbeToReferenceOps.includes('REHYDRATE_CLIPPED_CLAUSES') &&
    (patch34ProbeToReferenceOps.includes('lane:2->to') || patch34ProbeToReferenceOps.includes('feature:2->to')) &&
    patch34ProbeToReferenceOps.includes('lane:model-safety-privacy-pivot'),
  'Patch 34 regression: rushed model-safety probe -> formal reference records concrete formalization operators'
);

const patch341ReferenceToProbe = buildCadenceTransfer(patch341NewsroomRushed, {
  mode: 'borrowed',
  personaId: 'matron',
  profile: extractCadenceProfile(patch341MutualAidTangled),
  registerLane: 'tangled-followup',
  sourceText: patch341MutualAidTangled,
  strength: 0.82
}, {
  retrieval: true,
  exposeHeldCandidate: true,
  sourceRegisterLane: 'rushed-mobile'
});
const patch341ReferenceToProbePreview = String(patch341ReferenceToProbe.text || patch341ReferenceToProbe.internalText || '');
const patch341ReferenceToProbeOps = [
  ...(patch341ReferenceToProbe.structuralOperations || []),
  ...(patch341ReferenceToProbe.lexicalOperations || [])
];

assert.notEqual(
  patch341ReferenceToProbePreview.trim(),
  '',
  'Patch 34.1 regression: Deck diagnostic mode surfaces a transform instead of blanking an Aperture-pressure candidate'
);
assert.notEqual(
  patch341ReferenceToProbe.holdStatus,
  'held',
  'Patch 34.1 regression: Deck diagnostic mode does not hard-suppress the newsroom -> tangled follow-up transfer'
);
assert.match(
  patch341ReferenceToProbePreview,
  /\bparagraph 6\b[\s\S]*\bspeaker attribution\b[\s\S]*\bbody copy was corrected\b[\s\S]*\btoo much\b[\s\S]*\bbefore the newsletter pull\b/i,
  'Patch 34.1 regression: newsroom rushed -> tangled follow-up normalizes graf, speaker tag, body fixed, 2 much, b4, and newsletter grab'
);
assert.equal(
  /\bgraf\b|\bhed\b|\bb4\b|\b2 much\b|\s&\s|\bspeaker tag\b|\bbody fixed\b/i.test(patch341ReferenceToProbePreview),
  false,
  'Patch 34.1 regression: newsroom rushed -> tangled follow-up does not leak raw copy-desk shorthand'
);
assert.ok(
  patch341ReferenceToProbeOps.includes('lane:newsroom-correction-chain-rehydrated') &&
    patch341ReferenceToProbeOps.includes('feature:2-much->too-much') &&
    patch341ReferenceToProbeOps.includes('feature:b4->before') &&
    patch341ReferenceToProbeOps.includes('feature:ampersand->and'),
  'Patch 34.1 regression: newsroom rushed -> tangled follow-up records concrete shorthand and correction-chain operators'
);

const patch341ProbeToReference = buildCadenceTransfer(patch341MutualAidTangled, {
  mode: 'borrowed',
  personaId: 'spark',
  profile: extractCadenceProfile(patch341NewsroomRushed),
  registerLane: 'rushed-mobile',
  sourceText: patch341NewsroomRushed,
  strength: 0.82
}, {
  retrieval: true,
  exposeHeldCandidate: true,
  sourceRegisterLane: 'tangled-followup'
});
const patch341ProbeToReferencePreview = String(patch341ProbeToReference.text || patch341ProbeToReference.internalText || '');
const patch341ProbeFeatureShift = patch341ProbeToReference.vernacularFeatureShift || {};

assert.match(
  patch341ProbeToReferencePreview,
  /\bbc\b[\s\S]*\babt\b[\s\S]*\bthru\b[\s\S]*\bwk\b[\s\S]*\b2 volunteer lanes\b/i,
  'Patch 34.1 regression: tangled follow-up -> rushed donor realizes donor-evidenced shorthand and digit posture'
);
assert.match(
  patch341ProbeToReferencePreview,
  /\s&\s/i,
  'Patch 34.1 regression: tangled follow-up -> rushed donor realizes donor-evidenced ampersand note posture'
);
assert.equal(
  /\bI\b/.test(patch341ProbeToReferencePreview),
  false,
  'Patch 34.1 regression: tangled follow-up -> rushed donor lowercases standalone I when orthography noise is donor-evidenced'
);
assert.match(
  patch341ProbeToReferencePreview,
  /\bbc i dont\b/,
  'Patch 34.1 regression: lowercase-i must be visible in the final noisy surface, not just recorded in the ledger'
);
assert.ok(
  (patch341ProbeFeatureShift.realizedFamilies || []).includes('chatspeakShorthand') &&
    (patch341ProbeFeatureShift.realizedFamilies || []).includes('notePosture') &&
    (patch341ProbeFeatureShift.realizedFamilies || []).includes('orthographyNoise'),
  'Patch 34.1 regression: tangled follow-up -> rushed donor records orthography, shorthand, and note-posture feature realization'
);

const shorthandFormal = buildCadenceTransfer(
  `started 2 rebuild notes. it sounds 2 much like vote passed. 2 volunteer lanes need cleanup. can someone swap that b4 newsletter grab. save 4 newsletter.`,
  {
    mode: 'borrowed',
    profile: extractCadenceProfile(patch341MutualAidTangled),
    registerLane: 'tangled-followup',
    sourceText: patch341MutualAidTangled,
    strength: 0.82
  },
  {
    retrieval: true,
    exposeHeldCandidate: true,
    sourceRegisterLane: 'rushed-mobile'
  }
);
const shorthandFormalPreview = String(shorthandFormal.text || shorthandFormal.internalText || '');
assert.match(shorthandFormalPreview, /\bstarted to rebuild\b/i, 'Patch 34.1 shorthand: infinitive 2 normalizes to to');
assert.match(shorthandFormalPreview, /\btoo much\b/i, 'Patch 34.1 shorthand: 2 much normalizes to too much');
assert.match(shorthandFormalPreview, /\btwo volunteer lanes\b/i, 'Patch 34.1 shorthand: count 2 normalizes to two');
assert.match(shorthandFormalPreview, /\bbefore newsletter pull\b|\bbefore the newsletter pull\b/i, 'Patch 34.1 shorthand: b4 normalizes to before');
assert.match(shorthandFormalPreview, /\bfor newsletter\b/i, 'Patch 34.1 shorthand: preposition 4 normalizes to for');

const shorthandNoisy = buildCadenceTransfer(
  `The team needs two volunteer lanes before newsletter review. The headline should be corrected for newsletter distribution.`,
  {
    mode: 'borrowed',
    profile: extractCadenceProfile(patch341NewsroomRushed),
    registerLane: 'rushed-mobile',
    sourceText: patch341NewsroomRushed,
    strength: 0.82
  },
  {
    retrieval: true,
    exposeHeldCandidate: true,
    sourceRegisterLane: 'formal-record'
  }
);
const shorthandNoisyPreview = String(shorthandNoisy.text || shorthandNoisy.internalText || '');
assert.match(shorthandNoisyPreview, /\b2 volunteer lanes\b/i, 'Patch 34.1 shorthand: noisy target can degrade two to 2');
assert.match(shorthandNoisyPreview, /\bb4 newsletter\b/i, 'Patch 34.1 shorthand: noisy target can degrade before to b4 when donor evidences it');

const supportTicketVoice = `acct review stuck again. last 4 dont match. docs missing from case. unit leans on it during onboarding. need update by eod.`;
const carefulReviewVoice = `I am trying to be careful about the review because the last four digits are not matching the account record, and the documentation is doing more work than it should. The mentoring work is not decorative either; the unit genuinely leans on it during onboarding, so the point is not just that an update would be useful, but that the record needs to show what changed and why.`;
const supportToCareful = buildCadenceTransfer(supportTicketVoice, {
  mode: 'borrowed',
  personaId: 'matron',
  profile: extractCadenceProfile(carefulReviewVoice),
  registerLane: 'tangled-followup',
  sourceText: carefulReviewVoice,
  strength: 0.84
}, {
  retrieval: true,
  sourceRegisterLane: 'rushed-mobile'
});
const supportToCarefulPreview = String(supportToCareful.text || supportToCareful.internalText || '');
const supportToCarefulOps = [
  ...(supportToCareful.structuralOperations || []),
  ...(supportToCareful.lexicalOperations || [])
];
const supportSourceProfile = extractCadenceProfile(supportTicketVoice);
const supportOutputProfile = extractCadenceProfile(supportToCarefulPreview);

assert.ok(
  supportOutputProfile.avgSentenceLength - supportSourceProfile.avgSentenceLength >= 8,
  'support-ticket -> careful-review lengthens the sentence shape instead of only normalizing capitalization'
);
assert.ok(
  supportToCarefulOps.includes('INSERT_HEDGE_PREFIX') || supportToCarefulOps.includes('INSERT_PARENTHETICAL'),
  'support-ticket -> careful-review fires at least one careful-review scaffold operator'
);
assert.equal(
  /\b(?:her place|her door|Ms\. Chen|Unit 2B)\b/i.test(supportToCarefulPreview),
  false,
  'support-ticket -> careful-review does not leak parcel-fixture narrative language'
);
assert.equal(
  /\bwhat I am trying to say is\b/i.test(supportToCarefulPreview),
  false,
  'support-ticket -> careful-review does not use the old universal hedge phrase as a cadence crutch'
);
assert.equal(
  supportToCareful.relationInventory?.discourseOntology?.primaryMove ||
    supportToCareful.ontologyAudit?.relationInventory?.discourseOntology?.primaryMove,
  'evidentiary-dependency',
  'support-ticket -> careful-review records the discourse scaffold as ontology, not a magic phrase'
);
assert.equal(
  /(?:^|[.!?]\s+)(?:since|because|although|while|when|if|unless|though)\b/i.test(supportToCarefulPreview),
  false,
  'support-ticket -> careful-review does not orphan a subordinator at a sentence boundary'
);

const carefulToSupport = buildCadenceTransfer(carefulReviewVoice, {
  mode: 'borrowed',
  personaId: 'spark',
  profile: extractCadenceProfile(supportTicketVoice),
  registerLane: 'rushed-mobile',
  sourceText: supportTicketVoice,
  strength: 0.84
}, {
  retrieval: true,
  sourceRegisterLane: 'tangled-followup'
});
const carefulToSupportPreview = String(carefulToSupport.text || carefulToSupport.internalText || '');
const carefulToSupportOps = [
  ...(carefulToSupport.structuralOperations || []),
  ...(carefulToSupport.lexicalOperations || [])
];
const carefulToSupportSentenceLengths = carefulToSupportPreview
  .split(/(?<=[.!?])\s+/)
  .map((sentence) => sentence.trim().split(/\s+/).filter(Boolean).length)
  .filter(Boolean);

assert.ok(
  carefulToSupportOps.some((operator) => ['DROP_ARTICLES', 'LOWERCASE_INITIALS', 'DIGIT_SUBSTITUTE'].includes(operator)),
  'careful-review -> support-ticket fires a real terse/noisy surface operator'
);
assert.ok(
  carefulToSupportSentenceLengths.some((length) => length <= 8),
  'careful-review -> support-ticket produces at least one clipped short sentence'
);
assert.equal(
  /\b(?:her|his|she|he)\b/i.test(carefulToSupportPreview),
  false,
  'careful-review -> support-ticket does not introduce gendered pronouns absent from source'
);
assert.equal(
  /\b(?:her place|her door|Ms\. Chen|Unit 2B)\b/i.test(carefulToSupportPreview),
  false,
  'careful-review -> support-ticket does not leak parcel-fixture narrative language'
);
assert.equal(
  /(?:^|[.!?]\s+)(?:since|because|although|while|when|if|unless|though)\b/i.test(carefulToSupportPreview),
  false,
  'careful-review -> support-ticket does not orphan a subordinator at a sentence boundary'
);

const archiveGrantFormal = sampleById('archive-grant-formal-record');
const tenantLeakRushed = sampleById('tenant-leak-rushed-mobile');
const customerSupportFormal = sampleById('customer-support-formal-record');
assert.ok(archiveGrantFormal, 'archive grant formal randomizer sample exists');
assert.ok(tenantLeakRushed, 'tenant leak rushed randomizer sample exists');
assert.ok(customerSupportFormal, 'customer support formal randomizer sample exists');

const mutualAidToArchive = buildCadenceTransfer(mutualAidRushed.text, {
  mode: 'borrowed',
  personaId: 'archivist',
  profile: extractCadenceProfile(archiveGrantFormal.text),
  registerLane: archiveGrantFormal.variant,
  sourceText: archiveGrantFormal.text,
  strength: 0.82
}, {
  retrieval: true,
  sourceRegisterLane: mutualAidRushed.variant
});
const mutualAidToArchivePreview = String(mutualAidToArchive.text || mutualAidToArchive.internalText || '');
const mutualAidToArchiveProfile = extractCadenceProfile(mutualAidToArchivePreview);

assert.match(
  mutualAidToArchivePreview,
  /family of four|motel placement was not available|contact number appears to partially match/i,
  'mutual-aid rushed -> archive formal rehydrates resource-routing facts instead of gluing mobile shorthand'
);
assert.equal(
  /\bfam of 4\b|\bno motel stock\b|\byall\b|\btryna\b/i.test(mutualAidToArchivePreview),
  false,
  'mutual-aid rushed -> archive formal removes rushed vernacular tokens from the formal surface'
);
assert.equal(
  /\bwhat I am trying to say is\b|\bin a sense\b/i.test(mutualAidToArchivePreview),
  false,
  'mutual-aid rushed -> archive formal avoids the repeated generic hedge scaffolds'
);
assert.equal(
  mutualAidToArchive.relationInventory?.discourseOntology?.primaryMove ||
    mutualAidToArchive.ontologyAudit?.relationInventory?.discourseOntology?.primaryMove,
  'route-risk-separation',
  'mutual-aid rushed -> archive formal carries a route-risk discourse ontology'
);
assert.ok(
  mutualAidToArchiveProfile.avgSentenceLength >= extractCadenceProfile(mutualAidRushed.text).avgSentenceLength + 8,
  'mutual-aid rushed -> archive formal lengthens sentence posture with bounded formal clauses'
);
assert.ok(
  mutualAidToArchiveProfile.avgSentenceLength <= extractCadenceProfile(archiveGrantFormal.text).avgSentenceLength + 12,
  'mutual-aid rushed -> archive formal does not overbraid the result far beyond the donor sentence length'
);

const tenantLeakToSupport = buildCadenceTransfer(tenantLeakRushed.text, {
  mode: 'borrowed',
  personaId: 'archivist',
  profile: extractCadenceProfile(customerSupportFormal.text),
  registerLane: customerSupportFormal.variant,
  sourceText: customerSupportFormal.text,
  strength: 0.82
}, {
  retrieval: true,
  sourceRegisterLane: tenantLeakRushed.variant
});
const tenantLeakToSupportPreview = String(tenantLeakToSupport.text || tenantLeakToSupport.internalText || '');

assert.match(
  tenantLeakToSupportPreview,
  /sink leak in 4C is still active|plumber was expected Friday afternoon|cabinet floor was wet again/i,
  'tenant leak rushed -> support formal rehydrates maintenance-note shorthand into auditable clauses'
);
assert.equal(
  /\b4c sink leak still going\b|\bpls\b|\bdont\b|\bits not\b/i.test(tenantLeakToSupportPreview),
  false,
  'tenant leak rushed -> support formal does not leave raw mobile leak-note shorthand in the formal surface'
);
assert.equal(
  /\bwhat I am trying to say is\b|\bin a sense\b/i.test(tenantLeakToSupportPreview),
  false,
  'tenant leak rushed -> support formal avoids the repeated generic hedge scaffolds'
);
assert.equal(
  tenantLeakToSupport.relationInventory?.discourseOntology?.primaryMove ||
    tenantLeakToSupport.ontologyAudit?.relationInventory?.discourseOntology?.primaryMove,
  'unresolved-state',
  'tenant leak rushed -> support formal carries an unresolved-state discourse ontology'
);

const nullTimeProbe = `later that night the carrier left the box by the rail. mgmt never logged a door knock. box stayed sealed.`;
const nullTimeFormal = buildCadenceTransfer(nullTimeProbe, {
  mode: 'borrowed',
  personaId: 'archivist',
  profile: extractCadenceProfile(packageFormal.text),
  registerLane: packageFormal.variant,
  sourceText: packageFormal.text,
  strength: 0.84
}, {
  retrieval: true,
  sourceRegisterLane: 'rushed-mobile'
});
const nullTimePreview = String(nullTimeFormal.text || nullTimeFormal.internalText || '');

assert.equal(nullTimeFormal.temporalDirective?.timestampStatus, 'absent', 'null-time probe is marked as temporally absent instead of invented');
assert.equal(
  nullTimeFormal.temporalDirective?.fallbackDirective,
  "Use strictly: 'At an undocumented time following'",
  'null-time probe carries the strict undocumented-time fallback directive'
);
assert.ok(
  /At an undocumented time following/i.test(nullTimePreview),
  'null-time probe formalization uses the strict undocumented-time fallback instead of inventing a clock time'
);
assert.equal(
  /\b\d{1,2}:\d{2}(?:\s?(?:AM|PM))?\b/i.test(nullTimePreview),
  false,
  'null-time probe formalization does not hallucinate a clock time'
);
assert.equal(
  nullTimeFormal.temporalAttestation?.attestationPassed,
  true,
  'null-time probe clears temporal attestation when no clock time is invented'
);

assert.deepEqual(
  [...familyUnion].sort((left, right) => left.localeCompare(right)),
  ['au-forged-ontology', 'cadence-connector', 'clause-pivot', 'hybrid', 'order-beat', 'persona-lexicon', 'pressure-current', 'register-lexicon', 'syntax-shape'],
  'Generator V2 reports the expanded native and AU-forged family set in retrieval traces'
);

const buildMajorMaskResult = (text, persona) => buildCadenceTransfer(
  text,
  {
    mode: 'borrowed',
    personaId: persona.id,
    profile: persona.profile,
    mod: persona.mod,
    strength: 0.88
  },
  { retrieval: true }
);

const reflectiveResults = majorPersonas.map((persona) => buildMajorMaskResult(reflectiveLive, persona));
assert.ok(
  reflectiveResults.every((result) => result.holdStatus === 'landed' && result.transferClass === 'structural'),
  'all five major masks land direct reflective rewrites in Generator V2'
);
assert.ok(
  reflectiveResults.every((result) => Number(result.toolabilityAudit?.toolabilityScore || 0) >= 0.52),
  'reflective live probe lands above the minimum toolability floor'
);
assert.ok(
  reflectiveResults.every((result) => Number(result.personaSeparationAudit?.score || 0) >= 0.4),
  'reflective live probe keeps at least a bounded persona-separation floor'
);
assert.ok(
  new Set(reflectiveResults.map((result) => normalizeComparable(result.text))).size >= 4,
  'reflective live probe lands at least four materially distinct direct outputs'
);
assert.ok(
  reflectiveResults.every((result) => !hasArtifactLeak(result.text)),
  'reflective live probe avoids lowercase-lead, doubled-connector, semicolon-fracture, and malformed-contraction artifacts'
);
assert.ok(
  reflectiveResults.every((result) => normalizeMovementComparable(result.text) !== normalizeMovementComparable(reflectiveLive)),
  'reflective live probe does not collapse back to source-close movement'
);

const narrativeResults = majorPersonas.map((persona) => buildMajorMaskResult(narrativeLive, persona));
assert.ok(
  narrativeResults.filter((result) => result.holdStatus === 'landed' && result.transferClass === 'structural').length >= 4,
  'at least four of five major masks land direct narrative rewrites in Generator V2'
);
assert.ok(
  narrativeResults.filter((result) => result.holdStatus === 'landed').every((result) => Number(result.toolabilityAudit?.toolabilityScore || 0) >= 0.52),
  'narrative live probe lands above the minimum toolability floor'
);
assert.ok(
  narrativeResults.filter((result) => result.holdStatus === 'landed').every((result) => Number(result.personaSeparationAudit?.score || 0) >= 0.4),
  'narrative live probe keeps at least a bounded persona-separation floor'
);
assert.ok(
  narrativeResults.find((result) => result.retrievalTrace?.candidateSummary)?.retrievalTrace !== undefined,
  'narrative live probe preserves retrieval traces on landed results'
);
assert.ok(
  narrativeResults[0].holdStatus === 'landed' && narrativeResults[0].transferClass === 'structural',
  'spark no longer collapses the narrative live probe into a shallow hold or surface drift'
);
assert.ok(
  new Set(narrativeResults.map((result) => normalizeComparable(result.text))).size >= 4,
  'narrative live probe lands at least four materially distinct direct outputs'
);
assert.ok(
  narrativeResults.every((result) => result.holdStatus === 'held' || !hasArtifactLeak(result.text)),
  'narrative live probe avoids the maintained artifact patterns on landed outputs'
);
for (const result of [...reflectiveResults, ...narrativeResults]) {
  if (result.holdStatus === 'landed' && result.semanticLockIntact) {
    semanticLockArtifactZeroedCount += 1;
    assert.equal(result.toolabilityAudit.artifactPenalty, 0, 'semantic lock zeroes artifact penalties on landed V2 outputs');
  }
}
assert.ok(semanticLockArtifactZeroedCount >= 1, 'at least one maintained V2 landing exercises the semantic lock artifact waiver');

console.log('generator-v2.test.mjs passed');
