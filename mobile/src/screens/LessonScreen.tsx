import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CHARACTERS,
  foodEmoji,
  type CourseTask,
  type CourseUnit
} from '../shared/course-data.js';
import {
  checkAnswer,
  dayKey,
  earnXp,
  isGraded,
  PASSING_SCORE,
  recordAnswer,
  recordDailyAnswer
} from '../shared/academy-model.js';
import { COLORS, KIT_ASSETS, RADII, SHADOWS } from '../theme/verbariumTokens';
import {
  AudioPillButton,
  CefrPill,
  ProgressBar,
  TactileButton,
  VerbariumCard
} from '../components/VerbariumUI';
import { speakEnglish, stopSpeech, triggerHaptic } from '../services/nativeFeedback';
import { useVerbarium } from '../state/VerbariumContext';

export interface ActiveLessonTarget {
  mode: 'unit' | 'review' | 'skill';
  title: string;
  subtitle: string;
  level: string;
  unitId?: string;
  items: Array<{ unit: CourseUnit; task: CourseTask }>;
}

const TYPE_BADGE: Record<string, string> = {
  intro: 'HISTÓRIA · INTRODUÇÃO',
  visual: 'VOCABULÁRIO VISUAL',
  listening: 'ESCUTA ATIVA',
  pairs: 'ASSOCIAÇÃO DE PARES',
  cloze: 'GRAMÁTICA EM CONTEXTO',
  arrange: 'MONTE A FRASE',
  dialogue: 'DIÁLOGO REAL',
  story: 'COMPREENSÃO DE TEXTO',
  speaking: 'PRÁTICA DE FALA'
};

