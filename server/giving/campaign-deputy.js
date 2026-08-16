import {
  GivingError,
  cleanText,
  fetchWithBoundary,
  sha256
} from './util.js';

const API_BASE = 'https://us.api.campaigndeputy.app/v1';
const REQUIRED_SCOPES = Object.freeze(['people-read', 'people-write', 'list-read', 'list-write']);
const PERSON_AVAILABILITY_DELAYS_MS = Object.freeze([0, 250, 500, 1_000, 2_000]);

function apiKey() {
  const key = String(process.env.CAMPAIGN_DEPUTY_API_KEY || '').trim();
  if (!key) throw new GivingError('campaign-deputy-unavailable', 'Campaign Deputy integration is not configured', 503);
  return key;
}

async function campaignDeputyFetch(path, options = {}, context = {}) {
  const response = await fetchWithBoundary(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  }, { fetchImpl: context.fetchImpl, timeoutMs: 12_000 });
  if (!response.ok) {
    let upstreamMessage = null;
    try {
      const errorBody = await response.json();
      upstreamMessage = cleanText(errorBody?.message, 300);
    } catch {
      // Campaign Deputy error bodies are documented as JSON, but status remains authoritative.
    }
    if (response.status === 401 || response.status === 403) {
      throw new GivingError('campaign-deputy-authorization-failed', 'Campaign Deputy did not authorize this server request', 502);
    }
    throw new GivingError(response.status === 409 ? 'campaign-deputy-conflict' : 'campaign-deputy-upstream-error', `Campaign Deputy returned HTTP ${response.status}`, 502, {
      upstream_status: response.status,
      ...(upstreamMessage ? { upstream_message: upstreamMessage } : {})
    });
  }
  if (response.status === 204) return {};
  try {
    return await response.json();
  } catch {
    throw new GivingError('campaign-deputy-contract-drift', 'Campaign Deputy returned a non-JSON response', 502);
  }
}

function opaqueCursor(value, field) {
  const text = String(value ?? '').trim();
  if (!text || text.length > 2_048 || /[\u0000-\u001f\u007f]/.test(text)) {
    throw new GivingError('invalid-campaign-deputy-field', `${field} must be a bounded Campaign Deputy cursor`, 400, { field });
  }
  return text;
}

function opaqueId(value, field) {
  const text = cleanText(value, 180);
  if (!text || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{1,179}$/.test(text)) {
    throw new GivingError('invalid-campaign-deputy-field', `${field} must be a bounded Campaign Deputy identifier`, 400, { field });
  }
  return text;
}

function committeeName(value) {
  const name = cleanText(value, 100);
  if (!name) throw new GivingError('committee-required', 'A reviewed committee taxonomy label is required', 400);
  return name;
}

export async function peoplePage(payload = {}, context = {}) {
  const params = new URLSearchParams();
  if (payload.last_evaluated_key) params.set('lastEvaluatedKey', opaqueCursor(payload.last_evaluated_key, 'last_evaluated_key'));
  params.set('sortKey', 'lastUpdated');
  const body = await campaignDeputyFetch(`/peoples?${params}`, {}, context);
  if (!Array.isArray(body?.data)) throw new GivingError('campaign-deputy-contract-drift', 'Campaign Deputy people page did not match its documented container', 502);
  return {
    people: body.data,
    continuation: body.metadata?.lastEvaluatedKey || null,
    total_records: body.metadata?.totalRecords ?? null,
    custody_instruction: 'Persist this contact index only under the active dossier storage policy.',
    identity_authority: 'CANDIDATE_ONLY_UNTIL_OPERATOR_SELECTS_EXACT_PERSON_ID'
  };
}

