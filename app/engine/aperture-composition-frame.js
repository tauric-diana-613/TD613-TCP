import {
  APERTURE_COMPOSITION_MANIFEST,
  installApertureComposition
} from './aperture-composition.js';

function compatibleRegistry(registry, manifest) {
  return registry?.schema === 'td613.aperture.composition-runtime/v0.1'
    && registry?.manifest?.schema === manifest.schema
    && registry?.manifest?.version === manifest.version
    && registry?.manifest?.aperture_version === manifest.aperture_version;
}

function frameScopedRoot(root) {
  return {
    crypto: root?.crypto || globalThis.crypto,
    TextEncoder: root?.TextEncoder || globalThis.TextEncoder,
    CustomEvent: root?.CustomEvent || globalThis.CustomEvent,
    dispatchEvent(event) {
      return root?.dispatchEvent?.(event) ?? true;
    }
  };
}

export async function installApertureCompositionForFrame({
  root = globalThis,
  frame,
  modules,
  manifest = APERTURE_COMPOSITION_MANIFEST,
  ...options
} = {}) {
  const hostRegistry = root?.TD613_APERTURE_COMPOSITION;
  const frameRegistry = frame?.contentWindow?.TD613_APERTURE_COMPOSITION;

  if (!hostRegistry || frameRegistry) {
    return installApertureComposition({ root, frame, modules, manifest, ...options });
  }

  if (!compatibleRegistry(hostRegistry, manifest)) {
    throw new Error('Host Aperture composition registry does not match the requested frame composition.');
  }

  const bridge = modules?.reciprocalBridge;
  if (root.TD613_PHASE4_RECIPROCAL_BRIDGE !== bridge) {
    throw new Error('Host Phase IV compatibility projection does not match the requested frame composition.');
  }

  return installApertureComposition({
    root: frameScopedRoot(root),
    frame,
    modules,
    manifest,
    ...options
  });
}
