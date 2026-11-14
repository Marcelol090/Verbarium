import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {ITEMS} from '../public/ui-kit/raster/catalog.js';
const root=resolve('public/ui-kit/raster');
const manifestPath=resolve(root,'manifest.json');
const fail=msg=>{console.error('Raster QA failed: '+msg);process.exitCode=1;};
if(!existsSync(manifestPath)){fail('manifest.json not installed. Copy the 235-asset package into public/ui-kit/raster first.');}
else{
 let m;try{m=JSON.parse(readFileSync(manifestPath,'utf8'))}catch{fail('invalid manifest JSON')}
 if(m){
  const expected=new Set(ITEMS),ids=new Set();
  if(m.count!==235||m.assets?.length!==235)fail('expected exactly 235 manifest entries');
  for(const a of m.assets||[]){
   if(!expected.has(a.id)||ids.has(a.id)){fail('unexpected/duplicate '+a.id);continue}ids.add(a.id);
   for(const [ext,hashField] of [['png','pngSha256'],['webp','webpSha256']]){
    const p=resolve(root,a.id+'.'+ext);
    if(!existsSync(p)){fail('missing '+p);continue}
    const bytes=readFileSync(p);
    if(ext==='png'&&bytes.toString('hex',0,8)!=='89504e470d0a1a0a')fail('not a PNG: '+p);
    if(ext==='webp'&&(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'))fail('not a WebP: '+p);
    if(a[hashField]&&createHash('sha256').update(bytes).digest('hex')!==a[hashField])fail('hash mismatch '+p);
   }
  }
  if(ids.size!==235)fail('registered only '+ids.size+' assets');
  if(!process.exitCode)console.log('Raster QA OK: all 235 PNGs and 235 WebPs present, signatures and hashes verified.');
 }
}
