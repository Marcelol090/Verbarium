import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';

const base=process.env.VERBARIUM_QA_URL||'http://127.0.0.1:4173';
const out='artifacts/path-v13';
const widths=[320,360,390,430];
const filenames=['scene_sky','path_ribbon','node_current','node_completed','node_milestone','node_locked','check_small','destination_flag','card_shell','foreground_hills'];
const reports=[];
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
async function makePage(width,seeded=false){
 const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const errors=[];
 page.on('pageerror',err=>errors.push(err.message));
 if(seeded)await page.addInitScript(()=>{
  localStorage.setItem('verbarium:progress:v1',JSON.stringify({
   completed:['be','present','questions','articles'],completedAt:{},lessonSessions:{},attempts:0,correct:0,
   activity:[],reviews:{},sessions:[],nickname:'Explorador'
  }));
 });
 await page.goto(base+'/',{waitUntil:'networkidle',timeout:60000});
 await page.locator('.mobile-nav button[data-route="learn"]').click();
 await page.locator('.vb13-map').waitFor({timeout:12000});
 await page.locator('.vb13-map-node img').first().evaluate(img=>img.decode());
 return {page,errors};
}
try{
 for(const width of widths){
  for(const seeded of [false,true]){
   const {page,errors}=await makePage(width,seeded);
   const stage=seeded?'progressed':'new';
   const measurement=await page.evaluate(()=>{
    const r=(el)=>{const a=el?.getBoundingClientRect();return a?{l:a.left,t:a.top,r:a.right,b:a.bottom,w:a.width,h:a.height}:null};
    const map=document.querySelector('.vb13-map');
    const mapRect=r(map);
    const caption=document.querySelector('.vb13-current-card');
    const nodes=[...document.querySelectorAll('.vb13-map-step')].map((el)=>{
     const btn=el.querySelector('button'),rect=r(btn);
     return {slot:el.dataset.slot,state:el.dataset.nodeState,graphic:btn?.querySelector('img')?.getAttribute('src'),
       width:rect?.w,height:rect?.h,
       withinMap:!!(rect&&mapRect&&rect.l>=mapRect.l-2&&rect.r<=mapRect.r+2&&rect.t>=mapRect.t-2&&rect.b<=mapRect.b+2),
       available:!btn.disabled
     };
    });
    const allImages=[...document.querySelectorAll('.vb13-path-page img')].map(img=>({
      src:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>0,width:img.naturalWidth,height:img.naturalHeight
    }));
    const clip=caption?{caption:r(caption),bookIconHydrated:!!caption.querySelector('.vb13-card-icon svg'),fullyInside:(()=>{
      const a=r(caption);return a.l>=mapRect.l-3&&a.r<=mapRect.r+3&&a.t>=mapRect.t-3&&a.b<=mapRect.b+3;
    })()}:null;
    return {viewport:innerWidth,map:mapRect,nodes,images:allImages,clip,
      overflow:document.documentElement.scrollWidth>innerWidth+2,
      catalogExists:!!document.querySelector('.vb13-map-all'),
      stylesheetLoaded:!!document.querySelector('link[href*="precision-v13.css"]')
    };
   });
   assert.equal(measurement.overflow,false,'horizontal overflow at '+width+' '+stage);
   assert.equal(measurement.stylesheetLoaded,true,'V13 style absent');
   assert.equal(measurement.nodes.length,5);
   assert.ok(measurement.nodes.every(x=>x.available),'Upcoming lessons must remain accessible');
   assert.ok(measurement.nodes.every(x=>x.withinMap),'Learning nodes cannot clip');
   assert.ok(measurement.nodes.every(x=>x.width>=80&&x.height>=80),'Node touch targets too small');
   assert.ok(measurement.images.every(x=>x.loaded),'Failed image: '+JSON.stringify(measurement.images));
   assert.equal(measurement.clip?.fullyInside,true,'Current lesson card clipped at '+width+' '+stage);
   assert.equal(measurement.clip?.bookIconHydrated,true,'Current lesson card is missing the real book glyph');
   assert.equal(measurement.catalogExists,true);
   if(seeded){
    assert.deepEqual(measurement.nodes.map(x=>x.state),['completed','completed','current','upcoming','upcoming']);
    assert.ok(measurement.nodes[0].graphic.includes('node_completed.webp'));
    assert.ok(measurement.nodes[1].graphic.includes('node_milestone.webp'));
    assert.ok(measurement.nodes[2].graphic.includes('node_current.webp'));
    assert.ok(measurement.nodes[3].graphic.includes('node_locked.webp'));
   }else{
    assert.deepEqual(measurement.nodes.map(x=>x.state),['current','upcoming','upcoming','upcoming','upcoming']);
   }
   if(width===390&&!seeded){
    for(const file of filenames){
     const response=await page.request.get(base+'/verbarium-scenes/v13/'+file+'.webp');
     assert.equal(response.status(),200,file+' not served by Vite');
     assert.match(response.headers()['content-type']||'',/image\/webp/,file+' not a WebP response');
    }
    await page.locator('.vb13-map-step.is-current .vb13-map-node').click();
    await page.locator('.vb11-quiz-screen').waitFor({timeout:12000});
    await page.screenshot({path:path.join(out,'node-opens-lesson.png'),animations:'disabled'});
    await page.locator('.vb11-quiz-close').click();
    await page.locator('.vb13-map').waitFor();
   }
   if(width===390&&seeded){
    await page.locator('.vb13-map-all summary').click();
    await page.locator('.vb13-map-all button[data-action="open-lesson"]').first().click();
    await page.locator('.vb11-quiz-screen').waitFor({timeout:12000});
    await page.locator('.vb11-quiz-close').click();
    await page.locator('.vb13-map').waitFor();
   }
   await page.screenshot({path:path.join(out,'learning-path-'+width+'-'+stage+'.png'),fullPage:true,animations:'disabled'});
   assert.deepEqual(errors,[],'Runtime errors '+width+' '+stage);
   reports.push({width,stage,...measurement});
   await page.close();
  }
 }
}finally{await browser.close();}
await writeFile(path.join(out,'measurements.json'),JSON.stringify(reports,null,2));
console.log('V13 learning path QA passed',reports.length,'layouts and',filenames.length,'assets');
