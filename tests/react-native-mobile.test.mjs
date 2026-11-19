import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MOBILE_ASSET_FILES,
  MOBILE_SHARED_MODULES,
  syncMobileKit
} from '../scripts/sync-mobile-kit.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const MOBILE_ROOT = path.join(ROOT, 'mobile');

test('syncMobileKit copies all 25 Verbarium Visual Kit assets and 3 shared pure JS modules cleanly', () => {
  const res = syncMobileKit({ quiet: true });
  assert.equal(res.copiedAssets, MOBILE_ASSET_FILES.length);
  assert.equal(res.copiedModules, MOBILE_SHARED_MODULES.length);

  for (const [, destName] of MOBILE_ASSET_FILES) {
    const assetPath = path.join(MOBILE_ROOT, 'assets', 'verbarium', destName);
    assert.ok(fs.existsSync(assetPath), `Missing synced mobile asset: ${destName}`);
    assert.ok(fs.statSync(assetPath).size > 500, `Asset ${destName} must be non-empty`);
  }

  for (const [relSrc, destName] of MOBILE_SHARED_MODULES) {
    const srcContent = fs.readFileSync(path.join(ROOT, relSrc), 'utf8');
    const dstContent = fs.readFileSync(path.join(MOBILE_ROOT, 'src', 'shared', destName), 'utf8');
    assert.equal(dstContent, srcContent, `Shared module ${destName} must stay in sync with ${relSrc}`);
  }
});

test('mobile/app.json configures Expo Android/iOS package com.verbarium.app, permissions, and Verbarium icon', () => {
  const appJson = JSON.parse(fs.readFileSync(path.join(MOBILE_ROOT, 'app.json'), 'utf8'));
  assert.equal(appJson.expo.name, 'Verbarium');
  assert.equal(appJson.expo.scheme, 'verbarium');
  assert.equal(appJson.expo.android.package, 'com.verbarium.app');
  assert.equal(appJson.expo.ios.bundleIdentifier, 'com.verbarium.app');
  assert.ok(appJson.expo.android.permissions.includes('android.permission.RECORD_AUDIO'));
  assert.ok(fs.existsSync(path.join(MOBILE_ROOT, appJson.expo.icon)));
});

test('React Native mobile app implements all 7 core Verbarium screens and shares curriculum engine', async () => {
  const requiredScreens = [
    'src/screens/OnboardingScreen.tsx',
    'src/screens/HomeScreen.tsx',
    'src/screens/AcademyPathScreen.tsx',
    'src/screens/LessonScreen.tsx',
    'src/screens/PracticeScreen.tsx',
    'src/screens/ProgressScreen.tsx',
    'src/screens/ProfileScreen.tsx',
    'src/components/VerbariumUI.tsx',
    'src/state/VerbariumContext.tsx',
    'src/services/nativeFeedback.ts',
    'src/theme/verbariumTokens.ts',
    'App.tsx'
  ];

  for (const rel of requiredScreens) {
    const abs = path.join(MOBILE_ROOT, rel);
    assert.ok(fs.existsSync(abs), `Missing React Native module: mobile/${rel}`);
  }

  // Verify shared mobile curriculum module executes directly in Node with zero DOM dependencies
  const sharedModel = await import('../mobile/src/shared/academy-model.js');
  const sharedCourse = await import('../mobile/src/shared/course-data.js');
  const sharedLab = await import('../mobile/src/shared/lesson-core.js');

  const state = sharedModel.defaultProgress();
  const units = sharedModel.getUnits(state);
  assert.equal(units.length, sharedCourse.DEFAULT_UNITS.length);
  assert.ok(units.length >= 5, 'Mobile app must expose all 5 CEFR starter units');
  assert.equal(sharedModel.isUnlocked(state, units[0].id), true);

  const labCheck = sharedLab.gradeSentence('She eats a banana', 'She eats a banana');
  assert.equal(labCheck.ok, true);
});
