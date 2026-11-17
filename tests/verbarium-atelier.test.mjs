import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const root=new URL('../public/',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const manifest=JSON.parse(read('verbarium-visual-kit/manifest.json'));
test('Visual Atelier uses the existing verified 48-piece visual kit',()=>{
 assert.equal(Object.keys(manifest.assets).length,48);
 for(const item of Object.values(manifest.assets))assert.ok(existsSync(new URL('verbarium-visual-kit/'+item.path,root)),item.path);
 for(const file of ['verbarium-design/atelier.js','verbarium-design/index.html','verbarium-design/visual.css']){
  assert.doesNotMatch(read(file),/verbarium-kit-v1/,file);
 }
 assert.match(read('verbarium-design/atelier.js'),/fetch\(assetRoot\+'manifest\.json'/);
});
test('inspector has interactive filters, scale and real buttons',()=>{
 const doc=read('verbarium-design/index.html');
 for(const id of ['asset-grid','asset-size','surface-toggle','inspector-title','state-demo','copy-path'])assert.ok(doc.includes('id="'+id+'"'),id);
 const css=read('verbarium-design/visual.css');
 for(const token of ['--vb-icon-size:24px','--vb-hit:48px'])assert.ok(css.includes(token));
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/object-fit:contain/);
});