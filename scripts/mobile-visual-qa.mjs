import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const base=process.env.VERBARIUM_QA_URL||'http://127.0.0.1:4173',dir='artifacts/mobile-visual';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const sizes=[320,360,390,430],reports=[];
async function open(route,width){
 const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+route,{waitUntil:'networkidle',timeout:60000});
 return {page,errors};
}
async function measure(page,route,width,{hero,mascot,primary,nav=true}={}){
 await page.evaluate(()=>document.fonts?.ready);
 const metrics=await page.evaluate(({hero,mascot,primary,nav})=>{
  const rect=el=>{const r=el?.getBoundingClientRect();return r?{x:r.x,y:r.y,left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}:null};
  const outer=rect(document.querySelector(hero)),art=document.querySelector(mascot),inner=rect(art),btn=rect(document.querySelector(primary));
  return {
   viewport:innerWidth,docWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,
   horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2||document.body.scrollWidth>innerWidth+2,
   hero:outer,art:inner,artLoaded:!!(art?.complete&&art.naturalWidth>0),primaryHeight:btn?.height||0,
   artInside:!!(outer&&inner&&inner.left>=outer.left-3&&inner.right<=outer.right+3&&inner.top>=outer.top-3&&inner.bottom<=outer.bottom+3),
   navVisible:!!document.querySelector('.mobile-nav')&&getComputedStyle(document.querySelector('.mobile-nav')).display!=='none',
   hasV11:!!document.querySelector('link[href*="precision-v11"]')
  };
 },{hero,mascot,primary,nav});
 assert.equal(metrics.horizontalOverflow,false,route+' overflow at '+width+': '+JSON.stringify(metrics));
 assert.equal(metrics.hasV11,true,'V11 missing on Home');
 assert.equal(metrics.artLoaded,true,route+' art not loaded');
 assert.equal(metrics.artInside,true,route+' mascot cropped');
 assert.ok(metrics.primaryHeight>=48,route+' touch target too small');
 if(nav)assert.equal(metrics.navVisible,true,route+' bottom navigation missing');
 reports.push({route,width,...metrics});
 return metrics;
}
async function screenshot(page,file,full=false){await page.screenshot({path:path.join(dir,file),fullPage:full,animations:'disabled'})}
try{
 for(const width of sizes){
  const {page:home,errors:homeErrors}=await open('/',width);
  await home.locator('.vb11-home').waitFor({timeout:15000});
  await measure(home,'home',width,{hero:'.vb11-welcome',mascot:'.vb11-welcome-fox',primary:'.vb11-hero-start'});
  assert.equal(await home.locator('.mobile-nav .mobile-item').count(),5,'Exactly five native nav tabs');
  await screenshot(home,'home-'+width+'.png',width===390);
  if(width===390){
   await home.locator('.mobile-nav button[data-route="learn"]').click();
   await home.locator('.vb11-map').waitFor();
   const map=await home.locator('.vb11-map').evaluate(el=>({width:el.getBoundingClientRect().width,scroll:document.documentElement.scrollWidth}));
   assert.ok(map.width<=390);
   assert.equal(await home.locator('.vb11-map-node').count(),5);
   await screenshot(home,'learning-path-390.png',true);
   await home.locator('.mobile-nav button[data-route="progress"]').click();
   await home.locator('.vb11-achievements').waitFor();
   assert.equal(await home.locator('.vb11-badge').count(),3);
   const earned=await home.locator('.vb11-badge.is-earned').count();
   assert.equal(earned,0,'Fresh visitor must not have fictional achievements');
   const trophy=await home.locator('.vb11-trophy-art').evaluate(img=>img.complete&&img.naturalWidth>0);
   assert.equal(trophy,true,'Trophy SVG missing');
   await screenshot(home,'achievements-390.png',true);
   await home.locator('.mobile-nav button[data-route="home"]').click();
   await home.locator('.vb11-hero-start').click();
   await home.locator('.vb11-answer').first().waitFor();
   assert.equal(await home.locator('.vb11-quiz-screen').count(),1);
   await screenshot(home,'lesson-390.png',true);
   await home.locator('.vb11-answer[data-value="am"]').click();
   assert.equal(await home.locator('.vb11-quiz-feedback').getAttribute('data-result'),'wrong');
   await screenshot(home,'feedback-wrong-390.png',true);
   await home.locator('button[data-action="lesson-next"]').click();
   await home.locator('.vb11-answer[data-value="Are"]').click();
   assert.equal(await home.locator('.vb11-quiz-feedback').getAttribute('data-result'),'correct');
   await screenshot(home,'feedback-correct-390.png',true);
  }
  assert.deepEqual(homeErrors,[],'Home script errors '+width+': '+homeErrors);
  await home.close();
  const {page:academy,errors:academyErrors}=await open('/academy/',width);
  await academy.locator('.welcome-card').waitFor({timeout:15000});
  const academyMetrics=await academy.evaluate(()=>{
   const hero=document.querySelector('.welcome-card'),art=hero?.querySelector('.welcome-hero img');
   const hr=hero?.getBoundingClientRect(),ar=art?.getBoundingClientRect();
   return {width:innerWidth,horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2,
      artLoaded:!!(art?.complete&&art.naturalWidth>0),artInside:!!(hr&&ar&&ar.left>=hr.left-3&&ar.right<=hr.right+3)};
  });
  assert.equal(academyMetrics.horizontalOverflow,false,'Academy overflow '+width);
  assert.equal(academyMetrics.artLoaded,true,'Academy mascot not loaded');
  assert.equal(academyMetrics.artInside,true,'Academy mascot clipped');
  reports.push({route:'academy',width,...academyMetrics});
  await screenshot(academy,'academy-'+width+'.png',width===390);
  if(width===390){
   await academy.locator('.welcome-card button[data-unit]').first().click();
   await academy.locator('.lesson-wrap').waitFor();
   await screenshot(academy,'academy-lesson-390.png',true);
  }
  assert.deepEqual(academyErrors,[],'Academy script errors '+width);
  await academy.close();
 }
 const {page:onboarding,errors:onboardingErrors}=await open('/onboarding/',390);
 await onboarding.locator('.ob-art').waitFor();
 const bg=await onboarding.locator('.ob-art').evaluate(el=>getComputedStyle(el).backgroundImage);
 assert.ok(bg.includes('landscape-first.svg'));
 await screenshot(onboarding,'onboarding-390.png',true);
 assert.deepEqual(onboardingErrors,[]);
 reports.push({route:'onboarding',width:390,background:bg});
 await onboarding.close();
 const {page:gallery,errors:galleryErrors}=await open('/ui-kit/precision-v8/',390);
 await gallery.locator('#asset-switch').click();
 await gallery.locator('#assets .asset-card').first().waitFor({timeout:20000});
 assert.equal(await gallery.locator('.asset-card').count(),48);
 await screenshot(gallery,'studio-assets-390.png');
 assert.deepEqual(galleryErrors,[]);
 await gallery.close();
 const {page:studio,errors:studioErrors}=await open('/ui-kit/precision-v10/',390);
 await studio.locator('.next-card').waitFor();
 assert.equal(await studio.locator('.scene-grid img').count(),4);
 await studio.locator('[data-answer="are"]').click();
 await studio.locator('#check-answer').click();
 assert.equal(await studio.locator('#quiz-feedback').getAttribute('data-result'),'wrong');
 await studio.locator('#reset-quiz').click();
 await studio.locator('[data-answer="is"]').click();
 await studio.locator('#check-answer').click();
 assert.equal(await studio.locator('#quiz-feedback').getAttribute('data-result'),'correct');
 await screenshot(studio,'studio-v10-components-390.png',true);
 assert.deepEqual(studioErrors,[]);
 await studio.close();
 for(const [name,route] of [['sentence-lab','/academy/sentence-lab/'],['sentence-practice','/academy/sentence-lab/practice.html']]){
  const {page,errors}=await open(route,390);
  await page.locator('.hero-head h1').waitFor();
  const scene=await page.locator('.hero-head').evaluate(el=>getComputedStyle(el).backgroundImage);
  assert.ok(scene.includes('landscape-talk.svg'));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
  await screenshot(page,name+'-390.png');
  assert.deepEqual(errors,[],name+' errors');
  await page.close();
 }
}finally{await browser.close()}
await writeFile(path.join(dir,'measurements.json'),JSON.stringify(reports,null,2));
console.log('Verbarium V11 visual QA passed:',reports.length,'layout measurements + functional screen flows');
