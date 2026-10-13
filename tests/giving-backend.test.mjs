import assert from 'node:assert/strict';
import { amountToCents } from '../server/giving/util.js';
import { MUNICIPALITY_COVERAGE, SOURCE_INSTANCES, publicRegistry } from '../server/giving/registry.js';
import { normalizeFloridaRow } from '../server/giving/normalize.js';
import { sourceById } from '../server/giving/registry.js';
import {
  campaignDirectoryReadiness,
  ensureCampaignDeputyCommittee,
  openSecretsOrganizationSummary,
  searchCampaignDirectory
} from '../server/giving/campaign-directory.js';
import {
  _sessionInternals,
  createSession,
  publicSessionView,
  requireIntentNonce,
  sessionConfiguration
} from '../server/giving/security.js';
import { _vaultInternals } from '../server/giving/vault.js';
import { GivingError } from '../server/giving/util.js';

assert.equal(SOURCE_INSTANCES.length, 23);
assert.equal(MUNICIPALITY_COVERAGE.length, 62);
assert.deepEqual(publicRegistry().family_counts, { FEC: 1, FLORIDA: 1, VOTERFOCUS: 10, EASYVOTE: 11 });
assert.ok(SOURCE_INSTANCES.some((source) => source.id === 'voterfocus-duval'));
assert.ok(SOURCE_INSTANCES.some((source) => source.id === 'voterfocus-leon'));
assert.equal(SOURCE_INSTANCES.some((source) => source.family === 'OPENSECRETS'), false, 'OpenSecrets aggregate enrichment cannot populate contributor transaction rows');

assert.equal(amountToCents('$1,234.56'), 123456);
assert.equal(amountToCents('(23.45)'), -2345);
assert.equal(amountToCents('-0.005'), -1);
assert.equal(amountToCents('not-money'), null);

const stateSource = sourceById('florida-state-contributions');
const normalized = normalizeFloridaRow({
  'Committee Name': 'Neighbors for Good',
  'Contributor Name': 'DOE, JANE A JR',
  'Contribution Date': '08/01/2026',
  Amount: '-25.50',
  Amendment: 'A',
  City: 'Tampa',
  State: 'FL'
}, {
  source: stateSource,
  queryDigest: 'q'.repeat(64),
  retrievedAt: '2026-08-11T12:00:00.000Z'
});
assert.equal(normalized.amount_cents, -2550);
assert.equal(normalized.identity_status, 'UNREVIEWED');
assert.equal(normalized.lineage.analytical_total_status, 'DETERMINISTIC_WITHIN_SOURCE_SEMANTICS');
assert.equal(normalized.contributor_name_parsed.family, 'DOE');
assert.equal(normalized.contributor_name_parsed.suffix, 'JR');

const provisional = normalizeFloridaRow({
  'Committee Name': 'Committee without stable amendment semantics',
  'Contributor Name': 'DOE, JANE',
  'Contribution Date': '08/01/2026',
  Amount: '10.00'
}, {
  source: stateSource,
  queryDigest: 'p'.repeat(64),
  retrievedAt: '2026-08-11T12:00:00.000Z'
});
assert.equal(provisional.lineage.analytical_total_status, 'PROVISIONAL');

const previousFecKey = process.env.FEC_API_KEY;
const previousOpenSecretsKey = process.env.OPENSECRETS_API_KEY;
const previousCampaignDeputyKey = process.env.CAMPAIGN_DEPUTY_API_KEY;
process.env.FEC_API_KEY = 'test-fec-key';
process.env.OPENSECRETS_API_KEY = 'test-opensecrets-key';
process.env.CAMPAIGN_DEPUTY_API_KEY = 'test-campaign-deputy-key';

