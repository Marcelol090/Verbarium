import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {ICONS,FEATURES,renderHeading,renderPill,renderProgress,renderCta,renderLessonHero,renderFeatureGrid,renderFeatureCard,renderMissions,renderMissionCard,renderPromo} from '../public/ui-kit/components/library.js';
const file=p=>readFileSync(p,'utf8');
test('every referenced pictogram exists as a separate asset and does not carry UI copy',()=>{
 for(const [name,url] of Object.entries(ICONS)){
  assert.ok(url.startsWith('/'),name);
  assert.ok(existsSync('public'+url),name+' -> '+url);
 }
 assert.equal(FEATURES.length,4);
 assert.equal(new Set(FEATURES.map(x=>x.key)).size,4);
});
test('heading and separate copy remain native, semantic, escaped HTML',()=>{
 const title=renderHeading({kicker:'Estudo <novo>',title:'Progresso & autonomia',subtitle:'Faça "uma frase" e avance',level:1});
 assert.match(title,/<h1>Progresso &amp; autonomia<\/h1>/);
 assert.match(title,/Estudo &lt;novo&gt;/);
 assert.match(title,/Faça &quot;uma frase&quot;/);
 assert.equal((title.match(/<img/g)||[]).length,0);
 assert.match(title,/data-vb7-component="heading"/);
});
test('progress keeps real numeric state within range and labels semantic bars',()=>{
 assert.match(renderProgress({value:120}),/aria-valuenow="100"/);
 assert.match(renderProgress({value:-4}),/aria-valuenow="0"/);
 assert.match(renderProgress({value:2,max:8}),/width:25%/);
 assert.match(renderProgress({value:10,max:0}),/aria-valuemax="100"/);
 assert.match(renderPill({label:'A1 a B1',icon:'book'}),/A1 a B1/);
});
test('feature cards retain 4 native route controls without nested click targets',()=>{
 const h=renderFeatureGrid();
 assert.equal((h.match(/data-vb7-component="feature"/g)||[]).length,4);
 for(const route of ['lab','speak','practice','learn'])assert.match(h,new RegExp('data-route="'+route+'"'));
 assert.equal((h.match(/<button/g)||[]).length,4);
 assert.equal((h.match(/<img/g)||[]).length,8);
 assert.doesNotMatch(h,/<a\b/);
 assert.match(renderFeatureCard({...FEATURES[0],title:'<img src=x onerror=alert(1)>'}),/&lt;img/);
});
test('lesson hero has independently editable title, description, mascot and CTA',()=>{
 const h=renderLessonHero({title:'O verbo to be',description:'Use am, is e are.',lessonId:'be',completed:3,total:12,mascot:'<div data-test-mascot></div>'});
 assert.match(h,/Sua próxima aventura/);
 assert.match(h,/O verbo to be/);
 assert.match(h,/Use am, is e are/);
 assert.match(h,/data-test-mascot/);
 assert.match(h,/data-action="open-lesson" data-id="be"/);
 assert.match(h,/25%/);
 assert.match(h,/grid/); // class names reflect separate grid regions
});
test('mission bars preserve animation hook and daily source counts',()=>{
 const m=[{id:'questions',title:'Responder',subtitle:'Aula',now:2,goal:3,date:'2026-11-15',route:'practice'},{id:'lesson',title:'Concluir aula',now:1,goal:1,date:'2026-11-15',route:'learn'}];
 const h=renderMissions(m);
 assert.match(h,/1\/2 concluídas/);
 assert.equal((h.match(/class="vb7-mission-card vb5-mission/g)||[]).length,2);
 assert.equal((h.match(/data-vb5-mission=/g)||[]).length,2);
 assert.match(h,/class="vb7-mission-card__track vb5-mission-bar"/);
 assert.match(renderMissionCard(m[0]),/aria-valuenow="2"/);
});
test('promo remains a separate native link and cannot accept arbitrary domains',()=>{
 const h=renderPromo({title:'Academy',subtitle:'Aprender por etapas',href:'javascript:alert(1)'});
 assert.match(h,/href="\/academy\/"/);
 assert.doesNotMatch(h,/javascript:/);
 assert.match(h,/<h2>Academy<\/h2>/);
 assert.match(renderCta({label:'Ação',route:'__dangerous__'}),/data-route="learn"/);
});
test('screen integration and design gallery do not place component screenshots as backgrounds',()=>{
 const app=file('src/app.js');
 assert.match(app,/renderLessonHero\(/);
 assert.match(app,/renderMissions\(/);
 assert.match(app,/renderFeatureGrid\(/);
 assert.match(app,/renderPromo\(/);
 const css=file('public/ui-kit/components/library.css');
 assert.doesNotMatch(css,/background(?:-image)?\s*:\s*url\(/);
 assert.match(css,/grid-template-areas:/);
 assert.match(css,/object-fit:contain/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.ok(existsSync('public/components/index.html'));
 assert.match(file('public/components/index.html'),/inert/);
});
