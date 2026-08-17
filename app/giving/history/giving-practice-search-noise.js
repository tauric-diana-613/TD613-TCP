import { _givingPracticeHydration } from './giving-practice-hydration.js';
import { exactNameMatch } from './giving-model.js';

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
  'Puff for Bikini Bottom School District #67',
  'Every Villain Is Lemons PAC',
  'Sheldon Plankton for Bikini Bottom Campaign',
  'Larry Lobster for Mayor of Bikini Bottom',
  'Fishocratic Executive Committee',
  'Friends of Aquaman PC',
  'Krusty Krab Parking Expansion Referendum Committee'
]);

const NOISE_PEOPLE = Object.freeze({
  'Pearl Krabs': { address: '17 Whale Tail Lane · FICTIONAL ANCHOR HOUSE', given: 'Pearl', family: 'Krabs', employer: 'Krusty Krab Family Holdings · FICTIONAL', occupation: 'Student / Heiress · FICTIONAL', quality: 'NEARBY_NAME' },
  'Sandy Grouper': { address: '404 Grouper Grotto · FICTIONAL REEF', given: 'Sandy', family: 'Grouper', employer: 'Bikini Bottom Marine Lab · FICTIONAL', occupation: 'Marine Researcher · FICTIONAL', quality: 'NEARBY_NAME' },
  'Squidward Tennisballs': { address: '0 Wrong-Name Court · FICTIONAL TYPO ADDRESS', given: 'Squidward', family: 'Tennisballs', employer: 'Name Tag Confusion LLC · FICTIONAL', occupation: 'Misentered Clarinetist · FICTIONAL', quality: 'DIRTY_VARIANT' },
  'Squidward Tentpoles': { address: '0 Wrong-Name Court · FICTIONAL TYPO ADDRESS', given: 'Squidward', family: 'Tentpoles', employer: 'Name Tag Confusion LLC · FICTIONAL', occupation: 'Misentered Clarinetist · FICTIONAL', quality: 'DIRTY_VARIANT' },
  'Squidward Tortellini': { address: '0 Wrong-Name Court · FICTIONAL TYPO ADDRESS', given: 'Squidward', family: 'Tortellini', employer: 'Name Tag Confusion LLC · FICTIONAL', occupation: 'Misentered Clarinetist · FICTIONAL', quality: 'DIRTY_VARIANT' },
  'Rick Star': { address: 'PA-TRICK Name Tag Lane · FICTIONAL MISREAD', given: 'Rick', family: 'Star', employer: 'Rock Residence · FICTIONAL', occupation: 'Misread Name Tag · FICTIONAL', quality: 'DIRTY_VARIANT' },
  'Sponge Bob Squarepants': { address: '124 Conch Street · FICTIONAL PINEAPPLE', given: 'Sponge Bob', family: 'Squarepants', employer: 'Krusty Krab · FICTIONAL', occupation: 'Fry Cook · FICTIONAL', quality: 'SPACING_VARIANT' },
  'Spongebob Square Pants': { address: '124 Conch Street · FICTIONAL PINEAPPLE', given: 'Spongebob', family: 'Square Pants', employer: 'Krusty Krab · FICTIONAL', occupation: 'Fry Cook · FICTIONAL', quality: 'SPACING_VARIANT' },
  'Patrick Staar': { address: '120 Conch Street · FICTIONAL ROCK', given: 'Patrick', family: 'Staar', employer: 'Self · FICTIONAL', occupation: 'Professional Lounger · FICTIONAL', quality: 'TRANSPOSITION_VARIANT' },
  'Sandy Cheecks': { address: '1 Treedome Way · FICTIONAL AIR DOME', given: 'Sandy', family: 'Cheecks', employer: 'Treedome Research Lab · FICTIONAL', occupation: 'Scientist · FICTIONAL', quality: 'DOUBLED_LETTER_VARIANT' }
});

