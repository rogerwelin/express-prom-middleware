import { Counter, Gauge, Histogram, Summary } from 'prom-client';

export const inProgress = new Gauge({
  name: 'http_requests_in_progress',
  help: 'number of http requests in progress',
  labelNames: ['path', 'method'],
});
