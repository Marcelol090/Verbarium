import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultProgress,todayXp} from '../public/academy/academy-model.js';
import {applyAcademyPracticeResult} from '../public/academy/sentence-lab/academy-bridge.js';

test('sentence practice credits the shared Academy while retaining normal progress',()=>{
 const state=defaultProgress();
 state.completed['market-01']={score:81};
 const day='2026-11-13';
 applyAcademyPracticeResult(state,false,{today:day});
 assert.equal(state.attempts,1);
 assert.equal(state.correct,0);
 assert.equal(state.xp,0);
 assert.equal(state.activity[day].answers,1);
 applyAcademyPracticeResult(state,true,{today:day,xp:5});
 assert.equal(state.attempts,2);
 assert.equal(state.correct,1);
 assert.equal(state.xp,5);
 assert.equal(todayXp(state,day),5);
 assert.equal(state.activity[day].answers,2);
 assert.deepEqual(state.completed['market-01'],{score:81});
});
