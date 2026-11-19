/**
 * Verbarium WebUSB Direct ADB Installer
 * Connects directly from Chrome/Edge on the user's local Desktop to a physical
 * Android smartphone over USB cable (interface 0xFF / 0x42 / 0x01), performs
 * the 24-byte AOSP ADB handshake (CNXN + RSA-2048 AUTH), streams
 * /apk/verbarium-mobile.apk via `exec:cmd package install -r -S <bytes>`,
 * and launches `com.verbarium.app/.MainActivity`.
 */

export const ADB_USB_FILTER = Object.freeze({
  classCode: 0xff,
  subclassCode: 0x42,
  protocolCode: 0x01
});

export const ADB_CMD = Object.freeze({
  SYNC: 0x434e5953,
  CNXN: 0x4e584e43,
  AUTH: 0x48545541,
  OPEN: 0x4e45504f,
  OKAY: 0x59414b4f,
  CLSE: 0x45534c43,
  WRTE: 0x45545257
});

export const ADB_VERSION = 0x01000000;
export const ADB_MAXDATA = 256 * 1024;
export const ADB_AUTH_TOKEN = 1;
export const ADB_AUTH_SIGNATURE = 2;
export const ADB_AUTH_RSAPUBLICKEY = 3;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function toUint8Array(payload) {
  if (!payload) return new Uint8Array(0);
  if (payload instanceof Uint8Array) return payload;
  if (payload instanceof ArrayBuffer) return new Uint8Array(payload);
  if (ArrayBuffer.isView(payload)) {
    return new Uint8Array(payload.buffer, payload.byteOffset, payload.byteLength);
  }
  if (typeof payload === 'string') return textEncoder.encode(payload);
  throw new TypeError('Payload inválido para pacote ADB');
}

export function computeAdbChecksum(bytes) {
  const data = toUint8Array(bytes);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum = (sum + data[i]) >>> 0;
  }
  return sum >>> 0;
}

/**
 * Encodes a 24-byte AOSP ADB packet header and returns { header, payload, packet }.
 */
export function encodeAdbPacket(command, arg0 = 0, arg1 = 0, payload = null) {
  const data = toUint8Array(payload);
  const headerBuffer = new ArrayBuffer(24);
  const view = new DataView(headerBuffer);
  const cmd = command >>> 0;
  const magic = (cmd ^ 0xffffffff) >>> 0;
  const checksum = computeAdbChecksum(data);

  view.setUint32(0, cmd, true);
  view.setUint32(4, arg0 >>> 0, true);
  view.setUint32(8, arg1 >>> 0, true);
  view.setUint32(12, data.byteLength >>> 0, true);
  view.setUint32(16, checksum, true);
  view.setUint32(20, magic, true);

  const header = new Uint8Array(headerBuffer);
  const packet = new Uint8Array(24 + data.byteLength);
  packet.set(header, 0);
  packet.set(data, 24);

  return {
    command: cmd,
    arg0: arg0 >>> 0,
    arg1: arg1 >>> 0,
    dataLength: data.byteLength,
    dataCheck: checksum,
    magic,
    header,
    payload: data,
    packet
  };
}

/**
 * Decodes a 24-byte AOSP ADB header (and optional payload).
 */
export function decodeAdbPacket(headerOrPacket, externalPayload = null) {
  const raw = toUint8Array(headerOrPacket);
  if (raw.byteLength < 24) {
    throw new Error(`Cabeçalho ADB inválido: esperado 24 bytes, recebido ${raw.byteLength}`);
  }
  const view = new DataView(raw.buffer, raw.byteOffset, 24);
  const command = view.getUint32(0, true);
  const arg0 = view.getUint32(4, true);
  const arg1 = view.getUint32(8, true);
  const dataLength = view.getUint32(12, true);
  const dataCheck = view.getUint32(16, true);
  const magic = view.getUint32(20, true);

  if (((command ^ 0xffffffff) >>> 0) !== magic) {
    throw new Error(`Magic ADB inválido para comando 0x${command.toString(16)}`);
  }

  const payload = externalPayload
    ? toUint8Array(externalPayload)
    : raw.byteLength > 24
      ? raw.subarray(24, 24 + dataLength)
      : new Uint8Array(0);

  const cmdChars = String.fromCharCode(
    command & 0xff,
    (command >> 8) & 0xff,
    (command >> 16) & 0xff,
    (command >> 24) & 0xff
  );

  return {
    command,
    commandName: cmdChars,
    arg0,
    arg1,
    dataLength,
    dataCheck,
    magic,
    payload
  };
}

