/**
 * Verbarium v8 interactive learning components.
 * Presentation only: events, scoring, navigation and persistent progress remain
 * in the app's existing learning engine. No composited screenshots as assets.
 */
import {renderProgress} from './library.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const attr=esc;
const clamp=(value,max)=>Math.min(max,Math.max(0,Number.isFinite(Number(value))?Number(value):0));
const whole=(value)=>Math.max(0,Math.round(Number(value)||0));
const knownAction=new Set(['practice-answer','lesson-answer','dialog-choice']);
export const LEARNING_ICON_URLS=Object.freeze({
  correct:'/ui-kit/icons/check.svg',
  retry:'/ui-kit/icons/refresh.svg',
  book:'/ui-kit/icons/book.svg',
  star:'/ui-kit/icons/star.svg',
  speech:'/ui-kit/icons/chat.svg',
  hearing:'/ui-kit/icons/volume.svg',
  trophy:'/ui-kit/icons/trophy.svg',
  streak:'/ui-kit/icons/flame.svg',
  target:'/ui-kit/icons/target.svg',
  timer:'/ui-kit/icons/clock.svg',
  speaker:'/ui-kit/icons/volume.svg',
  brain:'/ui-kit/icons/brain.svg'
});
const image=(name,extra='')=>'<img class="vb8-graphic '+extra+'" src="'+LEARNING_ICON_URLS[name]+'" alt="" aria-hidden="true" loading="lazy" decoding="async">';
export function renderStepMeter({current=0,total=1,label='Etapas da atividade',tone='violet'}={}){
 const max=Math.max(1,whole(total)),now=clamp(current,max),pct=Math.round(now/max*100);
 return '<div class="vb8-meter" data-vb8-component="step-meter" data-tone="'+(tone==='mint'?'mint':'violet')+'">'+
  '<div class="vb8-meter__caption"><span>'+esc(label)+'</span><strong>'+now+' / '+max+'</strong></div>'+
  '<div class="vb8-meter__track" role="progressbar" aria-label="'+attr(label)+'" aria-valuemin="0" aria-valuemax="'+max+'" aria-valuenow="'+now+'"><i style="width:'+pct+'%"></i></div></div>';
}
export function renderChoiceGroup({options=[],selected=null,correct=null,submitted=false,action='practice-answer',indexMode=false,groupLabel='Escolha uma resposta'}={}){
 const dataAction=knownAction.has(action)?action:'practice-answer';
 return '<div class="vb8-choice-group" data-vb8-component="choices" role="group" aria-label="'+attr(groupLabel)+'">'+options.map((v,i)=>{
  const value=String(v),current=indexMode?i===Number(selected):value===selected,valid=indexMode?i===Number(correct):value===correct;
  const state=submitted?(valid?'correct':current?'incorrect':'idle'):current?'selected':'idle';
  const trigger=indexMode?'data-index="'+i+'"':'data-value="'+attr(value)+'"';
  return '<button type="button" class="vb8-choice answer'+(state==='correct'?' correct':state==='incorrect'?' incorrect':'')+'" data-vb8-state="'+state+'" data-action="'+dataAction+'" '+trigger+' aria-pressed="'+(current?'true':'false')+'" '+(submitted?'disabled':'')+'><span class="vb8-choice__index" aria-hidden="true">'+String.fromCharCode(65+i)+'</span><span class="vb8-choice__label">'+esc(value)+'</span><span class="vb8-choice__status" aria-hidden="true">'+(state==='correct'?'✓':state==='incorrect'?'×':'')+'</span></button>';
 }).join('')+'</div>';
}
export function renderFeedback({correct=false,title='',detail='',note=''}={}){
 const kind=correct?'success':'retry';
 return '<div class="vb8-feedback" data-vb8-component="feedback" data-kind="'+kind+'" role="status" aria-live="polite">'+image(correct?'correct':'retry','vb8-feedback__icon')+'<div class="vb8-feedback__copy"><strong>'+esc(title)+'</strong><p>'+esc(detail)+'</p>'+(note?'<small>'+esc(note)+'</small>':'')+'</div></div>';
}
export function renderLessonQuestion({question=[],index=0,total=1,answer=null}={}){
 const [prompt,options=[],correct,explanation]=question;
 const finished=!!answer;
 return '<section class="vb8-exercise" data-vb8-component="lesson-activity" aria-label="Atividade de fixação">'+
  '<div class="vb8-section-kicker">'+image('brain')+' <span>PRATIQUE O QUE APRENDEU</span></div>'+
  renderStepMeter({current:index+1,total,label:'Pergunta da lição'})+
  '<div class="vb8-exercise__prompt"><small>SELECIONE A OPÇÃO CORRETA</small><h2>'+esc(prompt)+'</h2></div>'+
  renderChoiceGroup({options,correct,selected:answer?.value,submitted:finished,action:'lesson-answer',groupLabel:'Alternativas da pergunta'})+
  (finished?'<div class="vb8-exercise__response">'+renderFeedback({correct:!!answer.ok,title:answer.ok?'Correto!':'Vamos corrigir juntos',detail:answer.ok?explanation:'A resposta correta é '+String(correct)+'. '+String(explanation)})+'<button type="button" class="vb8-action vb8-action--violet" data-action="lesson-next">'+(index+1===total?'Ver meu resultado':'Próxima pergunta')+' <span aria-hidden="true">→</span></button></div>':'<p class="vb8-hint">Escolha uma opção. Você receberá a explicação antes de continuar.</p>')+
  '</section>';
}
export function renderLessonCompletion({score=0,total=1,lessonId='be',artMarkup=''}={}){
 const max=Math.max(1,whole(total)),correct=clamp(score,max),complete=correct===max;
 return '<section class="vb8-completion" data-vb8-component="lesson-completion" data-complete="'+complete+'" aria-label="Resultado da lição">'+
  '<div class="vb8-completion__art" aria-hidden="true">'+(artMarkup||image(complete?'trophy':'book'))+'</div>'+
  '<div class="vb8-completion__eyebrow">LIÇÃO FINALIZADA</div>'+
  '<h2>'+(complete?'Muito bem! Você aplicou a estrutura.':'Quase lá. Vamos praticar mais?')+'</h2>'+
  '<p>Você acertou <strong>'+correct+' de '+max+'</strong> questões. '+(complete?'A lição foi marcada como concluída.':'Para concluir esta lição, refaça e acerte todas as questões.')+'</p>'+
  renderProgress({value:correct,max,label:'Questões corretas nesta lição',tone:complete?'mint':'violet'})+
  '<div class="vb8-completion__actions"><button type="button" class="vb8-action vb8-action--violet" data-action="restart-lesson">Refazer aula</button><button type="button" class="vb8-action vb8-action--ghost" data-route="learn">Voltar à trilha</button></div></section>';
}
export function renderPracticeScreen({round=[],index=0,correct=0,answer=null,reviewOnly=false,mode='mixed'}={}){
 if(!Array.isArray(round)||!round.length)return '<section class="vb8-practice-empty"><h2>Nada pendente para revisar agora.</h2><p>Volte depois ou faça novos exercícios para continuar treinando.</p><button type="button" class="vb8-action vb8-action--violet" data-action="practice-mode" data-value="mixed">Começar exercícios gerais</button></section>';
 const total=round.length,done=index>=total,q=round[index];
 let body;
 if(done){
  const actual=clamp(correct,total),all=actual===total;
  body='<section class="vb8-completion vb8-practice-completion" data-vb8-component="practice-completion" aria-label="Resultado da rodada">'+
   '<div class="vb8-completion__art">'+image(all?'trophy':'book')+'</div><span class="vb8-completion__eyebrow">RODADA CONCLUÍDA</span>'+
   '<h2>'+actual+' de '+total+' respostas corretas.</h2><p>'+(all?'Você acertou toda a rodada. Tente usar as frases sem consultar alternativas.':'Os erros foram registrados para futuras revisões. Confira a explicação e tente novamente.')+'</p>'+
   renderProgress({value:actual,max:total,tone:all?'mint':'violet',label:'Acertos nesta rodada'})+
   '<div class="vb8-completion__actions"><button type="button" class="vb8-action vb8-action--violet" data-action="new-round">Nova rodada</button><button type="button" class="vb8-action vb8-action--ghost" data-route="review">Ver revisões</button></div></section>';
 }else{
  const hasAnswer=!!answer,written=q.type==='write';
  body='<section class="vb8-exercise vb8-practice-card" data-vb8-component="practice-activity" aria-label="Exercício de inglês">'+
   '<div class="vb8-section-kicker">'+image(written?'book':'brain')+' <span>'+(written?'PRODUÇÃO ESCRITA':'RECONHECIMENTO DE ESTRUTURA')+'</span></div>'+
   renderStepMeter({current:index+1,total,label:'Progresso da rodada'})+
   '<div class="vb8-exercise__prompt"><small>'+(written?'CONSTRUA SUA RESPOSTA':'ESCOLHA A MELHOR ALTERNATIVA')+'</small><h2>'+esc(q.prompt)+'</h2></div>'+
   (written?'<p class="vb8-practice-hint">'+(q.hint?'Dica de estrutura: '+esc(q.hint):'Tente escrever a frase completa.')+'</p><div class="vb8-writing"><label for="write-answer">SUA RESPOSTA EM INGLÊS</label><input id="write-answer" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Escreva sua frase..." value="'+attr(answer?.value||'')+'" '+(hasAnswer?'disabled':'')+'></div>':
    renderChoiceGroup({options:q.options||[],correct:q.correct,selected:answer?.value,submitted:hasAnswer,action:'practice-answer'}))+
   (hasAnswer?'<div class="vb8-exercise__response">'+renderFeedback({correct:!!answer.ok,title:answer.ok?'Boa! Resposta correta.':'Resposta esperada: '+String(written?q.answer:q.correct),detail:q.explain,note:written?'Correção por respostas aceitas, não análise semântica livre.':''})+
     '<div class="vb8-exercise__footer"><small>'+clamp(correct,total)+' acerto(s) nesta rodada</small><button class="vb8-action vb8-action--violet" type="button" data-action="practice-next">'+(index+1===total?'Ver resultado':'Próxima questão')+' <span aria-hidden="true">→</span></button></div></div>':
     '<div class="vb8-exercise__footer">'+(written?'<button class="vb8-action vb8-action--violet" type="button" data-action="practice-submit">Conferir resposta <span aria-hidden="true">→</span></button>':'<p class="vb8-hint">Tente antes de consultar a explicação.</p>')+'</div>')+
   '</section>';
 }
 return '<div class="vb8-learning-screen" data-vb8-screen="practice">'+
  '<header class="vb8-learning-header"><div class="vb8-section-kicker">'+image('target')+' <span>'+(reviewOnly?'REVISÃO DE ERROS':'PRÁTICA ATIVA')+'</span></div><h1>Pense primeiro. <em>Responda depois.</em></h1><p>Treine reconhecimento e produção. Cada resposta revela a lógica por trás da frase.</p></header>'+
  (!reviewOnly?'<div class="vb8-mode-switch" role="group" aria-label="Tipo de exercício">'+[['mixed','Misturado'],['choice','Escolha'],['write','Escrita']].map(([id,label])=>'<button type="button" class="vb8-mode-switch__item" data-action="practice-mode" data-value="'+id+'" aria-pressed="'+(id===mode)+'">'+label+'</button>').join('')+'</div>':'<button type="button" class="back-link" data-route="review">← Voltar às revisões</button>')+
  body+'</div>';
}
export function renderDialogueMessages(messages=[]){
 return messages.map(({mine=false,text='',pt=''},i)=>{
  const speaking=!mine;
  return '<div class="vb8-dialog-turn'+(mine?' vb8-dialog-turn--mine':'')+'" data-vb8-component="dialogue-turn" data-vb8-role="'+(mine?'learner':'character')+'">'+
    '<span class="vb8-dialog-turn__avatar" aria-hidden="true"><img src="/verbarium-v3/assets/speaking/'+(mine?'student_boy':'student_girl')+'.png" alt="" loading="lazy" decoding="async"></span>'+
    '<div class="vb8-dialog-turn__bubble"><p lang="en">'+esc(text)+'</p>'+(pt?'<small lang="pt-BR">'+esc(pt)+'</small>':'')+
      (speaking?'<button type="button" class="vb8-dialog-turn__listen" data-action="speak-audio" data-say="'+encodeURIComponent(text)+'" aria-label="Ouvir frase '+(i+1)+' em inglês">'+image('speaker')+'<span>Ouvir</span></button>':'')+
    '</div></div>';
 }).join('');
}
export function renderDialogueScreen({scenarios=[],scenario=null,stepIndex=0,history=[],answer=null,micStatus=''}={}){
 if(!scenario)return '';
 const total=scenario.steps?.length||0,finished=stepIndex>=total,step=finished?null:scenario.steps[stepIndex];
 const msgs=[...history,...(step?[{mine:false,text:step.ask,pt:step.pt}]:[])];
 const chooser='<div class="vb8-scenario-list" role="group" aria-label="Escolha uma situação">'+scenarios.map(s=>{
  const selected=s.id===scenario.id;
  return '<button type="button" class="vb8-scenario" data-vb8-component="scenario" data-action="select-scenario" data-id="'+attr(s.id)+'" aria-pressed="'+selected+'">'+
   '<img src="/icons/3d/'+attr(s.id)+'.png" alt="" aria-hidden="true" loading="lazy" decoding="async">'+
   '<span><strong>'+esc(s.title)+'</strong><small>'+esc(s.desc)+'</small></span></button>';
 }).join('')+'</div>';
 let response;
 if(finished){
  response='<div class="vb8-completion vb8-dialogue-completion"><div class="vb8-completion__art">'+image('trophy')+'</div>'+
    '<span class="vb8-completion__eyebrow">CONVERSA CONCLUÍDA</span><h2>Você manteve o diálogo.</h2>'+
    '<p>Agora repita as falas em voz alta sem ler o texto.</p><button class="vb8-action vb8-action--violet" type="button" data-action="reset-scenario">Praticar novamente</button></div>';
 }else{
  response='<div class="vb8-dialogue__prompt">'+renderStepMeter({current:stepIndex+1,total,label:'Etapa do diálogo'})+
   '<h3>Sua vez de responder</h3>'+
   renderChoiceGroup({options:step.choices,correct:step.correct,selected:answer?.index,submitted:!!answer,indexMode:true,action:'dialog-choice',groupLabel:'Respostas para continuar a conversa'})+
   (answer?'<div class="vb8-exercise__response">'+renderFeedback({correct:!!answer.ok,title:answer.ok?'Resposta adequada.':'Uma opção mais natural seria: '+String(step.choices[step.correct]),detail:step.note})+
      '<button type="button" class="vb8-action vb8-action--violet" data-action="dialog-next">Continuar diálogo <span aria-hidden="true">→</span></button></div>':
     '<div class="vb8-dialogue__audio"><button type="button" data-action="speak-audio" data-say="'+encodeURIComponent(step.speech)+'">'+image('speaker')+'Ouvir uma boa resposta</button>'+
      '<button type="button" data-action="record-speech">'+image('hearing')+'Tentar com a voz</button><small>Microfone opcional</small></div>')+
   '<div class="vb8-dialogue__status" role="status">'+esc(micStatus)+'</div>'+
   '<p class="vb8-dialogue__disclaimer">Este exercício avalia escolhas e compara transcrições aproximadas, não mede sotaque ou fluência.</p></div>';
 }
 return '<div class="vb8-learning-screen" data-vb8-screen="dialogue">'+
  '<header class="vb8-learning-header"><div class="vb8-section-kicker">'+image('speech')+' <span>CONVERSAÇÃO GUIADA</span></div><h1>Uma resposta abre <em>a conversa.</em></h1><p>Escolha um cenário, escute a pergunta e responda no seu ritmo.</p></header>'+
  chooser+
  '<section class="vb8-dialogue" data-vb8-component="dialogue">'+
   '<header class="vb8-dialogue__header"><div><span>SIMULAÇÃO '+esc(scenario.icon)+' · '+total+' TROCAS</span><h2>'+esc(scenario.title)+'</h2></div><button type="button" class="vb8-dialogue__reset" data-action="reset-scenario">Recomeçar</button></header>'+
   '<div class="vb8-dialogue__history" id="chat-history" aria-label="Histórico do diálogo">'+renderDialogueMessages(msgs)+'</div>'+
   response+'</section></div>';
}
export function renderGuidedPath({lessons=[],completed=[],currentId='',limit=7}={}){
 const complete=new Set(completed),selectedIndex=Math.max(0,lessons.findIndex(l=>l.id===currentId));
 const start=Math.max(0,Math.min(selectedIndex-1,Math.max(0,lessons.length-1)));
 const visible=lessons.slice(start,start+Math.max(1,Math.min(12,whole(limit))));
 const completeCount=lessons.filter(l=>complete.has(l.id)).length;
 return '<section class="vb8-path" data-vb8-component="path" aria-label="Trilha guiada de aulas">'+
  '<header class="vb8-path__header"><div><span class="vb8-section-kicker">'+image('book')+' <span>TRILHA GUIADA</span></span><h2>Sua próxima jornada</h2><p>Continue pela próxima aula. Os demais caminhos continuam disponíveis.</p></div>'+
  '<span class="vb8-path__count">'+completeCount+'/'+lessons.length+' aulas</span></header>'+
  renderProgress({value:completeCount,max:Math.max(1,lessons.length),label:'Aulas concluídas na trilha',showValue:false})+
  '<ol class="vb8-path__list">'+visible.map((l,i)=>{
   const state=complete.has(l.id)?'done':l.id===currentId?'current':'upcoming';
   return '<li data-state="'+state+'"><button type="button" class="vb8-path__lesson" data-vb8-component="path-node" data-action="open-lesson" data-id="'+attr(l.id)+'" '+(state==='current'?'aria-current="step"':'')+'><span class="vb8-path__node">'+(state==='done'?image('correct'):state==='current'?image('star'):'<strong>'+String(start+i+1)+'</strong>')+'</span>'+
    '<span class="vb8-path__text"><strong>'+esc(l.title)+'</strong><small>'+esc(l.subtitle)+'</small></span>'+
    '<span class="vb8-path__meta">'+esc(l.level)+'<small>'+(state==='done'?'Concluída':state==='current'?'Continuar':'Explorar')+'</small></span></button></li>';
  }).join('')+'</ol></section>';
}
export function renderRewards({completion=0,accuracy=0,attempts=0,completed=0,total=0,streak=0,due=0,label='Sua jornada começa aqui'}={}){
 const done=clamp(completed,Math.max(1,whole(total))),pct=clamp(completion,100),hasAttempts=whole(attempts)>0;
 const cells=[
  {key:'book',title:'Aulas concluídas',value:done+' / '+whole(total),detail:'Aulas finalizadas na sua trilha'},
  {key:'target',title:'Respostas corretas',value:hasAttempts?clamp(accuracy,100)+'%':'—',detail:hasAttempts?whole(attempts)+' respostas registradas':'Responda para acompanhar sua precisão'},
  {key:'streak',title:'Sequência atual',value:whole(streak)+' dia(s)',detail:'Dias consecutivos de atividade'},
  {key:'brain',title:'Para revisar',value:String(whole(due)),detail:'Questões disponíveis para praticar'}
 ];
 return '<section class="vb8-rewards" data-vb8-component="rewards" aria-label="Recompensas e conquistas pessoais">'+
  '<header class="vb8-rewards__header"><div class="vb8-section-kicker">'+image('trophy')+' <span>MINHAS CONQUISTAS</span></div><h2>'+esc(label)+'</h2><p>Seus marcos refletem atividades registradas. Sem comparações artificiais com outros alunos.</p></header>'+
  '<div class="vb8-rewards__overview">'+
    '<span class="vb8-rewards__emblem">'+image('trophy')+'</span>'+
    '<div><strong>'+pct+'%</strong><span>da trilha concluída</span></div>'+
    renderProgress({value:pct,max:100,showValue:false,label:'Percentual da trilha concluída',tone:pct===100?'mint':'violet'})+
  '</div>'+
  '<div class="vb8-rewards__grid">'+cells.map(c=>'<article class="vb8-reward-cell" data-vb8-component="reward-stat"><span class="vb8-reward-cell__icon">'+image(c.key)+'</span><div><strong>'+esc(c.value)+'</strong><h3>'+esc(c.title)+'</h3><p>'+esc(c.detail)+'</p></div></article>').join('')+'</div>'+
  '</section>';
}
