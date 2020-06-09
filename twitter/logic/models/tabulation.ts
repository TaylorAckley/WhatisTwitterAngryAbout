export class AnalysisResults {
  scores: Tabulation = new Tabulation();
  counts: Tabulation = new Tabulation();
}

export class Tabulation {
  positive = 0;
  mixed = 0;
  negative = 0;
}
