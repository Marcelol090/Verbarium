/**
 * Lesson-specific original Verbarium art from the four generated lesson sheets.
 * These image layers do NOT store completion data or hard-coded progress.
 * The old v3 sprites are fallback until the separate production PNG package is present.
 */
export const LESSON_KIT_IDS=Object.freeze(['be','present','questions','articles']);
const allowed=new Set(LESSON_KIT_IDS);
const base='/verbarium-lessons/';
const oldBook='/verbarium-v3/assets/journey/book_standalone.png';
const oldMedal='/verbarium-v3/assets/rewards/achievement_medal.png';
const oldNode=(state)=>'/verbarium-v3/assets/journey/node_'+(state==='locked'?'locked':state==='completed'?'completed':state==='progress'?'progress':'unlocked')+'.png';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function lessonKitAsset(id,key){
 if(!allowed.has(id)||!/^(node_(locked|available|progress|completed)|subject|medal|reward|title_card|pill|extra)$/.test(key))return null;
 return base+'assets/'+id+'/'+key+'.png';
}
export function lessonNodeArt(id,state){
 const fallback=oldNode(state);
 const key='node_'+(state==='unlocked'?'available':state);
 const img=lessonKitAsset(id,key);
 return '<img class="vb-journey-art'+(img?' vb4-lesson-node':'')+'" src="'+fallback+'" '+(img?'data-vb4-asset="'+esc(id)+'/'+key+'" ':'')+'alt="" aria-hidden="true" loading="lazy" decoding="async">';
}
export function renderLessonListArt(id){
 const target=lessonKitAsset(id,'subject');
 if(!target)return '';
 return '<img class="vb4-lesson-thumb" src="'+oldBook+'" alt="" aria-hidden="true" data-vb4-asset="'+esc(id)+'/subject" loading="lazy" decoding="async">';
}
export function renderLessonFeature(id,level='A1'){
 const target=lessonKitAsset(id,'subject');
 if(!target)return '';
 return '<aside class="vb4-lesson-feature" aria-label="Ilustração temática da aula"><img src="'+oldBook+'" data-vb4-asset="'+esc(id)+'/subject" alt="" aria-hidden="true" decoding="async"><span><strong>Explore o conteúdo</strong><small>'+esc(level)+' · Aprenda, pratique e conquiste sua insígnia.</small></span><img class="vb4-feature-medal" src="'+oldMedal+'" data-vb4-asset="'+esc(id)+'/medal" alt="" aria-hidden="true" decoding="async"></aside>';
}
export function renderLessonResultArt(id,success){
 const img=lessonKitAsset(id,'reward');
 if(success&&img)return '<img class="vb-lesson-end-art vb4-lesson-reward" src="'+oldMedal+'" data-vb4-asset="'+esc(id)+'/reward" alt="" aria-hidden="true" decoding="async">';
 return '<img class="vb-lesson-end-art" src="/verbarium-v3/assets/mascot/thinking.png" data-vb3-success="false" alt="" aria-hidden="true" decoding="async">';
}
let manifestPromise;
const ready=()=>{
 if(typeof fetch!=='function')return Promise.resolve(null);
 if(!manifestPromise)manifestPromise=fetch(base+'manifest.json',{cache:'force-cache'})
  .then(r=>r.ok?r.json():null)
  .then(j=>j?.asset_count===40?new Set(j.assets.map(x=>x.lesson_id+'/'+x.asset)):null)
  .catch(()=>null);
 return manifestPromise;
};
export function hydrateLessonKit(root){
 if(!root)return;
 const imgs=[...root.querySelectorAll('img[data-vb4-asset]')];
 if(!imgs.length)return;
 ready().then(catalog=>{
  if(!catalog||!root.isConnected)return;
  for(const img of imgs){
   if(!img.isConnected)return;
   const [lesson,key]=img.dataset.vb4Asset.split('/');
   if(!catalog.has(lesson+'/'+key))continue;
   const url=lessonKitAsset(lesson,key);if(!url)continue;
   // Swap only after preloading succeeds; never show a missing/broken image.
   const replacement=new Image();
   replacement.onload=()=>{if(img.isConnected){img.src=url;img.classList.add('vb4-art-ready');}};
   replacement.onerror=()=>{img.classList.add('vb4-art-fallback');};
   replacement.src=url;
  }
 });
}
