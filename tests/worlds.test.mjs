import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {chapterWorldImage,renderLessonWorld,renderRankGallery,RANK_MILESTONES} from '../src/verbarium-kit/worlds.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('four original world images and 8 milestone badges extracted',async()=>{
 const manifest=JSON.parse(await readFile(path.join(root,'public/verbarium-worlds/manifest.json'),'utf8'));
 assert.equal(manifest.worlds.length,4);assert.equal(manifest.ranks.length,8);
 for(const item of manifest.worlds){const p=path.join(root,'public',item.file.slice(1));assert.ok((await stat(p)).size>3000,item.file)}
 for(let i=1;i<=8;i++)assert.ok((await stat(path.join(root,'public/verbarium-worlds/badges/rank-'+i+'.webp'))).size>1000);
});
test('exactly 40 originals for four lessons are indexed',async()=>{
 const manifest=JSON.parse(await readFile(path.join(root,'public/verbarium-lessons/manifest.json'),'utf8'));
 assert.equal(manifest.asset_count,40);
 for(const a of manifest.assets)assert.ok((await stat(path.join(root,'public/verbarium-lessons',a.file))).size>800,a.file);
});
test('rank unlocks only on real completed lesson count',()=>{
 const none=renderRankGallery(0),four=renderRankGallery(4),all=renderRankGallery(12);
 assert.equal((none.match(/is-unlocked/g)||[]).length,0);
 assert.equal((four.match(/is-unlocked/g)||[]).length,4);
 assert.equal((all.match(/is-unlocked/g)||[]).length,8);
 assert.equal(RANK_MILESTONES.length,8);
});
test('individual lesson backgrounds do not embed score or XP',()=>{
 assert.match(chapterWorldImage('first'),/first\.webp/);
 assert.match(renderLessonWorld('present'),/time\.webp/);
 assert.doesNotMatch(renderLessonWorld('be'),/100 XP|100%/);
});

test('all twelve lessons receive an illustrated background with relevant captions',()=>{
 const ids=['be','present','questions','articles','continuous','past','prepositions','future','modals','perfect','connectors','conditional'];
 for(const id of ids){
  const html=renderLessonWorld(id);
  assert.match(html,/vb-world-lesson-banner/,id);
  assert.match(html,/\.webp/,id);
  assert.doesNotMatch(html,/undefined/,id);
 }
});

test('world CSS constrains generated lesson node artwork at narrow widths',async()=>{
 const css=await readFile(path.join(root,'src/verbarium-kit/worlds.css'),'utf8');
 assert.match(css,/\.v2-world-scene\.vb-world-with-bg \.v2-stop-btn/);
 assert.match(css,/width:76px!important;height:76px/);
 assert.match(css,/width:66px!important;height:66px/);
 assert.match(css,/object-fit:contain!important/);
});
