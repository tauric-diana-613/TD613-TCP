import { DatabaseSync } from 'node:sqlite';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export function canonical(value) {
  if (value === null || typeof value !== 'object') {
    if (value === undefined || (typeof value === 'number' && !Number.isFinite(value))) throw Error('NON_CANONICAL_VALUE');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}
export const digest = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : canonical(value)).digest('hex');
export const mac = (key, value) => createHmac('sha256', key).update(canonical(value)).digest('hex');
export function equalHex(a, b) {
  return typeof a === 'string' && typeof b === 'string' && /^[a-f0-9]{64}$/.test(a) && /^[a-f0-9]{64}$/.test(b) && timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}
const alive = pid => { try { process.kill(pid, 0); return true; } catch (e) { return e.code !== 'ESRCH'; } };

/** Single-host private journal. FULL SQLite commits authenticate retained bytes, not provider identity. */
export class Journal {
  constructor(filename, key, { anchor = null } = {}) {
    if (!key || Buffer.byteLength(key) < 32) throw Error('EXTERNAL_CHECKPOINT_KEY_REQUIRED');
    fs.mkdirSync(path.dirname(filename), { recursive: true, mode: 0o700 });
    this.key = key; this.owner = randomUUID();
    this.db = new DatabaseSync(filename);
    this.db.exec('PRAGMA busy_timeout=1000; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;');
    this.db.exec('CREATE TABLE IF NOT EXISTS events (seq INTEGER PRIMARY KEY, body TEXT NOT NULL, hash TEXT NOT NULL, signature TEXT NOT NULL); CREATE TABLE IF NOT EXISTS control (id INTEGER PRIMARY KEY CHECK(id=1), head TEXT NOT NULL, owner TEXT, pid INTEGER); INSERT OR IGNORE INTO control VALUES (1, \'\', NULL, NULL);');
    try {
      this.transaction(() => {
        const row = this.db.prepare('SELECT * FROM control WHERE id=1').get();
        if (row.owner && alive(row.pid)) throw Error('CHECKPOINT_WRITER_ACTIVE_OR_PID_REUSED');
        this.verify(anchor);
        this.db.prepare('UPDATE control SET owner=?, pid=? WHERE id=1').run(this.owner, process.pid);
      });
    } catch (e) { this.db.close(); throw e; }
  }
  transaction(fn) {
    this.db.exec('BEGIN IMMEDIATE');
    try { const r = fn(); this.db.exec('COMMIT'); return r; }
    catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }
  verify(anchor = null) {
    let previous = '', seq = 0;
    const events = this.db.prepare('SELECT * FROM events ORDER BY seq').all().map(row => {
      const body = JSON.parse(row.body);
      if (row.seq !== ++seq || body.seq !== seq || body.previous !== previous || canonical(body) !== row.body || digest(body) !== row.hash || !equalHex(mac(this.key, { hash: row.hash, seq }), row.signature)) throw Error('CHECKPOINT_INTEGRITY_FAILURE');
      previous = row.hash;
      return { ...body, hash: row.hash, signature: row.signature };
    });
    if (previous !== this.db.prepare('SELECT head FROM control WHERE id=1').get().head) throw Error('CHECKPOINT_HEAD_MISMATCH');
    if (anchor && !events.some(e => e.seq === anchor.seq && e.hash === anchor.hash)) throw Error('EXTERNAL_ANCHOR_MISMATCH');
    return events;
  }
  events() { return this.verify(); }
  append(type, payload) {
    return this.transaction(() => {
      const row = this.db.prepare('SELECT * FROM control WHERE id=1').get();
      if (row.owner !== this.owner) throw Error('CHECKPOINT_LEASE_LOST');
      const seq = this.db.prepare('SELECT count(*) AS n FROM events').get().n + 1;
      const body = { seq, previous: row.head, type, payload };
      const hash = digest(body), signature = mac(this.key, { hash, seq });
      this.db.prepare('INSERT INTO events VALUES (?, ?, ?, ?)').run(seq, canonical(body), hash, signature);
      this.db.prepare('UPDATE control SET head=? WHERE id=1').run(hash);
      return { ...body, hash, signature };
    });
  }
  close() {
    this.transaction(() => this.db.prepare('UPDATE control SET owner=NULL, pid=NULL WHERE id=1 AND owner=?').run(this.owner));
    this.db.close();
  }
}
