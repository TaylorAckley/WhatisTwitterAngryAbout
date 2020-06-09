// tslint:disable: max-line-length

import * as fs from 'fs';
import { AWSAnalyzer } from './aws';
import { AzureAnalyzer } from './azure';
import { AnalysisResults } from './models/tabulation';
import { Trend, TrendsResponse } from './models/trends';

export class Analyzer {
  private static azureEnabled = false;
  private static awsEnabled = true;

  static async run(trendData: TrendsResponse) {
    let i = 0;
    const rawData: Array<Trend> = [];
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
        rawData.push(trend);
        await new Promise(done => setTimeout(() => done(), 3000));
        i += 1;
      } catch (ex) {
        throw ex;
      }
    }
    try {
      console.log('data collection done');
      const processedData = Analyzer.tabulate(rawData);
      const sortedData = Analyzer.sort(processedData);

      fs.writeFileSync('./data/processed-data.json', JSON.stringify(sortedData));
      fs.writeFileSync('./data/processed-data.debug.json', JSON.stringify(sortedData, null, 2));
     } catch (ex) {
      throw ex;
    }
    console.log('processing done');
    return Promise.resolve(rawData);
  }

  static sort(proccessedData: Array<Trend>) {
    try {
      return proccessedData.sort((x, y) => {
        return (x.processed_data.scores.negative < y.processed_data.scores.negative) ? 1 : -1;
      });
    } catch (ex) {
      throw ex;
    }
  }
  static tabulate(rawData: Array<Trend>) {
    const results = [...rawData];
    try {
      for (let trend of results) {
        console.log(`Tabulating trend `);
        const ar = new AnalysisResults();

        if (trend.azure_data) {
          ar.counts.positive += trend.azure_data.filter(item => item.sentiment === 'positive').length;
          ar.counts.negative += trend.azure_data.filter(item => item.sentiment === 'negative').length;
          ar.counts.mixed += trend.azure_data.filter(item => item.sentiment === 'neutral' || item.sentiment === 'mixed').length;
          ar.scores.mixed = trend.azure_data.reduce((accumulator, currentValue) => accumulator + currentValue.scores.neutral, ar.scores.mixed);
          ar.scores.positive = trend.azure_data.reduce((accumulator, currentValue) => accumulator + currentValue.scores.positive, ar.scores.positive);
          ar.scores.negative = trend.azure_data.reduce((accumulator, currentValue) => accumulator + currentValue.scores.negative, ar.scores.negative);
        }

        if (trend.aws_data) {
          ar.counts.positive += trend.aws_data.filter(item => item.sentiment === 'positive').length;
          ar.counts.negative += trend.aws_data.filter(item => item.sentiment === 'negative').length;
          ar.counts.mixed += trend.aws_data.filter(item => item.sentiment === 'neutral' || item.sentiment === 'mixed').length;
          ar.scores.positive = trend.aws_data.reduce((accumulator, currentValue) => accumulator + currentValue.scores.positive, ar.scores.positive);
          ar.scores.negative = trend.aws_data.reduce((accumulator, currentValue) =>  accumulator + currentValue.scores.negative, ar.scores.negative);
          ar.scores.mixed = trend.aws_data.reduce((accumulator, currentValue) => accumulator + currentValue.scores.mixed, ar.scores.mixed);
          ar.scores.mixed = trend.aws_data.reduce((accumulator, currentValue) => accumulator + currentValue.scores.neutral, ar.scores.mixed);
        }


        trend.processed_data = ar;
       }
    } catch (ex)
    {
      throw ex;
    }

    return results;
  }

}