async function listAllLists(context) {
  const lists = [];
  let cursor = null;
  for (let page = 0; page < 40; page += 1) {
    const params = new URLSearchParams({ listType: 'list', pageSize: '100' });
    if (cursor) params.set('lastEvaluatedKey', cursor);
    const body = await campaignDeputyFetch(`/lists?${params}`, {}, context);
    if (!Array.isArray(body?.data)) throw new GivingError('campaign-deputy-contract-drift', 'Campaign Deputy list page did not match its documented container', 502);
    lists.push(...body.data);
    cursor = body.metadata?.lastEvaluatedKey || null;
    if (!cursor) return lists;
  }
  throw new GivingError('campaign-deputy-pagination-ceiling', 'Campaign Deputy list pagination exceeded the bounded traversal ceiling', 502);
}

async function findOrCreateList(committee, explicitListId, context) {
  const name = committeeName(committee);
  if (explicitListId) return { id: opaqueId(explicitListId, 'list_id'), name, created: false, selected_explicitly: true };
  const lists = await listAllLists(context);
  const existing = lists.find((list) => String(list.name || '').trim().toLocaleLowerCase() === name.toLocaleLowerCase() && list.listType === 'list');
  if (existing?.id) return { ...existing, created: false };
  try {
    const body = await campaignDeputyFetch('/lists', {
      method: 'POST',
      body: JSON.stringify({ name, listType: 'list' })
    }, context);
    const created = body?.data || body;
    if (!created?.id) throw new GivingError('campaign-deputy-contract-drift', 'Campaign Deputy did not return the created list ID', 502);
    return { ...created, created: true };
  } catch (error) {
    if (error?.details?.upstream_status !== 409) throw error;
    const afterConflict = await listAllLists(context);
    const raced = afterConflict.find((list) => String(list.name || '').trim().toLocaleLowerCase() === name.toLocaleLowerCase() && list.listType === 'list');
    if (!raced?.id) throw error;
    return { ...raced, created: false, resolved_create_conflict: true };
  }
}

async function membershipState(listId, personId, context) {
  let cursor = null;
  for (let page = 0; page < 200; page += 1) {
    const params = new URLSearchParams({ pageSize: '100' });
    if (cursor) params.set('lastEvaluatedKey', cursor);
    const body = await campaignDeputyFetch(`/lists/${encodeURIComponent(listId)}?${params}`, {}, context);
    if (!Array.isArray(body?.data)) throw new GivingError('campaign-deputy-contract-drift', 'Campaign Deputy membership page did not match its documented container', 502);
    if (body.data.some((entity) => entity.personId === personId)) return true;
    cursor = body.metadata?.lastEvaluatedKey || null;
    if (!cursor) return false;
  }
  throw new GivingError('campaign-deputy-pagination-ceiling', 'Campaign Deputy membership pagination exceeded the bounded traversal ceiling', 502);
}

function isPersonAvailabilityLag(error) {
  const status = error?.details?.upstream_status;
  const message = String(error?.details?.upstream_message || '');
  return status === 404 || (status === 400 && /(unknown|not\s+found|not\s+available|processing).{0,80}person|person.{0,80}(unknown|not\s+found|not\s+available|processing)/i.test(message));
}

async function writeMembership(listId, personId, context, retryForAvailability) {
  const delays = retryForAvailability ? PERSON_AVAILABILITY_DELAYS_MS : [0];
  let lastError = null;
  for (let index = 0; index < delays.length; index += 1) {
    if (delays[index] > 0) {
      const sleep = context.sleepImpl || ((delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs)));
      await sleep(delays[index]);
    }
    try {
      await campaignDeputyFetch(`/lists/${encodeURIComponent(listId)}`, {
        method: 'PUT',
        body: JSON.stringify({ personId })
      }, context);
      return { attempts: index + 1, availability_retried: index > 0 };
    } catch (error) {
      lastError = error;
      if (!retryForAvailability || !isPersonAvailabilityLag(error) || index === delays.length - 1) break;
    }
  }
  if (retryForAvailability && isPersonAvailabilityLag(lastError)) {
    throw new GivingError(
      'campaign-deputy-person-availability-timeout',
      'Campaign Deputy returned the new person ID but did not make it available to lists within the bounded retry window',
      502,
      { attempts: delays.length, upstream_status: lastError?.details?.upstream_status || null }
    );
  }
  throw lastError;
}

