import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { NormalizedQualityResults, QualityGatePolicy } from '../model.js';
import { policySchema, readPolicy } from './policy.js';
import { evaluateQuality } from './quality-gate.js';

const healthy = JSON.parse(readFileSync('quality/fixtures/healthy.json', 'utf8')) as NormalizedQualityResults;
const policy = readPolicy('quality/config/quality-gates.json');
const scenario = (change: (copy: NormalizedQualityResults) => void): NormalizedQualityResults => {
  const copy = structuredClone(healthy);
  change(copy);
  return copy;
};

describe('quality gate', () => {
  it('passes when all mandatory gates pass', () => {
    const evaluation = evaluateQuality(healthy, policy);
    expect(evaluation.decision).toBe('PASS');
    expect(evaluation.score.overall).toBeGreaterThanOrEqual(90);
  });

  it('fails when unit coverage is below policy', () => {
    const evaluation = evaluateQuality(
      scenario((copy) => (copy.unit.coverage.lines = 79)),
      policy,
    );
    expect(evaluation.decision).toBe('FAIL');
    expect(evaluation.reasons.join(' ')).toContain('line coverage');
  });

  it('fails on a critical security finding', () => {
    const evaluation = evaluateQuality(
      scenario((copy) => (copy.security.critical = 1)),
      policy,
    );
    expect(evaluation.decision).toBe('FAIL');
    expect(evaluation.reasons.join(' ')).toContain('critical findings');
  });

  it('fails on a serious accessibility violation', () => {
    expect(
      evaluateQuality(
        scenario((copy) => (copy.accessibility.serious = 1)),
        policy,
      ).decision,
    ).toBe('FAIL');
  });

  it('fails on a performance regression', () => {
    expect(
      evaluateQuality(
        scenario((copy) => (copy.performance.p95Ms = 1_200)),
        policy,
      ).decision,
    ).toBe('FAIL');
  });

  it('fails closed when a mandatory report is missing', () => {
    const evaluation = evaluateQuality(
      scenario((copy) => copy.missingReports.push('trivy')),
      policy,
    );
    expect(evaluation.decision).toBe('FAIL');
    expect(evaluation.reasons.join(' ')).toContain('trivy report present');
  });

  it('rejects an invalid quality policy', () => {
    const invalid = structuredClone(policy) as QualityGatePolicy;
    invalid.weights.codeQuality = 99;
    expect(() => policySchema.parse(invalid)).toThrow('weights');
  });

  it('returns conditional pass for warning-only performance', () => {
    expect(
      evaluateQuality(
        scenario((copy) => (copy.performance.p95Ms = 950)),
        policy,
      ).decision,
    ).toBe('CONDITIONAL_PASS');
  });

  it('keeps medium security findings visible as warnings', () => {
    const evaluation = evaluateQuality(
      scenario((copy) => (copy.security.medium = 1)),
      policy,
    );
    expect(evaluation.decision).toBe('CONDITIONAL_PASS');
    expect(evaluation.checks).toContainEqual(
      expect.objectContaining({ metric: 'medium findings', status: 'WARN' }),
    );
  });

  it('reports multiple simultaneous failures', () => {
    const evaluation = evaluateQuality(
      scenario((copy) => {
        copy.unit.passRate = 90;
        copy.security.high = 2;
        copy.accessibility.critical = 1;
      }),
      policy,
    );
    expect(evaluation.decision).toBe('FAIL');
    expect(evaluation.reasons).toHaveLength(3);
  });
});
