import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('public/ui-kit/precision-v8.css');
const hydrator=read('public/ui-kit/precision-v8.js');
const manifest=JSON.parse(read('public/verbarium-visual-kit/manifest.json'));
const pages=['index.html','public/academy/index.html','public/onboarding/index.html'];
const CHECKS=[
 ['--vb8-space-1:4px','layout grid'],
 ['--vb8-edge:1px solid','surface edge'],
 ['--vb8-radius-card:24px','card geometry'],
 ['--vb8-radius-md:16px','control geometry'],
 ['outline:3px solid','keyboard focus'],
 ['min-height:56px','interactive target'],
 ['stroke-width:2','icon stroke'],
 ['object-fit:contain','intrinsic artwork'],
 ['.option.selected','exercise selected state'],
 ['.option.correct','exercise success'],
 ['.option.wrong','exercise error'],
];
test('Precision V8 is loaded after V7 in every real entry point',()=>{
 for(const page of pages){
  const html=read(page);
  assert.ok(html.indexOf('precision-v8.css')>html.indexOf('precision-v7.css'),page+' style order');
  assert.ok(html.indexOf('precision-v8.js')>html.indexOf('precision-v7.js'),page+' enhancer order');
 }
});
test('geometry system has separate exact roles and native button states',()=>{
 for(const [token,desc] of CHECKS)assert.ok(css.includes(token),'Missing '+desc);
 assert.doesNotMatch(css,/background-size:100%\s+100%/);
 assert.doesNotMatch(css,/object-fit:cover/);
 assert.match(css,/\.vb7-hero__actions \.vb7-cta:active/);
 assert.match(css,/\.sentence-lab-links>a/);
 assert.match(css,/\.vb7-feature\[data-tone="mint"\]/);
});
test('all 48 original image assets remain independent and valid',()=>{
 assert.equal(Object.keys(manifest.assets).length,48);
 const categories={};
 for(const [name,entry] of Object.entries(manifest.assets)){
  categories[entry.category]=(categories[entry.category]||0)+1;
  assert.match(entry.path,/^assets\/(?:mascot|rewards|buttons|cards|grids|labels|backgrounds)\/[a-z0-9_-]+\.webp$/);
  assert.ok(existsSync(new URL('../public/verbarium-visual-kit/'+entry.path,import.meta.url)),name+' missing');
  assert.ok(entry.width>20&&entry.height>20);
 }
 assert.deepEqual(categories,{buttons:8,cards:6,grids:8,backgrounds:6,labels:10,mascot:4,rewards:6});
});
test('hydration is strictly decorative and resilient to missing images',()=>{
 assert.match(hydrator,/if\(!response\.ok\)return/);
 assert.match(hydrator,/Object\.keys\(data\.assets\)\.length!==48/);
 assert.match(hydrator,/img\.onerror=\(\)=>ok\(null\)/);
 assert.match(hydrator,/aria-hidden/);
 assert.match(hydrator,/decorateOnboarding/);
 assert.doesNotMatch(hydrator,/localStorage|sessionStorage|score\s*=|recordAnswer|earnXp|completeLesson/);
});
