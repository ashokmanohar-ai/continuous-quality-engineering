# Continuous quality strategy

Continuous testing executes tests frequently. Continuous quality combines those results with code, security, accessibility, performance, reliability, and evidence-completeness signals to make delivery risk visible and enforceable.

## Principles

- **Shift left:** formatting, types, unit, API, contracts, SCA, and secret scans give early feedback.
- **Shift right:** production health, SLOs, canary behaviour, and customer signals would complement pre-release evidence; they are intentionally not simulated here.
- **Test pyramid:** many deterministic domain checks, focused API/integration tests, and a small critical E2E suite.
- **Fast feedback:** independent PR jobs run in parallel; nightly/release profiles carry heavier cross-browser, DAST, and load work.
- **Risk based:** changed paths map deterministically to `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL` suites. Production platforms should enrich this with dependency/service maps.
- **Quality ownership:** PR authors state risk and impact; owners review policy and exceptions.
- **Automation economics:** a check belongs on every PR only when its risk reduction justifies its time and instability cost.

## Example execution policy

| Risk     | Minimum signals                                              |
| -------- | ------------------------------------------------------------ |
| LOW      | Static, unit, API                                            |
| MEDIUM   | LOW + integration and contract                               |
| HIGH     | MEDIUM + E2E and accessibility                               |
| CRITICAL | Full functional, security, performance, and release evidence |

Documentation-only selection is an optimization, not permission to bypass repository hygiene. Dependency and authentication changes are always critical in the sample impact model.
