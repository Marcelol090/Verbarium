import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  addDays,
  dayKey,
  getUnits,
  streak,
  summary,
  unitPercent
} from '../shared/academy-model.js';
import type { SkillType } from '../shared/course-data.js';
import { COLORS, KIT_ASSETS, RADII, WORLD_PALETTE } from '../theme/verbariumTokens';
import { CefrPill, ProgressBar, VerbariumCard } from '../components/VerbariumUI';
import { useVerbarium } from '../state/VerbariumContext';

const SKILL_META: Array<{ key: SkillType; label: string; color: string }> = [
  { key: 'vocabulary', label: 'Vocabulário', color: '#6138B8' },
  { key: 'listening', label: 'Escuta', color: '#0EA5E9' },
  { key: 'grammar', label: 'Gramática', color: '#F59E0B' },
  { key: 'reading', label: 'Leitura', color: '#10B981' },
  { key: 'writing', label: 'Escrita', color: '#8B5CF6' },
  { key: 'speaking', label: 'Fala', color: '#EC4899' }
];

const WEEK_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function ProgressScreen() {
  const { progress, sentenceLab } = useVerbarium();
  const units = getUnits(progress);
  const stats = summary(progress);
  const currentStreak = streak(progress);
  const today = dayKey();

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const k = addDays(today, i - 6);
    const [y, m, d] = k.split('-').map(Number);
    const wd = new Date(y, m - 1, d).getDay();
    const xp = progress.activity[k]?.xp || 0;
    return { key: k, label: WEEK_SHORT[wd], xp, isToday: k === today };
  });
  const maxDayXp = Math.max(progress.dailyGoal || 25, ...last7.map((d) => d.xp));

  const skillMastery = SKILL_META.map((item) => {
    let total = 0;
    let scoreSum = 0;
    for (const unit of units) {
      for (const task of unit.tasks) {
        if (task.skill !== item.key) continue;
        total++;
        const rev = progress.reviews[`${unit.id}:${task.id}`];
        if (rev) {
          scoreSum += Math.min(1, (rev.stage + 1) / 4);
        } else if (progress.completed[unit.id]) {
          scoreSum += 0.75;
        }
      }
    }
    const pct = total > 0 ? Math.round((100 * scoreSum) / total) : 0;
    return { ...item, pct };
  });

  const badges = [
    {
      id: 'first-step',
      title: 'Primeiro Passo',
      desc: 'Ganhe seus primeiros 10 XP',
      unlocked: stats.xp >= 10,
      asset: KIT_ASSETS.xpGem
    },
    {
      id: 'streak-3',
      title: 'Fogo Constante',
      desc: 'Mantenha 3 dias de sequência',
      unlocked: currentStreak >= 3,
      asset: KIT_ASSETS.streakFlame
    },
    {
      id: 'unit-clear',
      title: 'Explorador A1',
      desc: 'Conclua 1 unidade da trilha',
      unlocked: stats.completed >= 1,
      asset: KIT_ASSETS.medal
    },
    {
      id: 'sentence-builder',
      title: 'Mestre das Frases',
      desc: 'Acerte no Sentence Lab',
      unlocked: sentenceLab.correct >= 1,
      asset: KIT_ASSETS.lessonBook
    },
    {
      id: 'sharp-aim',
      title: 'Precisão 80%+',
      desc: 'Mantenha 80% ou mais de acerto',
      unlocked: (stats.accuracy ?? 0) >= 80 && progress.attempts >= 4,
      asset: KIT_ASSETS.chest
    },
    {
      id: 'polyglot',
      title: 'Jornada Completa',
      desc: 'Finalize todas as unidades CEFR',
      unlocked: stats.completed >= stats.total && stats.total > 0,
      asset: KIT_ASSETS.foxTeacher
    }
  ];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>SEU DESEMPENHO</Text>
        <Text style={styles.title}>Progresso & Conquistas</Text>
        <Text style={styles.subtitle}>
          Acompanhe seu ritmo semanal, domínio por habilidade e medalhas desbloqueadas.
        </Text>
      </View>

      {/* Streak & Weekly Bar Chart */}
      <VerbariumCard raised style={styles.chartCard}>
        <View style={styles.streakHead}>
          <View style={styles.streakLeft}>
            <Image source={KIT_ASSETS.streakFlame} style={styles.flameArt} resizeMode="contain" />
            <View>
              <Text style={styles.streakCount}>
                {currentStreak === 1
                  ? '1 dia de sequência'
                  : `${currentStreak} dias de sequência`}
              </Text>
              <Text style={styles.streakSub}>
                {stats.xp} XP acumulados · {stats.completed}/{stats.total} unidades
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.barChartRow}>
          {last7.map((day) => {
            const hPct = Math.max(10, Math.round((100 * day.xp) / maxDayXp));
            return (
              <View key={day.key} style={styles.barCol}>
                <Text style={styles.barXp}>{day.xp > 0 ? day.xp : ''}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${hPct}%`,
                        backgroundColor:
                          day.xp >= (progress.dailyGoal || 25)
                            ? COLORS.emeraldBright
                            : day.xp > 0
                              ? COLORS.violet
                              : COLORS.track
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, day.isToday && styles.barLabelToday]}>
                  {day.label}
                </Text>
              </View>
            );
          })}
        </View>
      </VerbariumCard>

      {/* Skill Mastery Breakdown */}
      <Text style={styles.sectionTitle}>Domínio por habilidade</Text>
      <VerbariumCard style={styles.skillsCard}>
        {skillMastery.map((s) => (
          <View key={s.key} style={styles.skillRow}>
            <View style={styles.skillTop}>
              <Text style={styles.skillLabel}>{s.label}</Text>
              <Text style={[styles.skillPct, { color: s.color }]}>{s.pct}%</Text>
            </View>
            <ProgressBar ratio={s.pct / 100} color={s.color} height={8} />
          </View>
        ))}
      </VerbariumCard>

      {/* Achievements Grid */}
      <Text style={styles.sectionTitle}>
        Conquistas ({badges.filter((b) => b.unlocked).length}/{badges.length})
      </Text>
      <View style={styles.badgeGrid}>
        {badges.map((b) => (
          <VerbariumCard
            key={b.id}
            style={[styles.badgeCard, !b.unlocked && styles.badgeCardLocked]}
          >
            <Image
              source={b.unlocked ? b.asset : KIT_ASSETS.iconLockedAward}
              style={[styles.badgeImg, !b.unlocked && { opacity: 0.55 }]}
              resizeMode="contain"
            />
            <Text style={styles.badgeTitle} numberOfLines={1}>
              {b.title}
            </Text>
            <Text style={styles.badgeDesc} numberOfLines={2}>
              {b.desc}
            </Text>
          </VerbariumCard>
        ))}
      </View>

      {/* CEFR Units Breakdown */}
      <Text style={styles.sectionTitle}>Unidades por nível CEFR</Text>
      <VerbariumCard style={styles.unitsListCard}>
        {units.map((u) => {
          const pct = unitPercent(progress, u);
          const pal = WORLD_PALETTE[u.color] || WORLD_PALETTE.purple;
          return (
            <View key={u.id} style={styles.unitRow}>
              <CefrPill level={u.level} bg={pal.badge} fg={pal.deep} />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={styles.unitRowHead}>
                  <Text style={styles.unitRowTitle}>{u.title}</Text>
                  <Text style={styles.unitRowPct}>{pct}%</Text>
                </View>
                <ProgressBar ratio={pct / 100} color={pal.accent} height={7} />
              </View>
            </View>
          );
        })}
      </VerbariumCard>
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
    paddingTop: 14,
    paddingBottom: 28,
    gap: 14
  },
  header: {
    gap: 4
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.violet
  },
  title: {
    fontSize: 23,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: -0.4
  },
  subtitle: {
    fontSize: 13.5,
    color: COLORS.muted,
    lineHeight: 19
  },
  chartCard: {
    gap: 16
  },
  streakHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  flameArt: {
    width: 46,
    height: 46
  },
  streakCount: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.ink
  },
  streakSub: {
    fontSize: 12.5,
    color: COLORS.muted,
    marginTop: 2
  },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 118,
    gap: 6
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 5
  },
  barXp: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.violet,
    height: 14
  },
  barTrack: {
    width: 22,
    height: 76,
    borderRadius: 11,
    backgroundColor: COLORS.bgSoft,
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  barFill: {
    width: '100%',
    borderRadius: 11
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted
  },
  barLabelToday: {
    color: COLORS.violet,
    fontWeight: '900'
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: COLORS.ink,
    marginTop: 4
  },
  skillsCard: {
    gap: 12
  },
  skillRow: {
    gap: 5
  },
  skillTop: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  skillLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.ink
  },
  skillPct: {
    fontSize: 13,
    fontWeight: '900'
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  badgeCard: {
    width: '48%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 5
  },
  badgeCardLocked: {
    backgroundColor: COLORS.bgSoft,
    opacity: 0.8
  },
  badgeImg: {
    width: 46,
    height: 46,
    marginBottom: 2
  },
  badgeTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.ink,
    textAlign: 'center'
  },
  badgeDesc: {
    fontSize: 11.5,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 15
  },
  unitsListCard: {
    gap: 12
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  unitRowHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  unitRowTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.ink
  },
  unitRowPct: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.muted
  }
});
