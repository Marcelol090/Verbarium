import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';

const base=process.env.VERBARIUM_QA_URL||'http://127.0.0.1:4173';
const output='artifacts/mobile-visual';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const widths=[320,360,390,430];
const results=[];
async function create(width){
 const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 return {page,errors};
}
async function inspect(page,route,width){
 await page.evaluate(()=>document.fonts?.ready);
 const metrics=await page.evaluate(()=>{
  const rect=el=>{const r=el?.getBoundingClientRect();return r?{left:r.left,top:r.top,right:r.right,bottom:r.bottom,height:r.height,width:r.width}:null};
  const home=document.body.dataset.vbApp==='home';
  const hero=document.querySelector(home?'.vb10-hero':'.welcome-card');
  const mascot=document.querySelector(home?'.vb10-mascot-stage img':'.welcome-hero img');
  const primary=document.querySelector(home?'.vb10-primary':'.welcome-card .primary-action');
  const mascotRect=rect(mascot),heroRect=rect(hero);
  const nav=document.querySelector(home?'.mobile-nav':'.bottom-nav');
  const navDisplay=nav?getComputedStyle(nav).display:'none';
  const hScroll=document.documentElement.scrollWidth>window.innerWidth+2||document.body.scrollWidth>window.innerWidth+2;
  const measured={
   viewport:window.innerWidth,docWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,
   hScroll,primaryHeight:rect(primary)?.height||0,
   hero:heroRect,mascot:mascotRect,mascotNatural:mascot?[mascot.naturalWidth,mascot.naturalHeight]:null,
   mascotInside:!!(heroRect&&mascotRect&&mascotRect.left>=heroRect.left-3&&mascotRect.right<=heroRect.right+3&&mascotRect.top>=heroRect.top-3&&mascotRect.bottom<=heroRect.bottom+3),
   navVisible:navDisplay!=='none',artVersion:document.querySelector('link[href*="precision-v10"]')?10:0
  };
  return measured;
 });
 assert.equal(metrics.hScroll,false,route+' overflow at '+width+': '+JSON.stringify(metrics));
 assert.equal(metrics.artVersion,10,route+' missing V10 cascade');
 assert.equal(metrics.mascotInside,true,route+' mascot cropped at '+width+': '+JSON.stringify(metrics));
 assert.ok(metrics.mascotNatural?.[0]>0,route+' mascot source absent');
 assert.ok(metrics.primaryHeight>=48,route+' primary button below 48px');
 assert.equal(metrics.navVisible,true,route+' missing bottom navigation');
 results.push({route,width,...metrics});
 await page.screenshot({path:path.join(output,route+'-'+width+'.png'),fullPage:width===390,animations:'disabled'});
}
try{
 for(const width of widths){
  const {page:home,errors:homeErrors}=await create(width);
  await home.goto(base+'/',{waitUntil:'networkidle',timeout:60000});
  await home.locator('.vb10-hero').waitFor({timeout:15000});
  await inspect(home,'home',width);
  if(width===390){
   await home.locator('.vb10-primary').click();
   await home.locator('.vb10-rule-card').waitFor({timeout:15000});
   await home.locator('.vb8-exercise').waitFor({timeout:15000});
   await home.screenshot({path:path.join(output,'home-lesson-390.png'),animations:'disabled'});
  }
  assert.deepEqual(homeErrors,[],'Home script errors at '+width);
  await home.close();
  const {page:academy,errors:academyErrors}=await create(width);
  await academy.goto(base+'/academy/',{waitUntil:'networkidle',timeout:60000});
  await academy.locator('.welcome-card').waitFor({timeout:15000});
  await inspect(academy,'academy',width);
  if(width===390){
   await academy.locator('.welcome-card button[data-unit]').first().click();
   await academy.locator('.lesson-wrap').waitFor({timeout:15000});
   const order=await academy.evaluate(()=>{
    const p=document.querySelector('.vb10-question-head'),a=document.querySelector('.actor-stage');
    return {question:p?.getBoundingClientRect().top,actor:a?.getBoundingClientRect().top};
   });
   assert.ok(order.question<order.actor,'Prompt must come before artwork');
   await academy.screenshot({path:path.join(output,'academy-lesson-390.png'),fullPage:true,animations:'disabled'});
  }
  assert.deepEqual(academyErrors,[],'Academy script errors at '+width);
  await academy.close();
 }
 const {page:onboarding,errors:onboardingErrors}=await create(390);
 await onboarding.goto(base+'/onboarding/',{waitUntil:'networkidle',timeout:60000});
 await onboarding.locator('.ob-art').waitFor();
 const background=await onboarding.locator('.ob-art').evaluate(el=>{
  const s=getComputedStyle(el);
  return {background:s.backgroundImage,size:s.backgroundSize,clip:s.borderRadius};
 });
 assert.ok(background.background.includes('landscape-first.svg'),'Onboarding uses low-quality or incorrect hero scene');
 assert.ok(!background.size.includes('100% 100%'),'Onboarding background stretched');
 await onboarding.screenshot({path:path.join(output,'onboarding-390.png'),fullPage:true,animations:'disabled'});
 assert.deepEqual(onboardingErrors,[],'Onboarding script errors');
 results.push({route:'onboarding',width:390,...background});
 await onboarding.close();
 const {page:gallery,errors:galleryErrors}=await create(390);
 await gallery.goto(base+'/ui-kit/precision-v8/',{waitUntil:'networkidle',timeout:60000});
 await gallery.locator('#asset-switch').click();
 await gallery.locator('#assets .asset-card').first().waitFor({timeout:15000});
 const assetCount=await gallery.locator('#assets .asset-card').count();
 assert.equal(assetCount,48);
 await gallery.screenshot({path:path.join(output,'studio-assets-390.png'),animations:'disabled'});
 assert.deepEqual(galleryErrors,[],'Studio script errors');
 results.push({route:'studio-assets',width:390,assetCount});
 await gallery.close();
}finally{await browser.close();}
await writeFile(path.join(output,'measurements.json'),JSON.stringify(results,null,2));
console.log('Verbarium Mobile V10 visual QA passed',results.length,'checks across 320/360/390/430px');
