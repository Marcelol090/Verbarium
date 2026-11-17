import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MOTION_ASSETS,motionByKey,renderMotionGallery,navArtwork,staticJourneyNode} from '../src/verbarium-kit/motion-assets.js';
test('all original assets have unique IDs and real transparent webp paths',()=>{
 assert.equal(MOTION_ASSETS.length,53);
 assert.equal(new Set(MOTION_ASSETS.map(x=>x.key)).size,53);
 assert.deepEqual(['journey','cta','rewards'].map(g=>MOTION_ASSETS.filter(a=>a.group===g).length),[18,21,14]);
 assert.match(motionByKey('journey:next_node_unlock').url,/next_node_unlock\.webp$/);
});
test('gallery is event-triggered, accessible and no autoplay',()=>{
 const html=renderMotionGallery();
 assert.equal((html.match(/data-vb-preview=/g)||[]).length,53);
 assert.doesNotMatch(html,/autoplay/);
 assert.match(html,/data-route="profile"/);
});
test('components use independent static variants',()=>{
 assert.match(staticJourneyNode('node_completed'),/node_completed\.png/);
 assert.match(navArtwork('home'),/navigation\/mascot_round\.png/);
 assert.equal(navArtwork('review'),'');
});