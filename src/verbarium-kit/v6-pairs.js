/** Verbarium V6. Four real tasks: picture matching, verb matching, sentence halves and word order.
 * All answers and progress are data-driven; illustrations carry no actual learner state.
 */
export const V6_PAIR_STAGES=Object.freeze([
 {id:'vocabulary',title:'Descubra os pares',subtitle:'Toque numa imagem e depois na palavra em inglês.',level:'Nível 1 · Vocabulário',type:'match',left:[
  {id:'apple',label:'Maçã',image:'apple'},{id:'banana',label:'Banana',image:'banana'},
  {id:'milk',label:'Leite',image:'milk'},{id:'bread',label:'Pão',image:'bread'}],
  right:[{id:'bread',label:'Bread'},{id:'apple',label:'Apple'},{id:'milk',label:'Milk'},{id:'banana',label:'Banana'}],
  explain:'Cada alimento tem seu correspondente em inglês.'},
 {id:'verbs',title:'Escolha a forma do verbo',subtitle:'Combine o sujeito e o verbo entre parênteses com a forma correta.',level:'Nível 2 · Present Simple',type:'match',left:[
  {id:'eat',label:'I (eat)'},{id:'eats',label:'She (eat)'},{id:'drinks',label:'He (drink)'},{id:'drink',label:'They (drink)'}],
  right:[{id:'drinks',label:'drinks'},{id:'eat',label:'eat'},{id:'drink',label:'drink'},{id:'eats',label:'eats'}],
  explain:'Com he/she/it, normalmente acrescentamos -s ao verbo no Present Simple.'},
 {id:'phrases',title:'Complete cada frase',subtitle:'Encontre a continuação certa para cada início de frase.',level:'Nível 3 · Formação de frases',type:'match',left:[
  {id:'apple',label:'I eat'},{id:'milk',label:'She drinks'},{id:'bread',label:'They buy'},{id:'pineapple',label:'He cuts'}],
  right:[{id:'bread',label:'fresh bread.'},{id:'pineapple',label:'the pineapple.'},{id:'apple',label:'an apple.'},{id:'milk',label:'a glass of milk.'}],
  explain:'A ordem mais comum é sujeito + verbo + complemento.'},
 {id:'sentence',title:'Monte uma frase completa',subtitle:'Toque nas palavras na ordem correta.',level:'Nível 4 · Construção',type:'arrange',
  words:['orange','I','juice','fresh','drink'],correct:'I drink fresh orange juice',
  explain:'I drink fresh orange juice = Eu bebo suco de laranja fresco.'}
]);
const STORAGE='verbarium-pair-quest-v6';
const blank=()=>({stage:0,selected:null,matched:[],wrong:null,wordOrder:[],wordCheck:null,correctMatches:0,mistakes:0,finished:false});
let state=blank();
try{
 const data=JSON.parse(localStorage.getItem(STORAGE)||'null');
 if(data&&Number.isInteger(data.stage)&&data.stage>=0&&data.stage<=V6_PAIR_STAGES.length){
  state={...blank(),...data,matched:Array.isArray(data.matched)?data.matched:[],wordOrder:Array.isArray(data.wordOrder)?data.wordOrder:[],selected:null,wrong:null};
 }
}catch{}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch{}}
export function v6PairProgress(){return {stage:state.stage,total:V6_PAIR_STAGES.length,finished:state.finished,matched:state.correctMatches,mistakes:state.mistakes};}
export function resetV6PairQuest(){state=blank();save();}
function pairedIds(q){return q.type==='match'?q.left.map(p=>p.id):[];}
function isStageSolved(q){return q.type==='match'?pairedIds(q).every(id=>state.matched.includes(id)):state.wordCheck===true;}
function art(name,css=''){return `<span class="vb6-art ${esc(css)}"><img src="/verbarium-v6/assets/${esc(name)}.webp" alt="" loading="lazy" decoding="async"></span>`;}
function renderTile(pair,side,stage){
 const chosen=state.selected?.side===side&&state.selected?.id===pair.id;
 const matched=state.matched.includes(pair.id);
 const wrong=!!state.wrong&&state.wrong[side]===pair.id;
 const food=pair.image?`<img class="vb6-pair-fruit" src="/verbarium-2026-kit/items/${esc(pair.image)}.webp" alt="" loading="lazy" decoding="async">`:'';
 return `<button type="button" class="vb6-pair-tile ${chosen?'is-selected':''} ${matched?'is-matched':''} ${wrong?'is-wrong':''}" data-action="v6-pair-pick" data-value="${side}:${esc(pair.id)}" aria-pressed="${chosen}" ${matched?'disabled':''} aria-label="${esc(pair.label)}">${food}<span>${esc(pair.label)}</span>${matched?art('buttons/correct','vb6-tile-check'):''}</button>`;
}
function renderMatching(q){
 const done=isStageSolved(q);
 return `<section class="vb6-pair-exercise" aria-label="Combinar pares">
 <div class="vb6-pair-columns"><div class="vb6-pair-column" aria-label="Primeira coluna">${q.left.map(p=>renderTile(p,'left',q)).join('')}</div><div class="vb6-pair-center" aria-hidden="true">${art('pairs/link_icon')}</div><div class="vb6-pair-column" aria-label="Segunda coluna">${q.right.map(p=>renderTile(p,'right',q)).join('')}</div></div>
 <div class="vb6-task-help" role="status">${state.wrong?'Ainda não formam um par. Tente outra combinação.':done?q.explain:`${state.matched.length} de ${q.left.length} pares encontrados. Selecione um item de cada coluna.`}</div>
 ${done?`<button class="vb6-cta" data-action="v6-stage-next" type="button">${art('buttons/continue')}<span>Continuar</span></button>`:''}
 </section>`;
}
function renderSentence(q){
 const sentence=state.wordOrder.map(i=>q.words[i]).join(' ');
 return `<section class="vb6-pair-exercise vb6-pair-sentence" aria-label="Montagem de frase">
 <div class="vb6-pair-prompt">${art('panels/phrase_challenge')}<span>Eu bebo suco de laranja fresco.</span></div>
 <div class="vb6-sentence-target" aria-live="polite">${state.wordOrder.length?esc(sentence):'<span class="vb6-pair-placeholder">Selecione as palavras abaixo para formar a frase.</span>'}</div>
 <div class="vb6-word-bank">${q.words.map((word,i)=>`<button type="button" class="vb6-word ${state.wordOrder.includes(i)?'is-used':''}" data-action="v6-word-pick" data-value="${i}" ${state.wordOrder.includes(i)||state.wordCheck===true?'disabled':''}>${esc(word)}</button>`).join('')}</div>
 <div class="vb6-word-controls"><button type="button" data-action="v6-word-undo" ${state.wordOrder.length===0||state.wordCheck===true?'disabled':''}>↶ Desfazer</button><button type="button" data-action="v6-word-clear" ${state.wordOrder.length===0||state.wordCheck===true?'disabled':''}>Limpar frase</button></div>
 ${state.wordCheck!==null?`<div class="vb6-task-help ${state.wordCheck?'is-success':'is-error'}" role="status">${state.wordCheck?q.explain:'A ordem ainda não está correta. Experimente começar com o sujeito “I”.'}</div>`:''}
 <button type="button" class="vb6-cta" data-action="${state.wordCheck===true?'v6-stage-next':'v6-word-check'}" ${state.wordOrder.length!==q.words.length&&state.wordCheck!==true?'disabled':''}>${art(state.wordCheck===true?'buttons/continue':'buttons/verify')}<span>${state.wordCheck===true?'Ver resultado':'Verificar frase'}</span></button>
 </section>`;
}
function progressStrip(){return `<div class="vb6-pair-steps" role="list" aria-label="Progresso dos quatro níveis">${V6_PAIR_STAGES.map((q,i)=>{
 const status=i<state.stage?'done':i===state.stage&&!state.finished?'current':'future';
 const asset=status==='done'?'progress/node_completed':status==='current'?'progress/node_current':'progress/node_locked';
 return `<div class="vb6-pair-step ${status}" role="listitem">${art(asset)}<strong>${i+1}</strong><small>${esc(q.level.replace('Nível '+(i+1)+' · ',''))}</small></div>`;
 }).join('')}</div>`}
