import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'assets','packed','lesson-worlds-assets.json');
const entries=JSON.parse(await readFile(source,'utf8'));
if(!Array.isArray(entries)||entries.length!==54)throw Error('Verbarium Worlds: expected 54 source entries');
const seen=new Set();
for(const entry of entries){
 const name=String(entry.path||'').replaceAll('\\','/');
 if(!/^public\/(verbarium-lessons|verbarium-worlds)\/[a-z0-9_./-]+$/.test(name)||name.split('/').includes('..')||seen.has(name))throw Error('Invalid worlds path '+name);
 seen.add(name);
 if(typeof entry.base64!=='string'||!entry.base64.length)throw Error('Invalid base64 content '+name);
 const buffer=Buffer.from(entry.base64,'base64');
 if(name.endsWith('.webp')&&(buffer.toString('ascii',0,4)!=='RIFF'||buffer.toString('ascii',8,12)!=='WEBP'))throw Error('Not a WebP '+name);
 const abs=path.resolve(root,name);
 if(!abs.startsWith(path.join(root,'public')+path.sep))throw Error('Unsafe asset destination');
 await mkdir(path.dirname(abs),{recursive:true});
 await writeFile(abs,buffer);
}
const lesson=JSON.parse(await readFile(path.join(root,'public','verbarium-lessons','manifest.json'),'utf8'));
const world=JSON.parse(await readFile(path.join(root,'public','verbarium-worlds','manifest.json'),'utf8'));
if(lesson.asset_count!==40||world.worlds.length!==4||world.ranks.length!==8)throw Error('Incomplete Verbarium worlds package');
console.info('Verbarium Worlds: installed 40 lesson sprites, 8 rank insignias and 4 backgrounds');
