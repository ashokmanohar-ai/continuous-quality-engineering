# Validation report

Validated on 21 August 2026 in the available Linux workspace using Node.js 24.19.0. The supported CI/runtime target remains Node.js 22.22.0.

## Executed successfully

| Validation                                  | Result | Evidence                                                                                              |
| ------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| Clean dependency installation               | PASS   | `npm ci --no-audit --no-fund`; 338 packages installed from lock file                                  |
| Dependency vulnerability audit              | PASS   | `npm audit --audit-level=high`; 0 vulnerabilities                                                     |
| ESLint                                      | PASS   | No findings                                                                                           |
| Prettier                                    | PASS   | All matched files use configured style                                                                |
| TypeScript strict check                     | PASS   | `tsc --noEmit`                                                                                        |
| Production TypeScript build                 | PASS   | `tsc -p tsconfig.build.json`                                                                          |
| Unit and quality-engine tests               | PASS   | 62/62                                                                                                 |
| Coverage gate                               | PASS   | Statements 83.52%, branches 75.94%, functions 88.37%, lines 83.12%                                    |
| API tests                                   | PASS   | 13/13, including auth, schema, validation, authorization, create/read                                 |
| Integration tests                           | PASS   | 5/5 across login, service, SQLite persistence, pricing, and rollback paths                            |
| Pact consumer contracts                     | PASS   | 3/3; Pact V4 file generated                                                                           |
| Quality-gate negative scenarios             | PASS   | Coverage, security, accessibility, performance, missing evidence, warning, and compound failure cases |
| Controlled healthy quality gate             | PASS   | Decision `PASS`; deterministic score 99/100                                                           |
| Incomplete-evidence behaviour               | PASS   | Actual partial evidence correctly returned `FAIL`, not false green                                    |
| Security gate incomplete-evidence behaviour | PASS   | Missing Gitleaks/Trivy/ZAP evidence correctly returned non-zero                                       |
| Unified result aggregation                  | PASS   | Correctly normalized 62 unit, 13 API, 5 integration, and 3 contract results                           |
| HTML/JSON quality report generation         | PASS   | Partial report generated truthfully with `FAIL` decision                                              |
| GitHub Actions structural validation        | PASS   | Five workflows parsed; triggers, permissions, jobs, and action references checked                     |
| Secret-pattern review                       | PASS   | No token/private-key patterns or unfinished critical TODO/FIXME markers found                         |

## Not executable in this workspace

| Validation                      | Status                 | Reason and follow-up                                                                                                                               |
| ------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser E2E                     | CI VALIDATION REQUIRED | Playwright browser download returned a zero-byte/truncated archive from the restricted network. Tests compile and the CI runner installs Chromium. |
| Axe accessibility               | CI VALIDATION REQUIRED | Requires the same unavailable Chromium binary. Raw finding and hard-gate integration are implemented.                                              |
| k6 performance                  | CI VALIDATION REQUIRED | k6 binary is not installed locally; GitHub Actions provisions it and preserves JSON summary evidence.                                              |
| Gitleaks and Trivy execution    | CI VALIDATION REQUIRED | CLIs are unavailable locally; PR/security workflows provision and enforce them. npm audit ran locally with zero vulnerabilities.                   |
| OWASP ZAP                       | CI VALIDATION REQUIRED | Docker/ZAP are unavailable; scheduled/release workflows run the configured baseline scan and require its JSON evidence.                            |
| Docker build/Compose recreation | CI VALIDATION REQUIRED | Docker is not installed in the workspace. Dockerfile/Compose configuration and workflow assumptions were statically reviewed.                      |

## Known limitations

- The demo uses one in-memory user/session model and built-in SQLite; production scale requires external identity, managed persistence, migrations, and distributed session handling.
- Automated Axe and ZAP checks do not establish full WCAG conformance or complete security assurance.
- GitHub-hosted performance results are smoke signals; release baselines should use controlled runners.
- `quality-history/sample-history.json` is explicitly synthetic demonstration data.

## Overall status

**SOURCE READY — REMOTE CI VALIDATION REQUIRED.** Locally executable application, functional, contract, quality-engine, reporting, dependency, and pipeline checks pass. Browser, container, DAST, dedicated security CLI, and k6 execution must be confirmed by the repository workflows before describing the project as fully validated.
