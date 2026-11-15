import {TOPICS,byId} from './curriculum.js';
import {LEARNING_KEY,loadLedger,recordAttempt,evidenceFor,isReady,nextTopic,progressSummary,grade} from './engine.js';
const $=s=>document.querySelector(s),escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=id=>'/ui-kit/icons/'+id+'.svg';
const labels={new:'Ainda não praticado',developing:'Em desenvolvimento',supported:'Evidência registrada',locked:'Pré-requisito'};
const modes={recognition:'Reconhecer',production:'Construir',transfer:'Usar em outro contexto'};
const ledger=(()=>{try{return loadLedger(localStorage.getItem(LEARNING_KEY))}catch{return loadLedger(null)}})();
let selected=nextTopic(ledger)?.id||TOPICS[0].id;
let index=0,answer='',help=false,attempt=0,solved=false,feedback='',error=false;
const persist=()=>{try{localStorage.setItem(LEARNING_KEY,JSON.stringify(ledger))}catch{}};
function button(text,action,variant='secondary',disabled=false){return '<button type="button" class="vbk-btn vbk-btn--'+variant+'" data-action="'+action+'" '+(disabled?'disabled':'')+'>'+escape(text)+'</button>';}
function render(){
 const summary=progressSummary(ledger);
 $('#learn-counter').innerHTML='<strong>'+summary.supported+' / '+summary.total+'</strong><small>conhecimentos com evidências de uso independente</small>';
 $('#learn-topic-list').innerHTML=TOPICS.map(t=>{const isOpen=isReady(ledger,t),e=evidenceFor(ledger,t.id),status=isOpen?e.status:'locked';return '<button type="button" class="learn-topic" data-topic="'+t.id+'" data-status="'+status+'" aria-current="'+(selected===t.id)+'" '+(isOpen?'':'disabled aria-label="'+escape(t.name)+' bloqueado"')+'><span class="learn-topic-icon"><img src="'+icon(isOpen?t.icon:'close')+'" alt=""></span><span><strong class="learn-topic-name">'+escape(t.name)+'</strong><small class="learn-topic-meta">'+escape(t.level)+' · '+(t.requires.length?'Precisa de '+t.requires.length+' conhecimento(s) anterior(es)':'Ponto de partida')+'</small></span><span class="learn-topic-pill">'+(isOpen?labels[e.status]:'Bloqueado')+'</span></button>'}).join('');
 const t=byId(selected),a=t?.activities[index],e=evidenceFor(ledger,selected);
 if(!t||!a)return;
 const info='<div class="learn-phase">'+escape(t.level)+' · '+escape(modes[a.mode])+'</div><h2>'+escape(t.name)+'</h2><p class="learn-description">'+escape(t.objective)+'</p><div class="learn-evidence"><span>Respostas independentes: '+e.firstIndependent+'</span><span>Com dica: '+e.hintedCorrect+'</span><span>Transferência: '+(e.independentTransfer?'sim':'a praticar')+'</span></div>';
 const activity='<div class="learn-stage"><div class="learn-stage-top"><span>PRÁTICA ATIVA</span><b class="learn-stage-step">'+(index+1)+' / '+t.activities.length+'</b></div><h3>'+escape(a.prompt)+'</h3>'+(a.choices?'<div class="learn-options" role="group" aria-label="Alternativas">'+a.choices.map(v=>'<button type="button" class="learn-option" data-option="'+escape(v)+'" aria-pressed="'+(answer===v)+'" '+(solved?'disabled':'')+'>'+escape(v)+'</button>').join('')+'</div>':'<label for="learn-answer" class="sr-only">Escreva sua frase em inglês</label><input class="learn-input" id="learn-answer" type="text" autocomplete="off" spellcheck="false" placeholder="Escreva sua resposta em inglês" '+(solved?'disabled':'')+' value="'+escape(answer)+'">')+(help?'<div class="learn-hint"><strong>Dica:</strong> '+escape(a.hint)+'</div>':'')+(feedback?'<p class="learn-message" role="status" data-kind="'+(solved?'success':error?'error':'info')+'">'+escape(feedback)+'</p>':'')+'<div class="learn-actions">'+(solved?button(index===t.activities.length-1?'Concluir prática':'Próxima atividade','next','mint'):button('Verificar resposta','check','primary',!answer.trim()))+(!solved?button('Ver dica','hint','secondary',help):'')+'</div></div>';
 const foot='<p class="learn-tip"><img src="'+icon('brain')+'" alt="">O resultado distingue acerto independente, acerto com ajuda e uso em outro contexto. Não avaliamos pronúncia aqui.</p>';
 $('#learn-practice').innerHTML=info+activity+foot;
}
function changeTopic(id){const t=byId(id);if(!t||!isReady(ledger,t))return;selected=id;index=0;answer='';help=false;attempt=0;solved=false;feedback='';error=false;render();}
function verify(){const t=byId(selected),a=t.activities[index];if(!answer.trim()||solved)return;const first=attempt===0;const result=recordAttempt(ledger,{topicId:selected,activityId:a.id,answer,usedHint:help,first});persist();if(result.correct){solved=true;feedback=result.hinted?'Correto com ajuda. Sua resposta foi registrada, mas ainda não conta como independência.':!first?'Correto depois de outra tentativa. Bom trabalho.':'Correto na primeira tentativa, sem dicas. Evidência independente registrada.';error=false;}else{attempt++;feedback='Ainda não está correto. Revise a estrutura e tente novamente.';error=true;}render();}
function next(){const t=byId(selected);if(index<t.activities.length-1){index++;}else{const current=evidenceFor(ledger,selected);const suggestion=nextTopic(ledger);if(current.status==='supported'&&suggestion&&suggestion.id!==selected){selected=suggestion.id;index=0;}else{index=0;} }answer='';help=false;attempt=0;solved=false;feedback='';error=false;render();}
document.addEventListener('click',event=>{const el=event.target.closest('button');if(!el)return;
 if(el.dataset.topic){changeTopic(el.dataset.topic);return}
 if(el.dataset.option!==undefined){answer=el.dataset.option;feedback='';error=false;render();return}
 const act=el.dataset.action;
 if(act==='hint'&&!help){help=true;render();}
 if(act==='check')verify();
 if(act==='next')next();
});
document.addEventListener('input',e=>{if(e.target.id==='learn-answer'){answer=e.target.value;const button=$('[data-action="check"]');if(button)button.disabled=!answer.trim();}});
document.addEventListener('keydown',e=>{if(e.target.id==='learn-answer'&&e.key==='Enter'){e.preventDefault();verify()}});
render();
