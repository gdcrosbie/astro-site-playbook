const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const source = path.resolve(__dirname, '..');
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'astro-site-playbook-'));
const project = path.join(temporaryRoot, 'site-from-template');
const excludedRoots = new Set(['.astro', '.git', 'dist', 'node_modules']);

function copyFilter(entry) {
  const relative = path.relative(source, entry);
  if (!relative) return true;

  const [rootName] = relative.split(path.sep);
  const basename = path.basename(entry);
  return !excludedRoots.has(rootName)
    && !basename.startsWith('.env')
    && !basename.endsWith('.log');
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: project,
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited with status ${result.status}`);
  }
}

try {
  fs.cpSync(source, project, { recursive: true, filter: copyFilter });

  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  run(npm, ['ci']);
  run(npm, ['test']);

  console.log('PASS: a clean copy installs and passes the complete verification pipeline.');
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
