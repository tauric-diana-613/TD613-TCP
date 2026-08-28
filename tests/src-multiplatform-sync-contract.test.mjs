import fs from 'node:fs';
import assert from 'node:assert/strict';

const workflow = fs.readFileSync('.github/workflows/src-multiplatform-sync.yml', 'utf8');
const oldWorkflow = fs.readFileSync('.github/workflows/vercel-relock-safety.yml', 'utf8');
const adapter = fs.readFileSync('scripts/src-platform-operator-sync.py', 'utf8');

assert.match(oldWorkflow, /\/src-zenodo-sync ATELIER/, 'legacy bounded Zenodo gate must remain intact');
assert.match(workflow, /\/src-sync ATELIER/, 'multi-platform gate command missing');
assert.match(workflow, /GATE_ISSUE:\s*'758'/, 'multi-platform route must remain on gate #758');
assert.match(workflow, /all_platform_delta_claims_complete/, 'receipt must expose completeness state');
assert.match(workflow, /A platform HOLD means the gate refused to invent a complete delta/, 'HOLD semantics must be explicit');

assert.match(adapter, /DEFAULT_SUBSTACK_FEED/, 'Substack adapter missing');
assert.match(adapter, /DEFAULT_MEDIUM_FEED/, 'Medium adapter missing');
assert.match(adapter, /HOLD_DISCOVERY_ROUTE_REQUIRED/, 'Academia incomplete-discovery hold missing');
assert.match(adapter, /public availability is not redistribution permission/, 'rights membrane missing');
assert.match(adapter, /body_publicly_redistributed": False/, 'platform bodies must remain non-redistributed');
assert.doesNotMatch(adapter, /02-ORIGINALS.*substack|02-ORIGINALS.*medium|02-ORIGINALS.*academia/i,
  'platform adapter must not write private HTML into the public original store');

console.log('SRC multi-platform sync contract: PASS');
