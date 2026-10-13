const isRecord = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const cloneValue = value => typeof structuredClone === 'function'
  ? structuredClone(value)
  : JSON.parse(JSON.stringify(value));

function hydrateShape(template, candidate) {
  if (Array.isArray(template)) {
    if (!Array.isArray(candidate)) return cloneValue(template);
    return candidate.filter(entry => entry !== undefined).map(cloneValue);
  }
  if (template === null) {
    return candidate === null || ['string', 'number', 'boolean'].includes(typeof candidate) ? candidate : null;
  }
  if (typeof template === 'number') {
    const value = Number(candidate);
    return Number.isFinite(value) ? value : template;
  }
  if (typeof template === 'boolean') return typeof candidate === 'boolean' ? candidate : template;
  if (typeof template === 'string') return typeof candidate === 'string' ? candidate : template;
  if (isRecord(template)) {
    const source = isRecord(candidate) ? candidate : {};
    return Object.fromEntries(Object.entries(template).map(([key, value]) => [key, hydrateShape(value, source[key])]));
  }
  return candidate ?? template;
}

export function hydrateState(defaultFactory, candidate) {
  const hydrated = hydrateShape(defaultFactory(), isRecord(candidate) ? candidate : {});
  hydrated.schema = 1;
  hydrated.savedAt = typeof candidate?.savedAt === 'string' ? candidate.savedAt : new Date().toISOString();
  hydrated.ledger = Array.isArray(candidate?.ledger)
    ? candidate.ledger.filter(isRecord).slice(-200).map(cloneValue)
    : hydrated.ledger;
  if (!hydrated.ledger.length) hydrated.ledger.push({
    type: 'world_opened',
    at: new Date().toISOString(),
    message: 'The chair remains open.',
  });
  return hydrated;
}

export function readStoredState(storage, key, defaultFactory) {
  try {
    const raw = storage?.getItem?.(key);
    if (!raw) return defaultFactory();
    const parsed = JSON.parse(raw);
    if (parsed?.schema === 1 && parsed.world && parsed.player) return hydrateState(defaultFactory, parsed);
  } catch (error) {
    console.warn('[DomeBlox] save could not be read', error);
  }
  return defaultFactory();
}

export function writeStoredState(storage, key, state) {
  try {
    if (!storage?.setItem) throw new Error('storage surface unavailable');
    storage.setItem(key, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn('[DomeBlox] save could not be written', error);
    return false;
  }
}

export function clearStoredState(storage, key) {
  try {
    if (!storage?.removeItem) throw new Error('storage surface unavailable');
    storage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('[DomeBlox] save could not be cleared', error);
    return false;
  }
}
