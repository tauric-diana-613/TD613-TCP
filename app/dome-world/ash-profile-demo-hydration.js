const ASH_RELEASE_ASSET_EPOCH = '20260726-a15-empirical-v1';

// Provider provenance retained beneath the registry boundary:
// ash-apeq-paia-profile-demos.js · ash-research-demo-hydration.js · ash-legal-profile-demo.js · ash-archive-profile-demo.js · ash-demo-pedagogy-rehydration.js · ash-a15-empirical-profile-journeys.js
// These modules retain fixture or empirical interpretation authority. They are admitted dynamically by ash-demo-registry.js and do not own the shared Start Demo gesture.

export {
  ASH_DEMO_REGISTRY_VERSION,
  ASH_DEMO_ASSET_EPOCH,
  getAshDemoRegistrySnapshot,
  getAshDemoRegistryEntries,
  buildAshDemoFixture,
  hydrateAshDemo,
  installAshDemoRegistry
} from './ash-demo-registry.js?v=20260726-a15-empirical-v1';

import {
  ASH_DEMO_REGISTRY_VERSION,
  getAshDemoRegistrySnapshot,
  buildAshDemoFixture,
  hydrateAshDemo,
  installAshDemoRegistry
} from './ash-demo-registry.js?v=20260726-a15-empirical-v1';

export const ASH_PROFILE_DEMO_VERSION = ASH_DEMO_REGISTRY_VERSION;
export const ASH_PROFILE_DEMOS = getAshDemoRegistrySnapshot();
export const installApeqPaiaProfileDemos = installAshDemoRegistry;
export const installLegalMatterDemo = installAshDemoRegistry;
export const installAshResearchDemo = installAshDemoRegistry;
export const installArchiveDemo = installAshDemoRegistry;
export const hydrateApeqPaiaProfileDemo = profile => hydrateAshDemo(profile);
export const hydrateLegalMatterDemo = () => hydrateAshDemo('legal');
export const hydrateResearchDemo = () => hydrateAshDemo('research');
export const hydrateArchiveDemo = () => hydrateAshDemo('archive');
export const rehydrateCurrentApeqPaiaDemo = async () => null;
export const rehydrateLegalMatterDemo = async () => null;
export const rehydrateArchiveDemo = async () => null;
export const buildApeqPaiaProfileFixture = profile => buildAshDemoFixture(profile);
export const buildLegalMatterDemoFixture = () => buildAshDemoFixture('legal');
export const buildResearchFixture = () => buildAshDemoFixture('research');
export const buildArchiveDemoFixture = () => buildAshDemoFixture('archive');

void ASH_RELEASE_ASSET_EPOCH;
