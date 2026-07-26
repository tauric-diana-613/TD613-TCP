export const ASH_A15_PROFILE_ROUTE_STRESS_VERSION = 'td613.ash.a15-profile-route-stress/v0.1';
export const ASH_A15_REGISTRY_VERSION = 'td613.ash.demo-registry/v0.3-a15';
export const ASH_A15_ASSET_EPOCH = '20260726-a15-release-v1';

export const ASH_A15_PROFILES = Object.freeze([
  'investigation','political_campaign','fundraiser','research','legal','archive'
]);
export const ASH_A15_WORKSPACES = Object.freeze(['home','map','work','choir','capsule']);
export const ASH_A15_AIA_ROUTES = Object.freeze(['experimental','custodial','audit','implementation']);

const PROFILE_LANGUAGE = Object.freeze({
  investigation:'evidence, alternatives, missingness, and source posture',
  political_campaign:'campaign facts, compliance boundaries, persuasion claims, and human authorization',
  fundraiser:'donor context, ask preparation, compliance boundaries, and human authorization',
  research:'sources, methods, uncertainty, alternatives, and reproducibility',
  legal:'deadlines, evidence, privilege boundaries, alternatives, and human legal review',
  archive:'provenance, restrictions, embargoes, derivatives, and access authority'
});

const WORKSPACE_PURPOSE = Object.freeze({
  home:'orient the operator to the bounded synthetic case',
  map:'make relations and unresolved provenance inspectable',
  work:'stage bounded next work without performing it',
  choir:'compare routes and residue without converting either into truth',
  capsule:'preserve continuity without export, transfer, filing, publication, or release'
});

const ROUTE_POSTURE = Object.freeze({
  experimental:'compare a reversible synthetic possibility',
  custodial:'preserve custody, source, and access boundaries',
  audit:'inspect claims, gaps, contradictions, and receipts',
  implementation:'prepare a human-reviewed action plan while execution remains held'
});

const FORBIDDEN_CLAIMS = Object.freeze([
  'real_person_identified','real_world_fact_asserted','sensitive_content_imported','custody_transferred',
  'release_granted','publication_performed','filing_performed','deployment_authorized','human_decision_replaced'
]);

function requireMember(value, allowed, label) {
  if (!allowed.includes(value)) throw new Error(`Unsupported A15 ${label}: ${value}`);
  return value;
}

export function compileA15WorldAnswer({ profile, workspace, route, action = 'inspect' }) {
  requireMember(profile, ASH_A15_PROFILES, 'profile');
  requireMember(workspace, ASH_A15_WORKSPACES, 'workspace');
  requireMember(route, ASH_A15_AIA_ROUTES, 'route');
  const answer = Object.freeze({
    schema:'td613.ash.a15-world-answer/v0.1',
    registry_version:ASH_A15_REGISTRY_VERSION,
    asset_epoch:ASH_A15_ASSET_EPOCH,
    profile, workspace, route, action:String(action || 'inspect'),
    message:`${profile} · ${workspace} · ${route}: ${ROUTE_POSTURE[route]}; ${WORKSPACE_PURPOSE[workspace]}; attend to ${PROFILE_LANGUAGE[profile]}.`,
    profile_language:PROFILE_LANGUAGE[profile],
    workspace_purpose:WORKSPACE_PURPOSE[workspace],
    route_posture:ROUTE_POSTURE[route],
    ontology_scope:'SYNTHETIC_PROFILE_LOCAL',
    sensitive_import:false,
    real_world_claim:false,
    automatic_consequential_action:false,
    custody_changed:false,
    source_bytes_moved:false,
    release_authority:false,
    human_review_required:true,
    forbidden_claims:FORBIDDEN_CLAIMS
  });
  return answer;
}

export function compileA15StressMatrix(action = 'inspect') {
  return Object.freeze(ASH_A15_PROFILES.flatMap(profile =>
    ASH_A15_WORKSPACES.flatMap(workspace =>
      ASH_A15_AIA_ROUTES.map(route => compileA15WorldAnswer({ profile, workspace, route, action }))
    )
  ));
}

export function verifyA15StressMatrix(matrix = compileA15StressMatrix()) {
  if (matrix.length !== 120) throw new Error(`A15 matrix requires 120 answers; observed ${matrix.length}.`);
  const signatures = new Set();
  const profileLanguages = new Map();
  for (const answer of matrix) {
    const signature = `${answer.profile}/${answer.workspace}/${answer.route}`;
    if (signatures.has(signature)) throw new Error(`Duplicate A15 journey ${signature}.`);
    signatures.add(signature);
    if (answer.real_world_claim || answer.sensitive_import || answer.custody_changed || answer.source_bytes_moved || answer.release_authority || answer.automatic_consequential_action) {
      throw new Error(`A15 authority ceiling breached at ${signature}.`);
    }
    profileLanguages.set(answer.profile, answer.profile_language);
  }
  if (new Set(profileLanguages.values()).size !== ASH_A15_PROFILES.length) throw new Error('A15 profile language collapsed across domains.');
  return Object.freeze({
    ok:true,
    schema:'td613.ash.a15-stress-receipt/v0.1',
    journeys:matrix.length,
    profiles:ASH_A15_PROFILES.length,
    workspaces:ASH_A15_WORKSPACES.length,
    routes:ASH_A15_AIA_ROUTES.length,
    ontology_leakage:false,
    false_real_world_claims:false,
    sensitive_import:false,
    authority_changed:false,
    source_bytes_moved:false,
    human_review_required:true
  });
}

const host = globalThis.window;
if (host) {
  const api = Object.freeze({
    version:ASH_A15_PROFILE_ROUTE_STRESS_VERSION,
    registry_version:ASH_A15_REGISTRY_VERSION,
    asset_epoch:ASH_A15_ASSET_EPOCH,
    profiles:ASH_A15_PROFILES,
    workspaces:ASH_A15_WORKSPACES,
    routes:ASH_A15_AIA_ROUTES,
    compile:compileA15WorldAnswer,
    matrix:compileA15StressMatrix,
    verify:verifyA15StressMatrix,
    authority:Object.freeze({ custody_changed:false, source_bytes_moved:false, release_authority:false, automatic_action:false, human_review_required:true })
  });
  host.__td613AshA15ProfileRouteStress = api;
  host.dispatchEvent?.(new CustomEvent('td613:ash:a15-profile-route-stress-ready', { detail:verifyA15StressMatrix() }));
}
