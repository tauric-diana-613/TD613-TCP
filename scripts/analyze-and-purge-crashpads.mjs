import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const targets = [
  path.join(rootDir, 'tmp-edge-profile-final-2'),
  path.join(rootDir, 'tmp-edge-profile-ingress'),
  path.join(rootDir, 'tmp-edge-profile-codex')
];

const reportPath = path.join(rootDir, 'reports/diagnostics/crashpad-summary.latest.json');
const reportDir = path.dirname(reportPath);

if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

function extractStrings(filePath) {
  try {
    // Extract strings that are at least 10 chars long to filter noise
    const out = execSync(`strings -n 10 "${filePath}" 2>/dev/null || true`);
    const lines = out.toString().split('\n').map(s => s.trim()).filter(s => s.length > 0);
    // Return a sample of the first 100 and last 100 lines
    if (lines.length <= 200) return lines;
    return [...lines.slice(0, 100), '... [TRUNCATED] ...', ...lines.slice(-100)];
  } catch (err) {
    return [`Failed to extract strings: ${err.message}`];
  }
}

const report = {
  timestamp: new Date().toISOString(),
  extracted_data: {}
};

console.log('Analyzing crashpad dumps...');

for (const dir of targets) {
  if (fs.existsSync(dir)) {
    const dmpFiles = [];
    const datFiles = [];

    const walkSync = (currentDir) => {
      const files = fs.readdirSync(currentDir);
      for (const file of files) {
        const fullPath = path.join(currentDir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          walkSync(fullPath);
        } else {
          if (fullPath.endsWith('.dmp')) dmpFiles.push(fullPath);
          if (fullPath.endsWith('.dat')) datFiles.push(fullPath);
          if (fullPath.endsWith('metadata')) datFiles.push(fullPath); // include metadata file
        }
      }
    };
    walkSync(dir);

    for (const dmp of dmpFiles) {
      console.log(`Extracting from ${dmp}...`);
      const relative = path.relative(rootDir, dmp);
      report.extracted_data[relative] = {
        type: 'minidump',
        strings: extractStrings(dmp)
      };
    }

    for (const dat of datFiles) {
      console.log(`Extracting from ${dat}...`);
      const relative = path.relative(rootDir, dat);
      report.extracted_data[relative] = {
        type: 'data',
        strings: extractStrings(dat)
      };
    }
  }
}

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`Report written to ${reportPath}`);

console.log('Purging directories...');
for (const dir of targets) {
  if (fs.existsSync(dir)) {
    console.log(`Deleting ${dir}`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const pidFile = path.join(rootDir, '.codex-http-6137.pid');
if (fs.existsSync(pidFile)) {
    fs.unlinkSync(pidFile);
}

console.log('Cleanup complete.');
