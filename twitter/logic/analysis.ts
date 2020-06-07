import { AWSAnalyzer } from './aws';
import { AzureAnalyzer } from './azure';
import { TrendsResponse } from './models/trends';

export class Analyzer {
  private static azureEnabled = true;
  private static awsEnabled = true;

  static async run(trendData: TrendsResponse) {
    let i = 0;
    const finalData = [];
    for (const trend of trendData.trends) {
      console.log('running trend: ', i);
      try {
        if (this.azureEnabled) {
          const azureData = await AzureAnalyzer.analyze(trend);
          trend.azure_data = azureData;
        }
        if (this.awsEnabled) {
          const awsData = await AWSAnalyzer.analyze(trend);
          trend.aws_data = awsData;
        }
        finalData.push(trend);
        await new Promise(done => setTimeout(() => done(), 3000));
        i += 1;
      } catch (ex) {
        throw ex;
      }
    }
    return Promise.resolve(finalData);
  }

}
