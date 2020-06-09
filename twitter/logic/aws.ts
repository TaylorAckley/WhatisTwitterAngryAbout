import * as Comprehend from 'aws-sdk/clients/comprehend';
import { Trend } from './models/trends';
import { Utils } from './utils';

export class AWSAnalyzer {

  static async analyze(trend: Trend) {
    return new Promise(async (resolve, reject) => {
      try {
        const BATCH_SIZE = 25;
        const batches = Utils.chunkArray(trend.tweets, 25);
        const comprehend = new Comprehend();
        let results = [];
        for (const batch of batches) {
          const resultSet = await AWSAnalyzer.runBatch(batch, comprehend);
          results = AWSAnalyzer.transformBatch(results, resultSet);
        }
        resolve(results);
      } catch (ex) {
        throw ex;
      }
    });
  }

  static async runBatch(batch: Array < string > , comprehend: Comprehend) {
    return new Promise(async (resolve, reject) => {
      try {
        const params: Comprehend.BatchDetectSentimentRequest = {
          LanguageCode: 'en',
          TextList: batch
        };
        comprehend.batchDetectSentiment(params, (err, data) => {
          if (err) {
            return reject(err);
          }
          return resolve(data);
        });
      } catch (ex) {
        throw ex;
      }
    });
  }

  static transformBatch(results, resultSet) {
    for (const result of resultSet.ResultList) {
      results.push({
        scores: Object.keys(result.SentimentScore).reduce((c, k) => (c[k.toLowerCase().trim()] = result.SentimentScore[k], c), {}),
        sentiment: result.Sentiment.toLowerCase()
      });
    }
    return results;
  }

}
