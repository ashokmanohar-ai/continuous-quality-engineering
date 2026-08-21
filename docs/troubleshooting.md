# Troubleshooting

## Application health failure

Run `npm run app:start` and `npm run wait:health`. Check port 3000, `APP_DB` directory permissions, and logs. This is classified as `INFRASTRUCTURE`, not a passing or failing assertion.

## Playwright browser missing

Run `npx playwright install --with-deps chromium`. In corporate environments, use the approved browser/artifact mirror.

## SQLite runtime

The demo uses Node.js 22's built-in `node:sqlite`, so no native npm add-on is compiled. Use the documented Node version because older runtimes do not expose this module.

## Gate reports missing

Inspect `reports/quality/normalized-results.json`. Missing mandatory evidence is expected to fail. Confirm the producing command and artifact download paths; do not create a hand-written zero-findings report.

## k6, Gitleaks, Trivy, or ZAP unavailable

Use the documented container/CI workflows or install approved pinned binaries. The local functional command remains usable, but a full release gate cannot pass without real non-functional/security evidence.

## Pact native runtime

Use a supported Node.js platform and clear/reinstall dependencies with `npm ci`. Contract output belongs under `contracts/pacts` and is regenerated, not manually edited.
