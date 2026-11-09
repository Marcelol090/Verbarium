import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {MOTION_ASSETS,staticJourneyNode} from '../src/verbarium-kit/motion-assets.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','public');
const bytes=async url=>{
 assert.match(url,/^\/verbarium-(?:assets|motion)\//,'asset served from own public directory');
 const resolved=path.resolve(root,'.'+url);
 assert.ok(resolved.startsWith(root+path.sep));
 return readFile(resolved);
};
test('53 original animated WebPs and their reduced-motion PNGs are materialized from session packs',async()=>{
 assert.equal(MOTION_ASSETS.length,53);
 for(const asset of MOTION_ASSETS){
  const webp=await bytes(asset.url);
  assert.equal(webp.toString('ascii',0,4),'RIFF',asset.key+' RIFF');
  assert.equal(webp.toString('ascii',8,12),'WEBP',asset.key+' WEBP');
  assert.ok(webp.byteLength>1000,asset.key+' animated payload');
  const still=await bytes(asset.still);
  assert.equal(still.toString('hex',0,8),'89504e470d0a1a0a',asset.key+' PNG fallback');
 }
});
test('80 additional original PNGs and 80 SVGs are extracted independently',async()=>{
 const base=path.join(root,'verbarium-assets','extra-80');
 const walk=async dir=>{
  let files=[];
  for(const entry of await readdir(dir,{withFileTypes:true})){
   const p=path.join(dir,entry.name);
   files.push(...(entry.isDirectory()?await walk(p):[p]));
  }
  return files;
 };
 const files=await walk(base);
 const png=files.filter(f=>f.endsWith('.png'));
 const svg=files.filter(f=>f.endsWith('.svg'));
 assert.equal(png.length,80,'PNG originals');
 assert.equal(svg.length,80,'editable SVG originals');
 for(const filename of png){
  const image=await readFile(filename);
  assert.equal(image.toString('hex',0,8),'89504e470d0a1a0a',filename);
 }
});
test('real transparent 3D Journey sprites imported directly from original kit',async()=>{
 const states=['node_idle','node_focus','node_pressed','node_progress','node_completed','node_unlocked'];
 for(const state of states){
  const data=await bytes(staticJourneyNode(state));
  assert.equal(data.toString('hex',0,8),'89504e470d0a1a0a',state);
  assert.ok(data.byteLength>5000,state);
 }
});
