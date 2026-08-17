import { _givingPracticeHydration } from './giving-practice-hydration.js';

const PRACTICE_SOURCE_ID = _givingPracticeHydration.PRACTICE_SOURCE_ID;
const CANONICAL_NAMES = Object.freeze([
  'SpongeBob SquarePants',
  'Patrick Star',
  'Sandy Cheeks',
  'Eugene H. Krabs',
  'Squidward Q. Tentacles'
]);
const COMMITTEES = Object.freeze([
  'King Neptune for King',
  'Mrs. Puff for Bikini Bottom School District #67',
  'Every Villain Is Lemons PAC',
  'Sheldon Plankton for Bikini Bottom Campaign',
  'Larry Lobster for Mayor of Bikini Bottom',
  'Fishocratic Executive Committee',
  'Friends of Aquaman PC',
  'Krusty Krab Parking Expansion Referendum Committee'
]);

const NOISE_PEOPLE = Object.freeze({
  'Pearl Krabs': {
    address: '17 Whale Tail Lane · FICTIONAL ANCHOR HOUSE',
    given: 'Pearl', family: 'Krabs', employer: 'Krusty Krab Family Holdings · FICTIONAL', occupation: 'Student / Heiress · FICTIONAL',
    quality: 'NEARBY_NAME'
  },
  'Sandy Grouper': {
    address: '404 Grouper Grotto · FICTIONAL REEF',
    given: 'Sandy', family: 'Grouper', employer: 'Bikini Bottom Marine Lab · FICTIONAL', occupation: 'Marine Researcher · FICTIONAL',
    quality: 'NEARBY_NAME'
  },
  'Squidward Tennisballs': {
    address: '0 Wrong-Name Court · FICTIONAL TYPO ADDRESS',
    given: 'Squidward', family: 'Tennisballs', employer: 'Name Tag Confusion LLC · FICTIONAL', occupation: 'Misentered Clarinetist · FICTIONAL',
    quality: 'DIRTY_VARIANT'
  },
  'Rick Star': {
    address: 'PA-TRICK Name Tag Lane · FICTIONAL MISREAD',
    given: 'Rick', family: 'Star', employer: 'Rock Residence · FICTIONAL', occupation: 'Misread Name Tag · FICTIONAL',
    quality: 'DIRTY_VARIANT'
  }
});

const NOISE_TX = Object.freeze({
  'Pearl Krabs': [
    ['2020-02-14', 12000, COMMITTEES[0]], ['2020-09-05', 18000, COMMITTEES[1]],
    ['2021-03-20', 25000, COMMITTEES[2]], ['2021-11-12', 35000, COMMITTEES[3]],
    ['2022-04-16', 50000, COMMITTEES[4]], ['2022-10-29', 65000, COMMITTEES[5]],
    ['2023-02-11', 75000, COMMITTEES[6]], ['2023-08-19', 90000, COMMITTEES[7]],
    ['2024-01-27', 125000, COMMITTEES[0]], ['2024-05-18', 140000, COMMITTEES[1]],
    ['2024-09-21', 160000, COMMITTEES[2]], ['2025-01-18', 175000, COMMITTEES[3]],
    ['2025-05-24', 200000, COMMITTEES[4]], ['2025-10-04', 225000, COMMITTEES[5]],
    ['2026-02-07', 250000, COMMITTEES[6]], ['2026-06-20', 275000, COMMITTEES[7]]
  ],
  'Sandy Grouper': [
    ['2020-01-25', 800, COMMITTEES[7]], ['2020-06-13', 1200, COMMITTEES[6]],
    ['2021-02-06', 1800, COMMITTEES[5]], ['2021-07-24', 2500, COMMITTEES[4]],
    ['2022-03-12', 4000, COMMITTEES[3]], ['2022-09-17', 6000, COMMITTEES[2]],
    ['2023-01-14', 8500, COMMITTEES[1]], ['2023-06-10', 11000, COMMITTEES[0]],
    ['2024-02-17', 13500, COMMITTEES[7]], ['2024-07-06', 16000, COMMITTEES[6]],
    ['2024-11-23', 19000, COMMITTEES[5]], ['2025-03-08', 22000, COMMITTEES[4]],
    ['2025-07-19', 26000, COMMITTEES[3]], ['2025-12-06', 30000, COMMITTEES[2]],
    ['2026-03-21', 35000, COMMITTEES[1]], ['2026-07-11', 40000, COMMITTEES[0]]
  ],
  'Squidward Tennisballs': [
    ['2023-04-01', 3333, COMMITTEES[2]]
  ],
  'Rick Star': [
    ['2024-04-01', 4200, COMMITTEES[0]]
  ]
});

