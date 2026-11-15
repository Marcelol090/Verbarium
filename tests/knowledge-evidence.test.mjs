import test from 'node:test';
import assert from 'node:assert/strict';
import {TOPICS} from '../public/learning/curriculum.js';
import {validateGraph,orderedTopics,emptyLedger,loadLedger,grade,recordAttempt,evidenceFor,isReady,nextTopic,progressSummary} from '../public/learning/engine.js';
test('original knowledge graph is acyclic, every prerequisite occurs first',()=>{
 assert.deepEqual(validateGraph(),[]);
 const list=orderedTopics(),idx=new Map(list.map((t,i)=>[t.id,i]));
 assert.equal(list.length,TOPICS.length);
 for(const t of list)for(const dep of t.requires)assert.ok(idx.get(dep)<idx.get(t.id));
 assert.ok(validateGraph([{id:'a',requires:['b']},{id:'b',requires:['a']}]).some(e=>e.startsWith('cycle:')));
 assert.ok(validateGraph([{id:'a',requires:['missing']}]).some(e=>e.startsWith('unknown:')));
});
test('grading accepts equivalent natural-language answers without confusing forms',()=>{
 assert.equal(grade('present-negative','build',"I don't work on Sundays."),true);
 assert.equal(grade('present-negative','build','She does not work on Sundays'),false);
 assert.equal(grade('be','identify','are'),true);
 assert.equal(grade('be','identify','am'),false);
});
test('hinted success and late correction are never counted as independent first success',()=>{
 const l=emptyLedger();recordAttempt(l,{topicId:'pronouns',activityId:'identify',answer:'She',usedHint:true});
 recordAttempt(l,{topicId:'pronouns',activityId:'build',answer:'He live here',first:true});
 recordAttempt(l,{topicId:'pronouns',activityId:'build',answer:'She lives here',first:false});
 const e=evidenceFor(l,'pronouns');assert.equal(e.firstIndependent,0);assert.equal(e.hintedCorrect,1);assert.equal(e.status,'developing');
});
test('evidence of transfer plus independent production unlocks required successor, not certificate',()=>{
 const l=emptyLedger();assert.equal(nextTopic(l).id,'pronouns');assert.equal(isReady(l,TOPICS[1]),false);
 recordAttempt(l,{topicId:'pronouns',activityId:'build',answer:'She lives here'});
 recordAttempt(l,{topicId:'pronouns',activityId:'transfer',answer:'He works here'});
 assert.equal(evidenceFor(l,'pronouns').status,'supported');
 assert.equal(isReady(l,TOPICS[1]),true);
 assert.equal(nextTopic(l).id,'be');
 assert.equal(progressSummary(l).supported,1);
});
test('ledger ignores malformed or unrecognized evidence',()=>{
 assert.deepEqual(loadLedger('not json'),emptyLedger());
 const saved=loadLedger({version:1,events:[{topicId:'fake',activityId:'identify',mode:'recognition',correct:true,first:true,hinted:false},{topicId:'pronouns',activityId:'identify',mode:'recognition',correct:true,first:true,hinted:false,at:'x'}]});
 assert.equal(saved.events.length,1);
});
