import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const intakeDir = path.join(rootDir, 'app/safe-harbor/corpus/tauric-diana-intake');
const outputFile = path.join(rootDir, 'app/safe-harbor/corpus/TD613_corpus_manifest.json');

const files = fs.readdirSync(intakeDir)
  .filter(f => f.endsWith('.json'))
  .sort();

console.log(`Found ${files.length} batch files to process.`);

const manifest = {
  manifest_generated_at: new Date().toISOString(),
  total_batches: files.length,
  total_nodes: 0,
  batches: []
};

let allNodes = [];

for (const file of files) {
  const filePath = path.join(intakeDir, file);
  console.log(`Processing ${file}...`);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);

    // Maintain batch metadata without duplicating massive node arrays in the batch index
    const batchMeta = { ...parsed };
    delete batchMeta.nodes;

    manifest.batches.push(batchMeta);

    if (Array.isArray(parsed.nodes)) {
      allNodes = allNodes.concat(parsed.nodes);
    }
  } catch (err) {
    console.error(`Failed to parse ${file}: ${err.message}`);
    process.exit(1);
  }
}

manifest.total_nodes = allNodes.length;
manifest.nodes = allNodes;

console.log(`Successfully merged ${allNodes.length} nodes from ${files.length} batches.`);
fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2));
console.log(`Wrote unified corpus manifest to ${outputFile}`);
