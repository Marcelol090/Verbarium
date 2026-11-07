import test from 'node:test';
import assert from 'node:assert/strict';
import {chapters,findJourneyChapter,missionState,renderMissionBoard,renderQuestMap,renderChapterDetail,deriveAchievements,renderProfile} from '../src/journey-v2.js';

const lessonIds=chapters.flatMap(c=>c.lessonIds);
const lessons=lessonIds.map((id,i)=>({id,title:'Aula '+(i+1),subtitle:'Exemplo pedagógico '+(i+1),level:i<4?'A1':i<8?'A2':'B1'}));

test('three chapters map twelve unique lessons without duplicates',()=>{
 assert.equal(chapters.length,3);
 assert.equal(new Set(lessonIds).size,12);
 assert.equal(findJourneyChapter('perfect').id,'talk');
 assert.equal(findJourneyChapter('be').id,'first');
});
test('daily missions use today only, including sessions and completed date',()=>{
 const m=missionState({activity:[{date:'2026-11-07'},{date:'2026-11-07'},{date:'2026-11-06'}],completedAt:{be:'2026-11-07',past:'2026-11-06'},sessions:[{date:'2026-11-07'}],today:'2026-11-07'});
 assert.deepEqual(m.map(x=>x.now),[2,1,1]);
 assert.deepEqual(m.map(x=>x.goal),[3,1,1]);
 assert.match(renderMissionBoard(m),/2\/3 concluídas/);
});
test('empty or old activity does not manufacture completion',()=>{
 const m=missionState({activity:[],completedAt:{},sessions:[],today:'2026-11-07'});
 assert.deepEqual(m.map(x=>x.now),[0,0,0]);
 assert.match(renderMissionBoard(m),/0\/3 concluídas/);
});
test('all three scenes render with twelve real lesson buttons',()=>{
 const html=renderQuestMap({lessons,completed:['be'],currentId:'present'});
 assert.equal((html.match(/class="v2-world v2-world--/g)||[]).length,3);
 assert.equal((html.match(/class="v2-stop-btn /g)||[]).length,12);
 assert.match(html,/v2-stop-btn done/);
 assert.match(html,/v2-stop-btn current/);
});
test('chapter detail contains four lessons and does not lock upcoming content',()=>{
 const html=renderChapterDetail({id:'first',lessons,completed:['be'],currentId:'present'});
 assert.equal((html.match(/class="v2-chapter-lesson"/g)||[]).length,4);
 assert.match(html,/Aula 2/);
 assert.match(html,/data-action="open-lesson"/);
});
test('badges are earned only on milestones',()=>{
 const empty=deriveAchievements({});
 assert.equal(empty.filter(b=>b.earned).length,0);
 const earned=deriveAchievements({completed:['be','present','questions','articles'],correct:12,streak:3,sessions:[{date:'2026-11-07'}],reviews:{'be-0':{level:1}}});
 assert.equal(earned.filter(b=>b.earned).length,6);
});
test('profile escapes text input',()=>{
 const html=renderProfile({nickname:'<img src=x onerror=alert(1)>',completed:[],correct:0,attempts:0,streak:0,sessions:[],reviews:{},due:0});
 assert.doesNotMatch(html,/<img src=x/);
 assert.match(html,/&lt;img/);
});