const NOISE_TX = Object.freeze({
  'Pearl Krabs': [
    ['2020-02-14', 12000, COMMITTEES[0]], ['2020-09-05', 18000, COMMITTEES[1]], ['2021-03-20', 25000, COMMITTEES[2]], ['2021-11-12', 35000, COMMITTEES[3]],
    ['2022-04-16', 50000, COMMITTEES[4]], ['2022-10-29', 65000, COMMITTEES[5]], ['2023-02-11', 75000, COMMITTEES[6]], ['2023-08-19', 90000, COMMITTEES[7]],
    ['2024-01-27', 125000, COMMITTEES[0]], ['2024-05-18', 140000, COMMITTEES[1]], ['2024-09-21', 160000, COMMITTEES[2]], ['2025-01-18', 175000, COMMITTEES[3]],
    ['2025-05-24', 200000, COMMITTEES[4]], ['2025-10-04', 225000, COMMITTEES[5]], ['2026-02-07', 250000, COMMITTEES[6]], ['2026-06-20', 275000, COMMITTEES[7]]
  ],
  'Sandy Grouper': [
    ['2020-01-25', 800, COMMITTEES[7]], ['2020-06-13', 1200, COMMITTEES[6]], ['2021-02-06', 1800, COMMITTEES[5]], ['2021-07-24', 2500, COMMITTEES[4]],
    ['2022-03-12', 4000, COMMITTEES[3]], ['2022-09-17', 6000, COMMITTEES[2]], ['2023-01-14', 8500, COMMITTEES[1]], ['2023-06-10', 11000, COMMITTEES[0]],
    ['2024-02-17', 13500, COMMITTEES[7]], ['2024-07-06', 16000, COMMITTEES[6]], ['2024-11-23', 19000, COMMITTEES[5]], ['2025-03-08', 22000, COMMITTEES[4]],
    ['2025-07-19', 26000, COMMITTEES[3]], ['2025-12-06', 30000, COMMITTEES[2]], ['2026-03-21', 35000, COMMITTEES[1]], ['2026-07-11', 40000, COMMITTEES[0]]
  ],
  'Squidward Tennisballs': [['2021-04-01', 3333, COMMITTEES[2]]],
  'Squidward Tentpoles': [['2023-04-01', 4444, COMMITTEES[3]]],
  'Squidward Tortellini': [['2025-04-01', 5555, COMMITTEES[7]]],
  'Rick Star': [['2024-04-01', 4200, COMMITTEES[0]]],
  'Sponge Bob Squarepants': [['2020-04-02', 900, COMMITTEES[0]], ['2022-04-02', 1900, COMMITTEES[2]], ['2024-04-02', 2900, COMMITTEES[4]], ['2026-04-02', 3900, COMMITTEES[6]]],
  'Spongebob Square Pants': [['2021-04-03', 1100, COMMITTEES[1]], ['2023-04-03', 2100, COMMITTEES[3]], ['2025-04-03', 3100, COMMITTEES[5]], ['2026-05-03', 4100, COMMITTEES[7]]],
  'Patrick Staar': [['2022-03-17', 1700, COMMITTEES[4]], ['2026-03-17', 2700, COMMITTEES[0]]],
  'Sandy Cheecks': [['2021-08-08', 2400, COMMITTEES[6]], ['2025-08-08', 3400, COMMITTEES[1]]]
});

