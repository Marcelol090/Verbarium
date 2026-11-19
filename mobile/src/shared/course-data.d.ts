export type ActivityType =
  | 'intro'
  | 'visual'
  | 'listening'
  | 'pairs'
  | 'cloze'
  | 'arrange'
  | 'dialogue'
  | 'story'
  | 'speaking';

export type SkillType =
  | 'reading'
  | 'vocabulary'
  | 'listening'
  | 'grammar'
  | 'writing'
  | 'speaking';

export type SpeakerId =
  | 'explorer'
  | 'grandfather'
  | 'hijab'
  | 'blonde'
  | 'glasses'
  | 'fox';

export interface CourseTask {
  id: string;
  type: ActivityType;
  skill: SkillType;
  prompt: string;
  speech: string;
  speaker: SpeakerId;
  scene?: string;
  options?: string[];
  answer?: string;
  explain?: string;
  words?: string[];
  pairs?: [string, string][];
}

export interface CourseUnit {
  id: string;
  world: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  section: string;
  color: string;
  icon: string;
  title: string;
  subtitle: string;
  objective: string;
  duration: number;
  passingScore?: number;
  source?: string;
  tasks: CourseTask[];
}

export interface CharacterMeta {
  name: string;
  base: string;
  neutral: string;
  talk: string;
  good: string;
  wrong: string;
  listen: string;
}

export declare const DEFAULT_UNITS: readonly CourseUnit[];
export declare const ACTIVITY_TYPES: readonly ActivityType[];
export declare const CHARACTERS: Readonly<Record<SpeakerId, CharacterMeta>>;
export declare const foodEmoji: Readonly<Record<string, string>>;
