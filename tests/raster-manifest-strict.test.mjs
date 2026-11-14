import test from 'node:test';
import assert from 'node:assert/strict';
import {ITEMS} from '../public/ui-kit/raster/catalog.js';
import {validateRasterManifest} from '../public/ui-kit/raster/manifest-validation.js';
import {bitmap,bitmapButton,bitmapBanner,bitmapProgress} from '../public/ui-kit/raster/widgets.js';
test('235 exact assets and safe validation',()=>{
 assert.equal(ITEMS.length,235);
 const clean={count:235,assets:ITEMS.map(id=>({id}))};
 assert.equal(validateRasterManifest(clean),true);
 assert.equal(validateRasterManifest({...clean,assets:[...clean.assets.slice(0,-1),{id:'icons/home'}]}),false);
 assert.equal(validateRasterManifest({...clean,count:234}),false);
 assert.equal(validateRasterManifest({...clean,assets:[...clean.assets.slice(0,-1),{id:'icons/other'}]}),false);
});
test('bitmap components retain native content and semantics',()=>{
 assert.match(bitmap('icons/home'),/src="\/ui-kit\/raster\/icons\/home.webp"/);
 assert.match(bitmapButton('buttons/primary_indigo','Continuar'),/Continuar/);
 assert.match(bitmapBanner('banners/globe_hero','<strong>Texto nativo<\/strong>'),/Texto nativo/);
 assert.match(bitmapProgress(27),/aria-valuenow="27"/);
 assert.match(bitmapProgress(200),/aria-valuenow="100"/);
});
