// Encrypt one locally held TD613 finite descent episode for short-lived CI artifact custody.
// HKDF-SHA256 derives a separate AES-256-GCM key from the repository's existing Gemini
// credential without recording it. Rotate the credential only after decrypting archive.
import { randomBytes, hkdfSync, createCipheriv, createDecipheriv } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
const [mode, sourcePath, destPath] = process.argv.slice(2);
if (!['encrypt', 'decrypt'].includes(mode) || !sourcePath || !destPath) throw Error('USAGE: node seal-archive.mjs encrypt|decrypt INPUT OUTPUT');
const credential = process.env.GEMINI_API_KEY;
if (typeof credential !== 'string' || credential.length < 16) throw Error('EXISTING_GEMINI_CREDENTIAL_REQUIRED');
const INFO = 'td613-marrowline-finite-descent-20261015-encrypted-artifact-v1';
const input = await readFile(sourcePath);
if (mode === 'encrypt') {
  const salt = randomBytes(32), iv = randomBytes(12);
  const key = Buffer.from(hkdfSync('sha256', Buffer.from(credential,'utf8'),salt,Buffer.from(INFO),32));
  const cipher = createCipheriv('aes-256-gcm', key, iv, {authTagLength:16});
  const sealed = Buffer.concat([cipher.update(input),cipher.final()]);
  const tag = cipher.getAuthTag();
  const header = JSON.stringify({schema:INFO,salt:salt.toString('base64'),iv:iv.toString('base64'),tag:tag.toString('base64')}) + '\n';
  await writeFile(destPath, Buffer.concat([Buffer.from(header),sealed]), {flag:'wx',mode:0o600});
  key.fill(0);
} else {
  const index = input.indexOf(10);
  if (index<0 || index>800) throw Error('ENCRYPTED_ARCHIVE_HEADER_INVALID');
  const h=JSON.parse(input.subarray(0,index).toString('utf8'));
  if(h.schema!==INFO)throw Error('ENCRYPTED_ARCHIVE_SCHEMA_INVALID');
  const salt=Buffer.from(h.salt,'base64'),iv=Buffer.from(h.iv,'base64'),tag=Buffer.from(h.tag,'base64');
  if(salt.length!==32||iv.length!==12||tag.length!==16)throw Error('ENCRYPTED_ARCHIVE_FIELDS_INVALID');
  const key=Buffer.from(hkdfSync('sha256',Buffer.from(credential,'utf8'),salt,Buffer.from(INFO),32));
  const decipher=createDecipheriv('aes-256-gcm',key,iv,{authTagLength:16});decipher.setAuthTag(tag);
  const recovered=Buffer.concat([decipher.update(input.subarray(index+1)),decipher.final()]);
  await writeFile(destPath,recovered,{flag:'wx',mode:0o600});
  key.fill(0);
}
process.stdout.write('TD613_FINITE_DESCENT_ARCHIVE_'+mode.toUpperCase()+'_COMPLETE\n');
