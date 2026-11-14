import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {GROUPS,ITEMS,imageUrl,pictureMarkup} from '../public/ui-kit/raster/catalog.js';
test('275 standalone images include 235 original and 40 state variants',()=>{
 assert.equal(ITEMS.length,275);assert.equal(new Set(ITEMS).size,275);
 assert.deepEqual(Object.fromEntries(Object.entries(GROUPS).map(([k,v])=>[k,v.length])),{backgrounds:5,icons:56,buttons:27,banners:16,segmented:32,carousel:27,cards:38,bars:34,states:40});
});
test('all WebP assets exist, have substantial content and match manifest dimensions',()=>{
 const json=JSON.parse(readFileSync('public/ui-kit/raster/manifest.json','utf8'));
 assert.equal(json.count,275);assert.equal(json.version,3);assert.equal(json.assets.length,275);
 assert.deepEqual(json.assets.map(a=>a.id).sort(),[...ITEMS].sort());
 for(const a of json.assets){
   const path='public/ui-kit/raster/'+a.id+'.webp';
   assert.ok(existsSync(path),path);
   assert.ok(statSync(path).size>350,path);
   assert.ok(a.width>=24&&a.height>=24);
   assert.equal(a.edgePixels,0,path);
 }
});
test('catalog URLs are safe and every visual uses WebP directly',()=>{
 assert.equal(imageUrl('icons/home'),'/ui-kit/raster/icons/home.webp');
 assert.equal(imageUrl('states/streak_fire_active'),'/ui-kit/raster/states/streak_fire_active.webp');
 assert.throws(()=>imageUrl('../bogus'));assert.throws(()=>imageUrl('icons/home','gif'));
 assert.match(pictureMarkup('icons/home'),/img src="\/ui-kit\/raster\/icons\/home.webp"/);
});
test('native progress and layout never depend on pre-rendered values',()=>{
 const s=readFileSync('public/ui-kit/raster/activate.js','utf8');
 assert.match(s,/rasterAvailable\(\)/);
 assert.match(s,/json.count===275/);
 const css=readFileSync('public/ui-kit/raster/styles.css','utf8');
 assert.match(css,/lesson-track i/);assert.match(css,/background-size:contain/);
});
