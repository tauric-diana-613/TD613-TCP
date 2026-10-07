import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  renderDomeArt,
  generateSvgSnapshot,
  DIRECTOR_DIRECTIONS
} from '../app/engine/flowcore-semantic-motion-bridge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outputDir = path.join(repoRoot, 'research', 'sequence-6-surviving-relations', 'witnesses');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const VIEWPORTS = [
  { name: 'desktop', width: 1000, height: 520, dpr: 1 },
  { name: 'mobile_390px', width: 390, height: 844, dpr: 3 }
];

const COMPARISON_RELATIONS = [
  'gathering',            // à
  'release',              // 出
  'protected_continuity', // cōl
  'structural_rest',      // 𝄐
  'recurrence',           // 米
  'bounded_emergence',    // hõt
  'created_potential',    // 上
  'released_tendency'     // 下
];

const manifest = [];

console.log('Generating Sequence 6 Tranche 2 & 2B Visual Witnesses...');

for (const dir of DIRECTOR_DIRECTIONS) {
  console.log(`\nGenerating direction: [${dir.toUpperCase()}]`);

  for (const relationKey of COMPARISON_RELATIONS) {
    for (const vp of VIEWPORTS) {
      // Dynamic motion snapshot
      const snapshot = {
        activeViewId: 'cockpit',
        relationState: { relation_key: relationKey, progress: 0.6 },
        directorDirection: dir
      };
      const frame = renderDomeArt('cockpit', snapshot, vp, 1800);
      const svg = generateSvgSnapshot(frame);
      const filename = `witness-${dir}-${relationKey}-${vp.name}.svg`;
      fs.writeFileSync(path.join(outputDir, filename), svg, 'utf8');

      manifest.push({
        direction: dir,
        relation: relationKey,
        glyph: frame.descriptor.canonical_glyph,
        viewport: vp.name,
        dimensions: `${vp.width}x${vp.height}`,
        reduced_motion: false,
        file: filename,
        carrier_count: frame.carriers.length,
        planes: {
          near: frame.carriers.filter(c => c.carrier.near).length,
          mid: frame.carriers.filter(c => c.carrier.mid).length,
          far: frame.carriers.filter(c => c.carrier.far).length
        }
      });

      console.log(`  [OK] ${filename}`);
    }
  }

  // Also generate reduced motion static equivalents for key states
  for (const relationKey of ['gathering', 'structural_rest']) {
    for (const vp of VIEWPORTS) {
      const snapshot = {
        activeViewId: 'cockpit',
        relationState: { relation_key: relationKey, progress: 1.0 },
        directorDirection: dir,
        reducedMotion: true
      };
      const frame = renderDomeArt('cockpit', snapshot, vp, 0);
      const svg = generateSvgSnapshot(frame);
      const filename = `witness-${dir}-${relationKey}-reduced-motion-${vp.name}.svg`;
      fs.writeFileSync(path.join(outputDir, filename), svg, 'utf8');

      manifest.push({
        direction: dir,
        relation: relationKey,
        glyph: frame.descriptor.canonical_glyph,
        viewport: vp.name,
        dimensions: `${vp.width}x${vp.height}`,
        reduced_motion: true,
        file: filename,
        carrier_count: frame.carriers.length,
        planes: {
          near: frame.carriers.filter(c => c.carrier.near).length,
          mid: frame.carriers.filter(c => c.carrier.mid).length,
          far: frame.carriers.filter(c => c.carrier.far).length
        }
      });

      console.log(`  [OK] ${filename}`);
    }
  }
}

// Write manifest JSON
fs.writeFileSync(
  path.join(outputDir, 'witness-manifest.json'),
  JSON.stringify(manifest, null, 2),
  'utf8'
);

console.log(`\nSuccessfully generated ${manifest.length} visual witness files in ${outputDir}`);
