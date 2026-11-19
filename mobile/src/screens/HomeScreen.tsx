import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  dueReviews,
  getUnits,
  isUnlocked,
  streak,
  summary,
  todayXp,
  unitPercent
} from '../shared/academy-model.js';
import type { CourseUnit, SkillType } from '../shared/course-data.js';
import { COLORS, KIT_ASSETS, RADII, SHADOWS, WORLD_PALETTE } from '../theme/verbariumTokens';
import {
  CefrPill,
  MetricTile,
  ProgressBar,
  TactileButton,
  VerbariumCard,
  type MainTab
} from '../components/VerbariumUI';
import { useVerbarium } from '../state/VerbariumContext';

const QUICK_SKILLS: Array<{
  skill: SkillType;
  label: string;
  desc: string;
  asset: keyof typeof KIT_ASSETS;
  tint: string;
}> = [
  { skill: 'vocabulary', label: 'Vocabulário', desc: 'Palavras & imagens', asset: 'lessonBook', tint: '#EEF2FF' },
  { skill: 'listening', label: 'Escuta', desc: 'Áudio EN-US/GB', asset: 'dialogBubble', tint: '#E0F2FE' },
  { skill: 'grammar', label: 'Gramática', desc: 'Presente & estrutura', asset: 'xpGem', tint: '#FEF3C7' },
  { skill: 'speaking', label: 'Conversação', desc: 'Fala guiada', asset: 'foxWaving', tint: '#FCE7F3' }
];

