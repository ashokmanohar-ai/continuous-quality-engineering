import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.4/index.js';

export const options = {
  vus: 2,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

const baseUrl = __ENV.BASE_URL || 'http://127.0.0.1:3000';

export default function () {
  const response = http.get(`${baseUrl}/health`);
  check(response, { 'health returns 200': (result) => result.status === 200 });
  sleep(0.2);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'reports/raw/performance-summary.json': JSON.stringify(data, null, 2),
  };
}
