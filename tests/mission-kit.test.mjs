import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderMissionBoard,missionState} from '../src/journey-v2.js';
const css=readFileSync(new URL('../src/verbarium-kit/mission-kit.css',import.meta.url),'utf8');
test('3 mission sprites and live progress come from local activity',()=>{
 const m=missionState({today:'2026-11-10',activity:[{date:'2026-11-10'},{date:'2026-11-10'}],completedAt:{be:'2026-11-10'},sessions:[]});
 const s=renderMissionBoard(m);
 assert.equal((s.match(/data-vb5-mission=/g)||[]).length,3);
 for(const f of ['missions/target_dart.png','journey/book_standalone.png','speaking/mic_idle.png'])assert.ok(s.includes(f),f);
 assert.match(s,/data-vb5-fill="67"/);assert.match(s,/1\/3 concluídas/);
 assert.equal((s.match(/role="progressbar"/g)||[]).length,3);
 assert.match(s,/data-vb5-date="2026-11-10"/);
});
test('all 3 completed missions keep their original icon and green states',()=>{
 const m=missionState({today:'2026-11-10',activity:Array.from({length:3},()=>({date:'2026-11-10'})),completedAt:{be:'2026-11-10'},sessions:[{date:'2026-11-10'}]});
 const s=renderMissionBoard(m);
 assert.match(s,/3\/3 concluídas/);
 assert.equal((s.match(/class="v2-mission vb5-mission complete"/g)||[]).length,3);
 assert.equal((s.match(/style="width:100%"/g)||[]).length,3);
});
test('shell is nine sliced, bars remain semantic and reduced motion is supported',()=>{
 assert.match(css,/mission_card_shell\.png/);assert.match(css,/border-image/);
 assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/grid-template-columns:repeat\(3/);
 assert.doesNotMatch(renderMissionBoard(missionState({today:'2026-11-10'})),/XP|50 Stars|bar_empty\.png/);
});

test('mission grid reserves equal rows for headings, subtitles and bottom progress',()=>{
 const rules=css.slice(css.indexOf('/* Mission alignment:'));
 assert.ok(rules.includes('align-items:stretch!important'));
 assert.ok(rules.includes('grid-template-rows:minmax(42px,auto) minmax(35px,1fr) 14px'));
 assert.ok(rules.includes('grid-template-rows:minmax(33px,auto) minmax(30px,1fr) 14px'));
 assert.ok(rules.includes('grid-template-rows:minmax(37px,auto) minmax(28px,1fr) 14px'));
 assert.ok(rules.includes('.vb5-mission-top{'));
 assert.ok(rules.includes('align-items:flex-start!important'));
 assert.ok(rules.includes('align-self:end!important'));
});
