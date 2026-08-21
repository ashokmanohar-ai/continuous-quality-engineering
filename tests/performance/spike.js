import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '20s', target: 50 },
    { duration: '20s', target: 5 },
  ],
  thresholds: { http_req_failed: ['rate<0.02'], http_req_duration: ['p(95)<1200'] },
};

export default function () {
  const response = http.get(`${__ENV.BASE_URL || 'http://127.0.0.1:3000'}/health`);
  check(response, { healthy: (result) => result.status === 200 });
}

export function handleSummary(data) {
  return { 'reports/raw/performance-summary.json': JSON.stringify(data, null, 2) };
}
