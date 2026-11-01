import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validatePrivateAccountReceiptPath, writePrivateAccountReceipt } from '../scripts/experiment-b-operational/private-account-receipt.mjs';

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-account-private-'));
  t.after(() => { assert(path.basename(dir).startsWith('td613-account-private-')); fs.rmSync(dir, { recursive:true, force:true }); });
  const repoRoot = path.join(dir, 'repo'), privateRoot = path.join(dir, 'private');
  fs.mkdirSync(repoRoot); fs.mkdirSync(privateRoot);
  return { dir, repoRoot, privateRoot, options: { repoRoot } };
}

test('source-free account metadata requires absolute existing private destination', t => {
  const f=fixture(t);
  assert.throws(() => validatePrivateAccountReceiptPath(null,f.options), /ABSOLUTE_PATH_REQUIRED/);
  assert.throws(() => validatePrivateAccountReceiptPath('relative.json',f.options), /ABSOLUTE_PATH_REQUIRED/);
  assert.throws(() => validatePrivateAccountReceiptPath(path.join(f.repoRoot,'account.json'),f.options), /OUTSIDE_CHECKOUT_REQUIRED/);
  assert.throws(() => validatePrivateAccountReceiptPath(path.join(f.repoRoot,'subdir','account.json'),f.options), /PARENT_REQUIRED/);
});

test('source-free private receipt is exclusive, byte-preserving and not overwritten', t => {
  const f=fixture(t), file=path.join(f.privateRoot,'account.json');
  const record={evidenceClass:'SYNTHETIC_ONLY',rateLimits:{usedPercent:37.25},modelRequests:0};
  const output=writePrivateAccountReceipt(file,record,f.options);
  assert.equal(output.written,true);
  assert.deepEqual(JSON.parse(fs.readFileSync(file,'utf8')),record);
  if(process.platform!=='win32')assert.equal(fs.statSync(file).mode & 0o777,0o600);
  assert.throws(() => writePrivateAccountReceipt(file,{changed:true},f.options), /FRESH_PATH_REQUIRED/);
  assert.deepEqual(JSON.parse(fs.readFileSync(file,'utf8')),record);
});

test('source-free symlinked parent cannot reroute receipts into repository', t => {
  const f=fixture(t), alias=path.join(f.dir,'alias');
  try { fs.symlinkSync(f.repoRoot,alias,'dir'); } catch { t.skip('Symlink creation unavailable'); return; }
  assert.throws(() => validatePrivateAccountReceiptPath(path.join(alias,'account.json'),f.options), /OUTSIDE_CHECKOUT_REQUIRED/);
});
