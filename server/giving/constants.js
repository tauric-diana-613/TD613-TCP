export const GIVING_API_VERSION = 'td613.giving.api/v1';
export const GIVING_REQUEST_SCHEMA = 'td613.giving.request/v1';
export const GIVING_RECORD_SCHEMA = 'td613.giving.record/v1';
export const GIVING_RECEIPT_SCHEMA = 'td613.giving.receipt/v1';

export const SESSION_COOKIE = '__Host-td613-giving';
export const SESSION_TTL_SECONDS = 20 * 60;
export const MAX_REQUEST_BYTES = 3_000_000;
export const MAX_RESPONSE_BYTES = 3_750_000;
export const MAX_SOURCE_PAGE_SIZE = 300;
export const UPSTREAM_TIMEOUT_MS = 12_000;

export const OPERATIONS = Object.freeze([
  'session.create',
  'session.status',
  'session.close',
  'registry.read',
  'search.page',
  'vault.list',
  'vault.read',
  'vault.write',
  'vault.resolve-conflict',
  'campaign-directory.search',
  'campaign-directory.opensecrets-summary',
  'campaign-deputy.people-page',
  'campaign-deputy.link-existing',
  'campaign-deputy.create-confirmed',
  'campaign-deputy.ensure-committee',
  'campaign-deputy.withhold',
  'readiness'
]);

export const GIVING_ENVIRONMENT = Object.freeze({
  TD613_GIVING_ACCESS_SECRET: 'required, 24+ characters; never reused as the signing secret',
  TD613_GIVING_SESSION_SECRET: 'required, 32+ characters; independent HMAC authority',
  CAMPAIGN_DEPUTY_API_KEY: 'optional until Campaign Deputy sync is used; custom key requires people-read, people-write, list-read, and list-write',
  FEC_API_KEY: 'optional; DEMO_KEY fallback is rate-limited',
  OPENSECRETS_API_KEY: 'optional; enables OpenSecrets organization lookup and aggregate summary in Campaign / PC lookup',
  TD613_GIVING_NEON_DATABASE_URL: 'optional Neon Postgres connection string for HOSTED/HYBRID ciphertext custody'
});

export const MUTATION_OPERATIONS = new Set([
  'session.close',
  'vault.write',
  'vault.resolve-conflict',
  'campaign-deputy.link-existing',
  'campaign-deputy.create-confirmed',
  'campaign-deputy.ensure-committee',
  'campaign-deputy.withhold'
]);

export const PUBLIC_OPERATIONS = new Set(['session.create']);

export const ALLOWED_UPSTREAM_HOSTS = new Set([
  'api.open.fec.gov',
  'www.opensecrets.org',
  'dos.elections.myflorida.com',
  'www.voterfocus.com',
  'ecf-api.easyvoteapp.com',
  'us.api.campaigndeputy.app'
]);

export const BASE_RESPONSE_HEADERS = Object.freeze({
  'Cache-Control': 'no-store, max-age=0',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  'X-TD613-Giving': GIVING_API_VERSION
});

export const SOURCE_STATES = Object.freeze([
  'READY', 'PARTIAL', 'DRIFTED', 'UNAVAILABLE', 'ERROR', 'CANCELLED'
]);

export const EVIDENCE_STATUSES = Object.freeze([
  'OBSERVED', 'DERIVED', 'MISSING', 'NULL_RESULT', 'WITHHELD'
]);

export const IDENTITY_STATUSES = Object.freeze([
  'CANDIDATE', 'CONFIRMED', 'EXCLUDED', 'UNREVIEWED'
]);