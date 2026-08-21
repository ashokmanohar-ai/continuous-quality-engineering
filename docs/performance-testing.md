# Performance testing

- **Load:** expected concurrency for a sustained interval.
- **Stress:** increase load to find capacity limits and failure behaviour.
- **Spike:** rapid demand change and recovery.
- **Soak:** extended load to reveal leaks and degradation.

The PR workflow uses a 30-second, two-VU health smoke with `p95 < 1,000 ms` and error rate `< 1%`. Nightly/release profiles can run the five-minute load or spike scenario. Fast PR checks catch obvious regressions without making every change wait for a statistically meaningful capacity test.

GitHub-hosted runner noise limits trend accuracy. Release baselines should run on controlled, production-representative infrastructure with warm-up, stable data, realistic workload mix, percentile/error/SLO analysis, and comparison to a versioned baseline.
