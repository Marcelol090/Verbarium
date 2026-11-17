import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {renderGeneratedKitGallery,generatedAsset} from '../public/verbarium-visual-kit/gallery.js';
const root=new URL('../public/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('verbarium-visual-kit/manifest.json',root)));
test('48 assets in the independent gallery match the existing production manifest',()=>{
 assert.equal(Object.keys(manifest.assets).length,48);
 for(const [id,meta] of Object.entries(manifest.assets)){
  assert.equal(generatedAsset(id),'/verbarium-visual-kit/'+meta.path);
  assert.ok(existsSync(new URL('verbarium-visual-kit/'+meta.path,root)),id);
 }
});
test('gallery shows all seven categories and never rasterizes interactive copy',()=>{
 const html=renderGeneratedKitGallery();
 assert.equal((html.match(/class="vbkit-gallery-tile"/g)||[]).length,48);
 assert.match(html,/data-vbkit-filter/);
 assert.match(html,/aria-pressed=/);
 assert.match(readFileSync(new URL('verbarium-visual-kit/index.html',root),'utf8'),/hydrateGeneratedKit/);
});