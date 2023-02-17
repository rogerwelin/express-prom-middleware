import { Counter, Gauge, Histogram, Summary } from 'prom-client';

export const inProgress = new Gauge({
  name: 'http_requests_in_progress',
  help: 'the count of HTTP requests that are currently in process',
  labelNames: ['path', 'method'],
});

export const totalRequests = new Counter({
  name: 'http_requests_total',
  help: 'the total number of HTTP requests',
  labelNames: ['path', 'method', 'statuscode'],
});

export const responseLatency = new Summary({
  name: 'http_response_latency_ms',
  help: 'the duration of responses in milliseconds',
  labelNames: ['path', 'method'],
});
