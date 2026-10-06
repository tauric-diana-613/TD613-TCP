// TD613 Sequence 5.5 Pilot V2 offline-equivalent runner.
// Historical 3.5 harness remains at 16-SACRIFICIAL_PILOT_HARNESS.mjs.
// This runner MUST NOT read .env and MUST NOT reuse 13-* artifacts.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.env.TD613_ROOT || process.cwd();
const BASE = path.join(ROOT, 'research/sequence-5.5-closure-chamber');
const AUTH = JSON.parse(fs.readFileSync(path.join(BASE, '19-PILOT_V2_EXECUTION_AUTHORIZATION.json'), 'utf8'));
const MANIFEST = JSON.parse(fs.readFileSync(path.join(BASE, '07-SEALED_EXECUTION_BUNDLE_MANIFEST.json'), 'utf8'));
const SCHEMA = fs.readFileSync(path.join(BASE, '10-RECEIVER_OUTPUT_SCHEMA.json'), 'utf8');
const OUT = path.join(BASE, '19-PILOT_V2_RAW_OUTPUTS');
const RECEIPTS = path.join(BASE, '19-PILOT_V2_RECEIPTS');
const KEY = process.env.GEMINI_API_KEY || '';
const MODEL = 'gemini-3.8-flash';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';
const EXPECTED_FP = AUTH.credential_binding.credential_fingerprint_sha256;

if (!KEY) throw new Error('GEMINI_API_KEY must be supplied by the execution environment; .env fallback is forbidden for Pilot V2.');
const fp = crypto.createHash('sha256').update(KEY, 'utf8').digest('hex');
if (fp !== EXPECTED_FP) throw new Error('Credential fingerprint mismatch; refusing Pilot V2 execution.');
if (fs.existsSync(OUT) || fs.existsSync(RECEIPTS)) throw new Error('Pilot V2 output namespaces already exist; fresh-start runner refuses ambiguous reuse.');
fs.mkdirSync(OUT, { recursive:true });
fs.mkdirSync(RECEIPTS, { recursive:true });

console.log('Pilot V2 runner prepared for 25 fresh units.');
console.log('Model:', MODEL, 'Thinking:', 'medium', 'Temperature:', 'UNSET');
console.log('Run order units:', AUTH.deterministic_run_order.length);
console.log('No calls are made by this verification stub. Canonical remote execution uses the preview-only route api/sequence-55-pilot-v2.js.');
