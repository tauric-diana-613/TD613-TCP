import { spawnSync } from 'child_process';

const node = process.execPath;
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const COMMANDS = Object.freeze({
  smoke: [
    [node, ['tests/diagnostics.test.mjs']],
    [node, ['tests/diagnostics-runner.test.mjs']]
  ],
  aperture: [
    [node, ['tests/td613-aperture.test.mjs']],
    [node, ['tests/gateway-aperture-embed.test.mjs']],
    [node, ['tests/diagnostics.test.mjs']]
  ],
  'dome-world': [
    [npm, ['run', 'test:dome-world:art']],
    [npm, ['run', 'test:dome-world:phase3']],
    [node, ['tests/dome-world-ash-custody.test.mjs']]
  ],
  hush: [
    [npm, ['run', 'test:hush:phase9:local']]
  ],
  'safe-harbor': [
    [npm, ['run', 'test:safe-harbor:current']]
  ],
  generated: [
    [npm, ['run', 'check:generated-sync']]
  ],
  release: [
    [node, ['scripts/run-diagnostics-battery.mjs']],
    [node, ['tests/diagnostics-report.test.mjs']]
  ],
  full: [
    [node, ['scripts/run-diagnostics-battery.mjs', '--fresh']],
    [node, ['tests/diagnostics-report.test.mjs']]
  ]
});

const AREA_PATTERNS = Object.freeze([
  ['aperture', /^(app\/aperture\/|scripts\/aperture-|scripts\/sync-aperture-release|tests\/.*aperture|docs\/TD613_APERTURE)/i],
  ['dome-world', /^(app\/dome-world\/|api\/dome-world|packages\/dome_world|tests\/dome-world|docs\/DOME|docs\/dome)/i],
  ['hush', /^(app\/hush|app\/engine\/hush|tests\/hush|scripts\/run-hush|docs\/hush|docs\/HUSH)/i],
  ['safe-harbor', /^(app\/safe-harbor\/|tests\/safe-harbor|tests\/td613-flight|docs\/SAFE|docs\/safe-harbor)/i],
  ['generated', /^(app\/browser-|app\/data\/diagnostics|scripts\/generate-|scripts\/check-generated-sync|tests\/.*generated|app\/engine\/stylometry)/i]
]);

function usage() {
  return `TD613 diagnostics tiers

Usage:
  node scripts/run-diagnostics.mjs smoke
  node scripts/run-diagnostics.mjs focus --area=<aperture|dome-world|hush|safe-harbor|generated>
  node scripts/run-diagnostics.mjs recommend
  node scripts/run-diagnostics.mjs release
  node scripts/run-diagnostics.mjs full

Notes:
  smoke and focus do not publish reports/diagnostics/latest.*.
  release and full are the maintained report-publishing paths.
`;
}

function run(commandList) {
  for (const [cmd, args] of commandList) {
    console.log(`\n> ${[cmd, ...args].join(' ')}`);
    const useWindowsNpmShell = cmd === npm && process.platform === 'win32';
    const result = useWindowsNpmShell
      ? spawnSync([cmd, ...args].join(' '), {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true
      })
      : spawnSync(cmd, args, {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: false
      });
    if (result.status !== 0) {
      process.exit(result.status || 1);
    }
  }
}

function parseArea(argv) {
  const areaArg = argv.find((arg) => arg.startsWith('--area='));
  const area = areaArg?.split('=')[1] || '';
  if (!area || !COMMANDS[area]) {
    throw new Error(`Unknown or missing focus area "${area || '(missing)'}".`);
  }
  if (['smoke', 'release', 'full'].includes(area)) {
    throw new Error(`"${area}" is a tier, not a focus area.`);
  }
  return area;
}

function listChangedFiles() {
  const status = spawnSync('git', ['status', '--short'], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
  if (status.status !== 0) {
    return [];
  }
  return status.stdout
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => {
      const renamed = line.match(/^..\s+(.+?)\s+->\s+(.+)$/);
      if (renamed) {
        return renamed[2].replace(/\\/g, '/');
      }
      return line.slice(3).trim().replace(/\\/g, '/');
    })
    .filter(Boolean);
}

function recommendedAreas(files) {
  const areas = new Set();
  for (const file of files) {
    for (const [area, pattern] of AREA_PATTERNS) {
      if (pattern.test(file)) {
        areas.add(area);
      }
    }
  }
  if (!areas.size) {
    areas.add('generated');
  }
  return [...areas];
}

function printRecommendation() {
  const files = listChangedFiles();
  const areas = recommendedAreas(files);
  console.log('Diagnostics recommendation');
  console.log('');
  if (files.length) {
    console.log('Changed files:');
    files.forEach((file) => console.log(`- ${file}`));
    console.log('');
  } else {
    console.log('No changed files detected.');
    console.log('');
  }
  console.log('Run:');
  console.log('- npm run diag:smoke');
  areas.forEach((area) => {
    console.log(`- npm run diag:focus -- --area=${area}`);
  });
  console.log('');
  console.log('Use npm run diag:release only when publishing maintained diagnostics reports.');
  console.log('Use npm run diag:full only for an intentional deep audit.');
}

const [tier = 'help', ...args] = process.argv.slice(2);

try {
  if (tier === 'help' || tier === '--help' || tier === '-h') {
    console.log(usage());
  } else if (tier === 'smoke') {
    run(COMMANDS.smoke);
  } else if (tier === 'focus') {
    run(COMMANDS[parseArea(args)]);
  } else if (tier === 'recommend') {
    printRecommendation();
  } else if (tier === 'release') {
    run(COMMANDS.release);
  } else if (tier === 'full') {
    run(COMMANDS.full);
  } else {
    throw new Error(`Unknown diagnostics tier "${tier}".`);
  }
} catch (error) {
  console.error(error?.message || String(error));
  console.error('');
  console.error(usage());
  process.exit(1);
}
