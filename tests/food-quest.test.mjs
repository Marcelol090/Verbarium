import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {FOOD_QUESTIONS,FOOD_VISUALS,handleFoodQuestAction,foodQuestProgress,renderFoodQuest} from '../src/verbarium-kit/food-quest.js';
import {VISUAL_KIT_ITEMS} from '../src/verbarium-kit/visual-kit-gallery.js';
const pathname=new URL('../public/verbarium-2026-kit/manifest.json',import.meta.url);
test('the exact 70 independently named visual assets unpack with valid WebP headers',()=>{
 const manifest=JSON.parse(readFileSync(pathname,'utf8'));
 assert.equal(manifest.count,70);
 assert.equal(manifest.assets.length,70);
 const filenames=new Set(manifest.assets.map(x=>x.id));
 assert.equal(filenames.size,70);
 assert.equal(VISUAL_KIT_ITEMS.length,70);
 for(const asset of VISUAL_KIT_ITEMS){
  assert.ok(filenames.has(asset.id),'missing '+asset.id);
 }
 for(const a of manifest.assets){
  assert.match(a.path,/^\/verbarium-2026-kit\/items\/[a-z0-9_]+\.webp$/);
  const path=fileURLToPath(new URL('../public'+a.path,import.meta.url));
  const b=readFileSync(path);
  assert.ok(statSync(path).size>500,'too small '+a.id);
  assert.equal(b.toString('ascii',0,4),'RIFF');
  assert.equal(b.toString('ascii',8,12),'WEBP');
 }
});
test('10 exercises contain valid answer and no repeated question id',()=>{
 assert.equal(FOOD_QUESTIONS.length,10);
 assert.equal(new Set(FOOD_QUESTIONS.map(q=>q.id)).size,10);
 assert.equal(Object.keys(FOOD_VISUALS).length,20);
 for(const q of FOOD_QUESTIONS){
  assert.ok(q.options.length>=3);
  if(q.type!=='arrange')assert.ok(q.options.includes(q.correct),q.id);
  if(q.picture)assert.ok(FOOD_VISUALS[q.picture],q.picture);
  if(['image','audio'].includes(q.type))for(const id of q.options)assert.ok(FOOD_VISUALS[id],id);
 }
});
test('food mission starts at zero, progresses only when response verified, and does not fabricate points',()=>{
 handleFoodQuestAction('food-reset','');
 assert.equal(foodQuestProgress().index,0);
 assert.match(renderFoodQuest(),/mercado das palavras/i);
 let x=handleFoodQuestAction('food-next','');
 assert.equal(x.changed,false);
 const q=FOOD_QUESTIONS[0];
 x=handleFoodQuestAction('food-pick',q.correct);
 assert.equal(x.changed,true);
 x=handleFoodQuestAction('food-check','');
 assert.equal(x.attempt.ok,true);
 assert.equal(x.attempt.id,'food-'+q.id);
 x=handleFoodQuestAction('food-next','');
 assert.equal(x.changed,true);
 assert.equal(foodQuestProgress().index,1);
 handleFoodQuestAction('food-reset','');
 assert.equal(foodQuestProgress().index,0);
});
