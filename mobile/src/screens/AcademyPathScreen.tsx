import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  addDays,
  dayKey,
  getUnits,
  isUnlocked,
  unitPercent
} from '../shared/academy-model.js';
import type { CourseUnit } from '../shared/course-data.js';
import { COLORS, KIT_ASSETS, RADII, SHADOWS, WORLD_PALETTE } from '../theme/verbariumTokens';
import { CefrPill, TactileButton, VerbariumCard } from '../components/VerbariumUI';
import { triggerHaptic } from '../services/nativeFeedback';
import { useVerbarium } from '../state/VerbariumContext';

const WEEK_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const WINDING_ALIGN: Array<'flex-start' | 'center' | 'flex-end'> = [
  'center',
  'flex-end',
  'center',
  'flex-start',
  'center'
];

export function AcademyPathScreen({
  onStartUnit,
  onOpenSentenceLab
}: {
  onStartUnit: (unit: CourseUnit) => void;
  onOpenSentenceLab: () => void;
}) {
  const { progress, profile } = useVerbarium();
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);
  const units = getUnits(progress);
  const today = dayKey();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const k = addDays(today, i - 6);
    const [y, m, d] = k.split('-').map(Number);
    const weekday = new Date(y, m - 1, d).getDay();
    const xp = progress.activity[k]?.xp || 0;
    return { key: k, label: WEEK_LABELS[weekday], active: xp > 0, isToday: k === today };
  });

  const activeUnitId =
    units.find((u) => isUnlocked(progress, u.id) && !progress.completed[u.id])?.id || units[0]?.id;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>VERBARIUM ACADEMY · TRILHA V13</Text>
        <Text style={styles.title}>Sua jornada de inglês</Text>
        <Text style={styles.subtitle}>
          Avance passo a passo nos mundos CEFR. Complete uma unidade com 70%+ para liberar a próxima.
        </Text>
      </View>

      {/* 7-Day Activity Strip */}
      <VerbariumCard style={styles.weekCard}>
        <View style={styles.weekRow}>
          {last7Days.map((day) => (
            <View key={day.key} style={styles.weekCell}>
              <View
                style={[
                  styles.weekDot,
                  day.active && styles.weekDotActive,
                  day.isToday && !day.active && styles.weekDotToday
                ]}
              >
                {day.active ? (
                  <Image source={KIT_ASSETS.streakFlame} style={styles.weekFlame} resizeMode="contain" />
                ) : (
                  <Text style={[styles.weekDotText, day.isToday && styles.weekDotTextToday]}>
                    {day.isToday ? '•' : ''}
                  </Text>
                )}
              </View>
              <Text style={[styles.weekLabel, day.isToday && styles.weekLabelToday]}>
                {day.label}
              </Text>
            </View>
          ))}
        </View>
      </VerbariumCard>

      {lockedNotice ? (
        <View style={styles.noticePill}>
          <Text style={styles.noticeText}>🔒 {lockedNotice}</Text>
        </View>
      ) : null}

      {/* Winding Path Map */}
      <View style={styles.pathContainer}>
        {units.map((unit, idx) => {
          const unlocked = isUnlocked(progress, unit.id);
          const completed = progress.completed[unit.id];
          const isCurrent = unit.id === activeUnitId;
          const pct = unitPercent(progress, unit);
          const palette = WORLD_PALETTE[unit.color] || WORLD_PALETTE.purple;
          const align = WINDING_ALIGN[idx % WINDING_ALIGN.length];
          const showWorldHeader = idx === 0 || units[idx - 1].world !== unit.world;

          return (
            <View key={unit.id} style={styles.stepSection}>
              {showWorldHeader ? (
                <View style={[styles.worldBanner, { backgroundColor: palette.soft, borderColor: palette.badge }]}>
                  <CefrPill level={unit.level} bg={palette.accent} fg={COLORS.white} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.worldName, { color: palette.deep }]}>{unit.world}</Text>
                    <Text style={styles.worldSec}>{unit.section}</Text>
                  </View>
                </View>
              ) : null}

              <View style={[styles.nodeRow, { justifyContent: align }]}>
                {isCurrent && align === 'flex-end' ? (
                  <Image source={KIT_ASSETS.foxReading} style={styles.sidePip} resizeMode="contain" />
                ) : null}

                <Pressable
                  testID={`path-unit-${unit.id}`}
                  onPress={() => {
                    if (!unlocked) {
                      triggerHaptic('error', profile.hapticsEnabled);
                      setLockedNotice(`Conclua "${units[idx - 1]?.title || 'a etapa anterior'}" para desbloquear.`);
                      return;
                    }
                    setLockedNotice(null);
                    triggerHaptic('tap', profile.hapticsEnabled);
                    onStartUnit(unit);
                  }}
                  style={({ pressed }) => [
                    styles.nodeCard,
                    SHADOWS.raised,
                    !unlocked && styles.nodeCardLocked,
                    isCurrent && { borderColor: palette.accent, borderWidth: 2 },
                    pressed && unlocked && { transform: [{ translateY: 2 }] }
                  ]}
                >
                  <View
                    style={[
                      styles.nodeMedallion,
                      {
                        backgroundColor: !unlocked
                          ? COLORS.track
                          : completed
                            ? COLORS.emeraldBright
                            : palette.accent,
                        borderBottomColor: !unlocked
                          ? COLORS.border
                          : completed
                            ? COLORS.emeraldDeep
                            : palette.deep
                      }
                    ]}
                  >
                    <Image
                      source={
                        !unlocked
                          ? KIT_ASSETS.iconLockedAward
                          : completed
                            ? KIT_ASSETS.medal
                            : KIT_ASSETS.lessonBook
                      }
                      style={styles.nodeArt}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.nodeCopy}>
                    <View style={styles.nodeTopLine}>
                      <Text style={styles.nodeNumber}>Etapa {idx + 1}</Text>
                      {completed ? (
                        <Text style={styles.starsText}>
                          {'★'.repeat(completed.stars)}
                          {'☆'.repeat(3 - completed.stars)}
                        </Text>
                      ) : isCurrent ? (
                        <Text style={[styles.nowBadge, { color: palette.deep, backgroundColor: palette.badge }]}>
                          ATUAL
                        </Text>
                      ) : (
                        <Text style={styles.durationText}>{unit.duration} min</Text>
                      )}
                    </View>

                    <Text style={[styles.nodeTitle, !unlocked && styles.nodeTitleLocked]}>
                      {unit.title}
                    </Text>
                    <Text style={styles.nodeSub} numberOfLines={2}>
                      {unit.subtitle}
                    </Text>

                    {completed ? (
                      <Text style={styles.completedMeta}>Concluída · {pct}% de domínio</Text>
                    ) : !unlocked ? (
                      <Text style={styles.lockedMeta}>Bloqueada</Text>
                    ) : (
                      <Text style={[styles.readyMeta, { color: palette.deep }]}>
                        Toque para iniciar ({unit.tasks.length} desafios) →
                      </Text>
                    )}
                  </View>
                </Pressable>

                {isCurrent && align !== 'flex-end' ? (
                  <Image source={KIT_ASSETS.foxWaving} style={styles.sidePip} resizeMode="contain" />
                ) : null}
              </View>

              {idx < units.length - 1 ? <View style={styles.connector} /> : null}
            </View>
          );
        })}
      </View>

      {/* Sentence Lab Footer Entry */}
      <VerbariumCard style={styles.labCard}>
        <View style={styles.labRow}>
          <Image source={KIT_ASSETS.foxTeacher} style={styles.labFox} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={styles.labKicker}>LABORATÓRIO DE FRASES</Text>
            <Text style={styles.labTitle}>Sentence Lab · Present Simple</Text>
            <Text style={styles.labSub}>
              Monte frases com verificação automática de concordância (he/she/it + -s).
            </Text>
          </View>
        </View>
        <TactileButton
          label="Abrir Sentence Lab"
          variant="secondary"
          compact
          onPress={onOpenSentenceLab}
        />
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
  weekCard: {
    paddingVertical: 12,
    paddingHorizontal: 10
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  weekCell: {
    alignItems: 'center',
    gap: 5,
    flex: 1
  },
  weekDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.track,
    alignItems: 'center',
    justifyContent: 'center'
  },
  weekDotActive: {
    backgroundColor: COLORS.surfaceAmber,
    borderWidth: 1.5,
    borderColor: COLORS.amber
  },
  weekDotToday: {
    backgroundColor: COLORS.violetSoft,
    borderWidth: 1.5,
    borderColor: COLORS.violet
  },
  weekFlame: {
    width: 22,
    height: 22
  },
  weekDotText: {
    color: COLORS.muted,
    fontWeight: '800'
  },
  weekDotTextToday: {
    color: COLORS.violet,
    fontSize: 18
  },
  weekLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.muted
  },
  weekLabelToday: {
    color: COLORS.violet,
    fontWeight: '900'
  },
  noticePill: {
    backgroundColor: COLORS.surfaceAmber,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  noticeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.amberDeep
  },
  pathContainer: {
    gap: 4
  },
  stepSection: {
    gap: 10
  },
  worldBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginTop: 6
  },
  worldName: {
    fontSize: 14.5,
    fontWeight: '800'
  },
  worldSec: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.muted
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sidePip: {
    width: 66,
    height: 66
  },
  nodeCard: {
    flex: 1,
    maxWidth: 300,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.track,
    padding: 13
  },
  nodeCardLocked: {
    opacity: 0.72,
    backgroundColor: COLORS.bgSoft
  },
  nodeMedallion: {
    width: 60,
    height: 60,
    borderRadius: 20,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nodeArt: {
    width: 38,
    height: 38
  },
  nodeCopy: {
    flex: 1,
    gap: 3
  },
  nodeTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6
  },
  nodeNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.muted,
    textTransform: 'uppercase'
  },
  starsText: {
    fontSize: 13,
    color: COLORS.amber
  },
  nowBadge: {
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999
  },
  durationText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.muted
  },
  nodeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.ink
  },
  nodeTitleLocked: {
    color: COLORS.muted
  },
  nodeSub: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 16
  },
  completedMeta: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.emerald
  },
  lockedMeta: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.mutedLight
  },
  readyMeta: {
    fontSize: 11.5,
    fontWeight: '800'
  },
  connector: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: COLORS.violetBorder,
    alignSelf: 'center'
  },
  labCard: {
    gap: 12,
    backgroundColor: COLORS.surfaceWarm,
    borderColor: '#FDE68A',
    marginTop: 8
  },
  labRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  labFox: {
    width: 60,
    height: 60
  },
  labKicker: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: COLORS.amberDeep
  },
  labTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.ink
  },
  labSub: {
    fontSize: 12.5,
    color: COLORS.muted,
    lineHeight: 17,
    marginTop: 2
  }
});
