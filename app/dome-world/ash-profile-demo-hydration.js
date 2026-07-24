const ASH_RELEASE_ASSET_EPOCH = '20260724-a13-release-v1';

import './ash-demo-registry-preflight.js?v=20260724-a13-release-v1';

export {
  ASH_APEQ_PAIA_PROFILE_DEMOS_VERSION as ASH_PROFILE_DEMO_VERSION,
  ASH_APEQ_PAIA_PROFILE_DEMOS as ASH_PROFILE_DEMOS,
  buildApeqPaiaProfileFixture,
  hydrateApeqPaiaProfileDemo,
  rehydrateCurrentApeqPaiaDemo,
  installApeqPaiaProfileDemos
} from './ash-apeq-paia-profile-demos.js?v=20260724-a13-release-v1';

export {
  ASH_LEGAL_DEMO_VERSION,
  buildLegalMatterDemoFixture,
  hydrateLegalMatterDemo,
  rehydrateLegalMatterDemo,
  installLegalMatterDemo
} from './ash-legal-profile-demo.js?v=20260724-a13-release-v1';

export {
  ASH_RESEARCH_DEMO_VERSION,
  ASH_RESEARCH_SURFACE_LEDGER_VERSION,
  ASH_RESEARCH_SURFACE_PLAN,
  buildResearchFixture,
  auditResearchSurfaces,
  hydrateResearchDemo,
  installAshResearchDemo
} from './ash-research-demo-hydration.js?v=20260724-a13-release-v1';

export {
  ASH_DEMO_PEDAGOGY_VERSION,
  ASH_DEMO_PEDAGOGY_MANIFESTS,
  installAshDemoPedagogy
} from './ash-demo-pedagogy-rehydration.js?v=20260724-a13-release-v1';

export {
  ASH_DEMO_REGISTRY_VERSION,
  ASH_DEMO_REGISTRY_ASSET_EPOCH,
  ASH_DEMO_REGISTRY,
  ASH_NON_PROMOTED_PROFILES,
  currentAshDemoRegistrySelection,
  reconcileAshDemoRegistry,
  hydrateSelectedAshDemo,
  registerAshDemoAdapter,
  installAshDemoRegistry
} from './ash-demo-registry.js?v=20260724-a13-release-v1';

import './ash-apeq-paia-profile-demos.js?v=20260724-a13-release-v1';
import './ash-legal-profile-demo.js?v=20260724-a13-release-v1';
import './ash-research-demo-hydration.js?v=20260724-a13-release-v1';
import './ash-demo-pedagogy-rehydration.js?v=20260724-a13-release-v1';
import './ash-demo-registry.js?v=20260724-a13-release-v1';

void ASH_RELEASE_ASSET_EPOCH;