export function LessonScreen({
  target,
  onClose
}: {
  target: ActiveLessonTarget;
  onClose: () => void;
}) {
  const { progress, profile, updateProgress } = useVerbarium();
  const [queue, setQueue] = useState(target.items);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'core' | 'repair'>('core');
  const [repairItems, setRepairItems] = useState<Array<{ unit: CourseUnit; task: CourseTask }>>([]);

  // Exercise local state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [chosenWordIdx, setChosenWordIdx] = useState<number[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [pairError, setPairError] = useState<string | null>(null);
  const [speakingChecked, setSpeakingChecked] = useState(false);

  // Scoring & feedback
  const [feedback, setFeedback] = useState<{ ok: boolean; title: string; detail: string } | null>(null);
  const [firstAttempts, setFirstAttempts] = useState(0);
  const [firstCorrect, setFirstCorrect] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [finished, setFinished] = useState<{
    score: number;
    passed: boolean;
    xp: number;
    stars: 1 | 2 | 3;
  } | null>(null);

  const currentItem = queue[index];
  const currentTask = currentItem?.task;
  const speakerMeta = currentTask ? CHARACTERS[currentTask.speaker] || CHARACTERS.fox : CHARACTERS.fox;

  // Deterministic right-column shuffle for pairs tasks
  const rightColumn = useMemo(() => {
    if (!currentTask?.pairs) return [];
    const items = currentTask.pairs.map((p) => p[1]);
    return [...items].reverse();
  }, [currentTask]);

  useEffect(() => {
    if (currentTask?.speech && profile.autoSpeak && !finished) {
      speakEnglish(currentTask.speech, { accent: progress.accent });
    }
    return () => stopSpeech();
  }, [currentTask?.id, index, phase, finished, profile.autoSpeak, progress.accent]);

  const resetInteraction = () => {
    setSelectedOption(null);
    setChosenWordIdx([]);
    setSelectedLeft(null);
    setMatchedPairs([]);
    setPairError(null);
    setSpeakingChecked(false);
    setFeedback(null);
  };

  const handlePlayAudio = (slow = false) => {
    if (!currentTask?.speech) return;
    triggerHaptic('tap', profile.hapticsEnabled);
    speakEnglish(currentTask.speech, { accent: progress.accent, slow });
  };

  const handleVerify = () => {
    if (!currentItem || !currentTask) return;
    const today = dayKey();

    if (currentTask.type === 'intro' || currentTask.type === 'speaking') {
      const bonus = currentTask.type === 'speaking' ? 8 : 4;
      setEarnedXp((x) => x + bonus);
      updateProgress((draft) => {
        earnXp(draft, bonus, today);
      });
      triggerHaptic('success', profile.hapticsEnabled);
      advanceStep();
      return;
    }

    let submission: unknown = selectedOption;
    if (currentTask.type === 'arrange') {
      submission = chosenWordIdx.map((i) => (currentTask.words || [])[i]).join(' ');
    } else if (currentTask.type === 'pairs') {
      submission = matchedPairs;
    }

    const ok = Boolean(checkAnswer(currentTask, submission));
    if (phase === 'core' && isGraded(currentTask)) {
      setFirstAttempts((n) => n + 1);
      if (ok) setFirstCorrect((n) => n + 1);
    }

    const deltaXp = ok ? (phase === 'core' ? 10 : 5) : 0;
    if (deltaXp > 0) setEarnedXp((x) => x + deltaXp);

    updateProgress((draft) => {
      recordAnswer(draft, currentItem.unit, currentTask, ok, today);
      recordDailyAnswer(draft, today);
      if (deltaXp > 0) earnXp(draft, deltaXp, today);
    });

    if (!ok && phase === 'core') {
      setRepairItems((prev) =>
        prev.some((x) => x.task.id === currentTask.id && x.unit.id === currentItem.unit.id)
          ? prev
          : [...prev, currentItem]
      );
    }

    triggerHaptic(ok ? 'success' : 'error', profile.hapticsEnabled);
    setFeedback({
      ok,
      title: ok ? 'Excelente resposta!' : 'Quase lá — vamos revisar juntos',
      detail:
        currentTask.explain ||
        (currentTask.answer ? `Resposta esperada: ${currentTask.answer}` : 'Observe a estrutura e tente novamente.')
    });
  };

  const advanceStep = () => {
    resetInteraction();
    if (index + 1 < queue.length) {
      setIndex((i) => i + 1);
      return;
    }

    if (phase === 'core' && repairItems.length > 0) {
      setPhase('repair');
      setQueue(repairItems);
      setIndex(0);
      return;
    }

    // Complete session
    const totalGraded = Math.max(firstAttempts, target.items.filter((x) => isGraded(x.task)).length);
    const score = totalGraded > 0 ? Math.round((100 * firstCorrect) / totalGraded) : 100;
    const passed = score >= PASSING_SCORE;
    const completionBonus = passed ? 15 : 5;
    const stars: 1 | 2 | 3 = score >= 95 ? 3 : score >= 80 ? 2 : 1;
    const today = dayKey();

    updateProgress((draft) => {
      earnXp(draft, completionBonus, today);
      if (target.mode === 'unit' && target.unitId && passed) {
        const prev = draft.completed[target.unitId];
        if (!prev || score >= prev.score) {
          draft.completed[target.unitId] = { score, finishedAt: today, stars };
        }
      }
    });

    triggerHaptic('celebration', profile.hapticsEnabled);
    setFinished({ score, passed, xp: earnedXp + completionBonus, stars });
  };

  const handlePairTap = (side: 'left' | 'right', value: string) => {
    if (!currentTask?.pairs || feedback) return;
    triggerHaptic('tap', profile.hapticsEnabled);
    setPairError(null);

    if (side === 'left') {
      setSelectedLeft((prev) => (prev === value ? null : value));
      return;
    }

    if (!selectedLeft) return;
    const pairKey = `${selectedLeft}|${value}`;
    const valid = currentTask.pairs.some(([l, r]) => l === selectedLeft && r === value);
    if (valid) {
      if (!matchedPairs.includes(pairKey)) {
        const next = [...matchedPairs, pairKey];
        setMatchedPairs(next);
        triggerHaptic('success', profile.hapticsEnabled);
      }
      setSelectedLeft(null);
    } else {
      triggerHaptic('error', profile.hapticsEnabled);
      setPairError(`"${selectedLeft}" não combina com "${value}". Tente outro par.`);
      setSelectedLeft(null);
    }
  };

  const canSubmit = (() => {
    if (!currentTask) return false;
    if (currentTask.type === 'intro') return true;
    if (currentTask.type === 'speaking') return speakingChecked;
    if (currentTask.type === 'arrange') return chosenWordIdx.length > 0;
    if (currentTask.type === 'pairs') return matchedPairs.length === (currentTask.pairs?.length || 0);
    return selectedOption !== null;
  })();

  if (finished) {
    return (
      <LinearGradient colors={['#EDE3FF', '#F6F2FC', '#FFFDF9']} style={styles.celebrateRoot}>
        <ScrollView contentContainerStyle={styles.celebrateScroll} showsVerticalScrollIndicator={false}>
          <Image
            source={finished.passed ? KIT_ASSETS.chest : KIT_ASSETS.foxTeacher}
            style={styles.celebrateImg}
            resizeMode="contain"
          />
          <Text style={styles.celebrateKicker}>
            {finished.passed ? 'UNIDADE CONCLUÍDA!' : 'TREINO FINALIZADO'}
          </Text>
          <Text style={styles.celebrateTitle}>
            {finished.passed ? 'Parabéns! Excelente evolução 🎉' : 'Bom aquecimento! Vamos reforçar'}
          </Text>
          <Text style={styles.celebrateSub}>
            {target.title} · {target.subtitle}
          </Text>

          <Text style={styles.bigStars}>
            {'★'.repeat(finished.stars)}
            {'☆'.repeat(3 - finished.stars)}
          </Text>

          <View style={styles.summaryRow}>
            <VerbariumCard style={styles.summaryBox}>
              <Image source={KIT_ASSETS.xpGem} style={styles.summaryIcon} resizeMode="contain" />
              <Text style={styles.summaryVal}>+{finished.xp} XP</Text>
              <Text style={styles.summaryLbl}>Ganho total</Text>
            </VerbariumCard>
            <VerbariumCard style={styles.summaryBox}>
              <Image source={KIT_ASSETS.medal} style={styles.summaryIcon} resizeMode="contain" />
              <Text style={styles.summaryVal}>{finished.score}%</Text>
              <Text style={styles.summaryLbl}>Precisão</Text>
            </VerbariumCard>
          </View>

          <TactileButton
            testID="lesson-finish-btn"
            label="Voltar para a jornada"
            variant="emerald"
            onPress={onClose}
            style={{ width: '100%' }}
          />
        </ScrollView>
      </LinearGradient>
    );
  }

  if (!currentTask) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.promptText}>Nenhuma atividade disponível neste bloco.</Text>
        <TactileButton label="Voltar" onPress={onClose} />
      </View>
    );
  }

  const ratio = (index + (feedback ? 1 : 0.25)) / Math.max(1, queue.length);

  return (
    <View style={styles.root}>
      {/* Top Lesson Bar */}
      <View style={styles.topBar}>
        <Pressable
          testID="lesson-close-btn"
          onPress={() => {
            stopSpeech();
            onClose();
          }}
          style={styles.closeBtn}
          accessibilityLabel="Fechar lição"
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>

        <View style={{ flex: 1 }}>
          <ProgressBar
            ratio={ratio}
            color={phase === 'repair' ? COLORS.amber : COLORS.violet}
            height={11}
          />
        </View>

        <View style={styles.xpPill}>
          <Image source={KIT_ASSETS.xpGem} style={styles.xpPillImg} resizeMode="contain" />
          <Text style={styles.xpPillText}>+{earnedXp}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.metaRow}>
          <CefrPill
            level={phase === 'repair' ? 'REVISÃO DE ERROS' : TYPE_BADGE[currentTask.type] || 'ATIVIDADE'}
            bg={phase === 'repair' ? COLORS.amberSoft : COLORS.violetSoft}
            fg={phase === 'repair' ? COLORS.amberDeep : COLORS.violet}
          />
          <Text style={styles.stepCounter}>
            {index + 1} / {queue.length}
          </Text>
        </View>

        <Text style={styles.promptText}>{currentTask.prompt}</Text>

        {/* Character Speech Bubble + Native TTS Controls */}
        <VerbariumCard style={styles.speakerCard}>
          <View style={styles.speakerRow}>
            <Image
              source={
                currentTask.speaker === 'fox'
                  ? KIT_ASSETS.foxTeacher
                  : currentTask.type === 'listening'
                    ? KIT_ASSETS.dialogBubble
                    : KIT_ASSETS.foxWaving
              }
              style={styles.speakerArt}
              resizeMode="contain"
            />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.speakerName}>{speakerMeta.name} diz:</Text>
              <Text style={styles.speechText}>
                {currentTask.type === 'listening' && !feedback
                  ? 'Escute o áudio com atenção e escolha a frase correta.'
                  : `“${currentTask.speech}”`}
              </Text>
            </View>
          </View>
          <View style={styles.audioRow}>
            <AudioPillButton
              testID="lesson-audio-normal"
              label="Ouvir normal"
              onPress={() => handlePlayAudio(false)}
            />
            <AudioPillButton
              testID="lesson-audio-slow"
              label="Lento (0.7x)"
              slow
              onPress={() => handlePlayAudio(true)}
            />
          </View>
        </VerbariumCard>

        {/* INTRO */}
        {currentTask.type === 'intro' ? (
          <VerbariumCard style={styles.introCard}>
            <Text style={styles.introTitle}>Objetivo desta etapa</Text>
            <Text style={styles.introBody}>{currentItem.unit.objective}</Text>
            <Text style={styles.introTip}>
              💡 Dica do Pip: ouça a frase acima em velocidade normal e lenta antes de avançar.
            </Text>
          </VerbariumCard>
        ) : null}

        {/* VISUAL / LISTENING / CLOZE / DIALOGUE / STORY */}
        {['visual', 'listening', 'cloze', 'dialogue', 'story'].includes(currentTask.type) &&
        currentTask.options ? (
          <View style={currentTask.type === 'visual' ? styles.visualGrid : styles.optionStack}>
            {currentTask.options.map((opt) => {
              const selected = selectedOption === opt;
              const isCorrectAnswer = feedback && opt === currentTask.answer;
              const isWrongSelection = feedback && selected && !feedback.ok;
              const emoji = foodEmoji[opt.toLowerCase()];

              return (
                <Pressable
                  key={opt}
                  disabled={Boolean(feedback)}
                  onPress={() => {
                    triggerHaptic('tap', profile.hapticsEnabled);
                    setSelectedOption(opt);
                    if (currentTask.type === 'visual') {
                      speakEnglish(opt, { accent: progress.accent });
                    }
                  }}
                  style={[
                    currentTask.type === 'visual' ? styles.visualOption : styles.listOption,
                    SHADOWS.card,
                    selected && styles.optionSelected,
                    isCorrectAnswer && styles.optionCorrect,
                    isWrongSelection && styles.optionWrong
                  ]}
                >
                  {currentTask.type === 'visual' && emoji ? (
                    <Text style={styles.foodEmoji}>{emoji}</Text>
                  ) : null}
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                      isCorrectAnswer && styles.optionTextCorrect,
                      isWrongSelection && styles.optionTextWrong
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {/* ARRANGE (WORD BANK) */}
        {currentTask.type === 'arrange' && currentTask.words ? (
          <View style={styles.arrangeWrap}>
            <VerbariumCard style={styles.trayCard}>
              <Text style={styles.trayLabel}>Sua frase montada:</Text>
              <View style={styles.chipWrap}>
                {chosenWordIdx.length === 0 ? (
                  <Text style={styles.trayPlaceholder}>Toque nas palavras abaixo na ordem correta...</Text>
                ) : (
                  chosenWordIdx.map((wordIndex, pos) => (
                    <Pressable
                      key={`${wordIndex}-${pos}`}
                      disabled={Boolean(feedback)}
                      onPress={() => {
                        triggerHaptic('tap', profile.hapticsEnabled);
                        setChosenWordIdx((prev) => prev.filter((_, i) => i !== pos));
                      }}
                      style={styles.chosenChip}
                    >
                      <Text style={styles.chosenChipText}>{currentTask.words![wordIndex]}</Text>
                    </Pressable>
                  ))
                )}
              </View>
            </VerbariumCard>

            <View style={styles.chipWrap}>
              {currentTask.words.map((word, idx) => {
                const used = chosenWordIdx.includes(idx);
                return (
                  <Pressable
                    key={`${word}-${idx}`}
                    disabled={used || Boolean(feedback)}
                    onPress={() => {
                      triggerHaptic('tap', profile.hapticsEnabled);
                      setChosenWordIdx((prev) => [...prev, idx]);
                      speakEnglish(word, { accent: progress.accent });
                    }}
                    style={[styles.bankChip, SHADOWS.card, used && styles.bankChipUsed]}
                  >
                    <Text style={[styles.bankChipText, used && styles.bankChipTextUsed]}>{word}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* PAIRS MATCHING */}
        {currentTask.type === 'pairs' && currentTask.pairs ? (
          <View style={styles.pairsWrap}>
            {pairError ? <Text style={styles.pairErrorText}>{pairError}</Text> : null}
            <View style={styles.pairsColumns}>
              <View style={styles.pairCol}>
                {currentTask.pairs.map(([left]) => {
                  const matched = matchedPairs.some((p) => p.startsWith(`${left}|`));
                  const active = selectedLeft === left;
                  return (
                    <Pressable
                      key={left}
                      disabled={matched || Boolean(feedback)}
                      onPress={() => handlePairTap('left', left)}
                      style={[
                        styles.pairTile,
                        SHADOWS.card,
                        active && styles.optionSelected,
                        matched && styles.optionCorrect
                      ]}
                    >
                      <Text
                        style={[
                          styles.pairText,
                          active && styles.optionTextSelected,
                          matched && styles.optionTextCorrect
                        ]}
                      >
                        {left}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.pairCol}>
                {rightColumn.map((right) => {
                  const matched = matchedPairs.some((p) => p.endsWith(`|${right}`));
                  return (
                    <Pressable
                      key={right}
                      disabled={matched || Boolean(feedback)}
                      onPress={() => handlePairTap('right', right)}
                      style={[styles.pairTile, SHADOWS.card, matched && styles.optionCorrect]}
                    >
                      <Text style={[styles.pairText, matched && styles.optionTextCorrect]}>
                        {right}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        ) : null}

        {/* SPEAKING */}
        {currentTask.type === 'speaking' ? (
          <VerbariumCard style={styles.speakingCard}>
            <Text style={styles.speakingTarget}>{currentTask.speech}</Text>
            <Text style={styles.speakingHint}>
              1) Ouça o modelo com atenção. 2) Fale em voz alta imitando a entonação. 3) Confirme quando concluir sua prática.
            </Text>
            <TactileButton
              label={speakingChecked ? '✔ Pronúncia praticada!' : '🎙️ Falei em voz alta'}
              variant={speakingChecked ? 'emerald' : 'secondary'}
              compact
              onPress={() => {
                triggerHaptic('success', profile.hapticsEnabled);
                setSpeakingChecked(true);
              }}
            />
          </VerbariumCard>
        ) : null}

        {/* Feedback Banner */}
        {feedback ? (
          <VerbariumCard
            style={[
              styles.feedbackCard,
              feedback.ok ? styles.feedbackOk : styles.feedbackBad
            ]}
          >
            <Text style={[styles.feedbackTitle, feedback.ok ? styles.okInk : styles.badInk]}>
              {feedback.ok ? '✅ ' : '💡 '}
              {feedback.title}
            </Text>
            <Text style={styles.feedbackDetail}>{feedback.detail}</Text>
          </VerbariumCard>
        ) : null}
      </ScrollView>

      {/* Bottom Action Footer */}
      <View style={styles.footer}>
        {feedback ? (
          <TactileButton
            testID="lesson-continue-btn"
            label="Próximo desafio →"
            variant={feedback.ok ? 'emerald' : 'primary'}
            onPress={advanceStep}
          />
        ) : (
          <TactileButton
            testID="lesson-check-btn"
            label={
              currentTask.type === 'intro'
                ? 'Entendi, começar! →'
                : currentTask.type === 'speaking'
                  ? 'Concluir fala →'
                  : 'Verificar resposta'
            }
            disabled={!canSubmit}
            onPress={handleVerify}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.track
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.muted
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.violetSoft,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  xpPillImg: {
    width: 18,
    height: 18
  },
  xpPillText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.violet
  },
  scroll: {
    padding: 16,
    gap: 14,
    paddingBottom: 24
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stepCounter: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.muted
  },
  promptText: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: -0.3
  },
  speakerCard: {
    gap: 12
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  speakerArt: {
    width: 56,
    height: 56
  },
  speakerName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.violet,
    textTransform: 'uppercase'
  },
  speechText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: COLORS.ink
  },
  audioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  introCard: {
    backgroundColor: COLORS.surfaceWarm,
    borderColor: '#FDE68A',
    gap: 6
  },
  introTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.amberDeep
  },
  introBody: {
    fontSize: 14.5,
    color: COLORS.ink,
    lineHeight: 20
  },
  introTip: {
    fontSize: 12.5,
    color: COLORS.muted,
    marginTop: 4
  },
  visualGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  visualOption: {
    width: '48%',
    flexGrow: 1,
    minHeight: 104,
    borderRadius: RADII.lg,
    borderWidth: 2,
    borderColor: COLORS.track,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 6
  },
  foodEmoji: {
    fontSize: 38
  },
  optionStack: {
    gap: 10
  },
  listOption: {
    minHeight: 54,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.track,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13
  },
  optionSelected: {
    borderColor: COLORS.violet,
    backgroundColor: COLORS.violetSoft
  },
  optionCorrect: {
    borderColor: COLORS.emeraldBright,
    backgroundColor: COLORS.surfaceMint
  },
  optionWrong: {
    borderColor: COLORS.rose,
    backgroundColor: COLORS.surfaceRose
  },
  optionText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: COLORS.ink
  },
  optionTextSelected: {
    color: COLORS.violet
  },
  optionTextCorrect: {
    color: COLORS.emeraldDeep
  },
  optionTextWrong: {
    color: COLORS.roseDeep
  },
  arrangeWrap: {
    gap: 14
  },
  trayCard: {
    minHeight: 84,
    gap: 8,
    backgroundColor: COLORS.bgSoft
  },
  trayLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.muted
  },
  trayPlaceholder: {
    fontSize: 13.5,
    color: COLORS.mutedLight,
    fontStyle: 'italic'
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chosenChip: {
    backgroundColor: COLORS.violet,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  chosenChipText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800'
  },
  bankChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.violetBorder,
    borderBottomWidth: 3,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  bankChipUsed: {
    opacity: 0.35
  },
  bankChipText: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '700'
  },
  bankChipTextUsed: {
    color: COLORS.muted
  },
  pairsWrap: {
    gap: 10
  },
  pairErrorText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.roseDeep,
    backgroundColor: COLORS.surfaceRose,
    padding: 10,
    borderRadius: 12
  },
  pairsColumns: {
    flexDirection: 'row',
    gap: 10
  },
  pairCol: {
    flex: 1,
    gap: 10
  },
  pairTile: {
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.track,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  pairText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
    textAlign: 'center'
  },
  speakingCard: {
    backgroundColor: COLORS.surfaceLavender,
    borderColor: COLORS.violetBorder,
    gap: 10
  },
  speakingTarget: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.violetDeep,
    textAlign: 'center'
  },
  speakingHint: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.muted,
    textAlign: 'center'
  },
  feedbackCard: {
    gap: 6,
    borderWidth: 1.5
  },
  feedbackOk: {
    backgroundColor: COLORS.surfaceMint,
    borderColor: COLORS.emeraldBright
  },
  feedbackBad: {
    backgroundColor: COLORS.surfaceAmber,
    borderColor: COLORS.amber
  },
  feedbackTitle: {
    fontSize: 15.5,
    fontWeight: '900'
  },
  okInk: {
    color: COLORS.emeraldDeep
  },
  badInk: {
    color: COLORS.amberDeep
  },
  feedbackDetail: {
    fontSize: 13.5,
    color: COLORS.ink,
    lineHeight: 19
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.track
  },
  celebrateRoot: {
    flex: 1
  },
  celebrateScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12
  },
  celebrateImg: {
    width: 140,
    height: 140
  },
  celebrateKicker: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: COLORS.violet
  },
  celebrateTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.ink,
    textAlign: 'center'
  },
  celebrateSub: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center'
  },
  bigStars: {
    fontSize: 34,
    color: COLORS.amber,
    letterSpacing: 6
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginVertical: 8
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4
  },
  summaryIcon: {
    width: 36,
    height: 36
  },
  summaryVal: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.ink
  },
  summaryLbl: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16
  }
});
