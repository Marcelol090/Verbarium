import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonKitAsset,lessonNodeArt,renderLessonFeature,renderLessonListArt,renderLessonResultArt} from '../src/verbarium-kit/lesson-kit.js';
test('all four original lesson sheets map to unique production images',()=>{
 for(const id of ['be','present','questions','articles']){
  assert.match(lessonKitAsset(id,'subject'),new RegExp('/'+id+'/subject\\.webp$'));
  assert.match(renderLessonFeature(id),new RegExp('data-vb4-asset="'+id+'/subject"'));
  assert.match(lessonNodeArt(id,'completed'),new RegExp('data-vb4-asset="'+id+'/node_completed"'));
  assert.match(renderLessonListArt(id),/vb4-lesson-thumb/);
  assert.match(renderLessonResultArt(id,true),/vb4-lesson-reward/);
 }
});
test('other lessons keep v3 assets as their stable fallback',()=>{
 assert.equal(lessonKitAsset('past','subject'),null);
 assert.equal(renderLessonFeature('past'),'');
 assert.doesNotMatch(renderLessonResultArt('past',false),/data-vb4-asset/);
});

test('original lesson node sprites are not replaced by generic v3 motions',async()=>{
 const v3=await (await import('node:fs/promises')).readFile(new URL('../src/verbarium-kit/v3-production.js',import.meta.url),'utf8');
 assert.match(v3,/if\(img\.hasAttribute\('data-vb4-asset'\)\)/);
 assert.match(v3,/vb4-node-complete-pulse/);
 assert.match(v3,/vb4-node-unlock-pulse/);
 assert.doesNotMatch(v3,/if\(img\.hasAttribute\('data-vb4-asset'\)\)continue;\s*if\(img\.hasAttribute/);
});
