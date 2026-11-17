/** Verbarium Motion V12: choose a technique based on the interaction.
 * Motion (already installed) = route entrances, micro-feedback, progress reveal.
 * CSS = pressed/focus states. SVG assets = illustrations without raster scaling.
 * No animation may interfere with keyboard focus, game scoring, or map positioning.
 */
import {animate,stagger} from 'motion';
const ease=[.2,.8,.2,1];
const reduce=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile=()=>window.matchMedia('(max-width:700px)').matches;
const grab=(root,selector)=>[...root.querySelectorAll(selector)].filter(el=>el.getBoundingClientRect().width>0);
const tween=(elements,frames,options={})=>{
 if(!elements?.length||reduce())return;
 return animate(elements,frames,{duration:.26,ease,...options});
};
/** Route switch. Keep it fast: stagger only visible, meaningful content. */
export function animateEntrance(root){
 if(reduce()||!root)return;
 if(!isMobile()){
  const children=[...root.children].filter(el=>el.nodeType===1).slice(0,12);
  tween(children,{opacity:[0,1],y:[8,0]},{duration:.32,delay:stagger(.035)});
  return;
 }
 const route=document.body.dataset.route;
 if(route==='home'){
  const blocks=grab(root,'.vb11-welcome,.vb11-hero-start,.vb11-progress-card,.vb11-home-metrics,.vb11-next-card,.vb11-home-secondary');
  tween(blocks,{opacity:[0,1],y:[9,0]},{duration:.32,delay:stagger(.038)});
  const fox=grab(root,'.vb11-welcome-fox');
  tween(fox,{opacity:[.75,1],scale:[.965,1]},{duration:.38,delay:.09});
 }else if(route==='learn'){
  tween(grab(root,'.vb11-map'),{opacity:[.6,1]},{duration:.38});
  // Nodes are absolutely positioned with translate(-50%,-50%): opacity ONLY.
  tween(grab(root,'.vb11-map-node'),{opacity:[0,1]},{duration:.24,delay:stagger(.035)});
 }else if(route==='progress'){
  tween(grab(root,'.vb11-trophy-art'),{opacity:[.6,1],scale:[.94,1]},{duration:.38});
  tween(grab(root,'.vb11-achievement-metrics>div,.vb11-badge'),{opacity:[0,1],y:[8,0]},{duration:.28,delay:stagger(.04)});
 }else if(route==='lesson'){
  tween(grab(root,'.vb11-quiz-chip,.vb11-quiz-content h1,.vb11-quiz-figure,.vb11-answer-list'),{opacity:[0,1],y:[7,0]},{duration:.29,delay:stagger(.04)});
 }else{
  const children=[...root.children].filter(el=>el.nodeType===1).slice(0,8);
  tween(children,{opacity:[0,1],y:[8,0]},{duration:.30,delay:stagger(.035)});
 }
}
/** Answer or practice repaint on the same route. Never replay the whole scene. */
export function animateFeedback(root){
 if(reduce()||!root)return;
 const feedback=grab(root,'.vb11-quiz-feedback,.feedback,.endcard');
 if(feedback.length){
  tween(feedback,{opacity:[.4,1],scale:[.985,1]},{duration:.25});
  return;
 }
 const status=grab(root,'.vb11-quiz-finished,.vb8-completion');
 if(status.length)tween(status,{opacity:[.45,1],scale:[.97,1]},{duration:.38});
}
