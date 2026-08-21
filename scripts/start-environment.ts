import { spawn } from 'node:child_process';

const child = spawn('npm', ['run', 'app:start'], { stdio: 'inherit', shell: process.platform === 'win32' });
const stop = (signal: NodeJS.Signals): void => {
  child.kill(signal);
};
process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));
child.on('exit', (code) => process.exit(code ?? 1));
