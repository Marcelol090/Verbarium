import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_UNITS} from '../public/academy/course-data.js';
import {defaultProgress,checkAnswer,normalize,isUnlocked,updateReview,dayKey,addDays,dueReviews,earnXp,streak,createSession,sessionTasks,recordAnswer,finishSession,validateTeacherPack,importTeacherPack,loadProgress,REVIEW_INTERVALS} from '../public/academy/academy-model.js';

test('original curriculum covers A1, A2, B1 with nine reusable task types',()=>{
 assert.equal(DEFAULT_UNITS.length,5);assert.deepEqual(new Set(DEFAULT_UNITS.map(u=>u.level)),new Set(['A1','A2','B1']));
 const types=new Set(DEFAULT_UNITS.flatMap(u=>u.tasks.map(t=>t.type)));
 for(const type of ['intro','visual','listening','pairs','cloze','arrange','dialogue','story','speaking'])assert.ok(types.has(type));
 for(const unit of DEFAULT_UNITS){assert.ok(unit.tasks.length>=7);for(const task of unit.tasks){assert.ok(task.prompt);assert.ok(task.speech);assert.ok(task.id);}}
});
test('answer evaluation handles multiple-choice, normalized word bank and complete matching',()=>{
 const x=DEFAULT_UNITS[0].tasks;const sentence=x.find(t=>t.type==='arrange');const pair=x.find(t=>t.type==='pairs');
 assert.ok(checkAnswer(sentence,' I   eat an apple. '));assert.equal(checkAnswer(sentence,'I apple an eat'),false);
 assert.ok(checkAnswer(pair,pair.pairs.map(p=>p.join('|'))));assert.equal(checkAnswer(pair,[]),false);
 assert.ok(checkAnswer(x.find(t=>t.id==='apple'),'apple'));
});
test('locked path unlocks only after genuine completion',()=>{
 const x=defaultProgress();assert.equal(isUnlocked(x,DEFAULT_UNITS[0].id),true);assert.equal(isUnlocked(x,DEFAULT_UNITS[1].id),false);
 x.completed[DEFAULT_UNITS[0].id]={score:90};assert.equal(isUnlocked(x,DEFAULT_UNITS[1].id),true);assert.equal(isUnlocked(x,DEFAULT_UNITS[2].id),false);
});
test('review scheduling, progress and streak use actual dates and answers',()=>{
 const p=defaultProgress();const today='2026-11-11';const task=DEFAULT_UNITS[0].tasks.find(t=>t.type==='visual');
 const first=updateReview(p,DEFAULT_UNITS[0].id,task.id,true,today);assert.equal(first.due,'2026-11-12');
 const second=updateReview(p,DEFAULT_UNITS[0].id,task.id,true,'2026-11-12');assert.equal(second.due,'2026-11-15');
 const missed=updateReview(p,DEFAULT_UNITS[0].id,task.id,false,'2026-11-15');assert.equal(missed.due,'2026-11-15');
 assert.equal(dueReviews(p,'2026-11-14').length,0);assert.equal(dueReviews(p,'2026-11-15').length,1);
 earnXp(p,5,'2026-11-10');earnXp(p,12,'2026-11-11');assert.equal(streak(p,'2026-11-11'),2);
 assert.equal(addDays(today,-1),'2026-11-10');
});
test('teacher-created studio JSON can be safely imported as learning activities',()=>{
 const p=defaultProgress();const payload={format:'verbarium.lesson-pack',schemaVersion:1,lessons:[{id:'studio-1',level:'A1',title:'Frutas',blocks:[{type:'intro',id:'a',prompt:'Welcome'},{type:'fill',id:'b',prompt:'She ___ milk.',choices:['drink','drinks'],answer:'drinks'},{type:'pairs',id:'c',prompt:'Pairs',pairs:[['Maçã','Apple'],['Leite','Milk']]}]}]};
 assert.equal(importTeacherPack(p,payload),1);const unit=p.teacherUnits[0];assert.equal(unit.tasks[1].type,'cloze');assert.equal(unit.tasks[2].type,'pairs');assert.ok(isUnlocked(p,unit.id));
 assert.throws(()=>validateTeacherPack({...payload,schemaVersion:3}));
 assert.equal(loadProgress('{broken').xp,0);
});
test('lesson session computes grade from actual first attempts, never fake CEFR certification',()=>{
 const p=defaultProgress(),u=DEFAULT_UNITS[0],s=createSession(u.id);const count=u.tasks.filter(t=>['visual','listening','pairs','cloze','arrange','dialogue','story'].includes(t.type)).length;
 s.firstAttempts=count;s.firstCorrect=count-1;for(let i=0;i<count;i++)recordAnswer(p,u,u.tasks.find(t=>t.type==='visual'),i>0);
 const r=finishSession(p,s);assert.equal(r.score,Math.round(100*(count-1)/count));assert.equal(r.passed,true);assert.ok(p.completed[u.id]);assert.equal(p.session,null);
});
const html=readFileSync(new URL('../public/academy/index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../public/academy/academy.js',import.meta.url),'utf8');
test('academy contains accessible controls, voice fallback, import, and student-only route',()=>{
 assert.match(html,/id="bottom-nav"/);assert.match(html,/id="teacher-import"/);
 for(const entry of ['startUnit','startReviews','startPractice','checkAnswer','speechSynthesis','SpeechRecognition','teacher-local','record-speech'])assert.ok(js.includes(entry),entry);
 assert.match(js,/aria-valuenow/);assert.match(js,/aria-live/);assert.ok(!js.includes('ELEVENLABS_API_KEY'));
});
