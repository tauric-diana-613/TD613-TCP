import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  compileAiaSurfaceBinding,
  compileAiaSurfaceProjection,
  verifyAiaSurfaceProjectionFamily
} from '../app/engine/flowcore-aia-surface-binding.js';

const SRC = 'packages/dome_world_exact/fixtures/a15-r0/SRC';
const ROUTES = ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION'];

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(SRC, relative), 'utf8'));
}

test('SRC is a metadata-bounded, authority-closed four-route AIA fixture', () => {
  const declaration = readJson('aia/surface-declaration.json');
  assert.deepEqual(declaration.routes, ROUTES);
  assert.equal(declaration.route_inference_forbidden, true);
  assert.equal(declaration.fabricated_decoys, false);
  assert.equal(declaration.authority.human_closure_required, true);
  assert.deepEqual(declaration.forbidden_payloads, ['raw_bodies', 'credentials', 'cookies', 'authorization_headers', 'private_tokens']);

  const binding = compileAiaSurfaceBinding({
    surface_reference: declaration.surface_id,
    host_station: declaration.host_station,
    governance_context: declaration.governance_context,
    nested_surface: declaration.nested_surface,
    routes: declaration.routes,
    route_selection: declaration.route_selection,
    route_inference_forbidden: declaration.route_inference_forbidden,
    outside_posture: declaration.outside_posture,
    fabricated_decoys: declaration.fabricated_decoys,
    rest: { available: declaration.rest.available_without_penalty, penalty: false },
    exit: { available: declaration.exit.available_without_penalty, penalty: false },
    authority: {
      station_mutation_authorized: declaration.authority.station_mutation,
      automatic_release: declaration.authority.automatic_release,
      automatic_redesign: declaration.authority.automatic_redesign,
      route_inference_allowed: false,
      authority_may_cross: declaration.authority.transfer,
      human_closure_required: declaration.authority.human_closure_required
    }
  });

  const invariants = Object.fromEntries(declaration.governed_invariants.map((key) => [key, `PRESERVED:${key}`]));
  const projections = ROUTES.map((route) => compileAiaSurfaceProjection(binding, route, {
    governed_reference: 'SRC:SEALED_QUERY_EPOCH',
    invariants,
    surface: {
      route,
      purpose: declaration.projections[route].purpose,
      authority: declaration.projections[route].authority
    }
  }));
  const report = verifyAiaSurfaceProjectionFamily(binding, projections);
  assert.equal(report.pair_count, 6);
  assert.equal(report.all_surfaces_non_equivalent, true);
  assert.equal(report.authority_transferred, false);
  assert.equal(report.human_closure_required, true);
});

test('SRC remains outside Vercel and GitHub Pages publication surfaces', () => {
  const vercelIgnore = fs.readFileSync('.vercelignore', 'utf8');
  assert.match(vercelIgnore, /^packages\/dome_world_exact\/fixtures\/?$/m);
  const pages = fs.readFileSync('.github/workflows/pages.yml', 'utf8');
  assert.match(pages, /path:\s*\.\/app\b/);
  assert.doesNotMatch(pages, /packages\/dome_world_exact\/fixtures|\bSRC\b/);
  const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  assert.equal(vercel.git?.deploymentEnabled, false);
});

test('public SRC projection contains no restricted body or private-path disclosure', () => {
  const projection = readJson('projection.json');
  assert.equal(projection.profile, 'public');
  const opaquePath = path.join(SRC, '01-MANIFESTS/phase2/opaque-private-locators.jsonl');
  if (fs.existsSync(opaquePath)) {
    for (const line of fs.readFileSync(opaquePath, 'utf8').split(/\r?\n/).filter(Boolean)) {
      const row = JSON.parse(line);
      assert.match(row.private_body_locator_id, /^src-private-locator:[a-f0-9]{24}$/);
      assert.equal(row.private_path_disclosed, false);
      assert.equal('local_path' in row, false);
      assert.equal('source_name' in row, false);
    }
  }
  assert.equal(fs.existsSync(path.join(SRC, '01-MANIFESTS/phase2/private-body-resolver.jsonl')), false);
});

test('connector contract forbids latest-wins and requires a matched seal epoch', () => {
  const connector = fs.readFileSync(path.join(SRC, 'CONNECTOR_ENTRY.md'), 'utf8');
  assert.match(connector, /Mandatory epoch binding/);
  assert.match(connector, /seal_id/);
  assert.match(connector, /atelier_snapshot_id/);
  assert.match(connector, /CURRENT_CONTROLS/);
  assert.match(connector, /SUPERSEDES_SCOPE/);
  assert.match(connector, /Newest manifestation is a chronological fact\. A controlling formulation is an authority relation\./);
});

test('public projection binds a shared epoch to a profile-specific seal', () => {
  const current = readJson('04-RECEIPTS/phase2/current-seal.json');
  const projectionSeal = readJson('04-RECEIPTS/phase2/projection-seal.json');
  assert.equal(current.seal_id, projectionSeal.seal_id);
  assert.equal(current.atelier_snapshot_id, projectionSeal.atelier_snapshot_id);
  assert.equal(current.projection_profile, 'public');
  assert.equal(projectionSeal.projection_profile, 'public');
  assert.equal(current.projection_seal_id, projectionSeal.projection_seal_id);
  assert.match(current.seal_id, /^src-seal:[a-f0-9]{64}$/);
  assert.match(current.projection_seal_id, /^src-projection-seal:[a-f0-9]{64}$/);
  assert.equal(fs.existsSync(path.join(SRC, '04-RECEIPTS/phase2/seals')), false);
});