function bytesToBigInt(bytes) {
  let result = 0n;
  for (let i = 0; i < bytes.length; i++) {
    result = (result << 8n) | BigInt(bytes[i]);
  }
  return result;
}

function modInverse2Pow32(a) {
  // Extended Euclidean algorithm for inverse modulo 2^32
  const m = 1n << 32n;
  let t = 0n;
  let newT = 1n;
  let r = m;
  let newR = a % m;

  while (newR !== 0n) {
    const q = r / newR;
    [t, newT] = [newT, t - q * newT];
    [r, newR] = [newR, r - q * newR];
  }
  if (r > 1n) throw new Error('Módulo RSA par inválido');
  if (t < 0n) t += m;
  return t;
}

function toBase64(bytes) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Encodes an RSA-2048 modulus (256 bytes big-endian) + exponent into Android's
 * 524-byte RSAPublicKey struct and formats it as `<base64> verbarium@webusb\0`.
 */
export function encodeAndroidRsaPublicKey(modulusBytes, exponent = 65537, comment = 'verbarium@webusb') {
  const mod = toUint8Array(modulusBytes);
  const normalized = mod.length === 257 && mod[0] === 0 ? mod.subarray(1) : mod;
  if (normalized.length !== 256) {
    throw new Error(`Chave RSA-2048 requer módulo de 256 bytes (recebido ${normalized.length})`);
  }

  const n = bytesToBigInt(normalized);
  if ((n & 1n) === 0n) {
    throw new Error('Módulo RSA deve ser ímpar');
  }

  const wordBase = 1n << 32n;
  const n0 = n % wordBase;
  const n0inv = (wordBase - modInverse2Pow32(n0)) % wordBase;
  const r = 1n << 2048n;
  const rr = (r * r) % n;

  const structBuffer = new ArrayBuffer(524);
  const view = new DataView(structBuffer);

  // len = 64 (uint32 words for 2048-bit key)
  view.setUint32(0, 64, true);
  view.setUint32(4, Number(n0inv), true);

  let tempN = n;
  for (let i = 0; i < 64; i++) {
    view.setUint32(8 + i * 4, Number(tempN & 0xffffffffn), true);
    tempN >>= 32n;
  }

  let tempRR = rr;
  for (let i = 0; i < 64; i++) {
    view.setUint32(264 + i * 4, Number(tempRR & 0xffffffffn), true);
    tempRR >>= 32n;
  }

  view.setUint32(520, exponent >>> 0, true);

  const structBytes = new Uint8Array(structBuffer);
  const b64 = toBase64(structBytes);
  const formatted = `${b64} ${comment}\0`;
  return {
    structBytes,
    base64: b64,
    formatted,
    payloadBytes: textEncoder.encode(formatted)
  };
}

function base64UrlToUint8Array(b64url) {
  const padded = b64url.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64url.length + 3) % 4);
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(padded, 'base64'));
  }
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// SHA-1 DigestInfo ASN.1 prefix used by ADB AUTH TOKEN RSA signature
const SHA1_DIGEST_INFO_PREFIX = new Uint8Array([
  0x30, 0x21, 0x30, 0x09, 0x06, 0x05, 0x2b, 0x0e,
  0x03, 0x02, 0x1a, 0x05, 0x00, 0x04, 0x14
]);

