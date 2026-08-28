import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const SRC = 'packages/dome_world_exact/fixtures/a15-r0/SRC';

test('connector readability contract is archive-first and typed', () => {
  const connector = fs.readFileSync(path.join(SRC, 'CONNECTOR_ENTRY.md'), 'utf8');
  assert.match(connector, /Connector readability contract/);
  assert.match(connector, /READABLE_DIRECT/);
  assert.match(connector, /READABLE_EQUIVALENT/);
  assert.match(connector, /HUMAN_GATED/);
  assert.match(connector, /MISSING_DERIVATIVE_BUG/);
  assert.match(connector, /direct derivative[\s\S]*explicit platform DOI link[\s\S]*normalized-title-exact crosswalk[\s\S]*explicit blocker[\s\S]*external web discovery/);
  assert.match(connector, /Never use fuzzy-title candidates to establish work identity/);
});

test('connector readability interface is registered', () => {
  const registry = JSON.parse(fs.readFileSync(path.join(SRC, '01-MANIFESTS/phase2/interface-registry.json'), 'utf8'));
  const readable = registry.interfaces.find((row) => row.name === 'connector-readability');
  assert.ok(readable);
  assert.equal(readable.path, '99-ADMIN/srcquery.py');
  assert.deepEqual(readable.contract, [
    'READABLE_DIRECT',
    'READABLE_EQUIVALENT',
    'HUMAN_GATED',
    'MISSING_DERIVATIVE_BUG'
  ]);
});

test('srcquery exposes a seal-pinned read command without weakening private-path membrane', () => {
  const queryPath = path.join(SRC, '99-ADMIN/srcquery.py');
  const source = fs.readFileSync(queryPath, 'utf8');
  assert.match(source, /def readable\(root: Path, query: str\)/);
  assert.match(source, /explicit-platform-doi-link/);
  assert.match(source, /normalized-title-exact/);
  assert.match(source, /PRIVATE_CAPTURE_NO_PUBLIC_TEXT_DERIVATIVE/);
  assert.match(source, /No web fallback before archive resolution/);
  assert.doesNotMatch(source, /fuzzy-and-platform-only-review/);

  const compiled = spawnSync('python3', ['-m', 'py_compile', queryPath], { encoding: 'utf8' });
  assert.equal(compiled.status, 0, compiled.stderr || compiled.stdout);
});

test('public projection still does not expose private body resolver paths', () => {
  const opaquePath = path.join(SRC, '01-MANIFESTS/phase2/opaque-private-locators.jsonl');
  if (fs.existsSync(opaquePath)) {
    for (const line of fs.readFileSync(opaquePath, 'utf8').split(/\r?\n/).filter(Boolean)) {
      const row = JSON.parse(line);
      assert.equal(row.private_path_disclosed, false);
      assert.equal('local_path' in row, false);
    }
  }
  assert.equal(fs.existsSync(path.join(SRC, '01-MANIFESTS/phase2/private-body-resolver.jsonl')), false);
});
