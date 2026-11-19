#!/usr/bin/env node
/**
 * Syncs Verbarium's committed Visual Kit assets and pure JS learning logic
 * into mobile/ so the React Native (Expo) app runs standalone on Android, iOS, and Web
 * with zero duplicated business logic.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const MOBILE_ROOT = path.join(ROOT, 'mobile');

export const MOBILE_ASSET_FILES = Object.freeze([
  // Brand & tactile icons
  ['public/verbarium-assets/brand/app_logo_icon.png', 'app_logo_icon.png'],
  ['public/verbarium-assets/brand/book_open_isolated.png', 'book_open_isolated.png'],
  ['public/verbarium-assets/icons/icon_flame_tile.png', 'icon_flame_tile.png'],
  ['public/verbarium-assets/icons/icon_coin_tile.png', 'icon_coin_tile.png'],
  ['public/verbarium-assets/icons/icon_book_tile.png', 'icon_book_tile.png'],
  ['public/verbarium-assets/icons/icon_chart_tile.png', 'icon_chart_tile.png'],
  ['public/verbarium-assets/icons/icon_gift_tile.png', 'icon_gift_tile.png'],
  ['public/verbarium-assets/icons/icon_lightning_tile.png', 'icon_lightning_tile.png'],
  ['public/verbarium-assets/icons/icon_play_tile.png', 'icon_play_tile.png'],
  ['public/verbarium-assets/icons/icon_locked_award_tile.png', 'icon_locked_award_tile.png'],
  // 48-Asset Precision Visual Kit: Mascot Pip
  ['public/verbarium-visual-kit/assets/mascot/fox_waving.webp', 'fox_waving.webp'],
  ['public/verbarium-visual-kit/assets/mascot/fox_welcome.webp', 'fox_welcome.webp'],
  ['public/verbarium-visual-kit/assets/mascot/fox_reading.webp', 'fox_reading.webp'],
  ['public/verbarium-visual-kit/assets/mascot/fox_teacher.webp', 'fox_teacher.webp'],
  // 48-Asset Precision Visual Kit: Rewards & Lesson Badges
  ['public/verbarium-visual-kit/assets/rewards/reward_streak_flame.webp', 'reward_streak_flame.webp'],
  ['public/verbarium-visual-kit/assets/rewards/reward_xp_gem.webp', 'reward_xp_gem.webp'],
  ['public/verbarium-visual-kit/assets/rewards/reward_medal.webp', 'reward_medal.webp'],
  ['public/verbarium-visual-kit/assets/rewards/reward_chest.webp', 'reward_chest.webp'],
  ['public/verbarium-visual-kit/assets/rewards/lesson_book.webp', 'lesson_book.webp'],
  ['public/verbarium-visual-kit/assets/rewards/dialog_bubble.webp', 'dialog_bubble.webp'],
  // 48-Asset Precision Visual Kit: Backgrounds
  ['public/verbarium-visual-kit/assets/backgrounds/background_dashboard.webp', 'background_dashboard.webp'],
  ['public/verbarium-visual-kit/assets/backgrounds/background_journey.webp', 'background_journey.webp'],
  ['public/verbarium-visual-kit/assets/backgrounds/background_onboarding.webp', 'background_onboarding.webp'],
  ['public/verbarium-visual-kit/assets/backgrounds/background_study.webp', 'background_study.webp'],
  ['public/verbarium-visual-kit/assets/backgrounds/background_reward.webp', 'background_reward.webp']
]);

export const MOBILE_SHARED_MODULES = Object.freeze([
  ['public/academy/course-data.js', 'course-data.js'],
  ['public/academy/academy-model.js', 'academy-model.js'],
  ['public/academy/sentence-lab/lesson-core.js', 'lesson-core.js']
]);

export function syncMobileKit({ quiet = false } = {}) {
  const assetDestDir = path.join(MOBILE_ROOT, 'assets', 'verbarium');
  const sharedDestDir = path.join(MOBILE_ROOT, 'src', 'shared');

  fs.mkdirSync(assetDestDir, { recursive: true });
  fs.mkdirSync(sharedDestDir, { recursive: true });

  let copiedAssets = 0;
  for (const [relSrc, destName] of MOBILE_ASSET_FILES) {
    const absSrc = path.join(ROOT, relSrc);
    if (!fs.existsSync(absSrc)) {
      throw new Error(`Missing Verbarium visual asset for mobile sync: ${relSrc}`);
    }
    fs.copyFileSync(absSrc, path.join(assetDestDir, destName));
    copiedAssets++;
  }

  let copiedModules = 0;
  for (const [relSrc, destName] of MOBILE_SHARED_MODULES) {
    const absSrc = path.join(ROOT, relSrc);
    if (!fs.existsSync(absSrc)) {
      throw new Error(`Missing shared learning module for mobile sync: ${relSrc}`);
    }
    fs.copyFileSync(absSrc, path.join(sharedDestDir, destName));
    copiedModules++;
  }

  if (!quiet) {
    console.log(`✔ Verbarium Mobile Kit sincronizado: ${copiedAssets} assets + ${copiedModules} módulos compartilhados.`);
  }
  return { copiedAssets, copiedModules, assetDestDir, sharedDestDir };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  syncMobileKit();
}