const directoryCalls = [];
const directory = await searchCampaignDirectory({ query: 'Example' }, {
  fetchImpl: async (url) => {
    const parsed = new URL(String(url));
    directoryCalls.push(parsed);
    if (parsed.hostname === 'api.open.fec.gov' && parsed.pathname.endsWith('/candidates/search/')) {
      assert.equal(parsed.searchParams.get('q'), 'Example');
      return new Response(JSON.stringify({
        results: [{
          candidate_id: 'H6FL01001', name: 'EXAMPLE, ALEX', office_full: 'House', state: 'FL', district: '01', party_full: 'Democratic Party',
          principal_committees: [{ committee_id: 'C00999991', name: 'ALEX EXAMPLE FOR CONGRESS', committee_type_full: 'House', designation_full: 'Principal campaign committee' }]
        }]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (parsed.hostname === 'api.open.fec.gov' && parsed.pathname.endsWith('/committees/')) {
      assert.equal(parsed.searchParams.get('q'), 'Example');
      return new Response(JSON.stringify({
        results: [{ committee_id: 'C00999991', name: 'ALEX EXAMPLE FOR CONGRESS', committee_type: 'H', committee_type_full: 'House', designation: 'P', designation_full: 'Principal campaign committee', state: 'FL' }]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (parsed.hostname === 'www.opensecrets.org' && parsed.searchParams.get('method') === 'getOrgs') {
      assert.equal(parsed.searchParams.get('org'), 'Example');
      return new Response(JSON.stringify({ response: { organization: [{ '@attributes': { orgid: 'D000000001', orgname: 'Example Industries' } }] } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    throw new Error(`unexpected campaign-directory request ${parsed}`);
  }
});
assert.equal(directoryCalls.length, 3);
assert.equal(directory.candidates[0].candidate_id, 'H6FL01001');
assert.equal(directory.candidates[0].principal_committees[0].committee_id, 'C00999991');
assert.equal(directory.committees[0].committee_id, 'C00999991');
assert.equal(directory.opensecrets.organizations[0].org_id, 'D000000001');
assert.equal(directory.semantics.opensecrets, 'AGGREGATE_ORGANIZATION_INTELLIGENCE_NOT_INDIVIDUAL_DONOR_TRANSACTIONS');
assert.equal(Object.hasOwn(directory, 'records'), false, 'campaign directory enrichment must not masquerade as Giving contribution rows');

const openSecretsSummary = await openSecretsOrganizationSummary({ org_id: 'D000000001' }, {
  fetchImpl: async (url) => {
    const parsed = new URL(String(url));
    assert.equal(parsed.hostname, 'www.opensecrets.org');
    assert.equal(parsed.searchParams.get('method'), 'orgSummary');
    assert.equal(parsed.searchParams.get('id'), 'D000000001');
    return new Response(JSON.stringify({
      response: { organization: { '@attributes': {
        orgid: 'D000000001', orgname: 'Example Industries', cycle: '2026', total: '125000', indivs: '80000', pacs: '45000', dems: '70000', repubs: '55000', lobbying: '12000', outside: '9000', gave_to_cand: '95000', source: 'https://www.opensecrets.org/example'
      } } }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
});
assert.equal(openSecretsSummary.name, 'Example Industries');
assert.equal(openSecretsSummary.total, 125000);
assert.equal(openSecretsSummary.semantics, 'OPENSECRETS_AGGREGATE_ORGANIZATION_SUMMARY');

const committeeCalls = [];
const committeeSync = await ensureCampaignDeputyCommittee({
  confirmed: true,
  committee_id: 'C00999991',
  committee_name: 'ALEX EXAMPLE FOR CONGRESS',
  candidate_id: 'H6FL01001',
  committee_type: 'House',
  designation: 'Principal campaign committee'
}, {
  fetchImpl: async (url, options = {}) => {
    const parsed = new URL(String(url));
    committeeCalls.push({ parsed, options });
    if (parsed.pathname.endsWith('/lists') && options.method !== 'POST') {
      return new Response(JSON.stringify({ data: [{ id: 'list-existing', name: 'ALEX EXAMPLE FOR CONGRESS', listType: 'list' }], metadata: {} }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    throw new Error(`unexpected Campaign Deputy committee request ${parsed}`);
  }
});
assert.equal(committeeCalls.length, 1);
assert.equal(committeeSync.receipt.action, 'COMMITTEE_LIST_ALREADY_PRESENT');
assert.equal(committeeSync.receipt.fec_committee_id, 'C00999991');
assert.equal(committeeSync.receipt.external_contribution_created, false);
assert.equal(committeeSync.receipt.relationship_semantics, 'REVIEWED_FEC_COMMITTEE_IDENTITY_TO_CAMPAIGN_DEPUTY_LIST');

const readiness = campaignDirectoryReadiness();
assert.equal(readiness.opensecrets.configured, true);
assert.equal(readiness.campaign_deputy_committee.representation, 'listType=list');
assert.equal(readiness.campaign_deputy_committee.historical_contribution_writeback_used, false);

if (previousFecKey === undefined) delete process.env.FEC_API_KEY; else process.env.FEC_API_KEY = previousFecKey;
if (previousOpenSecretsKey === undefined) delete process.env.OPENSECRETS_API_KEY; else process.env.OPENSECRETS_API_KEY = previousOpenSecretsKey;
if (previousCampaignDeputyKey === undefined) delete process.env.CAMPAIGN_DEPUTY_API_KEY; else process.env.CAMPAIGN_DEPUTY_API_KEY = previousCampaignDeputyKey;

process.env.TD613_GIVING_ACCESS_SECRET = 'access-secret-that-is-definitely-long-enough';
process.env.TD613_GIVING_SESSION_SECRET = 'session-signing-secret-that-is-distinct-and-long-enough';
assert.equal(sessionConfiguration().separate_authorities, true);
const created = createSession(process.env.TD613_GIVING_ACCESS_SECRET, 'https://td613.com');
const decoded = _sessionInternals.decodeSession(created.token, process.env.TD613_GIVING_SESSION_SECRET);
assert.equal(decoded.sid, created.payload.sid);
assert.equal(publicSessionView(decoded).authenticated, true);
assert.doesNotMatch(created.cookie, /access-secret/);
assert.match(created.cookie, /^__Host-td613-giving=/);
assert.match(created.cookie, /Secure; HttpOnly; SameSite=Strict/);
requireIntentNonce({ intent: { nonce: decoded.nonce } }, decoded);
assert.throws(() => requireIntentNonce({ intent: { nonce: 'wrong' } }, decoded), /session-bound intent nonce/);
assert.throws(
  () => _sessionInternals.decodeSession(`${created.token}x`, process.env.TD613_GIVING_SESSION_SECRET),
  /not valid/
);

const validCiphertext = {
  dossier_id: 'dossier_123',
  version_id: 'version_123',
  ciphertext: 'QUJDRA==',
  wrapped_key: { algorithm: 'AES-GCM', ciphertext: 'QUJDRA==', iv: 'aWtleQ==' },
  crypto: { algorithm: 'AES-GCM', iv: 'dW5pcXVl', schema: 'td613.giving.dossier/v1' },
  content_digest: 'a'.repeat(64),
  custody_mode: 'HOSTED'
};
assert.equal(_vaultInternals.validateCiphertextEnvelope(validCiphertext).versionId, 'version_123');
assert.throws(
  () => _vaultInternals.validateCiphertextEnvelope({ ...validCiphertext, donor_name: 'plaintext' }),
  (error) => error instanceof GivingError && error.code === 'vault-plaintext-withheld'
);
assert.throws(
  () => _vaultInternals.validateCiphertextEnvelope(validCiphertext, { resolving: true }),
  (error) => error instanceof GivingError && error.code === 'vault-resolution-incomplete'
);

console.log('giving-backend.test.mjs passed');
