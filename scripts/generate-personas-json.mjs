import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import personas from '../app/data/personas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const personasJsonPath = path.join(repoRoot, 'app', 'data', 'personas.json');

fs.writeFileSync(personasJsonPath, `${JSON.stringify(personas, null, 2)}\n`, 'utf8');
console.log('personas.json regenerated from app/data/personas.js');
