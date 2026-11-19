import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { dueReviews, getUnits, isGraded } from './src/shared/academy-model.js';
import type { CourseUnit, SkillType } from './src/shared/course-data.js';
import { COLORS } from './src/theme/verbariumTokens';
import { BottomTabBar, type MainTab } from './src/components/VerbariumUI';
import { VerbariumProvider, useVerbarium } from './src/state/VerbariumContext';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { AcademyPathScreen } from './src/screens/AcademyPathScreen';
import { LessonScreen, type ActiveLessonTarget } from './src/screens/LessonScreen';
import { PracticeScreen } from './src/screens/PracticeScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const SKILL_LABELS: Record<SkillType, string> = {
  vocabulary: 'Treino de Vocabulário',
  grammar: 'Treino de Gramática',
  listening: 'Treino de Escuta',
  reading: 'Treino de Leitura',
  writing: 'Treino de Escrita',
  speaking: 'Treino de Conversação'
};

function VerbariumMobileShell() {
  const insets = useSafeAreaInsets();
  const { progress } = useVerbarium();
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeLesson, setActiveLesson] = useState<ActiveLessonTarget | null>(null);

  const due = dueReviews(progress);

  const startUnit = useCallback((unit: CourseUnit) => {
    setActiveLesson({
      mode: 'unit',
      unitId: unit.id,
      title: unit.title,
      subtitle: `${unit.world} · ${unit.level}`,
      level: unit.level,
      items: unit.tasks.map((task) => ({ unit, task }))
    });
  }, []);

  const startReview = useCallback(() => {
    const dueNow = dueReviews(progress);
    const items =
      dueNow.length > 0
        ? dueNow.map((d) => ({ unit: d.unit, task: d.task }))
        : getUnits(progress)
            .flatMap((unit) => unit.tasks.filter(isGraded).slice(0, 2).map((task) => ({ unit, task })))
            .slice(0, 6);

    setActiveLesson({
      mode: 'review',
      title: 'Revisão Inteligente',
      subtitle: 'Repetição Espaçada · Verbarium',
      level: 'SRS',
      items
    });
  }, [progress]);

  const startSkillDrill = useCallback(
    (skill: SkillType) => {
      const matched = getUnits(progress)
        .flatMap((unit) =>
          unit.tasks.filter((t) => t.skill === skill).map((task) => ({ unit, task }))
        )
        .slice(0, 6);

      const fallback = getUnits(progress)[0];
      const items =
        matched.length > 0
          ? matched
          : fallback.tasks.slice(0, 4).map((task) => ({ unit: fallback, task }));

      setActiveLesson({
        mode: 'skill',
        title: SKILL_LABELS[skill] || 'Treino Focado',
        subtitle: `${items.length} desafios selecionados`,
        level: 'DRILL',
        items
      });
    },
    [progress]
  );

  if (showOnboarding) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar style="dark" />
        <OnboardingScreen onDone={() => setShowOnboarding(false)} />
      </View>
    );
  }

  if (activeLesson) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar style="dark" />
        <LessonScreen target={activeLesson} onClose={() => setActiveLesson(null)} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.screenArea}>
        {activeTab === 'home' ? (
          <HomeScreen
            onStartUnit={startUnit}
            onStartReview={startReview}
            onStartSkillDrill={startSkillDrill}
            onNavigateTab={setActiveTab}
            onOpenOnboarding={() => setShowOnboarding(true)}
          />
        ) : null}

        {activeTab === 'path' ? (
          <AcademyPathScreen
            onStartUnit={startUnit}
            onOpenSentenceLab={() => setActiveTab('practice')}
          />
        ) : null}

        {activeTab === 'practice' ? (
          <PracticeScreen
            onStartSkillDrill={startSkillDrill}
            onStartReview={startReview}
          />
        ) : null}

        {activeTab === 'progress' ? <ProgressScreen /> : null}

        {activeTab === 'profile' ? (
          <ProfileScreen onOpenOnboarding={() => setShowOnboarding(true)} />
        ) : null}
      </View>

      <BottomTabBar
        activeTab={activeTab}
        dueReviewCount={due.length}
        bottomInset={insets.bottom}
        onSelect={setActiveTab}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <VerbariumProvider>
        <VerbariumMobileShell />
      </VerbariumProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  screenArea: {
    flex: 1
  }
});
