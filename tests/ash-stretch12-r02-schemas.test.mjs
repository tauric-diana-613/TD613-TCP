import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = 'app/dome-world/schemas';
const files = fs.readdirSync(root).filter(name => name.startsWith('ash-stretch12-r02-') && name.endsWith('.schema.json')).sort();
assert.ok(files.length >= 2, 'At least the current work-package schemas must exist.');
for (const name of files) {
  const schema = JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
  assert.match(schema.$id, /^https:\/\/td613\.com\/schemas\/ash-stretch12-r02-/);
  assert.equal(schema.type, 'object');
  assert.equal(schema.additionalProperties, false, `${name} must reject undeclared fields.`);
  assert.ok(Array.isArray(schema.required) && schema.required.length > 0, `${name} must name required fields.`);
  assert.ok(schema.required.every(key => Object.hasOwn(schema.properties, key)), `${name} required fields must be declared.`);
}
console.log(`ash-stretch12-r02-schemas.test.mjs passed (${files.length} schemas)`);
