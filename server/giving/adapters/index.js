import { sourceById } from '../registry.js';
import { GivingError } from '../util.js';
import { searchEasyVotePage } from './easyvote.js';
import { searchFecPage } from './fec.js';
import { searchFloridaPage } from './florida.js';
import { failedSourceResult, validateSearchQuery } from './shared.js';
import { searchVoterFocusPage } from './voterfocus.js';

const ADAPTERS = Object.freeze({
  fec: searchFecPage,
  florida: searchFloridaPage,
  voterfocus: searchVoterFocusPage,
  easyvote: searchEasyVotePage
});

export async function searchSourcePage(payload = {}, context = {}) {
  const source = sourceById(payload.source_instance_id);
  if (!source) throw new GivingError('unknown-source-instance', 'Search must name exactly one registered source instance', 400);
  const query = validateSearchQuery(payload.query || {});
  const adapter = ADAPTERS[source.adapter];
  if (!adapter) throw new GivingError('source-adapter-unavailable', 'Registered source has no admitted adapter', 503);
  try {
    return await adapter({
      source,
      query,
      continuation: payload.continuation || null,
      fetchImpl: context.fetchImpl
    });
  } catch (error) {
    if (error instanceof GivingError && error.status < 500 && error.status !== 429) throw error;
    return failedSourceResult(source, query, error);
  }
}
