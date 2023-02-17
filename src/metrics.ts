import { Counter, Gauge, Histogram, Summary } from 'prom-client';

export const ongoingRequests = new Gauge({
  name: 'http_requests_in_progress',
  help: 'the count of HTTP requests that are currently in process',
  labelNames: ['path', 'method'],
});

export const requestCount = new Counter({
  name: 'http_requests_total',
  help: 'the total number of HTTP requests',
  labelNames: ['path', 'method', 'statuscode'],
});

export const responseDuration = new Summary({
  name: 'http_response_latency_ms',
  help: 'the duration of responses in milliseconds',
  labelNames: ['path', 'method'],
});

export const errorCount = new Counter({
  name: 'http_errors_total',
  help: 'the overall number of HTTP errors',
  labelNames: ['path', 'method', 'statuscode'],
});

export const clientErrorCount = new Counter({
  name: 'http_errors_client_total',
  help: 'the total number of client-side errors',
  labelNames: ['path', 'method', 'statuscode'],
});
