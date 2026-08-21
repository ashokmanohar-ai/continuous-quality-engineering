# Quality observability

Machine-readable reports carry commit, branch, environment, timestamp, layer totals, coverage, findings, latency/error, flakiness, score, and decision. These can feed Prometheus/Grafana, Datadog, or an OpenTelemetry pipeline.

Useful trends include pipeline duration, feedback latency, pass/fail by classification, flaky rate, coverage stability, security aging, p95/error movement, evidence completeness, and exception count. `quality-history/` contains clearly labelled synthetic demonstration history only; it must not be presented as production performance.

Recommended production dimensions are service, team, repository, branch, environment, risk level, test layer, runner type, and release. Avoid high-cardinality test payloads and redact sensitive evidence before export.
