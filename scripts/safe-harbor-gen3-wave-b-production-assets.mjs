import {
  DEFAULT_ASSET_ATTEMPTS,
  DEFAULT_ASSET_DELAY_MS,
  WAVE_A_ASSETS
} from './safe-harbor-gen3-wave-a-production-assets.mjs';

export { DEFAULT_ASSET_ATTEMPTS, DEFAULT_ASSET_DELAY_MS };

const STAGE3_ASSETS = Object.freeze([
  Object.freeze({
    path: '/safe-harbor/',
    source_file: 'app/safe-harbor/index.html',
    markers: Object.freeze([
      'id="temporalBloom"',
      'id="temporalBloomRecognition"',
      'id="stage3ProvenancePanel"',
      'id="stage3CountersignButton"',
      'safe-harbor-temporal-bloom.js'
    ]),
    cache: /no-store/u
  }),
  Object.freeze({
    path: '/safe-harbor/app/safe-harbor-gen3-presentation-core.js',
    source_file: 'app/safe-harbor/app/safe-harbor-gen3-presentation-core.js',
    markers: Object.freeze([
      'td613.safe-harbor.temporal-bloom/v1',
      'td613.safe-harbor.provenance-presentation/v1',
      'td613.safe-harbor.pua-provenance-attestation/v1',
      'TEMPORAL_MATURE_WORDS = 360',
      'validateShiSurfaces',
      'buildDeterministicAttestationSvg'
    ]),
    cache: /max-age=0/u
  }),
  Object.freeze({
    path: '/safe-harbor/app/safe-harbor-temporal-bloom.js',
    source_file: 'app/safe-harbor/app/safe-harbor-temporal-bloom.js',
    markers: Object.freeze([
      'td613:safe-harbor:stage3-state',
      'td613:safe-harbor:countersign-request',
      'safe-harbor-main-counted-state',
      'independent_tokenization_performed: false',
      'telemetry_collected: false'
    ]),
    cache: /max-age=0/u
  }),
  Object.freeze({
    path: '/safe-harbor/app/safe-harbor-temporal-bloom.css',
    source_file: 'app/safe-harbor/app/safe-harbor-temporal-bloom.css',
    markers: Object.freeze([
      '@media (prefers-reduced-motion: reduce)',
      'animation: none !important',
      '@supports (-webkit-touch-callout: none)',
      'font-size: 16px'
    ]),
    cache: /max-age=0/u
  }),
  Object.freeze({
    path: '/safe-harbor/renderers/10_TD613_PUA_Badge_Provenance_Attestation_Renderer_v7_2_1.user.js',
    source_file: 'app/safe-harbor/renderers/10_TD613_PUA_Badge_Provenance_Attestation_Renderer_v7_2_1.user.js',
    markers: Object.freeze([
      'stage3-temporal-bloom-provenance/v1',
      'td613.safe-harbor.pua-provenance-attestation/v1',
      'AI IMITATION COLLISION: PRESENT',
      'AUTHORITY CLAIM REDUCED',
      'build_attestation_svg'
    ]),
    cache: /max-age=0/u
  })
]);

const deduplicated = new Map();
for (const asset of [...WAVE_A_ASSETS, ...STAGE3_ASSETS]) deduplicated.set(asset.path, asset);

export const WAVE_B_ASSETS = Object.freeze(Array.from(deduplicated.values()));