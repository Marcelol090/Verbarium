/** Verbarium Precision V8, mascot-only compatibility hydrator.
 * V9 controls own their SVG glyphs, copy, touch geometry and interaction state.
 * Only dedicated mascot illustration slots may receive raster art.
 */
// V7 moves its linked stylesheet to the end of <head>. V8 must run afterward
// or the old, equally-specific declarations win by document order.
const precisionV8Style=document.querySelector('link[href="/ui-kit/precision-v8.css"]');
const verbariumV9Style=document.querySelector('link[href="/ui-kit/verbarium-design-v9.css"]');
if(precisionV8Style&&precisionV8Style.parentNode===document.head)document.head.append(precisionV8Style);
if(verbariumV9Style&&verbariumV9Style.parentNode===document.head)document.head.append(verbariumV9Style);

const ROOT='/verbarium-visual-kit/';
const app=document.body.dataset.vbApp||'';
const host=app==='home'?document.querySelector('#main'):app==='academy'?document.querySelector('#content'):document.querySelector('.onboarding-shell');
const mobile=window.matchMedia('(max-width:770px)');
const resolved=new Map();
let manifest=null,queued=false;
const ALLOWED=/^assets\/mascot\/[a-z0-9_-]+\.webp$/;
function asset(name){
 const item=manifest?.assets?.[name];
 return item&&ALLOWED.test(item.path||'')?ROOT+item.path:null;
}
function load(name){
 if(resolved.has(name))return resolved.get(name);
 const src=asset(name);
 const p=src?new Promise(ok=>{const img=new Image();img.decoding='async';img.onload=()=>ok(src);img.onerror=()=>ok(null);img.src=src}):Promise.resolve(null);
 resolved.set(name,p);return p;
}
function setImage(node,name){
 if(!node||node.dataset.vb8Asset===name)return;
 load(name).then(src=>{
  if(!src||!node.isConnected||node.dataset.vb8Asset===name)return;
  node.setAttribute('src',src);
  node.setAttribute('decoding','async');
  node.style.objectFit='contain';node.style.objectPosition='center';
  node.dataset.vb8Asset=name;
 });
}
function decorateHome(){
 if(!host)return;
 // V9 keeps button and feature glyphs as crisp SVGs. Only the fox is an illustration layer.
 const mascot=host.querySelector('.vb7-hero__mascot .vb-fox-home-mascot');
 if(mascot)setImage(mascot,'fox_waving');
}
function decorateAcademy(){
 if(!host)return;
 // The generated 3D art is proportional to its dedicated art slot.
 setImage(host.querySelector('.welcome-card .welcome-hero img'),'fox_teacher');
 setImage(host.querySelector('.sentence-lab-entry>img'),'fox_reading');
 setImage(host.querySelector('.fox-lesson-guide img'),'fox_teacher');
 setImage(host.querySelector('.fox-finish-mark'),'fox_waving');
 // Daily statistics use the shared SVG glyphs in their markup; do not overlay raster tiles.
}
function decorateOnboarding(){
 const panel=document.querySelector('.ob-art');
 if(!panel||panel.querySelector(':scope > .vb8-onboard-backdrop'))return;
 const backdrop=document.createElement('span');
 backdrop.className='vb8-onboard-backdrop';backdrop.setAttribute('aria-hidden','true');
 panel.prepend(backdrop);
}
function paint(){
 if(!manifest||!mobile.matches)return;
 if(app==='home')decorateHome();
 else if(app==='academy')decorateAcademy();
 else if(app==='onboarding')decorateOnboarding();
 document.body.dataset.vbPrecision='8';
}
function schedule(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;paint()});
}
async function start(){
 try{
  const response=await fetch(ROOT+'manifest.json',{cache:'force-cache'});
  if(!response.ok)return;
  const data=await response.json();
  if(!data||!data.assets||Object.keys(data.assets).length!==48)return;
  manifest=data;
 }catch{return}
 schedule();
 if(host)new MutationObserver(schedule).observe(host,{childList:true,subtree:false});
 mobile.addEventListener?.('change',schedule);
}
start();
