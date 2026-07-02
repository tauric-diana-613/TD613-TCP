import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');
const schema = JSON.parse(read('app/dome-world/schemas/ash-cinder.schema.json'));
const runtime = read('packages/dome_world_exact/ash_v06.py');
const html = read('app/dome-world/ash-custody.html');

assert.equal(schema.$id, 'td613.ash.cinder/v0.6');
assert.equal(schema.properties.raw_document_exported.const, false);
assert.equal(schema.properties.claimCeiling.const, 'ash-cinder-fragment-not-full-document');
assert.match(runtime, /operatorApproved/);
assert.match(runtime, /source_receipt_required/);
assert.match(runtime, /fragment_required/);
assert.match(runtime, /salt_scope/);
assert.match(runtime, /source-receipt-id-required/);
assert.match(runtime, /non-empty-fragment-required/);
assert.match(html, /Cinder Builder/);
assert.match(html, /Operator approval recorded/);
assert.match(html, /saltScope:\$\('saltScope'\)\.value/);
assert.match(html, /ash-cinder/);
assert.match(html, /ash-veil/);

const cinderGuard = spawnSync('python3', ['-c', `
import hashlib, importlib.util, json, pathlib
path = pathlib.Path("packages/dome_world_exact/ash_v06.py")
spec = importlib.util.spec_from_file_location("ash_v06_direct", path)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
ash_cinder = mod.ash_cinder

def sha256(value):
    data = json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return "sha256:" + hashlib.sha256(data).hexdigest()

def now():
    return "2026-07-02T00:00:00Z"

empty = ash_cinder({
    "receipt": {"receipt_id": "ashc_source"},
    "fragment": "",
    "operatorApproved": True
}, {}, sha256, now)
assert empty["status"] == "HELD", empty
assert empty["content_exported"] is False, empty
assert "non-empty-fragment-required" in empty["export_blocked_reason"], empty

unlinked = ash_cinder({
    "fragment": "minimal approved fragment",
    "operatorApproved": True
}, {}, sha256, now)
assert unlinked["status"] == "HELD", unlinked
assert unlinked["content_exported"] is False, unlinked
assert "source-receipt-id-required" in unlinked["export_blocked_reason"], unlinked

approved = ash_cinder({
    "receipt": {"receipt_id": "ashc_source"},
    "fragment": "minimal approved fragment",
    "operatorApproved": True,
    "saltScope": "receipt-scoped"
}, {}, sha256, now)
assert approved["status"] in {"OPEN", "HELD"}, approved
assert approved["source_receipt_id"] == "ashc_source", approved
assert approved["salt_scope"] == "receipt-scoped", approved
assert approved["source_receipt_required"] is True, approved
assert approved["fragment_required"] is True, approved
assert approved["raw_document_exported"] is False, approved
`], { cwd: root, encoding: 'utf8' });
assert.equal(cinderGuard.status, 0, cinderGuard.stderr || cinderGuard.stdout);

console.log('Ash Cinder contract: PASS');