const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const folded = (value) => compact(value).toLocaleLowerCase('en-US');
const skeleton = (value) => folded(value).replace(/[^a-z0-9]+/g, '');
const tokens = (value) => folded(value).split(/[^a-z0-9]+/).filter((token) => token.length >= 4);
const safeToken = (value) => folded(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function normalizeCommitteeName(name) {
  return name === 'Mrs. Puff for Bikini Bottom School District #67' ? 'Puff for Bikini Bottom School District #67' : name;
}

function withContributorName(record, display, quality) {
  const pieces = display.split(/\s+/);
  const first = pieces[0] || '';
  const last = pieces.at(-1) || '';
  const middle = pieces.length > 2 ? pieces.slice(1, -1).join(' ') : null;
  return {
    ...record,
    contributor_name_raw: display,
    contributor_name: display,
    contributor_name_parsed: { display, given: first, middle, family: last, suffix: null },
    practice_name_quality: quality,
    lineage: { ...(record.lineage || {}), name_quality: quality }
  };
}

function normalizeCanonicalRecord(record, canonicalName, index) {
  const committee = normalizeCommitteeName(record.committee_name || record.committee);
  let next = { ...record, committee, committee_name: committee };
  if (canonicalName === 'Eugene H. Krabs' && index % 2 === 1) next = withContributorName(next, 'Eugene Krabs', 'MIDDLE_INITIAL_OMITTED');
  else if (canonicalName === 'Squidward Q. Tentacles' && index % 2 === 1) next = withContributorName(next, 'Squidward Tentacles', 'MIDDLE_INITIAL_OMITTED');
  else if (canonicalName === 'Eugene H. Krabs' || canonicalName === 'Squidward Q. Tentacles') next.practice_name_quality = 'MIDDLE_INITIAL_PRESENT';
  return next;
}

function recordFor(name, [date, amountCents, committee], index) {
  const person = NOISE_PEOPLE[name];
  const referendum = committee === COMMITTEES[7];
  const token = `ambiguity-${safeToken(name)}-${date}-${index + 1}`;
  return {
    digest: `practice:${_givingPracticeHydration.PRACTICE_FIXTURE_ID}:${token}`,
    contributor_name_raw: name,
    contributor_name: name,
    contributor_name_parsed: { display: name, given: person.given, middle: null, family: person.family, suffix: null },
    address: person.address,
    city: 'Bikini Bottom', state: 'Oceania', zip: 'X',
    employer: person.employer, occupation: person.occupation,
    committee, committee_name: committee,
    committee_kind: referendum ? 'ISSUE_REFERENDUM' : 'CANDIDATE_OR_POLITICAL_COMMITTEE',
    jurisdiction: 'Bikini Bottom, Oceania · FICTIONAL', office: referendum ? 'Issue / referendum · FICTIONAL' : null,
    cycle: date.slice(0, 4), election: `${date.slice(0, 4)} fictional cycle`, contribution_date: date,
    contribution_type: amountCents <= 2500 ? 'FICTIONAL SMALL-DOLLAR' : 'FICTIONAL CONTRIBUTION', amount_cents: amountCents,
    source_family: 'FICTIONAL_PRACTICE', source_instance_id: PRACTICE_SOURCE_ID, custodian: 'BikiniBottomVotes',
    evidence_status: 'FICTIONAL_SAMPLE', retrieved_at: new Date().toISOString(), source_native_ids: { practice_record_id: token },
    practice_name_quality: person.quality,
    pedagogy_note: person.quality === 'NEARBY_NAME' ? 'Nearby fictional identity: broad matching can surface a different person who shares part of the target name.' : 'Dirty fictional name record: investigate spacing, omitted initials, transcription error, nickname, or typo before identity closure.',
    lineage: {
      schema: 'td613.giving.practice-lineage/v1', practice_fixture_id: _givingPracticeHydration.PRACTICE_FIXTURE_ID,
      manifestly_fictional: true, practice_record: true, ambiguity_fixture: true, name_quality: person.quality,
      evidence_authority: false, consequence_authority: false, external_retrieval: false, source_projection: 'BikiniBottomVotes'
    }
  };
}

function noiseRecordsFor(name) {
  return (NOISE_TX[name] || []).map((row, index) => recordFor(name, row, index));
}

function canonicalRecordsFor(name) {
  return _givingPracticeHydration.recordsFor(name).map((record, index) => normalizeCanonicalRecord(record, name, index));
}

function allKnownNames() {
  return [...CANONICAL_NAMES, ...Object.keys(NOISE_PEOPLE)];
}

function termsFromQuery(query = {}) {
  return [query.name, ...(Array.isArray(query.aliases) ? query.aliases : [])].map(compact).filter(Boolean);
}

function broadNameMatch(candidate, term) {
  const candidateFolded = folded(candidate);
  const termFolded = folded(term);
  if (candidateFolded.includes(termFolded) || termFolded.includes(candidateFolded)) return true;
  if (skeleton(candidate) === skeleton(term)) return true;
  const candidateTokens = new Set(tokens(candidate));
  return tokens(term).some((token) => candidateTokens.has(token));
}

function matchedNames(query = {}) {
  const terms = termsFromQuery(query);
  if (!terms.length) return [];
  const exact = Boolean(query.exact_match);
  return allKnownNames().filter((candidate) => terms.some((term) => exact ? exactNameMatch(candidate, term) : broadNameMatch(candidate, term)));
}

function dateMatches(record, query = {}) {
  const date = String(record?.contribution_date || '');
  if (query.date_from && date < query.date_from) return false;
  if (query.date_to && date > query.date_to) return false;
  return true;
}

function recordsForQuery(query = {}) {
  return matchedNames(query).flatMap((name) => {
    const records = CANONICAL_NAMES.includes(name) ? canonicalRecordsFor(name) : noiseRecordsFor(name);
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
  if (!_givingPracticeHydration.active() || envelope?.operation !== 'search.page' || envelope?.payload?.source_instance_id !== PRACTICE_SOURCE_ID || !query) return priorFetch(input, init);
  await sleep(practiceDelay(query), init.signal);
  const names = matchedNames(query);
  const records = recordsForQuery(query);
  return response({
    ok: true,
    data: { page: {
      records, continuation: null, source_status: 'READY', coverage: 'FICTIONAL PRACTICE · 2020 → 2026 · BikiniBottomVotes', practice_projection: true,
      practice_match_mode: query.exact_match ? 'NORMALIZED_EXACT' : 'BROAD_DISCOVERY', matched_fictional_names: names,
      ambiguity_records_present: records.some((record) => record.lineage?.ambiguity_fixture === true),
      middle_initial_variants_present: records.some((record) => /^MIDDLE_INITIAL_/.test(record.practice_name_quality || ''))
    } },
    receipt: {
      schema: 'td613.giving.practice-receipt/v1', at: new Date().toISOString(), event: 'PRACTICE_RETRIEVAL_COMPLETE',
      practice_fixture_id: _givingPracticeHydration.PRACTICE_FIXTURE_ID, manifestly_fictional: true,
      source_instance_id: PRACTICE_SOURCE_ID, query_name: compact(query.name), exact_match: Boolean(query.exact_match), matched_fictional_names: names,
      record_count: records.length, external_retrieval: false, external_mutation: false, evidence_authority: false, consequence_authority: false
    }
  });
};

export const _givingPracticeSearchNoise = Object.freeze({
  CANONICAL_NAMES, NOISE_PEOPLE, NOISE_TX, COMMITTEES, broadNameMatch, matchedNames, canonicalRecordsFor, recordsForQuery
});
