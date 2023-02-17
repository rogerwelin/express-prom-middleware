import express, { Express, Request, Response, NextFunction } from 'express';
import { collectDefaultMetrics, register } from 'prom-client';
import { inProgress, totalRequests, responseLatency } from './metrics';

export interface PromOptions {
  metricsPath?: string;
  collectDefaultMetrics?: boolean;
  normalizePaths?: boolean;
}

export const promMiddleware = (options: PromOptions) => {
  const app: Express = express();

  if (options.collectDefaultMetrics) {
    collectDefaultMetrics();
  }

  const promRedMiddleware = (req: Request, res: Response, next: NextFunction) => {
    let start: bigint;

    if (req.path !== options.metricsPath) {
      start = process.hrtime.bigint();
      inProgress.inc({ path: req.path, method: req.method });
    }

    res.on('finish', () => {
      if (req.originalUrl !== options.metricsPath) {
        inProgress.dec({ path: req.originalUrl, method: req.method });
        totalRequests.inc({ method: req.method, path: req.originalUrl, statuscode: res.statusCode });
        const end = process.hrtime.bigint();
        // Calculate the difference between the start time and end time in milliseconds
        const diffInMs = Number(end - start) / 1000000;
        responseLatency.observe({ path: req.originalUrl, method: req.method }, diffInMs);
      }
    });

    next();
  };

  app.use(promRedMiddleware);

  app.get((options.metricsPath = '/metrics'), async (req: Request, res: Response) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  return app;
};
