import express, { Express, NextFunction, Request, Response } from 'express';
import { collectDefaultMetrics, register } from 'prom-client';
import UrlValueParser from 'url-value-parser';
import {
  clientErrorCount,
  errorCount,
  ongoingRequests,
  requestCount,
  responseDuration,
  responseDurationHistogram,
} from './metrics';

export interface PromOptions {
  metricsPath?: string;
  collectDefaultMetrics?: boolean;
  normalizePaths?: boolean;
}

let normalizer: UrlValueParser;

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

    if (opts.normalizePaths && !normalizer) {
      normalizer = new UrlValueParser();
    }

    // increment ongoing requests count
    if (req.path !== opts.metricsPath) {
      start = process.hrtime.bigint();
      let path = req.path;
      if (opts.normalizePaths) {
        path = normalizer.replacePathValues(path, '#id');
      }
      ongoingRequests.inc({ path: path, method: req.method });
    }

    // record metrics when response is finished
    res.on('finish', () => {
      if (req.originalUrl !== opts.metricsPath) {
        let path = req.originalUrl;

        if (opts.normalizePaths) {
          path = normalizer.replacePathValues(path, '#id');
        }

        // decrement ongoing requests count
        ongoingRequests.dec({ path: path, method: req.method });

        // record request count and response duration
        requestCount.inc({ method: req.method, path: path, statuscode: res.statusCode });
        const end = process.hrtime.bigint();
        // Calculate the difference between the start time and end time in milliseconds
        const diffInMs = Number(end - start) / 1000000;
        responseDuration.observe({ path: path, method: req.method }, diffInMs);
        responseDurationHistogram.observe({ path: path, method: req.method }, diffInMs);

        // record error count and client error count
        if (res.statusCode >= 500 && res.statusCode <= 511) {
          errorCount.inc({ method: req.method, path: path, statuscode: res.statusCode });
        }
        if (res.statusCode >= 400 && res.statusCode <= 451) {
          clientErrorCount.inc({ method: req.method, path: path, statuscode: res.statusCode });
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
