import * as core from './ash-kernel-adapter-core.js';

export * from './ash-kernel-adapter-core.js';

const PRIVATE_SURFACE = new Set(['state', 'sequence']);

export async function createAshKernelAdapter(fixture, options = {}) {
  const target = await core.createAshKernelAdapter(fixture, options);
  return new Proxy(target, {
    get(object, property) {
      if (PRIVATE_SURFACE.has(property)) return undefined;
      const value = Reflect.get(object, property, object);
      return typeof value === 'function' ? value.bind(object) : value;
    },
    set(object, property, value) {
      if (PRIVATE_SURFACE.has(property)) throw new TypeError(`A15-R0 ${String(property)} is private governance state.`);
      return Reflect.set(object, property, value, object);
    },
    defineProperty(object, property, descriptor) {
      if (PRIVATE_SURFACE.has(property)) throw new TypeError(`A15-R0 ${String(property)} is private governance state.`);
      return Reflect.defineProperty(object, property, descriptor);
    },
    deleteProperty(object, property) {
      if (PRIVATE_SURFACE.has(property)) throw new TypeError(`A15-R0 ${String(property)} is private governance state.`);
      return Reflect.deleteProperty(object, property);
    },
    has(object, property) {
      return PRIVATE_SURFACE.has(property) ? false : Reflect.has(object, property);
    },
    ownKeys(object) {
      return Reflect.ownKeys(object).filter(key => !PRIVATE_SURFACE.has(key));
    },
    getOwnPropertyDescriptor(object, property) {
      if (PRIVATE_SURFACE.has(property)) return undefined;
      return Reflect.getOwnPropertyDescriptor(object, property);
    }
  });
}
