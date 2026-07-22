export const DEFAULT_ASSET_ATTEMPTS = 24;
export const DEFAULT_ASSET_DELAY_MS = 5000;

export const WAVE_A_ASSETS = Object.freeze([
  Object.freeze({
    path: '/safe-harbor/',
    source_file: 'app/safe-harbor/index.html',
    markers: Object.freeze(['TD613 Safe Harbor', 'ingressStepInput', 'mintStagedPacket']),
    cache: /no-store/u
  }),
  Object.freeze({
    path: '/safe-harbor/app/safe-harbor-gen3-evidence-contract.js',
    source_file: 'app/safe-harbor/app/safe-harbor-gen3-evidence-contract.js',
    markers: Object.freeze(['td613.safe-harbor.authorship-evidence/v1', 'validateGen3ShiExactMatch', 'historical_example']),
    cache: /max-age=0/u
  }),
  Object.freeze({
    path: '/safe-harbor/app/safe-harbor-gen3-authorship-maturity.js',
    source_file: 'app/safe-harbor/app/safe-harbor-gen3-authorship-maturity.js',
    markers: Object.freeze(['td613.safe-harbor.authorship-maturity/v1', 'buildStage2AuthorshipMaturity', 'prompt_vocabulary_excluded_from_authorship_features']),
    cache: /max-age=0/u
  }),
  Object.freeze({
    path: '/safe-harbor/app/safe-harbor-gen3-stage2-controls.js',
    source_file: 'app/safe-harbor/app/safe-harbor-gen3-stage2-controls.js',
    markers: Object.freeze(['td613.safe-harbor.stage2-control-receipt/v1', 'chronology_destruction', 'adverse_results_preserved']),
    cache: /max-age=0/u
  }),
  Object.freeze({
    path: '/safe-harbor/app/safe-harbor-native-finalizer.js',
    source_file: 'app/safe-harbor/app/safe-harbor-native-finalizer.js',
    markers: Object.freeze(['applyGen3Stage1Prehash', 'applyControlledGen3Stage2Prehash', 'includeGen3Stage2']),
    cache: /max-age=0/u
  }),
  Object.freeze({
    path: '/safe-harbor/app/safe-harbor-packet-pipeline.js',
    source_file: 'app/safe-harbor/app/safe-harbor-packet-pipeline.js',
    markers: Object.freeze(['attachStage2InterpretiveReport', 'attachStage2ControlReport', 'includeGen3Stage2: true']),
    cache: /max-age=0/u
  })
]);
