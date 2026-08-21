import { execFileSync } from 'node:child_process';

type Risk = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
const base = process.env.BASE_SHA ?? process.argv[2] ?? 'HEAD~1';
const changed = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);
const suites = new Set<string>(['static', 'unit']);
let risk: Risk = 'LOW';
const elevate = (next: Risk): void => {
  const rank: Risk[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  if (rank.indexOf(next) > rank.indexOf(risk)) risk = next;
};
for (const path of changed) {
  if (/package(-lock)?\.json|Dockerfile|security\//.test(path)) {
    suites.add('security');
    suites.add('regression');
    elevate('CRITICAL');
  } else if (/demo-app\/src\/(services|repositories)|api/.test(path)) {
    suites.add('api');
    suites.add('integration');
    elevate('MEDIUM');
  } else if (/demo-app\/src\/(ui|app)|tests\/e2e/.test(path)) {
    suites.add('e2e');
    suites.add('accessibility');
    elevate('HIGH');
  } else if (!path.startsWith('docs/')) {
    suites.add('api');
    elevate('MEDIUM');
  }
}
console.log(
  JSON.stringify(
    { base, changed, docsOnly: changed.every((path) => path.startsWith('docs/')), risk, suites: [...suites] },
    null,
    2,
  ),
);
