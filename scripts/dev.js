const { spawn } = require('child_process');
const path = require('path');

function normalizeWindowsPath(targetPath) {
  return process.platform === 'win32'
    ? targetPath.replace(/^\\\\\?\\/, '')
    : targetPath;
}

const rootDir = normalizeWindowsPath(path.resolve(__dirname, '..'));
const serverDir = normalizeWindowsPath(path.join(rootDir, 'server'));
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function runScript(label, cwd, args) {
  const child = process.platform === 'win32'
    ? spawn('cmd.exe', ['/d', '/s', '/c', npmCmd, ...args], {
        cwd,
        stdio: 'pipe',
        shell: false,
        env: process.env,
      })
    : spawn(npmCmd, args, {
        cwd,
        stdio: 'pipe',
        shell: false,
        env: process.env,
      });

  child.stdout.on('data', (data) => {
    process.stdout.write(`[${label}] ${data}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`[${label}] ${data}`);
  });

  child.on('close', (code) => {
    process.stdout.write(`[${label}] exited with code ${code}\n`);
    if (code && !process.exitCode) {
      process.exitCode = code;
    }
  });

  child.on('error', (error) => {
    process.stderr.write(`[${label}] failed to start: ${error.message}\n`);
    if (!process.exitCode) {
      process.exitCode = 1;
    }
  });

  return child;
}

const frontend = runScript('frontend', rootDir, ['run', 'dev:frontend']);
const backend = runScript('backend', serverDir, ['run', 'dev']);

function shutdown(signal) {
  for (const child of [frontend, backend]) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
