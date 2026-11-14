import {imageUrl,pictureMarkup} from './catalog.js';
/** Decorative enhancement is optional. Existing Academy/Studio always remain usable without raster bundle. */
export async function rasterAvailable(){
  try {const r=await fetch('/ui-kit/raster/manifest.json',{method:'GET',cache:'force-cache'}); if(!r.ok) return false;
    const json=await r.json();return json.count===235 && Array.isArray(json.assets) && json.assets.length===235;
  }catch{return false;}
}
const navIcons={path:'target',practice:'lesson_book',review:'streak_fire',profile:'star',teacher:'graduation_cap'};
function decorate(el,id,tag='img'){if(!el||el.querySelector('[data-vbk-raster]'))return;const img=document.createElement(tag);img.className='vbk-raster-image';img.dataset.vbkRaster=id;img.setAttribute('aria-hidden','true');img.alt='';img.loading='lazy';img.decoding='async';img.src=imageUrl(id);el.prepend(img);}
function enhanceAcademy(root){for(const [key,id] of Object.entries(navIcons)){root.querySelectorAll('.nav-link[data-route="'+key+'"] > span').forEach(el=>{if(el.querySelector('img')){const im=el.querySelector('img');if(im.dataset.vbkRaster!=='icons/'+id){im.dataset.vbkRaster='icons/'+id;im.src=imageUrl('icons/'+id);im.alt='';}}else decorate(el,'icons/'+id);});}
 const pills=root.querySelectorAll('.top-stats .stat-pill');['streak_fire','star','gem'].forEach((name,i)=>{const el=pills[i];if(!el||el.querySelector('[data-vbk-raster]'))return;const first=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);if(first)first.textContent='';decorate(el,'icons/'+name);});
 root.querySelectorAll('.welcome-card').forEach(el=>{el.classList.add('vbk-raster-welcome');}); 
 root.querySelectorAll('.world-head').forEach(el=>el.classList.add('vbk-raster-world'));
 root.querySelectorAll('.lesson-track').forEach(el=>el.classList.add('vbk-raster-live-progress'));
}
function enhanceStudio(root){root.querySelectorAll('.lesson-hero').forEach(el=>el.classList.add('vbk-raster-studio-hero'));root.querySelectorAll('.block-card').forEach(el=>el.classList.add('vbk-raster-studio-block'));}
function enhanceHome(root){root.querySelectorAll('.hero-card').forEach(el=>el.classList.add('vbk-raster-home-hero'));}
function enhanceOnboarding(root){root.querySelectorAll('.ob-art').forEach(el=>el.classList.add('vbk-raster-onboard-art'));const goal={
'globe':'globe','briefcase':'target','chat':'chat','book':'lesson_book','star':'star',
'target':'target','volume':'speaker'};root.querySelectorAll('.ob-view img[src^="/ui-kit/icons/"]').forEach(img=>{const name=img.src.split('/').pop().replace('.svg','');const mapped=goal[name];if(mapped){img.src=imageUrl('icons/'+mapped);img.dataset.vbkRaster='icons/'+mapped;}});}
const enhancements={academy:enhanceAcademy,studio:enhanceStudio,home:enhanceHome,onboarding:enhanceOnboarding};
export function applyRasterKit(root=document){const fn=enhancements[document.body.dataset.vbApp];if(fn)fn(root);}
export async function startRasterKit(){if(typeof document==='undefined')return false;if(!await rasterAvailable())return false;document.documentElement.classList.add('vbk-has-raster');applyRasterKit();let queued=false;const observer=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;applyRasterKit();});});observer.observe(document.body,{childList:true,subtree:true});return true;}
if(typeof document!=='undefined')startRasterKit();
