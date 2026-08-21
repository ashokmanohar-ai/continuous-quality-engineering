import { readdirSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';

const workflowDirectory = '.github/workflows';
const required = [
  'pr-quality.yml',
  'nightly-regression.yml',
  'security.yml',
  'performance.yml',
  'release-quality.yml',
];
const issues: string[] = [];
for (const name of required) {
  if (!readdirSync(workflowDirectory).includes(name)) issues.push(`${name}: missing workflow`);
}
for (const name of readdirSync(workflowDirectory).filter((file) => file.endsWith('.yml'))) {
  const source = readFileSync(`${workflowDirectory}/${name}`, 'utf8');
  let workflow: Record<string, unknown>;
  try {
    workflow = parse(source) as Record<string, unknown>;
  } catch (error) {
    issues.push(`${name}: YAML parse failed: ${error instanceof Error ? error.message : String(error)}`);
    continue;
  }
  if (!workflow.on) issues.push(`${name}: no trigger`);
  if (!workflow.permissions) issues.push(`${name}: permissions are not explicit`);
  if (!workflow.jobs || Object.keys(workflow.jobs as object).length === 0) issues.push(`${name}: no jobs`);
  for (const match of source.matchAll(/uses:\s*([^\s#]+)/g)) {
    const reference = match[1] ?? '';
    if (/@(?:main|master|latest)$/.test(reference))
      issues.push(`${name}: mutable action reference ${reference}`);
  }
  if (/continue-on-error:\s*true/.test(source) && !/quality:gate|aggregate|evidence/.test(source)) {
    issues.push(`${name}: continue-on-error requires explicit downstream evidence handling`);
  }
}
if (issues.length) {
  console.error(issues.join('\n'));
  process.exit(1);
}
console.log(
  `Validated ${required.length} workflow files: syntax, triggers, permissions, jobs, and action references.`,
);
