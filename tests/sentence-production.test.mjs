import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PHRASES,blankState,recordAttempt,sentence} from '../public/academy/sentence-lab/lesson-core.js';
import {PRODUCTION_PHRASES,ALL_SENTENCES,practiceQueue,evaluateProduction,scaffoldHint,accuracyFromResults} from '../public/academy/sentence-lab/production-bank.js';
const now=new Date('2026-11-13T15:00:00.000Z');

test('novel production challenges do not duplicate sample sentences',()=>{
 assert.ok(PRODUCTION_PHRASES.length>=6);
 const old=new Set(PHRASES.map(p=>sentence(p).toLowerCase()));
 const unique=new Set();
 for(const p of PRODUCTION_PHRASES){
  assert.ok(p.subject&&p.verb&&p.object&&p.pt&&p.image&&p.rule&&p.speaker);
  const key=sentence(p).toLowerCase();
  assert.ok(!old.has(key),'prompt copied from guided lesson: '+key);
  assert.ok(!unique.has(key),'duplicate production prompt: '+key);
  unique.add(key);
 }
});

test('retrieval queue prioritizes due known items, ignoring non-sentence activities',()=>{
 const reviews={
  pairs:{due:'2026-11-12T15:00:00.000Z',level:0},
  banana:{due:'2026-11-12T15:00:00.000Z',level:0},
  'orange-she':{due:'2026-11-12T15:00:00.000Z',level:0},
  'banana-he':{due:'2026-11-14T15:00:00.000Z',level:0}
 };
 assert.deepEqual(practiceQueue(reviews,{mode:'review',now}).map(p=>p.id),['banana','orange-she']);
 assert.deepEqual(practiceQueue(reviews,{mode:'daily',now,limit:2}).map(p=>p.id),['banana','orange-she']);
 assert.deepEqual(practiceQueue({}, {mode:'review',now}),[]);
 assert.equal(practiceQueue({}, {mode:'free',now,limit:5}).length,5);
 assert.equal(new Set(practiceQueue({}, {mode:'free',now,limit:12}).map(p=>p.id)).size,12);
});

test('grammar feedback distinguishes subject, verb and article',()=>{
 const p=PRODUCTION_PHRASES.find(p=>p.id==='orange-she');
 assert.equal(evaluateProduction('She eats an orange!',p).ok,true);
 assert.match(evaluateProduction('He eats an orange',p).reason,/sujeito/i);
 assert.match(evaluateProduction('She eat an orange',p).reason,/-s/);
 assert.match(evaluateProduction('She eats a orange',p).reason,/an orange/);
 assert.equal(evaluateProduction('She drinks milk',PRODUCTION_PHRASES.find(p=>p.id==='milk-she')).ok,true);
});

test('progressive hints never reveal the entire target sentence before an attempt',()=>{
 for(const p of PRODUCTION_PHRASES){
  for(let level=1;level<=3;level++){
   const hint=scaffoldHint(p,level);
   assert.ok(hint.length>15);
   assert.ok(!hint.toLowerCase().includes(sentence(p).toLowerCase()),'leak for '+p.id);
  }
 }
});

test('mastery summary counts first attempts, not retry spam',()=>{
 const r=accuracyFromResults([
  {firstAttempt:true,ok:true},{firstAttempt:true,ok:false},
  {firstAttempt:false,ok:true},{firstAttempt:true,ok:true}
 ]);
 assert.equal(r.firstAttempts,3);assert.equal(r.firstCorrect,2);assert.equal(r.percentage,67);
});

test('produced sentences enter the existing spaced-review storage',()=>{
 let state=blankState();
 state=recordAttempt(state,4,'orange-she',false,now);
 assert.equal(state.xp,0);
 assert.ok(state.reviews['orange-she'].due);
 state=recordAttempt(state,4,'orange-she',true,now);
 assert.equal(state.xp,5);
 assert.ok(ALL_SENTENCES.some(p=>p.id==='orange-she'));
});

test('new practice is reachable from Academy and guided lab with voice controls',()=>{
 const base=new URL('../public/academy/',import.meta.url);
 const page=readFileSync(new URL('sentence-lab/practice.html',base),'utf8');
 const js=readFileSync(new URL('sentence-lab/practice.js',base),'utf8');
 const journey=readFileSync(new URL('academy.js',base),'utf8');
 const guided=readFileSync(new URL('sentence-lab/index.html',base),'utf8');
 assert.match(page,/practice-stage/); // dynamic answer input is created by practice.js
 assert.match(js,/production-answer/);
 assert.match(js,/SpeechSynthesisUtterance/);
 assert.match(js,/onboundary/);
 assert.match(js,/recordAttempt/);
 assert.match(journey,/sentence-lab\/practice\.html/);
 assert.match(guided,/practice\.html/);
});