function signAdbTokenPrehashed(token20Bytes, jwkPrivateKey) {
  const n = bytesToBigInt(base64UrlToUint8Array(jwkPrivateKey.n));
  const d = bytesToBigInt(base64UrlToUint8Array(jwkPrivateKey.d));
  const k = 256;
  const tLen = SHA1_DIGEST_INFO_PREFIX.length + token20Bytes.length;
  const psLen = k - tLen - 3;
  const em = new Uint8Array(k);
  em[0] = 0x00;
  em[1] = 0x01;
  em.fill(0xff, 2, 2 + psLen);
  em[2 + psLen] = 0x00;
  em.set(SHA1_DIGEST_INFO_PREFIX, 3 + psLen);
  em.set(token20Bytes, 3 + psLen + SHA1_DIGEST_INFO_PREFIX.length);

  let base = bytesToBigInt(em);
  let exp = d;
  let result = 1n;
  base %= n;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % n;
    exp >>= 1n;
    base = (base * base) % n;
  }

  const sig = new Uint8Array(256);
  for (let i = 255; i >= 0; i--) {
    sig[i] = Number(result & 0xffn);
    result >>= 8n;
  }
  return sig;
}

async function getOrCreateAdbKeyPair() {
  const storageKey = 'verbarium.webusb.adb.rsa2048.v1';
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.n && parsed.d) return parsed;
    }
  } catch {
    // ignore storage errors
  }

  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: 'SHA-256'
    },
    true,
    ['sign', 'verify']
  );

  const jwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
  try {
    localStorage.setItem(storageKey, JSON.stringify(jwk));
  } catch {
    // ignore storage errors
  }
  return jwk;
}

function findAdbInterfaceAndEndpoints(device) {
  const configurations = device.configurations || (device.configuration ? [device.configuration] : []);
  for (const config of configurations) {
    for (const iface of config.interfaces || []) {
      for (const alt of iface.alternates || []) {
        if (
          alt.interfaceClass === ADB_USB_FILTER.classCode &&
          alt.interfaceSubclass === ADB_USB_FILTER.subclassCode &&
          alt.interfaceProtocol === ADB_USB_FILTER.protocolCode
        ) {
          const epIn = (alt.endpoints || []).find(e => e.direction === 'in' && e.type === 'bulk');
          const epOut = (alt.endpoints || []).find(e => e.direction === 'out' && e.type === 'bulk');
          if (epIn && epOut) {
            return {
              configurationValue: config.configurationValue,
              interfaceNumber: iface.interfaceNumber,
              alternateSetting: alt.alternateSetting,
              endpointIn: epIn.endpointNumber,
              endpointOut: epOut.endpointNumber,
              packetSize: epOut.packetSize || 512
            };
          }
        }
      }
    }
  }
  throw new Error('Interface ADB (0xFF/0x42/0x01) não encontrada no dispositivo USB selecionado.');
}

async function sendAdbPacket(device, epOut, command, arg0, arg1, payload = null) {
  const pkt = encodeAdbPacket(command, arg0, arg1, payload);
  await device.transferOut(epOut, pkt.header);
  if (pkt.payload.byteLength > 0) {
    await device.transferOut(epOut, pkt.payload);
  }
  return pkt;
}

async function readAdbPacket(device, epIn) {
  const headerRes = await device.transferIn(epIn, 24);
  if (!headerRes.data || headerRes.data.byteLength < 24) {
    throw new Error('Resposta USB ADB truncada ao ler cabeçalho de 24 bytes.');
  }
  const headerBytes = new Uint8Array(
    headerRes.data.buffer,
    headerRes.data.byteOffset,
    headerRes.data.byteLength
  );
  const head = decodeAdbPacket(headerBytes);
  if (head.dataLength === 0) {
    return head;
  }
  const payloadChunks = new Uint8Array(head.dataLength);
  let offset = 0;
  while (offset < head.dataLength) {
    const remaining = head.dataLength - offset;
    const res = await device.transferIn(epIn, remaining);
    if (!res.data || res.data.byteLength === 0) break;
    const chunk = new Uint8Array(res.data.buffer, res.data.byteOffset, res.data.byteLength);
    payloadChunks.set(chunk.subarray(0, Math.min(chunk.length, remaining)), offset);
    offset += chunk.length;
  }
  return decodeAdbPacket(headerBytes, payloadChunks);
}

