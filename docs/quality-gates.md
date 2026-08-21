# Quality gates and score

## Gate semantics

- **Mandatory gate:** an actual measurement must meet the configured threshold.
- **Warning threshold:** produces `CONDITIONAL_PASS`; it never hides a hard failure.
- **Hard failure:** produces `FAIL` and a non-zero CLI exit.
- **Missing report:** fails when listed in `mandatoryReports`.
- **Infrastructure error:** malformed input/policy or unreadable evidence exits separately with classification `INFRASTRUCTURE`.

Pass percentage alone is insufficient: 100% functional tests can coexist with a high-severity vulnerability, critical WCAG defect, performance regression, or absent scan.

## Score formula

The deterministic component scores are:

- Code quality: mean of static-analysis status (100/0), line, branch, and function coverage.
- Functional: mean unit, API, integration, and contract pass rate.
- E2E: mean overall and critical pass rate.
- Security: `100 - 50×critical - 25×high - 5×medium - 50×secrets`, clamped to 0–100.
- Accessibility: `100 - 50×critical - 25×serious - 5×moderate`, clamped.
- Performance: mean of latency ratio score and error-rate score, both clamped.

The overall score is the weighted sum from policy. Default weights total 100%. A good score cannot override any hard gate.

## Examples

- Healthy evidence: `PASS`.
- p95 between 900 and 1,000 ms: `CONDITIONAL_PASS` warning.
- One high vulnerability, serious Axe violation, p95 above 1,000 ms, or mandatory missing report: `FAIL`.

Engine tests cover all these cases plus invalid policy and multiple simultaneous failures.
