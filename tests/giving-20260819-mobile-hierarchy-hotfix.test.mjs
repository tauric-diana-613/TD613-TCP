import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_RESPONSIVE_HIERARCHY_SPECIMEN_SCHEMA,
  compilePedagogueResponsiveHierarchyDiagnosis
} from '../app/engine/pedagogue-responsive-hierarchy-diagnosis.js';

const css = fs.readFileSync('app/giving/history/giving-20260819-mobile-hotfix.css', 'utf8');
const bootstrap = fs.readFileSync('app/giving/history/giving-bootstrap.js', 'utf8');
const sentinel = fs.readFileSync('scripts/giving-20260818-repair-browser-sentinel.js', 'utf8');
const classifier = fs.readFileSync('scripts/classify-validation-scope.mjs', 'utf8');

const diagnosis = compilePedagogueResponsiveHierarchyDiagnosis({
  schema: PEDAGOGUE_RESPONSIVE_HIERARCHY_SPECIMEN_SCHEMA,
  surface_reference: 'Giving mobile date + committee-filter screenshot reprocess · 2026-08-19',
  specimen_kind: 'FAILED_MOBILE_HIERARCHY_REPROCESS',
  observed: {
    temporal_constraint_visual_dominance: true,
    secondary_constraint_visual_dominance: true,
    native_temporal_semantics_required: true,
    route_affordance_must_remain_explicit: true
  },
  constraints: {
    implementation_this_round: true,
    preserve_native_accessibility: true,
    preserve_route_affordance: true
  }
});

const findingCodes = new Set(diagnosis.findings.map((item) => item.code));
const recommendationCodes = new Set(diagnosis.recommendations.map((item) => item.code));
for (const code of [
  'TEMPORAL_CONSTRAINT_OVERSTATEMENT',
  'SECONDARY_CONSTRAINT_OVERSTATEMENT',
  'NATIVE_TEMPORAL_SEMANTICS_PROTECTIVE',
  'COMPRESSION_MUST_NOT_HIDE_ROUTE'
]) assert.ok(findingCodes.has(code), `Pedagogue must diagnose ${code}`);
for (const code of [
  'QUIET_TEMPORAL_CONSTRAINT',
  'COMPRESS_OPTIONAL_CONSTRAINT',
  'PRESERVE_NATIVE_DATE_BEHAVIOR',
  'KEEP_COMPACT_ROUTE_EXPLICIT'
]) assert.ok(recommendationCodes.has(code), `Pedagogue must recommend ${code}`);
assert.equal(diagnosis.synthesis.implementation_this_round, true);
assert.equal(diagnosis.authority.product_mutation_authorized, false);
assert.equal(diagnosis.authority.automatic_redesign, false);
assert.equal(diagnosis.authority.automatic_release, false);
assert.equal(diagnosis.authority.human_closure_required, true);
assert.match(classifier, /pedagogue-responsive-hierarchy-diagnosis\.js/, 'generic responsive Pedagogue operator must remain scope-neutral');

assert.match(bootstrap, /GIVING_MOBILE_HOTFIX_EPOCH = '20260819-1'/, 'mobile hotfix must carry a fresh asset epoch');
assert.match(bootstrap, /giving20260819MobileHotfixStylesheet/, 'Pedagogue mobile hotfix stylesheet must load through Giving bootstrap');
assert.match(bootstrap, /giving-20260819-mobile-hotfix\.css/, 'mobile hotfix stylesheet path must be explicit');

assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important/, 'date pair must remain side by side');
assert.match(css, /height: 34px !important/, 'date controls must remain compact');
assert.match(css, /border-radius: 0 !important/, 'date controls must not return to rounded chambers');
assert.match(css, /background: transparent !important/, 'date controls must not carry card-like fill');
assert.match(css, /box-shadow: none !important/, 'date controls must not carry inset/card shadow');
assert.match(css, /font-size: 16px !important/, 'mobile date values must retain platform-safe text size');
assert.match(css, /-webkit-appearance: none/, 'native date semantics may keep their input type while ornamental browser chrome is neutralized');
assert.match(css, /giving-date-presets[\s\S]*justify-content: center !important/, 'Quick Start must remain centered below the date pair');

assert.match(css, /committee-context-filter\[data-repair-placement="before-filing-sources"\][\s\S]*grid-template-columns: minmax\(0, 1fr\) auto minmax\(0, 1fr\)/, 'committee filter must be recomposed as a compact modifier band');
assert.match(css, /label small[\s\S]*display: none !important/, 'long committee teaching copy must be demoted on mobile');
assert.match(css, /committee-filter-jump[\s\S]*grid-column: 2[\s\S]*justify-self: center !important/, 'committee route must remain visibly centered');
assert.match(css, /committee-filter-summary[\s\S]*text-overflow: ellipsis/, 'loaded-context status must stay subordinate rather than grow the panel');
assert.doesNotMatch(css, /committee-context-filter[^}]*border: 1px solid/, 'mobile committee modifier must not return to full card framing');

assert.match(sentinel, /item\.height <= 38/, 'browser witness must reject tall date chambers');
assert.match(sentinel, /filterRect\.height <= 82/, 'browser witness must reject subsection-sized committee modifiers');
assert.match(sentinel, /helperDemoted/, 'browser witness must verify mobile helper demotion');
assert.match(sentinel, /quietDateChrome/, 'browser witness must verify date chrome remains quiet');

console.log(JSON.stringify({
  suite: 'giving-20260819-mobile-hierarchy-hotfix',
  status: 'PASS',
  pedagogue: {
    findings: [...findingCodes],
    recommendations: [...recommendationCodes],
    product_mutation_authority: diagnosis.authority.product_mutation_authorized
  },
  geometry: ['quiet-native-dates', 'compact-secondary-constraint', 'explicit-route', 'bounded-runtime-witness']
}, null, 2));
