import { canonicalDigest } from '../dome-world/ash/canonical-json.js';

export const APERTURE_COMPOSITION_MANIFEST_SCHEMA = 'td613.aperture.composition-manifest/v0.1';
export const APERTURE_COMPOSITION_RUNTIME_SCHEMA = 'td613.aperture.composition-runtime/v0.1';
export const APERTURE_COMPOSITION_RECEIPT_SCHEMA = 'td613.aperture.composition-receipt/v0.1';
export const APERTURE_COMPOSITION_REPLAY_SCHEMA = 'td613.aperture.composition-replay/v0.1';
export const APERTURE_COMPOSITION_DIGEST_DOMAIN = 'TD613:APERTURE:COMPOSITION:RECEIPT:v1';

const FORBIDDEN_AUTHORITY = Object.freeze([
  'network_called',
  'storage_mutated',
  'provider_execution',
  'reader_execution',
  'release_authority',
  'recipient_transport',
  'cinder_action',
  'automatic_ash_action',
  'automatic_hold'
]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}

function assertString(value, label) {
  if (!String(value || '').trim()) throw new Error(`${label} is required.`);
}

function receiptSubject(receipt) {
  const subject = clone(receipt);
  delete subject.receipt_digest;
  return subject;
}

export const APERTURE_COMPOSITION_MANIFEST = deepFreeze({
  schema: APERTURE_COMPOSITION_MANIFEST_SCHEMA,
  version: 'v0.1',
  aperture_version: 'v3.1-alpha',
  aperture_schema: 'td613-aperture/v3.1-alpha',
  role: 'explicit-composition-for-stable-public-shim',
  canonical_body: {
    id: 'canonical-body',
    source: './tool.html',
    role: 'canonical-instrument-body',
    mutated_by_composer: false
  },
  public_shim: {
    source: './index.html',
    bootstrap: './bootstrap.js',
    role: 'stable-public-shim'
  },
  components: [
    {
      id: 'release-manifest',
      order: 10,
      module: './release.js',
      namespace: 'TD613_APERTURE_RELEASE',
      depends_on: ['canonical-body'],
      compatibility_alias: false,
      role: 'release-identity-and-capability-record'
    },
    {
      id: 'task-intent',
      order: 20,
      module: '../engine/aperture-v3-task-intent.js',
      namespace: 'TD613_APERTURE_TASK_INTENT',
      depends_on: ['release-manifest'],
      compatibility_alias: false,
      role: 'requested-synthesis-and-runtime-materiality-router'
    },
    {
      id: 'v31-compatibility',
      order: 30,
      module: '../engine/aperture-v31-compatibility.js',
      namespace: 'TD613_APERTURE_V31_COMPATIBILITY',
      depends_on: ['release-manifest', 'task-intent'],
      compatibility_alias: false,
      role: 'frozen-v30-receipt-projection'
    },
    {
      id: 'phase4-reciprocal-bridge',
      order: 40,
      module: '../engine/aperture-v3-reciprocal-bridge.js',
      namespace: 'TD613_PHASE4_RECIPROCAL_BRIDGE',
      depends_on: ['release-manifest', 'task-intent', 'v31-compatibility'],
      compatibility_alias: true,
      ready_event: 'td613:phase4-reciprocal-bridge-ready',
      role: 'reciprocal-receipts-without-reciprocal-authority'
    }
  ],
  ready_event: 'td613:aperture-composition-ready',
  held_event: 'td613:aperture-composition-held',
  boundaries: {
    network_called: false,
    storage_mutated: false,
    provider_execution: false,
    reader_execution: false,
    release_authority: false,
    recipient_transport: false,
    cinder_action: false,
    automatic_ash_action: false,
    automatic_hold: false,
    canonical_body_rewritten: false,
    compatibility_aliases_are_lineage_only: true,
    operator_closure_required: true
  }
});

