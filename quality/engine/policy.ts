import { readFileSync } from 'node:fs';
import { z } from 'zod';
import type { QualityGatePolicy } from '../model.js';

const percentage = z.number().min(0).max(100);
const nonNegative = z.number().min(0);

export const policySchema = z
  .object({
    mandatoryReports: z.array(z.string().min(1)).min(1),
    unit: z.object({ minimumPassRate: percentage, minimumCoverage: percentage }),
    api: z.object({ minimumPassRate: percentage }),
    integration: z.object({ minimumPassRate: percentage }),
    contract: z.object({ minimumPassRate: percentage }),
    e2e: z.object({ criticalPassRate: percentage, overallPassRate: percentage }),
    accessibility: z.object({ criticalViolations: nonNegative, seriousViolations: nonNegative }),
    security: z.object({
      critical: nonNegative,
      high: nonNegative,
      secrets: nonNegative,
      mediumWarning: nonNegative,
    }),
    performance: z.object({
      warningP95Ms: nonNegative,
      failureP95Ms: nonNegative,
      errorRatePercent: percentage,
    }),
    flaky: z.object({ maximumCritical: nonNegative }),
    weights: z.object({
      codeQuality: percentage,
      functional: percentage,
      e2e: percentage,
      security: percentage,
      performance: percentage,
      accessibility: percentage,
    }),
  })
  .superRefine((policy, context) => {
    const weightTotal = Object.values(policy.weights).reduce((sum, value) => sum + value, 0);
    if (weightTotal !== 100)
      context.addIssue({ code: 'custom', message: 'Quality score weights must total 100.' });
    if (policy.performance.warningP95Ms > policy.performance.failureP95Ms) {
      context.addIssue({
        code: 'custom',
        message: 'Performance warning threshold cannot exceed failure threshold.',
      });
    }
  });

export function readPolicy(path: string): QualityGatePolicy {
  return policySchema.parse(JSON.parse(readFileSync(path, 'utf8')));
}
