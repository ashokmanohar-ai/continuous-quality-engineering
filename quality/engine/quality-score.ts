import { readFileSync } from 'node:fs';
import type { NormalizedQualityResults, QualityGatePolicy, QualityScore } from '../model.js';
import { readPolicy } from './policy.js';

const clamp = (value: number): number => Math.max(0, Math.min(100, value));
const average = (values: number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;

export function calculateQualityScore(
  results: NormalizedQualityResults,
  policy: QualityGatePolicy,
): QualityScore {
  const codeQuality = Math.round(
    average([
      results.staticAnalysis.passed ? 100 : 0,
      results.unit.coverage.lines,
      results.unit.coverage.branches,
      results.unit.coverage.functions,
    ]),
  );
  const functional = Math.round(
    average([
      results.unit.passRate,
      results.api.passRate,
      results.integration.passRate,
      results.contract.passRate,
    ]),
  );
  const e2e = Math.round(average([results.e2e.passRate, results.e2e.criticalPassRate]));
  const security = Math.round(
    clamp(
      100 -
        results.security.critical * 50 -
        results.security.high * 25 -
        results.security.medium * 5 -
        results.security.secrets * 50,
    ),
  );
  const accessibility = Math.round(
    clamp(
      100 -
        results.accessibility.critical * 50 -
        results.accessibility.serious * 25 -
        results.accessibility.moderate * 5,
    ),
  );
  const latencyScore = clamp(
    100 * (policy.performance.failureP95Ms / Math.max(results.performance.p95Ms, 1)),
  );
  const errorScore = clamp(100 - results.performance.errorRatePercent * 25);
  const performance = Math.round(average([latencyScore, errorScore]));

  const componentScores = { codeQuality, functional, e2e, security, performance, accessibility };
  const overall = Math.round(
    Object.entries(policy.weights).reduce(
      (sum, [key, weight]) => sum + componentScores[key as keyof typeof componentScores] * (weight / 100),
      0,
    ),
  );
  return { ...componentScores, overall };
}

function argument(name: string, fallback: string): string {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1]! : fallback;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const resultsPath = argument('--results', 'reports/quality/normalized-results.json');
  const policyPath = argument('--policy', 'quality/config/quality-gates.json');
  const results = JSON.parse(readFileSync(resultsPath, 'utf8')) as NormalizedQualityResults;
  console.log(JSON.stringify(calculateQualityScore(results, readPolicy(policyPath)), null, 2));
}
