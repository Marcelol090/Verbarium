import {animate,stagger} from 'motion';
const reduce=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease=[.22,.8,.22,1];
export function animateEntrance(root){
 if(reduce())return;
 const children=[...root.children].filter(el=>el.nodeType===1);
 if(children.length)animate(children.slice(0,14),{opacity:[0,1],y:[12,0]},{duration:.38,delay:stagger(.045),ease});
 const hero=root.querySelector('.hero-visual');
 if(hero)animate(hero,{opacity:[.3,1],scale:[.95,1]},{duration:.52,delay:.1,ease});
}
export function animateFeedback(root){
 if(reduce())return;
 const el=root.querySelector('.feedback,.endcard');
 if(el)animate(el,{opacity:[.45,1],y:[6,0]},{duration:.25,ease});
}