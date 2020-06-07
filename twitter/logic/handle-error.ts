import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN });

export function errorHandler(err: Error, req, res, next) {
  if (err) {
    console.log('Error :(');
    debugger;
    console.log(err.message);
    if (!res.headersSent) {
      return res.status(500).send(`message: ${err.message} : ID: ${res.sentry}`)
    }
  }
  next();
}
