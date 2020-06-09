import { AzureKeyCredential, TextAnalyticsClient } from '@azure/ai-text-analytics';
import { Trend } from './models/trends';
import { Utils } from './utils';

export class AzureAnalyzer {

  static async analyze(trend: Trend) {
    return new Promise(async (resolve, reject) => {
      try {
        const batches = Utils.chunkArray(trend.tweets, 10);
        const client = new TextAnalyticsClient(
          process.env.AZURE_ENDPOINT,
          new AzureKeyCredential(process.env.NS_AZURE_KEY_1)
        );
        let results = [];
        for (const batch of batches) {
          const resultSet = await AzureAnalyzer.runBatch(batch, client);
          results = AzureAnalyzer.transformBatch(results, resultSet)
        }
        resolve(results);
      } catch (ex) {
        throw ex;
      }
    });
  }

  static runBatch(batch: Array<string>, client: TextAnalyticsClient ) {
    return new Promise(async (resolve, reject) => {
      try {
        const results = await client.analyzeSentiment(batch, 'en');
        resolve(results);
      } catch (ex) {
        throw ex;
       }
    });
  }

  static transformBatch(results, resultSet) {
      for (const innerResult of resultSet) {
        results.push({
          scores: innerResult.confidenceScores,
          sentiment: innerResult.sentiment
        });
       }
    return results;
  }
}
