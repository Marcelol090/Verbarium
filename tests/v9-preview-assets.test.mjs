import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const base=new URL('../public/',import.meta.url);
const read=p=>readFileSync(new URL(p,base),'utf8');
const names=["academy","celebration","conversation","home","lesson","neutral","onboarding","practice","premium","profile"];
test('all ten V9 scene backgrounds are isolated, valid text-free SVGs',()=>{
 for(const name of names){
  const file='ui-kit/backgrounds/v9/'+name+'.svg';
  assert.ok(existsSync(new URL(file,base)),file);
  const svg=read(file);
  assert.match(svg,/<svg\b/);
  assert.match(svg,/<\/svg>/);
  assert.doesNotMatch(svg,/<text\b/);
 }
});
test('V9 is previewed without overriding the modern product cascade',()=>{
 const css=read('ui-kit/verbarium-design-v9.css'),html=read('ui-kit/v9-preview/index.html');
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/:root\{/);
 assert.match(html,/data-vb-app="v9-preview"/);
 for(const name of names)assert.ok(html.includes('/ui-kit/backgrounds/v9/'+name+'.svg'),name);
 for(const ico of ['chart','play','refresh','user'])assert.ok(existsSync(new URL('ui-kit/icons/'+ico+'.svg',base)));
 for(const htmlFile of ['../../index.html','academy/index.html','onboarding/index.html']){
  const content=htmlFile.startsWith('../')?readFileSync(new URL('../index.html',base),'utf8'):read(htmlFile);
  assert.ok(!content.includes('verbarium-design-v9.css'),'V9 must not regress production '+htmlFile);
 }
});