import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAndroidApk } from '../scripts/build-android-apk.mjs';
import {
  findAdbBinary,
  resolveApkPath,
  parseConnectedDevices,
  runUsbInstallPipeline
} from '../scripts/usb-mobile-apk.mjs';
import {
  ADB_USB_FILTER,
  ADB_CMD,
  ADB_VERSION,
  ADB_MAXDATA,
  encodeAdbPacket,
  decodeAdbPacket,
  encodeAndroidRsaPublicKey,
  renderWebUsbInstallerBanner
} from '../public/academy/webusb-adb-installer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

test('Native Android APK (com.verbarium.app) is compiled, zipaligned, and signed with v1+v2+v3 schemes', () => {
  const result = buildAndroidApk({ quiet: true });
  assert.ok(fs.existsSync(result.publicApkPath), 'public/apk/verbarium-mobile.apk must exist');
  assert.ok(fs.existsSync(result.distApkPath), 'dist/verbarium-mobile.apk must exist');
  assert.ok(result.sizeBytes > 50 * 1024, 'APK size must be > 50 KB');
  assert.match(result.verifyOutput, /Verified using v1 scheme \(JAR signing\): true/);
  assert.match(result.verifyOutput, /Verified using v2 scheme \(APK Signature Scheme v2\): true/);
  assert.match(result.verifyOutput, /Verified using v3 scheme \(APK Signature Scheme v3\): true/);
});

test('MainActivity.java configures fullscreen WebView, USB debugging, localhost:5173 tunnel, and offline asset fallback', () => {
  const mainActivityPath = path.join(
    ROOT,
    'android',
    'app',
    'src',
    'main',
    'java',
    'com',
    'verbarium',
    'app',
    'MainActivity.java'
  );
  const manifestPath = path.join(ROOT, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');

  const javaCode = fs.readFileSync(mainActivityPath, 'utf8');
  const manifestXml = fs.readFileSync(manifestPath, 'utf8');

  assert.match(manifestXml, /package="com\.verbarium\.app"/);
  assert.match(manifestXml, /android:name="com\.verbarium\.app\.MainActivity"/);
  assert.match(javaCode, /http:\/\/localhost:5173\/academy\//);
  assert.match(javaCode, /file:\/\/\/android_asset\/index\.html/);
  assert.match(javaCode, /WebView\.setWebContentsDebuggingEnabled\(true\)/);
});

test('usb-mobile-apk.mjs locates ADB, finds APK, and automates USB install + reverse 5173/4173 + MainActivity launch', async () => {
  const apkPath = resolveApkPath({ autoBuild: true, quiet: true });
  assert.ok(fs.existsSync(apkPath));

  const parsed = parseConnectedDevices(
    'List of devices attached\nPIXEL8USB01\tdevice usb:1-1 product:shiba model:Pixel_8 transport_id:2\n'
  );
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].serial, 'PIXEL8USB01');
  assert.equal(parsed[0].state, 'device');

  const res = await runUsbInstallPipeline({
    simulateDevice: true
  });
  assert.equal(res.installed, true);
  assert.ok(res.commandsExecuted.some(c => c.includes('adb install -r')));
  assert.ok(res.commandsExecuted.includes('adb reverse tcp:5173 tcp:5173'));
  assert.ok(res.commandsExecuted.includes('adb reverse tcp:4173 tcp:4173'));
  assert.ok(res.commandsExecuted.includes('adb shell am start -n com.verbarium.app/.MainActivity'));
});

test('WebUSB ADB 24-byte packet encoder/decoder and Android RSA-2048 public key encoder follow AOSP specification', () => {
  assert.equal(ADB_USB_FILTER.classCode, 0xff);
  assert.equal(ADB_USB_FILTER.subclassCode, 0x42);
  assert.equal(ADB_USB_FILTER.protocolCode, 0x01);

  const pkt = encodeAdbPacket(ADB_CMD.CNXN, ADB_VERSION, ADB_MAXDATA, 'host::\0');
  assert.equal(pkt.header.byteLength, 24);
  assert.equal(pkt.magic, (ADB_CMD.CNXN ^ 0xffffffff) >>> 0);

  const decoded = decodeAdbPacket(pkt.packet);
  assert.equal(decoded.command, ADB_CMD.CNXN);
  assert.equal(decoded.commandName, 'CNXN');
  assert.equal(decoded.arg0, ADB_VERSION);
  assert.equal(decoded.arg1, ADB_MAXDATA);
  assert.equal(decoded.dataLength, 7);

  // Test 2048-bit odd modulus encoding into 524-byte Android RSAPublicKey struct
  const fakeModulus = new Uint8Array(256);
  fakeModulus[0] = 0xc9;
  for (let i = 1; i < 255; i++) fakeModulus[i] = (i * 37) & 0xff;
  fakeModulus[255] = 0x7b; // odd

  const encodedKey = encodeAndroidRsaPublicKey(fakeModulus, 65537, 'verbarium@webusb');
  assert.equal(encodedKey.structBytes.byteLength, 524);
  const view = new DataView(encodedKey.structBytes.buffer);
  assert.equal(view.getUint32(0, true), 64); // 64 uint32 words
  assert.equal(view.getUint32(520, true), 65537); // exponent
  assert.ok(encodedKey.formatted.endsWith(' verbarium@webusb\0'));

  const bannerHtml = renderWebUsbInstallerBanner();
  assert.match(bannerHtml, /Instalar APK Agora via Cabo USB \(WebUSB Direto\)/);
  assert.match(bannerHtml, /\/apk\/verbarium-mobile\.apk/);
});
