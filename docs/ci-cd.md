# CI/CD design

## GitHub Actions

| Workflow            | Intent                        | Typical depth                                                                                       |
| ------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------- |
| PR Quality          | Fast branch-protection signal | Parallel static/unit, API/integration/contract, E2E, accessibility/performance smoke, fast security |
| Nightly Regression  | Broader confidence            | Cross-browser regression plus reusable security/load workflows                                      |
| Security Quality    | Deep security evidence        | SCA, Gitleaks, Trivy source/image, ZAP, CodeQL                                                      |
| Performance Quality | Workload evidence             | Smoke or five-minute load profile                                                                   |
| Release Quality     | Release recommendation        | Full evidence, unified report, hard gate                                                            |

PR concurrency cancels stale commits. Independent jobs continue collecting evidence even if one fails; the final gate uses `always()` and fails closed for missing artifacts. Caches cover npm downloads only and never replace the lock file. Artifacts retain JSON, JUnit, coverage, Playwright HTML/traces/screenshots, Pact files, security evidence, k6 summaries, and the final report.

Run `npm run pipeline:validate` to parse workflow YAML and check required files, triggers, explicit permissions, jobs, and mutable action references. This validates structure and assumptions; only GitHub-hosted execution can validate runner/service behaviour.

## Recommended main protection

- Require a pull request and at least one approving review.
- Require the `Automated quality gate` status check.
- Require the branch to be current before merge.
- Prevent direct pushes and force pushes.
- Apply CODEOWNERS to policy, workflow, and security configuration.

Repository settings are documented, not changed automatically.

## Jenkins mapping

Use parallel stages for the same evidence producers, `junit`/artifact archiving for transport, and a final stage that runs aggregation and gate scripts. Store secrets in Jenkins Credentials and use controlled agents for k6 baselines. `examples/Jenkinsfile` shows the mapping without maintaining a second full implementation.

## Azure DevOps mapping

Map PR jobs to parallel stages, publish JUnit/coverage/Playwright artifacts, use secure variable groups/Key Vault, and make the final gate a required branch policy. Use Environments/Approvals for production. `examples/azure-pipelines.yml` provides a concise executable skeleton.
