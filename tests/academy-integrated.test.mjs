import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_UNITS,ACTIVITY_TYPES} from '../public/academy/course-data.js';
import {defaultProgress,checkAnswer,dueReviews,updateReview,addDays,streak,earnXp,importTeacherPack,isUnlocked,normalize} from '../public/academy/academy-model.js';

const html=readFileSync(new URL('../public/academy/index.html',import.meta.url),'utf8');
const runtime=readFileSync(new URL('../public/academy/academy.js',import.meta.url),'utf8');

test('Academy is a standalone modular experience connected to the teacher Studio',()=>{
 assert.match(html,/Verbarium Academy/);
 assert.match(html,/id="bottom-nav"/);
 assert.match(html,/id="teacher-import"/);
 assert.match(html,/type="module" src="\.\/academy\.js"/);
 assert.match(runtime,/\/studio\//);
 assert.match(runtime,/speechSynthesis/);
 assert.ok(DEFAULT_UNITS.length>0);
});

test('Curriculum models A1 through B1 and nine reusable exercise formats',()=>{
 assert.equal(DEFAULT_UNITS.length,5);
 assert.deepEqual([...new Set(DEFAULT_UNITS.map(x=>x.level))],['A1','A2','B1']);
 const formats=new Set(DEFAULT_UNITS.flatMap(x=>x.tasks.map(t=>t.type)));
 for(const type of ACTIVITY_TYPES)assert.ok(formats.has(type),type);
});

test('Lesson unlocks and sentence normalization use independent model exports',()=>{
 const p=defaultProgress(),u=DEFAULT_UNITS;
 assert.equal(isUnlocked(p,u[0].id),true);
 assert.equal(isUnlocked(p,u[1].id),false);
 p.completed[u[0].id]={score:90};
 assert.equal(isUnlocked(p,u[1].id),true);
 const sentence=u[0].tasks.find(t=>t.type==='arrange');
 assert.equal(checkAnswer(sentence,' I  eat an apple. '),true);
 assert.equal(checkAnswer(sentence,'I an eat apple'),false);
 assert.equal(normalize('  She  EATS.  '),'she eats');
});

test('Review timing and streaks derive from real answers and dates',()=>{
 const p=defaultProgress(),unit=DEFAULT_UNITS[0],task=unit.tasks.find(t=>t.type==='visual');
 assert.equal(updateReview(p,unit.id,task.id,true,'2026-11-11').due,'2026-11-12');
 assert.equal(updateReview(p,unit.id,task.id,true,'2026-11-12').due,'2026-11-15');
 assert.equal(updateReview(p,unit.id,task.id,false,'2026-11-15').due,'2026-11-15');
 assert.equal(dueReviews(p,'2026-11-15').length,1);
 earnXp(p,5,'2026-11-10');
 earnXp(p,7,'2026-11-11');
 assert.equal(streak(p,'2026-11-11'),2);
 assert.equal(addDays('2026-11-11',3),'2026-11-14');
});

test('Teacher lesson-pack safely imports whitelisted activity blocks',()=>{
 const p=defaultProgress();
 const count=importTeacherPack(p,{format:'verbarium.lesson-pack',schemaVersion:1,lessons:[
  {id:'demo',level:'A1',title:'Frutas',blocks:[
   {type:'intro',prompt:'Welcome!'},
   {type:'fill',prompt:'She ___ an apple.',choices:['eat','eats'],answer:'eats'}
  ]}
 ]});
 assert.equal(count,1);
 assert.equal(p.teacherUnits[0].tasks[1].type,'cloze');
 assert.equal(isUnlocked(p,p.teacherUnits[0].id),true);
});
