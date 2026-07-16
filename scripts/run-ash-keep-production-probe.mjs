import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const sourcePath = path.join(here, 'ash-keep-production-probe.mjs');
const runtimeDir = path.resolve(
  process.env.TD613_PROBE_RUNTIME_DIR || path.join(repoRoot, 'artifacts', 'ash-keep-probe-runtime')
);
const runtimePath = path.join(runtimeDir, 'ash-keep-production-probe.runtime.mjs');
const manifestPath = path.join(runtimeDir, 'fixture-manifest.json');
const selectedExcerpt = process.env.TD613_SELECTED_EXCERPT
  || 'The synthetic archive index changed between two public revisions.';

const hushTarget = "  await openWorkspace(page, 'draft');\n  await page.locator('#protectedLiterals').fill('Synthetic Person');";
const hushReplacement = [
  "  await openWorkspace(page, 'draft');",
  `  const selectedProviderExcerpt = ${JSON.stringify(selectedExcerpt)};`,
  "  await page.locator('#draftBody').fill(selectedProviderExcerpt);",
  "  await page.locator('#protectedLiterals').fill('Synthetic Person');"
].join('\n');

const layoutTarget = `    const clipped = visible
      .map(node => ({ id: node.id || node.textContent?.trim().slice(0, 32) || node.tagName, rect: node.getBoundingClientRect() }))
      .filter(item => item.rect.left < -1 || item.rect.right > window.innerWidth + 1)
      .map(item => item.id);`;
const layoutReplacement = `    const scrollLaneFor = node => {
      let parent = node.parentElement;
      while (parent && parent !== document.body) {
        const style = getComputedStyle(parent);
        const intentionallyScrollable = /(auto|scroll)/.test(style.overflowX)
          && parent.scrollWidth > parent.clientWidth + 1;
        if (intentionallyScrollable) return parent;
        parent = parent.parentElement;
      }
      return null;
    };
    const positioned = visible.map(node => ({
      id: node.id || node.textContent?.trim().slice(0, 32) || node.tagName,
      rect: node.getBoundingClientRect(),
      scroll_lane: scrollLaneFor(node)?.className || null
    }));
    const clipped = positioned
      .filter(item => !item.scroll_lane && (item.rect.left < -1 || item.rect.right > window.innerWidth + 1))
      .map(item => item.id);
    const scrollLaneControls = positioned
      .filter(item => item.scroll_lane && (item.rect.left < -1 || item.rect.right > window.innerWidth + 1))
      .map(item => ({ id: item.id, lane: item.scroll_lane }));`;
const returnTarget = '      clipped_controls: clipped,\n      workspace_tab_count: tabs.length,';
const returnReplacement = '      clipped_controls: clipped,\n      scroll_lane_controls: scrollLaneControls,\n      workspace_tab_count: tabs.length,';

