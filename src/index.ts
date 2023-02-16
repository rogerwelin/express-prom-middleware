import express, { Express, Request, Response, NextFunction } from 'express';
import { collectDefaultMetrics, register } from 'prom-client';

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
    console.log(req);
    next();
  };

  app.use(promRedMiddleware);

  app.get((options.metricsPath = '/metrics'), async (req: Request, res: Response) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  return app;
};
