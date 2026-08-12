export const DOSSIER_SCHEMA = 'td613.giving.dossier/v1';
export const REQUEST_SCHEMA = 'td613.giving.request/v1';

export const IDENTITY_STATUS = Object.freeze({
  CANDIDATE: 'CANDIDATE',
  CONFIRMED: 'CONFIRMED',
  EXCLUDED: 'EXCLUDED',
  UNREVIEWED: 'UNREVIEWED'
});

export const CUSTODY_MODE = Object.freeze({
  LOCAL: 'LOCAL',
  HOSTED: 'HOSTED',
  HYBRID: 'HYBRID'
});

const SUFFIXES = new Set(['JR', 'SR', 'II', 'III', 'IV', 'V', 'PHD', 'MD', 'ESQ']);

export function compactText(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

export function normalizeName(value) {
  const raw = compactText(value).toLocaleUpperCase('en-US');
  const tokens = raw
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .split(/\s+/)
    .map((token) => token.replace(/^['-]+|['-]+$/g, ''))
    .filter(Boolean);
  const suffix = tokens.length && SUFFIXES.has(tokens[tokens.length - 1]) ? tokens.pop() : '';
  const commaParts = raw.split(',').map(compactText).filter(Boolean);
  const ordered = commaParts.length > 1
    ? [...commaParts.slice(1).join(' ').split(/\s+/), ...commaParts[0].split(/\s+/)]
    : tokens;
  const clean = ordered
    .map((token) => token.replace(/[^\p{L}\p{N}'-]/gu, ''))
    .filter((token) => token && !SUFFIXES.has(token));
  return {
    raw: compactText(value),
    canonical: clean.join(' '),
    tokens: clean,
    first: clean[0] || '',
    last: clean[clean.length - 1] || '',
    suffix
  };
}

export function parseMoneyToCents(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Amount must be finite.');
    return Math.round((value + Number.EPSILON) * 100);
  }
  let text = compactText(value);
  if (!text) return 0;
  const parenthetical = /^\(.*\)$/.test(text);
  text = text.replace(/[()$,_\s]/g, '');
  const match = text.match(/^([+-]?)(\d+)(?:\.(\d{0,}))?$/);
  if (!match) throw new TypeError(`Unparseable contribution amount: ${value}`);
  const sign = parenthetical || match[1] === '-' ? -1 : 1;
  const whole = BigInt(match[2]);
  const fraction = (match[3] || '').padEnd(3, '0');
  let cents = whole * 100n + BigInt(fraction.slice(0, 2) || '0');
  if (Number(fraction[2] || '0') >= 5) cents += 1n;
  const signed = cents * BigInt(sign);
  const result = Number(signed);
  if (!Number.isSafeInteger(result)) throw new RangeError('Contribution exceeds safe integer range.');
  return result;
}

export function createDossier({ title = '', query = {}, sourceIds = [], custody = CUSTODY_MODE.LOCAL } = {}) {
  const now = new Date().toISOString();
  const id = globalThis.crypto?.randomUUID?.() || `giving-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return {
    schema: DOSSIER_SCHEMA,
    id,
    title: compactText(title) || `Giving history ${now.slice(0, 10)}`,
    custody,
    version: 1,
    ancestry: [],
    created_at: now,
    updated_at: now,
    query: {
      name: compactText(query.name),
      aliases: Array.isArray(query.aliases) ? query.aliases.map(compactText).filter(Boolean) : [],
      hints: compactText(query.hints),
      date_from: compactText(query.date_from),
      date_to: compactText(query.date_to)
    },
    source_ids: [...new Set(sourceIds)],
    source_states: {},
    records: [],
    decisions: {},
    clusters: [],
    operator_receipts: [],
    campaign_deputy: { people_index: [], links: [], write_receipts: [] }
  };
}

export function recordDigest(record) {
  return compactText(record?.digest || record?.local_digest || record?.record_digest || record?.id);
}

function same(left, right) {
  return Boolean(left && right && compactText(left).toUpperCase() === compactText(right).toUpperCase());
}

export function identityPairScore(left, right) {
  const a = normalizeName(left.contributor_name || left.raw_contributor_name || left.contributor_name_raw || left.contributor_name_parsed?.display);
  const b = normalizeName(right.contributor_name || right.raw_contributor_name || right.contributor_name_raw || right.contributor_name_parsed?.display);
  let score = 0;
  const reasons = [];
  const cautions = [];
  if (a.canonical && a.canonical === b.canonical) {
    score += 0.56;
    reasons.push('exact normalized name');
  } else {
    if (a.last && a.last === b.last) {
      score += 0.2;
      reasons.push('same family name');
    }
    if (a.first && b.first && a.first[0] === b.first[0]) {
      score += 0.08;
      reasons.push('same first initial');
    }
    if (a.first && b.first && a.first !== b.first) cautions.push('given names differ');
  }
  if (same(left.address, right.address) || same(left.street_address, right.street_address)) {
    score += 0.19;
    reasons.push('same street address');
  }
  if (same(left.zip, right.zip) || same(left.postal_code, right.postal_code)) {
    score += 0.1;
    reasons.push('same ZIP');
  }
  if (same(left.city, right.city) && same(left.state, right.state)) {
    score += 0.06;
    reasons.push('same city and state');
  }
  if (same(left.employer, right.employer)) {
    score += 0.06;
    reasons.push('same employer');
  }
  if (same(left.occupation, right.occupation)) {
    score += 0.03;
    reasons.push('same occupation');
  }
  if (a.suffix && b.suffix && a.suffix !== b.suffix) {
    score -= 0.2;
    cautions.push('suffixes conflict');
  }
  if (left.state && right.state && !same(left.state, right.state)) {
    score -= 0.08;
    cautions.push('states differ');
  }
  return { score: Math.max(0, Math.min(1, score)), reasons, cautions };
}

export function suggestIdentityClusters(records, threshold = 0.42) {
  const parent = records.map((_, index) => index);
  const evidence = [];
  const find = (index) => parent[index] === index ? index : (parent[index] = find(parent[index]));
  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootB] = rootA;
  };
  for (let left = 0; left < records.length; left += 1) {
    for (let right = left + 1; right < records.length; right += 1) {
      const comparison = identityPairScore(records[left], records[right]);
      if (comparison.score >= threshold) {
        union(left, right);
        evidence.push({ left: recordDigest(records[left]), right: recordDigest(records[right]), ...comparison });
      }
    }
  }
  const groups = new Map();
  records.forEach((record, index) => {
    const key = find(index);
    const list = groups.get(key) || [];
    list.push(recordDigest(record));
    groups.set(key, list);
  });
  return [...groups.values()]
    .filter((members) => members.length > 1)
    .map((members, index) => ({
      id: `cluster-${index + 1}`,
      status: IDENTITY_STATUS.CANDIDATE,
      members,
      comparisons: evidence.filter((item) => members.includes(item.left) && members.includes(item.right))
    }));
}

export function addSearchPage(dossier, sourceId, page, receipt = {}) {
  const incoming = Array.isArray(page?.records) ? page.records : [];
  const byDigest = new Map(dossier.records.map((record) => [recordDigest(record), record]));
  for (const record of incoming) {
    const digest = recordDigest(record);
    if (!digest) continue;
    byDigest.set(digest, { ...record, digest });
  }
  const records = [...byDigest.values()];
  const clusters = suggestIdentityClusters(records);
  const candidateDigests = new Set(clusters.flatMap((cluster) => cluster.members));
  const decisions = { ...dossier.decisions };
  for (const record of records) {
    const digest = recordDigest(record);
    if (!digest || [IDENTITY_STATUS.CONFIRMED, IDENTITY_STATUS.EXCLUDED].includes(decisions[digest])) continue;
    if (candidateDigests.has(digest)) decisions[digest] = IDENTITY_STATUS.CANDIDATE;
    else if (!decisions[digest]) decisions[digest] = IDENTITY_STATUS.UNREVIEWED;
  }
  return {
    ...dossier,
    version: dossier.version + 1,
    updated_at: new Date().toISOString(),
    records,
    decisions,
    clusters,
    source_states: {
      ...dossier.source_states,
      [sourceId]: {
        status: 'COMPLETE',
        count: incoming.length,
        continuation: page?.continuation || null,
        coverage: page?.coverage || receipt?.coverage || null,
        receipt
      }
    },
    operator_receipts: [...dossier.operator_receipts, receipt].filter(Boolean)
  };
}

export function setIdentityDecision(dossier, digest, status, note = '') {
  if (!Object.values(IDENTITY_STATUS).includes(status)) throw new TypeError('Unknown identity status.');
  if (!dossier.records.some((record) => recordDigest(record) === digest)) throw new TypeError('Record is not in this dossier.');
  const receipt = {
    schema: 'td613.giving.identity-decision/v1',
    at: new Date().toISOString(),
    record_digest: digest,
    status,
    note: compactText(note)
  };
  return {
    ...dossier,
    version: dossier.version + 1,
    updated_at: receipt.at,
    decisions: { ...dossier.decisions, [digest]: status },
    operator_receipts: [...dossier.operator_receipts, receipt]
  };
}

function recordCommittee(record) {
  return compactText(record.committee_name || record.candidate_name || record.committee || record.candidate || record.committee_candidate || 'Committee not stated');
}

export function committeeLedger(dossier) {
  const groups = new Map();
  for (const record of dossier.records) {
    const digest = recordDigest(record);
    if (dossier.decisions[digest] !== IDENTITY_STATUS.CONFIRMED) continue;
    const committee = recordCommittee(record);
    const key = [committee, compactText(record.jurisdiction), compactText(record.office), compactText(record.cycle || record.election)].join('\u241f');
    const current = groups.get(key) || {
      key,
      committee,
      jurisdiction: compactText(record.jurisdiction),
      office: compactText(record.office),
      cycle: compactText(record.cycle || record.election),
      amount_cents: 0,
      records: [],
      provisional: false
    };
    current.amount_cents += Number.isSafeInteger(record.amount_cents) ? record.amount_cents : parseMoneyToCents(record.amount ?? 0);
    current.records.push(record);
    current.provisional ||= Boolean(
      record.provisional || record.amendment_uncertain || record.supersession_uncertain ||
      record.lineage?.provisional || record.lineage?.analytical_total_status === 'PROVISIONAL'
    );
    groups.set(key, current);
  }
  return [...groups.values()].sort((a, b) => Math.abs(b.amount_cents) - Math.abs(a.amount_cents) || a.committee.localeCompare(b.committee));
}

export function formatCurrency(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function csvCell(value) {
  const text = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export function dossierCsv(dossier) {
  const fields = [
    'digest', 'identity_status', 'evidence_status', 'source_family', 'source_instance_id', 'custodian', 'jurisdiction',
    'committee', 'candidate', 'office', 'cycle', 'election', 'reporting_context', 'contributor_name_raw', 'address', 'city', 'state',
    'zip', 'employer', 'occupation', 'contribution_date', 'contribution_type', 'amendment_status', 'amount_cents',
    'source_locator', 'retrieved_at', 'query_digest', 'source_native_ids', 'lineage', 'raw_source_row'
  ];
  const rows = dossier.records.map((record) => fields.map((field) => {
    if (field === 'digest') return csvCell(recordDigest(record));
    if (field === 'identity_status') return csvCell(dossier.decisions[recordDigest(record)] || IDENTITY_STATUS.UNREVIEWED);
    if (field === 'raw_source_row') return csvCell(record.raw_source_row ?? record.raw ?? null);
    return csvCell(record[field]);
  }).join(','));
  return `${fields.join(',')}\r\n${rows.join('\r\n')}\r\n`;
}

export function safeFilename(value) {
  return compactText(value).replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'giving-history';
}