export function validateApertureCompositionManifest(manifest = APERTURE_COMPOSITION_MANIFEST) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new TypeError('Aperture composition manifest must be an object.');
  }
  if (manifest.schema !== APERTURE_COMPOSITION_MANIFEST_SCHEMA) throw new Error('Unsupported Aperture composition manifest schema.');
  if (manifest.version !== 'v0.1') throw new Error('Unsupported Aperture composition version.');
  if (manifest.aperture_version !== 'v3.1-alpha') throw new Error('Composition must preserve the v3.1-alpha identity.');
  if (manifest.aperture_schema !== 'td613-aperture/v3.1-alpha') throw new Error('Composition Aperture schema mismatch.');
  if (manifest.canonical_body?.source !== './tool.html') throw new Error('Canonical Aperture body must remain ./tool.html.');
  if (manifest.canonical_body?.mutated_by_composer !== false) throw new Error('Composer may not rewrite the canonical Aperture body.');
  if (manifest.public_shim?.source !== './index.html' || manifest.public_shim?.bootstrap !== './bootstrap.js') {
    throw new Error('Composition public shim or bootstrap mismatch.');
  }
  if (!Array.isArray(manifest.components) || manifest.components.length < 1) throw new Error('Composition requires declared components.');

  const ids = new Set(['canonical-body']);
  const namespaces = new Set();
  let lastOrder = 0;
  for (const component of manifest.components) {
    assertString(component.id, 'Component id');
    assertString(component.module, `Component ${component.id} module`);
    assertString(component.namespace, `Component ${component.id} namespace`);
    if (ids.has(component.id)) throw new Error(`Duplicate Aperture composition component: ${component.id}`);
    if (namespaces.has(component.namespace)) throw new Error(`Duplicate Aperture composition namespace: ${component.namespace}`);
    if (!Number.isSafeInteger(component.order) || component.order <= lastOrder) {
      throw new Error('Aperture composition component order must be strictly increasing safe integers.');
    }
    for (const dependency of component.depends_on || []) {
      if (!ids.has(dependency)) throw new Error(`Component ${component.id} depends on unavailable component ${dependency}.`);
    }
    ids.add(component.id);
    namespaces.add(component.namespace);
    lastOrder = component.order;
  }

  if (!ids.has('phase4-reciprocal-bridge')) throw new Error('Phase IV reciprocal bridge must remain explicitly composed.');
  if (manifest.ready_event !== 'td613:aperture-composition-ready') throw new Error('Composition ready event mismatch.');
  if (manifest.held_event !== 'td613:aperture-composition-held') throw new Error('Composition held event mismatch.');
  for (const key of FORBIDDEN_AUTHORITY) {
    if (manifest.boundaries?.[key] !== false) throw new Error(`Aperture composition may not acquire ${key}.`);
  }
  if (manifest.boundaries?.canonical_body_rewritten !== false) throw new Error('Composition may not rewrite the canonical body.');
  if (manifest.boundaries?.operator_closure_required !== true) throw new Error('Aperture composition requires operator closure.');
  return true;
}

export async function compileApertureCompositionReceipt({
  manifest = APERTURE_COMPOSITION_MANIFEST,
  frame_id = 'td613ApertureTool',
  installed_components = null,
  compatibility_aliases = null,
  idempotent_reuse = false,
  created_at = null,
  cryptoImpl = globalThis.crypto,
  TextEncoderImpl = globalThis.TextEncoder
} = {}) {
  validateApertureCompositionManifest(manifest);
  const componentIds = installed_components || manifest.components.map(component => component.id);
  const aliases = compatibility_aliases || manifest.components
    .filter(component => component.compatibility_alias)
    .map(component => component.namespace);
  const manifest_digest = await canonicalDigest(
    'TD613:APERTURE:COMPOSITION:MANIFEST:v1',
    manifest,
    { cryptoImpl, TextEncoderImpl }
  );
  const base = {
    schema: APERTURE_COMPOSITION_RECEIPT_SCHEMA,
    receipt_id: null,
    created_at,
    source_status: 'VALIDATION_GATED',
    status: 'COMPOSITION_VALIDATED',
    manifest_schema: manifest.schema,
    manifest_version: manifest.version,
    manifest_digest,
    aperture_version: manifest.aperture_version,
    aperture_schema: manifest.aperture_schema,
    frame_id: String(frame_id || 'td613ApertureTool'),
    installed_components: [...componentIds],
    compatibility_aliases: [...aliases],
    idempotent_reuse: idempotent_reuse === true,
    boundaries: clone(manifest.boundaries),
    receipt_digest: null
  };
  const seed = await canonicalDigest(APERTURE_COMPOSITION_DIGEST_DOMAIN, receiptSubject(base), { cryptoImpl, TextEncoderImpl });
  base.receipt_id = `apcomp_${seed.slice(-20)}`;
  base.receipt_digest = await canonicalDigest(APERTURE_COMPOSITION_DIGEST_DOMAIN, receiptSubject(base), { cryptoImpl, TextEncoderImpl });
  return deepFreeze(base);
}

