import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';

const base=process.env.VERBARIUM_QA_URL||'http://127.0.0.1:4173';
const output='artifacts/mobile-visual';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const widths=[320,360,390,430];
const results=[];
let failed=0;
const makePage=async(width)=>{
 const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 page.on('pageerror',err=>console.error('[pageerror]',width,err.message));
 return page;
};
async function check(page,route,width){
 await page.evaluate(()=>document.fonts?.ready).catch(()=>{});
 const findings=await page.evaluate(()=>{
  const rect=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom}};
  const home=document.body.dataset.vbApp==='home';
  const card=document.querySelector(home?'.vb7-hero':'.welcome-card');
  const art=document.querySelector(home?'.vb7-hero__mascot .vb-fox-home-mascot':'.welcome-card .welcome-hero');
  const artR=rect(art),cardR=rect(card);
  const artInside=!!(artR&&cardR&&artR.left>=cardR.left-2&&artR.right<=cardR.right+2&&artR.top>=cardR.top-2&&artR.bottom<=cardR.bottom+2);
  const viewport=document.documentElement.clientWidth;
  const horizontalOverflow=document.documentElement.scrollWidth>viewport+2||document.body.scrollWidth>viewport+2;
  const offenders=horizontalOverflow?[...document.body.querySelectorAll('*')].filter(el=>{
   const st=getComputedStyle(el),r=el.getBoundingClientRect();
   if(st.display==='none'||r.width===0||r.height===0)return false;
   return r.right>viewport+3||r.left< -3;
  }).slice(0,15).map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName,cls:String(el.className).slice(0,80),left:Math.round(r.left),right:Math.round(r.right)}}):[];
  const bg=card?getComputedStyle(card).backgroundImage:'';
  const natural=home?{w:art?.naturalWidth||0,h:art?.naturalHeight||0}: {w:art?.querySelector('img')?.naturalWidth||0,h:art?.querySelector('img')?.naturalHeight||0};
  return {viewport,horizontalOverflow,offenders,card:cardR,art:artR,artInside,background:bg.slice(0,250),natural};
 });
 const ok=!findings.horizontalOverflow&&(route==='home'||route==='academy'?findings.artInside:true)&&findings.natural.w>0;
 results.push({width,route,ok,...findings});
 if(!ok){failed++;console.error('VISUAL GEOMETRY FAILURE:',route,width,JSON.stringify(findings));}
 await page.screenshot({path:path.join(output,route+'-'+width+'.png'),fullPage:width===390,animations:'disabled'});
}
try{
 for(const width of widths){
  const home=await makePage(width);
  await home.goto(base+'/',{waitUntil:'networkidle',timeout:60000});
  await home.locator('.vb7-hero').waitFor({timeout:15000});
  await check(home,'home',width);
  await home.close();
  const academy=await makePage(width);
  await academy.goto(base+'/academy/',{waitUntil:'networkidle',timeout:60000});
  await academy.locator('.welcome-card').waitFor({timeout:15000});
  await check(academy,'academy',width);
  if(width===390){
   await academy.locator('.welcome-card button[data-unit]').first().click();
   await academy.locator('.lesson-wrap').waitFor({timeout:20000});
   await academy.screenshot({path:path.join(output,'academy-lesson-390.png'),fullPage:true,animations:'disabled'});
  }
  await academy.close();
 }
 const onboarding=await makePage(390);
 await onboarding.goto(base+'/onboarding/',{waitUntil:'networkidle',timeout:60000});
 const art=onboarding.locator('.ob-art');
 await art.waitFor({timeout:15000});
 const bg=await art.evaluate(el=>({size:getComputedStyle(el).backgroundSize,position:getComputedStyle(el).backgroundPosition,foxSize:getComputedStyle(el,'::before').backgroundSize,foxImage:getComputedStyle(el,'::before').backgroundImage}));
 if(bg.foxSize!=='contain'||!bg.foxImage.includes('fox_')){failed++;console.error('Onboarding Pip is not safely contained:',bg);}
 await onboarding.screenshot({path:path.join(output,'onboarding-390.png'),fullPage:true,animations:'disabled'});
 results.push({width:390,route:'onboarding',background:bg});
 await onboarding.close();
}finally{await browser.close();}
await writeFile(path.join(output,'measurements.json'),JSON.stringify(results,null,2));
console.log('Mobile visual QA:',results.length,'snapshots/checks,',failed,'failures');
if(failed)process.exitCode=1;
