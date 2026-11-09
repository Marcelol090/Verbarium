/** Verbarium's original sprite animations, never used as the source of learning state. */
import {MOTION_ASSETS} from './catalog.js';
export {MOTION_ASSETS};
const byKey=new Map(MOTION_ASSETS.map(asset=>[asset.key,asset]));
const labels={journey:'Jornada e desbloqueio',cta:'Botões, chips e microinterações',rewards:'Conquistas e recompensas'};
export const motionByKey=key=>byKey.get(key)||null;
export const reduceMotion=()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export function staticJourneyNode(state){
 const variants=['node_idle','node_focus','node_pressed','node_progress','node_completed','node_unlocked','node_unlock_bounce'];
 return '/verbarium-assets/extra-80/journey_nodes/'+(variants.includes(state)?state:'node_unlocked')+'.png';
}
export function navArtwork(id){
 const variants={home:'nav_icon_home',learn:'nav_icon_book',practice:'nav_icon_gamepad',speak:'nav_icon_headphones',profile:'nav_icon_profile'};
 return variants[id]?'<img src="/verbarium-assets/extra-80/navigation/'+variants[id]+'.png" class="vb-nav-image" alt="" aria-hidden="true" decoding="async">':'';
}
export function renderMotionGallery(){
 return '<section class="vb-motion-library" aria-label="Biblioteca motion do Verbarium">'+
 '<header class="vb-motion-library-head"><span class="vb-overline">VERBARIUM / MOTION LIBRARY</span><h1>Uma jornada em movimento.</h1><p>53 motions com transparência real e estados estáticos. Reproduza individualmente; as transições do aplicativo respeitam o progresso registrado e a preferência por movimento reduzido.</p><button class="vb-motion-back" type="button" data-route="profile">← Voltar ao perfil</button></header>'+
 Object.entries(labels).map(([group,title])=>'<section class="vb-motion-section"><div class="vb-motion-section-title"><h2>'+title+'</h2><span>'+MOTION_ASSETS.filter(a=>a.group===group).length+' animations</span></div><div class="vb-motion-grid">'+MOTION_ASSETS.filter(a=>a.group===group).map(a=>
 '<article class="vb-motion-tile"><div class="vb-motion-preview"><img src="'+a.still+'" loading="lazy" decoding="async" alt="" data-motion-image="'+a.key+'"></div><div class="vb-motion-tile-body"><strong>'+a.title+'</strong><small>'+a.duration+' ms · WebP transparente</small><button type="button" aria-label="Reproduzir '+a.title+'" data-vb-preview="'+a.key+'">↻ Reproduzir</button></div></article>').join('')+'</div></section>').join('')+
 '<p class="vb-motion-note">Os PNGs são fallbacks. GIFs não controlam porcentagens, notas, dias ativos ou desbloqueios.</p></section>';
}
let pendingUnlock='';
let initialized=false;
let replay=0;
const playing=new WeakMap();
export function triggerVerbariumMotion(key,anchor){
 const asset=motionByKey(key);
 if(!anchor||!asset||reduceMotion())return false;
 const prev=playing.get(anchor);
 if(prev){clearTimeout(prev.timer);prev.el.remove();}
 const el=document.createElement('img');el.src=asset.url;el.alt='';el.className='vb-effect-sprite vb-effect-'+asset.group;el.setAttribute('aria-hidden','true');
 anchor.classList.add('vb-effect-anchor');anchor.append(el);
 const timer=window.setTimeout(()=>{el.remove();if(!anchor.querySelector('.vb-effect-sprite'))anchor.classList.remove('vb-effect-anchor');playing.delete(anchor)},Math.max(asset.duration,250)+120);
 playing.set(anchor,{el,timer});return true;
}
export function announceVerbariumMilestone({type,lessonId}={}){
 if(type==='lesson-completed'){
  pendingUnlock=String(lessonId||'');
  triggerVerbariumMotion('journey:completion_burst',document.querySelector('.endcard')||document.querySelector('.exercise-card'));
 }else if(type==='mission-completed'){
  triggerVerbariumMotion('cta:chip_activated_completed',document.querySelector('.v2-mission.complete')||document.querySelector('.exercise-card'));
 }else if(type==='dialogue-completed'){
  triggerVerbariumMotion('rewards:achievement_medal',document.querySelector('.conversation-window')||document.querySelector('#main'));
 }
}
export function hydrateVerbariumMotion(root,route){
 if(!root)return;
 if(pendingUnlock&&['learn','home','chapter'].includes(route)){
  const nodes=[...root.querySelectorAll('.v2-stop-btn[data-id]')];
  const done=nodes.find(x=>x.dataset.id===pendingUnlock);
  const next=nodes.find(x=>x.classList.contains('current'));
  if(done)triggerVerbariumMotion('journey:completion_burst',done);
  if(next&&next!==done)triggerVerbariumMotion('journey:next_node_unlock',next);
  if(done||next)pendingUnlock='';
 }
}
export function initVerbariumMotion(){
 if(initialized||typeof document==='undefined')return;
 initialized=true;
 document.addEventListener('click',event=>{
  const b=event.target.closest('[data-vb-preview]');if(!b)return;
  const asset=motionByKey(b.dataset.vbPreview);if(!asset)return;
  const current=b.closest('.vb-motion-tile')?.querySelector('[data-motion-image]');if(!current)return;
  const next=current.cloneNode(true);next.src=reduceMotion()?asset.still:asset.url+'?replay='+(++replay);current.replaceWith(next);
 },true);
 document.addEventListener('pointerover',event=>{
  if(event.pointerType==='touch'||reduceMotion())return;
  const b=event.target.closest('.v2-stop-btn.current');
  if(b&&!b.contains(event.relatedTarget))triggerVerbariumMotion('journey:focus_glow',b);
 },true);
 document.addEventListener('pointerdown',event=>{
  const b=event.target.closest('.v2-stop-btn,.hero-actions .button,.button.bright');
  if(b)b.classList.add('vb-motion-pressed');
 },true);
 ['pointerup','pointercancel'].forEach(name=>document.addEventListener(name,()=>document.querySelectorAll('.vb-motion-pressed').forEach(b=>b.classList.remove('vb-motion-pressed')),true));
 document.addEventListener('focusin',event=>{
  const b=event.target.closest('.v2-stop-btn.current');if(b)triggerVerbariumMotion('journey:focus_glow',b);
 },true);
}