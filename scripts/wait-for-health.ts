const url = process.env.HEALTH_URL ?? process.argv[2] ?? 'http://127.0.0.1:3000/health';
const timeoutMs = Number(process.env.HEALTH_TIMEOUT_MS ?? 60_000);
const started = Date.now();
let lastError = 'No response';
while (Date.now() - started < timeoutMs) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      console.log(`Application healthy at ${url}.`);
      process.exit(0);
    }
    lastError = `HTTP ${response.status}`;
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
}
console.error(`Application health check failed: ${lastError}`);
console.error('Classification: INFRASTRUCTURE');
process.exit(2);