async function ensureMembership({ personId, committee, listId, retryForAvailability = false }, context) {
  const list = await findOrCreateList(committee, listId, context);
  const alreadyMember = await membershipState(list.id, personId, context);
  let write = { attempts: 0, availability_retried: false };
  if (!alreadyMember) {
    write = await writeMembership(list.id, personId, context, retryForAvailability);
  }
  return { list, already_member: alreadyMember, membership_written: !alreadyMember, membership_write: write };
}

function syncReceipt({ personId, listId, committee, dossierId, action, alreadyMember, membershipWrite }) {
  const idempotencyKey = sha256({ personId, listId, committee, dossierId });
  return {
    schema: 'td613.giving.campaign-deputy-sync-receipt/v1',
    action,
    personId,
    listId,
    committee,
    dossierId,
    idempotency_key: idempotencyKey,
    already_member: Boolean(alreadyMember),
    membership_write_attempts: membershipWrite?.attempts || 0,
    person_availability_retried: Boolean(membershipWrite?.availability_retried),
    external_contribution_created: false,
    relationship_semantics: 'REVIEWED_COMMITTEE_LIST_MEMBERSHIP_NOT_CAMPAIGN_DEPUTY_CONTRIBUTION'
  };
}

export async function linkExisting(payload = {}, context = {}) {
  if (payload.confirmed !== true) throw new GivingError('identity-confirmation-required', 'Linking requires explicit human identity confirmation', 409);
  const personId = opaqueId(payload.person_id, 'person_id');
  const committee = committeeName(payload.committee);
  const dossierId = opaqueId(payload.dossier_id, 'dossier_id');
  const membership = await ensureMembership({ personId, committee, listId: payload.list_id }, context);
  const sync = syncReceipt({
    personId, listId: membership.list.id, committee, dossierId,
    action: membership.already_member ? 'MEMBERSHIP_ALREADY_PRESENT' : 'EXISTING_CONTACT_LINKED',
    alreadyMember: membership.already_member,
    membershipWrite: membership.membership_write
  });
  return {
    person: { personId, path: 'EXISTING_CONTACT' },
    list: membership.list,
    sync,
    receipt: sync
  };
}

function sanitizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return null;
  const normalized = digits.length === 10 ? `+1${digits}` : `+${digits}`;
  return /^\+\d{7,15}$/.test(normalized) ? normalized : null;
}

function selectedPerson(payload) {
  const selected = new Set(Array.isArray(payload.selected_fields) ? payload.selected_fields : []);
  const source = payload.person && typeof payload.person === 'object' ? payload.person : {};
  const allowed = new Set(['name', 'primaryEmailAddress', 'primaryPhone', 'occupation', 'employer', 'primaryAddress']);
  if ([...selected].some((field) => !allowed.has(field))) throw new GivingError('unsupported-contact-field', 'Only documented Campaign Deputy person fields may be selected', 400);
  if (!selected.has('name')) throw new GivingError('contact-name-required', 'Creating a contact requires the operator-selected name field', 400);
  const givenName = cleanText(source.name?.givenName, 160);
  const familyName = cleanText(source.name?.familyName, 160);
  if (!givenName || !familyName) throw new GivingError('contact-name-required', 'Created contact requires givenName and familyName', 400);
  const person = { name: { givenName, familyName } };
  if (cleanText(source.name?.prefix, 40)) person.name.prefix = cleanText(source.name.prefix, 40);
  if (cleanText(source.name?.suffix, 40)) person.name.suffix = cleanText(source.name.suffix, 40);
  if (selected.has('primaryEmailAddress')) person.primaryEmailAddress = cleanText(source.primaryEmailAddress, 320);
  if (selected.has('primaryPhone')) person.primaryPhone = sanitizePhone(source.primaryPhone);
  if (selected.has('occupation')) person.occupation = cleanText(source.occupation, 300);
  if (selected.has('employer')) person.employer = cleanText(source.employer, 300);
  if (selected.has('primaryAddress')) {
    person.primaryAddress = {
      deliveryLine1: cleanText(source.primaryAddress?.deliveryLine1, 300),
      deliveryLine2: cleanText(source.primaryAddress?.deliveryLine2, 300),
      city: cleanText(source.primaryAddress?.city, 120),
      stateProvince: cleanText(source.primaryAddress?.stateProvince, 80),
      postalCode: cleanText(source.primaryAddress?.postalCode, 24)
    };
  }
  person.originSourceCode = 'TD613_GIVING_REVIEWED';
  return person;
}

