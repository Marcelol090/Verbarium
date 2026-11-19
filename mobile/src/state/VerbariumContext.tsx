import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  defaultProgress,
  loadProgress,
  type AcademyProgress
} from '../shared/academy-model.js';
import {
  blankState,
  hydrateState,
  type SentenceLabState
} from '../shared/lesson-core.js';

const MOBILE_STORAGE_KEY = 'verbarium.mobile.store.v1';

export interface LearnerProfile {
  name: string;
  onboarded: boolean;
  level: 'A1' | 'A2' | 'B1';
  hapticsEnabled: boolean;
  autoSpeak: boolean;
}

interface PersistedStore {
  progress: AcademyProgress;
  profile: LearnerProfile;
  sentenceLab: SentenceLabState;
}

const DEFAULT_PROFILE: LearnerProfile = {
  name: 'Estudante',
  onboarded: true, // Opens directly into Home so first impression is immediate; Onboarding accessible anytime via tab/profile or fresh setup
  level: 'A1',
  hapticsEnabled: true,
  autoSpeak: true
};

interface VerbariumContextValue {
  hydrated: boolean;
  progress: AcademyProgress;
  profile: LearnerProfile;
  sentenceLab: SentenceLabState;
  updateProgress: (mutator: (draft: AcademyProgress) => AcademyProgress | void) => void;
  updateProfile: (patch: Partial<LearnerProfile>) => void;
  updateSentenceLab: (next: SentenceLabState) => void;
  completeOnboarding: (payload: {
    name?: string;
    dailyGoal: number;
    accent: 'en-US' | 'en-GB';
    level: 'A1' | 'A2' | 'B1';
  }) => void;
  resetAllProgress: () => void;
}

const VerbariumContext = createContext<VerbariumContextValue | null>(null);

function cloneProgress(p: AcademyProgress): AcademyProgress {
  return JSON.parse(JSON.stringify(p)) as AcademyProgress;
}

export function VerbariumProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [progress, setProgress] = useState<AcademyProgress>(() => defaultProgress());
  const [profile, setProfile] = useState<LearnerProfile>(DEFAULT_PROFILE);
  const [sentenceLab, setSentenceLab] = useState<SentenceLabState>(() => blankState());

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(MOBILE_STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        try {
          const parsed = JSON.parse(raw) as Partial<PersistedStore>;
          if (parsed.progress) setProgress(loadProgress(parsed.progress));
          if (parsed.profile) setProfile({ ...DEFAULT_PROFILE, ...parsed.profile });
          if (parsed.sentenceLab) setSentenceLab(hydrateState(parsed.sentenceLab));
        } catch {
          // Ignore malformed persisted data
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next: PersistedStore) => {
    AsyncStorage.setItem(MOBILE_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const updateProgress = useCallback(
    (mutator: (draft: AcademyProgress) => AcademyProgress | void) => {
      setProgress((prev) => {
        const draft = cloneProgress(prev);
        const maybeNext = mutator(draft);
        const resolved = maybeNext ?? draft;
        persist({ progress: resolved, profile, sentenceLab });
        return resolved;
      });
    },
    [persist, profile, sentenceLab]
  );

  const updateProfile = useCallback(
    (patch: Partial<LearnerProfile>) => {
      setProfile((prev) => {
        const resolved = { ...prev, ...patch };
        persist({ progress, profile: resolved, sentenceLab });
        return resolved;
      });
    },
    [persist, progress, sentenceLab]
  );

  const updateSentenceLab = useCallback(
    (next: SentenceLabState) => {
      setSentenceLab(next);
      persist({ progress, profile, sentenceLab: next });
    },
    [persist, progress, profile]
  );

  const completeOnboarding = useCallback(
    (payload: {
      name?: string;
      dailyGoal: number;
      accent: 'en-US' | 'en-GB';
      level: 'A1' | 'A2' | 'B1';
    }) => {
      const nextProfile: LearnerProfile = {
        ...profile,
        name: payload.name?.trim() || profile.name,
        level: payload.level,
        onboarded: true
      };
      const nextProgress: AcademyProgress = {
        ...cloneProgress(progress),
        dailyGoal: payload.dailyGoal,
        accent: payload.accent
      };
      setProfile(nextProfile);
      setProgress(nextProgress);
      persist({ progress: nextProgress, profile: nextProfile, sentenceLab });
    },
    [persist, profile, progress, sentenceLab]
  );

  const resetAllProgress = useCallback(() => {
    const freshProgress = defaultProgress();
    const freshLab = blankState();
    const freshProfile: LearnerProfile = {
      ...profile,
      level: 'A1'
    };
    setProgress(freshProgress);
    setSentenceLab(freshLab);
    setProfile(freshProfile);
    persist({ progress: freshProgress, profile: freshProfile, sentenceLab: freshLab });
  }, [persist, profile]);

  const value = useMemo<VerbariumContextValue>(
    () => ({
      hydrated,
      progress,
      profile,
      sentenceLab,
      updateProgress,
      updateProfile,
      updateSentenceLab,
      completeOnboarding,
      resetAllProgress
    }),
    [
      hydrated,
      progress,
      profile,
      sentenceLab,
      updateProgress,
      updateProfile,
      updateSentenceLab,
      completeOnboarding,
      resetAllProgress
    ]
  );

  return <VerbariumContext.Provider value={value}>{children}</VerbariumContext.Provider>;
}

export function useVerbarium(): VerbariumContextValue {
  const ctx = useContext(VerbariumContext);
  if (!ctx) {
    throw new Error('useVerbarium must be used inside VerbariumProvider');
  }
  return ctx;
}
