import * as Sentry from '@sentry/node';
import * as CronJob from 'cron';
import * as fs from 'fs';
import { Analyzer } from './analysis';
import { Twitter } from './twitter';

Sentry.init({ dsn: process.env.SENTRY_DSN });

export class App {

  static async main() {
    try {
      const job = new CronJob.CronJob('*/30 * * * *', function() {
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

  static async handler() {
    try {
      const twitterData = await Twitter.getData();
      const data = await Analyzer.run(twitterData);
      fs.writeFileSync('./data/final-data.json', JSON.stringify(data, null, 2));
    } catch (ex) {
      Sentry.captureException(ex);
    }
  }

}
