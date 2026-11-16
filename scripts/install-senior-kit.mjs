/**
 * Verbarium Visual Kit v1 installer.
 * Uses a verified, local compressed source archive; no remote image services.
 * Contains 48 WebP illustrations and their original per-asset metadata.
 * Safe to call before dev, build, tests and preview.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const archivePath = resolve(projectRoot, 'assets/visual-kit-v1.tar.gz');
const destination = resolve(projectRoot, 'public/verbarium-kit-v1');
const stamp = resolve(destination, '.source-sha256');
const expectedSha = '4bb5771055d1a5fd198b45eb37a1409f46e01c75752c26f2ea0ab559f03eae40';

if (!existsSync(archivePath)) throw new Error(`Visual Kit bundle missing: ${archivePath}`);
const archive = readFileSync(archivePath);
const sha = createHash('sha256').update(archive).digest('hex');
if (sha !== expectedSha) throw new Error(`Visual Kit integrity error (sha256=${sha})`);
if (existsSync(stamp) && readFileSync(stamp, 'utf8').trim() === sha && existsSync(resolve(destination, 'manifest.json'))) {
  console.log('Verbarium Visual Kit: 48 assets already installed.');
  process.exit(0);
}
const tar = gunzipSync(archive);
const allowed = /^assets\/(buttons|cards|grids|backgrounds|labels|mascot|rewards)\/[a-z0-9_-]+\.webp$/;
let offset = 0;
let extracted = 0;
while (offset + 512 <= tar.length) {
  const header = tar.subarray(offset, offset + 512);
  if (header.every(byte => byte === 0)) break;
  const zero = header.indexOf(0);
  const name = header.subarray(0, zero < 0 ? 100 : zero).toString('utf8').replace(/^\.\//, '');
  const size = Number.parseInt(header.subarray(124, 136).toString('ascii').replace(/\0/g, '').trim() || '0', 8);
  const type = String.fromCharCode(header[156] || 48);
  if (!Number.isSafeInteger(size) || size < 0 || offset + 512 + size > tar.length) {
    throw new Error(`Invalid TAR member length: ${name}`);
  }
  const begin = offset + 512;
  offset = begin + Math.ceil(size / 512) * 512;
  if (type === '5' || type === 'x' || type === 'g') continue; // directory or PAX metadata
  if (type !== '0' && type !== '\0') throw new Error(`Unsupported TAR member type for ${name}`);
  if (name !== 'manifest.json' && !allowed.test(name)) throw new Error(`Unexpected path in artwork archive: ${name}`);
  const target = resolve(destination, name);
  if (!target.startsWith(destination + sep)) throw new Error(`Unsafe output path: ${name}`);
  mkdirSync(dirname(target), {recursive: true});
  writeFileSync(target, tar.subarray(begin, begin + size));
  if (name.endsWith('.webp')) extracted++;
}
const meta = JSON.parse(readFileSync(resolve(destination, 'manifest.json'), 'utf8'));
if (extracted !== 48 || Object.keys(meta.assets).length !== 48) {
  throw new Error(`Incomplete visual kit: ${extracted} WebP files, ${Object.keys(meta.assets).length} entries`);
}
for (const [id, data] of Object.entries(meta.assets)) {
  if (!allowed.test(data.path) || !existsSync(resolve(destination, data.path))) throw new Error(`Missing visual asset: ${id}`);
}
writeFileSync(stamp, sha + '\n', 'utf8');
console.log(`Verbarium Visual Kit: installed ${extracted} independent WebP assets (${meta.version}).`);
