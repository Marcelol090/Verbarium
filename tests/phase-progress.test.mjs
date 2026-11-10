import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PHASE_ASSETS,PHASE_TIMING,savedLessonPercent,phaseState,phaseRing,queuePhaseReveal} from '../src/verbarium-kit/phase-progress.js';
import {renderQuestMap,chapters} from '../src/journey-v2.js';
test('all six original phase states map to real kit asset paths',()=>{
 assert.equal(Object.keys(PHASE_ASSETS).length,6);
 assert.ok(Object.values(PHASE_ASSETS).every(x=>x.startsWith('/verbarium-motion/journey/assets/')));
 assert.equal(PHASE_TIMING.progress,735);
 assert.equal(PHASE_TIMING.unlock,646);
});
test('progress comes only from actual saved lesson sessions',()=>{
 assert.equal(savedLessonPercent('be',{},4),0);
 assert.equal(savedLessonPercent('be',{be:{index:2,score:2}},4),50);
 assert.equal(savedLessonPercent('be',{be:{index:50}},4),100);
 assert.equal(phaseState({completed:true,isCurrent:true,percent:25}),'completed');
 assert.equal(phaseState({isCurrent:true,percent:25}),'progress');
 assert.equal(phaseState({isCurrent:true,percent:0}),'unlocked');
 assert.equal(phaseState({locked:true}),'locked');
 assert.match(phaseRing(50),/vb-phase-arc/);
 assert.equal(phaseRing(0),'');
});
test('chapter map renders percentage only on the live study session',()=>{
 const lessons=chapters.flatMap(c=>c.lessonIds).map(id=>({id,title:id,level:'A1',qs:[1,2,3,4]}));
 const html=renderQuestMap({lessons,completed:['be'],currentId:'present',lessonSessions:{present:{index:2,score:1}}});
 assert.equal((html.match(/data-vb-phase="/g)||[]).length,12);
 assert.match(html,/data-vb-phase="progress" data-vb-phase-percent="50"/);
 assert.match(html,/data-vb-phase="completed" data-vb-phase-percent="100"/);
 assert.doesNotMatch(html,/data-vb-phase="locked"/);
});
test('v3 legacy motion binder does not mutate new phase sprites',async()=>{
 const v3=await readFile(new URL('../src/verbarium-kit/v3-production.js',import.meta.url),'utf8');
 assert.match(v3,/if\(button\.hasAttribute\('data-vb-phase'\)\)continue/);
 assert.match(v3,/if\(el\.hasAttribute\('data-vb-phase'\)\)/);
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,/hydratePhaseMotion\(main,app\.route\)/);
 assert.match(app,/queuePhaseReveal\(l\.id,following\?\.id\|\|''\)/);
});
