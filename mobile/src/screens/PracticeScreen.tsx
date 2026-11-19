import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import {
  dueReviews,
  earnXp,
  reviewStats
} from '../shared/academy-model.js';
import type { SkillType } from '../shared/course-data.js';
import {
  gradeSentence,
  PHRASES,
  recordAttempt,
  sentence
} from '../shared/lesson-core.js';
import { COLORS, KIT_ASSETS, RADII, SHADOWS } from '../theme/verbariumTokens';
import {
  AudioPillButton,
  TactileButton,
  VerbariumCard
} from '../components/VerbariumUI';
import { speakEnglish, triggerHaptic } from '../services/nativeFeedback';
import { useVerbarium } from '../state/VerbariumContext';

const SKILL_DRILLS: Array<{
  skill: SkillType;
  title: string;
  desc: string;
  asset: keyof typeof KIT_ASSETS;
  tint: string;
}> = [
  { skill: 'vocabulary', title: 'Vocabulário', desc: 'Imagens & associações', asset: 'lessonBook', tint: '#EEF2FF' },
  { skill: 'grammar', title: 'Gramática', desc: 'Lacunas & regras', asset: 'xpGem', tint: '#FEF3C7' },
  { skill: 'listening', title: 'Escuta', desc: 'Áudio nativo EN-US/GB', asset: 'dialogBubble', tint: '#E0F2FE' },
  { skill: 'reading', title: 'Leitura', desc: 'Mini histórias', asset: 'foxReading', tint: '#ECFDF5' },
  { skill: 'writing', title: 'Escrita', desc: 'Ordem das palavras', asset: 'foxTeacher', tint: '#F5F3FF' },
  { skill: 'speaking', title: 'Fala', desc: 'Diálogos & pronúncia', asset: 'foxWaving', tint: '#FCE7F3' }
];

