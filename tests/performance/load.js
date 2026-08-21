import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '3m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<1000'] },
};

export default function () {
  const response = http.get(`${__ENV.BASE_URL || 'http://127.0.0.1:3000'}/health`);
  check(response, { healthy: (result) => result.status === 200 });
  sleep(1);
}

export function handleSummary(data) {
  return { 'reports/raw/performance-summary.json': JSON.stringify(data, null, 2) };
}
