import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {
 LEARNING_ICON_URLS,renderStepMeter,renderChoiceGroup,renderFeedback,
 renderLessonQuestion,renderLessonCompletion,renderPracticeScreen,
 renderDialogueMessages,renderDialogueScreen,renderGuidedPath,renderRewards
} from '../public/ui-kit/components/lesson-ui.js';
const file=p=>readFileSync(p,'utf8');
test('each icon is a real independent image, no compound board backgrounds',()=>{
 for(const [name,url] of Object.entries(LEARNING_ICON_URLS))assert.ok(existsSync('public'+url),name+' '+url);
 assert.equal(Object.keys(LEARNING_ICON_URLS).length,12);
 for(const p of ['public/ui-kit/components/lesson-ui.css','public/ui-kit/components/academy-v8.css'])assert.ok(existsSync(p));
 assert.doesNotMatch(file('public/ui-kit/components/lesson-ui.css'),/background(?:-image)?:\s*url\(/);
});
test('step meter reflects actual fraction and accessibility semantics',()=>{
 assert.match(renderStepMeter({current:2,total:8,label:'Questões'}),/aria-valuemax="8" aria-valuenow="2"/);
 assert.match(renderStepMeter({current:22,total:8}),/width:100%/);
 assert.match(renderStepMeter({current:-99,total:4}),/aria-valuenow="0"/);
 assert.match(renderStepMeter({current:1,total:0}),/aria-valuemax="1"/);
});
test('answer options remain native buttons with correct, wrong and disabled states',()=>{
 const options=['I am','She is','<img src=x onerror=alert(1)>'];
 const h=renderChoiceGroup({options,correct:'She is',selected:'I am',submitted:true,action:'lesson-answer'});
 assert.equal((h.match(/data-action="lesson-answer"/g)||[]).length,3);
 assert.match(h,/data-vb8-state="correct"/);
 assert.match(h,/data-vb8-state="incorrect"/);
 assert.match(h,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.doesNotMatch(h,/<img src=x/);
 assert.match(h,/disabled/);
 assert.match(renderChoiceGroup({options:['A','B'],correct:1,selected:0,indexMode:true,action:'dialog-choice'}),/data-index="0"/);
});
test('feedback distinguishes correct/incorrect with explanations',()=>{
 assert.match(renderFeedback({correct:true,title:'Correto',detail:'Am, is, are'}),/data-kind="success"/);
 assert.match(renderFeedback({correct:false,title:'Tente',detail:'Mais uma vez'}),/data-kind="retry"/);
 assert.match(renderFeedback({title:'<script>alert(1)</script>'}),/&lt;script&gt;/);
});
test('lesson controls preserve original handlers, real score and completion',()=>{
 const q=['You ___ happy.',['am','is','are'],'are','Usamos are com you.'];
 const open=renderLessonQuestion({question:q,index:1,total:3});
 assert.equal((open.match(/data-action="lesson-answer"/g)||[]).length,3);
 assert.match(open,/aria-valuenow="2"/);
 const checked=renderLessonQuestion({question:q,index:1,total:3,answer:{value:'am',ok:false}});
 assert.match(checked,/data-vb8-state="incorrect"/);
 assert.match(checked,/data-action="lesson-next"/);
 assert.match(checked,/Usamos are com you/);
 assert.match(renderLessonCompletion({score:2,total:3}),/data-complete="false"/);
 assert.match(renderLessonCompletion({score:3,total:3}),/data-complete="true"/);
 assert.match(renderLessonCompletion({score:3,total:3}),/data-action="restart-lesson"/);
});
test('practice flow preserves write input and repeated attempts without fabricated scores',()=>{
 const q=[{type:'write',prompt:'Eu estou aqui',answer:'I am here',hint:'I am + here',explain:'Use am com I.'}];
 const active=renderPracticeScreen({round:q,mode:'write',index:0,answer:null});
 assert.match(active,/id="write-answer"/);
 assert.match(active,/Dica de estrutura/);
 assert.match(active,/data-action="practice-submit"/);
 const answered=renderPracticeScreen({round:q,index:0,correct:0,answer:{value:'He is here',ok:false}});
 assert.match(answered,/Resposta esperada/);
 assert.match(answered,/data-action="practice-next"/);
 const ended=renderPracticeScreen({round:q,index:1,correct:0});
 assert.match(ended,/0 de 1 respostas corretas/);
 assert.match(ended,/data-action="new-round"/);
 assert.doesNotMatch(ended,/\+50 XP|falso/i);
});
test('dialogue keeps character speech audio, mic action and feedback wiring',()=>{
 const scenario={id:'cafe',title:'No café',desc:'Fazer um pedido',icon:'01',steps:[{ask:'What can I get?',pt:'O que deseja?',choices:['Tea','A cup of coffee'],correct:1,note:'Use a expressão completa.',speech:'A cup of coffee'}]};
 const active=renderDialogueScreen({scenarios:[scenario],scenario,stepIndex:0,history:[],micStatus:'Ouvindo...'});
 assert.match(active,/data-action="dialog-choice" data-index="1"/);
 assert.match(active,/data-action="speak-audio"/);
 assert.match(active,/data-action="record-speech"/);
 assert.match(active,/Ouvindo/);
 const answered=renderDialogueScreen({scenarios:[scenario],scenario,answer:{index:1,ok:true}});
 assert.match(answered,/Continuar diálogo/);
 assert.match(answered,/data-action="dialog-next"/);
 const done=renderDialogueScreen({scenarios:[scenario],scenario,stepIndex:1,history:[{mine:true,text:'Thanks!'}]});
 assert.match(done,/data-action="reset-scenario"/);
 assert.match(renderDialogueMessages([{mine:false,text:'<hello>',pt:'Olá'}]),/&lt;hello&gt;/);
});
test('guided path uses real completion and native lesson buttons, without fake locks',()=>{
 const ls=[{id:'be',title:'To be',subtitle:'Ser e estar',level:'A1'},{id:'present',title:'Present simple',subtitle:'Hábitos',level:'A1'},{id:'past',title:'Past simple',subtitle:'Passado',level:'A2'}];
 const h=renderGuidedPath({lessons:ls,completed:['be'],currentId:'present'});
 assert.equal((h.match(/data-action="open-lesson"/g)||[]).length,3);
 assert.match(h,/data-state="done"/);
 assert.match(h,/data-state="current"/);
 assert.match(h,/aria-current="step"/);
 assert.match(h,/1\/3 aulas/);
 assert.doesNotMatch(h,/\block(ed)?\b/);
});
test('reward cards show actual measured values, no fabricated ranks',()=>{
 const zero=renderRewards({completed:0,total:12,attempts:0,accuracy:90,streak:0,due:0});
 assert.match(zero,/0 \/ 12/);
 assert.match(zero,/Responda para acompanhar sua precisão/);
 assert.equal((zero.match(/data-vb8-component="reward-stat"/g)||[]).length,4);
 const real=renderRewards({completion:25,completed:3,total:12,accuracy:75,attempts:20,streak:5,due:2,label:'Primeiros passos'});
 for(const x of ['25%','3 / 12','75%','20 respostas registradas','5 dia(s)','Para revisar'])assert.ok(real.includes(x),x);
 assert.doesNotMatch(real,/podium|leaderboard|ranking|#1/);
});
test('real app and Academy use v8 renderers and accessible standalone styles',()=>{
 const app=file('src/app.js');
 for(const r of ['renderLessonQuestion','renderLessonCompletion','renderPracticeScreen','renderDialogueScreen','renderGuidedPath','renderRewards'])
   assert.match(app,new RegExp(r+'\\('));
 assert.doesNotMatch(app,/<section class="podium-panel">/);
 const html=file('public/academy/index.html');
 assert.match(html,/\/ui-kit\/components\/academy-v8\.css/);
 const css=file('public/ui-kit/components/lesson-ui.css');
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/max-width:650px/);
 const gallery=file('public/components/index.html');
 for(const name of ['gallery-lesson','gallery-practice','gallery-dialogue','gallery-path','gallery-rewards'])assert.ok(gallery.includes(name));
});
