import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('public/ui-kit/precision-v7.css');
const hydrator=read('public/ui-kit/precision-v7.js');
const gallery=read('public/ui-kit/precision-v7/index.html');
const paths=['index.html','public/academy/index.html','public/onboarding/index.html'];

test('V7 is used on the real three Verbarium entry points',()=>{
 for(const p of paths){
  const html=read(p);
  assert.match(html,/\/ui-kit\/precision-v7\.css/);
  assert.match(html,/\/ui-kit\/precision-v7\.js/);
 }
});
test('V7 geometry and contrast tokens are centrally defined',()=>{
 const tokens=['--vb7v-line','#ddd5ed','--vb7v-violet','#7451d5','--vb7v-r16:16px','--vb7v-r24:24px','--vb7v-gap4:4px','--vb7v-gap24:24px'];
 for(const token of tokens)assert.ok(css.includes(token),'Missing '+token);
 assert.match(css,/min-height:52px/);
 assert.match(css,/outline:3px solid var\(--vb7v-violet\)/);
 assert.match(css,/stroke-width:2/);
});
test('artwork is contained, never rasterized as a stretched live button',()=>{
 assert.match(css,/\.vb7v-asset\{[^}]*object-fit:contain/);
 assert.match(css,/\.welcome-hero img\{[^}]*object-fit:contain/);
 assert.doesNotMatch(css,/background-size:100%\s+100%/);
 assert.doesNotMatch(css,/object-fit:cover/);
});
test('lesson response state semantics are preserved and distinct',()=>{
 for(const selector of ['.option.selected','.option.correct','.option.wrong','.pair-choice.matched']){
  assert.ok(css.includes(selector),'Missing '+selector);
 }
 assert.match(css,/\.option:disabled,[^{]*\.pair-choice:disabled\{opacity:1/);
});
test('kit is progressive enhancement, not a hard dependency',()=>{
 assert.match(hydrator,/if\(!response\.ok\)return/);
 assert.match(hydrator,/Object\.keys\(data\.assets\)\.length<40/);
 assert.match(hydrator,/const item=manifest\?\.assets\?\.\[key\]/);
 assert.match(hydrator,/el\.src=src/);
 assert.match(hydrator,/if\(!src\|\|!el\.isConnected/);
 assert.doesNotMatch(hydrator,/localStorage|sessionStorage|earnXp|recordAnswer/);
});
test('gallery supports inspection and interaction without text baked into controls',()=>{
 assert.match(gallery,/Precision component studio/);
 assert.match(gallery,/id="theme"/);
 assert.match(gallery,/id="assets"/);
 assert.match(gallery,/href="\/ui-kit\/precision-v7\.css"/);
});
