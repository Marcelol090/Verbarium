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
