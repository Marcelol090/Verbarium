import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';
import { streak, summary } from '../shared/academy-model.js';
import { COLORS, KIT_ASSETS, RADII } from '../theme/verbariumTokens';
import { CefrPill, MetricTile, TactileButton, VerbariumCard } from '../components/VerbariumUI';
import { speakEnglish, triggerHaptic } from '../services/nativeFeedback';
import { useVerbarium } from '../state/VerbariumContext';

const DAILY_GOALS = [15, 25, 50] as const;

export function ProfileScreen({ onOpenOnboarding }: { onOpenOnboarding: () => void }) {
  const { progress, profile, updateProfile, updateProgress, resetAllProgress } = useVerbarium();
  const [nameInput, setNameInput] = useState(profile.name);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const stats = summary(progress);
  const currentStreak = streak(progress);

  const handleSaveName = () => {
    const clean = nameInput.trim() || 'Estudante';
    updateProfile({ name: clean });
    triggerHaptic('success', profile.hapticsEnabled);
    setStatusMsg('Nome atualizado com sucesso!');
  };

  const handleNativeTest = () => {
    triggerHaptic('celebration', profile.hapticsEnabled);
    speakEnglish('Hello! Verbarium Mobile is ready on your device.', {
      accent: progress.accent
    });
    setStatusMsg(`Áudio (${progress.accent}) + vibração testados em ${Platform.OS.toUpperCase()}.`);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Hero Card */}
      <VerbariumCard raised style={styles.heroCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarWrap}>
            <Image source={KIT_ASSETS.foxWaving} style={styles.avatarImg} resizeMode="contain" />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <CefrPill level={`NÍVEL ${profile.level} · VERBARIUM MOBILE`} />
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileMeta}>
              Meta diária: {progress.dailyGoal} XP · Áudio {progress.accent}
            </Text>
          </View>
        </View>

        <View style={styles.nameEditRow}>
          <TextInput
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Seu nome"
            placeholderTextColor={COLORS.mutedLight}
            style={styles.nameInput}
            maxLength={32}
          />
          <TactileButton label="Salvar" compact onPress={handleSaveName} />
        </View>

        {statusMsg ? <Text style={styles.statusBanner}>✔ {statusMsg}</Text> : null}
      </VerbariumCard>

      {/* Stats Strip */}
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
          value={`${stats.completed}/${stats.total}`}
          label="Unidades"
          tint={COLORS.surfaceMint}
        />
      </View>

      {/* Learning Preferences */}
      <Text style={styles.sectionTitle}>Preferências de estudo</Text>
      <VerbariumCard style={styles.prefsCard}>
        <View style={styles.prefBlock}>
          <Text style={styles.prefLabel}>Meta diária de XP</Text>
          <View style={styles.segRow}>
            {DAILY_GOALS.map((goal) => {
              const active = progress.dailyGoal === goal;
              return (
                <Pressable
                  key={goal}
                  onPress={() => {
                    triggerHaptic('tap', profile.hapticsEnabled);
                    updateProgress((d) => {
                      d.dailyGoal = goal;
                    });
                  }}
                  style={[styles.segBtn, active && styles.segBtnActive]}
                >
                  <Text style={[styles.segText, active && styles.segTextActive]}>{goal} XP</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.prefBlock}>
          <Text style={styles.prefLabel}>Sotaque de pronúncia (TTS nativo)</Text>
          <View style={styles.segRow}>
            {(['en-US', 'en-GB'] as const).map((code) => {
              const active = progress.accent === code;
              return (
                <Pressable
                  key={code}
                  onPress={() => {
                    triggerHaptic('tap', profile.hapticsEnabled);
                    updateProgress((d) => {
                      d.accent = code;
                    });
                  }}
                  style={[styles.segBtn, active && styles.segBtnActive]}
                >
                  <Text style={[styles.segText, active && styles.segTextActive]}>
                    {code === 'en-US' ? '🇺🇸 EN-US' : '🇬🇧 EN-GB'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.prefLabel}>Áudio automático nas tarefas</Text>
            <Text style={styles.prefSub}>Reproduz a frase automaticamente ao abrir um desafio.</Text>
          </View>
          <Switch
            value={profile.autoSpeak}
            onValueChange={(v) => updateProfile({ autoSpeak: v })}
            trackColor={{ false: COLORS.track, true: COLORS.violetBorder }}
            thumbColor={profile.autoSpeak ? COLORS.violet : COLORS.mutedLight}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.prefLabel}>Feedback háptico (vibração)</Text>
            <Text style={styles.prefSub}>Respostas táteis nativas em Android e iOS.</Text>
          </View>
          <Switch
            value={profile.hapticsEnabled}
            onValueChange={(v) => updateProfile({ hapticsEnabled: v })}
            trackColor={{ false: COLORS.track, true: COLORS.violetBorder }}
            thumbColor={profile.hapticsEnabled ? COLORS.violet : COLORS.mutedLight}
          />
        </View>
      </VerbariumCard>

      {/* Android Studio & Physical USB Device Panel */}
      <Text style={styles.sectionTitle}>Android Studio & Dispositivo USB</Text>
      <VerbariumCard style={styles.devCard}>
        <View style={styles.devHeader}>
          <Image source={KIT_ASSETS.appLogo} style={styles.devLogo} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={styles.devKicker}>REACT NATIVE · EXPO SDK 58</Text>
            <Text style={styles.devTitle}>com.verbarium.app · {Platform.OS.toUpperCase()}</Text>
            <Text style={styles.devSub}>
              Pronto para rodar via USB no Android Studio, Emulador AVD, Expo Go ou iOS.
            </Text>
          </View>
        </View>

        <View style={styles.cmdBox}>
          <Text style={styles.cmdText}># Testar no celular físico via Expo Go</Text>
          <Text style={styles.cmdCode}>npm run mobile:start</Text>
          <Text style={styles.cmdText}># Compilar & abrir no celular USB / Android Studio</Text>
          <Text style={styles.cmdCode}>npm run mobile:android</Text>
          <Text style={styles.cmdText}># Gerar pasta android/ Gradle p/ Android Studio</Text>
          <Text style={styles.cmdCode}>npm run mobile:prebuild</Text>
        </View>

        <TactileButton
          testID="profile-native-test-btn"
          label="🔊 Testar áudio nativo + vibração"
          variant="secondary"
          compact
          onPress={handleNativeTest}
        />
      </VerbariumCard>

      {/* Account / Utility Actions */}
      <View style={styles.utilityStack}>
        <TactileButton
          testID="profile-reopen-onboarding-btn"
          label="Reabrir Onboarding guiado"
          variant="ghost"
          compact
          onPress={onOpenOnboarding}
        />

        {!confirmReset ? (
          <Pressable
            onPress={() => setConfirmReset(true)}
            style={styles.resetLink}
          >
            <Text style={styles.resetLinkText}>Reiniciar progresso local</Text>
          </Pressable>
        ) : (
          <VerbariumCard style={styles.confirmCard}>
            <Text style={styles.confirmText}>
              Deseja zerar XP, sequência e unidades concluídas neste aparelho?
            </Text>
            <View style={styles.confirmBtns}>
              <TactileButton
                label="Cancelar"
                variant="secondary"
                compact
                onPress={() => setConfirmReset(false)}
                style={{ flex: 1 }}
              />
              <TactileButton
                label="Zerar tudo"
                variant="danger"
                compact
                onPress={() => {
                  resetAllProgress();
                  setConfirmReset(false);
                  setStatusMsg('Progresso reiniciado.');
                }}
                style={{ flex: 1 }}
              />
            </View>
          </VerbariumCard>
        )}
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
    paddingTop: 14,
    paddingBottom: 28,
    gap: 14
  },
  heroCard: {
    gap: 12
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLavender,
    borderWidth: 2,
    borderColor: COLORS.violetBorder,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarImg: {
    width: 60,
    height: 60
  },
  profileName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.ink
  },
  profileMeta: {
    fontSize: 12.5,
    color: COLORS.muted,
    fontWeight: '600'
  },
  nameEditRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  nameInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.track,
    borderRadius: 13,
    backgroundColor: COLORS.bgSoft,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.ink
  },
  statusBanner: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.emeraldDeep,
    backgroundColor: COLORS.surfaceMint,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: COLORS.ink,
    marginTop: 4
  },
  prefsCard: {
    gap: 14
  },
  prefBlock: {
    gap: 8
  },
  prefLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.ink
  },
  prefSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2
  },
  segRow: {
    flexDirection: 'row',
    gap: 8
  },
  segBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.track,
    backgroundColor: COLORS.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  segBtnActive: {
    borderColor: COLORS.violet,
    backgroundColor: COLORS.violetSoft
  },
  segText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted
  },
  segTextActive: {
    color: COLORS.violet,
    fontWeight: '900'
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.track,
    paddingTop: 12
  },
  devCard: {
    gap: 12,
    backgroundColor: COLORS.surfaceLavender,
    borderColor: COLORS.violetBorder
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  devLogo: {
    width: 48,
    height: 48,
    borderRadius: 13
  },
  devKicker: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: COLORS.violet
  },
  devTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.ink
  },
  devSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
    lineHeight: 16
  },
  cmdBox: {
    backgroundColor: COLORS.inkStrong,
    borderRadius: 14,
    padding: 12,
    gap: 4
  },
  cmdText: {
    fontSize: 11,
    color: '#A799C7',
    marginTop: 4
  },
  cmdCode: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#67E8F9',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
  },
  utilityStack: {
    gap: 10
  },
  resetLink: {
    alignItems: 'center',
    paddingVertical: 10
  },
  resetLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.roseDeep
  },
  confirmCard: {
    backgroundColor: COLORS.surfaceRose,
    borderColor: '#FECACA',
    gap: 10
  },
  confirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.roseDeep
  },
  confirmBtns: {
    flexDirection: 'row',
    gap: 8
  }
});
