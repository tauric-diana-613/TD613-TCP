import { authorizeAuthorityAction, verifyAuthorityContext } from './ash-constitutional-convergence.js';
import { verifyRebuildTest } from './ash-keep-core.js';

export async function inspectHushAuthority(input = {}, options = {}) {
  const authority = input.authorityContext;
  const current = {
    caseId: input.caseId,
    caseMapDigest: input.caseMapDigest,
    routeMemoryDigest: input.routeMemoryDigest
  };
  const verified = await verifyAuthorityContext(authority, current, options);
  const permission = verified
    ? authorizeAuthorityAction(authority, 'HUSH_CANDIDATE')
    : Object.freeze({ action: 'HUSH_CANDIDATE', authorized: false });
  return Object.freeze({ verified, permission });
}

export async function inspectHushRebuild(input = {}, options = {}) {
  const rebuild = input.rebuildReceipt;
  const verified = await verifyRebuildTest(rebuild, options);
  const bound = Boolean(
    verified
    && rebuild.case_id === input.caseId
    && rebuild.case_map_digest === input.caseMapDigest
    && rebuild.route_memory_reference === input.routeMemoryDigest
    && rebuild.test_id === input.authorityContext?.rebuild_receipt_reference
  );
  return Object.freeze({ verified, bound });
}
