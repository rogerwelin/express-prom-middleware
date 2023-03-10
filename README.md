## Express Prometheus Middleware

This is an Express.js middleware module that allows you to easily add Prometheus metrics to your Express.js application. 
Prometheus is a powerful monitoring and alerting system that allows you to track various metrics related to your application's performance.

✅ plug-in play RED (Requests Errors Durations) metrics  
✅ typescript  
✅ few dependencies  

### Installation

```bash
npm install express-red-middleware
```

### Usage

```typescript
import express from 'express';
import { promMiddleware } from 'express-red-middleware':

const app = express();
const PORT = process.env.PORT || 3000;

// Add the express-prom-middleware middleware
app.use(promMiddleware());

app.get('/hello', (req, res) => {
  res.json({ message: `Hello World!` });
});

const server = app.listen(PORT, () => {
  console.info(`Server is up and running @ http://localhost:${PORT}`);
});
```

Once you've added the Prometheus middleware to your application, you can access the metrics endpoint at /metrics.


### Configuration  
This middleware module can be configured using an options object passed to the promMiddleware() function. The following options are available:

* **metricsPath**: The path at which the metrics endpoint should be served (default: '/metrics').
* **collectDefaultMetrics**: Whether or not to collect default metrics (default: true). Setting this to false will disable the collection of default metrics such as CPU usage and memory usage.
* **normalizePath**: Whether or not to normalize the path before adding it to the Prometheus histogram (default: true). Setting this to false will result in each unique path being added to the metrics separately, regardless of case or trailing slashes.

Here's an example of how to configure the middleware module:

```js
app.use(promMiddleware({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  normalizePath: true,
}));
```

### Metrics  
This middleware module exposes the following metrics:

- Default metrics from [prom-client](https://github.com/siimon/prom-client)
- `http_requests_in_progress` - a Gauge that shows HTTP requests that are currently in process
- `http_requests_total` - a Counter which counts the total number of HTTP requests
- `http_response_latency_ms`: - a Summary that shows the duration of responses in milliseconds
- `http_response_latency_histogram`: - a Histogram that shows the duration of responses in milliseconds in buckets
- `http_errors_total`: - a Counter that tracks the total number of server-side errors
- `http_errors_client_total`: - a Counter that tracks the total number of client-side errors






