import assert from 'assert';
import fs from 'fs';
import hushMasks from '../app/data/hush-masks.js';
import phase22HushMasks from '../app/data/hush-phase22-masks.js';
import phase24HushMasks from '../app/data/hush-phase24-masks.js';
import phase27HushMasks from '../app/data/hush-phase27-masks.js';
import phase28HushMasks from '../app/data/hush-phase28-masks.js';

const allMasks = [...hushMasks, ...phase22HushMasks, ...phase24HushMasks, ...phase27HushMasks, ...phase28HushMasks];
const personaLabel = (label = '') => /^\p{Lu}[\p{L}'-]+(?:\s+(?:of|the|\p{Lu}[\p{L}'-]+))+$/u.test(label);
const personaReady = allMasks.every((mask) => personaLabel(mask.label) && !/^Phase\s+\d+/i.test(mask.label) && mask.description.split(/\s+/).length >= 16 && mask.intendedUse && mask.riskTell);

const customizerModule = fs.readFileSync('app/hush-customizer-card-fields.js', 'utf8');
const boot = fs.readFileSync('app/hush-customizer-card-fields-boot.js', 'utf8');
const bootstrap = fs.readFileSync('app/chamber-bootstrap.js', 'utf8');
const auditDoc = fs.readFileSync('docs/HUSH_PHASE_30_1_CONCEPT_DESIGN_AUDIT.md', 'utf8');

const requiredCustomizerFields = [
  'hushCustomMaskFamily',
  'hushCustomMaskDescription',
  'hushCustomMaskIntendedUse',
  'hushCustomMaskRiskTell',
  'hushCustomMaskSentence',
  'hushCustomMaskOrnament',
  'hushCustomMaskWarmth',
  'hushCustomMaskCustody',
  'hushCustomMaskCadence',
  'hushCustomMaskWarnings'
];

const report = {
  version: 'phase-30-1-concept-design-report',
  maskPersonas: {
    maskCount: allMasks.length,
    humanPersonaNames: allMasks.filter((mask) => personaLabel(mask.label)).length,
    repoLabelsRemaining: allMasks.filter((mask) => /^Phase\s+\d+/i.test(mask.label)).map((mask) => mask.id),
    personaReady
  },
  customizer: {
    modulePresent: customizerModule.includes('ensureCustomizerCardFields'),
    bootPresent: boot.includes('initHushCustomizerCardFields'),
    bootstrapLoadsBoot: bootstrap.includes('hush-customizer-card-fields-boot.js'),
    fieldsPresent: requiredCustomizerFields.every((field) => customizerModule.includes(field))
  },
  audit: {
    docPresent: auditDoc.includes('Hush Phase 30.1 Concept Design Audit'),
    desktopCovered: auditDoc.includes('Desktop UI / UX audit'),
    mobileCovered: auditDoc.includes('Mobile UI / UX audit'),
    phase31Framed: auditDoc.includes('Phase 31')
  }
};
report.readiness = {
  personaReady: report.maskPersonas.personaReady && report.maskPersonas.maskCount >= 20,
  customizerReady: Object.values(report.customizer).every(Boolean),
  auditReady: Object.values(report.audit).every(Boolean)
};
report.readiness.overall = Object.values(report.readiness).every(Boolean);

console.log('HUSH_PHASE30_1_CONCEPT_DESIGN_REPORT ' + JSON.stringify(report));
assert.equal(report.readiness.overall, true);
console.log('hush-phase30-1-concept-design-report tests passed');
