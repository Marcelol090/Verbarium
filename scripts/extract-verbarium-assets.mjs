/**
 * Materialize the original Verbarium asset/motion binary packs before Vite.
 * Source packs are grouped for transport; output assets are individual public
 * PNG, SVG and animated WebP files. This script does not mutate progress data.
 */
import {readFile,mkdir,writeFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'assets','packed');
const validPrefix=['public/verbarium-assets/extra-80/','public/verbarium-motion/'];
const files=(await readdir(source)).filter(n=>/^bridge_\d\d\.json$/.test(n)).sort();
if(files.length!==19)throw new Error('Expected 19 packaged asset shards; found '+files.length);
const seen=new Set();
let bytes=0;
for(const file of files){
 const entries=JSON.parse(await readFile(path.join(source,file),'utf8'));
 if(!Array.isArray(entries))throw new TypeError('Invalid asset shard '+file);
 for(const entry of entries){
  const target=entry?.path;
  if(typeof target!=='string'||!validPrefix.some(prefix=>target.startsWith(prefix))||
    !/^[a-zA-Z0-9_./-]+\.(?:png|svg|webp)$/.test(target)||target.split('/').includes('..')||
    seen.has(target))throw new Error('Unsafe or duplicate asset: '+target);
  if(typeof entry.base64!=='string'||!/^[a-zA-Z0-9+/]*={0,2}$/.test(entry.base64))
    throw new Error('Invalid encoded asset: '+target);
  const buffer=Buffer.from(entry.base64,'base64');
  if(buffer.length<50||buffer.length>10_000_000)throw new Error('Invalid asset size: '+target);
  const destination=path.resolve(root,target);
  if(!destination.startsWith(path.resolve(root,'public')+path.sep))throw new Error('Outside public: '+target);
  await mkdir(path.dirname(destination),{recursive:true});
  await writeFile(destination,buffer);
  bytes+=buffer.length;
  seen.add(target);
 }
}
if(seen.size!==297)throw new Error('Expected 297 individual assets, extracted '+seen.size);
console.info('Verbarium: '+seen.size+' separated assets/motions ready ('+(bytes/1e6).toFixed(1)+' MB).');