export async function createConfirmed(payload = {}, context = {}) {
  if (payload.confirmed !== true || payload.duplicate_reviewed !== true || payload.create_new_confirmed !== true) {
    throw new GivingError('explicit-create-gesture-required', 'Creating a contact requires identity confirmation, duplicate review, and a separate create-new gesture', 409);
  }
  const committee = committeeName(payload.committee);
  const dossierId = opaqueId(payload.dossier_id, 'dossier_id');
  const personPayload = selectedPerson(payload);
  const body = await campaignDeputyFetch('/people', {
    method: 'PUT',
    body: JSON.stringify(personPayload)
  }, context);
  const created = body?.data || body;
  const personId = opaqueId(created?.id, 'created_person_id');
  const membership = await ensureMembership({ personId, committee, listId: payload.list_id, retryForAvailability: true }, context);
  const sync = syncReceipt({
    personId, listId: membership.list.id, committee, dossierId,
    action: 'NEW_CONTACT_CREATED_AND_LINKED', alreadyMember: membership.already_member,
    membershipWrite: membership.membership_write
  });
  return {
    person: { ...created, path: 'EXPLICIT_NEW_CONTACT', selected_fields: [...new Set(payload.selected_fields)] },
    list: membership.list,
    sync,
    receipt: sync
  };
}

export function withhold(payload = {}) {
  const dossierId = opaqueId(payload.dossier_id, 'dossier_id');
  const committee = payload.committee ? committeeName(payload.committee) : null;
  return {
    schema: 'td613.giving.campaign-deputy-sync-receipt/v1',
    action: 'WITHHOLD',
    dossierId,
    committee,
    external_mutation: false,
    reviewed_at: new Date().toISOString(),
    reason: cleanText(payload.reason, 300) || 'Operator withheld Campaign Deputy writeback'
  };
}

export function campaignDeputyReadiness() {
  return {
    configured: Boolean(String(process.env.CAMPAIGN_DEPUTY_API_KEY || '').trim()),
    api_origin: API_BASE,
    credential_type: 'CAMPAIGN_DEPUTY_CUSTOM_API_KEY',
    required_scopes: REQUIRED_SCOPES,
    setup_surface: 'Settings > Integrations > Campaign Deputy API',
    people_index: 'PAGINATED_NO_SEARCH_FILTER',
    create_method: 'PUT /v1/people',
    asynchronous_match_endpoint_used: false,
    historical_contribution_writeback_used: false,
    giving_history: {
      staging_available_without_api_key: true,
      staging_operation: 'campaign-deputy.prepare-giving-history',
      write_status: 'HELD_AWAITING_CAMPAIGN_DEPUTY_CONTRACT',
      public_write_endpoint_documented: false,
      contribution_endpoint_allowed: false
    }
  };
}

export const _campaignDeputyInternals = Object.freeze({ sanitizePhone, selectedPerson, syncReceipt, opaqueCursor, isPersonAvailabilityLag });

