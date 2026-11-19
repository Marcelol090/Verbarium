import type { CourseTask, CourseUnit } from './course-data.js';

export interface CompletedUnit {
  score: number;
  finishedAt: string;
  stars: 1 | 2 | 3;
}

export interface DailyActivity {
  xp: number;
  answers: number;
}

export interface ReviewEntry {
  stage: number;
  due: string;
  correct: number;
  errors: number;
  last: string;
}

export interface LessonSession {
  unitId: string;
  phase: 'core' | 'repair';
  index: number;
  ids: string[] | null;
  selected: string | null;
  chosenWords: string[];
  left: string | null;
  matched: string[];
  feedback: { ok: boolean; message: string } | null;
  reviewQueue: string[];
  reviewHits: number;
  firstCorrect: number;
  firstAttempts: number;
  score: number;
  earned: number;
  startedAt: number;
}

export interface AcademyProgress {
  version: number;
  completed: Record<string, CompletedUnit>;
  activity: Record<string, DailyActivity>;
  reviews: Record<string, ReviewEntry>;
  xp: number;
  attempts: number;
  correct: number;
  teacherUnits: CourseUnit[];
  dailyGoal: number;
  accent: 'en-US' | 'en-GB';
  session: LessonSession | null;
}

export interface DueReviewItem {
  key: string;
  unit: CourseUnit;
  task: CourseTask;
  due: string;
  errors: number;
}

export declare const STORAGE_KEY: string;
export declare const REVIEW_INTERVALS: readonly number[];
export declare const PASSING_SCORE: number;
export declare function isGraded(task: CourseTask): boolean;
export declare function normalize(s: unknown): string;
export declare function dayKey(date?: Date): string;
export declare function addDays(key: string, n: number): string;
export declare function defaultProgress(): AcademyProgress;
export declare function loadProgress(raw: unknown): AcademyProgress;
export declare function getUnits(state: AcademyProgress): CourseUnit[];
export declare function getUnit(state: AcademyProgress, id: string): CourseUnit | undefined;
export declare function isUnlocked(state: AcademyProgress, id: string): boolean;
export declare function dueReviews(
  state: AcademyProgress,
  today?: string,
  limit?: number
): DueReviewItem[];
export declare function reviewStats(
  state: AcademyProgress,
  today?: string
): { due: number; stored: number };
export declare function updateReview(
  state: AcademyProgress,
  unitId: string,
  taskId: string,
  ok: boolean,
  today?: string
): ReviewEntry;
export declare function recordAnswer(
  state: AcademyProgress,
  unit: CourseUnit,
  task: CourseTask,
  ok: boolean,
  today?: string
): AcademyProgress;
export declare function earnXp(state: AcademyProgress, amount: number, today?: string): number;
export declare function recordDailyAnswer(state: AcademyProgress, today?: string): void;
export declare function streak(state: AcademyProgress, today?: string): number;
export declare function todayXp(state: AcademyProgress, today?: string): number;
export declare function unitPercent(state: AcademyProgress, unit: CourseUnit): number;
export declare function summary(state: AcademyProgress): {
  completed: number;
  total: number;
  xp: number;
  accuracy: number | null;
};
export declare function checkAnswer(task: CourseTask, selected: unknown): boolean | null;
export declare function createSession(
  unitId: string,
  phase?: 'core' | 'repair',
  ids?: string[] | null
): LessonSession;
export declare function sessionTasks(
  state: AcademyProgress,
  session: LessonSession
): Array<{ unit: CourseUnit; task: CourseTask }>;
export declare function finishSession(
  state: AcademyProgress,
  session: LessonSession
): {
  score: number;
  passed: boolean;
  required: number;
  total: number;
  correct: number;
};
