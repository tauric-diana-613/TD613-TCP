import assert from 'assert';
import fs from 'fs';
import { listHushMasks } from '../app/engine/hush-mask-studio.js';
import { buildHushPersonaGallery, summarizeHushPersonaGallery } from '../app/hush-persona-gallery.js';
import { auditHushVisualAccessibility } from '../app/engine/hush-visual-accessibility-audit.js';

const html = fs.readFileSync('app/hush.html', 'utf8');
const js = fs.readFileSync('app/hush.js', 'utf8');
const visualCss = fs.readFileSync('app/hush-visual-system.css', 'utf8');
const mobileCss = fs.readFileSync('app/hush-mobile-field-deck.css', 'utf8');
const hushHtml = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const customizerBoot = fs.readFileSync('app/hush-customizer-card-fields-boot.js', 'utf8');
const gallery = buildHushPersonaGallery(listHushMasks({ includeRetiredMasks: true }));
const gallerySummary = summarizeHushPersonaGallery(gallery);
const accessibility = auditHushVisualAccessibility({ cssText: visualCss, mobileCssText: mobileCss, htmlText: html, jsText: js });

const report = {
  version: 'phase-31-visual-system-report',
  desktop: {
    phase31Signage: html.includes('TD613 Hush · Phase 31'),
    cockpitVisible: js.includes('hushEvidenceCockpit'),
    personaGalleryVisible: html.includes('hushPersonaGallery') && js.includes('renderHushPersonaGallery'),
    customizerForgeVisible: customizerBoot.includes('initCustomizerForge'),
    routeStateVisible: js.includes('hushRouteState')
  },
  mobile: {
    fieldDeckReady: mobileCss.includes('hush-mobile-sticky-action'),
    tapTargetsReady: mobileCss.includes('min-height:44px'),
    drawerDepthReady: mobileCss.includes('grid-template-columns:1fr'),
    noHorizontalOverflow: mobileCss.includes('overflow-x:hidden')
  },
  personaGallery: {
    maskCount: gallerySummary.maskCount,
    cardsBuilt: gallerySummary.cardsBuilt,
    storiesVisible: gallerySummary.storiesVisible,
    riskTellsVisible: gallerySummary.riskTellsVisible,
    targetRegisterCards: gallerySummary.targetRegisterCards
  },
  customizerForge: {
    fieldsVisible: fs.readFileSync('app/hush-customizer-card-fields.js', 'utf8').includes('hushCustomMaskDescription'),
    previewVisible: fs.readFileSync('app/hush-customizer-forge.js', 'utf8').includes('hushCustomizerForgePreview'),
    warningsVisible: fs.readFileSync('app/hush-customizer-forge.js', 'utf8').includes('customizer-forge-incomplete'),
    hushPageLoadsVisualSystem: hushHtml.includes('hush-visual-system.css')
  },
  accessibility: {
    contrastReady: visualCss.includes('--hush-bg-deep') && visualCss.includes('--hush-route-ready'),
    reducedMotionReady: accessibility.checks.reducedMotionReady,
    focusReady: accessibility.checks.interactiveStatePresent,
    tapTargetsReady: accessibility.checks.tapTargetsReady,
    passed: accessibility.passed
  }
};
report.readiness = {
  visualSystemReady: Object.values(report.desktop).every(Boolean),
  personaGalleryReady: report.personaGallery.maskCount >= 18 && report.personaGallery.cardsBuilt === report.personaGallery.maskCount && report.personaGallery.storiesVisible && report.personaGallery.riskTellsVisible,
  forgeReady: Object.values(report.customizerForge).every(Boolean),
  mobileReady: Object.values(report.mobile).every(Boolean),
  accessibilityReady: Object.values(report.accessibility).every(Boolean)
};
report.readiness.overall = Object.values(report.readiness).every(Boolean);

console.log('HUSH_PHASE31_VISUAL_SYSTEM_REPORT ' + JSON.stringify(report));
assert.equal(report.readiness.overall, true);
console.log('hush-phase31-visual-system-report tests passed');
