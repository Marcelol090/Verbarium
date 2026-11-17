import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const css=read('public/ui-kit/precision-v12.css');
const motion=read('src/motion.js');
const index=read('index.html');
const academy=read('public/academy/index.html');
const reorder=read('public/ui-kit/precision-v8.js');
const pkg=JSON.parse(read('package.json'));

test('V12 layer is loaded last for both mobile entrypoints',()=>{
 for(const html of [index,academy]){
  assert.match(html,/family=Inter\+Tight/,'Inter Tight webfont must load');
  assert.ok(html.indexOf('precision-v12.css')>html.indexOf('precision-v11.css'));
  assert.ok(html.indexOf('precision-v12.css')>html.indexOf('precision-v10.css'));
  assert.doesNotMatch(html,/rel="stylesheet" rel="stylesheet"/);
 }
 assert.ok(reorder.indexOf('append(precisionV12Style)')>reorder.indexOf('append(precisionV11Style)'));
});

test('system typography matches supplied tight mobile reference without losing readability',()=>{
 assert.match(css,/--text:#30234D/);
 assert.match(css,/--muted:#756A87/);
 assert.match(css,/--strong:#6138B8/);
 assert.match(css,/--track:#EDE7F4/);
 assert.match(css,/font:600 22px\/28px "Inter Tight"/);
 assert.match(css,/font:600 19px\/24px "Inter Tight"/);
 assert.match(css,/font:400 14\.5px\/18px "Inter Tight"/);
 assert.match(css,/letter-spacing:-\.7px/);
 assert.match(css,/letter-spacing:\.6px/);
});

test('cards use layered shadows, quiet separators and functional control depth',()=>{
 assert.match(css,/--vb12-shadow:/);
 assert.match(css,/--vb12-shadow-raised:/);
 assert.match(css,/--vb12-highlight:inset 0 6px/);
 assert.match(css,/border-color:var\(--track\)/);
 assert.match(css,/\.vb11-back,\.vb11-quiz-close/);
 assert.match(css,/width:46px;height:46px/);
 assert.match(css,/min-height:46px/);
 assert.match(css,/outline:3px solid/);
 assert.match(css,/\[data-state="correct"\]/);
 assert.match(css,/\[data-state="wrong"\]/);
});

test('Motion remains the one installed engine for mobile microinteractions',()=>{
 assert.ok(pkg.dependencies.motion,'Motion package is already installed');
 assert.equal(pkg.dependencies.animejs,undefined,'Do not install duplicate timeline engines');
 assert.match(motion,/import \{animate,stagger\} from 'motion'/);
 assert.match(motion,/route==='home'/);
 assert.match(motion,/route==='learn'/);
 assert.match(motion,/route==='progress'/);
 assert.match(motion,/route==='lesson'/);
 assert.match(motion,/\.vb11-map-node/);
 assert.match(motion,/Nodes are absolutely positioned/);
 assert.match(motion,/opacity:\[0,1\]/);
 assert.match(motion,/prefers-reduced-motion: reduce/);
 assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
});

test('no looping mascot, paint-heavy keyframes or animation of absolute map transforms',()=>{
 assert.doesNotMatch(motion,/\bloop\s*:/);
 assert.doesNotMatch(motion,/infinite/i);
 assert.doesNotMatch(motion,/transformOrigin/);
 assert.doesNotMatch(css,/@keyframes/);
});
