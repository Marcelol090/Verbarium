import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../public/academy/index.html',import.meta.url),'utf8');
const extracted=html.match(/<script>([\s\S]*?)<\/script>/);
const logic=extracted?.[1]?.split('const $=sel=>')[0];
const model=logic&&vm.runInNewContext(logic+'\n({DEFAULT_UNITS,defaultProgress,checkAnswer,dueReviews,updateReview,addDays,streak,earnXp,importTeacherPack,isUnlocked,normalize})');

test('Academy contains its own learning experience with reachable Studio bridge',()=>{
 assert.match(html,/Verbarium Academy/);
 assert.match(html,/href="\/studio\/"/);
 assert.match(html,/id="bottom-nav"/);
 assert.match(html,/id="teacher-import"/);
 assert.match(html,/speechSynthesis/);
 assert.ok(model);
});

test('Independent curriculum covers A1, A2, B1 and nine exercise formats',()=>{
 const u=model.DEFAULT_UNITS;
 assert.equal(u.length,5);
 assert.deepEqual([...new Set(u.map(x=>x.level))],['A1','A2','B1']);
 const formats=new Set(u.flatMap(x=>x.tasks.map(t=>t.type)));
 for(const t of ['intro','visual','listening','pairs','cloze','arrange','dialogue','story','speaking'])assert.ok(formats.has(t),t);
});

test('Lessons unlock only after real completion, and sentence answers are normalized',()=>{
 const p=model.defaultProgress();const u=model.DEFAULT_UNITS;
 assert.equal(model.isUnlocked(p,u[0].id),true);
 assert.equal(model.isUnlocked(p,u[1].id),false);
 p.completed[u[0].id]={score:90};assert.equal(model.isUnlocked(p,u[1].id),true);
 const sentence=u[0].tasks.find(t=>t.type==='arrange');
 assert.equal(model.checkAnswer(sentence,' I  eat an apple. '),true);
 assert.equal(model.checkAnswer(sentence,'I an eat apple'),false);
});

test('Spaced repetition and streak use actual dates and skills',()=>{
 const p=model.defaultProgress();const u=model.DEFAULT_UNITS[0],t=u.tasks.find(q=>q.type==='visual');
 assert.equal(model.updateReview(p,u.id,t.id,true,'2026-11-11').due,'2026-11-12');
 assert.equal(model.updateReview(p,u.id,t.id,true,'2026-11-12').due,'2026-11-15');
 assert.equal(model.updateReview(p,u.id,t.id,false,'2026-11-15').due,'2026-11-15');
 assert.equal(model.dueReviews(p,'2026-11-15').length,1);
 model.earnXp(p,5,'2026-11-10');model.earnXp(p,7,'2026-11-11');
 assert.equal(model.streak(p,'2026-11-11'),2);
});

test('Teacher lesson-pack uses whitelisted reusable components',()=>{
 const p=model.defaultProgress(),n=model.importTeacherPack(p,{format:'verbarium.lesson-pack',schemaVersion:1,lessons:[{id:'demo',level:'A1',title:'Frutas',blocks:[{type:'intro',prompt:'Welcome!'},{type:'fill',prompt:'She ___ an apple.',choices:['eat','eats'],answer:'eats'}]}]});
 assert.equal(n,1);
 assert.equal(p.teacherUnits[0].tasks[1].type,'cloze');
 assert.equal(model.isUnlocked(p,p.teacherUnits[0].id),true);
});
