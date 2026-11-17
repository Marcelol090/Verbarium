import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('src/app.js'),css=read('public/ui-kit/precision-v11.css'),html=read('index.html');
test('V11 visual layer is loaded after V10 and remains last at runtime',()=>{
 assert.ok(html.indexOf('precision-v11.css')>html.indexOf('precision-v10.css'));
 const rt=read('public/ui-kit/precision-v8.js');
 assert.match(rt,/precisionV11Style/);
 assert.ok(rt.lastIndexOf('append(precisionV11Style)')>rt.lastIndexOf('append(precisionV10Style)'));
});
test('new hero uses separate high resolution Pip and live progress',()=>{
 assert.match(app,/function mobileHomePage\(\)\{/);
 assert.match(app,/fox_waving\.webp/);
 assert.match(app,/class="vb11-pill-button vb11-hero-start"/);
 assert.match(app,/class="vb11-progress-track" role="progressbar"/);
 assert.match(app,/const finished=data\.completed\.length,streak=currentStreak\(\)/);
 assert.match(app,/data-route="learn"/);
 assert.doesNotMatch(app.slice(app.indexOf('function mobileHomePage'),app.indexOf('function homePage')),/850 XP|7 dias|60%/);
});
test('lesson options reuse scoring and next-question engine, including correct and wrong',()=>{
 const lesson=app.slice(app.indexOf('function mobileLessonPage'),app.indexOf('function lessonPage'));
 assert.match(lesson,/class="vb11-answer"/);
 assert.match(lesson,/data-action="lesson-answer"/);
 assert.match(lesson,/data-action="lesson-next"/);
 assert.match(lesson,/data-state="\$\{state\}"/);
 assert.match(lesson,/\$\{safe\(q\[0\]\)\}/);
 assert.match(lesson,/aria-live="polite"/);
 assert.match(app,/if\(a==='lesson-answer'\)/);
 assert.match(app,/if\(a==='lesson-next'\)/);
});
test('the learning path is interactive without fake inaccessible locks',()=>{
 const path=app.slice(app.indexOf('function mobileLearnPage'),app.indexOf('function learnPage'));
 assert.match(path,/vb11-map-step/);
 assert.match(path,/data-action="open-lesson"/);
 assert.match(path,/Explorar todas as/);
 assert.doesNotMatch(path,/<button[^>]*disabled/);
 assert.match(css,/\.vb11-map-node/);
 assert.match(css,/journey-sky\.svg/);
});
test('conquests are earned from real learning and not illustrative XP',()=>{
 const ach=app.slice(app.indexOf('function mobileAchievementsPage'),app.indexOf('function progressPage'));
 assert.match(ach,/finished=data\.completed\.length,streak=currentStreak\(\),correct=data\.correct/);
 assert.match(ach,/complete=m\.value>=m\.target/);
 assert.match(ach,/role="progressbar"/);
 assert.match(ach,/vb11-achievement-action/);
 assert.doesNotMatch(ach,/850|XP\+50/);
});
test('V11 vector backgrounds and trophy are standalone, scalable and do not rasterize controls',()=>{
 const assets=['home-sky.svg','journey-sky.svg','reward-sky.svg','trophy.svg'];
 for(const file of assets){
  const p='public/verbarium-scenes/v11/'+file;
  assert.ok(existsSync(new URL('../'+p,import.meta.url)),p);
  const raw=read(p);
  assert.match(raw,/<svg /);
  assert.match(raw,/viewBox=/);
  assert.match(raw,/<\/svg>/);
  assert.doesNotMatch(raw,/<(?:text|image|foreignObject)\b/i);
 }
 assert.match(css,/--vb11-violet:#6B3FF6/);
 assert.match(css,/--vb11-orange:#FF8A3D/);
 assert.match(css,/--vb11-mint:#6EDAA7/);
 assert.match(css,/\.vb11-welcome-fox\{[^}]*object-fit:contain/);
 assert.doesNotMatch(css,/background-size:\s*100%\s+100%/);
});
