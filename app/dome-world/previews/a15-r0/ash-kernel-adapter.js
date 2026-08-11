import * as core from './ash-kernel-adapter-core.js';

export * from './ash-kernel-adapter-core.js';

export const ASH_KERNEL_ADAPTER_OWNER_IMPORT_MARKERS = Object.freeze([
  '../../../engine/ash-keep-core.js',
  '../../../engine/ash-keep-continuity.js',
  '../../ash/canonical-json.js'
]);

const PUBLIC_METHODS = new Set([
  'snapshot',
  'bindReference',
  'formRelation',
  'compareRoute',
  'preserve',
  'returnToCustody',
  'rest',
  'resetFixture',
  'dispose'
]);
const READABLE_PROPERTIES = new Set(['fixture', 'cryptoImpl']);
const WRITABLE_PROPERTIES = new Set(['cryptoImpl']);
const PUBLIC_SURFACE = new Set([...PUBLIC_METHODS, ...READABLE_PROPERTIES]);

function privateSurfaceError(property) {
  return new TypeError(`A15-R0 ${String(property)} is private governance state and is not exposed by the public governance membrane.`);
}

export async function createAshKernelAdapter(fixture, options = {}) {
  const target = await core.createAshKernelAdapter(fixture, options);
  return new Proxy(target, {
    get(object, property) {
      if (!PUBLIC_SURFACE.has(property)) return undefined;
      const value = Reflect.get(object, property, object);
      return PUBLIC_METHODS.has(property) && typeof value === 'function' ? value.bind(object) : value;
    },
    set(object, property, value) {
      if (!WRITABLE_PROPERTIES.has(property)) throw privateSurfaceError(property);
      return Reflect.set(object, property, value, object);
    },
    defineProperty(object, property, descriptor) {
      if (!WRITABLE_PROPERTIES.has(property)) throw privateSurfaceError(property);
      return Reflect.defineProperty(object, property, descriptor);
    },
    deleteProperty(object, property) {
      throw privateSurfaceError(property);
    },
    has(object, property) {
      return PUBLIC_SURFACE.has(property);
    },
    ownKeys(object) {
      return Reflect.ownKeys(object).filter(key => READABLE_PROPERTIES.has(key));
    },
    getOwnPropertyDescriptor(object, property) {
      if (!READABLE_PROPERTIES.has(property)) return undefined;
      return Reflect.getOwnPropertyDescriptor(object, property);
    }
  });
}
