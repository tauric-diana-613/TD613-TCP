(function () {
  'use strict';

  const games = new Map();
  const assays = new Map();
  const consequences = new Map();
  const listeners = new Map();
  const ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;

  function boundedString(value, field, maxLength) {
    if (typeof value !== 'string') throw new TypeError(`${field} must be a string`);
    const text = value.trim();
    if (!text || text.length > maxLength) {
      throw new RangeError(`${field} must contain 1-${maxLength} characters`);
    }
    return text;
  }

  function boundedStringArray(value, field, maxItems, maxLength) {
    if (!Array.isArray(value) || value.length > maxItems) {
      throw new TypeError(`${field} must be an array with at most ${maxItems} items`);
    }
    return value.map((item, index) => boundedString(item, `${field}[${index}]`, maxLength));
  }

  function deepFreeze(value, seen = new WeakSet()) {
    if (!value || typeof value !== 'object' || seen.has(value)) return value;
    seen.add(value);
    Object.values(value).forEach(item => deepFreeze(item, seen));
    return Object.freeze(value);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function validateManifest(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new TypeError('game manifest must be an object');
    }
    const manifest = clone(input);
    manifest.schema = boundedString(manifest.schema, 'schema', 96);
    if (manifest.schema !== 'td613.domeblox.game-manifest/v1') {
      throw new Error('unsupported game manifest schema');
    }
    manifest.id = boundedString(manifest.id, 'id', 64).toLowerCase();
    if (!ID_PATTERN.test(manifest.id)) throw new Error('invalid game id');
    manifest.title = boundedString(manifest.title, 'title', 120);
    manifest.version = boundedString(manifest.version, 'version', 48);
    manifest.status = boundedString(manifest.status, 'status', 48);
    manifest.entrypoint = boundedString(manifest.entrypoint, 'entrypoint', 240);
    manifest.description = boundedString(manifest.description, 'description', 600);
    manifest.claim_ceiling = boundedString(manifest.claim_ceiling, 'claim_ceiling', 240);
    manifest.capabilities = boundedStringArray(manifest.capabilities || [], 'capabilities', 32, 96);
    manifest.assays = boundedStringArray(manifest.assays || [], 'assays', 24, 96);
    manifest.consequence_adapters = boundedStringArray(
      manifest.consequence_adapters || [], 'consequence_adapters', 24, 96
    );
    manifest.authority_boundary = boundedStringArray(
      manifest.authority_boundary || [], 'authority_boundary', 16, 180
    );
    return deepFreeze(manifest);
  }

  function emit(type, payload) {
    (listeners.get(type) || []).slice().forEach(fn => {
      try { fn(payload); } catch (error) { console.error('[DomeBlox hook]', error); }
    });
    window.dispatchEvent(new CustomEvent(`domeblox:${type}`, { detail: payload }));
  }

  function registerGame(input) {
    const manifest = validateManifest(input);
    if (games.has(manifest.id)) throw new Error(`game already registered: ${manifest.id}`);
    games.set(manifest.id, manifest);
    emit('game-registered', manifest);
    return manifest;
  }

  function registerCallable(registry, type, id, fn) {
    const key = boundedString(id, `${type} id`, 96);
    if (!ID_PATTERN.test(key)) throw new Error(`invalid ${type} id`);
    if (typeof fn !== 'function') throw new TypeError(`${type} callback must be a function`);
    if (registry.has(key)) throw new Error(`${type} already registered: ${key}`);
    registry.set(key, fn);
    emit(`${type}-registered`, deepFreeze({ id: key }));
    return key;
  }

  function on(type, fn) {
    if (typeof fn !== 'function') throw new TypeError('listener must be a function');
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(fn);
    return () => listeners.set(type, (listeners.get(type) || []).filter(item => item !== fn));
  }

  window.TD613_DOME_BLOX = Object.freeze({
    version: '1.1.0',
    schema: 'td613.domeblox.hooks/v1.1',
    authorityCeiling: 'authorized-local-counter-adversarial-operation',
    registerGame,
    registerAssay: (id, fn) => registerCallable(assays, 'assay', id, fn),
    registerConsequenceAdapter: (id, fn) => registerCallable(consequences, 'consequence-adapter', id, fn),
    getGames: () => Array.from(games.values()),
    getAssay: id => assays.get(id),
    getConsequenceAdapter: id => consequences.get(id),
    runAssay: async (id, context) => {
      const fn = assays.get(id);
      if (!fn) throw new Error(`unknown assay: ${id}`);
      return fn(clone(context || {}));
    },
    compileConsequence: async (id, context) => {
      const fn = consequences.get(id);
      if (!fn) throw new Error(`unknown consequence adapter: ${id}`);
      return fn(clone(context || {}));
    },
    on,
    emit,
    validateManifest,
  });
}());
