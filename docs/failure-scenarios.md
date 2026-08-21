# Controlled gate scenarios

All examples use cloned fixtures inside `quality-gate.spec.ts`; no deliberately broken finding remains on `main`.

| Scenario               | Evidence                                                | Expected decision         |
| ---------------------- | ------------------------------------------------------- | ------------------------- |
| Healthy change         | All tests pass, no blocking findings, p95 within target | PASS                      |
| Security failure       | One high/critical finding                               | FAIL; release blocked     |
| Performance regression | Functional pass, p95 above 1,000 ms                     | FAIL                      |
| Accessibility failure  | Critical or serious Axe violation                       | FAIL                      |
| Warning-only latency   | p95 above 900 but at/below 1,000 ms                     | CONDITIONAL_PASS          |
| Scanner interruption   | Mandatory report absent                                 | FAIL; evidence incomplete |
