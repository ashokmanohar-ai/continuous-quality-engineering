import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import type { NormalizedQualityResults, TestMetric } from '../quality/model.js';

const raw = 'reports/raw';
const missingReports: string[] = [];

function json<T>(path: string, evidenceName: string): T | undefined {
  if (!existsSync(path)) {
    missingReports.push(evidenceName);
    return undefined;
  }
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function emptyMetric(): TestMetric {
  return { total: 0, passed: 0, failed: 0, skipped: 0, passRate: 0 };
}

function junit(path: string, evidenceName: string): TestMetric {
  if (!existsSync(path)) {
    missingReports.push(evidenceName);
    return emptyMetric();
  }
  const xml = readFileSync(path, 'utf8');
  const suites = [...xml.matchAll(/<testsuite\b[^>]*>/g)].map((match) => match[0]);
  const value = (tag: string, attribute: string): number => {
    const match = new RegExp(`${attribute}="(\\d+)"`).exec(tag);
    return match ? Number(match[1]) : 0;
  };
  const total = suites.reduce((sum, tag) => sum + value(tag, 'tests'), 0);
  const failed = suites.reduce((sum, tag) => sum + value(tag, 'failures') + value(tag, 'errors'), 0);
  const skipped = suites.reduce((sum, tag) => sum + value(tag, 'skipped'), 0);
  const passed = Math.max(0, total - failed - skipped);
  return {
    total,
    passed,
    failed,
    skipped,
    passRate: total === 0 ? 0 : (passed / (total - skipped || 1)) * 100,
  };
}

type PlaywrightResult = { status?: string; retry?: number };
type PlaywrightTest = { results?: PlaywrightResult[] };
type PlaywrightSpec = { title?: string; tests?: PlaywrightTest[] };

function playwright(
  path: string,
  evidenceName: string,
): { metric: TestMetric; criticalTotal: number; criticalPassed: number; flaky: string[] } {
  const report = json<unknown>(path, evidenceName);
  if (!report) return { metric: emptyMetric(), criticalTotal: 0, criticalPassed: 0, flaky: [] };
  const specs: PlaywrightSpec[] = [];
  const walk = (value: unknown): void => {
    if (!value || typeof value !== 'object') return;
    const object = value as Record<string, unknown>;
    if (Array.isArray(object.specs)) specs.push(...(object.specs as PlaywrightSpec[]));
    for (const child of Object.values(object)) {
      if (Array.isArray(child)) child.forEach(walk);
      else if (child && typeof child === 'object') walk(child);
    }
  };
  walk(report);
  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let criticalTotal = 0;
  let criticalPassed = 0;
  const flaky: string[] = [];
  for (const spec of specs) {
    for (const test of spec.tests ?? []) {
      total += 1;
      const results = test.results ?? [];
      const final = results.at(-1)?.status;
      if (final === 'passed') passed += 1;
      else if (final === 'skipped') skipped += 1;
      else failed += 1;
      if ((spec.title ?? '').includes('@critical')) {
        criticalTotal += 1;
        if (final === 'passed') criticalPassed += 1;
      }
      if (results.length > 1 && results.some((result) => result.status !== 'passed') && final === 'passed') {
        flaky.push(spec.title ?? 'untitled test');
      }
    }
  }
  return {
    metric: {
      total,
      passed,
      failed,
      skipped,
      passRate: total === skipped ? 0 : (passed / (total - skipped)) * 100,
    },
    criticalTotal,
    criticalPassed,
    flaky,
  };
}

function git(args: string[], fallback: string): string {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim() || fallback;
  } catch {
    return fallback;
  }
}

const unit = junit(`${raw}/unit-junit.xml`, 'unit');
const contract = junit(`${raw}/contract-junit.xml`, 'contract');
const api = playwright(`${raw}/api-playwright.json`, 'api');
const integration = playwright(`${raw}/integration-playwright.json`, 'integration');
const e2e = playwright(`${raw}/e2e-playwright.json`, 'e2e');
const accessibilityRun = playwright(`${raw}/accessibility-playwright.json`, 'accessibility');
const coverage = json<
  Record<
    string,
    {
      lines: { pct: number };
      branches: { pct: number };
      functions: { pct: number };
      statements: { pct: number };
    }
  >