export async function replayApertureCompositionReceipt(receipt, options = {}) {
  if (!receipt || receipt.schema !== APERTURE_COMPOSITION_RECEIPT_SCHEMA) {
    throw new Error('Unsupported Aperture composition receipt.');
  }
  const expected = await canonicalDigest(APERTURE_COMPOSITION_DIGEST_DOMAIN, receiptSubject(receipt), options);
  const valid = expected === receipt.receipt_digest;
  return deepFreeze({
    schema: APERTURE_COMPOSITION_REPLAY_SCHEMA,
    receipt_reference: receipt.receipt_id || null,
    receipt_digest: receipt.receipt_digest || null,
    expected_receipt_digest: expected,
    status: valid ? 'COMPOSITION_REPLAY_VERIFIED' : 'COMPOSITION_REPLAY_HOLD',
    manifest_reloaded: false,
    modules_reexecuted: false,
    frame_reloaded: false,
    network_called: false,
    storage_mutated: false,
    release_authority: false,
    recipient_transport: false,
    cinder_action: false
  });
}

function defineReadonly(target, key, value) {
  const existing = Object.getOwnPropertyDescriptor(target, key);
  if (existing && existing.value === value) return;
  if (existing && existing.configurable === false) throw new Error(`Composition namespace is already sealed: ${key}`);
  Object.defineProperty(target, key, {
    value,
    configurable: false,
    enumerable: true,
    writable: false
  });
}

function dispatch(target, name, detail, CustomEventImpl) {
  if (!target?.dispatchEvent || typeof CustomEventImpl !== 'function') return;
  target.dispatchEvent(new CustomEventImpl(name, { detail }));
}

export async function installApertureComposition({
  root = globalThis,
  frame = null,
  modules = {},
  manifest = APERTURE_COMPOSITION_MANIFEST,
  CustomEventImpl = root?.CustomEvent || globalThis.CustomEvent,
  cryptoImpl = root?.crypto || globalThis.crypto,
  TextEncoderImpl = root?.TextEncoder || globalThis.TextEncoder,
  created_at = null
} = {}) {
  validateApertureCompositionManifest(manifest);
  const frameWindow = frame?.contentWindow;
  if (!frameWindow) throw new Error('Aperture composition requires the canonical iframe window.');
  if (modules.release?.version !== manifest.aperture_version || modules.release?.apertureSchema !== manifest.aperture_schema) {
    throw new Error('Aperture release identity does not match the composition manifest.');
  }

  const existing = frameWindow.TD613_APERTURE_COMPOSITION;
  if (existing) {
    if (existing.manifest?.version !== manifest.version || existing.manifest?.aperture_version !== manifest.aperture_version) {
      throw new Error('A different Aperture composition is already installed.');
    }
    return compileApertureCompositionReceipt({
      manifest,
      frame_id: frame.id || 'td613ApertureTool',
      installed_components: existing.installed_components,
      compatibility_aliases: existing.compatibility_aliases,
      idempotent_reuse: true,
      created_at,
      cryptoImpl,
      TextEncoderImpl
    });
  }

  const values = {
    'release-manifest': modules.release,
    'task-intent': modules.taskIntent,
    'v31-compatibility': modules.compatibility,
    'phase4-reciprocal-bridge': modules.reciprocalBridge
  };
  const installed = [];
  const aliases = [];
  for (const component of manifest.components) {
    const value = values[component.id];
    if (!value) throw new Error(`Composition module unavailable: ${component.id}`);
    defineReadonly(frameWindow, component.namespace, value);
    if (component.compatibility_alias) {
      defineReadonly(root, component.namespace, value);
      aliases.push(component.namespace);
    }
    installed.push(component.id);
    if (component.ready_event) {
      dispatch(frameWindow, component.ready_event, { schema: value.schema || null, component: component.id }, CustomEventImpl);
    }
  }

  const registry = deepFreeze({
    schema: APERTURE_COMPOSITION_RUNTIME_SCHEMA,
    manifest,
    installed_components: [...installed],
    compatibility_aliases: [...aliases],
    authority_transfer: false,
    canonical_body_rewritten: false
  });
  defineReadonly(frameWindow, 'TD613_APERTURE_COMPOSITION', registry);
  defineReadonly(root, 'TD613_APERTURE_COMPOSITION', registry);
  if (frame.dataset) frame.dataset.apertureComposition = manifest.version;
  dispatch(frameWindow, manifest.ready_event, {
    schema: registry.schema,
    manifest_schema: manifest.schema,
    manifest_version: manifest.version,
    installed_components: installed
  }, CustomEventImpl);

  return compileApertureCompositionReceipt({
    manifest,
    frame_id: frame.id || 'td613ApertureTool',
    installed_components: installed,
    compatibility_aliases: aliases,
    created_at,
    cryptoImpl,
    TextEncoderImpl
  });
}
