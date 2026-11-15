import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
test('video-review stylesheet on all four app surfaces',()=>{
 for(const path of ['index.html','public/academy/index.html','public/studio/index.html','public/onboarding/index.html'])
  assert.match(read(path),/href="\/ui-kit\/video-qa\.css"/);
 assert.ok(existsSync('public/ui-kit/video-qa.css'));
});
test('hero no longer repeats decorative banner beneath native text',()=>{
 const base=read('public/ui-kit/raster/styles.css'),css=read('public/ui-kit/video-qa.css');
 assert.doesNotMatch(base,/\.hero-card\s*\{[^}]*background-size:contain/);
 assert.match(css,/body\[data-vb-app="home"\] \.hero-card\s*\{[^}]*background-repeat:no-repeat/s);
 assert.match(css,/\.hero-card h2 em\s*\{color:#6946cc/);
 assert.match(css,/\.hero-card p\s*\{color:#5d537e/);
 assert.match(css,/\.hero-card \.hero-visual\s*\{position:absolute/);
});
test('editable text-safe backgrounds and intrinsically-sized raster artwork',()=>{
 const s=read('public/ui-kit/video-qa.css');
 for(const selector of ['academy','studio','onboarding'])assert.ok(s.includes('data-vb-app="'+selector+'"'));
 assert.match(s,/\.vbmp-banner>\.vbmp-img,\.vbmp-card>\.vbmp-img\{object-fit:contain!important/);
 assert.match(s,/prefers-reduced-motion:reduce/);
});
