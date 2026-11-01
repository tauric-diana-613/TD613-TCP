/** Source-free private account-metadata custody. No provider calls or credential access. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const inside = (value, root) => value === root || value.startsWith(root + path.sep);

export function validatePrivateAccountReceiptPath(filename, { repoRoot = repositoryRoot } = {}) {
  if (typeof filename !== 'string' || !path.isAbsolute(filename)) throw Error('PRIVATE_ACCOUNT_RECEIPT_ABSOLUTE_PATH_REQUIRED');
  const candidate = path.resolve(filename);
  const parent = path.dirname(candidate);
  if (!fs.existsSync(parent) || !fs.statSync(parent).isDirectory()) throw Error('PRIVATE_ACCOUNT_RECEIPT_PARENT_REQUIRED');
  const parentReal = fs.realpathSync(parent);
  const repoReal = fs.realpathSync(repoRoot);
  const target = path.join(parentReal, path.basename(candidate));
  if (inside(target, repoReal)) throw Error('PRIVATE_ACCOUNT_RECEIPT_OUTSIDE_CHECKOUT_REQUIRED');
  if (fs.existsSync(target) || (fs.existsSync(candidate) && fs.lstatSync(candidate).isSymbolicLink())) throw Error('PRIVATE_ACCOUNT_RECEIPT_FRESH_PATH_REQUIRED');
  return target;
}

export function writePrivateAccountReceipt(filename, receipt, options) {
  const target = validatePrivateAccountReceiptPath(filename, options);
  const bytes = Buffer.from(JSON.stringify(receipt, null, 2) + '\n', 'utf8');
  const fd = fs.openSync(target, 'wx', 0o600);
  try {
    fs.writeFileSync(fd, bytes);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  return { written: true, bytes: bytes.length };
}
