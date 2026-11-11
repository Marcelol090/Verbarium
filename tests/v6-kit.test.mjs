import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {V6_CATALOG,V6_ASSET_COUNT,v6Art,renderV6SkillPath,renderV6FoodReaction,renderV6Gallery,handleV6GalleryAction} from '../src/verbarium-kit/v6-kit.js';
import {V6_PAIR_STAGES,renderV6PairQuest,v6PairProgress,handleV6PairAction,resetV6PairQuest} from '../src/verbarium-kit/v6-pairs.js';
test('197 image assets and unique canonical IDs',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../public/verbarium-v6/manifest.json',import.meta.url),'utf8'));
 assert.equal(manifest.count,197);assert.equal(V6_ASSET_COUNT,197);
 const names=new Set(manifest.assets.map(a=>a.category+'/'+a.id));assert.equal(names.size,197);
 for(const [category,ids] of Object.entries(V6_CATALOG))for(const id of ids){
  const key=category+'/'+id;assert.ok(names.has(key),key);
  assert.match(v6Art(key),new RegExp('verbarium-v6/assets/'+key+'\\.webp'));
  const path=fileURLToPath(new URL('../public/verbarium-v6/assets/'+key+'.webp',import.meta.url));
  const bin=readFileSync(path);assert.ok(bin.length>250);assert.equal(bin.toString('ascii',0,4),'RIFF');assert.equal(bin.toString('ascii',8,12),'WEBP');
 }
});
test('CEFR learning path reports actual per-level counts',()=>{
 const html=renderV6SkillPath({lessons:[{id:'be',level:'A1',title:'To be'},{id:'simple',level:'A1',title:'Present Simple'},{id:'past',level:'A2',title:'Past'}],completed:['be'],foodProgress:{index:3,total:10},pairProgress:{stage:2,total:4}});
 assert.match(html,/1 de 2 aulas concluídas/);assert.match(html,/50%/);assert.match(html,/3\/10 atividades/);assert.match(html,/2\/4 níveis/);
 assert.match(html,/data-action="open-lesson"/);assert.doesNotMatch(html,/data-id="undefined"/);
});
test('Gallery exposes all categories, character reaction states change on answers',()=>{
 assert.match(renderV6Gallery(),/197 itens independentes/);
 const idle=renderV6FoodReaction({type:'audio'},null),ok=renderV6FoodReaction({type:'audio'},{ok:true}),wrong=renderV6FoodReaction({type:'audio'},{ok:false});
 assert.match(idle,/explorer_listening/);assert.match(ok,/hijab_student_celebrating/);assert.match(wrong,/hijab_student_thinking/);
 assert.equal(handleV6GalleryAction('v6-filter','characters'),true);
 assert.equal(handleV6GalleryAction('v6-select','characters/explorer_neutral'),true);
 assert.match(renderV6Gallery(),/explorer_neutral/);
});
test('Four stages cannot advance without correct pairs and sentence',()=>{
 resetV6PairQuest();assert.equal(v6PairProgress().stage,0);
 assert.equal(handleV6PairAction('v6-stage-next','').changed,false);
 const first=V6_PAIR_STAGES[0];
 assert.equal(handleV6PairAction('v6-pair-pick','left:apple').changed,true);
 const error=handleV6PairAction('v6-pair-pick','right:banana');
 assert.equal(error.matched,false);assert.equal(v6PairProgress().mistakes,1);
 for(let k=0;k<3;k++){
  const stage=V6_PAIR_STAGES[k];
  assert.match(renderV6PairQuest(),new RegExp(stage.title));
  for(const {id} of stage.left){handleV6PairAction('v6-pair-pick','left:'+id);const r=handleV6PairAction('v6-pair-pick','right:'+id);assert.equal(r.matched,true);}
  assert.equal(handleV6PairAction('v6-stage-next','').changed,true);
 }
 assert.equal(v6PairProgress().stage,3);
 const last=V6_PAIR_STAGES[3];
 for(const index of [1,4,3,0,2])handleV6PairAction('v6-word-pick',String(index));
 assert.equal(handleV6PairAction('v6-word-check','').correct,true);
 assert.equal(handleV6PairAction('v6-stage-next','').completed,true);
 assert.equal(v6PairProgress().finished,true);
 assert.match(renderV6PairQuest(),/JORNADA CONCLUÍDA/);
 resetV6PairQuest();assert.equal(v6PairProgress().stage,0);
});