const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const folded = (value) => compact(value).toLocaleLowerCase('en-US');
const safeToken = (value) => folded(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function recordFor(name, [date, amountCents, committee], index) {
  const person = NOISE_PEOPLE[name];
  const referendum = committee === COMMITTEES[7];
  const token = `ambiguity-${safeToken(name)}-${date}-${index + 1}`;
  return {
    digest: `practice:${_givingPracticeHydration.PRACTICE_FIXTURE_ID}:${token}`,
    contributor_name_raw: name,
    contributor_name: name,
    contributor_name_parsed: {
      display: name,
      given: person.given,
      middle: null,
      family: person.family,
      suffix: null
    },
    address: person.address,
    city: 'Bikini Bottom',
    state: 'Oceania',
    zip: 'X',
    employer: person.employer,
    occupation: person.occupation,
    committee,
    committee_name: committee,
    committee_kind: referendum ? 'ISSUE_REFERENDUM' : 'CANDIDATE_OR_POLITICAL_COMMITTEE',
    jurisdiction: 'Bikini Bottom, Oceania · FICTIONAL',
    office: referendum ? 'Issue / referendum · FICTIONAL' : null,
    cycle: date.slice(0, 4),
    election: `${date.slice(0, 4)} fictional cycle`,
    contribution_date: date,
    contribution_type: amountCents <= 2500 ? 'FICTIONAL SMALL-DOLLAR' : 'FICTIONAL CONTRIBUTION',
    amount_cents: amountCents,
    source_family: 'FICTIONAL_PRACTICE',
    source_instance_id: PRACTICE_SOURCE_ID,
    custodian: 'BikiniBottomVotes',
    evidence_status: 'FICTIONAL_SAMPLE',
    retrieved_at: new Date().toISOString(),
    source_native_ids: { practice_record_id: token },
    practice_name_quality: person.quality,
    pedagogy_note: person.quality === 'DIRTY_VARIANT'
      ? 'Deliberately dirty fictional name record: use partial names, aliases, and exact-match posture to investigate before identity closure.'
      : 'Deliberately nearby fictional name: broad matching can surface a different person who shares part of the target name.',
    lineage: {
      schema: 'td613.giving.practice-lineage/v1',
      practice_fixture_id: _givingPracticeHydration.PRACTICE_FIXTURE_ID,
      manifestly_fictional: true,
      practice_record: true,
      ambiguity_fixture: true,
      name_quality: person.quality,
      evidence_authority: false,
      consequence_authority: false,
      external_retrieval: false,
      source_projection: 'BikiniBottomVotes'
    }
  };
}

function noiseRecordsFor(name) {
  return (NOISE_TX[name] || []).map((row, index) => recordFor(name, row, index));
}

function allKnownNames() {
  return [...CANONICAL_NAMES, ...Object.keys(NOISE_PEOPLE)];
}

function termsFromQuery(query = {}) {
  return [query.name, ...(Array.isArray(query.aliases) ? query.aliases : [])].map(compact).filter(Boolean);
}

function matchedNames(query = {}) {
  const terms = termsFromQuery(query).map(folded);
  if (!terms.length) return [];
  const exact = Boolean(query.exact_match);
  return allKnownNames().filter((candidate) => {
    const value = folded(candidate);
    return terms.some((term) => exact ? value === term : value.includes(term));
  });
}

function dateMatches(record, query = {}) {
  const date = String(record?.contribution_date || '');
  if (query.date_from && date < query.date_from) return false;
  if (query.date_to && date > query.date_to) return false;
  return true;
}

function recordsForQuery(query = {}) {
  const names = matchedNames(query);
  return names.flatMap((name) => {
    const records = CANONICAL_NAMES.includes(name)
      ? _givingPracticeHydration.recordsFor(name)
      : noiseRecordsFor(name);
    return records.filter((record) => dateMatches(record, query));
  });
}

function practiceDelay(query = {}) {
  const override = Number(globalThis.__TD613_GIVING_PRACTICE_DELAY_MS__);
  if (Number.isFinite(override) && override >= 0 && override <= 16000) return Math.floor(override);
  let hash = 0;
  for (const character of compact(query.name)) hash = (Math.imul(hash, 33) + character.charCodeAt(0)) >>> 0;
  return 8000 + (hash % 8001);
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(done, ms);
    function done() { signal?.removeEventListener('abort', abort); resolve(); }
    function abort() { clearTimeout(timer); signal?.removeEventListener('abort', abort); reject(signal.reason || new DOMException('Practice search cancelled.', 'AbortError')); }
    if (signal?.aborted) abort();
    else signal?.addEventListener('abort', abort, { once: true });
  });
}

function response(body) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}

function parseEnvelope(init) {
  try { return typeof init?.body === 'string' ? JSON.parse(init.body) : null; } catch { return null; }
}

const priorFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init = {}) => {
  const envelope = parseEnvelope(init);
  const query = envelope?.payload?.query;
  if (!_givingPracticeHydration.active() || envelope?.operation !== 'search.page' || envelope?.payload?.source_instance_id !== PRACTICE_SOURCE_ID || !query) {
    return priorFetch(input, init);
  }

  await sleep(practiceDelay(query), init.signal);
  const names = matchedNames(query);
  const records = recordsForQuery(query);
  return response({
    ok: true,
    data: {
      page: {
        records,
        continuation: null,
        source_status: 'READY',
        coverage: 'FICTIONAL PRACTICE · 2020 → 2026 · BikiniBottomVotes',
        practice_projection: true,
        practice_match_mode: query.exact_match ? 'NORMALIZED_EXACT' : 'BROAD_DISCOVERY',
        matched_fictional_names: names,
        ambiguity_records_present: records.some((record) => record.lineage?.ambiguity_fixture === true)
      }
    },
    receipt: {
      schema: 'td613.giving.practice-receipt/v1',
      at: new Date().toISOString(),
      event: 'PRACTICE_RETRIEVAL_COMPLETE',
      practice_fixture_id: _givingPracticeHydration.PRACTICE_FIXTURE_ID,
      manifestly_fictional: true,
      source_instance_id: PRACTICE_SOURCE_ID,
      query_name: compact(query.name),
      exact_match: Boolean(query.exact_match),
      matched_fictional_names: names,
      record_count: records.length,
      external_retrieval: false,
      external_mutation: false,
      evidence_authority: false,
      consequence_authority: false
    }
  });
};

export const _givingPracticeSearchNoise = Object.freeze({
  CANONICAL_NAMES,
  NOISE_PEOPLE,
  NOISE_TX,
  COMMITTEES,
  matchedNames,
  recordsForQuery
});
