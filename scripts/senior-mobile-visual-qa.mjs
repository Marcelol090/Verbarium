import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';

const base=process.env.VERBARIUM_QA_URL||'http://127.0.0.1:4173';
const dir='artifacts/senior-mobile';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[];const results=[];
async function visit(path,width,name,selector){
 const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1,reducedMotion:'reduce',isMobile:true,hasTouch:true});
 page.on('pageerror',err=>errors.push({page:name,width,error:err.message}));
 try{
  const response=await page.goto(base+path,{waitUntil:'networkidle',timeout:60000});
  if(!response?.ok())throw Error(`HTTP ${response?.status()} ${path}`);
  await page.locator(selector).first().waitFor({timeout:25000});
  await page.evaluate(()=>document.fonts?.ready);
  const geometry=await page.evaluate(()=>{
   const w=document.documentElement.clientWidth,overflow=document.documentElement.scrollWidth-w;
   const hero=document.querySelector('.vb-fox-home-mascot,.welcome-hero img');
   const r=hero?.getBoundingClientRect();
   return {w,overflow,hero:r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,naturalWidth:hero.naturalWidth}:null};
  });
  if(geometry.overflow>2)throw Error(`Horizontal overflow ${geometry.overflow}px`);
  if(geometry.hero){if(geometry.hero.naturalWidth<400)throw Error('Low resolution mascot or broken asset');if(geometry.hero.left< -2 || geometry.hero.right>width+2)throw Error('Mascot beyond viewport')}
  if(name==='gallery'){
   await page.locator('.asset-item').first().waitFor();
   const count=await page.locator('.asset-item').count();
   if(count!==48)throw Error(`Expected 48 isolated assets but found ${count}`);
   await page.locator('#filters button').nth(1).click();
   if(await page.locator('.asset-item').count()!==8)throw Error('Button asset filtering failed');
   await page.locator('#filters button').first().click();
  }
  if(name==='academy'){
   const tap=await page.locator('.welcome-card .primary-action').boundingBox();
   if(!tap||tap.height<48)throw Error('CTA target less than 48px');
  }
  await page.screenshot({path:`${dir}/${name}-${width}.png`,animations:'disabled',fullPage:width===390});
  results.push({name,width,...geometry});
  await page.close();
 }catch(e){errors.push({page:name,width,error:e.message});await page.screenshot({path:`${dir}/${name}-${width}-failure.png`,fullPage:true}).catch(()=>{});await page.close()}
}
try{
 for(const w of [320,360,390,430]){
  await visit('/',w,'home','.vb7-hero');
  await visit('/academy/',w,'academy','.welcome-card');
  await visit('/verbarium-design/',w,'gallery','.asset-grid .asset-item');
 }
}finally{await browser.close()}
await writeFile(dir+'/results.json',JSON.stringify({results,errors},null,2));
console.log('Senior Visual QA:',results.length,'screens',errors.length,'issues');
if(errors.length){console.error(JSON.stringify(errors,null,2));process.exitCode=1}
