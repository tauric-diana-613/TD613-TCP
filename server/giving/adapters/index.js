import { sourceById } from '../registry.js';
import { GivingError, cleanText } from '../util.js';
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

function token(value) {
  return String(value || '').normalize('NFKC').toUpperCase().replace(/[^\p{L}\p{N}'-]/gu, '');
}

function queryPersonParts(query = {}) {
  const raw = cleanText(query.name, 240) || '';
  if (!raw) return { given: '', family: '', middle: '' };
  if (raw.includes(',')) {
    const [family, givenSide = ''] = raw.split(',', 2).map((part) => part.trim());
    const pieces = givenSide.split(/\s+/).filter(Boolean);
    return { family: token(family), given: token(pieces[0]), middle: pieces.slice(1).map(token).filter(Boolean).join(' ') };
  }
  const pieces = raw.split(/\s+/).filter(Boolean);
  return {
    given: token(pieces[0]),
    family: token(pieces.at(-1)),
    middle: pieces.slice(1, -1).map(token).filter(Boolean).join(' ')
  };
}

function flattenScalars(value, prefix = '', output = []) {
  if (value === null || value === undefined) return output;
  if (Array.isArray(value)) {
    value.forEach((child, index) => flattenScalars(child, `${prefix}${prefix ? '.' : ''}${index}`, output));
    return output;
  }
  if (typeof value !== 'object') return output;
  for (const [key, child] of Object.entries(value)) {
    const path = `${prefix}${prefix ? '.' : ''}${key}`;
    if (child && typeof child === 'object') flattenScalars(child, path, output);
    else if (child !== null && child !== undefined && String(child).trim()) {
      output.push({ key: path.toLowerCase().replace(/[^a-z0-9]/g, ''), value: cleanText(child, 500) });
    }
  }
  return output;
}

function firstEntry(entries, predicate) {
  return entries.find((entry) => entry.value && predicate(entry.key))?.value || null;
}

function sourceStreet(entries) {
  return firstEntry(entries, (key) =>
    (key.includes('addressline1') || key.includes('streetaddress') || key.endsWith('address1') || key.endsWith('addr1') || key.endsWith('street') || key.endsWith('address')) &&
    !key.includes('city') && !key.includes('state') && !key.includes('zip') && !key.includes('postal')
  );
}

function sourceLocation(entries) {
  return {
    city: firstEntry(entries, (key) => key.endsWith('contributorcity') || key.endsWith('addresscity') || key.endsWith('mailingcity') || key.endsWith('city')),
    state: firstEntry(entries, (key) => key.endsWith('contributorstate') || key.endsWith('addressstate') || key.endsWith('mailingstate') || key.endsWith('state')),
    zip: firstEntry(entries, (key) => key.includes('contributorzip') || key.includes('postalcode') || key.includes('mailingzip') || key.endsWith('zipcode') || key.endsWith('zip'))
  };
}

function easyVoteName(entries) {
  const eligible = (key) => (key.includes('contributor') || key.includes('donor') || key.includes('payor')) && !key.includes('candidate') && !key.includes('committee');
  const first = firstEntry(entries, (key) => eligible(key) && (key.endsWith('firstname') || key.endsWith('givenname')));
  const middle = firstEntry(entries, (key) => eligible(key) && (key.endsWith('middlename') || key.endsWith('middleinitial')));
  const last = firstEntry(entries, (key) => eligible(key) && (key.endsWith('lastname') || key.endsWith('familyname') || key.includes('lastnamecompany')));
  if (first && last) return { display: `${last}, ${[first, middle].filter(Boolean).join(' ')}`.toUpperCase(), source: 'SPLIT_FIELDS', first, middle, last };
  const combined = firstEntry(entries, (key) => eligible(key) && (key.endsWith('fullname') || key.endsWith('displayname') || key.endsWith('contributorname') || key.endsWith('donorname') || key.endsWith('payorname')));
  if (combined) return { display: combined, source: 'COMBINED_FIELD', first: null, middle: null, last: null };
  return { display: null, source: null, first: null, middle: null, last: null };
}

function canonicalParsedDisplay(record) {
  const parsed = record?.contributor_name_parsed || {};
  if (parsed.kind !== 'PERSON' || !parsed.given || !parsed.family) return null;
  return `${parsed.family}, ${[parsed.given, parsed.middle, parsed.suffix].filter(Boolean).join(' ')}`.toUpperCase();
}

function repairSourceRecord(record, query, source) {
  if (!record || !['florida', 'voterfocus', 'easyvote'].includes(source.adapter)) return record;
  const entries = flattenScalars(record.raw_source_row || {});
  let next = record;
  const lineage = { ...(record.lineage || {}) };

  if (!record.address) {
    const street = sourceStreet(entries);
    if (street) {
      next = { ...next, address: street };
      lineage.address_projection = 'RAW_SOURCE_STREET_FIELD_RESOLVED';
    }
  }
  const location = sourceLocation(entries);
  if (!next.city && location.city) next = { ...next, city: location.city };
  if (!next.state && location.state) next = { ...next, state: location.state };
  if (!next.zip && location.zip) next = { ...next, zip: location.zip };
  if ((!record.city && location.city) || (!record.state && location.state) || (!record.zip && location.zip)) {
    lineage.location_projection = 'RAW_SOURCE_CITY_STATE_ZIP_RESOLVED';
  }

  if (source.adapter === 'florida') {
    const canonical = canonicalParsedDisplay(next);
    if (canonical && !String(next.contributor_name_raw || '').includes(',')) {
      next = { ...next, contributor_name_raw: canonical, contributor_name_display: canonical };
      lineage.florida_display_projection = 'LAST_COMMA_FIRST_MIDDLE';
    }
  }

  if (source.adapter === 'easyvote') {
    const found = easyVoteName(entries);
    const unavailable = !cleanText(next.contributor_name_raw, 300) || /name unavailable/i.test(next.contributor_name_raw);
    if (found.display && (unavailable || found.source === 'SPLIT_FIELDS')) {
      next = {
        ...next,
        contributor_name_raw: found.display,
        contributor_name_display: found.display,
        contributor_name_parsed: {
          ...(next.contributor_name_parsed || {}),
          display: found.display,
          ...(found.first && found.last ? { kind: 'PERSON', given: found.first, middle: found.middle || null, family: found.last } : {})
        }
      };
      lineage.easyvote_name_projection = `RAW_${found.source}`;
    } else if (unavailable && query.exact_match && query.name) {
      const parts = queryPersonParts(query);
      if (parts.given && parts.family) {
        const display = `${parts.family}, ${[parts.given, parts.middle].filter(Boolean).join(' ')}`;
        next = {
          ...next,
          contributor_name_raw: display,
          contributor_name_display: display,
          contributor_name_parsed: { ...(next.contributor_name_parsed || {}), display, given: parts.given, middle: parts.middle || null, family: parts.family, kind: 'PERSON' },
          evidence_status: next.evidence_status === 'OBSERVED' ? 'DERIVED' : next.evidence_status
        };
        lineage.easyvote_name_projection = 'QUERY_ASSISTED_EXACT_MATCH_SOURCE_NAME_MISSING';
      }
    }
  }

  if (source.adapter === 'voterfocus') {
    const current = cleanText(next.contributor_name_raw, 300) || '';
    const nameTokens = current.split(/\s+/).filter(Boolean);
    const parts = queryPersonParts(query);
    if (query.exact_match && nameTokens.length === 1 && parts.given && parts.family && token(nameTokens[0]) === parts.given) {
      const display = `${parts.family}, ${[parts.given, parts.middle].filter(Boolean).join(' ')}`;
      next = {
        ...next,
        contributor_name_raw: display,
        contributor_name_display: display,
        contributor_name_parsed: { ...(next.contributor_name_parsed || {}), display, given: parts.given, middle: parts.middle || null, family: parts.family, kind: 'PERSON' },
        evidence_status: next.evidence_status === 'OBSERVED' ? 'DERIVED' : next.evidence_status
      };
      lineage.voterfocus_exact_match_projection = 'QUERY_ASSISTED_FIRST_ONLY_SOURCE_ROW';
    }
  }

  return { ...next, lineage };
}

function applySourceRepairs(result, query, source) {
  if (!Array.isArray(result?.records) || !['florida', 'voterfocus', 'easyvote'].includes(source.adapter)) return result;
  return { ...result, records: result.records.map((record) => repairSourceRecord(record, query, source)) };
}

function applyStateFilter(result, query) {
  if (!Array.isArray(query.states) || !query.states.length || !Array.isArray(result?.records)) return result;
  const admitted = new Set(query.states);
  const observed = result.records.length;
  const records = result.records.filter((record) => admitted.has(String(record?.state || '').trim().toUpperCase()));
  return {
    ...result,
    records,
    receipt: result.receipt ? {
      ...result.receipt,
      returned_record_count: records.length,
      state_filter: {
        states: [...admitted],
        observed_records: observed,
        retained_records: records.length
      }
    } : result.receipt
  };
}

export async function searchSourcePage(payload = {}, context = {}) {
  const source = sourceById(payload.source_instance_id);
  if (!source) throw new GivingError('unknown-source-instance', 'Search must name exactly one registered source instance', 400);
  const query = validateSearchQuery(payload.query || {});
  const adapter = ADAPTERS[source.adapter];
  if (!adapter) throw new GivingError('source-adapter-unavailable', 'Registered source has no admitted adapter', 503);
  try {
    const result = await adapter({
      source,
      query,
      continuation: payload.continuation || null,
      fetchImpl: context.fetchImpl
    });
    return applyStateFilter(applySourceRepairs(result, query, source), query);
  } catch (error) {
    if (error instanceof GivingError && error.status < 500 && error.status !== 429) throw error;
    return failedSourceResult(source, query, error);
  }
}

export const _adapterIndexInternals = Object.freeze({
  applyStateFilter,
  applySourceRepairs,
  repairSourceRecord,
  flattenScalars,
  sourceStreet,
  sourceLocation,
  easyVoteName,
  queryPersonParts,
  canonicalParsedDisplay
});
