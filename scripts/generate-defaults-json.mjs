import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import defaults from '../app/data/defaults.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const defaultsJsonPath = path.join(repoRoot, 'app', 'data', 'defaults.json');

fs.writeFileSync(defaultsJsonPath, `${JSON.stringify(defaults, null, 2)}\n`, 'utf8');
console.log('defaults.json regenerated from app/data/defaults.js');
