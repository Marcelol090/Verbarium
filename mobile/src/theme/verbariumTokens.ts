import { Platform, type ImageSourcePropType, type ViewStyle } from 'react-native';

/**
 * Verbarium Precision V12 / V13 Design Tokens
 * Mirrored directly from public/ui-kit/precision-v12.css and precision-v13.css
 * for native Android, iOS, and Web visual parity.
 */
export const COLORS = {
  // Lilac sky canvas & tonal surfaces
  bg: '#F6F2FC',
  bgSoft: '#FCF8FF',
  surface: '#FFFDFF',
  surfaceWarm: '#FFFBF3',
  surfaceLavender: '#F2EBFF',
  surfaceMint: '#ECFDF5',
  surfaceAmber: '#FFF7E6',
  surfaceRose: '#FEF2F2',

  // Typography ink hierarchy
  ink: '#30234D',
  inkStrong: '#1E1438',
  muted: '#756A87',
  mutedLight: '#9A8FB0',

  // Brand royal violet & tactile lips
  violet: '#6138B8',
  violetBright: '#7C4DFF',
  violetDeep: '#4B23A8',
  violetSoft: '#EFE8FF',
  violetBorder: '#D9C9FA',

  // Semantic accents
  emerald: '#16A34A',
  emeraldBright: '#22C55E',
  emeraldDeep: '#15803D',
  emeraldSoft: '#DCFCE7',

  amber: '#F59E0B',
  amberDeep: '#D97706',
  amberSoft: '#FEF3C7',

  rose: '#EF4444',
  roseDeep: '#DC2626',
  roseSoft: '#FEE2E2',

  sky: '#0EA5E9',
  skyDeep: '#0284C7',
  skySoft: '#E0F2FE',

  pink: '#EC4899',
  pinkDeep: '#BE185D',
  pinkSoft: '#FCE7F3',

  // Structural dividers & tracks
  track: '#EDE7F4',
  border: '#E4DBF2',
  white: '#FFFFFF',
  shadowColor: '#49286E'
} as const;

export const RADII = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  pill: 999
} as const;

export const SPACING = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28
} as const;

export const WORLD_PALETTE: Record<
  string,
  { accent: string; deep: string; soft: string; badge: string }
> = {
  blue: { accent: '#3B82F6', deep: '#1D4ED8', soft: '#EFF6FF', badge: '#DBEAFE' },
  pink: { accent: '#EC4899', deep: '#BE185D', soft: '#FDF2F8', badge: '#FCE7F3' },
  yellow: { accent: '#F59E0B', deep: '#B45309', soft: '#FFFBEB', badge: '#FEF3C7' },
  purple: { accent: '#7C3AED', deep: '#5B21B6', soft: '#F5F3FF', badge: '#EDE9FE' },
  green: { accent: '#10B981', deep: '#047857', soft: '#ECFDF5', badge: '#D1FAE5' }
};

export const SHADOWS: Record<'card' | 'raised' | 'tabBar', ViewStyle> = {
  card: Platform.select({
    ios: {
      shadowColor: COLORS.shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 16
    },
    android: {
      elevation: 3
    },
    default: {
      boxShadow: '0 2px 3px rgba(73,40,110,0.05), 0 9px 22px rgba(73,40,110,0.085)'
    } as ViewStyle
  }) as ViewStyle,
  raised: Platform.select({
    ios: {
      shadowColor: COLORS.violetDeep,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 18
    },
    android: {
      elevation: 6
    },
    default: {
      boxShadow: '0 4px 0 rgba(78,44,141,0.11), 0 10px 20px rgba(67,35,126,0.13)'
    } as ViewStyle
  }) as ViewStyle,
  tabBar: Platform.select({
    ios: {
      shadowColor: COLORS.shadowColor,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 18
    },
    android: {
      elevation: 10
    },
    default: {
      boxShadow: '0 -4px 24px rgba(48,35,77,0.10)'
    } as ViewStyle
  }) as ViewStyle
};

/**
 * Bundled Verbarium 48-Asset Precision Visual Kit & Brand Art
 * Synced deterministically via `scripts/sync-mobile-kit.mjs`.
 */
export const KIT_ASSETS: Record<string, ImageSourcePropType> = {
  appLogo: require('../../assets/verbarium/app_logo_icon.png'),
  bookOpen: require('../../assets/verbarium/book_open_isolated.png'),
  foxWaving: require('../../assets/verbarium/fox_waving.webp'),
  foxWelcome: require('../../assets/verbarium/fox_welcome.webp'),
  foxReading: require('../../assets/verbarium/fox_reading.webp'),
  foxTeacher: require('../../assets/verbarium/fox_teacher.webp'),
  streakFlame: require('../../assets/verbarium/reward_streak_flame.webp'),
  xpGem: require('../../assets/verbarium/reward_xp_gem.webp'),
  medal: require('../../assets/verbarium/reward_medal.webp'),
  chest: require('../../assets/verbarium/reward_chest.webp'),
  lessonBook: require('../../assets/verbarium/lesson_book.webp'),
  dialogBubble: require('../../assets/verbarium/dialog_bubble.webp'),
  bgDashboard: require('../../assets/verbarium/background_dashboard.webp'),
  bgJourney: require('../../assets/verbarium/background_journey.webp'),
  bgOnboarding: require('../../assets/verbarium/background_onboarding.webp'),
  bgStudy: require('../../assets/verbarium/background_study.webp'),
  bgReward: require('../../assets/verbarium/background_reward.webp'),
  iconFlame: require('../../assets/verbarium/icon_flame_tile.png'),
  iconCoin: require('../../assets/verbarium/icon_coin_tile.png'),
  iconBook: require('../../assets/verbarium/icon_book_tile.png'),
  iconChart: require('../../assets/verbarium/icon_chart_tile.png'),
  iconGift: require('../../assets/verbarium/icon_gift_tile.png'),
  iconLightning: require('../../assets/verbarium/icon_lightning_tile.png'),
  iconPlay: require('../../assets/verbarium/icon_play_tile.png'),
  iconLockedAward: require('../../assets/verbarium/icon_locked_award_tile.png')
};