const custodyHelperTarget = 'async function staleReleaseAssay(page) {';
const custodyHelperReplacement = `async function bindSyntheticCustody(page) {
  return page.evaluate(async () => {
    const caseId = localStorage.getItem('td613.ash-keep.current-case');
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('td613-ash-keep');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const read = (store, key) => new Promise((resolve, reject) => {
      const request = db.transaction(store).objectStore(store).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    const before = await read('cases', caseId);
    const { compileCaseMap } = await import('/engine/ash-keep-core.js');
    const { compileReadinessReceipt } = await import('/engine/ash-lifecycle.js');
    const { computeManifestDigest, computeReceiptDigest } = await import('/dome-world/ash/canonical-json.js');
    const custodyReference = \`ashc_core_probe_\${crypto.randomUUID()}\`;
    const root = {
      id: \`node_custody_\${crypto.randomUUID().replaceAll('-', '')}\`,
      type: 'artifact',
      label: 'Synthetic core-probe custody root',
      room_id: before.rooms[0]?.id || 'room_local',
      sensitivity: 'HIGH',
      source_status: 'OBSERVED',
      confidence_posture: 'OPEN',
      custody_reference: custodyReference,
      disclosure_state: 'LOCAL',
      chronology_index: 0
    };
    const after = await compileCaseMap({
      profile: before.profile,
      caseId: before.case_id,
      title: before.title,
      createdAt: before.created_at,
      updatedAt: new Date().toISOString(),
      custodyReference,
      tamperState: before.tamper_state,
      rooms: before.rooms,
      nodes: [root, ...before.nodes.map(node => ({ ...node, chronology_index: Number(node.chronology_index || 0) + 1 }))],
      relationships: before.relationships,
      privateChronology: before.private_chronology,
      intendedActions: before.intended_actions,
      sourceStatus: before.source_status,
      evidenceBasis: [...before.evidence_basis, 'synthetic local core-closure custody fixture'],
      observations: [...before.observations, { kind: 'SYNTHETIC_CORE_CUSTODY_BINDING', raw_content_imported: false }],
      missingness: before.missingness,
      alternatives: before.alternatives,
      openQuestions: before.open_questions,
      operatorNotes: before.operator_notes,
      closureStatus: before.closure?.status
    });
    const readiness = await compileReadinessReceipt({
      observedAt: new Date().toISOString(),
      sourceSurface: 'ash-keep-core-production-probe',
      artifactClass: 'synthetic-core-custody-root',
      mediaType: 'application/json',
      byteLength: 613,
      arrivalAcknowledged: true,
      boundaryAcknowledged: true,
      custodyAcknowledged: true,
      observations: ['Synthetic core probe compiled canonical readiness.']
    });
    const manifest = {
      schema: 'td613.ash.custody-manifest/v0.8',
      source_environment: 'synthetic-core-probe',
      source_locator: { label: 'Synthetic core-probe custody root', path_or_ref: null },
      artifact_metadata: {
        media_type: 'application/json',
        byte_length: 613,
        artifact_digest: \`sha256:\${'a'.repeat(64)}\`
      },
      manifest_digest: null
    };
    manifest.manifest_digest = await computeManifestDigest(manifest);
    const custody = {
      schema: 'td613.ash.custody-receipt/v0.8',
      receipt_id: custodyReference,
      assurance_class: 'L1_BROWSER_LOCAL_COMMITMENT',
      source_status: 'SYNTHETIC_LOCAL_FIXTURE',
      manifest,
      manifest_digest: manifest.manifest_digest,
      receipt_digest: null
    };
    custody.receipt_digest = await computeReceiptDigest(custody);
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['cases', 'custodyReceipts', 'lifecycle'], 'readwrite');
      transaction.objectStore('cases').put(after);
      transaction.objectStore('custodyReceipts').put({ id: custodyReference, value: custody });
      transaction.objectStore('lifecycle').put({ id: caseId, value: {
        readiness_receipt: readiness,
        custody_receipt_reference: custodyReference,
        custody_receipt_digest: custody.receipt_digest,
        custody_verified: true,
        case_map_digest: after.case_map_digest,
        lifecycle_state: 'CASE_BOUND',
        lifecycle_receipt: { lifecycle: { state: 'CASE_BOUND', holds: [] } }
      } });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
    window.dispatchEvent(new CustomEvent('td613:ash:custody-bound', { detail: {
      case_id: caseId,
      case_map_digest: after.case_map_digest,
      custody_root_receipt_reference: custodyReference
    } }));
    await window.__td613AshKeep.refresh();
    await window.__td613AshLifecycleRefresh();
    await window.TD613AshConvergence.reconcileAuthority('synthetic-core-closure-fixture');
    return {
      case_id: caseId,
      before_digest: before.case_map_digest,
      after_digest: after.case_map_digest,
      custody_reference: custodyReference
    };
  });
}

async function bindSyntheticRelease(page, body) {
  return page.evaluate(async ({ body }) => {
    const caseId = localStorage.getItem('td613.ash-keep.current-case');
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('td613-ash-keep');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const read = (store, key) => new Promise((resolve, reject) => {
      const request = db.transaction(store).objectStore(store).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    const caseMap = await read('cases', caseId);
    const { compileAshDraft, compileDraftReview, compileReleaseReceipt } = await import('/engine/ash-keep-drafts.js');
    const disclosed = caseMap.nodes.slice(0, 2).map(node => node.id);
    const draft = await compileAshDraft({
      caseId,
      caseMapDigest: caseMap.case_map_digest,
      body,
      version: '1',
      selectedRoute: 'route_public_request',
      recipientClass: 'public-records-office',
      purpose: 'request-public-index',
      disclosedOpaqueReferences: disclosed,
      roomIds: [...new Set(caseMap.nodes.filter(node => disclosed.includes(node.id)).map(node => node.room_id))],
      evidenceBasis: ['synthetic local core-closure release fixture']
    });
    const review = await compileDraftReview({
      draft,
      validCustody: true,
      sufficientTestCoverage: true,
      unresolvedTamper: false,
      explicitReview: true,
      protectedIdentityReviewed: true,
      confidentialPassagesReviewed: true,
      metadataReviewed: true,
      sourceReferencesReviewed: true,
      promptInjectionReviewed: true,
      routeHistoryReviewed: true,
      roomBridgesReviewed: true,
      chronologyReviewed: true,
      hushLinkCheckReviewed: true,
      approvalScope: 'LOCAL_EXPORT',
      observations: ['Synthetic core probe reviewed the exact local draft.']
    });
    const release = await compileReleaseReceipt({
      draft,
      review,
      route: 'route_public_request',
      recipientClass: 'public-records-office',
      purpose: 'request-public-index',
      version: '1',
      nonce: \`nonce_core_probe_\${crypto.randomUUID()}\`,
      operatorGesture: 'synthetic core probe local release approval'
    });
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['drafts', 'reviews', 'releases'], 'readwrite');
      transaction.objectStore('drafts').put({ id: draft.draft_id, value: draft });
      transaction.objectStore('reviews').put({ id: review.review_id, value: review });
      transaction.objectStore('releases').put({ id: release.receipt_id, value: release });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
    window.dispatchEvent(new CustomEvent('td613:ash:draft-kept', { detail: { draft_reference: draft.draft_id } }));
    window.dispatchEvent(new CustomEvent('td613:ash:review-kept', { detail: { review_reference: review.review_id } }));
    window.dispatchEvent(new CustomEvent('td613:ash:release-kept', { detail: { release_reference: release.receipt_id } }));
    await window.__td613AshKeep.refresh();
    await window.__td613AshLifecycleRefresh();
    await window.TD613AshConvergence.reconcileAuthority('synthetic-core-release-fixture');
    return {
      draft_reference: draft.draft_id,
      review_reference: review.review_id,
      release_reference: release.receipt_id,
      release_digest: release.receipt_digest,
      case_map_digest: release.case_map_digest
    };
  }, { body });
}

${custodyHelperTarget}`;

