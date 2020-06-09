import * as Sentry from '@sentry/node';
import * as CronJob from 'cron';
import { Analyzer } from './analysis';
import { Twitter } from './twitter';

Sentry.init({ dsn: process.env.SENTRY_DSN });

export class App {

  static async main() {
    if (App.getIsProcessingEnabled()) {
      try {
        const job = new CronJob.CronJob('*/60 6-20 * * *', function() {
          console.log('Starting cron');
          App.handler();
        }, null, true, 'America/Los_Angeles');
        job.start();
        console.log('System TZ next 5: ');
        for (const j of job.nextDates(5)) {
          console.log(j.format("dddd, MMMM Do YYYY, h:mm:ss a z"));
        }
      } catch (ex) {
        console.log(ex);
        Sentry.captureException(ex);
      }
    }
  }

  static async handler() {
    try {
      const twitterData = await Twitter.getData();
      const data = await Analyzer.run(twitterData);
    } catch (ex) {
      Sentry.captureException(ex);
    }
  }

  static getIsProcessingEnabled() {
    return (process.env.ENABLE_PROCESSING == "1");
  }

}
