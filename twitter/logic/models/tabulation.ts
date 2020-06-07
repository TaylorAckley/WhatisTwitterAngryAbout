export class AnalysisResults {
  scores: Tabulation;
  counts: Tabulation;
}

export class Tabulation {
  positive = 0;
  mixed = 0;
  negative = 0;
}
