import axios from 'axios';
import * as fs from 'fs';
import { Trend, TrendsResponse } from './models/trends';

export class Twitter {
  private static token: any;
  private static tweets = 15;
  private static trends = 5;

  static async getData() {
    try {
      this.token = await Twitter.getToken();
      const trendData = await Twitter.getTrendsData();
      for (let trend of trendData.trends) {
        trend = await this.addTweetsToTrend(trend);
      }
      if (this.trends && this.trends < trendData.trends.length) {
        trendData.trends = trendData.trends.slice(0, this.trends);
      }

      fs.writeFileSync('./data/twitter-data.json', JSON.stringify(trendData, null, 2));
      return trendData;
    } catch(ex) {
      throw ex;
    }
  }

  static async addTweetsToTrend(trend: Trend) {
    const RUNS = 2;
    try {
      trend.tweets = [];
      const statuses = await Twitter.getTweetData(trend.query);
      trend.tweets.push(...statuses);
      return trend;
    } catch (ex) {
      throw ex;
    }
  }

  static async getTrendsData() {
    try {
      const response = await axios.get('https://api.twitter.com/1.1/trends/place.json?id=23424977', {
        headers: {
          Authorization: `Bearer ${this.token.access_token}`
        }
      });
      return response.data[0] as TrendsResponse;
    } catch (ex) {
      throw ex;
    }
  }

  static async getTweetData(query: string) {
    const endpoint = `https://api.twitter.com/1.1/search/tweets.json?q=${query}+-filter%3Aretweets&result_type=mixed&count=${this.tweets}&lang=en&include_entities=false`;
    try {
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${this.token.access_token}`
        }
      });
      return response.data.statuses.map(status => Twitter.cleanTweet(status.text));
    } catch (ex) {
      throw ex;
    }
  }

  static cleanTweet(tweet) {
    const rx = /https:\/\/t.co\/[A-Za-z0-9]{10}/;
    const rx2 = /\/n/;
    tweet = tweet.replace(rx, '');
    tweet = tweet.replace(rx2, ' ');
    return tweet;
  }

  static async getToken() {
    const response = await axios.post('https://api.twitter.com/oauth2/token',
      'grant_type=client_credentials',
      {
      headers: {
        'Authorization': `Basic ${Twitter.getCreds()}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      }
      });
    return response.data;
  }


  static getCreds() {
    const raw = `${process.env.TWITTER_KEY}:${process.env.TWITTER_SECRET}`;
    return Buffer.from(raw).toString('base64');
  }

}
