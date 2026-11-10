/** Bind the original Verbarium v3 artwork to actual application state. */
const BASE='/verbarium-v3/';
export const v3Asset=(id)=>BASE+'assets/'+id+'.png';
export const v3Motion=(id)=>BASE+'motion/'+id+'.webp';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let kitPromise=null;
let cleanups=[];
let generation=0;
let lastRoute=null;
let lastHeroAnimation=false;
let unlockPending='';
const runtimeURL=BASE+'runtime/verbarium-motion.mjs';
const kit=()=>kitPromise??=import(/* @vite-ignore */ runtimeURL);
export function renderV3Gallery(){return `<section class="vb3-gallery" aria-label="Biblioteca Verbarium v3"><header><span class="vb-overline">VERBARIUM · BIBLIOTECA V3</span><h1>Assets reais. Movimento com propósito.</h1><p>151 peças recortadas das cartelas originais, 142 animações transparentes. Cada movimento é reproduzido apenas quando solicitado ou quando um evento do aprendizado ocorre.</p></header><div class="vb3-gallery-toolbar"><label for="vb3-search">Buscar componente<input id="vb3-search" type="search" placeholder="Ex.: troféu, mascote, jornada…"></label><div class="vb3-gallery-filters" role="group" aria-label="Categoria de assets"></div></div><div class="vb3-gallery-status" role="status">Carregando biblioteca…</div><div class="vb3-gallery-grid"></div></section>`;}
function wrapCTA(button){if(button.dataset.vb3Bound)return;button.dataset.vb3Bound='true';const content=document.createElement('span');content.className='vb3-cta-label';while(button.firstChild)content.append(button.firstChild);button.append(content);}
function attach(listener,target,name,fn){target.addEventListener(name,fn);listener.push(()=>target.removeEventListener(name,fn));}
function updateGallery(root,runtime,listener){
 const assets=runtime.VERBARIUM_ASSETS;
 const filters=root.querySelector('.vb3-gallery-filters');const grid=root.querySelector('.vb3-gallery-grid');const search=root.querySelector('#vb3-search');const count=root.querySelector('.vb3-gallery-status');
 if(!grid||!search||!filters)return;
 const categories=['Todos',...new Set(assets.map(a=>a.id.split('/')[0]))];let category='Todos';
 const draw=()=>{
  const q=search.value.trim().toLowerCase();const filtered=assets.filter(a=>(category==='Todos'||a.id.startsWith(category+'/'))&&a.id.toLowerCase().includes(q));
  count.textContent=`${filtered.length} de ${assets.length} peças · ${assets.filter(a=>a.motion_file).length} animadas`;
  filters.innerHTML=categories.map(c=>`<button type="button" data-vb3-category="${safe(c)}" aria-pressed="${c===category}">${safe(c)}</button>`).join('');
  grid.innerHTML=filtered.map(a=>`<article class="vb3-gallery-card"><div class="vb3-gallery-stage"><img data-vb3-image="${safe(a.id)}" src="${runtime.spriteSource(a.id)}" loading="lazy" decoding="async" alt=""></div><div class="vb3-gallery-description"><strong>${safe(a.id.split('/').at(-1).replaceAll('_',' '))}</strong><small>${safe(a.id.split('/')[0])} · ${a.width}×${a.height} · ${a.motion_file?`${a.duration} ms`:'estático'}</small>${a.motion_file?`<button type="button" data-vb3-play="${safe(a.id)}" aria-label="Reproduzir ${safe(a.id)}">Reproduzir motion</button>`:''}</div></article>`).join('');
 };
 draw();
 attach(listener,search,'input',draw);
 attach(listener,filters,'click',ev=>{const b=ev.target.closest('[data-vb3-category]');if(!b)return;category=b.dataset.vb3Category;draw();});
 attach(listener,grid,'click',ev=>{const b=ev.target.closest('[data-vb3-play]');if(!b)return;const image=b.closest('.vb3-gallery-card')?.querySelector('img');if(image)runtime.playSprite(image,b.dataset.vb3Play);});
}
function bindJourney(root,runtime,listener){
 for(const button of root.querySelectorAll('.v2-stop-btn[data-vb3-state]')){
  const img=button.querySelector('.vb-journey-art');if(!img)continue;
  // Per-lesson sprites are handled by lesson-kit; never replace them with generic v3 nodes.
  if(img.hasAttribute('data-vb4-asset'))continue;
  if(img.hasAttribute('data-vb4-asset')){continue;} // Lesson-specific images own their state.
  const state=button.dataset.vb3State;
  const base=state==='completed'?'journey/node_completed':state==='progress'?'journey/node_progress':'journey/node_unlocked';
  runtime.setSprite(img,base);
  const hover=()=>runtime.playSprite(img,state==='progress'?'journey/node_progress':state==='completed'?'journey/node_completed':'journey/node_unlocked');
  const down=()=>{button.classList.add('vb3-node-press');};
  const up=()=>{button.classList.remove('vb3-node-press');runtime.setSprite(img,base);};
  for(const ev of ['pointerenter','focusin'])attach(listener,button,ev,hover);
  for(const ev of ['pointerdown'])attach(listener,button,ev,down);
  for(const ev of ['pointerup','pointercancel','pointerleave','focusout'])attach(listener,button,ev,up);
  listener.push(()=>runtime.stopMotion(img));
 }
}
function bindCleanCTA(button,runtime,listener){
 // A transparent blank base and independent play glyph prevent baked-in symbols
 // from colliding with localized HTML labels.
 wrapCTA(button);
 button.classList.add('vb3-cta','vb3-cta-clean');
 const base=runtime.spriteElement('cta/purple_primary',{className:'vb3-cta-art'});
 const play=runtime.spriteElement('cta/play_circle',{className:'vb3-cta-play'});
 button.prepend(base,play);
 const focus=()=>button.classList.add('vb3-cta-focused');
 const blur=()=>{button.classList.remove('vb3-cta-focused','vb3-cta-down');};
 const down=()=>button.classList.add('vb3-cta-down');
 const up=()=>{button.classList.remove('vb3-cta-down');runtime.playSprite(play,'cta/play_circle');};
 attach(listener,button,'pointerenter',focus);
 attach(listener,button,'pointerleave',blur);
 attach(listener,button,'focusin',focus);
 attach(listener,button,'focusout',blur);
 attach(listener,button,'pointerdown',down);
 attach(listener,button,'pointerup',up);
 attach(listener,button,'pointercancel',blur);
 attach(listener,button,'keydown',event=>{if(event.key==='Enter'||event.key===' ')down();});
 attach(listener,button,'keyup',event=>{if(event.key==='Enter'||event.key===' ')up();});
 listener.push(()=>{runtime.stopMotion(play);base.remove();play.remove();button.classList.remove('vb3-cta','vb3-cta-clean','vb3-cta-focused','vb3-cta-down');});
}
function bindCTAs(root,runtime,listener){
 const selectors=['.hero-actions .button.bright','.v2-action-primary','.exercise-card>.button:not(.outline)','.practice-panel .button:not(.outline)','.conversation-controls .button:not(.outline)','.endcard .button:not(.outline)'];
 for(const button of root.querySelectorAll(selectors.join(','))){
  if(!button.disabled)bindCleanCTA(button,runtime,listener);
 }
 // Grammar filters are not lesson-completion chips. Their original chip sprite
 // includes a book and status dot, so it MUST NOT be overlaid behind their labels.
 for(const button of root.querySelectorAll('.filter-row .chip,.mode-tabs .chip')){
  button.classList.add('vb3-semantic-chip');
  button.setAttribute('aria-pressed',String(button.classList.contains('active')));
  listener.push(()=>button.classList.remove('vb3-semantic-chip'));
 }
}