export function PracticeScreen({
  onStartSkillDrill,
  onStartReview
}: {
  onStartSkillDrill: (skill: SkillType) => void;
  onStartReview: () => void;
}) {
  const { progress, profile, sentenceLab, updateSentenceLab, updateProgress } = useVerbarium();
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typedSentence, setTypedSentence] = useState('');
  const [labResult, setLabResult] = useState<{ ok: boolean; reason: string } | null>(null);

  const due = dueReviews(progress);
  const revStats = reviewStats(progress);
  const phrase = PHRASES[phraseIdx % PHRASES.length];
  const expected = useMemo(() => sentence(phrase), [phrase]);

  const handleCheckLab = () => {
    const verdict = gradeSentence(typedSentence, expected);
    setLabResult(verdict);
    triggerHaptic(verdict.ok ? 'success' : 'error', profile.hapticsEnabled);
    const nextLab = recordAttempt(sentenceLab, 4, phrase.id, verdict.ok);
    updateSentenceLab(nextLab);
    if (verdict.ok) {
      updateProgress((draft) => {
        earnXp(draft, 5);
      });
    }
  };

  const handleNextPhrase = () => {
    triggerHaptic('tap', profile.hapticsEnabled);
    setPhraseIdx((i) => (i + 1) % PHRASES.length);
    setTypedSentence('');
    setLabResult(null);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>TREINO DIRECIONADO</Text>
        <Text style={styles.title}>Central de Prática</Text>
        <Text style={styles.subtitle}>
          Reforce cada habilidade do inglês ou pratique construção de frases no Sentence Lab.
        </Text>
      </View>

      {/* Spaced Repetition Card */}
      <VerbariumCard raised style={styles.reviewCard}>
        <View style={styles.reviewTop}>
          <Image source={KIT_ASSETS.chest} style={styles.reviewArt} resizeMode="contain" />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.reviewKicker}>REPETIÇÃO ESPAÇADA (SRS)</Text>
            <Text style={styles.reviewTitle}>
              {due.length > 0
                ? `${due.length} ${due.length === 1 ? 'desafio pendente' : 'desafios pendentes'}`
                : 'Tudo em dia por hoje!'}
            </Text>
            <Text style={styles.reviewSub}>
              {revStats.stored > 0
                ? `${revStats.stored} itens memorizados no seu ciclo de 1-3-7-14-30 dias.`
                : 'Complete desafios na Trilha para preencher sua fila de revisão inteligente.'}
            </Text>
          </View>
        </View>
        <TactileButton
          testID="practice-review-btn"
          label={due.length > 0 ? `Iniciar revisão (${due.length})` : 'Fazer treino misto de revisão'}
          variant={due.length > 0 ? 'emerald' : 'secondary'}
          compact
          onPress={onStartReview}
        />
      </VerbariumCard>

      {/* 6 Distinct 48-Asset Skill Drill Cards */}
      <Text style={styles.sectionTitle}>Treinar por habilidade</Text>
      <View style={styles.skillGrid}>
        {SKILL_DRILLS.map((item) => (
          <Pressable
            key={item.skill}
            testID={`practice-skill-${item.skill}`}
            onPress={() => {
              triggerHaptic('tap', profile.hapticsEnabled);
              onStartSkillDrill(item.skill);
            }}
            style={({ pressed }) => [
              styles.skillCard,
              SHADOWS.card,
              pressed && { transform: [{ scale: 0.97 }] }
            ]}
          >
            <View style={[styles.skillIconBox, { backgroundColor: item.tint }]}>
              <Image source={KIT_ASSETS[item.asset]} style={styles.skillImg} resizeMode="contain" />
            </View>
            <Text style={styles.skillName}>{item.title}</Text>
            <Text style={styles.skillDesc}>{item.desc}</Text>
          </Pressable>
        ))}
      </View>

      {/* Interactive Sentence Lab Studio */}
      <Text style={styles.sectionTitle}>Sentence Lab · Laboratório de Frases</Text>
      <VerbariumCard style={styles.labCard}>
        <View style={styles.labHeader}>
          <Image source={KIT_ASSETS.foxTeacher} style={styles.labFox} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={styles.labKicker}>
              FRASE {(phraseIdx % PHRASES.length) + 1} DE {PHRASES.length} · +{sentenceLab.xp} XP
            </Text>
            <Text style={styles.labPrompt}>Traduza para inglês: “{phrase.pt}”</Text>
            <Text style={styles.labHint}>Regra: {phrase.rule}</Text>
          </View>
        </View>

        <View style={styles.audioRow}>
          <AudioPillButton
            label="Ouvir resposta modelo"
            onPress={() => speakEnglish(expected, { accent: progress.accent })}
          />
          <AudioPillButton
            label="Lento"
            slow
            onPress={() => speakEnglish(expected, { accent: progress.accent, slow: true })}
          />
        </View>

        <View style={styles.tokenHintRow}>
          {[phrase.subject, phrase.verb, phrase.object].map((part) => (
            <Pressable
              key={part}
              onPress={() => {
                triggerHaptic('tap', profile.hapticsEnabled);
                setTypedSentence((prev) => (prev ? `${prev.trim()} ${part}` : part));
              }}
              style={styles.tokenChip}
            >
              <Text style={styles.tokenChipText}>+ {part}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          testID="sentence-lab-input"
          value={typedSentence}
          onChangeText={(txt) => {
            setTypedSentence(txt);
            if (labResult) setLabResult(null);
          }}
          placeholder="Digite ou toque nos blocos acima..."
          placeholderTextColor={COLORS.mutedLight}
          autoCapitalize="sentences"
          style={styles.labInput}
        />

        {labResult ? (
          <View style={[styles.verdictBox, labResult.ok ? styles.verdictOk : styles.verdictBad]}>
            <Text style={[styles.verdictText, labResult.ok ? styles.okText : styles.badText]}>
              {labResult.ok ? '✅ ' : '💡 '}
              {labResult.reason}
            </Text>
          </View>
        ) : null}

        <View style={styles.labActions}>
          <TactileButton
            testID="sentence-lab-check-btn"
            label="Validar frase"
            compact
            disabled={!typedSentence.trim()}
            onPress={handleCheckLab}
            style={{ flex: 1 }}
          />
          <TactileButton
            label="Próxima →"
            variant="secondary"
            compact
            onPress={handleNextPhrase}
          />
        </View>
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
  reviewCard: {
    gap: 12,
    backgroundColor: COLORS.surfaceLavender,
    borderColor: COLORS.violetBorder
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  reviewArt: {
    width: 60,
    height: 60
  },
  reviewKicker: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: COLORS.violet
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.ink
  },
  reviewSub: {
    fontSize: 12.5,
    color: COLORS.muted,
    lineHeight: 17
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: COLORS.ink,
    marginTop: 4
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
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  skillImg: {
    width: 34,
    height: 34
  },
  skillName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.ink
  },
  skillDesc: {
    fontSize: 12,
    color: COLORS.muted
  },
  labCard: {
    gap: 12,
    backgroundColor: COLORS.surfaceWarm,
    borderColor: '#FDE68A'
  },
  labHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  labFox: {
    width: 58,
    height: 58
  },
  labKicker: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: COLORS.amberDeep
  },
  labPrompt: {
    fontSize: 15.5,
    fontWeight: '900',
    color: COLORS.ink,
    marginTop: 2
  },
  labHint: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
    lineHeight: 16
  },
  audioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tokenHintRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7
  },
  tokenChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.violetBorder,
    borderRadius: RADII.pill,
    paddingHorizontal: 11,
    paddingVertical: 6
  },
  tokenChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.violet
  },
  labInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.violetBorder,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.ink
  },
  verdictBox: {
    borderRadius: 12,
    padding: 11,
    borderWidth: 1
  },
  verdictOk: {
    backgroundColor: COLORS.surfaceMint,
    borderColor: COLORS.emeraldBright
  },
  verdictBad: {
    backgroundColor: COLORS.surfaceRose,
    borderColor: COLORS.rose
  },
  verdictText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18
  },
  okText: {
    color: COLORS.emeraldDeep
  },
  badText: {
    color: COLORS.roseDeep
  },
  labActions: {
    flexDirection: 'row',
    gap: 8
  }
});
