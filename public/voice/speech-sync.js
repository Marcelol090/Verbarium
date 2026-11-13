/** Verbarium reusable voice timeline player.
 * Azure viseme offsets are precise to synthesized audio; mouth anchoring to existing
 * raster art is visual calibration, NOT a claim of anatomical accuracy.
 */
export const VISEME_COUNT=22;
export const FACE_ANCHORS=Object.freeze({
 explorer:[.52,.275,.17],hijab:[.52,.30,.17],blonde:[.51,.28,.17],
 grandfather:[.51,.28,.18],glasses:[.53,.28,.17],fox:[.52,.30,.17],
 alex:[.51,.29,.17],luna:[.52,.29,.17],ben:[.52,.29,.17],
 emma:[.52,.29,.17],oliver:[.51,.29,.17],mia:[.52,.29,.17]
});
// Visemes, not phonemes. Several phonemes share one visible mouth shape.
const LIP_GROUP=Object.freeze([
 'closed','wide','open','round','wide','round','smile','pucker','round','open','round',
 'wide','breath','round','tongue','teeth','teeth','tongue','bite','teeth','wide','closed'
]);
export function lipGroupForViseme(id){return LIP_GROUP[Number(id)]||'closed'}
export function timelineAt(events,timeMs,field='id',initial=null){
 if(!Array.isArray(events)||!events.length||!Number.isFinite(timeMs))return initial;
 let lo=0,hi=events.length-1,idx=-1;
 while(lo<=hi){const m=(lo+hi)>>1;if(events[m].timeMs<=timeMs){idx=m;lo=m+1}else hi=m-1}
 return idx>=0?events[idx][field]??initial:initial;
}
export function validateNeuralClip(clip){
 if(!clip||clip.version!==1||clip.format!=='audio/mpeg'||typeof clip.audioBase64!=='string'||!clip.audioBase64||clip.audioBase64.length>3_000_000)return false;
 if(!Array.isArray(clip.visemes)||!clip.visemes.length)return false;
 return clip.visemes.every(e=>Number.isInteger(e.id)&&e.id>=0&&e.id<VISEME_COUNT&&Number.isFinite(e.timeMs)&&e.timeMs>=0)
 &&Array.isArray(clip.words);
}
function shapeSvg(id){
 const group=lipGroupForViseme(id);
 const shapes={
  closed:'<path d="M12 24 Q33 27 56 24 Q35 30 12 24" fill="#793f40" stroke="#8c4447" stroke-width="3" stroke-linecap="round"/>',
  wide:'<path d="M9 22 Q34 10 59 22 Q34 39 9 22" fill="#572c38" stroke="#ab585a" stroke-width="4"/><path d="M15 22 Q34 19 53 22" stroke="#f9ebe5" stroke-width="4" fill="none"/>',
  open:'<ellipse cx="34" cy="24" rx="18" ry="15" fill="#542b36" stroke="#9c5357" stroke-width="4"/><ellipse cx="34" cy="31" rx="10" ry="5" fill="#bd6777"/>',
  round:'<ellipse cx="34" cy="23" rx="10" ry="12" fill="#542b36" stroke="#a7595a" stroke-width="4"/>',
  smile:'<path d="M8 16 Q34 33 61 16 Q51 39 34 40 Q18 40 8 16" fill="#5e2c38" stroke="#a95e58" stroke-width="4"/><path d="M14 22 Q34 28 54 22" stroke="#fff5ed" stroke-width="5" fill="none"/>',
  pucker:'<ellipse cx="34" cy="22" rx="7" ry="7" fill="#502a34" stroke="#bb6d70" stroke-width="6"/>',
  breath:'<path d="M18 23 Q34 18 50 23" stroke="#8d5154" stroke-width="5" fill="none" stroke-linecap="round"/>',
  tongue:'<ellipse cx="34" cy="23" rx="14" ry="9" fill="#60313a" stroke="#ad5c61" stroke-width="4"/><path d="M34 22 L34 30" stroke="#d88186" stroke-width="3"/>',
  teeth:'<path d="M14 22 Q34 16 54 22 Q35 34 14 22" fill="#4e2b37" stroke="#a05459" stroke-width="4"/><path d="M17 23 Q34 18 51 23" stroke="#fff6e9" stroke-width="5" fill="none"/>',
  bite:'<path d="M12 24 Q34 14 56 24 Q34 36 12 24" fill="#6b3340" stroke="#a75d63" stroke-width="4"/><path d="M13 24 Q34 25 55 24" stroke="#fff5eb" stroke-width="5" fill="none"/>'
 };
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 48" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'+shapes[group]+'</svg>';
}
export function attachMouth(image,character='explorer'){
 if(!(image instanceof HTMLImageElement)||!image.parentElement)return {set:()=>{},remove:()=>{}};
 const parent=image.parentElement;
 if(getComputedStyle(parent).position==='static')parent.style.position='relative';
 const slot=document.createElement('span');slot.className='vb-viseme-mouth';slot.setAttribute('aria-hidden','true');
 const [ax,ay,size]=FACE_ANCHORS[character]||FACE_ANCHORS.explorer;
 slot.style.cssText='position:absolute;z-index:8;pointer-events:none;display:none;transform:translate(-50%,-50%);line-height:0;filter:drop-shadow(0 1px 1px #744d4433)';
 parent.append(slot);
 function position(){
  if(!image.isConnected)return;
  const own=image.getBoundingClientRect(),p=parent.getBoundingClientRect();
  slot.style.left=((own.left-p.left)+own.width*ax)+'px';
  slot.style.top=((own.top-p.top)+own.height*ay)+'px';
  slot.style.width=(own.width*size)+'px';
  slot.style.height=(own.width*size*.72)+'px';
 }
 let old=-1;
 function set(id){
  if(old===id)return;
  old=id;slot.innerHTML=shapeSvg(id);slot.style.display=id==null?'none':'block';position();
 }
 function remove(){slot.remove();window.removeEventListener('resize',position)}
 window.addEventListener('resize',position,{passive:true});image.addEventListener('load',position,{once:true});
 position();
 return {set,remove,position};
}
const CACHE=new Map();
export async function requestNeuralClip({text,character='explorer',accent='en-US',speed=.92,token}){
 if(!token)throw Error('Token de professor obrigatório para gerar voz neural.');
 const key=[character,accent,speed,text].join('|');
 if(CACHE.has(key))return CACHE.get(key);
 const res=await fetch('/api/studio-tts',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
   body:JSON.stringify({text,character,accent,speed})});
 if(!res.ok){const data=await res.json().catch(()=>({}));throw Error(data.error||'Serviço neural indisponível ('+res.status+').')}
 const clip=await res.json();
 if(!validateNeuralClip(clip))throw Error('Resposta do provedor sem visemas válidos.');
 CACHE.set(key,clip);if(CACHE.size>12)CACHE.delete(CACHE.keys().next().value);
 return clip;
}
export async function playNeuralClip(clip,{image=null,character='explorer',onWord=()=>{},onViseme=()=>{},onEnd=()=>{},speed=1}={}){
 if(!validateNeuralClip(clip))throw Error('Clipe neural inválido.');
 const mouth=image?attachMouth(image,character):{set:()=>{},remove:()=>{}};
 const audio=new Audio('data:audio/mpeg;base64,'+clip.audioBase64);
 audio.playbackRate=Math.max(.75,Math.min(1.15,speed));
 let raf=0,ended=false,oldViseme=null,oldWord=-1;
 const words=clip.words;
 const indexed=words.map((w,i)=>({...w,index:i}));
 function update(){
  if(ended)return;
  const ms=audio.currentTime*1000;
  const viseme=timelineAt(clip.visemes,ms,'id',0);
  if(oldViseme!==viseme){oldViseme=viseme;mouth.set(viseme);onViseme(viseme,ms)}
  const word=timelineAt(indexed,ms,'index',-1);
  if(oldWord!==word){oldWord=word;onWord(word,ms)}
  raf=requestAnimationFrame(update);
 }
 function stop(){
  if(ended)return;ended=true;cancelAnimationFrame(raf);audio.pause();audio.src='';mouth.remove();onWord(-1,0);onEnd();
 }
 audio.addEventListener('ended',stop,{once:true});
 try{await audio.play();raf=requestAnimationFrame(update)}catch(e){stop();throw e}
 return {audio,stop};
}
