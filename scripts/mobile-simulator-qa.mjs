import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';

const base=process.env.VERBARIUM_QA_URL||'http://127.0.0.1:4173';
const output='artifacts/mobile-simulator';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const reports=[];
async function context(width,height){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:width<=700,hasTouch:width<=700,reducedMotion:'reduce'});
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/ui-kit/precision-v8/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.locator('#app-frame').waitFor({state:'attached'});
 await page.waitForFunction(()=>{
  const iframe=document.querySelector('#app-frame');
  return !!(iframe?.contentWindow && iframe.contentDocument?.body?.dataset?.vbApp);
 },null,{timeout:40000});
 return {page,errors};
}
async function dimensions(page){
 return page.evaluate(()=>{
  const doc=document.documentElement,phone=document.querySelector('#phone-device'),iframe=document.querySelector('#app-frame');
  return {
   outerWidth:window.innerWidth,
   bodyWidth:doc.scrollWidth,
   appWidth:iframe.contentWindow.innerWidth,
   appHeight:iframe.contentWindow.innerHeight,
   phoneWidth:Math.round(phone.getBoundingClientRect().width),
   realRoute:iframe.contentDocument.body.dataset.vbApp,
   phoneTop:getComputedStyle(document.querySelector('.phone-top')).display,
   simulatorVisible:!!document.querySelector('.phone-stage').getBoundingClientRect().width
  };
 });
}
try{
 const desktop=await context(1440,1000);const d=desktop.page;
 let m=await dimensions(d);
 assert.equal(m.appWidth,390,'desktop phone iframe must actually be 390px');
 assert.equal(m.appHeight,844,'desktop phone iframe must actually be 844px tall');
 assert.equal(m.realRoute,'home');
 await d.screenshot({path:path.join(output,'desktop-phone-390.png'),fullPage:true,animations:'disabled'});
 reports.push({case:'desktop-first-render',...m,errors:desktop.errors});
 for(const width of [320,360,390,430]){
  await d.selectOption('#device-select',String(width));
  await d.waitForFunction(w=>document.querySelector('#app-frame').contentWindow.innerWidth===w,width);
  m=await dimensions(d);assert.equal(m.appWidth,width);
  assert.equal(m.appHeight,{320:720,360:800,390:844,430:932}[width]);
  await d.screenshot({path:path.join(output,'desktop-phone-'+width+'.png'),animations:'disabled'});
  reports.push({case:'desktop-switch-'+width,...m});
 }
 await d.locator('[data-screen="academy"]').click();
 await d.waitForFunction(()=>document.querySelector('#app-frame')?.contentDocument?.body?.dataset?.vbApp==='academy');
 await d.screenshot({path:path.join(output,'desktop-academy-430.png'),animations:'disabled'});
 reports.push({case:'academy-route',...await dimensions(d)});
 await d.locator('[data-screen="lesson"]').click();
 await d.waitForFunction(()=>!!document.querySelector('#app-frame')?.contentDocument?.querySelector('.lesson-wrap'),null,{timeout:30000});
 await d.screenshot({path:path.join(output,'desktop-lesson-430.png'),animations:'disabled'});
 reports.push({case:'lesson-interactive',...await dimensions(d)});
 await d.close();

 for(const width of [320,360,390,430]){
  const {page,errors}=await context(width,810);
  m=await dimensions(page);
  assert.equal(m.appWidth,width,'Native preview must use the screen width');
  assert.equal(m.phoneTop,'none','No fake mobile OS bar inside actual phone');
  assert.ok(m.bodyWidth<=width+2,'No horizontal scroll in simulator');
  const innerOverflow=await page.evaluate(()=>{
   const app=document.querySelector('#app-frame').contentDocument;
   return app.documentElement.scrollWidth>app.documentElement.clientWidth+2;
  });
  assert.equal(innerOverflow,false,'No horizontal overflow in actual app at '+width);
  await page.screenshot({path:path.join(output,'native-mobile-'+width+'.png'),animations:'disabled'});
  reports.push({case:'native-'+width,...m,innerOverflow,errors});
  if(width===390){
   await page.locator('[data-mode-btn="assets"]').click();
   await page.waitForFunction(()=>document.querySelectorAll('.asset-card').length===48,null,{timeout:20000});
   await page.screenshot({path:path.join(output,'native-assets-390.png'),animations:'disabled'});
   await page.locator('[data-mode-btn="rules"]').click();
   await page.screenshot({path:path.join(output,'native-tokens-390.png'),animations:'disabled'});
   await page.locator('[data-mode-btn="preview"]').click();
   await page.locator('[data-mobile-screen="onboarding"]').click();
   await page.waitForFunction(()=>document.querySelector('#app-frame').contentDocument.body.dataset.vbApp==='onboarding');
   await page.screenshot({path:path.join(output,'native-onboarding-390.png'),animations:'disabled'});
   reports.push({case:'assets-48-and-onboarding',width});
  }
  await page.close();
 }
 await writeFile(path.join(output,'report.json'),JSON.stringify(reports,null,2));
 console.log('Mobile simulator QA PASSED',reports.length,'cases');
}finally{
 await browser.close();
}
