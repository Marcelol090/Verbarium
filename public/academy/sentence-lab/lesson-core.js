/** Core educacional do Verbarium: estrutura, recuperação e repetição espaçada. Sem dependência de DOM. */
export const STORAGE_KEY = 'verbarium.sentence-lab.v1';
export const REVIEW_DAYS = [1,3,7,14,30];
export const PHRASES = [
 {id:'apple',speaker:'alex',subject:'I',verb:'eat',object:'an apple',pt:'Eu como uma maçã.',image:'apple_red',rule:'I / you / we / they usam o verbo sem -s no Present Simple.'},
 {id:'banana',speaker:'emma',subject:'She',verb:'eats',object:'a banana',pt:'Ela come uma banana.',image:'banana',rule:'He / she / it normalmente pedem -s no verbo: eat → eats.'},
 {id:'milk',speaker:'oliver',subject:'He',verb:'drinks',object:'milk',pt:'Ele bebe leite.',image:'milk',rule:'Para he / she / it: drink → drinks. Milk não precisa de a ou an nesse uso.'},
 {id:'bread',speaker:'mia',subject:'They',verb:'eat',object:'bread',pt:'Eles comem pão.',image:'loaf',rule:'They usa eat, não eats. Bread geralmente é incontável nesse uso.'}
];
export const TARGET_STEPS = ['observar','montar','associar','escutar','escrever','concluir'];
export const MATCH_PAIRS = [
 {id:'apple',left:'I eat',right:'an apple'},
 {id:'milk',left:'He drinks',right:'milk'},
 {id:'banana',left:'She eats',right:'a banana'}
];
export function sentence(p){return `${p.subject} ${p.verb} ${p.object}`;}
export function normalize(str='') {return String(str).normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[.!?,;:]/g,'').replace(/\s+/g,' ').trim();}
export function gradeSentence(input,expected) {
 const target=Array.isArray(expected)?expected.join(' '):String(expected);
 const actual=Array.isArray(input)?input.join(' '):String(input);
 if(normalize(actual)===normalize(target))return {ok:true,reason:'Frase correta! Você identificou quem age, a ação e o complemento.'};
 const [sub,verb,...rest]=normalize(target).split(' '), tokens=normalize(actual).split(' ');
 if(!tokens[0]||tokens[0]!==sub)return {ok:false,reason:`Comece por quem pratica a ação: “${sub}”. Isso é o sujeito.`};
 if(tokens[1]!==verb){
  const agreement=/^(he|she|it)$/.test(sub);
  return {ok:false,reason:agreement?`Com ${sub}, observe o verbo: “${verb}”. No presente simples, he/she/it geralmente levam -s.`:`O verbo é “${verb}”. Com ${sub}, use a forma simples da ação.`};
 }
 return {ok:false,reason:`A ação já está certa. Complete com “${rest.join(' ')}”. Observe a/an e a ordem das palavras.`};
}
export function gradePair(leftId,rightId){return leftId===rightId;}
export function blankState(){return {step:0,attempts:0,correct:0,firstTryCorrect:0,completed:false,history:[],reviews:{},xp:0,updatedAt:null};}
export function hydrateState(raw){
 const b=blankState();if(!raw||typeof raw!=='object')return b;
 return {...b,step:Math.max(0,Math.min(5,Math.trunc(Number(raw.step)||0))),attempts:Math.max(0,Number(raw.attempts)||0),correct:Math.max(0,Number(raw.correct)||0),firstTryCorrect:Math.max(0,Number(raw.firstTryCorrect)||0),completed:!!raw.completed,history:Array.isArray(raw.history)?raw.history.slice(-80):[],reviews:raw.reviews&&typeof raw.reviews==='object'?raw.reviews:{},xp:Math.max(0,Number(raw.xp)||0)};
}
export function scheduleReview(reviews,id,ok,now=new Date()){
 const prev=reviews[id]||{level:0};const nextLevel=ok?Math.min(REVIEW_DAYS.length,prev.level+1):0;
 const days=ok?REVIEW_DAYS[Math.max(0,nextLevel-1)]:1;
 const due=new Date(now.getTime()+days*86400000).toISOString();
 return {...reviews,[id]:{level:nextLevel,due,lastResult:ok,at:now.toISOString()}};
}
export function dueReviews(reviews,now=new Date()){
 return Object.entries(reviews||{}).filter(([,v])=>v?.due&&new Date(v.due).getTime()<=now.getTime()).map(([id])=>id);
}
export function recordAttempt(state,step,phraseId,ok,now=new Date()){
 const out=hydrateState(state);out.attempts++;if(ok){out.correct++;out.xp+=5;}
 const firstForStep=!out.history.some(h=>h.step===step&&h.phraseId===phraseId);
 if(ok&&firstForStep)out.firstTryCorrect++;
 out.history.push({step,phraseId,ok,at:now.toISOString(),firstForStep});
 out.history=out.history.slice(-80);
 out.reviews=scheduleReview(out.reviews,phraseId,ok,now);
 out.updatedAt=now.toISOString();return out;
}
export function mastery(state){
 const s=hydrateState(state);const attempts=s.history.filter(h=>h.step>=1&&h.step<=4);
 return {accuracy:attempts.length?Math.round(100*attempts.filter(h=>h.ok).length/attempts.length):0,practices:attempts.length,completed:s.completed,independent:s.history.some(h=>h.step===4&&h.ok),due:dueReviews(s.reviews)};
}