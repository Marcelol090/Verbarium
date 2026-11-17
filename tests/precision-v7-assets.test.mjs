import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';

const root=new URL('../public/verbarium-visual-kit/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',root),'utf8'));
const expected={buttons:8,cards:6,grids:8,backgrounds:6,labels:10,mascot:4,rewards:6};

test('production kit has exactly 48 independently addressable art assets',()=>{
 assert.equal(manifest.count,48);
 assert.equal(Object.keys(manifest.assets).length,48);
 const counts={};
 for(const a of Object.values(manifest.assets))counts[a.category]=(counts[a.category]||0)+1;
 assert.deepEqual(counts,expected);
});

test('all 48 WebPs exist, preserve original SHA256 and stated dimensions',()=>{
 for(const [name,a] of Object.entries(manifest.assets)){
  assert.match(a.path,/^assets\/(?:buttons|cards|grids|backgrounds|labels|mascot|rewards)\/[a-z0-9_]+\.webp$/);
  const path=new URL(a.path,root);
  assert.ok(existsSync(path),'File missing: '+name);
  const buf=readFileSync(path);
  assert.equal(buf.length,a.bytes,'Size differs for '+name);
  assert.equal(buf.toString('ascii',0,4),'RIFF','Not RIFF '+name);
  assert.equal(buf.toString('ascii',8,12),'WEBP','Not WEBP '+name);
  assert.equal(createHash('sha256').update(buf).digest('hex'),a.sha256,'Content changed: '+name);
  if(buf.toString('ascii',12,16)==='VP8X'){
   const w=1+buf[24]+(buf[25]<<8)+(buf[26]<<16);
   const h=1+buf[27]+(buf[28]<<8)+(buf[29]<<16);
   assert.equal(w,a.width,'Width wrong for '+name);
   assert.equal(h,a.height,'Height wrong for '+name);
  }
 }
});
