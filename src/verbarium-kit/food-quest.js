/** Interactive visual vocabulary and verb practice for Verbarium. No fabricated XP. */
export const FOOD_VISUALS = Object.freeze({
 apple:{name:'Apple',pt:'maçã',emoji:'🍎'}, apple_half:{name:'Sliced apple',pt:'maçã cortada',emoji:'🍎'},
 banana:{name:'Banana',pt:'banana',emoji:'🍌'}, orange:{name:'Orange',pt:'laranja',emoji:'🍊'},
 strawberry:{name:'Strawberry',pt:'morango',emoji:'🍓'}, grapes:{name:'Grapes',pt:'uvas',emoji:'🍇'},
 watermelon:{name:'Watermelon',pt:'melancia',emoji:'🍉'}, pear:{name:'Pear',pt:'pera',emoji:'🍐'},
 pineapple:{name:'Pineapple',pt:'abacaxi',emoji:'🍍'}, blueberries:{name:'Blueberries',pt:'mirtilos',emoji:'🫐'},
 milk:{name:'Milk',pt:'leite',emoji:'🥛'},orange_juice:{name:'Orange juice',pt:'suco de laranja',emoji:'🧃'},
 bread:{name:'Bread',pt:'pão',emoji:'🍞'},cheese:{name:'Cheese',pt:'queijo',emoji:'🧀'},
 egg:{name:'Egg',pt:'ovo',emoji:'🥚'},carrot:{name:'Carrot',pt:'cenoura',emoji:'🥕'},
 broccoli:{name:'Broccoli',pt:'brócolis',emoji:'🥦'},rice:{name:'Rice',pt:'arroz',emoji:'🍚'},
 sandwich:{name:'Sandwich',pt:'sanduíche',emoji:'🥪'},cupcake:{name:'Cupcake',pt:'bolinho',emoji:'🧁'}
});
export const FOOD_QUESTIONS = Object.freeze([
 {id:'apple',type:'image',prompt:'Selecione a imagem de uma maçã.',speech:'apple',options:['apple','banana','orange','strawberry'],correct:'apple',explain:'Apple significa maçã.'},
 {id:'banana',type:'audio',prompt:'Ouça a palavra e escolha o alimento correto.',speech:'banana',options:['pear','banana','bread','carrot'],correct:'banana',explain:'Banana tem a mesma escrita em português e inglês.'},
 {id:'strawberry',type:'image',prompt:'Encontre o morango.',speech:'strawberry',options:['grapes','strawberry','watermelon','pineapple'],correct:'strawberry',explain:'Strawberry é morango.'},
 {id:'milk',type:'image',prompt:'Qual imagem representa milk?',speech:'milk',options:['orange_juice','milk','rice','cheese'],correct:'milk',explain:'Milk significa leite.'},
 {id:'vegetable',type:'match',prompt:'Como se diz brócolis em inglês?',picture:'broccoli',options:['broccoli','bread','grapes','egg'],correct:'broccoli',explain:'Broccoli é a palavra para brócolis.'},
 {id:'breakfast',type:'match',prompt:'Identifique este alimento.',picture:'bread',options:['milk','cheese','bread','sandwich'],correct:'bread',explain:'Bread significa pão.'},
 {id:'eats',type:'verb',prompt:'She ___ an apple every day.',picture:'apple_half',options:['eat','eats','ate','eating'],correct:'eats',explain:'No Present Simple, she recebe a forma verbal eats.'},
 {id:'drinks',type:'verb',prompt:'He ___ orange juice each morning.',picture:'orange_juice',options:['drink','drinks','drank','drinking'],correct:'drinks',explain:'Com he, drink recebe -s: drinks.'},
 {id:'past',type:'verb',prompt:'Yesterday I ___ a sandwich.',picture:'sandwich',options:['eat','eats','ate','eaten'],correct:'ate',explain:'Ate é o passado simples do verbo eat.'},
 {id:'sentence',type:'arrange',prompt:'Monte a frase: Eu bebo leite.',picture:'milk',speech:'I drink milk',options:['milk','I','drink'],correct:'I drink milk',explain:'Em inglês, usamos sujeito + verbo + objeto: I drink milk.'}
]);
const KEY='verbarium-food-quest-v1';
const blank=()=>({index:0,selected:'',picked:[],answer:null,score:0,finished:false});
let state=blank();
try{const stored=JSON.parse(localStorage.getItem(KEY)||'null');if(stored&&typeof stored==='object'&&Number.isInteger(stored.index)){state={...blank(),...stored,index:Math.min(FOOD_QUESTIONS.length,Math.max(0,stored.index)),picked:Array.isArray(stored.picked)?stored.picked:[]};}}catch{}
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}}
export function foodQuestProgress(){return {index:state.index,total:FOOD_QUESTIONS.length,score:state.score,finished:state.finished};}
export function foodArt(id,emoji='',extra=''){
 const kind=FOOD_VISUALS[id];const fallback=emoji||kind?.emoji||'✦';
 return '<span class="vb-food-art '+safe(extra)+'"><span class="vb-food-emoji" aria-hidden="true">'+safe(fallback)+'</span><img src="/verbarium-2026-kit/items/'+safe(id)+'.webp" alt="" data-vb-food-image decoding="async" loading="lazy" aria-hidden="true"></span>';
}
function progressPath(){
 const k=state.index,complete=state.finished;
 return '<div class="vb-food-path" aria-label="Trilha da missão visual">'+[0,1,2,3,4].map((i)=>{
 const reached=complete||k>=i*2+2,active=!complete&&k>=i*2&&k<i*2+2;
 const name=reached?'star_rating':active?'node_star_active':'node_locked';
 return '<div class="vb-food-path-node '+(reached?'is-complete':active?'is-current':'is-locked')+'">'+foodArt(name,reached?'⭐':active?'🌟':'🔒')+'<span>'+(i*2+1)+'–'+(i*2+2)+'</span></div>';
 }).join('')+'</div>';
}
function imageChoice(id){
 const entry=FOOD_VISUALS[id];const label=entry?.name||id;
 const chosen=state.selected===id,answered=!!state.answer;
 const result=answered?(id===FOOD_QUESTIONS[state.index].correct?'is-correct':chosen?'is-wrong':''):'';
 return '<button type="button" class="vb-food-choice '+(chosen?'is-selected ':'')+result+'" data-action="food-pick" data-value="'+safe(id)+'" aria-pressed="'+chosen+'" aria-label="'+safe(label)+'" '+(answered?'disabled':'')+'>'+foodArt(id,entry?.emoji||'🍎')+'<span class="vb-food-choice-caption">'+safe(label)+'</span></button>';
}
function wordChoice(id){
 const chosen=state.selected===id,answered=!!state.answer;
 const correct=FOOD_QUESTIONS[state.index].correct;
 return '<button type="button" class="vb-food-word '+(chosen?'is-selected ':'')+(answered?(id===correct?'is-correct':chosen?'is-wrong':''):'')+'" data-action="food-pick" data-value="'+safe(id)+'" aria-pressed="'+chosen+'" '+(answered?'disabled':'')+'>'+safe(id)+'</button>';
}
function arrangeBank(q){
 const used=state.picked;
 const answer=used.map(i=>q.options[i]).join(' ');
 return '<div class="vb-food-answer-builder" aria-label="Frase em construção">'+(used.length?safe(answer):'<span>Toque nas palavras abaixo…</span>')+'</div><div class="vb-food-wordbank" role="group" aria-label="Escolha a ordem das palavras">'+q.options.map((word,i)=>'<button type="button" data-action="food-word" data-value="'+i+'" '+(used.includes(i)||state.answer?'disabled':'')+' class="vb-food-word '+(used.includes(i)?'is-used':'')+'">'+safe(word)+'</button>').join('')+'</div>'+(state.answer?'':'<button type="button" class="vb-food-undo" data-action="food-undo" '+(!used.length?'disabled':'')+'>↶ Desfazer última palavra</button>');
}
export function renderFoodQuest(){
 const current=FOOD_QUESTIONS[state.index],done=state.finished||!current;
 if(done)return '<div class="vb-food-page"><div class="vb-food-finish">'+foodArt('chest_open','🎁','vb-food-finish-art')+'<span class="v2-kicker">MISSÃO CONCLUÍDA</span><h1>O mercado das palavras</h1><p>Você respondeu às dez atividades de alimentos, verbos e frases.</p><strong class="vb-food-score">'+state.score+' / '+FOOD_QUESTIONS.length+' acertos</strong>'+foodArt('gold_medal','🏅','vb-food-medal')+'<div><button class="button bright" data-action="food-reset">Praticar novamente</button> <button class="button outline" data-route="learn">Voltar à trilha</button></div></div></div>';
 const percent=Math.round(100*state.index/FOOD_QUESTIONS.length);
 const isImage=current.type==='image'||current.type==='audio';
 let options='';
 if(current.type==='arrange')options=arrangeBank(current);
 else if(isImage)options='<div class="vb-food-image-grid">'+current.options.map(imageChoice).join('')+'</div>';
 else options='<div class="vb-food-word-grid">'+current.options.map(wordChoice).join('')+'</div>';
 const picture=current.picture?'<div class="vb-food-prompt-art">'+foodArt(current.picture,FOOD_VISUALS[current.picture]?.emoji)+'</div>':'';
 const speech=current.speech?'<button type="button" class="vb-food-audio" data-action="food-audio" data-value="'+encodeURIComponent(current.speech)+'" aria-label="Ouvir palavra em inglês">'+foodArt('audio_wave','🔊')+' <span>Ouvir pronúncia</span></button>':'';
 const answer=state.answer;
 return '<div class="vb-food-page"><header class="vb-food-header"><span class="v2-kicker">MUNDO 01 · VOCABULÁRIO EM CONTEXTO</span><h1>O mercado das palavras</h1><p>Reconheça alimentos, escute palavras e construa frases com verbos reais.</p>'+progressPath()+'</header><section class="vb-food-exercise" aria-label="Exercício visual de inglês"><div class="vb-food-meter"><span>Aula visual · '+(state.index+1)+' / '+FOOD_QUESTIONS.length+'</span><strong>'+percent+'%</strong></div><div class="vb-food-track" role="progressbar" aria-label="Progresso da missão" aria-valuenow="'+percent+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+percent+'%"></i></div><div class="vb-food-question"><span class="v2-kicker">'+safe(current.type==='arrange'?'MONTE UMA FRASE':current.type==='verb'?'CONJUGUE O VERBO':current.type==='audio'?'ESCUTE E RECONHEÇA':'IDENTIFIQUE O ALIMENTO')+'</span><h2>'+safe(current.prompt)+'</h2></div>'+picture+speech+options+(answer?'<div class="vb-food-feedback '+(answer.ok?'is-correct':'is-wrong')+'" role="status"><strong>'+(answer.ok?'Resposta correta!':'Vamos revisar.')+'</strong><p>'+safe(current.explain)+'</p></div>':'')+'<div class="vb-food-actions">'+(answer?'<button class="button bright" data-action="food-next">'+(state.index+1===FOOD_QUESTIONS.length?'Ver resultado':'Continuar')+'</button>':'<button class="button bright" data-action="food-check" '+((current.type==='arrange'?!state.picked.length:!state.selected)?'disabled':'')+'>Verificar resposta</button>')+'</div></section></div>';
}
export function handleFoodQuestAction(action,value){
 const q=FOOD_QUESTIONS[state.index];
 if(action==='food-reset'){state=blank();save();return {changed:true};}
 if(!q)return {changed:false};
 if(action==='food-audio')return {changed:false,say:decodeURIComponent(value||q.speech||'')};
 if(action==='food-next'&&state.answer){state.index++;state.finished=state.index>=FOOD_QUESTIONS.length;state.selected='';state.picked=[];state.answer=null;save();return {changed:true,completed:state.finished};}
 if(state.answer)return {changed:false};
 if(action==='food-pick'&&q.options.includes(value)){state.selected=value;save();return {changed:true};}
 if(action==='food-word'&&q.type==='arrange'){const i=Number(value);if(Number.isInteger(i)&&i>=0&&i<q.options.length&&!state.picked.includes(i)){state.picked.push(i);save();return {changed:true};}}
 if(action==='food-undo'&&q.type==='arrange'){state.picked.pop();save();return {changed:true};}
 if(action==='food-check'){
  const chosen=q.type==='arrange'?state.picked.map(i=>q.options[i]).join(' '):state.selected;
  if(!chosen)return {changed:false};
  const ok=chosen.toLowerCase()===q.correct.toLowerCase();
  state.answer={value:chosen,ok};if(ok)state.score++;save();
  return {changed:true,attempt:{id:'food-'+q.id,ok}};
 }
 return {changed:false};
}
export function hydrateFoodQuest(root){
 root?.querySelectorAll('img[data-vb-food-image]').forEach(img=>{
  const toggle=()=>img.parentElement?.classList.toggle('is-loaded',img.naturalWidth>0);
  if(img.complete)toggle();else{img.addEventListener('load',toggle,{once:true});img.addEventListener('error',toggle,{once:true});}
 });
}
export function foodReviewQuestions(){return FOOD_QUESTIONS.map(q=>({
 id:'food-'+q.id,type:'choice',topic:'food',
 prompt:q.type==='arrange'?'Qual frase significa “Eu bebo leite”?':q.type==='verb'?q.prompt:'Qual alternativa em inglês corresponde ao alimento da atividade '+q.id+'?',
 options:q.type==='arrange'?['I drink milk','I milk drink','I drinks milk']:q.options,
 correct:q.correct,explain:q.explain
}));}
