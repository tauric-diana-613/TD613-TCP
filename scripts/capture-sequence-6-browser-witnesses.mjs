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

const PORT = 6139;

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
  console.log(`Local witness server running on http://localhost:${PORT}`);

  const targets = [
    {
      name: 'browser-directors_cut-living_field-desktop.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-visual-lab.html?direction=directors_cut&jurisdiction=living_field&relation=gathering&vp=desktop`,
      width: 1280,
      height: 800,
      label: 'BROWSER_VIEWPORT_WITNESS'
    },
    {
      name: 'browser-directors_cut-hold-desktop.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-visual-lab.html?direction=directors_cut&jurisdiction=hold&vp=desktop`,
      width: 1280,
      height: 800,
      label: 'BROWSER_VIEWPORT_WITNESS'
    },
    {
      name: 'browser-directors_cut-authorization_boundary-desktop.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-visual-lab.html?direction=directors_cut&jurisdiction=authorization_boundary&vp=desktop`,
      width: 1280,
      height: 800,
      label: 'BROWSER_VIEWPORT_WITNESS'
    },
    {
      name: 'browser-directors_cut-receipt_inspection-desktop.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-visual-lab.html?direction=directors_cut&jurisdiction=receipt_inspection&vp=desktop`,
      width: 1280,
      height: 800,
      label: 'BROWSER_VIEWPORT_WITNESS'
    },
    {
      name: 'browser-directors_cut-structural_rest-desktop.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-visual-lab.html?direction=directors_cut&jurisdiction=structural_rest&relation=structural_rest&vp=desktop`,
      width: 1280,
      height: 800,
      label: 'BROWSER_VIEWPORT_WITNESS'
    },
    {
      name: 'browser-directors_cut-living_field-simulated_390px.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-visual-lab.html?direction=directors_cut&jurisdiction=living_field&relation=gathering&vp=mobile`,
      width: 1280,
      height: 980,
      label: 'SIMULATED_390PX_BROWSER_CAPTURE'
    },
    {
      name: 'browser-directors_cut-living_field-reduced_motion.png',
      url: `http://localhost:${PORT}/app/dome-world/sequence-6-visual-lab.html?direction=directors_cut&jurisdiction=living_field&relation=gathering&reducedMotion=true&vp=desktop`,
      width: 1280,
      height: 800,
      label: 'BROWSER_VIEWPORT_WITNESS'
    }
  ];

  const browserManifest = [];

  for (const target of targets) {
    const outputPath = path.join(browserWitnessDir, target.name);
    console.log(`Capturing browser witness: ${target.name}...`);

    await new Promise((resolve, reject) => {
      const args = [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        `--window-size=${target.width},${target.height}`,
        `--screenshot=${outputPath}`,
        '--virtual-time-budget=2500',
        target.url
      ];

      const proc = spawn(chromePath, args, { stdio: 'ignore' });
      proc.on('close', code => {
        if (code === 0 && fs.existsSync(outputPath)) {
          console.log(`  [OK] Saved ${outputPath}`);
          const stats = fs.statSync(outputPath);
          browserManifest.push({
            name: target.name,
            file: `browser/${target.name}`,
            provenance: target.label,
            url: target.url,
            dimensions: `${target.width}x${target.height}`,
            size_bytes: stats.size,
            observed_at: new Date().toISOString()
          });
          resolve();
        } else {
          console.error(`  [FAIL] Chrome exited with code ${code}`);
          resolve(); // continue even if one fails
        }
      });
      proc.on('error', err => {
        console.error(`  [ERROR]`, err);
        resolve();
      });
    });
  }

  fs.writeFileSync(
    path.join(browserWitnessDir, 'browser-witness-manifest.json'),
    JSON.stringify(browserManifest, null, 2),
    'utf8'
  );
  console.log(`\nBrowser witness capture complete. Manifest saved.`);

  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
