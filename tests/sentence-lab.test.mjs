import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PHRASES,sentence,normalize,gradeSentence,gradePair,blankState,recordAttempt,mastery,scheduleReview,dueReviews} from '../public/academy/sentence-lab/lesson-core.js';
test('Subject, verb and complement are evaluated independently',()=>{
 for(const p of PHRASES)assert.equal(gradeSentence(sentence(p),sentence(p)).ok,true);
 assert.equal(gradeSentence('She eat a banana',sentence(PHRASES[1])).ok,false);
 assert.match(gradeSentence('She eat a banana',sentence(PHRASES[1])).reason,/-s/);
 assert.match(gradeSentence('They eat',sentence(PHRASES[3])).reason,/bread/);
 assert.equal(normalize('  I  EAT an apple!  '),'i eat an apple');
});
test('Correct pairs match by identity rather than display position',()=>{
 assert.equal(gradePair('banana','banana'),true);
 assert.equal(gradePair('banana','milk'),false);
});
test('Spaced review moves to 1 then 3 days, resetting on error',()=>{
 const now=new Date('2026-11-12T12:00:00Z');
 let r=scheduleReview({},'apple',true,now);
 assert.equal(dueReviews(r,now).length,0);
 assert.equal(dueReviews(r,new Date('2026-11-14T12:00:00Z'))[0],'apple');
 r=scheduleReview(r,'apple',true,now);
 assert.equal(r.apple.level,2);
 assert.equal(r.apple.due,'2026-11-15T12:00:00.000Z');
 r=scheduleReview(r,'apple',false,now);
 assert.equal(r.apple.level,0);
});
test('Accuracy and XP use actual correct attempts, including independent writing',()=>{
 let s=blankState();
 s=recordAttempt(s,1,'banana',false);
 s=recordAttempt(s,1,'banana',true);
 s=recordAttempt(s,4,'bread',true);
 assert.equal(mastery(s).accuracy,67);
 assert.equal(s.xp,10);
 assert.equal(mastery(s).independent,true);
});
test('Student lesson includes five scaffolding stages and audio boundary events',()=>{
 const html=readFileSync(new URL('../public/academy/sentence-lab/index.html',import.meta.url),'utf8');
 const script=readFileSync(new URL('../public/academy/sentence-lab/lesson.js',import.meta.url),'utf8');
 assert.match(html,/lesson\.js/);
 assert.match(script,/onboundary/);
 for(const type of ['cardIntro','cardBuild','cardMatch','cardListen','cardWrite'])assert.ok(script.includes(type));
});
