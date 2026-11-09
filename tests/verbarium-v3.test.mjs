import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {renderV3Gallery,v3Asset,v3Motion} from '../src/verbarium-kit/v3-production.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const v3=path.join(root,'public','verbarium-v3');
test('original v3 catalog contains 151 individual transparent sprites and 142 independent animations',async()=>{
 const manifest=JSON.parse(await readFile(path.join(v3,'manifest.json'),'utf8'));
 assert.equal(manifest.assets.length,151);
 assert.equal(manifest.asset_count,151);
 assert.equal(manifest.motion_count,142);
 assert.equal(new Set(manifest.assets.map(x=>x.id)).size,151);
 assert.equal(manifest.assets.filter(x=>x.motion_file).length,142);
 for(const asset of manifest.assets){
  const source=await readFile(path.join(v3,asset.file));
  assert.equal(source.subarray(0,8).toString('hex'),'89504e470d0a1a0a',asset.file);
  if(asset.motion_file){
   const motion=await readFile(path.join(v3,asset.motion_file));
   assert.equal(motion.toString('ascii',0,4),'RIFF',asset.motion_file);
   assert.equal(motion.toString('ascii',8,12),'WEBP',asset.motion_file);
  }
 }
 assert.ok((await stat(path.join(v3,'runtime','verbarium-motion.mjs'))).size>1000);
});
test('runtime gallery is a semantic event-driven component, without autoplay',()=>{
 assert.match(v3Asset('mascot/ready_waving'),/verbarium-v3\/assets\/mascot\/ready_waving.png/);
 assert.match(v3Motion('journey/node_unlocked'),/verbarium-v3\/motion\/journey\/node_unlocked.webp/);
 const markup=renderV3Gallery();
 assert.match(markup,/aria-label="Biblioteca Verbarium v3"/);
 assert.match(markup,/id="vb3-search"/);
 assert.doesNotMatch(markup,/autoplay/);
});


test('v3 button/chip PNG artwork is not obscured by earlier theme image backgrounds',async()=>{
 const css=await readFile(path.join(root,'src','verbarium-kit','v3-production.css'),'utf8');
 assert.match(css,/\.hero-card \.vb-sprite-cta\.vb3-cta/);
 assert.match(css,/\.filter-row \.chip\.vb3-chip/);
 assert.match(css,/background-image:none!important/);
});