export function renderV6PairQuest(){
 if(state.finished||state.stage>=V6_PAIR_STAGES.length){return `<main class="vb6-pairs vb6-pairs-done"><div class="vb6-done-art">${art('characters/fox_graduate')}${art('progress/mastery_badge')}</div><span class="v2-kicker">JORNADA CONCLUÍDA</span><h1>Você conectou palavras e ideias!</h1><p>Quatro níveis concluídos: vocabulário, conjugação, combinações e construção de frases.</p><div class="vb6-pair-score">${state.correctMatches} pares corretos · ${state.mistakes} tentativas incorretas</div><div class="vb6-done-actions"><button class="button bright" data-action="v6-pair-reset">Praticar novamente</button><button class="button outline" data-route="learn">Voltar à trilha</button></div></main>`;}
 const q=V6_PAIR_STAGES[state.stage];
 return `<main class="vb6-pairs"><header class="vb6-pair-head"><div class="vb6-pair-eyebrow">DESAFIO INTERATIVO · ${esc(q.level)}</div><h1>${esc(q.title)}</h1><p>${esc(q.subtitle)}</p><div class="vb6-pair-guide">${art('characters/fox_neutral','vb6-pair-fox')}${art('panels/mini_lesson','vb6-pair-mini')}</div></header>${progressStrip()}
 ${q.type==='match'?renderMatching(q):renderSentence(q)}<div class="vb6-pair-footer"><button class="vb6-secondary" type="button" data-action="v6-pair-restart-stage">Recomeçar este nível</button><button type="button" data-route="learn" class="vb6-secondary">Voltar à trilha</button></div></main>`;
}
export function handleV6PairAction(action,value){
 if(action==='v6-pair-reset'){resetV6PairQuest();return {changed:true};}
 const q=V6_PAIR_STAGES[state.stage];if(!q||state.finished)return {changed:false};
 if(action==='v6-pair-restart-stage'){state.selected=null;state.matched=[];state.wrong=null;state.wordOrder=[];state.wordCheck=null;save();return {changed:true};}
 if(action==='v6-speak'){return {changed:false,say:decodeURIComponent(value||'')};}
 if(action==='v6-stage-next'&&isStageSolved(q)){
  state.stage++;state.selected=null;state.matched=[];state.wrong=null;state.wordOrder=[];state.wordCheck=null;
  if(state.stage>=V6_PAIR_STAGES.length)state.finished=true;
  save();return {changed:true,completed:state.finished};
 }
 if(q.type==='match'&&action==='v6-pair-pick'){
  const [side,id]=(value||'').split(':');
  if(!['left','right'].includes(side)||state.matched.includes(id)||!q[side]?.some(p=>p.id===id))return {changed:false};
  if(!state.selected||state.selected.side===side){state.selected={side,id};state.wrong=null;save();return {changed:true};}
  const prev=state.selected;
  const left=side==='left'?id:prev.id,right=side==='right'?id:prev.id;
  if(left===right){state.matched.push(left);state.correctMatches++;state.wrong=null;}
  else{state.mistakes++;state.wrong={left,right};}
  state.selected=null;save();return {changed:true,matched:left===right,stageDone:isStageSolved(q)};
 }
 if(q.type==='arrange'){
  if(action==='v6-word-pick'&&state.wordCheck!==true){const n=Number(value);if(Number.isInteger(n)&&n>=0&&n<q.words.length&&!state.wordOrder.includes(n)){state.wordOrder.push(n);state.wordCheck=null;save();return {changed:true};}}
  if(action==='v6-word-undo'&&state.wordCheck!==true){state.wordOrder.pop();state.wordCheck=null;save();return {changed:true};}
  if(action==='v6-word-clear'&&state.wordCheck!==true){state.wordOrder=[];state.wordCheck=null;save();return {changed:true};}
  if(action==='v6-word-check'&&state.wordOrder.length===q.words.length&&state.wordCheck!==true){
    const phrase=state.wordOrder.map(i=>q.words[i]).join(' ');
    state.wordCheck=phrase===q.correct;
    if(!state.wordCheck)state.mistakes++;
    save();return {changed:true,correct:state.wordCheck};
  }
 }
 return {changed:false};
}
