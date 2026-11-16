import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('public/ui-kit/precision-v8/index.html');
const css=read('public/ui-kit/precision-v8/mobile-simulator.css');
const js=read('public/ui-kit/precision-v8/mobile-simulator.js');

test('V8 is now a real phone preview rather than a desktop asset catalog',()=>{
 assert.match(html,/<iframe id="app-frame"/);
 assert.match(html,/id="device-select"/);
 assert.match(html,/data-mobile-screen="lesson"/);
 assert.match(html,/id="phone-device"/);
 assert.match(html,/mobile-studio-nav/);
 assert.match(html,/content="width=device-width,initial-scale=1,viewport-fit=cover"/);
 assert.doesNotMatch(html,/max-width:1096px/);
});
test('phone frame preserves iframe CSS pixels without image scaling',()=>{
 assert.match(css,/width:calc\(var\(--device-w\) \+ 20px\)/);
 assert.match(css,/\.screen-viewport\{width:var\(--device-w\);height:var\(--device-h\)/);
 assert.match(css,/\.screen-viewport iframe\{display:block;border:0;width:100%;height:100%/);
 assert.doesNotMatch(css,/transform:\s*scale\(/);
});
test('native phone view fills viewport and hides desktop chrome',()=>{
 assert.match(css,/@media\(max-width:700px\)/);
 assert.match(css,/\.phone-device\{width:100%!important;height:100%!important/);
 assert.match(css,/\.phone-top,\.phone-bottom\{display:none\}/);
 assert.match(css,/\.mobile-route-bar\{display:grid/);
});
test('all primary screens use existing working routes and four device sizes are real',()=>{
 for(const size of ['320:[320,720]','360:[360,800]','390:[390,844]','430:[430,932]'])
  assert.ok(js.includes(size),'missing device '+size);
 assert.match(js,/academy:\{url:'\/academy\/'/);
 assert.match(js,/home:\{url:'\/'/);
 assert.match(js,/onboarding:\{url:'\/onboarding\/'/);
 assert.match(js,/querySelector\('\.welcome-card button\[data-unit\]/);
 assert.match(js,/Object\.hasOwn\(sizes,String\(next\)\)/);
});
test('reuses the published visual kit and has accessible control targets',()=>{
 assert.match(js,/verbarium-visual-kit\/manifest\.json/);
 assert.match(html,/verbarium-visual-kit\/assets\/mascot\/fox_welcome\.webp/);
 assert.match(css,/\.mobile-studio-nav button\{[^}]*min-height:50px/);
 assert.match(css,/button:focus-visible,a:focus-visible,select:focus-visible\{outline:3px/);
});
