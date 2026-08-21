import { mkdirSync, writeFileSync } from 'node:fs';

const name = process.argv[2];
if (!name || !/^[a-z-]+$/.test(name)) throw new Error('A safe evidence name is required.');
mkdirSync('reports/raw', { recursive: true });
writeFileSync(
  `reports/raw/${name}.json`,
  JSON.stringify(
    { passed: true, source: 'successful-command-exit', generatedAt: new Date().toISOString() },
    null,
    2,
  ),
);
