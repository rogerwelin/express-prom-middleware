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

  // todo fix
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(req, res);
  };


  app.get('/', (async (req: Request, res: Response) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  }));

}