>('reports/coverage/coverage-summary.json', 'unit');
const totalCoverage = coverage?.total;
const accessibility = json<{ findings: Array<{ impact: string | null }> }>(
  `${raw}/accessibility.json`,
  'accessibility',
);
const audit = json<{ metadata?: { vulnerabilities?: Record<string, number> } }>(
  `${raw}/npm-audit.json`,
  'npm-audit',
);
const trivy = json<{ Results?: Array<{ Vulnerabilities?: Array<{ Severity?: string }> }> }>(
  `${raw}/trivy.json`,
  'trivy',
);
const gitleaks = json<unknown>(`${raw}/gitleaks.json`, 'gitleaks');
const zap = json<{ site?: Array<{ alerts?: Array<{ riskcode?: string }> }> }>(`${raw}/zap.json`, 'zap');
const performance = json<{ metrics?: Record<string, { values?: Record<string, number> }> }>(
  `${raw}/performance-summary.json`,
  'performance',
);
const staticEvidence = json<{ passed: boolean }>(`${raw}/static.json`, 'static');

const securityCounts = { critical: 0, high: 0, medium: 0, low: 0, secrets: 0 };
const auditCounts = audit?.metadata?.vulnerabilities ?? {};
securityCounts.critical += auditCounts.critical ?? 0;
securityCounts.high += auditCounts.high ?? 0;
securityCounts.medium += auditCounts.moderate ?? 0;
securityCounts.low += auditCounts.low ?? 0;
for (const result of trivy?.Results ?? []) {
  for (const vulnerability of result.Vulnerabilities ?? []) {
    const severity = (vulnerability.Severity ?? '').toLowerCase() as keyof typeof securityCounts;
    if (severity in securityCounts && severity !== 'secrets') securityCounts[severity] += 1;
  }
}
securityCounts.secrets = Array.isArray(gitleaks)
  ? gitleaks.length
  : typeof gitleaks === 'object' && gitleaks !== null && 'leaks' in gitleaks
    ? Number((gitleaks as { leaks: number }).leaks)
    : 0;
for (const site of zap?.site ?? []) {
  for (const alert of site.alerts ?? []) {
    const severity = ({ '3': 'high', '2': 'medium', '1': 'low' } as const)[alert.riskcode as '1' | '2' | '3'];
    if (severity) securityCounts[severity] += 1;
  }
}

const impactCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
for (const finding of accessibility?.findings ?? []) {
  const impact = finding.impact as keyof typeof impactCounts;
  if (impact in impactCounts) impactCounts[impact] += 1;
}

const allFlaky = [...api.flaky, ...integration.flaky, ...e2e.flaky, ...accessibilityRun.flaky];
const results: NormalizedQualityResults = {
  build: {
    commit: process.env.GITHUB_SHA ?? git(['rev-parse', '--short', 'HEAD'], 'local-uncommitted'),
    branch: process.env.GITHUB_REF_NAME ?? git(['branch', '--show-current'], 'local'),
    environment: process.env.TEST_ENV ?? 'LOCAL',
    generatedAt: new Date().toISOString(),
  },
  staticAnalysis: { passed: staticEvidence?.passed ?? false },
  unit: {
    ...unit,
    coverage: {
      lines: totalCoverage?.lines.pct ?? 0,
      branches: totalCoverage?.branches.pct ?? 0,
      functions: totalCoverage?.functions.pct ?? 0,
      statements: totalCoverage?.statements.pct ?? 0,
    },
  },
  api: api.metric,
  integration: integration.metric,
  contract,
  e2e: {
    ...e2e.metric,
    criticalTotal: e2e.criticalTotal,
    criticalPassed: e2e.criticalPassed,
    criticalPassRate: e2e.criticalTotal === 0 ? 0 : (e2e.criticalPassed / e2e.criticalTotal) * 100,
  },
  accessibility: impactCounts,
  security: securityCounts,
  performance: {
    p95Ms: performance?.metrics?.http_req_duration?.values?.['p(95)'] ?? 0,
    errorRatePercent: (performance?.metrics?.http_req_failed?.values?.rate ?? 0) * 100,
    iterations: performance?.metrics?.iterations?.values?.count ?? 0,
  },
  flaky: {
    total: allFlaky.length,
    critical: allFlaky.filter((name) => name.includes('@critical')).length,
    tests: allFlaky,
  },
  missingReports: [...new Set(missingReports)],
};

mkdirSync('reports/quality', { recursive: true });
writeFileSync('reports/quality/normalized-results.json', JSON.stringify(results, null, 2));
console.log(`Normalized quality evidence. Missing reports: ${results.missingReports.join(', ') || 'none'}.`);