export function HomeScreen({
  onStartUnit,
  onStartReview,
  onStartSkillDrill,
  onNavigateTab,
  onOpenOnboarding
}: {
  onStartUnit: (unit: CourseUnit) => void;
  onStartReview: () => void;
  onStartSkillDrill: (skill: SkillType) => void;
  onNavigateTab: (tab: MainTab) => void;
  onOpenOnboarding: () => void;
}) {
  const { progress, profile } = useVerbarium();
  const units = getUnits(progress);
  const stats = summary(progress);
  const currentStreak = streak(progress);
  const xpToday = todayXp(progress);
  const goalRatio = Math.min(1, xpToday / Math.max(1, progress.dailyGoal || 25));
  const due = dueReviews(progress);

  const nextUnit =
    units.find((u) => isUnlocked(progress, u.id) && !progress.completed[u.id]) || units[0];
  const nextPalette = WORLD_PALETTE[nextUnit.color] || WORLD_PALETTE.purple;
  const nextPct = unitPercent(progress, nextUnit);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Brand Header */}
      <View style={styles.brandRow}>
        <View style={styles.brandLeft}>
          <Image source={KIT_ASSETS.appLogo} style={styles.brandLogo} resizeMode="contain" />
          <View>
            <Text style={styles.brandName}>Verbarium</Text>
            <Text style={styles.brandSub}>Olá, {profile.name} · Nível {profile.level}</Text>
          </View>
        </View>
        <Pressable
          testID="home-onboarding-btn"
          onPress={onOpenOnboarding}
          style={styles.accentBadge}
          accessibilityLabel="Configurar meta e sotaque"
        >
          <Text style={styles.accentBadgeText}>
            {progress.accent === 'en-GB' ? '🇬🇧 EN-GB' : '🇺🇸 EN-US'}
          </Text>
        </Pressable>
      </View>

      {/* V12/V13 Lilac Sky Hero with Pip */}
      <LinearGradient
        colors={['#EDE3FF', '#F5EEFF', '#FFFDF9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroCard, SHADOWS.raised]}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroLeft}>
            <CefrPill level={`${nextUnit.level} · ${nextUnit.section}`} />
            <Text style={styles.heroTitle}>Continue sua jornada!</Text>
            <Text style={styles.heroSub}>
              {nextUnit.title} — {nextUnit.subtitle}
            </Text>
          </View>
          <Image source={KIT_ASSETS.foxWaving} style={styles.heroPip} resizeMode="contain" />
        </View>

        <TactileButton
          testID="home-continue-btn"
          label={`Começar · ${nextUnit.duration} min`}
          iconText="▶"
          onPress={() => onStartUnit(nextUnit)}
        />
      </LinearGradient>

      {/* Daily XP Goal Card */}
      <VerbariumCard style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalTitleRow}>
            <Image source={KIT_ASSETS.iconLightning} style={styles.smallTileIcon} resizeMode="contain" />
            <Text style={styles.goalTitle}>Meta de hoje</Text>
          </View>
          <Text style={styles.goalCount}>
            {xpToday} / {progress.dailyGoal} XP
          </Text>
        </View>
        <ProgressBar
          ratio={goalRatio}
          color={goalRatio >= 1 ? COLORS.emeraldBright : COLORS.violet}
          height={11}
        />
        <Text style={styles.goalHint}>
          {goalRatio >= 1
            ? '🎉 Meta diária concluída! Continue praticando para ampliar seu combo.'
            : `Faltam ${Math.max(0, progress.dailyGoal - xpToday)} XP para bater sua meta diária.`}
        </Text>
      </VerbariumCard>

      {/* 3 Tactile Metric Tiles */}
      <View style={styles.metricsRow}>
        <MetricTile
          asset={KIT_ASSETS.streakFlame}
          value={`${currentStreak}d`}
          label="Sequência"
          tint={COLORS.surfaceAmber}
        />
        <MetricTile
          asset={KIT_ASSETS.xpGem}
          value={stats.xp}
          label="XP Total"
          tint={COLORS.surfaceLavender}
        />
        <MetricTile
          asset={KIT_ASSETS.medal}
          value={stats.accuracy !== null ? `${stats.accuracy}%` : `${stats.completed}/${stats.total}`}
          label={stats.accuracy !== null ? 'Precisão' : 'Unidades'}
          tint={COLORS.surfaceMint}
        />
      </View>

      {/* Spaced Repetition Due Reviews Alert (if due) or Sentence Lab Spotlight */}
      {due.length > 0 ? (
        <VerbariumCard style={styles.reviewBanner}>
          <View style={styles.bannerRow}>
            <Image source={KIT_ASSETS.chest} style={styles.bannerArt} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerKicker}>REPETIÇÃO ESPAÇADA</Text>
              <Text style={styles.bannerTitle}>
                {due.length} {due.length === 1 ? 'item pronto' : 'itens prontos'} para revisar
              </Text>
              <Text style={styles.bannerDesc}>Reforce o que aprendeu antes de esquecer.</Text>
            </View>
          </View>
          <TactileButton
            label="Revisar agora"
            variant="emerald"
            compact
            onPress={onStartReview}
          />
        </VerbariumCard>
      ) : (
        <Pressable
          testID="home-sentence-lab-card"
          onPress={() => onNavigateTab('practice')}
          style={[styles.labBanner, SHADOWS.card]}
        >
          <Image source={KIT_ASSETS.foxTeacher} style={styles.bannerArt} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerKicker}>SENTENCE LAB INTERATIVO</Text>
            <Text style={styles.bannerTitle}>Monte frases com feedback instantâneo</Text>
            <Text style={styles.bannerDesc}>
              Pratique sujeito + verbo + complemento com explicação gramatical guiada.
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}

      {/* Next Unit Preview Card */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Próxima unidade da trilha</Text>
        <Pressable onPress={() => onNavigateTab('path')}>
          <Text style={styles.sectionLink}>Ver trilha →</Text>
        </Pressable>
      </View>

      <Pressable
        testID="home-next-unit-card"
        onPress={() => onStartUnit(nextUnit)}
        style={[styles.nextUnitCard, SHADOWS.card, { borderLeftColor: nextPalette.accent }]}
      >
        <View style={[styles.unitThumb, { backgroundColor: nextPalette.soft }]}>
          <Image source={KIT_ASSETS.lessonBook} style={styles.unitThumbImg} resizeMode="contain" />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={styles.unitMetaRow}>
            <CefrPill level={nextUnit.level} bg={nextPalette.badge} fg={nextPalette.deep} />
            <Text style={styles.unitWorld}>{nextUnit.world}</Text>
          </View>
          <Text style={styles.unitTitle}>{nextUnit.title}</Text>
          <Text style={styles.unitObjective} numberOfLines={2}>
            {nextUnit.objective}
          </Text>
          <View style={styles.unitBarRow}>
            <View style={{ flex: 1 }}>
              <ProgressBar ratio={nextPct / 100} color={nextPalette.accent} height={7} />
            </View>
            <Text style={styles.unitPctText}>{nextPct}%</Text>
          </View>
        </View>
      </Pressable>

      {/* Quick Skills 2x2 Grid */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Treino rápido por habilidade</Text>
        <Pressable onPress={() => onNavigateTab('practice')}>
          <Text style={styles.sectionLink}>Todas →</Text>
        </Pressable>
      </View>

      <View style={styles.skillGrid}>
        {QUICK_SKILLS.map((item) => (
          <Pressable
            key={item.skill}
            testID={`home-skill-${item.skill}`}
            onPress={() => onStartSkillDrill(item.skill)}
            style={({ pressed }) => [
              styles.skillCard,
              SHADOWS.card,
              pressed && { transform: [{ scale: 0.98 }] }
            ]}
          >
            <View style={[styles.skillIconBox, { backgroundColor: item.tint }]}>
              <Image source={KIT_ASSETS[item.asset]} style={styles.skillImg} resizeMode="contain" />
            </View>
            <Text style={styles.skillTitle}>{item.label}</Text>
            <Text style={styles.skillDesc}>{item.desc}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 12
  },
  brandName: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: -0.3
  },
  brandSub: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.muted
  },
  accentBadge: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.track,
    borderRadius: RADII.pill,
    paddingHorizontal: 11,
    paddingVertical: 7
  },
  accentBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.ink
  },
  heroCard: {
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.violetBorder,
    padding: 16,
    gap: 14
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  heroLeft: {
    flex: 1,
    gap: 6
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: -0.5
  },
  heroSub: {
    fontSize: 13.5,
    lineHeight: 19,
    color: COLORS.muted,
    fontWeight: '500'
  },
  heroPip: {
    width: 106,
    height: 106
  },
  goalCard: {
    gap: 9
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7
  },
  smallTileIcon: {
    width: 24,
    height: 24
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.ink
  },
  goalCount: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.violet
  },
  goalHint: {
    fontSize: 12.5,
    color: COLORS.muted,
    lineHeight: 17
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10
  },
  reviewBanner: {
    backgroundColor: COLORS.surfaceMint,
    borderColor: '#BBF7D0',
    gap: 12
  },
  labBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 14
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  bannerArt: {
    width: 58,
    height: 58
  },
  bannerKicker: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: COLORS.violet
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.ink,
    marginTop: 2
  },
  bannerDesc: {
    fontSize: 12.5,
    color: COLORS.muted,
    marginTop: 2,
    lineHeight: 17
  },
  chevron: {
    fontSize: 26,
    color: COLORS.muted,
    fontWeight: '700'
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: COLORS.ink
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.violet
  },
  nextUnitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.track,
    borderLeftWidth: 5,
    padding: 14
  },
  unitThumb: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  unitThumbImg: {
    width: 42,
    height: 42
  },
  unitMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  unitWorld: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.muted
  },
  unitTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.ink
  },
  unitObjective: {
    fontSize: 12.5,
    color: COLORS.muted,
    lineHeight: 17
  },
  unitBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3
  },
  unitPctText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.muted
  },
  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  skillCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.track,
    padding: 13,
    gap: 5
  },
  skillIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  skillImg: {
    width: 32,
    height: 32
  },
  skillTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.ink
  },
  skillDesc: {
    fontSize: 12,
    color: COLORS.muted
  }
});
