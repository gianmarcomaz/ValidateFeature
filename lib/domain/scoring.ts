// Placeholder for scoring logic (will be used when signals are implemented)
import { VerdictResponse, Signals } from "./types";

export function calculateScores(verdict: VerdictResponse, signals: Signals): {
  interest: number;
  pain: number;
  competitionGap: number;
  icpFit: number;
} {
  // TODO: Implement scoring based on signals
  // For MVP, return placeholder scores
  return {
    interest: 0,
    pain: 0,
    competitionGap: 0,
    icpFit: 0,
  };
}

