#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildAndroidApk } from './build-android-apk.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const PACKAGE_NAME = 'com.verbarium.app';
export const MAIN_ACTIVITY = 'com.verbarium.app/.MainActivity';
export const DEFAULT_APK_PATH = path.join(ROOT, 'public', 'apk', 'verbarium-mobile.apk');

export function findAdbBinary() {
  const candidates = [
    process.env.ADB_PATH,
    path.join(os.homedir(), '.android-sdk', 'platform-tools', 'adb'),
    '/usr/bin/adb',
    '/usr/local/bin/adb'
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  try {
    const resolved = execFileSync('which', ['adb'], { encoding: 'utf8' }).trim();
    if (resolved) return resolved;
  } catch {
    // ignore
  }
  return null;
}

export function resolveApkPath({ autoBuild = true, quiet = false } = {}) {
  if (fs.existsSync(DEFAULT_APK_PATH) && fs.statSync(DEFAULT_APK_PATH).size > 10240) {
    return DEFAULT_APK_PATH;
  }
  if (autoBuild) {
    buildAndroidApk({ quiet });
  }
  if (fs.existsSync(DEFAULT_APK_PATH)) {
    return DEFAULT_APK_PATH;
  }
  throw new Error(`APK não encontrado em ${DEFAULT_APK_PATH}`);
}

export function parseConnectedDevices(adbDevicesOutput = '') {
  const lines = String(adbDevicesOutput || '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('List of devices') && !l.startsWith('*'));

  const devices = [];
  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      const [serial, state, ...rest] = parts;
      devices.push({
        serial,
        state,
        details: rest.join(' '),
        raw: line
      });
    }
  }
  return devices;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function runUsbInstallPipeline({
  autoWait = false,
  maxRetries = 15,
  retryDelayMs = 1000,
  simulateDevice = process.env.VERBARIUM_SIMULATE_USB === '1',
  execRunner = null,
  logger = console.log
} = {}) {
  const adbBin = findAdbBinary();
  if (!adbBin && !simulateDevice) {
    throw new Error('Binário ADB não encontrado. Instale platform-tools em ~/.android-sdk/platform-tools/adb.');
  }

  const apkPath = resolveApkPath({ autoBuild: true, quiet: true });

  const runAdb = execRunner || ((args) => {
    if (simulateDevice) {
      if (args[0] === '--version') {
        return 'Android Debug Bridge version 1.0.41';
      }
      if (args[0] === 'devices') {
        return 'List of devices attached\nPIXEL8USB01          device usb:1-1 product:shiba model:Pixel_8 device:shiba transport_id:2\n';
      }
      return 'Success';
    }
    return execFileSync(adbBin, args, { encoding: 'utf8' });
  });

  const versionFirstLine = String(runAdb(['--version']) || '').split(/\r?\n/)[0].trim();
  logger(`✔ ADB detectado: ${versionFirstLine} (${adbBin || 'simulado'})`);
  logger(`✔ APK pronto:    ${apkPath}`);

  let authorized = [];
  const attempts = autoWait && !simulateDevice ? Math.max(1, maxRetries) : 1;

  for (let i = 1; i <= attempts; i++) {
    const out = runAdb(['devices', '-l']);
    const parsed = parseConnectedDevices(out);
    authorized = parsed.filter(d => d.state === 'device');
    if (authorized.length > 0) {
      break;
    }
    if (attempts > 1) {
      logger(`⏳ Aguardando conexão USB Depurada (${i}/${attempts})...`);
      if (i < attempts) {
        await sleep(retryDelayMs);
      }
    }
  }

  if (authorized.length === 0) {
    logger(`ℹ️  Nenhum smartphone Android com Depuração USB ativa foi detectado no momento.`);
    logger('');
    logger('======================================================================');
    logger('📱 VERBARIUM V12 • DEPURAÇÃO USB APURADA & INSTALAÇÃO AUTOMÁTICA DE APK');
    logger('======================================================================');
    logger('Como conectar seu smartphone Android via cabo USB (latência zero):');
    logger('  1. No celular Android, abra Configurar > Sobre o telefone e toque 7x');
    logger('     em "Número da versão" para ativar as Opções do desenvolvedor.');
    logger('  2. Em Sistema > Opções do desenvolvedor, ative "Depuração USB".');
    logger('  3. Conecte o celular ao computador via cabo USB e confirme a chave RSA');
    logger('     na tela do aparelho ("Permitir depuração USB").');
    logger('');
    logger('Comandos executados automaticamente quando o dispositivo está conectado:');
    logger(`  $ adb devices -l`);
    logger(`  $ adb install -r "${apkPath}"`);
    logger(`  $ adb reverse tcp:5173 tcp:5173`);
    logger(`  $ adb reverse tcp:4173 tcp:4173`);
    logger(`  $ adb shell am start -n ${MAIN_ACTIVITY}`);
    logger(`  $ adb shell am start -a android.intent.action.VIEW -d "http://localhost:5173/academy/"`);
    logger('');
    logger('Atalhos rápidos no Desktop:');
    logger('  • Build + Instalação Automática USB:  npm run apk:install  (ou node scripts/usb-mobile-apk.mjs --auto)');
    logger('  • Recompilar APK assinado (v1+v2+v3): npm run apk:build    (ou node scripts/build-android-apk.mjs)');
    logger('  • Instalação Direta no Navegador:     Abra /academy/ e clique em "⚡ Instalar APK Agora via Cabo USB (WebUSB Direto)"');
    logger('======================================================================');

    return {
      installed: false,
      adbBin,
      apkPath,
      device: null,
      commandsExecuted: ['adb devices -l']
    };
  }

  const target = authorized[0];
  const sArgs = ['-s', target.serial];
  const commandsExecuted = [];

  logger(`📱 Dispositivo USB conectado: ${target.serial} ${target.details}`);

  logger(`📦 Instalando APK via USB: adb install -r "${apkPath}" ...`);
  runAdb([...sArgs, 'install', '-r', apkPath]);
  commandsExecuted.push(`adb install -r "${apkPath}"`);
  logger(`✔ APK instalado com sucesso no dispositivo!`);

  for (const port of [5173, 4173]) {
    logger(`🔌 Configurando túnel reverso USB: adb reverse tcp:${port} tcp:${port}`);
    runAdb([...sArgs, 'reverse', `tcp:${port}`, `tcp:${port}`]);
    commandsExecuted.push(`adb reverse tcp:${port} tcp:${port}`);
    logger(`✔ Porta local ${port} espelhada via cabo USB com latência zero.`);
  }

  logger(`🚀 Iniciando aplicativo nativo Verbarium no celular: ${MAIN_ACTIVITY}`);
  runAdb([...sArgs, 'shell', 'am', 'start', '-n', MAIN_ACTIVITY]);
  commandsExecuted.push(`adb shell am start -n ${MAIN_ACTIVITY}`);
  logger(`✔ Aplicativo com.verbarium.app.MainActivity iniciado no celular!`);

  return {
    installed: true,
    adbBin,
    apkPath,
    device: target,
    commandsExecuted
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const args = new Set(process.argv.slice(2));
  const autoWait = args.has('--auto') || args.has('--wait');
  const simulateDevice = args.has('--simulate-usb') || process.env.VERBARIUM_SIMULATE_USB === '1';
  const maxRetries = args.has('--quick') ? 2 : 5;
  runUsbInstallPipeline({
    autoWait,
    maxRetries,
    retryDelayMs: 600,
    simulateDevice
  }).catch(err => {
    console.error('❌ Erro no pipeline ADB USB:', err.message);
    process.exitCode = 1;
  });
}
