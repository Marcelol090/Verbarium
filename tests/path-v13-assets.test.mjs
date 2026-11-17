import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app=read('src/app.js');
const css=read('public/ui-kit/precision-v13.css');
const manifest=JSON.parse(read('public/verbarium-scenes/v13/manifest.json'));
const pathSegment=app.slice(app.indexOf('function mobileLearnPage'),app.indexOf('function learnPage'));
test('all ten generated independent WebP assets are committed intact',()=>{
 const assets=manifest.assets;
 assert.equal(Object.keys(assets).length,10);
 let total=0;
 for(const [name,meta] of Object.entries(assets)){
  const p='public/verbarium-scenes/v13/'+name;
  const bytes=readFileSync(new URL('../'+p,import.meta.url));
  assert.equal(bytes.length,meta.bytes,'Incorrect byte count for '+name);
  const sha=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
  assert.equal(sha,meta.gitBlobSha,'Corrupted asset '+name);
  assert.match(name,/\.webp$/);
  total+=bytes.length;
 }
 assert.ok(total<400_000,'All ten assets should stay under 400KB');
});
test('V13 scene is mobile-only and has exact-aspect artwork layers',()=>{
 assert.match(css,/@media\(max-width:700px\)/);
 assert.match(css,/\.vb13-map-sky\{[^}]*object-fit:cover/);
 assert.match(css,/\.vb13-map-ribbon\{[^}]*object-fit:contain/);
 assert.match(css,/\.vb13-card-art\{[^}]*object-fit:contain/);
 assert.match(css,/\.vb13-map-sky,\.vb13-map-ribbon,\.vb13-map-hills\{[^}]*pointer-events:none/);
 assert.doesNotMatch(css,/object-fit:fill/);
 assert.match(css,/prefers-reduced-motion/);
});
test('learning path assets are attached to functional navigation, not decorative buttons',()=>{
 assert.match(pathSegment,/node_current/);
 assert.match(pathSegment,/node_completed/);
 assert.match(pathSegment,/node_milestone/);
 assert.match(pathSegment,/node_locked/);
 for(const name of ['scene_sky','path_ribbon','foreground_hills','destination_flag','card_shell','check_small']){
  assert.ok(pathSegment.includes(name+'.webp'),name+' not connected');
 }
 assert.match(pathSegment,/class="vb11-map-node vb13-map-node" data-action="open-lesson"/);
 assert.match(pathSegment,/data-route="home"/);
 assert.match(pathSegment,/role|aria-label=/);
 assert.doesNotMatch(pathSegment,/<button[^>]*disabled/);
 assert.match(pathSegment,/Explorar todas as/);
 assert.match(pathSegment,/new Set\(data.completed\)/);
 assert.match(pathSegment,/lesson.id===activeId/);
});
test('V13 styles load after prior runtime cascade without editing older screens',()=>{
 const html=read('index.html');
 assert.ok(html.indexOf('precision-v13.css')>html.indexOf('precision-v12.css'));
 const v8=read('public/ui-kit/precision-v8.js');
 assert.ok(v8.indexOf('append(precisionV13Style)')>v8.indexOf('append(precisionV12Style)'));
});
