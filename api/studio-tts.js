/** Server-only neural voice generation for authorized teacher previews.
 * Requires VERBARIUM_TTS_ACCESS_TOKEN, AZURE_SPEECH_KEY, AZURE_SPEECH_REGION.
 * Do NOT call from public student pages; publish approved speech assets instead.
 */
import {timingSafeEqual} from 'node:crypto';

export const VOICES=Object.freeze({
 explorer:{'en-US':'en-US-GuyNeural','en-GB':'en-GB-RyanNeural'},
 hijab:{'en-US':'en-US-JennyNeural','en-GB':'en-GB-SoniaNeural'},
 blonde:{'en-US':'en-US-AriaNeural','en-GB':'en-GB-SoniaNeural'},
 grandfather:{'en-US':'en-US-DavisNeural','en-GB':'en-GB-RyanNeural'},
 glasses:{'en-US':'en-US-ChristopherNeural','en-GB':'en-GB-RyanNeural'},
 fox:{'en-US':'en-US-JennyNeural','en-GB':'en-GB-SoniaNeural'},
 alex:{'en-US':'en-US-GuyNeural','en-GB':'en-GB-RyanNeural'},
 luna:{'en-US':'en-US-AriaNeural','en-GB':'en-GB-SoniaNeural'},
 ben:{'en-US':'en-US-ChristopherNeural','en-GB':'en-GB-RyanNeural'},
 emma:{'en-US':'en-US-JennyNeural','en-GB':'en-GB-SoniaNeural'},
 oliver:{'en-US':'en-US-DavisNeural','en-GB':'en-GB-RyanNeural'},
 mia:{'en-US':'en-US-AriaNeural','en-GB':'en-GB-SoniaNeural'}
});
export function validateSpeechInput(data){
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('JSON inválido.');
 const text=String(data.text??'').trim();
 const character=String(data.character||'explorer');
 const accent=String(data.accent||'en-US');
 if(!text||text.length>220||/[\x00-\x08\x0e-\x1f]/.test(text))throw Error('Texto deve ter de 1 a 220 caracteres.');
 if(!Object.hasOwn(VOICES,character)||!Object.hasOwn(VOICES[character],accent))throw Error('Personagem ou sotaque não permitido.');
 const speed=Number(data.speed??0.92);
 if(!Number.isFinite(speed)||speed<0.7||speed>1.15)throw Error('Velocidade fora dos limites.');
 return {text,character,accent,speed,voice:VOICES[character][accent]};
}
export function secureTokenMatches(sent,secret){
 if(!sent||!secret)return false;
 const a=Buffer.from(String(sent)),b=Buffer.from(String(secret));
 return a.length===b.length&&timingSafeEqual(a,b);
}
export const escapeXml=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function buildSsml({text,accent,voice,speed}){
 const rate=Math.round((speed-1)*100);
 return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${accent}"><voice name="${voice}"><prosody rate="${rate>=0?'+':''}${rate}%">${escapeXml(text)}</prosody></voice></speak>`;
}
async function synthesize(input,config){
 const imported=await import('microsoft-cognitiveservices-speech-sdk');
 const sdk=imported.SpeechConfig?imported:imported.default;
 const speech=sdk.SpeechConfig.fromSubscription(config.key,config.region);
 speech.speechSynthesisOutputFormat=sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
 const engine=new sdk.SpeechSynthesizer(speech,null);
 const visemes=[],words=[];
 engine.visemeReceived=(_,e)=>visemes.push({timeMs:Math.round(Number(e.audioOffset)/10000),id:Number(e.visemeId)});
 engine.wordBoundary=(_,e)=>{if(e.text)words.push({timeMs:Math.round(Number(e.audioOffset)/10000),text:String(e.text).slice(0,80),textOffset:Number(e.textOffset)||0})};
 try{
  const ssml=buildSsml(input);
  const result=await Promise.race([
   new Promise((resolve,reject)=>engine.speakSsmlAsync(ssml,resolve,reject)),
   new Promise((_,reject)=>setTimeout(()=>reject(Error('Síntese excedeu o tempo permitido.')),18000))
  ]);
  if(result.reason!==sdk.ResultReason.SynthesizingAudioCompleted||!result.audioData?.byteLength)throw Error('Azure não produziu áudio válido.');
  const data=Buffer.from(result.audioData);
  if(data.byteLength>2_000_000)throw Error('Áudio excedeu limite do preview.');
  const safeVisemes=visemes.filter(x=>Number.isFinite(x.timeMs)&&x.timeMs>=0&&x.id>=0&&x.id<=21).sort((a,b)=>a.timeMs-b.timeMs);
  return {provider:'azure-speech',voice:input.voice,accent:input.accent,format:'audio/mpeg',
    audioBase64:data.toString('base64'),visemes:safeVisemes,words:words.filter(x=>x.timeMs>=0).sort((a,b)=>a.timeMs-b.timeMs),
    sync:'provider-viseme-offsets',version:1};
 }finally{try{engine.close()}catch{}}
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');
 res.setHeader('Vary','Authorization');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Método não permitido.'})}
 const key=process.env.AZURE_SPEECH_KEY,region=process.env.AZURE_SPEECH_REGION,secret=process.env.VERBARIUM_TTS_ACCESS_TOKEN;
 if(!key||!region||!secret)return res.status(503).json({error:'Voz neural ainda não configurada no servidor.'});
 const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
 if(!secureTokenMatches(token,secret))return res.status(401).json({error:'Acesso do professor não autorizado.'});
 if(Number(req.headers['content-length']||0)>3000)return res.status(413).json({error:'Requisição muito grande.'});
 let input;try{input=validateSpeechInput(req.body)}catch(e){return res.status(400).json({error:e.message})}
 try{return res.status(200).json(await synthesize(input,{key,region}))}
 catch(e){console.error('Speech synthesis failed:',String(e?.message||e).slice(0,180));return res.status(502).json({error:'Não foi possível gerar voz neural agora.'})}
}
