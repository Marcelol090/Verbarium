export interface SentencePhrase {
  id: string;
  speaker: string;
  subject: string;
  verb: string;
  object: string;
  pt: string;
  image: string;
  rule: string;
}

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface SentenceLabState {
  step: number;
  attempts: number;
  correct: number;
  firstTryCorrect: number;
  completed: boolean;
  history: Array<{
    step: number;
    phraseId: string;
    ok: boolean;
    at: string;
    firstForStep: boolean;
  }>;
  reviews: Record<
    string,
    { level: number; due: string; lastResult: boolean; at: string }
  >;
  xp: number;
  updatedAt: string | null;
}

export declare const STORAGE_KEY: string;
export declare const REVIEW_DAYS: number[];
export declare const PHRASES: SentencePhrase[];
export declare const TARGET_STEPS: string[];
export declare const MATCH_PAIRS: MatchPair[];
export declare function sentence(p: SentencePhrase): string;
export declare function normalize(str?: string): string;
export declare function gradeSentence(
  input: string | string[],
  expected: string | string[]
): { ok: boolean; reason: string };
export declare function gradePair(leftId: string, rightId: string): boolean;
export declare function blankState(): SentenceLabState;
export declare function hydrateState(raw: unknown): SentenceLabState;
export declare function recordAttempt(
  state: SentenceLabState,
  step: number,
  phraseId: string,
  ok: boolean,
  now?: Date
): SentenceLabState;
export declare function mastery(state: SentenceLabState): {
  accuracy: number;
  practices: number;
  completed: boolean;
  independent: boolean;
  due: string[];
};
