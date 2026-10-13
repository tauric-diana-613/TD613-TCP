import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const corpus = path.join(root, 'app', 'safe-harbor', 'corpus');
const read = (name, encoding = null) => fs.readFileSync(path.join(corpus, name), encoding);
const digest = (algorithm, value) => crypto.createHash(algorithm).update(value).digest('hex');

const provenance = JSON.parse(read('binding_provenance_manifest.json', 'utf8'));
const receipt = JSON.parse(read('binding_event_receipt.json', 'utf8'));
const envelope = JSON.parse(read('binding_event_envelope.json', 'utf8'));
const declaration = read('binding_event_text.txt', 'utf8')
  .replace(/\r\n/g, '\n')
  .normalize('NFC');
const declarationBytes = Buffer.from(declaration, 'utf8');
const fullHexBytes = Buffer.from(read('binding_event_full_hex.txt', 'utf8').trim(), 'hex');

assert.equal(provenance.schema_version, 'td613.safe-harbor.binding-provenance/v1');
assert.equal(declarationBytes.length, provenance.canonical_declaration.utf8_byte_count);
assert.equal([...declaration].length, provenance.canonical_declaration.unicode_scalar_count);
assert.equal(digest('sha256', declarationBytes), provenance.canonical_declaration.sha256);
assert.equal(digest('md5', declarationBytes), provenance.canonical_declaration.md5_legacy);
assert.equal(receipt.sha256, provenance.canonical_declaration.sha256);
assert.equal(receipt.md5, provenance.canonical_declaration.md5_legacy);
assert.deepEqual(fullHexBytes, declarationBytes, 'full hex artifact must decode to the canonical declaration bytes');

const rootPreimage = JSON.stringify(provenance.legacy_corpus_root.leaves);
assert.equal(
  digest('sha256', rootPreimage),
  provenance.legacy_corpus_root.sha256,
  'legacy corpus root must replay from its ordered leaf records'
);
assert.equal(
  provenance.claim.binding_fragment,
  provenance.canonical_declaration.sha256.slice(0, 7).toUpperCase(),
  'binding fragment must remain the first seven declaration SHA-256 characters'
);

const actualPua = String.fromCodePoint(0x10D613);
assert.equal(declaration.includes('U+10D613'), true, 'declaration must retain the literal PUA claim');
assert.equal(declaration.includes(actualPua), false, 'manifest must not imply the PUA scalar occurs in the declaration');
assert.equal(declaration.includes(String.fromCodePoint(0x1D30B)), true, 'declaration must retain the ingress sigil');
assert.equal(declaration.includes(String.fromCodePoint(0x27D0)), false, 'declaration must not be misreported as carrying the TD613 seal');
assert.equal(provenance.symbol_roles.ingress_sigil.codepoint, 'U+1D30B');
assert.equal(provenance.symbol_roles.seal.codepoint, 'U+27D0');
assert.match(provenance.legacy_receipt_interpretation.corrected_semantics, /ingress sigil/u);
assert.equal(envelope.sig, null, 'binding event remains explicitly unsigned');
assert.equal(provenance.binding_event.signature_status, 'unsigned');
assert.equal(provenance.attestation_scope.does_not_establish.includes('authorship by itself'), true);

const browserSource = fs.readFileSync(path.join(root, 'app', 'safe-harbor', 'app', 'binding-provenance.js'), 'utf8');
const browserContext = { window: {} };
vm.runInNewContext(browserSource, browserContext);
const browserProvenance = browserContext.window.TD613_SAFE_HARBOR_BINDING_PROVENANCE;
assert.equal(Object.isFrozen(browserProvenance), true);
assert.equal(Object.isFrozen(browserProvenance.canonical_declaration), true);
assert.equal(browserProvenance.canonical_declaration.sha256, provenance.canonical_declaration.sha256);
assert.equal(browserProvenance.canonical_declaration.md5_legacy, provenance.canonical_declaration.md5_legacy);
assert.equal(browserProvenance.legacy_corpus_root.sha256, provenance.legacy_corpus_root.sha256);
assert.equal(browserProvenance.binding_event.signature_status, 'unsigned');

const mainSource = fs.readFileSync(path.join(root, 'app', 'safe-harbor', 'app', 'main.js'), 'utf8');
assert.match(mainSource, /binding_provenance: clone\(D\.canon\.binding_provenance\)/u);
assert.match(mainSource, /binding_provenance_manifest: 'binding_provenance_manifest\.json'/u);

const schema = JSON.parse(fs.readFileSync(path.join(root, 'app', 'safe-harbor', 'schemas', 'td613-safe-harbor.packet.schema.json'), 'utf8'));
assert.equal(schema.required.includes('binding_provenance'), true);
assert.equal(schema.properties.binding_provenance.$ref, '#/$defs/bindingProvenance');

const sample = JSON.parse(fs.readFileSync(path.join(root, 'app', 'safe-harbor', 'examples', 'td613-safe-harbor.packet.sample.json'), 'utf8'));
assert.equal(sample.binding_provenance.canonical_declaration.sha256, provenance.canonical_declaration.sha256);
assert.equal(sample.binding_provenance.binding_event.signature_status, 'unsigned');

const intakeManifest = JSON.parse(read('TD613_corpus_manifest.json', 'utf8'));
assert.equal(intakeManifest.corpus_registry.length, intakeManifest.total_batches);
for (const entry of intakeManifest.corpus_registry) {
  assert.match(entry.path, /^tauric-diana-intake\/batch-.+\.json$/u);
  assert.equal(fs.existsSync(path.join(corpus, entry.path)), true, `${entry.batch_id} must resolve to a sealable batch file`);
}

console.log('safe-harbor-binding-provenance.test.mjs passed');
