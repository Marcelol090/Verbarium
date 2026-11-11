import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {V5_ASSETS,v5Art,renderV5WorldExplorer,renderV5FoodScene,renderV5Reward,renderV5Gallery} from '../src/verbarium-kit/v5-kit.js';
test('v5 has 102 unique and addressable separated assets',()=>{
 assert.equal(V5_ASSETS.length,102);
 assert.equal(new Set(V5_ASSETS.map(x=>x.id)).size,102);
 const manifest=JSON.parse(readFileSync(fileURLToPath(new URL('../public/verbarium-v5/manifest.json',import.meta.url)),'utf8'));
 assert.equal(manifest.count,102);
 for(const item of V5_ASSETS){
  assert.ok(manifest.assets.some(x=>x.path===item.path),'missing '+item.path);
  const bin=readFileSync(fileURLToPath(new URL('../public'+item.path,import.meta.url)));
  assert.ok(statSync(fileURLToPath(new URL('../public'+item.path,import.meta.url))).size>100);
  assert.equal(bin.toString('ascii',0,4),'RIFF');
  assert.equal(bin.toString('ascii',8,12),'WEBP');
 }
});
test('visuals preserve semantic data and no artificial score',()=>{
 assert.match(v5Art('fruit_shop'),/verbarium-v5\/assets\/worlds\/fruit_shop\.webp/);
 assert.equal(v5Art('unknown-asset'), '');
 assert.match(renderV5WorldExplorer({progress:{index:3,total:10,finished:false}}),/3\/10 atividades/);
 assert.match(renderV5FoodScene({type:'audio'},null),/explorer_listening/);
 assert.match(renderV5FoodScene({type:'image'},{ok:true}),/explorer_celebrating/);
 assert.match(renderV5Reward(8,10),/8 de 10 respostas corretas/);
 assert.match(renderV5Gallery(),/102 peças/);
});