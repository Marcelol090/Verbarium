import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { COLORS, RADII, SHADOWS } from '../theme/verbariumTokens';

export type MainTab = 'home' | 'path' | 'practice' | 'progress' | 'profile';

interface TactileButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'emerald' | 'amber' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  compact?: boolean;
  iconText?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const BUTTON_PALETTE = {
  primary: { bg: COLORS.violet, lip: COLORS.violetDeep, fg: COLORS.white, border: COLORS.violetDeep },
  emerald: { bg: COLORS.emeraldBright, lip: COLORS.emeraldDeep, fg: COLORS.white, border: COLORS.emeraldDeep },
  amber: { bg: COLORS.amber, lip: COLORS.amberDeep, fg: COLORS.inkStrong, border: COLORS.amberDeep },
  secondary: { bg: COLORS.surface, lip: COLORS.border, fg: COLORS.violet, border: COLORS.violetBorder },
  ghost: { bg: COLORS.violetSoft, lip: COLORS.violetBorder, fg: COLORS.violet, border: COLORS.violetBorder },
  danger: { bg: COLORS.rose, lip: COLORS.roseDeep, fg: COLORS.white, border: COLORS.roseDeep }
} as const;

export function TactileButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  compact = false,
  iconText,
  style,
  testID
}: TactileButtonProps) {
  const palette = BUTTON_PALETTE[variant];
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.btnBase,
        compact && styles.btnCompact,
        {
          backgroundColor: disabled ? COLORS.track : palette.bg,
          borderColor: disabled ? COLORS.border : palette.border,
          borderBottomColor: disabled ? COLORS.border : palette.lip,
          borderBottomWidth: pressed ? 1 : 4,
          transform: [{ translateY: pressed ? 2 : 0 }],
          opacity: disabled ? 0.65 : 1
        },
        style
      ]}
    >
      {iconText ? <Text style={[styles.btnIcon, { color: disabled ? COLORS.muted : palette.fg }]}>{iconText}</Text> : null}
      <Text
        style={[
          styles.btnText,
          compact && styles.btnTextCompact,
          { color: disabled ? COLORS.muted : palette.fg }
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function VerbariumCard({
  children,
  raised = false,
  style
}: {
  children: React.ReactNode;
  raised?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, raised ? SHADOWS.raised : SHADOWS.card, style]}>
      {children}
    </View>
  );
}

export function MetricTile({
  asset,
  value,
  label,
  tint = COLORS.surfaceLavender
}: {
  asset: ImageSourcePropType;
  value: string | number;
  label: string;
  tint?: string;
}) {
  return (
    <View style={[styles.metricTile, SHADOWS.card]}>
      <View style={[styles.metricIconWrap, { backgroundColor: tint }]}>
        <Image source={asset} style={styles.metricIcon} resizeMode="contain" />
      </View>
      <Text style={styles.metricValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.metricLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function ProgressBar({
  ratio,
  color = COLORS.violet,
  trackColor = COLORS.track,
  height = 10
}: {
  ratio: number;
  color?: string;
  trackColor?: string;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0));
  return (
    <View style={[styles.progressTrack, { backgroundColor: trackColor, height, borderRadius: height }]}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${Math.round(clamped * 100)}%`,
            backgroundColor: color,
            height,
            borderRadius: height
          }
        ]}
      />
    </View>
  );
}

export function CefrPill({
  level,
  bg = COLORS.violetSoft,
  fg = COLORS.violet
}: {
  level: string;
  bg?: string;
  fg?: string;
}) {
  return (
    <View style={[styles.cefrPill, { backgroundColor: bg }]}>
      <Text style={[styles.cefrText, { color: fg }]}>{level}</Text>
    </View>
  );
}

export function AudioPillButton({
  label,
  slow = false,
  onPress,
  testID
}: {
  label: string;
  slow?: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.audioPill,
        slow && styles.audioPillSlow,
        pressed && { opacity: 0.78, transform: [{ scale: 0.97 }] }
      ]}
    >
      <Text style={styles.audioPillGlyph}>{slow ? '🐢' : '🔊'}</Text>
      <Text style={[styles.audioPillText, slow && styles.audioPillTextSlow]}>{label}</Text>
    </Pressable>
  );
}

const TAB_ITEMS: Array<{ id: MainTab; label: string; glyph: string }> = [
  { id: 'home', label: 'Início', glyph: '🏠' },
  { id: 'path', label: 'Trilha', glyph: '🗺️' },
  { id: 'practice', label: 'Prática', glyph: '⚡' },
  { id: 'progress', label: 'Progresso', glyph: '🏆' },
  { id: 'profile', label: 'Perfil', glyph: '🦊' }
];

export function BottomTabBar({
  activeTab,
  dueReviewCount,
  bottomInset,
  onSelect
}: {
  activeTab: MainTab;
  dueReviewCount: number;
  bottomInset: number;
  onSelect: (tab: MainTab) => void;
}) {
  return (
    <View style={[styles.tabBarWrap, SHADOWS.tabBar, { paddingBottom: Math.max(bottomInset, 10) }]}>
      {TAB_ITEMS.map((item) => {
        const active = item.id === activeTab;
        const showBadge = item.id === 'practice' && dueReviewCount > 0;
        return (
          <Pressable
            key={item.id}
            testID={`tab-${item.id}`}
            onPress={() => onSelect(item.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            style={[styles.tabItem, active && styles.tabItemActive]}
          >
            <View style={styles.tabIconWrap}>
              <Text style={[styles.tabGlyph, active && styles.tabGlyphActive]}>{item.glyph}</Text>
              {showBadge ? (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{Math.min(9, dueReviewCount)}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  btnBase: {
    minHeight: 50,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  btnCompact: {
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 13
  },
  btnIcon: {
    fontSize: 16,
    fontWeight: '700'
  },
  btnText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2
  },
  btnTextCompact: {
    fontSize: 13.5
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.track,
    padding: 16
  },
  metricTile: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.track,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4
  },
  metricIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  metricIcon: {
    width: 28,
    height: 28
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.ink
  },
  metricLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.muted
  },
  progressTrack: {
    width: '100%',
    overflow: 'hidden'
  },
  progressFill: {
    minWidth: 0
  },
  cefrPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.pill,
    alignSelf: 'flex-start'
  },
  cefrText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  audioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.violetSoft,
    borderWidth: 1,
    borderColor: COLORS.violetBorder,
    borderRadius: RADII.pill,
    paddingHorizontal: 13,
    paddingVertical: 8,
    minHeight: 38
  },
  audioPillSlow: {
    backgroundColor: COLORS.surfaceAmber,
    borderColor: '#FDE68A'
  },
  audioPillGlyph: {
    fontSize: 14
  },
  audioPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.violet
  },
  audioPillTextSlow: {
    color: COLORS.amberDeep
  },
  tabBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.track,
    paddingTop: 8,
    paddingHorizontal: 8
  },
  tabItem: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    gap: 2
  },
  tabItemActive: {
    backgroundColor: COLORS.violetSoft
  },
  tabIconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabGlyph: {
    fontSize: 19,
    opacity: 0.72
  },
  tabGlyphActive: {
    opacity: 1
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted
  },
  tabLabelActive: {
    color: COLORS.violet
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  tabBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800'
  }
});
