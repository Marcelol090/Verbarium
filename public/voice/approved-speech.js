/** Offline-approved neural speech for the student UI.
 * Teachers synthesize/authenticate in Studio; only reviewed audio+viseme JSON is
 * copied to public/voice/approved/ by maintainers. Students never hold API keys.
 */
export async function clipId({text='',character='explorer',accent='en-US'}){
 const source=[accent,character,text.trim()].join('|');
 if(!globalThis.crypto?.subtle)throw Error('Web Crypto indisponível para localizar o áudio aprovado.');
 const raw=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(source));
 return Array.from(new Uint8Array(raw)).slice(0,14).map(v=>v.toString(16).padStart(2,'0')).join('');
}
const CACHE=new Map();
export async function approvedSpeech({text,character,accent='en-US'}){
 let id;try{id=await clipId({text,character,accent})}catch{return null}
 if(CACHE.has(id))return CACHE.get(id);
 try{
  const response=await fetch('/voice/approved/'+id+'.json',{cache:'force-cache'});
  if(!response.ok){CACHE.set(id,null);return null}
  const result=await response.json();
  if(result.text!==text||result.character!==character||result.accent!==accent||result.format!=='audio/mpeg'){
   CACHE.set(id,null);return null;
  }
  CACHE.set(id,result);
  return result;
 }catch{CACHE.set(id,null);return null}
}
export async function downloadApprovedClip(clip,{text,character,accent}){
 if(!clip?.audioBase64||!clip.visemes?.length)throw Error('Gere uma voz neural válida antes de exportar.');
 const id=await clipId({text,character,accent});
 const payload={...clip,text,character,accent,approved:false,createdAt:new Date().toISOString()};
 const blob=new Blob([JSON.stringify(payload)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
 return id;
}
