import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, KIT_ASSETS, RADII, SHADOWS } from '../theme/verbariumTokens';
import { ProgressBar, TactileButton, VerbariumCard } from '../components/VerbariumUI';
import { triggerHaptic } from '../services/nativeFeedback';
import { useVerbarium } from '../state/VerbariumContext';

const GOALS = [
  { xp: 15, title: 'Casual · 5 min/dia', desc: '15 XP diários para manter ritmo leve.' },
  { xp: 25, title: 'Consistente · 10 min/dia', desc: '25 XP diários — equilíbrio ideal.' },
  { xp: 50, title: 'Intenso · 20 min/dia', desc: '50 XP diários para acelerar sua fluência.' }
] as const;

const LEVELS: Array<{ code: 'A1' | 'A2' | 'B1'; title: string; desc: string }> = [
  { code: 'A1', title: 'Fundamentos & Rotina', desc: 'Primeiras palavras, pedidos e frases do dia a dia.' },
  { code: 'A2', title: 'Situações Reais', desc: 'Direções, viagens, perguntas e diálogos curtos.' },
  { code: 'B1', title: 'Conversas com Propósito', desc: 'Opiniões, conectores e justificativas claras.' }
];

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { profile, progress, completeOnboarding } = useVerbarium();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name === 'Estudante' ? '' : profile.name);
  const [dailyGoal, setDailyGoal] = useState(progress.dailyGoal || 25);
  const [accent, setAccent] = useState<'en-US' | 'en-GB'>(progress.accent || 'en-US');
  const [level, setLevel] = useState<'A1' | 'A2' | 'B1'>(profile.level || 'A1');

  const mascot = step === 0 ? KIT_ASSETS.foxWelcome : step === 1 ? KIT_ASSETS.foxWaving : KIT_ASSETS.foxTeacher;

  const handleNext = () => {
    triggerHaptic('tap', profile.hapticsEnabled);
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    triggerHaptic('celebration', profile.hapticsEnabled);
    completeOnboarding({
      name: name.trim() || 'Estudante',
      dailyGoal,
      accent,
      level
    });
    onDone();
  };

  return (
    <LinearGradient colors={['#EFE7FF', '#F6F2FC', '#FFFDF9']} style={styles.root}>
      <View style={styles.topRow}>
        <Pressable
          onPress={() => (step > 0 ? setStep((s) => s - 1) : onDone())}
          style={styles.backBtn}
          accessibilityLabel={step > 0 ? 'Voltar etapa' : 'Pular onboarding'}
        >
          <Text style={styles.backBtnText}>{step > 0 ? '← Voltar' : 'Pular'}</Text>
        </Pressable>
        <View style={styles.progressWrap}>
          <ProgressBar ratio={(step + 1) / 3} height={8} />
        </View>
        <Text style={styles.stepTag}>{step + 1}/3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroArtWrap}>
          <Image source={mascot} style={styles.heroFox} resizeMode="contain" />
        </View>

        {step === 0 ? (
          <View style={styles.block}>
            <Text style={styles.kicker}>VERBARIUM MOBILE · REACT NATIVE</Text>
            <Text style={styles.title}>Aprenda inglês com voz, contexto e ritmo diário</Text>
            <Text style={styles.subtitle}>
              Pip guia você em micro-lições interativas com escuta, montagem de frases, diálogos e repetição espaçada.
            </Text>

            <VerbariumCard style={styles.inputCard}>
              <Text style={styles.fieldLabel}>Como Pip deve chamar você?</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Seu nome ou apelido"
                placeholderTextColor={COLORS.mutedLight}
                style={styles.textInput}
                maxLength={32}
              />
            </VerbariumCard>

            <View style={styles.featureRow}>
              <View style={styles.featurePill}>
                <Image source={KIT_ASSETS.lessonBook} style={styles.pillIcon} resizeMode="contain" />
                <Text style={styles.featureText}>5 unidades CEFR</Text>
              </View>
              <View style={styles.featurePill}>
                <Image source={KIT_ASSETS.dialogBubble} style={styles.pillIcon} resizeMode="contain" />
                <Text style={styles.featureText}>Áudio EN-US / GB</Text>
              </View>
            </View>
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.block}>
            <Text style={styles.kicker}>SEU RITMO DIÁRIO</Text>
            <Text style={styles.title}>Escolha sua meta de XP e sotaque</Text>
            <Text style={styles.subtitle}>
              Você pode ajustar a qualquer momento na aba Perfil.
            </Text>

            <View style={styles.choiceList}>
              {GOALS.map((g) => {
                const selected = dailyGoal === g.xp;
                return (
                  <Pressable
                    key={g.xp}
                    onPress={() => {
                      triggerHaptic('tap', profile.hapticsEnabled);
                      setDailyGoal(g.xp);
                    }}
                    style={[styles.choiceCard, SHADOWS.card, selected && styles.choiceCardSelected]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.choiceTitle, selected && styles.choiceTitleSelected]}>{g.title}</Text>
                      <Text style={styles.choiceDesc}>{g.desc}</Text>
                    </View>
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.accentRow}>
              {(['en-US', 'en-GB'] as const).map((code) => {
                const active = accent === code;
                return (
                  <Pressable
                    key={code}
                    onPress={() => {
                      triggerHaptic('tap', profile.hapticsEnabled);
                      setAccent(code);
                    }}
                    style={[styles.accentBtn, active && styles.accentBtnActive]}
                  >
                    <Text style={[styles.accentText, active && styles.accentTextActive]}>
                      {code === 'en-US' ? '🇺🇸 Inglês Americano' : '🇬🇧 Inglês Britânico'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.block}>
            <Text style={styles.kicker}>TRILHA PERSONALIZADA</Text>
            <Text style={styles.title}>Qual nível combina com você hoje?</Text>
            <Text style={styles.subtitle}>
              Todas as unidades continuam disponíveis na Trilha para você explorar no seu tempo.
            </Text>

            <View style={styles.choiceList}>
              {LEVELS.map((item) => {
                const selected = level === item.code;
                return (
                  <Pressable
                    key={item.code}
                    onPress={() => {
                      triggerHaptic('tap', profile.hapticsEnabled);
                      setLevel(item.code);
                    }}
                    style={[styles.choiceCard, SHADOWS.card, selected && styles.choiceCardSelected]}
                  >
                    <View style={[styles.levelBadge, selected && styles.levelBadgeSelected]}>
                      <Text style={[styles.levelBadgeText, selected && styles.levelBadgeTextSelected]}>
                        {item.code}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.choiceTitle, selected && styles.choiceTitleSelected]}>
                        {item.title}
                      </Text>
                      <Text style={styles.choiceDesc}>{item.desc}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TactileButton
          testID="onboarding-next-btn"
          label={step < 2 ? 'Continuar →' : 'Começar minha jornada 🚀'}
          onPress={handleNext}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8
  },
  backBtnText: {
    color: COLORS.violet,
    fontWeight: '700',
    fontSize: 14
  },
  progressWrap: {
    flex: 1
  },
  stepTag: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.muted
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 24
  },
  heroArtWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 8
  },
  heroFox: {
    width: 158,
    height: 158
  },
  block: {
    gap: 12
  },
  kicker: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: COLORS.violet,
    textAlign: 'center'
  },
  title: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
    color: COLORS.ink,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 20,
    color: COLORS.muted,
    textAlign: 'center'
  },
  inputCard: {
    marginTop: 6,
    gap: 8
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: COLORS.violetBorder,
    borderRadius: 13,
    backgroundColor: COLORS.bgSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.ink,
    fontWeight: '600'
  },
  featureRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 4
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.track,
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  pillIcon: {
    width: 22,
    height: 22
  },
  featureText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.ink
  },
  choiceList: {
    gap: 10,
    marginTop: 4
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: COLORS.track,
    padding: 14
  },
  choiceCardSelected: {
    borderColor: COLORS.violet,
    backgroundColor: COLORS.surfaceLavender
  },
  choiceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.ink
  },
  choiceTitleSelected: {
    color: COLORS.violet
  },
  choiceDesc: {
    fontSize: 12.5,
    color: COLORS.muted,
    marginTop: 2
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioSelected: {
    borderColor: COLORS.violet
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.violet
  },
  accentRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4
  },
  accentBtn: {
    flex: 1,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: COLORS.track,
    backgroundColor: COLORS.surface,
    paddingVertical: 11,
    paddingHorizontal: 10,
    alignItems: 'center'
  },
  accentBtnActive: {
    borderColor: COLORS.violet,
    backgroundColor: COLORS.violetSoft
  },
  accentText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted
  },
  accentTextActive: {
    color: COLORS.violet
  },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.violetSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  levelBadgeSelected: {
    backgroundColor: COLORS.violet
  },
  levelBadgeText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.violet
  },
  levelBadgeTextSelected: {
    color: COLORS.white
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20
  }
});
