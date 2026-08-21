export type TestMetric = {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
};

export type NormalizedQualityResults = {
  build: {
    commit: string;
    branch: string;
    environment: string;
    generatedAt: string;
  };
  staticAnalysis: { passed: boolean };
  unit: TestMetric & { coverage: { lines: number; branches: number; functions: number; statements: number } };
  api: TestMetric;
  integration: TestMetric;
  contract: TestMetric;
  e2e: TestMetric & { criticalTotal: number; criticalPassed: number; criticalPassRate: number };
  accessibility: { critical: number; serious: number; moderate: number; minor: number };
  security: { critical: number; high: number; medium: number; low: number; secrets: number };
  performance: { p95Ms: number; errorRatePercent: number; iterations: number };
  flaky: { total: number; critical: number; tests: string[] };
  missingReports: string[];
};

export type QualityGatePolicy = {
  mandatoryReports: string[];
  unit: { minimumPassRate: number; minimumCoverage: number };
  api: { minimumPassRate: number };
  integration: { minimumPassRate: number };
  contract: { minimumPassRate: number };
  e2e: { criticalPassRate: number; overallPassRate: number };
  accessibility: { criticalViolations: number; seriousViolations: number };
  security: { critical: number; high: number; secrets: number; mediumWarning: number };
  performance: { warningP95Ms: number; failureP95Ms: number; errorRatePercent: number };
  flaky: { maximumCritical: number };
  weights: {
    codeQuality: number;
    functional: number;
    e2e: number;
    security: number;
    performance: number;
    accessibility: number;
  };
};

export type GateCheck = {
  dimension: string;
  metric: string;
  actual: string | number | boolean;
  threshold: string | number | boolean;
  status: 'PASS' | 'WARN' | 'FAIL';
};

export type QualityScore = {
  codeQuality: number;
  functional: number;
  e2e: number;
  security: number;
  performance: number;
  accessibility: number;
  overall: number;
};

export type GateEvaluation = {
  checks: GateCheck[];
  score: QualityScore;
  decision: 'PASS' | 'CONDITIONAL_PASS' | 'FAIL';
  reasons: string[];
};
