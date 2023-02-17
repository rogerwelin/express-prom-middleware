## Express Prometheus Middleware

This is an Express.js middleware module that allows you to easily add Prometheus metrics to your Express.js application. 
Prometheus is a powerful monitoring and alerting system that allows you to track various metrics related to your application's performance.

✅ plug-in play RED (Requests Errors Durations) metrics
✅ typescript
✅ few dependencies

### Installation

```bash
npm install express-prom-middleware
```

### Usage

```typescript
import express from 'express';
import { promMiddleware } from './prom'

const app = express();
const PORT = process.env.PORT || 3000;

// Add the express-prom-middleware middleware
app.use(promMiddleware());

app.get('/hello', (req, res) => {
  console.log('GET /hello');
  const { name = 'Anon' } = req.query;
  res.json({ message: `Hello, ${name}!` });
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
app.use(Prometheus({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  normalizePath: true,
}));
```

### Metrics  
This middleware module exposes the following metrics:



