import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const adapter=read('public/ui-kit/generated-art.js');
const css=read('public/ui-kit/generated-art.css');
test('generated visual adapter uses only independently committed artwork',()=>{
  const kit=JSON.parse(read('public/verbarium-visual-kit/manifest.json'));
  const path=JSON.parse(read('public/verbarium-scenes/v13/manifest.json'));
  const used=[...adapter.matchAll(/kit\+'([^']+\.webp)'/g)].map(m=>m[1]);
  for(const name of used){
    const meta=Object.values(kit.assets).find(item=>item.path==='assets/'+name);
    assert.ok(meta,'Unknown generated kit artwork: '+name);
    assert.ok(existsSync(new URL('../public/verbarium-visual-kit/assets/'+name,import.meta.url)));
  }
  const nodes=[...adapter.matchAll(/scene\+'([^']+\.webp)'/g)].map(m=>m[1]);
  for(const name of nodes)assert.ok(path.assets[name],'Unknown generated scene node: '+name);
});
test('Academy and onboarding hydrate generated images without replacing controls',()=>{
  const academy=read('public/academy/academy.js');
  const onboarding=read('public/onboarding/onboarding.js');
  assert.match(academy,/decorateAcademyArt\(content\)/);
  assert.match(onboarding,/decorateOnboardingArt\(art,\$\('#ob-view'\),current\)/);
  assert.match(adapter,/button\.disabled/);
  assert.match(adapter,/nodeMilestone/);
  assert.match(adapter,/\.skill-card\[data-practice\]/);
  assert.doesNotMatch(adapter,/innerHTML\s*=/);
  assert.doesNotMatch(adapter,/addEventListener\(['"]click/);
});
test('art style is isolated from lessons and supports reduced motion',()=>{
  for(const page of ['public/academy/index.html','public/onboarding/index.html']){
    assert.match(read(page),/\/ui-kit\/generated-art\.css/);
  }
  assert.match(css,/object-fit:contain/);
  assert.match(css,/pointer-events:none/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css,/object-fit:fill/);
});
