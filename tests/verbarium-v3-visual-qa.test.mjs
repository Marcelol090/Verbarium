import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=(p)=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('v3 filter tabs never use lesson chips with baked-in book and check',async()=>{
 const impl=await read('src/verbarium-kit/v3-production.js');
 const css=await read('src/verbarium-kit/v3-visual-qa.css');
 assert.doesNotMatch(impl,/runtime\.bindLessonChip\(button/);
 assert.match(impl,/vb3-semantic-chip/);
 assert.match(css,/cta\/pill_cream\.png/);
 assert.match(css,/cta\/pill_lavender\.png/);
});
test('CTA uses independent original base and play icon without overlay collisions',async()=>{
 const impl=await read('src/verbarium-kit/v3-production.js');
 const css=await read('src/verbarium-kit/v3-visual-qa.css');
 assert.match(impl,/cta\/purple_primary/);
 assert.match(impl,/cta\/play_circle/);
 assert.match(css,/vb3-cta-label/);
 assert.match(css,/vb3-cta-play/);
 assert.doesNotMatch(impl,/runtime\.bindCTA\(button/);
});
test('journey uses environment sprite layers, no triangle-tree SVGs or translucent hero overlay',async()=>{
 const journey=await read('src/journey-v2.js');
 assert.match(journey,/environment\/bridge\.png/);
 assert.match(journey,/environment\/grass\.png/);
 assert.match(journey,/environment\/cloud_large\.png/);
 assert.doesNotMatch(journey,/vb-world-island/);
 assert.doesNotMatch(journey,/fill="#306941"/);
});
test('lesson in progress never becomes locked on pointerdown; real chat avatars are used',async()=>{
 const impl=await read('src/verbarium-kit/v3-production.js');
 const app=await read('src/app.js');
 assert.doesNotMatch(impl,/runtime\.setSprite\(img,'journey\/node_locked_press'\)/);
 assert.match(app,/vb3-chat-avatar/);
 assert.match(app,/v3-visual-qa\.css/);
});
