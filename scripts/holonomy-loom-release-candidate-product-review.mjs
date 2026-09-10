import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { compilePedagogueDesignReview } from '../app/engine/pedagogue-design-gate.js';

export const REVIEW_SCHEMA = 'td613.holonomy-loom.release-candidate-product-review/v0.1';
export const REVIEW_EVIDENCE_CLASS = 'MACHINE_RELEASE_CANDIDATE_PRODUCT_REVIEW';

const PRODUCT_HTML_URL = new URL('../app/dome-world/holonomy-loom.html', import.meta.url);
const ENGINE_URL = new URL('../app/dome-world/holonomy-loom/engine.js', import.meta.url);
const PEDAGOGUE_FIXTURE_URL = new URL('../tests/fixtures/pedagogue/holonomy-loom-hosted-observer-geometry-design.json', import.meta.url);

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function hasAll(text, needles) {
  return needles.every(needle => text.includes(needle));
}

function parseCandidateClaimCeiling(engine) {
  const declarationStartPattern = /export\s+const\s+HOLONOMY_LOOM_CLAIM_CEILING\b/g;
  const declarationStarts = [...engine.matchAll(declarationStartPattern)];
  if (declarationStarts.length !== 1) {
    throw new Error('R1.4 candidate engine must define exactly one HOLONOMY_LOOM_CLAIM_CEILING export');
  }

  const declarationPattern = /export\s+const\s+HOLONOMY_LOOM_CLAIM_CEILING\s*=\s*Object\.freeze\(\s*\[\s*((?:'[^'\\]*'\s*,?\s*)+)\]\s*\)\s*;/;
  const match = engine.match(declarationPattern);
  if (!match) {
    throw new Error('R1.4 HOLONOMY_LOOM_CLAIM_CEILING must be a literal Object.freeze array of unescaped single-quoted strings');
  }

  const body = match[1];
  const residue = body.replace(/'[^'\\]*'/g, '').replace(/[\s,]/g, '');
  if (residue.length !== 0) {
    throw new Error('R1.4 HOLONOMY_LOOM_CLAIM_CEILING contains non-literal syntax');
  }

  const values = [...body.matchAll(/'([^'\\]*)'/g)].map(item => item[1]);
  if (values.length === 0) {
    throw new Error('R1.4 HOLONOMY_LOOM_CLAIM_CEILING must not be empty');
  }
  return Object.freeze(values);
}

function reviewCheck(id, label, pass, detail = null) {
  return Object.freeze({ id, label, status: pass ? 'PASS' : 'FAIL', detail });
}

function section(review, id, label, checks) {
  const failures = checks.filter(item => item.status !== 'PASS');
  return Object.freeze({
    id,
    label,
    status: failures.length === 0 ? 'PASS' : 'FAIL',
    checks: Object.freeze(checks),
    failed_checks: Object.freeze(failures.map(item => item.label))
  });
}

export async function loadReleaseCandidateInputs() {
  const [html, engine, fixtureText] = await Promise.all([
    readFile(PRODUCT_HTML_URL, 'utf8'),
    readFile(ENGINE_URL, 'utf8'),
    readFile(PEDAGOGUE_FIXTURE_URL, 'utf8')
  ]);
  return { html, engine, fixture: JSON.parse(fixtureText) };
}

export async function compileHolonomyLoomReleaseCandidateReview({
  html,
  engine,
  fixture,
  repositoryHead = process.env.GITHUB_SHA || 'LOCAL_UNBOUND',
  authorityOverrides = {},
  evidenceOverrides = {}
} = {}) {
  if (typeof html !== 'string' || typeof engine !== 'string' || !fixture) {
    const loaded = await loadReleaseCandidateInputs();
    html ??= loaded.html;
    engine ??= loaded.engine;
    fixture ??= loaded.fixture;
  }

  const pedagogue = await compilePedagogueDesignReview(fixture);
  const htmlHash = sha256(html);
  const engineHash = sha256(engine);
  const visibleInstruction = 'Before you send it, check what this message carries.';
  const visibleGreen = 'Nothing matched the protection rules you turned on.';
  const redCopy = 'Stop. This message contains something your protection rules say must not leave.';
  const provenanceResemblanceCeiling = 'resemblance alone does not establish provenance';
  const provenanceCustodyCeiling = 'route-memory claims require explicit declared custody/context';
  const semanticClaimCeiling = new Set(parseCandidateClaimCeiling(engine));

  const universalPromisePatterns = [
    /guaranteed safe/i,
    /guaranteed private/i,
    /zero privacy risk/i,
    /no downstream system can leak/i,
    /chatgpt can never infer/i
  ];
  const universalPromiseFound = universalPromisePatterns.some(pattern => pattern.test(html) || pattern.test(engine));
  const promiseDetailsClosedByDefault = /<details id="promiseDisclosure">/.test(html) && !/<details id="promiseDisclosure"[^>]*\sopen(?:\s|>)/.test(html);
  const whyDetailsClosedByDefault = /<details id="whyDetails"[^>]*>/.test(html) && !/<details id="whyDetails"[^>]*\sopen(?:\s|>)/.test(html);
  const providerDetailsClosedByDefault = /<details id="providerDisclosure">/.test(html) && !/<details id="providerDisclosure"[^>]*\sopen(?:\s|>)/.test(html);

  const firstResultIndex = html.indexOf('<section id="result"');
  const firstScreen = firstResultIndex >= 0 ? html.slice(0, firstResultIndex) : html;
  const forbiddenFirstScreenTerms = ['anisotropy', '>DLP<', 'route memory', 'observability partition'];
  const technicalTaxBeforeResult = forbiddenFirstScreenTerms.some(term => firstScreen.toLowerCase().includes(term.toLowerCase()));

  const releaseBoundary = {
    merge_authority: false,
    vercel_authority: false,
    production_release_authority: false,
    provider_release_authority: false,
    ...authorityOverrides
  };
  const evidence = {
    review_evidence_class: REVIEW_EVIDENCE_CLASS,
    human_readable: true,
    human_comprehension_observed: false,
    human_operator_production_observation: false,
    product_bytes_mutated_by_review: false,
    provider_call_performed: false,
    human_closure_required: true,
    exogenous_witness_credit: 0,
    golden_egg_credit: 0,
    ...evidenceOverrides
  };

  const sections = [
    section(null, 'R0', 'Local laboratory child-legible entry', [
      reviewCheck('R0.1', 'Holonomy Loom title declared', html.includes('<h1>Holonomy Loom</h1>')),
      reviewCheck('R0.2', 'ordinary-language first instruction declared', html.includes(visibleInstruction)),
      reviewCheck('R0.3', 'SEE CHECK UNDERSTAND REST route declared', html.includes('SEE → CHECK → UNDERSTAND → REST')),
      reviewCheck('R0.4', 'CHECK THIS MESSAGE control declared', /id="check"[^>]*>CHECK THIS MESSAGE<\/button>/.test(html)),
      reviewCheck('R0.5', 'technical taxonomy not required before result', technicalTaxBeforeResult === false, { forbidden_first_screen_terms: forbiddenFirstScreenTerms })
    ]),
    section(null, 'R1', 'Bounded consequence semantics', [
      reviewCheck('R1.1', 'RED copy is exact and bounded', engine.includes(redCopy)),
      reviewCheck('R1.2', 'GREEN copy is exact and bounded', engine.includes(visibleGreen)),
      reviewCheck('R1.3', 'universal safety promises absent', universalPromiseFound === false),
      reviewCheck('R1.4a', 'resemblance alone does not establish provenance', semanticClaimCeiling.has(provenanceResemblanceCeiling), { expected: provenanceResemblanceCeiling, observation_layer: 'HOLONOMY_LOOM_CLAIM_CEILING' }),
      reviewCheck('R1.4b', 'route-memory provenance requires declared custody context', semanticClaimCeiling.has(provenanceCustodyCeiling), { expected: provenanceCustodyCeiling, observation_layer: 'HOLONOMY_LOOM_CLAIM_CEILING' })
    ]),
    section(null, 'R2', 'Action and safer-copy boundary', [
      reviewCheck('R2.1', 'KEEP CHANGE REMOVE action classes declared', hasAll(html, ['<strong>KEEP</strong>', '<strong>CHANGE</strong>', '<strong>REMOVE</strong>'])),
      reviewCheck('R2.2', 'RED remains release-blocking in engine', engine.includes("raw_release_allowed: findings.length === 0")),
      reviewCheck('R2.3', 'safer-copy route declared', html.includes('id="makeSafer"') && html.includes('MAKE A SAFER COPY')),
      reviewCheck('R2.4', 'checked-copy door remains distinct and gated', html.includes('id="copyChecked"') && html.includes('releaseAllowed=analysis.status===\'GREEN\''))
    ]),
    section(null, 'R3', 'Optional technical projection', [
      reviewCheck('R3.1', 'Show me why remains optional closed details', whyDetailsClosedByDefault),
      reviewCheck('R3.2', 'technical promise remains optional closed details', promiseDetailsClosedByDefault),
      reviewCheck('R3.3', 'stronger downstream ceiling remains declared behind disclosure', html.includes('The Loom can control what it lets leave its own door. It cannot control every room the message enters afterward.')),
      reviewCheck('R3.4', 'GREEN enabled-rule ceiling remains declared behind disclosure', html.includes('GREEN means only that no enabled Loom rule fired.'))
    ]),
    section(null, 'R4', 'Provider membrane', [
      reviewCheck('R4.1', 'provider help remains optional closed details', providerDetailsClosedByDefault),
      reviewCheck('R4.2', 'local checker declares no provider call', html.includes('No model is called by this local checker.')),
      reviewCheck('R4.3', 'provider release authority remains false', releaseBoundary.provider_release_authority === false && html.includes('data-provider-release-authority="false"')),
      reviewCheck('R4.4', 'separate AI workspace transmission is disclosed', html.includes('Its Run button sends only your task, selected documents and portable rules.') && html.includes('id="loomAiWorkspace"'))
    ]),
    section(null, 'R5', 'Rest Return Exit', [
      reviewCheck('R5.1', 'REST control declared', html.includes('id="rest"') && html.includes('>REST</button>')),
      reviewCheck('R5.2', 'RETURN route declared', html.includes('id="returnToCheck"') && html.includes('>RETURN</a>')),
      reviewCheck('R5.3', 'EXIT route declared', html.includes('id="exitLoom"') && html.includes('>EXIT</a>')),
      reviewCheck('R5.4', 'Rest copy refuses coercive continuation', html.includes('Rest. Nothing else is required. Return or exit whenever you choose.'))
    ]),
    section(null, 'R6', 'Pedagogue and Aperture posture', [
      reviewCheck('R6.1', 'Pedagogue consequence-before-ontology passes', pedagogue.design_gate?.consequence_before_ontology === true),
      reviewCheck('R6.2', 'Pedagogue Rest and Exit preserved', pedagogue.design_gate?.rest_and_exit_preserved === true),
      reviewCheck('R6.3', 'Pedagogue AIA invariants preserved', pedagogue.design_gate?.aia_invariants_preserved === true),
      reviewCheck('R6.4', 'Pedagogue route history explicit', pedagogue.design_gate?.route_history_explicit === true),
      reviewCheck('R6.5', 'Pedagogue burden non-worsening', pedagogue.design_gate?.route_burden_non_worsening === true),
      reviewCheck('R6.6', 'Pedagogue authority transfer remains false', pedagogue.aia_surface_family_report?.authority_transferred === false),
      reviewCheck('R6.7', 'AIA authority does not cross', pedagogue.aia_surface_binding?.authority?.authority_may_cross === false)
    ]),
    section(null, 'R7', 'Evidence and authority ceiling', [
      reviewCheck('R7.1', 'review evidence class is machine product review', evidence.review_evidence_class === REVIEW_EVIDENCE_CLASS),
      reviewCheck('R7.2', 'review is human-readable', evidence.human_readable === true),
      reviewCheck('R7.3', 'human comprehension remains unobserved', evidence.human_comprehension_observed === false),
      reviewCheck('R7.4', 'human production observation remains false', evidence.human_operator_production_observation === false),
      reviewCheck('R7.5', 'review does not mutate product bytes', evidence.product_bytes_mutated_by_review === false),
      reviewCheck('R7.6', 'this static review performs no provider call', evidence.provider_call_performed === false),
      reviewCheck('R7.7', 'merge authority remains false', releaseBoundary.merge_authority === false),
      reviewCheck('R7.8', 'Vercel authority remains false', releaseBoundary.vercel_authority === false),
      reviewCheck('R7.9', 'production release authority remains false', releaseBoundary.production_release_authority === false && html.includes('data-production-release="false"')),
      reviewCheck('R7.10', 'human closure remains required', evidence.human_closure_required === true),
      reviewCheck('R7.11', 'exogenous witness credit remains zero', evidence.exogenous_witness_credit === 0),
      reviewCheck('R7.12', 'Golden Egg credit remains zero', evidence.golden_egg_credit === 0)
    ])
  ];

  const failedSections = sections.filter(item => item.status !== 'PASS').map(item => item.id);
  const review = {
    schema: REVIEW_SCHEMA,
    status: failedSections.length === 0 ? 'PASS' : 'HELD',
    reviewed_repository_head: repositoryHead,
    reviewed_candidate: {
      html_path: 'app/dome-world/holonomy-loom.html',
      html_sha256: htmlHash,
      engine_path: 'app/dome-world/holonomy-loom/engine.js',
      engine_sha256: engineHash,
      parent_earned_head: 'ec84d37dcd3f67abbd3f858e53437bd4049248e4'
    },
    sections,
    failed_sections: failedSections,
    evidence,
    authority: releaseBoundary,
    pedagogue: {
      consequence_before_ontology: pedagogue.design_gate?.consequence_before_ontology === true,
      rest_and_exit_preserved: pedagogue.design_gate?.rest_and_exit_preserved === true,
      aia_invariants_preserved: pedagogue.design_gate?.aia_invariants_preserved === true,
      route_history_explicit: pedagogue.design_gate?.route_history_explicit === true,
      route_burden_non_worsening: pedagogue.design_gate?.route_burden_non_worsening === true,
      authority_transferred: pedagogue.aia_surface_family_report?.authority_transferred === true
    },
    claim_ceiling: [
      'machine-executed release-candidate product review only',
      'not human comprehension evidence',
      'not a HUMAN_OPERATOR_PRODUCTION_OBSERVATION_RECORD',
      'not production verification',
      'not deployment or release authority',
      'not downstream-platform governance',
      'not exogenous witness or Golden Egg evidence'
    ],
    preserved_red_lineage: [
      'legacy v0.1 closed-details false negative: GREEN promise remains bounded',
      'Ready run 2792 v0.2 temporal-order RED: technical promise summary remains visible while body is closed',
      'Draft run 2803 R1.4a false negative: raw-source string observer replaced by exported claim-ceiling semantic binding',
      'Draft runs 2815–2818 R3 false negative: Flow-Core NAME metadata exposed exact-tag observer brittleness; closed-details parsing widened without changing closure semantics'
    ],
    next_dependency_if_pass: 'EXPLICIT_OPERATOR_PRODUCTION_RELEASE_AUTHORIZATION_UNDER_STRATEGIC_VERCEL_DEPLOYMENT_LAW'
  };
  return Object.freeze(review);
}

export function renderHolonomyLoomReleaseCandidateReviewMarkdown(review) {
  const lines = [
    '# Holonomy Loom · Release-Candidate Product Review v0.1',
    '',
    `**Evidence class:** ${review.evidence.review_evidence_class}`,
    `**Status:** ${review.status}`,
    `**Reviewed repository head:** \`${review.reviewed_repository_head}\``,
    `**Hosted HTML SHA-256:** \`${review.reviewed_candidate.html_sha256}\``,
    `**Loom engine SHA-256:** \`${review.reviewed_candidate.engine_sha256}\``,
    '',
    '## Checklist'
  ];
  for (const item of review.sections) {
    lines.push('', `### ${item.id} · ${item.label} — ${item.status}`);
    for (const check of item.checks) lines.push(`- [${check.status === 'PASS' ? 'x' : ' '}] ${check.id} · ${check.label}`);
  }
  lines.push(
    '',
    '## Claim ceiling',
    ...review.claim_ceiling.map(item => `- ${item}`),
    '',
    '## Preserved RED lineage',
    ...review.preserved_red_lineage.map(item => `- ${item}`),
    '',
    '## Authority',
    `- merge_authority: ${review.authority.merge_authority}`,
    `- vercel_authority: ${review.authority.vercel_authority}`,
    `- production_release_authority: ${review.authority.production_release_authority}`,
    `- provider_release_authority: ${review.authority.provider_release_authority}`,
    `- human_comprehension_observed: ${review.evidence.human_comprehension_observed}`,
    `- human_operator_production_observation: ${review.evidence.human_operator_production_observation}`,
    `- human_closure_required: ${review.evidence.human_closure_required}`,
    `- exogenous_witness_credit: ${review.evidence.exogenous_witness_credit}`,
    `- golden_egg_credit: ${review.evidence.golden_egg_credit}`,
    '',
    '## Next dependency if PASS',
    review.next_dependency_if_pass,
    '',
    '> This packet is machine-executed and human-readable. It is not evidence that a human understood the product, not a production observation, and not release authorization.',
    ''
  );
  return lines.join('\n');
}

export async function compileDefaultHolonomyLoomReleaseCandidateReview(options = {}) {
  const inputs = await loadReleaseCandidateInputs();
  return compileHolonomyLoomReleaseCandidateReview({ ...inputs, ...options });
}