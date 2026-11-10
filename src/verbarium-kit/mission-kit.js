const snapshots=new Map();
const clamp=(n,max)=>Math.max(0,Math.min(max,Number(n)||0));
export function hydrateMissionCards(root){
 if(!root)return;
 const reduce=typeof window!=='undefined'&&typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 for(const card of root.querySelectorAll('.vb5-mission[data-vb5-mission]')){
  const goal=Math.max(1,Number(card.dataset.vb5Goal)||1),now=clamp(card.dataset.vb5Now,goal);
  const key=(card.dataset.vb5Date||'unknown')+':'+card.dataset.vb5Mission,prior=snapshots.get(key);
  snapshots.set(key,now);
  const bar=card.querySelector('.vb5-mission-bar i');if(!bar)continue;
  const pct=100*now/goal;
  if(typeof prior==='number'&&prior<now&&!reduce){
   bar.style.setProperty('transition','none','important');
   bar.style.width=(100*clamp(prior,goal)/goal)+'%';
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(!bar.isConnected)return;
    bar.style.removeProperty('transition');bar.style.width=pct+'%';
   }));
   if(prior<goal&&now>=goal){
    card.classList.add('vb5-mission-earned');
    card.addEventListener('animationend',()=>card.classList.remove('vb5-mission-earned'),{once:true});
   }
  }else bar.style.width=pct+'%';
 }
 if(snapshots.size>84){const recent=[...snapshots].slice(-42);snapshots.clear();for(const [k,v] of recent)snapshots.set(k,v);}
}
