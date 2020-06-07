import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import * as Sentry from '@sentry/node';
import * as express from 'express';
import { existsSync } from 'fs';
import { errorHandler } from 'logic/handle-error';
import { join } from 'path';
import 'zone.js/dist/zone-node';
import { App } from './logic/app';
import { Controller } from './logic/controller';
import { AppServerModule } from './src/main.server';


require('dotenv').config();
Sentry.init({ dsn: process.env.SENTRY_DSN });


// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/twitter/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';
  App.main();
  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  server.use(Sentry.Handlers.requestHandler() as express.RequestHandler);
  server.get('/api/data', Controller.handle);
  server.get('/api/data/generate', Controller.generate);
  server.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);
  server.use(errorHandler);

  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run() {
  const port = process.env.PORT || 4000;
  App.handler();

  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';

