/**
 * Generated art adapter for real Academy / onboarding screens.
 * Every artwork is an independent, committed WebP. Text, targets, progress,
 * voice actors and state are owned by the existing application.
 */
const kit='/verbarium-visual-kit/assets/';
const scene='/verbarium-scenes/v13/';
const IMAGE=Object.freeze({
  foxWelcome:kit+'mascot/fox_welcome.webp',
  foxWaving:kit+'mascot/fox_waving.webp',
  foxReading:kit+'mascot/fox_reading.webp',
  foxTeacher:kit+'mascot/fox_teacher.webp',
  book:kit+'rewards/lesson_book.webp',
  chest:kit+'rewards/reward_chest.webp',
  medal:kit+'rewards/reward_medal.webp',
  flame:kit+'rewards/reward_streak_flame.webp',
  gem:kit+'rewards/reward_xp_gem.webp',
  bubble:kit+'rewards/dialog_bubble.webp',
  backgroundWelcome:kit+'backgrounds/background_onboarding.webp',
  backgroundStudy:kit+'backgrounds/background_study.webp',
  backgroundReward:kit+'backgrounds/background_reward.webp',
  nodeCurrent:scene+'node_current.webp',
  nodeCompleted:scene+'node_completed.webp',
  nodeMilestone:scene+'node_milestone.webp',
  nodeLocked:scene+'node_locked.webp'
});
const fallback=img=>{
  const wrap=img.closest('.asset-wrap');
  if(wrap)wrap.classList.add('fallback');
  img.remove();
};
const swap=(root,selector,src)=>{
  const img=root.querySelector(selector);
  if(!img)return;
  img.removeAttribute('onerror');
  img.src=src;
  img.alt='';
  img.setAttribute('aria-hidden','true');
  img.decoding='async';
  img.loading='lazy';
  img.onerror=()=>fallback(img);
};
const add=(host,src,cls)=>{
  if(!host||host.querySelector('.'+cls))return;
  const img=document.createElement('img');
  img.className=cls;
  img.src=src;
  img.alt='';
  img.setAttribute('aria-hidden','true');
  img.loading='lazy';
  img.decoding='async';
  img.onerror=()=>img.remove();
  host.append(img);
};
export function decorateAcademyArt(root){
  if(!root)return;
  // Rendered again after each route change; no duplicate DOM or custom state.
  swap(root,'.welcome-card .welcome-hero img',IMAGE.foxWaving);
  swap(root,'.sentence-lab-entry > img',IMAGE.foxReading);
  swap(root,'.review-hero .asset-wrap img',IMAGE.foxReading);
  swap(root,'.profile-hero .asset-wrap img',IMAGE.medal);
  swap(root,'.teacher-hero .asset-wrap img',IMAGE.foxTeacher);
  swap(root,'.finish-page .finish-chest img',IMAGE.chest);
  swap(document,'.rail-fox .asset-wrap img',IMAGE.foxReading);

  // Preserve native button handlers and actual unlocked/completed status.
  root.querySelectorAll('.path-track .path-step').forEach((step,index)=>{
    const button=step.querySelector('.node-button');
    const img=step.querySelector('.node-icon img');
    if(!button||!img)return;
    const complete=(button.getAttribute('aria-label')||'').includes('concluída');
    const locked=button.disabled;
    const src=locked?IMAGE.nodeLocked:complete?(index%4===3?IMAGE.nodeMilestone:IMAGE.nodeCompleted):IMAGE.nodeCurrent;
    swap(step,'.node-icon img',src);
    step.classList.add('vbgen-path-step');
  });
  const skillArt={
    vocabulary:IMAGE.book,grammar:IMAGE.gem,listening:IMAGE.bubble,
    writing:IMAGE.foxTeacher,speaking:IMAGE.foxWaving,reading:IMAGE.foxReading
  };
  root.querySelectorAll('.skill-card[data-practice]').forEach(card=>{
    card.classList.add('vbgen-skill-card');
    add(card,skillArt[card.dataset.practice]||IMAGE.book,'vbgen-skill-art');
  });
  const strip=root.querySelector('.daily-strip');
  if(strip)[IMAGE.flame,IMAGE.book,IMAGE.medal].forEach((src,i)=>{
    const cell=strip.children[i];
    if(cell){cell.classList.add('vbgen-daily-cell');add(cell,src,'vbgen-daily-art');}
  });
  const finishStats=root.querySelector('.finish-stats');
  if(finishStats&&finishStats.children[2]){
    finishStats.children[2].classList.add('vbgen-xp-cell');
    add(finishStats.children[2],IMAGE.gem,'vbgen-xp-art');
  }
}
const onboardingArt={
  welcome:[IMAGE.backgroundWelcome,IMAGE.foxWelcome],
  goal:[IMAGE.backgroundWelcome,IMAGE.foxTeacher],
  level:[IMAGE.backgroundStudy,IMAGE.foxReading],
  time:[IMAGE.backgroundStudy,IMAGE.foxWaving],
  lesson:[IMAGE.backgroundStudy,IMAGE.foxTeacher],
  win:[IMAGE.backgroundReward,IMAGE.chest]
};
export function decorateOnboardingArt(aside,view,step){
  if(!aside||!view)return;
  aside.querySelectorAll('.vbgen-onboarding-bg,.vbgen-onboarding-mascot').forEach(el=>el.remove());
  const parts=onboardingArt[step]||onboardingArt.welcome;
  aside.dataset.generatedStep=step;
  add(aside,parts[0],'vbgen-onboarding-bg');
  add(aside,parts[1],'vbgen-onboarding-mascot');
  if(step==='win')swap(view,'.ob-result-symbol img',IMAGE.medal);
}
