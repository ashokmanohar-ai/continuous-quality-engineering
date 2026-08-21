# Interview walkthrough

## Two-minute explanation

This repository demonstrates Continuous Quality Engineering by combining functional and non-functional evidence into automated, configurable release gates. A small Fastify order service supplies meaningful behaviour. PR jobs independently run static/unit, API/integration/contract, critical UI, accessibility/performance, and security checks for fast feedback. Tool-native results are normalized into one model, and missing evidence fails closed. A deterministic gate applies versioned thresholds, calculates a transparent score, and produces `PASS`, `CONDITIONAL_PASS`, or `FAIL` plus an HTML/JSON audit report. Nightly and release workflows deepen cross-browser, DAST, container, and load evidence. Automated pass then feeds protected environment approval; it does not auto-deploy production.

## Five-minute route

1. `demo-app`: real authentication, validation, order pricing, authorization, and SQLite persistence.
2. `tests`: pyramid from domain tests to focused E2E, plus Pact, Axe, and k6.
3. `.github/workflows/pr-quality.yml`: parallel feedback and artifact retention.
4. `scripts/aggregate-results.ts`: tool output becomes one explicit evidence model.
5. `quality/config`: policy and risk live outside engine code.
6. `quality/engine`: hard checks, warnings, score, and fail-closed release decision.
7. `reports`: recruiter-readable dashboard plus machine-readable evidence.
8. `docs/release-governance.md`: manual approval, exceptions, rollback, and audit.

## Common interview questions

**What is Continuous Quality Engineering?** Continuous testing plus measurable code, functional, security, accessibility, performance, reliability, and governance signals across delivery.

**Continuous testing vs continuous quality?** Testing is an evidence source; continuous quality evaluates all relevant evidence and enforces release policy.

**Every PR vs nightly?** PR: deterministic fast checks and critical smoke. Nightly: cross-browser, deeper security, load, and broad regression. Release: production-readiness evidence.

**Why not rely on E2E?** E2E is slow, coarse, and unstable; unit/API/contract tests localize failures earlier while E2E protects a few business journeys.

**How are flaky tests handled?** A retry recovery is recorded as flaky; critical flakiness blocks. Quarantine is time-bound and never invisible success.

**How do you balance speed and coverage?** Parallel jobs, test pyramid, change risk/impact, smoke profiles on PRs, heavier schedules, and measured feedback value.

**What blocks deployment?** Mandatory missing evidence, critical functional failures, high/critical security, critical/serious accessibility, performance threshold breach, or critical flakiness.

**How are exceptions managed?** Named owner/approver, evidence, compensating control, expiry, audit trail, and follow-up—not YAML suppression without governance.

**How is performance continuous?** Very light PR smoke, controlled nightly/load profiles, and release baselines on stable infrastructure.

**How are security and accessibility included?** Layered automated checks with hard thresholds, plus explicit limits and manual specialist activities.

**How do you avoid false green?** Mandatory artifact completeness, scanner exit evidence, non-zero gate exits, retry visibility, and infrastructure/test classification.

**Scale to 100 microservices?** Federated service evidence contracts, central schema/policy, service maps, consumer compatibility, owned baselines, and portfolio dashboards.

**Azure DevOps?** Parallel stages publish the same result model; branch policies require the gate; Key Vault and Environments manage credentials/approval.

**Kubernetes?** Add image provenance, manifest/policy scans, ephemeral test environments, readiness/SLO/canary evidence, and progressive-delivery rollback gates.

**How do metrics influence decisions?** Hard thresholds block; trends expose degradation and investment priorities; scores communicate aggregate health but never override mandatory failures.
