/** V15 progressive enhancement. Real HTML controls, isolated decorative motion.
 * One scroll observer, one RAF, no scroll hijacking, no repeated feedback on re-render.
 */
import {weekActivity,parallaxOffset,motionEvent,MOTION} from './experience-v15-model.js';
let activeRoot=null,activeRoute='',floating=null,scene=null,raf=0,lastEvent='',currentAnimation=null;
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export function renderWeekActivity(state){
 return '<section class="vb15-week" aria-label="Atividade desta semana"><div class="vb15-week-head"><h2>Seu ritmo</h2><span>Prática diária</span></div><div class="vb15-days">'+weekActivity(state).map(d=>'<div class="vb15-day'+(d.today?' is-today':'')+'" aria-label="'+d.label+': '+(d.done?'praticado':d.future?'dia futuro':'ainda não praticado')+'"><img width="42" height="42" decoding="async" alt="" src="/verbarium-weekly-v4/static/'+(d.done?'completed':'pending')+'/'+d.day+'.png"><span>'+d.label+'</span></div>').join('')+'</div></section>';
}
function update(){
 raf=0;if(activeRoute!=='path'||!activeRoot)return;
 const node=activeRoot.querySelector('.path-step.current .node-button');
 if(floating){const r=node?.getBoundingClientRect(),header=document.querySelector('.topbar')?.getBoundingClientRect().bottom||0,nav=document.querySelector('.bottom-nav'),navRect=nav?.getBoundingClientRect(),bottom=navRect&&navRect.height>0?navRect.top:window.innerHeight;floating.hidden=!r||(r.bottom>header+12&&r.top<bottom-12);}
 if(scene){if(reduced()){scene.style.setProperty('--vb15-offset','0px');return;}const r=scene.getBoundingClientRect();if(r.bottom<0||r.top>window.innerHeight)return;const p=(window.innerHeight/2-(r.top+r.height/2))/Math.max(window.innerHeight,r.height);scene.style.setProperty('--vb15-offset',parallaxOffset(p*2)+'px');}
}
function schedule(){if(!raf)raf=requestAnimationFrame(update);}
function scrollToCurrent(){const node=activeRoot?.querySelector('.path-step.current .node-button');if(!node)return;node.scrollIntoView({block:'center',behavior:reduced()?'instant':'smooth'});node.focus({preventScroll:true});}
function animateEvent(root,event){
 if(event.key===lastEvent)return;lastEvent=event.key;
 currentAnimation?.cancel();currentAnimation=null;if(reduced())return;
 const target=root.querySelector(event.kind==='correct'||event.kind==='retry'?'.feedback':event.kind==='question'?'.exercise-box.vb10-question-head':event.kind==='celebrate'||event.kind==='finish'?'.finish-page':'.vb14-focus');
 if(!target?.animate)return;
 const feedback=event.kind==='correct'||event.kind==='retry';
 currentAnimation=target.animate([{opacity:0.72,transform:'translateY('+ (feedback?6:8) +'px)'},{opacity:1,transform:'translateY(0)'}],{duration:event.kind==='celebrate'?MOTION.celebrate:feedback?MOTION.feedback:MOTION.step,easing:'cubic-bezier(.2,.8,.2,1)'});
}
export function mountExperience(root,route,session,result){
 activeRoot=root;activeRoute=route;floating=null;scene=null;
 if(route==='path'){
  const focus=root.querySelector('.vb14-focus');
  if(focus&&!focus.querySelector('.vb15-scenery')){scene=document.createElement('div');scene.className='vb15-scenery';scene.setAttribute('aria-hidden','true');scene.innerHTML='<div class="vb15-sky"></div><div class="vb15-hills"></div>';focus.prepend(scene);}else scene=focus?.querySelector('.vb15-scenery');
  if(root.querySelector('.path-step.current .node-button')){floating=document.createElement('button');floating.type='button';floating.className='vb15-return';floating.hidden=true;floating.setAttribute('aria-label','Voltar à próxima aula na trilha');floating.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5m-7 7 7-7 7 7"/></svg><span>Minha etapa</span>';floating.addEventListener('click',scrollToCurrent);root.append(floating);}
 }
 animateEvent(root,motionEvent(route,session,result));schedule();
}
if(typeof window!=='undefined'){window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',()=>{currentAnimation?.cancel();schedule();});}
