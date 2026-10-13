import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const browserWitnessDir = path.join(repoRoot, 'research', 'sequence-6-surviving-relations', 'witnesses', 'browser');

if (!fs.existsSync(browserWitnessDir)) {
  fs.mkdirSync(browserWitnessDir, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

if (!fs.existsSync(chromePath)) {
  console.error(`Chrome not found at ${chromePath}`);
  process.exit(1);
}

const PORT = 6140;

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(repoRoot, safePath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  console.log(`Local journey witness server running on http://localhost:${PORT}`);

  const targets = [
    {
      name: 'browser-journey-loom_origin-desktop.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-journey.html?stage=LOOM_ORIGIN&vp=desktop`,
      width: 1280,
      height: 800,
      label: 'BROWSER_VIEWPORT_WITNESS',
      notes: 'Loom Origin active state, 39 carriers gathering field, prompt, selected files'
    },
    {
      name: 'browser-journey-authorization_boundary-desktop.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-journey.html?stage=EXPLICIT_OUTBOUND_AUTHORIZATION&vp=desktop`,
      width: 1280,
      height: 800,
      label: 'BROWSER_VIEWPORT_WITNESS',
      notes: 'Outbound Authorization Boundary under INV-01..04 with configured receiver'
    },
    {
      name: 'browser-journey-marrowline_continuation-desktop.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-journey.html?stage=MARROWLINE_CONTINUATION&vp=desktop`,
      width: 1280,
      height: 800,
      label: 'BROWSER_VIEWPORT_WITNESS',
      notes: 'Marrowline Continuation chamber with model release and predecessor binding'
    },
    {
      name: 'browser-journey-hold-desktop.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-journey.html?stage=HOLD&vp=desktop`,
      width: 1280,
      height: 800,
      label: 'BROWSER_VIEWPORT_WITNESS',
      notes: 'HOLD jurisdiction: inspectable evidence deficit and actionable recovery options'
    },
    {
      name: 'browser-journey-returned_candidate-desktop.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-journey.html?stage=RETURN_REENTRY&vp=desktop`,
      width: 1280,
      height: 800,
      label: 'BROWSER_VIEWPORT_WITNESS',
      notes: 'Returned candidate waiting at Loom threshold; receiver local != Loom admission'
    },
    {
      name: 'browser-journey-receipt_inspection-desktop.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-journey.html?stage=RECEIPT_INSPECTION&vp=desktop`,
      width: 1280,
      height: 800,
      label: 'BROWSER_VIEWPORT_WITNESS',
      notes: 'Receipt Inspection jurisdiction with [OBSERVED], [DERIVED], [HELD] calm monospace'
    },
    {
      name: 'browser-journey-structural_rest-desktop.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-journey.html?stage=STRUCTURAL_REST&vp=desktop`,
      width: 1280,
      height: 800,
      label: 'BROWSER_VIEWPORT_WITNESS',
      notes: 'Structural Rest 𝄐 with kinetic obligation resolved and historical records preserved'
    },
    {
      name: 'browser-journey-390px-portrait.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-journey.html?stage=LOOM_ORIGIN&vp=mobile`,
      width: 390,
      height: 844,
      label: 'SIMULATED_390PX_BROWSER_CAPTURE',
      notes: 'Simulated 390px mobile viewport: all controls reachable, 39 carriers preserved'
    },
    {
      name: 'browser-journey-reduced_motion-desktop.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-journey.html?stage=LOOM_ORIGIN&reducedMotion=true&vp=desktop`,
      width: 1280,
      height: 800,
      label: 'BROWSER_VIEWPORT_WITNESS',
      notes: 'Reduced motion static calm view: all 39 carriers preserved without animation'
    }
  ];

  const captureResults = [];

  for (const target of targets) {
    const outputPath = path.join(browserWitnessDir, target.name);
    console.log(`Capturing ${target.name} [${target.label}] (${target.width}x${target.height})...`);

    await new Promise((resolve, reject) => {
      const args = [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        `--window-size=${target.width},${target.height}`,
        `--screenshot=${outputPath}`,
        '--virtual-time-budget=2500',
        target.url
      ];

      const proc = spawn(chromePath, args);
      proc.on('close', code => {
        if (code === 0 && fs.existsSync(outputPath)) {
          const stats = fs.statSync(outputPath);
          console.log(`  ✓ Captured ${target.name} (${stats.size} bytes)`);
          captureResults.push({
            name: target.name,
            file_path: path.relative(repoRoot, outputPath),
            size_bytes: stats.size,
            evidence_class: target.label,
            viewport: `${target.width}x${target.height}`,
            notes: target.notes,
            captured_at: new Date().toISOString()
          });
          resolve();
        } else {
          reject(new Error(`Failed to capture ${target.name}, exit code ${code}`));
        }
      });
    });
  }

  // Update browser witness manifest with journey captures
  const manifestPath = path.join(browserWitnessDir, 'browser-witness-manifest.json');
  let manifest = [];
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }

  for (const cap of captureResults) {
    const existingIndex = manifest.findIndex(m => m.name === cap.name);
    const entry = {
      name: cap.name,
      file: `browser/${cap.name}`,
      provenance: cap.evidence_class,
      url: targets.find(t => t.name === cap.name)?.url,
      dimensions: cap.viewport,
      size_bytes: cap.size_bytes,
      observed_at: cap.captured_at,
      notes: cap.notes
    };
    if (existingIndex >= 0) {
      manifest[existingIndex] = entry;
    } else {
      manifest.push(entry);
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Updated browser witness manifest at ${manifestPath}`);

  server.close(() => {
    console.log('Witness server closed. All journey browser captures complete.');
  });
});
