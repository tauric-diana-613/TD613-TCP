import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const builder = resolve('neon/functions/loom-assay-budget/build-and-verify.py');
function checkZip(entry) {
  const directory = mkdtempSync(resolve(tmpdir(), 'budget-bundle-regression-'));
  try {
    const archive = resolve(directory, 'test.zip');
    const written = spawnSync('python3', ['-c', 'import sys,zipfile\nwith zipfile.ZipFile(sys.argv[1],"w") as z:z.writestr("index.mjs",sys.stdin.read())', archive], { input: entry, encoding: 'utf8' });
    assert.equal(written.status, 0, written.stderr);
    return spawnSync('python3', [builder, '--smoke-zip', archive], { encoding: 'utf8', timeout: 20000 });
  } finally { rmSync(directory, {recursive:true, force:true}); }
}
test('isolated ZIP smoke reaches configured startup and rejects externalized pg', () => {
  const result = checkZip(`export default {async fetch() {
    if (!process.env.DATABASE_URL) return Response.json({error:'ASSAY_DATABASE_UNCONFIGURED'},{status:503});
    await import('pg');
    return Response.json({error:'ASSAY_WORKLOAD_UNAUTHORIZED'},{status:401});
  }};`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /ERR_MODULE_NOT_FOUND[\s\S]*Cannot find package 'pg'/);
});
test('isolated ZIP smoke validates all three gates without network', () => {
  const result = checkZip(`export default {async fetch(request) {
    if(!process.env.DATABASE_URL) return Response.json({error:'ASSAY_DATABASE_UNCONFIGURED'},{status:503});
    if(request.method==='GET') return Response.json({error:'ASSAY_METHOD'},{status:405});
    return Response.json({error:'ASSAY_WORKLOAD_UNAUTHORIZED'},{status:401});
  }};`);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /ZIP_RUNTIME_SMOKE_PASS/);
});