function upgradeRings(root,runtime){for(const el of root.querySelectorAll('.vb-progress-ring[role="progressbar"]')){
 const value=Number(el.getAttribute('aria-valuenow'))||0;const label=el.getAttribute('aria-label')||'Progresso';
 const ring=runtime.createProgressRing({value,label});if(el.classList.contains('vb-progress-ring--small'))ring.element.classList.add('vb3-ring-small');
 el.replaceWith(ring.element);
}}
function bindMascot(root,runtime,route,listener){
 const home=root.querySelector('.vb-mascot-hero-image');if(home){runtime.setSprite(home,'mascot/ready_waving');if(route!==lastRoute||!lastHeroAnimation){runtime.playSprite(home,'mascot/ready_waving');lastHeroAnimation=true;}listener.push(()=>runtime.stopMotion(home));}
 const lessonEnd=root.querySelector('.vb-lesson-end-art');if(lessonEnd&&!lessonEnd.hasAttribute('data-vb4-asset')){const full=lessonEnd.dataset.vb3Success==='true';const id=full?'trophy/complete':'mascot/thinking';runtime.setSprite(lessonEnd,id,{play:true});listener.push(()=>runtime.stopMotion(lessonEnd));}
 const feedback=root.querySelector('.exercise-card .feedback,.practice-panel .feedback');if(feedback){const success=feedback.classList.contains('good');const img=document.createElement('img');img.className='vb3-feedback-mascot';img.setAttribute('aria-hidden','true');feedback.append(img);runtime.setSprite(img,success?'mascot/encouragement_thumb':'mascot/thinking',{play:true});listener.push(()=>runtime.stopMotion(img));}
 const mic=root.querySelector('.vb-speech-mic-art');if(mic){const active=mic.dataset.vb3Listening==='true';runtime.setSprite(mic,active?'speaking/mic_listening':'speaking/mic_idle',{play:active});listener.push(()=>runtime.stopMotion(mic));}
}
function revealPending(root,runtime,route){
 if(!unlockPending||!['home','learn','chapter'].includes(route))return;
 const selector='.v2-stop-btn[data-id="'+CSS.escape(unlockPending)+'"]';
 const el=root.querySelector(selector);if(!el)return;
 const img=el.querySelector('.vb-journey-art');if(img)runtime.playSprite(img,'journey/node_completed');
 const next=root.querySelector('.v2-stop-btn.current .vb-journey-art');if(next)runtime.playSprite(next,'journey/node_unlocked');
 unlockPending='';
}
export function hydrateV3(root,route){
 for(const dispose of cleanups.splice(0)){try{dispose();}catch{}}
 const token=++generation;
 // Static PNGs are rendered directly in HTML; this asynchronous phase adds event-driven animations.
 kit().then(runtime=>{
  if(token!==generation||!root.isConnected)return;
  const listener=[];
  if(route==='v3')updateGallery(root,runtime,listener);
  bindCTAs(root,runtime,listener);
  bindJourney(root,runtime,listener);
  upgradeRings(root,runtime);
  bindMascot(root,runtime,route,listener);
  revealPending(root,runtime,route);
  cleanups=listener;
  lastRoute=route;
 }).catch(err=>{console.error('Verbarium v3 assets unavailable',err);});
}
/** Called only after the user's persisted learning state actually changes. */
export function celebrateV3({kind='lesson',lessonId=''}={}){
 if(kind==='lesson')unlockPending=String(lessonId);
 kit().then(runtime=>{
  if(runtime.reducedMotion())return;
  const root=document.querySelector('#main');if(!root)return;
  let anchor=null,prize='',fx='effects/confetti_mixed_large';
  if(kind==='lesson'){anchor=root.querySelector('.vb-lesson-endcard');prize='trophy/complete';}
  else if(kind==='mission'){anchor=root.querySelector('.v2-mission.complete');prize='rewards/star_coin';}
  else if(kind==='dialogue'){anchor=root.querySelector('.conversation-window .endcard');prize='rewards/achievement_medal';}
  if(anchor){anchor.classList.add('vb3-celebration-anchor');runtime.celebrateAt(anchor,{kind:prize,fx});}
 });
}
