const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const LOG_DIR = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}
const LOG_FILE = path.join(LOG_DIR, 'dev-server.log');
function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

const ports = [3000, 3001, 3002];
let currentPortIndex = 0;

function startServer() {
  if (currentPortIndex >= ports.length) {
    log('All fallback ports are in use. Exiting.');
    process.exit(1);
    return;
  }
  const port = ports[currentPortIndex];
  log(`Starting Next dev server on port ${port}`);
  const env = Object.assign({}, process.env, { PORT: port });
  // Use cmd.exe to run npm on Windows
  const child = spawn('cmd', ['/c', 'npm', 'run', 'dev'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', (data) => {
    const line = data.toString();
    process.stdout.write(line);
    log(`STDOUT: ${line.trim()}`);
    if (line.includes('ready - started server on')) {
      log(`Server successfully started on port ${port}`);
    }
  });
  child.stderr.on('data', (data) => {
    const line = data.toString();
    process.stderr.write(line);
    log(`STDERR: ${line.trim()}`);
  });
  child.on('exit', (code, signal) => {
    log(`Dev server exited with code ${code} signal ${signal}`);
    if (code === 1) {
      currentPortIndex++;
      startServer();
    } else {
      setTimeout(() => {
        log('Restarting dev server after crash...');
        startServer();
      }, 2000);
    }
  });
}

startServer();
