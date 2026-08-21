import { existsSync, readFileSync } from 'node:fs';

function readJson<T>(path: string): T | undefined {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as T) : undefined;
}

const audit = readJson<{ metadata?: { vulnerabilities?: Record<string, number> } }>(
  'reports/raw/npm-audit.json',
);
const trivy = readJson<{
  Results?: Array<{ Vulnerabilities?: Array<{ Severity?: string }> }>;
}>('reports/raw/trivy.json');
const gitleaks = readJson<unknown>('reports/raw/gitleaks.json');
const zap = readJson<{ site?: Array<{ alerts?: Array<{ riskcode?: string }> }> }>('reports/raw/zap.json');
const missing = [!audit && 'npm-audit', !trivy && 'trivy', !gitleaks && 'gitleaks', !zap && 'zap'].filter(
  Boolean,
) as string[];

const counts = { critical: 0, high: 0, medium: 0, secrets: 0 };
const auditCounts = audit?.metadata?.vulnerabilities ?? {};
counts.critical += auditCounts.critical ?? 0;
counts.high += auditCounts.high ?? 0;
counts.medium += auditCounts.moderate ?? 0;
for (const result of trivy?.Results ?? []) {
  for (const vulnerability of result.Vulnerabilities ?? []) {
    const severity = vulnerability.Severity?.toLowerCase();
    if (severity === 'critical' || severity === 'high' || severity === 'medium') counts[severity] += 1;
  }
}
counts.secrets = Array.isArray(gitleaks)
  ? gitleaks.length
  : typeof gitleaks === 'object' && gitleaks !== null && 'leaks' in gitleaks
    ? Number((gitleaks as { leaks: number }).leaks)
    : 0;
for (const site of zap?.site ?? []) {
  for (const alert of site.alerts ?? []) {
    if (alert.riskcode === '3') counts.high += 1;
    if (alert.riskcode === '2') counts.medium += 1;
  }
}

console.log(JSON.stringify({ missing, counts }, null, 2));
if (missing.length > 0 || counts.critical > 0 || counts.high > 0 || counts.secrets > 0) {
  console.error('SECURITY GATE: FAIL');
  process.exit(1);
}
console.log(counts.medium > 0 ? 'SECURITY GATE: PASS WITH MEDIUM WARNINGS' : 'SECURITY GATE: PASS');
