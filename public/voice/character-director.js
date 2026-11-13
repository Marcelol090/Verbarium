/** Single animation director shared by Studio and Academy.
 * Existing GIF poses hold the character identity. Timing comes only from audio events.
 */
export const CHARACTER_MOODS=Object.freeze(['listening','thinking','speaking','correct','retry','celebrate']);
const ALLOWED=new Set(CHARACTER_MOODS);
export function createCharacterDirector({image,stage=image?.parentElement}={}){
 if(!image)throw new TypeError('Character image is required');
 let mood='listening',speaking=false;
 function setMood(value){
  mood=ALLOWED.has(value)?value:'listening';
  image.dataset.vbExpression=mood;
  if(stage)stage.dataset.vbExpression=mood;
  return mood;
 }
 function begin(){speaking=true;image.classList.add('vb-voice-image','vb-voice-active');image.dataset.vbGesture='steady';setMood('speaking');}
 function viseme(id){if(speaking&&Number.isInteger(id)&&id>=0&&id<=21)image.dataset.vbViseme=String(id);}
 function word(i){if(speaking)image.dataset.vbGesture=Number.isInteger(i)&&i>=0?['steady','nod','tilt'][i%3]:'steady';}
 function end(){speaking=false;image.classList.remove('vb-voice-active');delete image.dataset.vbViseme;delete image.dataset.vbGesture;setMood('listening');}
 function react(ok){end();setMood(ok?'correct':'retry');}
 setMood('listening');
 return {setMood,begin,viseme,word,end,react,get mood(){return mood},get speaking(){return speaking}};
}
