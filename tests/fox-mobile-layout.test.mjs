import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const mobile=read('public/academy/fox-mobile.css');
const home=read('src/fox-mobile-home.css');
const oldVideo=read('public/ui-kit/video-qa.css');
const oldRaster=read('public/ui-kit/raster/styles.css');

function balance(css){
 const stripped=css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,'""');
 let depth=0;
 for(const ch of stripped){if(ch==='{')depth++;if(ch==='}')depth--;if(depth<0)return false;}
 return depth===0;
}

test('mobile CSS blocks are balanced and parseable at brace level',()=>{
 for(const css of [mobile,home,oldVideo,oldRaster])assert.equal(balance(css),true);
});

test('Fox asset uses intrinsic layout instead of negative offsets / oversized cropping',()=>{
 assert.match(home,/\.vb-fox-home-mascot\{[^}]*position:static;[^}]*max-width:110px;[^}]*object-fit:contain/);
 assert.doesNotMatch(home,/\.vb-fox-home-mascot\{[^}]*width:115%/);
 assert.match(mobile,/\.welcome-hero\{[^}]*position:relative;[^}]*grid-column:2;[^}]*max-width:100%;/);
 assert.match(mobile,/\.welcome-hero img\{[^}]*object-fit:contain/);
});

test('background layers do not overwrite Fox mobile and onboarding artwork is not cropped',()=>{
 assert.match(oldVideo,/@media\(min-width:771px\)\{\s*\/\* Keep detailed 3D artwork/);
 assert.match(oldRaster,/@media\(min-width:771px\)\{\s*\.vbk-has-raster body\[data-vb-app="academy"\] \.welcome-card/);
 assert.match(oldVideo,/\.ob-art\{background-repeat:no-repeat!important;background-position:center!important;background-size:contain!important/);
});

test('mobile controls keep distinct content and action areas',()=>{
 assert.match(mobile,/\.sentence-lab-links>a\{[^}]*min-height:48px/);
 assert.match(mobile,/\.lesson-wrap\{[^}]*padding:0;[^}]*min-width:0/);
 assert.match(home,/\.vb7-hero\{[^}]*grid-template-areas:"badge badge" "heading mascot" "desc mascot" "progress progress" "action action"/);
});
