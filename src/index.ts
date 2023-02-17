import express, { Express, Request, Response, NextFunction } from 'express';
import { collectDefaultMetrics, register } from 'prom-client';
import { 
  ongoingRequests, 
  requestCount, 
  responseDuration, 
  errorCount, 
  clientErrorCount,
  responseDurationHistogram } from './metrics';

export interface PromOptions {
  metricsPath?: string;
  collectDefaultMetrics?: boolean;
  normalizePaths?: boolean;
}

export const promMiddleware = (options: PromOptions) => {
  // default options
  const opts = {
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    normalizePaths: true,
    ...options,
  };

  const app: Express = express();

  // initialize default metrics
  if (opts.collectDefaultMetrics) {
    collectDefaultMetrics();
  }

  const promRedMiddleware = (req: Request, res: Response, next: NextFunction) => {
    let start: bigint;

    // increment ongoing requests count
    if (req.path !== opts.metricsPath) {
      start = process.hrtime.bigint();
      ongoingRequests.inc({ path: req.path, method: req.method });
    }

    // record metrics when response is finished
    res.on('finish', () => {
      if (req.originalUrl !== options.metricsPath) {
        // decrement ongoing requests count
        ongoingRequests.dec({ path: req.originalUrl, method: req.method });

        // record request count and response duration
        requestCount.inc({ method: req.method, path: req.originalUrl, statuscode: res.statusCode });
        const end = process.hrtime.bigint();
        // Calculate the difference between the start time and end time in milliseconds
        const diffInMs = Number(end - start) / 1000000;
        responseDuration.observe({ path: req.originalUrl, method: req.method }, diffInMs);
        responseDurationHistogram.observe({ path: req.originalUrl, method: req.method }, diffInMs);

        // record error count and client error count
        if (res.statusCode >= 500 && res.statusCode <= 511) {
          errorCount.inc({ method: req.method, path: req.originalUrl, statuscode: res.statusCode });
        }
        if (res.statusCode >= 400 && res.statusCode <= 451) {
          clientErrorCount.inc({ method: req.method, path: req.originalUrl, statuscode: res.statusCode });
        }
      }
    });

    next();
  };

  // use middleware function
  app.use(promRedMiddleware);

  // expose metrics endpoint
  app.get(opts.metricsPath, async (req: Request, res: Response) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  return app;
};
