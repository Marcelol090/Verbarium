/** Verbarium Precision V7: independent image art, resilient fallback.
 * No edits to scoring, lesson selection, speech, review or progress persistence.
 */
const KIT_ROOT='/verbarium-visual-kit/';
const app=document.body.dataset.vbApp||'';
const root=app==='academy'?document.querySelector('#content'):app==='home'?document.querySelector('#main'):document.querySelector('.onboarding-shell');
const media=matchMedia('(max-width:770px)');
const cached=new Map();
let manifest=null,queued=false;
function pathFor(key){
 const item=manifest?.assets?.[key];
 if(!item||typeof item.path!=='string'||!/^assets\/(?:mascot|rewards|buttons|cards|grids|labels|backgrounds)\/[a-z0-9_-]+\.webp$/.test(item.path))return null;
 return KIT_ROOT+item.path;
}
function prefetch(key){
 if(cached.has(key))return cached.get(key);
 const src=pathFor(key);
 if(!src)return Promise.resolve(null);
 const p=new Promise(resolve=>{
  const i=new Image();
  i.onload=()=>resolve(src);i.onerror=()=>resolve(null);
  i.decoding='async';i.src=src;
 });
 cached.set(key,p);return p;
}
function replaceImage(el,key){
 if(!el||el.dataset.vb7vAsset===key)return;
 prefetch(key).then(src=>{
  if(!src||!el.isConnected||el.dataset.vb7vAsset===key)return;
  el.src=src;el.decoding='async';el.style.objectFit='contain';
  el.style.objectPosition='center';el.dataset.vb7vAsset=key;
 });
}
function injectArt(el,key){
 if(!el||el.dataset.vb7vAsset===key)return;
 prefetch(key).then(src=>{
  if(!src||!el.isConnected||el.dataset.vb7vAsset===key)return;
  const box=document.createElement('span');
  box.className='vb7v-asset-box';box.setAttribute('aria-hidden','true');
  const img=document.createElement('img');img.className='vb7v-asset';
  img.src=src;img.alt='';img.decoding='async';img.loading='lazy';
  box.append(img);
  el.querySelector(':scope > .vb7v-asset-box')?.remove();
  el.prepend(box);el.classList.add('vb7v-has-art');el.dataset.vb7vAsset=key;
 });
}
function home(){
 if(!root)return;
 replaceImage(root.querySelector('.vb7-hero__mascot .vb-fox-home-mascot'),'fox_waving');
 replaceImage(root.querySelector('.vb7-promo__art img'),'fox_reading');
 const arts={violet:'lesson_book',orange:'reward_streak_flame',blue:'reward_xp_gem',mint:'reward_chest'};
 root.querySelectorAll('.vb7-feature').forEach(card=>injectArt(card.querySelector('.vb7-feature__icon'),arts[card.dataset.tone]||'lesson_book'));
 const missions={questions:'reward_xp_gem',lesson:'lesson_book',speaking:'reward_streak_flame'};
 root.querySelectorAll('.vb7-mission-card').forEach(card=>injectArt(card.querySelector('.vb7-mission-card__icon'),missions[card.dataset.vb5Mission]||'lesson_book'));
}
function academy(){
 if(!root)return;
 replaceImage(root.querySelector('.welcome-card .welcome-hero img'),'fox_teacher');
 replaceImage(root.querySelector('.sentence-lab-entry>img'),'fox_reading');
 replaceImage(root.querySelector('.fox-lesson-guide img'),'fox_teacher');
 replaceImage(root.querySelector('.fox-finish-mark'),'fox_waving');
 const stats=['reward_streak_flame','lesson_book','reward_xp_gem'];
 root.querySelectorAll('.daily-strip>div').forEach((el,i)=>injectArt(el,stats[i]||'lesson_book'));
 const skills=['lesson_book','reward_xp_gem','lesson_book','fox_teacher','fox_reading','fox_reading'];
 root.querySelectorAll('.skill-card .skill-emoji').forEach((el,i)=>injectArt(el,skills[i%skills.length]));
}
function onboarding(){
 const el=document.querySelector('.ob-art');
 if(!el)return;
 const key=el.classList.contains('vbk-bg--win')?'fox_waving':el.classList.contains('vbk-bg--lesson')?'fox_reading':'fox_welcome';
 prefetch(key).then(src=>{
  if(!src||!el.isConnected)return;
  el.style.setProperty('--vb7v-onboard-fox','url("'+src+'")');
  el.classList.add('vb7v-onboard-with-fox');
 });
}
function enhance(){
 if(!manifest||!media.matches)return;
 if(app==='home')home();else if(app==='academy')academy();else if(app==='onboarding')onboarding();
}
function schedule(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;enhance()});
}
async function bootstrap(){
 try{
  const response=await fetch(KIT_ROOT+'manifest.json',{cache:'force-cache'});
  if(!response.ok)return;
  const data=await response.json();
  if(!data||typeof data.assets!=='object'||Object.keys(data.assets).length<40)return;
  manifest=data;
 }catch{return}
 schedule();
 if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:false});
 if(app==='onboarding'){
  const art=document.querySelector('.ob-art');
  if(art)new MutationObserver(schedule).observe(art,{attributes:true,attributeFilter:['class']});
 }
 media.addEventListener?.('change',schedule);
}
bootstrap();
