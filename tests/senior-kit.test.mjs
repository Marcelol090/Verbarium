import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';

const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(join(root,p));
const manifest=JSON.parse(read('public/verbarium-kit-v1/manifest.json').toString());
const visual=read('public/verbarium-design/visual.css').toString();
const atelier=read('public/verbarium-design/index.html').toString();
const studioJS=read('public/verbarium-design/atelier.js').toString();
const source=read('assets/visual-kit-v1.tar.gz');
const counts={buttons:8,cards:6,grids:8,backgrounds:6,labels:10,mascot:4,rewards:6};
const ratio=(a,b)=>{const lum=h=>{const v=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2]};const l=lum(a),r=lum(b);return (Math.max(l,r)+.05)/(Math.min(l,r)+.05)};

test('local artwork archive is content-verified and extracted',()=>{
 assert.equal(createHash('sha256').update(source).digest('hex'),'4bb5771055d1a5fd198b45eb37a1409f46e01c75752c26f2ea0ab559f03eae40');
 assert.equal(Object.keys(manifest.assets).length,48);
});
test('48 independent artwork pieces use their own WebP files, not sliced CSS backgrounds',()=>{
 const real={};
 for(const [id,item] of Object.entries(manifest.assets)){
  assert.match(item.path,/^assets\/(buttons|cards|grids|backgrounds|labels|mascot|rewards)\/[a-z0-9_-]+\.webp$/);
  assert.ok(item.width>0 && item.height>0,`native size: ${id}`);
  const path=join(root,'public/verbarium-kit-v1',item.path);
  assert.ok(existsSync(path),`missing ${id}`);
  const file=readFileSync(path);
  assert.equal(file.subarray(0,4).toString(),'RIFF',id);
  assert.equal(file.subarray(8,12).toString(),'WEBP',id);
  real[item.category]=(real[item.category]||0)+1;
 }
 assert.deepEqual(real,counts);
});
test('component geometry and accessibility are encoded as tokens, not arbitrary raster stretching',()=>{
 for(const pair of [
  ['--vb-line:1px','1px hairline'],['--vb-state-line:2px','selected state'],['--vb-icon-line:2px','icon stroke'],
  ['--vb-icon-size:24px','icon grid'],['--vb-hit:48px','touch minimum'],['--vb-radius-control:16px','control radius'],['--vb-focus:#4C319E','focus color'],
 ])assert.ok(visual.includes(pair[0]),pair[1]);
 assert.ok(visual.includes(':focus-visible'),'focus state is visible');
 assert.ok(visual.includes('prefers-reduced-motion:reduce'),'reduced motion is supported');
 assert.doesNotMatch(visual,/background-size:\s*100%\s+100%/);
 assert.match(visual,/object-fit:contain/);
});
test('semantic palette is legible on intended surfaces',()=>{
 assert.ok(ratio('#603AC7','#FFFFFF')>=4.5,'purple white contrast');
 assert.ok(ratio('#2E2846','#F18A52')>=4.5,'dark label on bright orange');
 assert.ok(ratio('#625B73','#FFFFFF')>=4.5,'secondary copy');
 assert.ok(ratio('#B84A24','#FFFFFF')>=4.5,'accessible text orange');
});
test('Visual Atelier is an actual reusable component library, not one raster collage',()=>{
 assert.match(atelier,/id="asset-grid"/);
 assert.match(atelier,/id="state-demo"/);
 assert.match(atelier,/id="asset-size"/);
 assert.match(studioJS,/object-fit:contain|item\.width/);
 assert.doesNotMatch(atelier,/<img[^>]+imagegen\.png/);
});
