# Contributing

1. Create a focused feature branch; do not push directly to `main`.
2. State risk, security, performance, accessibility, and rollback impact in the PR template.
3. Run `npm ci`, install Playwright Chromium, and execute `npm run quality`.
4. Add or update deterministic evidence for behaviour changes.
5. Treat workflow, gate policy, scanner suppression, and dependency changes as high-risk review areas.

Do not commit secrets, generated reports, databases, or hand-authored passing scanner evidence. Flaky tests require an owner and investigation; retries alone are not a fix. Suppressions and exceptions require rationale and expiry.

Commits should be small, explain why, and leave the main branch releasable. By contributing, you agree that your contribution is licensed under MIT.
