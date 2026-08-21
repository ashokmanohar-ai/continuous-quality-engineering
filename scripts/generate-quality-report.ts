import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { GateEvaluation, NormalizedQualityResults } from '../quality/model.js';
import { readPolicy } from '../quality/engine/policy.js';
import { evaluateQuality } from '../quality/engine/quality-gate.js';

const resultsPath = process.argv[2] ?? 'reports/quality/normalized-results.json';
const results = JSON.parse(readFileSync(resultsPath, 'utf8')) as NormalizedQualityResults;
const evaluation: GateEvaluation = evaluateQuality(
  results,
  readPolicy(process.env.QUALITY_POLICY ?? 'quality/config/quality-gates.json'),
);
const escape = (value: unknown): string =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const testRows = [
  ['Unit', results.unit],
  ['API', results.api],
  ['Integration', results.integration],
  ['Contract', results.contract],
  ['E2E', results.e2e],
]
  .map(([name, metric]) => {
    const value = metric as NormalizedQualityResults['api'];
    return `<tr><th>${name}</th><td>${value.passed}/${value.total}</td><td>${value.passRate.toFixed(1)}%</td></tr>`;
  })
  .join('');
const gateRows = evaluation.checks
  .map(
    (item) =>
      `<tr><th>${escape(item.dimension)}</th><td>${escape(item.metric)}</td><td>${escape(item.actual)}</td><td class="${item.status.toLowerCase()}">${item.status}</td></tr>`,
  )
  .join('');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Continuous Quality Report</title><style>
body{font-family:Inter,system-ui,sans-serif;background:#f4f7fb;color:#102a43;margin:0}main{max-width:1100px;margin:auto;padding:2rem}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}.card{background:white;border:1px solid #d9e2ec;border-radius:12px;padding:1rem;box-shadow:0 5px 20px #102a4312}.score{font-size:3rem;font-weight:800}.pass{color:#18794e}.warn{color:#946200}.fail{color:#b42318}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:.65rem;border-bottom:1px solid #e5e7eb}code{background:#eaf2f8;padding:.2rem}.decision{border-left:8px solid currentColor}</style></head><body><main>
<h1>Continuous Quality Report</h1><p>Commit <code>${escape(results.build.commit)}</code> · Branch <code>${escape(results.build.branch)}</code> · ${escape(results.build.environment)}</p>
<div class="grid"><section class="card decision ${evaluation.decision === 'FAIL' ? 'fail' : evaluation.decision === 'PASS' ? 'pass' : 'warn'}"><h2>Release decision</h2><p class="score">${evaluation.decision}</p></section><section class="card"><h2>Quality score</h2><p class="score">${evaluation.score.overall}/100</p></section><section class="card"><h2>Security</h2><p>Critical ${results.security.critical} · High ${results.security.high} · Secrets ${results.security.secrets}</p></section><section class="card"><h2>Performance</h2><p>p95 ${results.performance.p95Ms.toFixed(0)} ms · Error ${results.performance.errorRatePercent.toFixed(2)}%</p></section></div>
<section class="card"><h2>Functional evidence</h2><table><thead><tr><th>Layer</th><th>Passed</th><th>Pass rate</th></tr></thead><tbody>${testRows}</tbody></table></section>
<section class="card"><h2>Quality gates</h2><table><thead><tr><th>Dimension</th><th>Metric</th><th>Actual</th><th>Status</th></tr></thead><tbody>${gateRows}</tbody></table></section>
<section class="card"><h2>Evidence completeness</h2><p>${results.missingReports.length ? escape(results.missingReports.join(', ')) : 'All mandatory reports are present.'}</p></section>
</main></body></html>`;
mkdirSync('reports/quality', { recursive: true });
writeFileSync('reports/quality/quality-report.html', html);
writeFileSync('reports/quality/quality-report.json', JSON.stringify({ results, evaluation }, null, 2));
console.log(`Quality report generated with decision ${evaluation.decision}.`);
