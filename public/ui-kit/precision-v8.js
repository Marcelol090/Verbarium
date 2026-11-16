/** Verbarium Precision V8, progressive decorative integration.
 * Native controls own all text, touch geometry, answer status and progress.
 * New art is restricted to real illustration slots. No gameplay mutation.
 */
// V7 moves its linked stylesheet to the end of <head>. V8 must run afterward
// or the old, equally-specific declarations win by document order.
const precisionV8Style=document.querySelector('link[href="/ui-kit/precision-v8.css"]');
const precisionV10Style=document.querySelector('link[href="/ui-kit/precision-v10.css"]');
const precisionV11Style=document.querySelector('link[href="/ui-kit/precision-v11.css"]');
if(precisionV8Style&&precisionV8Style.parentNode===document.head)document.head.append(precisionV8Style);
// The V10 contract must be the final cascade layer after the previous enhancers.
if(precisionV10Style&&precisionV10Style.parentNode===document.head)document.head.append(precisionV10Style);
if(precisionV11Style&&precisionV11Style.parentNode===document.head)document.head.append(precisionV11Style);

const ROOT='/verbarium-visual-kit/';
const app=document.body.dataset.vbApp||'';
const host=app==='home'?document.querySelector('#main'):app==='academy'?document.querySelector('#content'):document.querySelector('.onboarding-shell');
const mobile=window.matchMedia('(max-width:770px)');
const resolved=new Map();
let manifest=null,queued=false;
const ALLOWED=/^assets\/(?:mascot|rewards|buttons|cards|grids|labels|backgrounds)\/[a-z0-9_-]+\.webp$/;
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
function decorateExistingImage(container,name){
 if(!container)return;
 const art=container.querySelector(':scope > .vb7v-asset-box > img');
 if(art)setImage(art,name);
}
function inlineGlyph(parent,name){
 if(!parent||parent.dataset.vb8Illustration===name)return;
 load(name).then(src=>{
  if(!src||!parent.isConnected||parent.dataset.vb8Illustration===name)return;
  const old=parent.querySelector(':scope > .vb8-label-art');
  if(old)old.remove();
  const img=document.createElement('img');
  img.className='vb8-label-art';img.alt='';img.setAttribute('aria-hidden','true');
  img.width=29;img.height=29;img.src=src;img.decoding='async';img.loading='lazy';
  parent.prepend(img);parent.dataset.vb8Illustration=name;
 });
}
function decorateHome(){
 if(!host)return;
 inlineGlyph(host.querySelector('.vb7-hero__badge'),'lesson_book');
 setImage(host.querySelector('.weekly-card .weekly-icon img'),'reward_medal');
 // The visual tiles act as imagery only; they are never rendered as real controls.
 // Use the readable, simpler icons in the small feature hit targets instead.
 const arts={violet:'lesson_book',orange:'reward_streak_flame',blue:'reward_xp_gem',mint:'reward_chest'};
 host.querySelectorAll('.vb7-feature').forEach(card=>{
  decorateExistingImage(card.querySelector('.vb7-feature__icon'),arts[card.dataset.tone]||'lesson_book');
 });
}
function decorateAcademy(){
 if(!host)return;
 // The generated 3D art is proportional to its dedicated art slot.
 setImage(host.querySelector('.welcome-card .welcome-hero img'),'fox_teacher');
 setImage(host.querySelector('.sentence-lab-entry>img'),'fox_reading');
 setImage(host.querySelector('.fox-lesson-guide img'),'fox_teacher');
 setImage(host.querySelector('.fox-finish-mark'),'fox_waving');
 const art=['reward_streak_flame','lesson_book','reward_xp_gem'];
 host.querySelectorAll('.daily-strip>div').forEach((c,i)=>decorateExistingImage(c,art[i]||'lesson_book'));
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
