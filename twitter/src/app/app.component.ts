import { Component, OnInit } from '@angular/core';
import { Trend } from 'logic/models/trends';
import { texts } from 'src/assets/texts';
import { constants } from '../assets/constants';
import { DataService } from './shared/data.service';
import { Sentiment } from './shared/sentiment.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'twitter';
  trendData: Array<Trend>;
  constants = constants;
  texts = texts;
  loading = true;
  sentiments: Array<string>;
  mode = Sentiment.negative;
  constructor(private data: DataService) { }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.data.getData().subscribe(data => {
      this.trendData = data;
      this.getSentiments();
      this.loading = false;
    });
  }

  getSentiments() {
    this.sentiments = Object.keys(this.trendData[0].processed_data.scores);
  }

  getPositiveData() {
    return this.trendData.filter(trend => trend.processed_data.scores.positive >= 10);
   }

  getNegativeData() {
    return this.trendData.filter(trend => trend.processed_data.scores.negative >= 10);
  }

  getSentimentScore(sentiment: string, trend: Trend) {
    return trend.processed_data.scores[sentiment];
   }
  getSentimentCount(sentiment: string, trend: Trend) {
    return trend.processed_data.counts[sentiment];
  }

  setMode(mode: Sentiment) {
    this.mode = mode;
  }

  getSentimentClass(sentiment: string) {
    switch (sentiment) {
      case 'positive':
        return 'label label-success';
      case 'mixed':
        return 'label label-warning';
      case 'negative':
        return 'label label-danger';
    }
  }

  getHeaderSentimentText() {
    return this.mode === Sentiment.negative ? texts.header_title_negative : texts.header_title_positive;
  }

  getSubtitleSentimentText() {
    return this.mode === Sentiment.negative ? texts.header_subtitle_negative.replace(constants.replacement_sample_size, constants.twitter_tweets) : texts.header_subtitle_positive.replace(constants.replacement_sample_size, constants.twitter_tweets);
  }

}