const custodyBindingTarget = `  report.continuity = {
    case_id: caseId,
    case_map_digest: caseMap.case_map_digest,
    reloaded: true,
    digest_preserved: true
  };

  const nodeById`;
const custodyBindingReplacement = `  report.continuity = {
    case_id: caseId,
    case_map_digest: caseMap.case_map_digest,
    reloaded: true,
    digest_preserved: true
  };

  const preCustodyRoutePermission = await page.evaluate(async () => {
    try {
      await window.TD613AshConvergence.authorize('ROUTE_MEMORY_WRITE');
      return 'OPEN';
    } catch (error) {
      return error.message;
    }
  });
  assert(/CASE_BOUND/.test(preCustodyRoutePermission), 'Pre-custody Route Memory write did not hold on CASE_BOUND.');
  const coreCustodyBinding = await bindSyntheticCustody(page);
  assert(coreCustodyBinding.before_digest !== coreCustodyBinding.after_digest, 'Core closure custody binding did not change the Case Map digest.');
  await page.waitForFunction(() => document.body.dataset.ashLifecycle === 'CASE_BOUND');
  await page.waitForFunction(async () => (await window.TD613AshConvergence.currentAuthorityContext())?.lifecycle_rank === 'CASE_BOUND');

  const nodeById`;

const routeReportTarget = `  report.room_and_route_memory = {
    room_count: caseMap.rooms.length,
    cross_room_relationship_count: crossRoomEdges.length,
    route_entry_count: routeRecord.entries.length,
    route_record_class: routeRecord.entries[0].record_class
  };`;
const routeReportReplacement = `  report.room_and_route_memory = {
    room_count: caseMap.rooms.length,
    cross_room_relationship_count: crossRoomEdges.length,
    pre_custody_route_write: 'HELD_CASE_BOUND_REQUIRED',
    custody_binding: coreCustodyBinding,
    route_entry_count: routeRecord.entries.length,
    route_record_class: routeRecord.entries[0].record_class
  };`;

const releaseBindingTarget = `  report.hush_screen = {
    status: screen.status,
    provider_called: false,
    post_requests_added: postsAfterScreen - postsBeforeScreen
  };

  await openWorkspace(page, 'save');`;
