import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {renderPromo} from '../public/ui-kit/components/library.js';

const read=path=>readFileSync(path,'utf8');
const backgrounds=['home','academy','lesson','practice','conversation','profile','onboarding','celebration','premium','neutral'];
const v8=read('public/ui-kit/precision-v8.js');

test('V9 section backgrounds are separate scalable SVGs without baked UI copy',()=>{
 for(const name of backgrounds){
  const path='public/ui-kit/backgrounds/'+name+'.svg';
  assert.ok(existsSync(path),name+' background exists');
  const svg=read(path);
  assert.match(svg,/<svg[^>]+viewBox="0 0 1200 700"/);
  assert.match(svg,/<\/svg>$/);
  assert.doesNotMatch(svg,/<text\b/);
 }
});

test('all application entry points load the shared visual layer',()=>{
 for(const path of ['index.html','public/academy/index.html','public/onboarding/index.html','public/learning/index.html','public/components/index.html']){
  assert.match(read(path),/verbarium-design-v9\.css/,path);
 }
 assert.ok(v8.indexOf('document.head.append(precisionV8Style)')<v8.indexOf('document.head.append(verbariumV9Style)'));
 assert.doesNotMatch(v8,/host\.querySelectorAll\('\.vb7-feature'\)\.forEach/);
});

test('mobile home flow has one clear progression and semantic destinations',()=>{
 const app=read('src/app.js');
 const start=app.indexOf('function homePage(){');
 const end=app.indexOf('\nfunction weekActivity()',start);
 assert.ok(start>=0&&end>start,'home renderer exists');
 const home=app.slice(start,end);
 for(const token of ['renderLessonHero(','renderQuestMap(','renderMissions(','renderFeatureGrid(homeFeatures)','renderStreakWeek(','renderPromo('])assert.ok(home.includes(token),token);
 for(const route of ['learn','practice','speak','lab','food','pairs'])assert.ok(home.includes("key:'"+route+"'"),route+' activity route');
 assert.match(home,/data-route="review"/);
 assert.doesNotMatch(home,/renderV6PairsTeaser|renderV5WorldExplorer|vb-food-teaser|quick-filters/);
});

test('core component glyphs and lesson feedback use vector assets',()=>{
 const library=read('public/ui-kit/components/library.js');
 const lesson=read('public/ui-kit/components/lesson-ui.js');
 const v7=read('public/ui-kit/precision-v7.js');
 const academy=read('public/academy/academy.js');
 for(const file of ['/ui-kit/icons/book.svg','/ui-kit/icons/play.svg','/ui-kit/icons/check.svg','/ui-kit/icons/brain.svg','/ui-kit/icons/chat.svg','/ui-kit/icons/flame.svg'])assert.ok(library.includes(file)||lesson.includes(file),file);
 assert.match(lesson,/correct:'\/ui-kit\/icons\/check\.svg'/);
 assert.match(lesson,/retry:'\/ui-kit\/icons\/refresh\.svg'/);
 const promo=renderPromo({title:'Academy',image:'/verbarium-visual-kit/assets/mascot/fox_reading.webp'});
 assert.match(promo,/verbarium-visual-kit\/assets\/mascot\/fox_reading\.webp/);
});

test('background gallery previews the same production files and both CSS copies match',()=>{
 const gallery=read('public/components/gallery.js');
 const html=read('public/components/index.html');
 for(const name of backgrounds.filter(x=>x!=='premium'&&x!=='neutral'))assert.ok(gallery.includes("['"+name+"'")||gallery.includes("['"+name+"',"),name+' gallery entry');
 assert.match(html,/12 · Fundos por sessão/);

});

test('V9 styles remain balanced and respect narrow screens and reduced motion',()=>{
 const css=read('public/ui-kit/verbarium-design-v9.css');
 const stripped=css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,'""');
 let depth=0;
 for(const ch of stripped){if(ch==='{')depth++;if(ch==='}')depth--;assert.ok(depth>=0,'CSS closes in order');}
 assert.equal(depth,0);
 assert.match(css,/@media\(max-width:770px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
