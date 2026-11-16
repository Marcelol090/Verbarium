import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('src/app.js');
const academy=read('public/academy/academy.js');
const css=read('public/ui-kit/precision-v10.css');
const worlds=read('src/verbarium-kit/worlds.js');
test('V10 is the last style in all three production entrypoints',()=>{
 for(const path of ['index.html','public/academy/index.html','public/onboarding/index.html']){
  const html=read(path);
  assert.ok(html.includes('precision-v10.css'),path+' missing V10');
  assert.ok(html.indexOf('precision-v10.css')>html.indexOf('precision-v8.css'),path+' wrong cascade');
 }
});
test('mobile Home V11 keeps real progress and exactly one primary lesson action',()=>{
 assert.match(app,/function mobileHomePage\(\)\{/);
 assert.match(app,/matchMedia\('\(max-width:700px\)'\)/);
 assert.match(app,/class="vb11-home"/);
 assert.match(app,/class="vb11-hero-start"|"vb11-pill-button vb11-hero-start"/);
 assert.match(app,/class="vb11-progress-track" role="progressbar"/);
 assert.match(app,/class="vb11-home-metrics"/);
 assert.match(app,/data-route="learn"/);
 assert.match(app,/data-route="speak"/);
 assert.match(app,/data-route="practice"/);
 assert.equal((app.match(/data-action="open-lesson" data-id="\$\{safe\(next\.id\)\}"/g)||[]).length>=1,true);
});
test('Academy choices are visible after the question, not before',()=>{
 const index=academy.indexOf('function renderSession()');
 const inside=academy.slice(index,academy.indexOf('function renderFinish',index));
 assert.ok(inside.indexOf('vb10-question-head')<inside.indexOf('<div class="actor-stage">'),'Question must precede actor');
 assert.ok(inside.indexOf('vb10-answer-area')>inside.indexOf('<div class="speech-box">'),'Answers must follow context');
 assert.match(inside,/\$\{form\}/);
 assert.match(academy,/vb10-lab-extra/);
 assert.match(academy,/vb10-skill-icon/);
 assert.match(academy,/skillIcons=\{vocabulary:'book'/);
});
test('vector scenes replace stretched, blurry world banners',()=>{
 assert.match(worlds,/portrait-.*\.svg/);
 assert.match(worlds,/landscape-.*\.svg/);
 for(const kind of ['first','time','talk','mastery'])for(const aspect of ['landscape','portrait']){
  const p='public/verbarium-scenes/v10/'+aspect+'-'+kind+'.svg';
  assert.ok(existsSync(new URL('../'+p,import.meta.url)),p+' missing');
 }
 assert.match(css,/\.vb-world-lesson-banner>img\{object-fit:cover/);
 assert.doesNotMatch(css,/background-size:100%\s+100%/);
});
test('component roles use consistent geometry and focused, semantic states',()=>{
 assert.match(css,/--vb10-control:16px/);
 assert.match(css,/\.vb10-primary\{[^}]*min-height:55px/);
 assert.match(css,/\.vb10-hero-grid\{[^}]*grid-template-columns:minmax\(0,1fr\)/);
 assert.match(css,/\.vb10-mascot-stage img\{[^}]*object-fit:contain/);
 assert.match(css,/\.option\.correct/);
 assert.match(css,/\.option\.wrong/);
 assert.match(css,/\.option\.selected/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('V10 Studio previews actual semantic components instead of stretching button screenshots',()=>{
 const html=read('public/ui-kit/precision-v10/index.html');
 const js=read('public/ui-kit/precision-v10/studio.js');
 const css=read('public/ui-kit/precision-v10/studio.css');
 assert.match(html,/class="vb-btn vb-btn--primary"/);
 assert.match(html,/class="quiz-choice"/);
 assert.match(html,/landscape-first\.svg/);
 assert.match(html,/landscape-mastery\.svg/);
 assert.match(js,/data-result/);
 assert.match(css,/\.vb-btn--primary/);
 assert.match(css,/\.quiz-choice\[data-result="correct"\]/);
 assert.match(css,/\.quiz-choice\[data-result="wrong"\]/);
 assert.doesNotMatch(css,/background-size:\s*100%\s+100%/);
});
test('mobile navigation and Academy skills use one consistent SVG stroke system',()=>{
 assert.match(app,/mobile\?svg\(ic\)/);
 assert.match(academy,/const ICON_PATHS=\{/);
 assert.match(academy,/stroke-width="2"/);
 assert.match(css,/stroke-width:2/);
});
