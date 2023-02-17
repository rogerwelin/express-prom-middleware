import express, { Express, Request, Response, NextFunction } from 'express';
import { collectDefaultMetrics, register } from 'prom-client';
import { ongoingRequests, requestCount, responseDuration, errorCount, clientErrorCount } from './metrics';

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

  if (opts.collectDefaultMetrics) {
    collectDefaultMetrics();
  }

  const promRedMiddleware = (req: Request, res: Response, next: NextFunction) => {
    let start: bigint;

    if (req.path !== options.metricsPath) {
      start = process.hrtime.bigint();
      ongoingRequests.inc({ path: req.path, method: req.method });
    }

    res.on('finish', () => {
      if (req.originalUrl !== options.metricsPath) {
        ongoingRequests.dec({ path: req.originalUrl, method: req.method });
        requestCount.inc({ method: req.method, path: req.originalUrl, statuscode: res.statusCode });
        const end = process.hrtime.bigint();
        // Calculate the difference between the start time and end time in milliseconds
        const diffInMs = Number(end - start) / 1000000;
        responseDuration.observe({ path: req.originalUrl, method: req.method }, diffInMs);
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

  app.use(promRedMiddleware);

  app.get((opts.metricsPath = '/metrics'), async (req: Request, res: Response) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  return app;
};