/**
 * Installs /apk/verbarium-mobile.apk directly from the browser onto a USB-connected
 * Android phone via WebUSB ADB and launches com.verbarium.app/.MainActivity.
 */
export async function installApkOverWebUsb({
  apkUrl = '/apk/verbarium-mobile.apk',
  onStatus = () => {},
  onProgress = () => {}
} = {}) {
  if (typeof navigator === 'undefined' || !navigator.usb) {
    throw new Error(
      'WebUSB não está disponível neste navegador. Use Google Chrome ou Microsoft Edge no Desktop com o celular conectado via cabo USB.'
    );
  }

  onStatus('🔌 Solicitando acesso à porta USB física (filtro ADB 0xFF/0x42/0x01)...');
  onProgress(5);

  const device = await navigator.usb.requestDevice({
    filters: [ADB_USB_FILTER]
  });

  onStatus(`📱 Dispositivo selecionado: ${device.productName || 'Android USB'} (${device.manufacturerName || 'OEM'})`);
  onProgress(12);

  await device.open();
  const adbIface = findAdbInterfaceAndEndpoints(device);

  if (!device.configuration || device.configuration.configurationValue !== adbIface.configurationValue) {
    await device.selectConfiguration(adbIface.configurationValue);
  }

  try {
    await device.claimInterface(adbIface.interfaceNumber);
  } catch (err) {
    throw new Error(
      `Não foi possível reivindicar a interface USB ADB. Se o daemon 'adb' estiver rodando no seu PC local, execute 'adb kill-server' no seu PC ou feche o Android Studio e tente novamente. (${err.message})`
    );
  }

  if (adbIface.alternateSetting !== 0) {
    await device.selectAlternateInterface(adbIface.interfaceNumber, adbIface.alternateSetting);
  }

  try {
    onStatus('🤝 Iniciando handshake ADB de 24 bytes (CNXN)...');
    onProgress(22);

    const banner = textEncoder.encode('host::features=cmd,shell_v2,stat_v2\0');
    await sendAdbPacket(device, adbIface.endpointOut, ADB_CMD.CNXN, ADB_VERSION, ADB_MAXDATA, banner);

    let pkt = await readAdbPacket(device, adbIface.endpointIn);
    if (pkt.command === ADB_CMD.AUTH && pkt.arg0 === ADB_AUTH_TOKEN) {
      const jwk = await getOrCreateAdbKeyPair();
      const modulusBytes = base64UrlToUint8Array(jwk.n);
      const signature = signAdbTokenPrehashed(pkt.payload, jwk);

      onStatus('🔐 Assinando token ADB com chave RSA-2048 local...');
      await sendAdbPacket(device, adbIface.endpointOut, ADB_CMD.AUTH, ADB_AUTH_SIGNATURE, 0, signature);

      pkt = await readAdbPacket(device, adbIface.endpointIn);
      if (pkt.command === ADB_CMD.AUTH && pkt.arg0 === ADB_AUTH_TOKEN) {
        onStatus('📲 Confirme na tela do seu celular: toque em "Permitir depuração USB"...');
        const pubKey = encodeAndroidRsaPublicKey(modulusBytes, 65537, 'verbarium@webusb');
        await sendAdbPacket(
          device,
          adbIface.endpointOut,
          ADB_CMD.AUTH,
          ADB_AUTH_RSAPUBLICKEY,
          0,
          pubKey.payloadBytes
        );
        pkt = await readAdbPacket(device, adbIface.endpointIn);
      }
    }

    if (pkt.command !== ADB_CMD.CNXN) {
      throw new Error(`Handshake ADB não autorizado pelo aparelho (resposta: ${pkt.commandName}).`);
    }

    const maxData = Math.min(pkt.arg1 || 65536, 65536);
    onStatus(`📦 Baixando pacote assinado ${apkUrl}...`);
    onProgress(35);

    const response = await fetch(apkUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Falha ao carregar APK (${response.status} ${response.statusText})`);
    }
    const apkBytes = new Uint8Array(await response.arrayBuffer());
    const sizeKb = (apkBytes.byteLength / 1024).toFixed(1);

    onStatus(`⚡ Transferindo ${sizeKb} KB via cabo USB (exec:cmd package install -r -S ${apkBytes.byteLength})...`);
    onProgress(45);

    const localId = 1;
    const installCmd = textEncoder.encode(`exec:cmd package install -r -S ${apkBytes.byteLength}\0`);
    await sendAdbPacket(device, adbIface.endpointOut, ADB_CMD.OPEN, localId, 0, installCmd);

    let streamPkt = await readAdbPacket(device, adbIface.endpointIn);
    if (streamPkt.command !== ADB_CMD.OKAY) {
      throw new Error(`Falha ao abrir sessão package install no Android (${streamPkt.commandName})`);
    }
    const remoteId = streamPkt.arg0;

    let offset = 0;
    while (offset < apkBytes.byteLength) {
      const end = Math.min(offset + maxData, apkBytes.byteLength);
      const slice = apkBytes.subarray(offset, end);
      await sendAdbPacket(device, adbIface.endpointOut, ADB_CMD.WRTE, localId, remoteId, slice);
      const ack = await readAdbPacket(device, adbIface.endpointIn);
      if (ack.command === ADB_CMD.WRTE) {
        await sendAdbPacket(device, adbIface.endpointOut, ADB_CMD.OKAY, localId, remoteId);
      } else if (ack.command !== ADB_CMD.OKAY) {
        throw new Error(`Interrupção durante transmissão USB (${ack.commandName})`);
      }
      offset = end;
      const pct = 45 + Math.round((offset / apkBytes.byteLength) * 40);
      onProgress(pct);
    }

    let installResult = '';
    for (let i = 0; i < 12; i++) {
      const resPkt = await readAdbPacket(device, adbIface.endpointIn);
      if (resPkt.command === ADB_CMD.WRTE) {
        installResult += textDecoder.decode(resPkt.payload);
        await sendAdbPacket(device, adbIface.endpointOut, ADB_CMD.OKAY, localId, remoteId);
        if (installResult.includes('Success') || installResult.includes('Failure')) break;
      } else if (resPkt.command === ADB_CMD.CLSE) {
        await sendAdbPacket(device, adbIface.endpointOut, ADB_CMD.CLSE, localId, remoteId);
        break;
      }
    }

    if (installResult.includes('Failure')) {
      throw new Error(`O instalador do Android retornou erro: ${installResult.trim()}`);
    }

    onStatus('🚀 Iniciando com.verbarium.app/.MainActivity na tela do seu aparelho...');
    onProgress(92);

    const launchLocalId = 2;
    const launchCmd = textEncoder.encode('shell:am start -n com.verbarium.app/.MainActivity\0');
    await sendAdbPacket(device, adbIface.endpointOut, ADB_CMD.OPEN, launchLocalId, 0, launchCmd);
    const launchPkt = await readAdbPacket(device, adbIface.endpointIn);
    if (launchPkt.command === ADB_CMD.OKAY || launchPkt.command === ADB_CMD.WRTE) {
      await sendAdbPacket(device, adbIface.endpointOut, ADB_CMD.CLSE, launchLocalId, launchPkt.arg0);
    }

    onProgress(100);
    onStatus(`✔ APK (${sizeKb} KB) instalado via cabo USB e Verbarium iniciado no seu celular!`);

    return {
      installed: true,
      apkSizeBytes: apkBytes.byteLength,
      apkSizeKb: sizeKb,
      deviceName: device.productName || 'Android USB',
      packageName: 'com.verbarium.app',
      activity: 'com.verbarium.app/.MainActivity'
    };
  } finally {
    try {
      await device.releaseInterface(adbIface.interfaceNumber);
      await device.close();
    } catch {
      // ignore close errors
    }
  }
}

export function renderWebUsbInstallerBanner() {
  return `<section class="vb-webusb-card" aria-label="Instalação direta de APK via Cabo USB WebUSB">
    <div class="vb-webusb-head">
      <div class="vb-webusb-intro">
        <span class="vb-webusb-art" aria-hidden="true">
          <img src="/verbarium-visual-kit/assets/mascot/fox_teacher.webp" width="72" height="72" alt="" loading="lazy" decoding="async">
        </span>
        <div class="vb-webusb-copy">
          <span class="eyebrow">⚡ CABO USB DIRETO · WEBUSB ADB (0xFF/0x42/0x01)</span>
          <h2>Instale e teste no seu celular via USB</h2>
          <p>Envie o pacote assinado <code>/apk/verbarium-mobile.apk</code> diretamente do Chrome/Edge para a porta USB do seu aparelho e inicie <code>com.verbarium.app/.MainActivity</code> automaticamente.</p>
        </div>
      </div>
      <div class="vb-webusb-actions">
        <button type="button" class="primary-action vb-webusb-btn" data-action="webusb-install-apk">
          ⚡ Instalar APK Agora via Cabo USB (WebUSB Direto)
        </button>
        <div class="vb-webusb-secondary-row">
          <a class="secondary-action vb-apk-download-link" href="/apk/verbarium-mobile.apk" download="verbarium-mobile.apk">
            ⬇ Baixar APK (v1+v2+v3)
          </a>
          <a class="secondary-action vb-studio-sim-link" href="/ui-kit/precision-v8/?device=360">
            📱 Simulador Mobile 1:1 ↗
          </a>
        </div>
      </div>
    </div>
    <div class="vb-webusb-progress-wrap" id="vb-webusb-progress-wrap" hidden>
      <div class="vb-webusb-progress-bar"><i id="vb-webusb-progress-fill" style="width:0%"></i></div>
      <p class="vb-webusb-status" id="vb-webusb-status" role="status" aria-live="polite"></p>
    </div>
  </section>`;
}

export function bindWebUsbInstaller(root = document) {
  if (!root || root.__vbWebUsbBound) return;
  root.__vbWebUsbBound = true;

  root.addEventListener('click', async event => {
    const btn = event.target.closest('[data-action="webusb-install-apk"]');
    if (!btn) return;
    event.preventDefault();

    const scope = btn.closest('.vb-webusb-card') || document;
    const wrap = scope.querySelector('.vb-webusb-progress-wrap') || document.querySelector('#vb-webusb-progress-wrap');
    const fill = scope.querySelector('.vb-webusb-progress-bar i') || document.querySelector('#vb-webusb-progress-fill');
    const status = scope.querySelector('.vb-webusb-status') || document.querySelector('#vb-webusb-status');

    if (wrap) wrap.hidden = false;
    btn.disabled = true;

    const setStatus = msg => {
      if (status) status.textContent = msg;
    };
    const setProgress = pct => {
      if (fill) fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    };

    try {
      await installApkOverWebUsb({
        apkUrl: '/apk/verbarium-mobile.apk',
        onStatus: setStatus,
        onProgress: setProgress
      });
    } catch (err) {
      setStatus(`⚠️ ${err.message || 'Falha na conexão WebUSB ADB.'}`);
    } finally {
      btn.disabled = false;
    }
  });
}

if (typeof window !== 'undefined') {
  window.installApkOverWebUsb = installApkOverWebUsb;
  window.encodeAndroidRsaPublicKey = encodeAndroidRsaPublicKey;
}
