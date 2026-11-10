/**
 * Verbarium phase progression: event-driven UI, with actual saved lesson state.
 *
 * Uses the six original node illustrations already included in the V3 assets
 * package, rather than replaying a sample GIF that could fabricate progress.
 * Focus / press / progress / completion / unlock mimic the authored motion kit.
 */
export const PHASE_ASSETS=Object.freeze({
 locked:'/verbarium-motion/journey/assets/node_locked.png',
 focus:'/verbarium-motion/journey/assets/node_focus.png',
 press:'/verbarium-motion/journey/assets/node_press.png',
 progress:'/verbarium-motion/journey/assets/node_progress.png',
 completed:'/verbarium-motion/journey/assets/node_completed.png',
 unlocked:'/verbarium-motion/journey/assets/node_unlocked.png'
});
export const PHASE_TIMING=Object.freeze({
 focus:378,press:286,progress:735,completed:646,unlock:646
});
const CIRC=276.46;
const clamp=n=>Math.max(0,Math.min(100,Number.isFinite(Number(n))?Number(n):0));
export function savedLessonPercent(lessonId,sessions={},questionCount=0){
 if(!questionCount)return 0;
 const index=Math.max(0,Math.min(questionCount,Math.floor(Number(sessions?.[lessonId]?.index)||0)));
 return Math.round(index/questionCount*100);
}
export function phaseState({completed=false,isCurrent=false,locked=false,percent=0}={}){
 if(completed)return 'completed';
 if(locked)return 'locked';
 if(isCurrent&&clamp(percent)>0)return 'progress';
 return 'unlocked'; // No artificial lock on courses already freely explorable
}
export function phaseRing(percent){
 const p=clamp(percent);
 if(p<=0||p>=100)return '';
 return '<svg class="vb-phase-ring" viewBox="0 0 100 100" aria-hidden="true" focusable="false" data-phase-ring="'+p+'">'+
 '<circle class="vb-phase-track" cx="50" cy="50" r="44"/>'+
 '<circle class="vb-phase-arc" cx="50" cy="50" r="44" stroke-dasharray="'+CIRC+'" stroke-dashoffset="'+(CIRC*(1-p/100)).toFixed(2)+'"/>'+
 '</svg>';
}
export function renderPhaseLessonBadge({lessonId='',index=0,total=0,completed=false}={}){
 const correctTotal=Math.max(0,Math.floor(Number(total)||0));
 const answered=Math.max(0,Math.min(correctTotal,Math.floor(Number(index)||0)));
 const value=correctTotal?Math.round(answered/correctTotal*100):0;
 const id=String(lessonId).replace(/[^a-z0-9_-]/gi,'');
 const base=completed?PHASE_ASSETS.completed:PHASE_ASSETS.unlocked;
 const state=completed?'completed':value>0?'progress':'unlocked';
 return '<div class="vb-phase-lesson-meter" role="progressbar" data-phase-lesson-meter="'+id+'" data-vb-phase-percent="'+value+'" aria-label="Progresso da aula" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+value+'">'+
 '<span class="vb-phase-lesson-art"><img src="'+base+'" alt="" aria-hidden="true" decoding="async">'+phaseRing(value)+'</span>'+
 '<span class="vb-phase-lesson-copy"><strong>'+value+'%</strong><small>'+answered+' de '+correctTotal+' questões · '+(completed?'Aula concluída':state==='progress'?'Em andamento':'Pronta para começar')+'</small></span>'+
 '</div>';
}
let disposers=[];
let milestone=null;
const displayed=new Map();
function on(target,event,fn){target.addEventListener(event,fn);disposers.push(()=>target.removeEventListener(event,fn));}
const reduceMotion=()=>typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
export function queuePhaseReveal(completedLessonId,nextLessonId=''){
 milestone={completedId:String(completedLessonId),nextId:String(nextLessonId)};
}
export function hydratePhaseMotion(root,route){
 for(const dispose of disposers.splice(0)){try{dispose();}catch{}}
 if(!root)return;
 const reduce=reduceMotion();
 const animateCircle=(circle,key,current)=>{
  if(!circle)return;
  const old=displayed.has(key)?displayed.get(key):current;
  displayed.set(key,current);
  if(!reduce&&old!==current){
   circle.style.strokeDashoffset=String(CIRC*(1-old/100));
   requestAnimationFrame(()=>{if(circle.isConnected)circle.style.strokeDashoffset=String(CIRC*(1-current/100));});
  }
 };
 if(route==='lesson'){
  for(const meter of root.querySelectorAll('[data-phase-lesson-meter]')){
   const circle=meter.querySelector('.vb-phase-arc');
   animateCircle(circle,'lesson:'+meter.dataset.phaseLessonMeter,clamp(meter.dataset.vbPhasePercent));
  }
  return;
 }
 if(!['home','learn','chapter'].includes(route))return;
 for(const button of root.querySelectorAll('.v2-stop-btn[data-vb-phase]')){
  const state=button.dataset.vbPhase;
  const img=button.querySelector('.vb-journey-art');
  if(!img)continue;
  // Keep source sprites intact. Per-lesson V4 art must never be swapped by V3.
  const focus=()=>{if(!reduce&&state!=='locked')button.classList.add('vb-phase-focus');};
  const blur=()=>button.classList.remove('vb-phase-focus','vb-phase-press');
  const down=()=>{if(state!=='locked'&&!reduce)button.classList.add('vb-phase-press');};
  const up=()=>button.classList.remove('vb-phase-press');
  on(button,'pointerenter',focus);
  on(button,'pointerleave',blur);
  on(button,'focusin',focus);
  on(button,'focusout',blur);
  on(button,'pointerdown',down);
  on(button,'pointerup',up);
  on(button,'pointercancel',up);
  on(button,'keydown',e=>{if(e.key===' '||e.key==='Enter')down();});
  on(button,'keyup',e=>{if(e.key===' '||e.key==='Enter')up();});
  const circle=button.querySelector('.vb-phase-arc');
  const current=clamp(button.dataset.vbPhasePercent);
  const key=button.dataset.id;
  if(circle&&key)animateCircle(circle,'map:'+key,current);
 }
 if(milestone){
  const safeSelector=id=>'.v2-stop-btn[data-id="'+CSS.escape(id)+'"]';
  const done=root.querySelector(safeSelector(milestone.completedId));
  const next=milestone.nextId?root.querySelector(safeSelector(milestone.nextId)):null;
  if(done||next){
   if(!reduce){
    if(done)done.classList.add('vb-phase-completed-burst');
    if(next)next.classList.add('vb-phase-next-reveal');
   }
   milestone=null;
  }
 }
}
