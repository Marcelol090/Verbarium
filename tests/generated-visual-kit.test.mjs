import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(process.cwd(),'public');
const manifest=JSON.parse(readFileSync(resolve(root,'verbarium-visual-kit/manifest.json'),'utf8'));
const read=(p)=>readFileSync(resolve(process.cwd(),p),'utf8');

test('visual kit exposes exactly 48 standalone image assets',()=>{
 assert.equal(manifest.items.length,48);
 const ids=new Set(manifest.items.map(x=>x.id));
 assert.equal(ids.size,48);
 for(const item of manifest.items){
  assert.equal(item.fit,'contain');
  assert.ok(item.path.startsWith('/verbarium-visual-kit/assets/'));
  const file=resolve(root,item.path.slice(1));
  assert.ok(existsSync(file),'Missing: '+item.path);
  const buf=readFileSync(file);
  assert.equal(buf.toString('ascii',0,4),'RIFF',item.id+' not RIFF');
  assert.equal(buf.toString('ascii',8,12),'WEBP',item.id+' not WebP');
  assert.ok(buf.length>200,'Asset is empty: '+item.id);
 }
});
test('visual assets are used in the real Verbarium screens, not just galleries',()=>{
 const app=read('src/app.js');
 const academy=read('public/academy/academy.js');
 const onboarding=read('public/verbarium-visual-kit/kit.css');
 assert.match(app,/verbarium-visual-kit\/assets\/mascot\/fox_waving\.webp/);
 assert.match(app,/renderGeneratedKitGallery/);
 assert.match(academy,/verbarium-visual-kit\/assets\/rewards\/reward_chest\.webp/);
 assert.match(academy,/verbarium-visual-kit\/assets\/mascot\/fox_reading\.webp/);
 assert.match(academy,/verbarium-visual-kit\/assets\/grids\/tile_audio_choice\.webp/);
 assert.match(onboarding,/body\[data-vb-app=onboarding\] \.ob-art::before/);
});
test('the kit uses contain for characters and does not stretch button/card art',()=>{
 const css=read('public/verbarium-visual-kit/kit.css');
 assert.doesNotMatch(css,/background-size:\s*100%\s+100%/);
 assert.doesNotMatch(css,/object-fit:\s*cover/);
 assert.match(css,/\.vbkit-media-slot img\{[^}]*object-fit:contain/);
});
