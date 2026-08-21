import type { GateCheck } from '../model.js';

export function releaseDecision(checks: GateCheck[]): {
  decision: 'PASS' | 'CONDITIONAL_PASS' | 'FAIL';
  reasons: string[];
} {
  const failures = checks.filter((check) => check.status === 'FAIL');
  if (failures.length > 0) {
    return {
      decision: 'FAIL',
      reasons: failures.map(
        (failure) =>
          `${failure.dimension}: ${failure.metric} was ${String(failure.actual)}; required ${String(failure.threshold)}.`,
      ),
    };
  }
  const warnings = checks.filter((check) => check.status === 'WARN');
  if (warnings.length > 0) {
    return {
      decision: 'CONDITIONAL_PASS',
      reasons: warnings.map(
        (warning) => `${warning.dimension}: ${warning.metric} is ${String(warning.actual)}.`,
      ),
    };
  }
  return { decision: 'PASS', reasons: ['All mandatory quality thresholds are satisfied.'] };
}
