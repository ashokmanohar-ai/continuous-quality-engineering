import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import type { GateCheck, GateEvaluation, NormalizedQualityResults, QualityGatePolicy } from '../model.js';
import { readPolicy } from './policy.js';
import { calculateQualityScore } from './quality-score.js';
import { releaseDecision } from './release-decision.js';

function check(
  dimension: string,
  metric: string,
  actual: number | boolean,
  threshold: number | boolean,
  passes: boolean,
  warning = false,
): GateCheck {
  return { dimension, metric, actual, threshold, status: passes ? (warning ? 'WARN' : 'PASS') : 'FAIL' };
}

export function evaluateQuality(
  results: NormalizedQualityResults,
  policy: QualityGatePolicy,
): GateEvaluation {
  const checks: GateCheck[] = [];
  for (const report of policy.mandatoryReports) {
    checks.push(
      check(
        'Evidence',
        `${report} report present`,
        !results.missingReports.includes(report),
        true,
        !results.missingReports.includes(report),
      ),
    );
  }
  checks.push(
    check(
      'Code Quality',
      'static analysis',
      results.staticAnalysis.passed,
      true,
      results.staticAnalysis.passed,
    ),
  );
  checks.push(
    check(
      'Unit',
      'pass rate',
      results.unit.passRate,
      policy.unit.minimumPassRate,
      results.unit.passRate >= policy.unit.minimumPassRate,
    ),
  );
  checks.push(
    check(
      'Unit',
      'line coverage',
      results.unit.coverage.lines,
      policy.unit.minimumCoverage,
      results.unit.coverage.lines >= policy.unit.minimumCoverage,
    ),
  );
  checks.push(
    check(
      'API',
      'pass rate',
      results.api.passRate,
      policy.api.minimumPassRate,
      results.api.passRate >= policy.api.minimumPassRate,
    ),
  );
  checks.push(
    check(
      'Integration',
      'pass rate',
      results.integration.passRate,
      policy.integration.minimumPassRate,
      results.integration.passRate >= policy.integration.minimumPassRate,
    ),
  );
  checks.push(
    check(
      'Contract',
      'pass rate',
      results.contract.passRate,
      policy.contract.minimumPassRate,
      results.contract.passRate >= policy.contract.minimumPassRate,
    ),
  );
  checks.push(
    check(
      'E2E',
      'critical pass rate',
      results.e2e.criticalPassRate,
      policy.e2e.criticalPassRate,
      results.e2e.criticalPassRate >= policy.e2e.criticalPassRate,
    ),
  );
  checks.push(
    check(
      'E2E',
      'overall pass rate',
      results.e2e.passRate,
      policy.e2e.overallPassRate,
      results.e2e.passRate >= policy.e2e.overallPassRate,
    ),
  );
  checks.push(
    check(
      'Accessibility',
      'critical violations',
      results.accessibility.critical,
      policy.accessibility.criticalViolations,
      results.accessibility.critical <= policy.accessibility.criticalViolations,
    ),
  );
  checks.push(
    check(
      'Accessibility',
      'serious violations',
      results.accessibility.serious,
      policy.accessibility.seriousViolations,
      results.accessibility.serious <= policy.accessibility.seriousViolations,
    ),
  );
  checks.push(
    check(
      'Security',
      'critical findings',
      results.security.critical,
      policy.security.critical,
      results.security.critical <= policy.security.critical,
    ),
  );
  checks.push(
    check(
      'Security',
      'high findings',
      results.security.high,
      policy.security.high,
      results.security.high <= policy.security.high,
    ),
  );
  checks.push(
    check(
      'Security',
      'secrets',
      results.security.secrets,
      policy.security.secrets,
      results.security.secrets <= policy.security.secrets,
    ),
  );
  if (results.security.medium > policy.security.mediumWarning) {
    checks.push(
      check(
        'Security',
        'medium findings',
        results.security.medium,
        policy.security.mediumWarning,
        true,
        true,
      ),
    );
  }
  checks.push(
    check(
      'Performance',
      'p95 milliseconds',
      results.performance.p95Ms,
      policy.performance.failureP95Ms,
      results.performance.p95Ms <= policy.performance.failureP95Ms,
      results.performance.p95Ms > policy.performance.warningP95Ms,
    ),
  );
  checks.push(
    check(
      'Performance',
      'error rate percent',
      results.performance.errorRatePercent,
      policy.performance.errorRatePercent,
      results.performance.errorRatePercent <= policy.performance.errorRatePercent,
    ),
  );
  checks.push(
    check(
      'Flakiness',
      'critical flaky tests',
      results.flaky.critical,
      policy.flaky.maximumCritical,
      results.flaky.critical <= policy.flaky.maximumCritical,
    ),
  );

  const decision = releaseDecision(checks);
  return { checks, score: calculateQualityScore(results, policy), ...decision };
}

function argument(name: string, fallback: string): string {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1]! : fallback;
}

export function formatEvaluation(evaluation: GateEvaluation): string {
  const rows = evaluation.checks.map(
    (item) =>
      `${item.dimension.padEnd(16)} ${item.metric.padEnd(25)} ${String(item.actual).padStart(8)}  ${item.status}`,
  );
  return [
    'CONTINUOUS QUALITY GATE',
    '',
    ...rows,
    '',
    `Overall Quality Score: ${evaluation.score.overall}/100`,
    '--------------------------------',
    `RELEASE DECISION: ${evaluation.decision}`,
    '--------------------------------',
    ...evaluation.reasons,
  ].join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const resultsPath = argument('--results', 'reports/quality/normalized-results.json');
  const policyPath = argument('--policy', process.env.QUALITY_POLICY ?? 'quality/config/quality-gates.json');
  const outputPath = argument('--output', 'reports/quality/gate-evaluation.json');
  try {
    const results = JSON.parse(readFileSync(resultsPath, 'utf8')) as NormalizedQualityResults;
    const evaluation = evaluateQuality(results, readPolicy(policyPath));
    mkdirSync('reports/quality', { recursive: true });
    writeFileSync(outputPath, JSON.stringify(evaluation, null, 2));
    console.log(formatEvaluation(evaluation));
    if (evaluation.decision === 'FAIL') process.exitCode = 1;
  } catch (error) {
    console.error(
      `Quality gate infrastructure failure: ${error instanceof Error ? error.message : String(error)}`,
    );
    console.error('Classification: INFRASTRUCTURE');
    process.exitCode = 2;
  }
}