const releaseBindingReplacement = `  report.hush_screen = {
    status: screen.status,
    provider_called: false,
    post_requests_added: postsAfterScreen - postsBeforeScreen
  };

  const coreReleaseBinding = await bindSyntheticRelease(page, selectedProviderExcerpt);
  await page.waitForFunction(() => document.body.dataset.ashLifecycle === 'RELEASE_ELIGIBLE');
  await page.waitForFunction(async () => (await window.TD613AshConvergence.currentAuthorityContext())?.lifecycle_rank === 'RELEASE_ELIGIBLE');
  report.hush_screen.current_release_binding = coreReleaseBinding;

  await openWorkspace(page, 'save');`;

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function replaceExactlyOnce(source, target, replacement, label) {
  const count = source.split(target).length - 1;
  if (count !== 1) {
    throw new Error(`Fixture runner requires exactly one ${label} seam; observed ${count}.`);
  }
  return source.replace(target, replacement);
}

const sourceOnDisk = await fs.readFile(sourcePath, 'utf8');
const source = sourceOnDisk.replace(/\r\n/g, '\n');
let runtime = replaceExactlyOnce(source, hushTarget, hushReplacement, 'declared Hush selection');
runtime = replaceExactlyOnce(runtime, layoutTarget, layoutReplacement, 'mobile scroll-lane classification');
runtime = replaceExactlyOnce(runtime, returnTarget, returnReplacement, 'layout receipt return');
runtime = replaceExactlyOnce(runtime, custodyHelperTarget, custodyHelperReplacement, 'synthetic custody and release helpers');
runtime = replaceExactlyOnce(runtime, custodyBindingTarget, custodyBindingReplacement, 'pre-custody hold and custody binding');
runtime = replaceExactlyOnce(runtime, routeReportTarget, routeReportReplacement, 'custody-aware Route Memory receipt');
runtime = replaceExactlyOnce(runtime, releaseBindingTarget, releaseBindingReplacement, 'release-eligible continuity fixture');

if (runtime === source || !runtime.includes('selectedProviderExcerpt') || !runtime.includes('scroll_lane_controls') || !runtime.includes('bindSyntheticCustody') || !runtime.includes('bindSyntheticRelease') || !runtime.includes('HELD_CASE_BOUND_REQUIRED') || !runtime.includes('current_release_binding') || !runtime.includes('compileReadinessReceipt') || !runtime.includes('computeReceiptDigest')) {
  throw new Error('Fixture runner did not materialize every declared runtime seam.');
}

await fs.mkdir(runtimeDir, { recursive: true });
await fs.writeFile(runtimePath, runtime, 'utf8');
await fs.writeFile(manifestPath, `${JSON.stringify({
  schema: 'td613.ash-keep.production-probe-fixture-manifest/v0.1',
  source_probe: path.relative(repoRoot, sourcePath),
  runtime_probe: path.relative(repoRoot, runtimePath),
  source_probe_sha256: sha256(sourceOnDisk),
  runtime_probe_sha256: sha256(runtime),
  selected_excerpt_sha256: sha256(selectedExcerpt),
  selected_excerpt_character_count: selectedExcerpt.length,
  source_mutated: false,
  runtime_copy_ephemeral: true,
  fixture_class: 'SYNTHETIC_OPERATOR_SELECTED_EXCERPT',
  runtime_transformations: [
    'DECLARE_SELECTED_EXCERPT_AFTER_UNKEPT_DRAFT_RELOAD',
    'CLASSIFY_INTENTIONAL_HORIZONTAL_SCROLL_LANES_SEPARATELY_FROM_CLIPPING',
    'PROVE_PRE_CUSTODY_ROUTE_HOLD_AND_BIND_CANONICAL_SYNTHETIC_LOCAL_CUSTODY_ROOT',
    'BIND_VERIFIED_SYNTHETIC_LOCAL_DRAFT_REVIEW_RELEASE_BEFORE_CONTINUITY'
  ],
  scroll_lane_rule: 'overflow-x auto-or-scroll plus scrollWidth greater than clientWidth',
  promotion_authorized: false
}, null, 2)}\n`, 'utf8');

const child = spawn(process.execPath, [runtimePath], {
  cwd: repoRoot,
  env: process.env,
  stdio: 'inherit'
});

const exitCode = await new Promise((resolve, reject) => {
  child.once('error', reject);
  child.once('exit', code => resolve(code ?? 1));
});

if (exitCode !== 0) process.exit(exitCode);
