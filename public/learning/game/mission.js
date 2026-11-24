import {CONCEPT,STEPS,REVIEW_DAYS} from './mission-content.js';
import {KEY,hydrate,current,useHint,submit,advance,summary} from './mission-engine.js';
const root=document.querySelector('#mission'),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state;try{state=hydrate(localStorage.getItem(KEY));}catch{state=hydrate(null);}
let answer='',words=[],animationKey='';
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}}
const asset='/verbarium-visual-kit/assets/mascot/';
const labels={example:'Observe o padrão',recognition:'Identifique a forma',guided:'Monte a frase',production:'Recupere sem pistas',transfer:'Use em outro contexto',delayed:'Recupere após o intervalo'};
function render(focus=false){
 const p=current(state),s=summary(state),pct=Math.round(state.index/STEPS.length*100),fb=state.feedback;
 const progress='<div class="progress" role="progressbar" aria-label="Etapas da missão" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'"><i style="width:'+pct+'%"></i></div>';
 const art=fb?.ok?'/verbarium-assets/mascot/mascot_reward_celebration.png':asset+(p?.mode==='example'?'fox_teacher.webp':'fox_reading.webp');
 const hero='<section class="scene"><div><span class="eyebrow">PIP · MISSÃO DE APRENDIZAGEM</span><h1>'+esc(CONCEPT.name)+'</h1><p>'+esc(CONCEPT.goal)+'</p></div><img src="'+art+'" alt="" width="100" height="100"></section>';
 if(!p){root.innerHTML=progress+hero+'<section class="exercise"><h2>'+ (s.exhausted?'Novos exemplos necessários':state.reviewStage===REVIEW_DAYS.length?'Revisões do piloto concluídas':'Missão concluída por hoje')+'</h2><p>'+ (s.dueAt?'Próxima revisão disponível em '+new Date(s.dueAt).toLocaleString('pt-BR')+'.':'A etapa experimental terminou. Isso não equivale a domínio geral do inglês.')+'</p><div class="stats">'+[['Produção independente',s.production?'Registrada':'Não registrada'],['Transferência imediata',s.transfer?'Registrada':'Não registrada'],['Revisões independentes',s.delayed+' / '+REVIEW_DAYS.length],['Precisão inicial',s.firstAttempts?Math.round(s.firstCorrect/s.firstAttempts*100)+'%':'—']].map(([k,v])=>'<div><b>'+esc(v)+'</b>'+esc(k)+'</div>').join('')+'</div><a href="/academy/">Voltar à jornada</a></section>';return;}
 let control='';
 if(p.mode==='example')control='<div class="examples">'+p.example.map(v=>'<span lang="en">'+esc(v)+'</span>').join('')+'</div><p class="hint">'+esc(p.explain)+'</p>';
 else if(p.choices)control='<div class="choices" role="group" aria-label="Alternativas">'+p.choices.map(v=>'<button class="choice" type="button" data-choice="'+esc(v)+'" aria-pressed="'+(v===answer)+'" '+(fb?.ok?'disabled':'')+'>'+esc(v)+'</button>').join('')+'</div>';
 else if(p.words)control='<div class="slot" aria-label="Frase selecionada">'+words.map((n,i)=>'<button class="word" type="button" data-remove="'+i+'" '+(fb?.ok?'disabled':'')+'>'+esc(p.words[n])+'</button>').join('')+'</div><div class="words">'+p.words.map((w,i)=>'<button class="word" type="button" data-word="'+i+'" '+(words.includes(i)||fb?.ok?'disabled':'')+'>'+esc(w)+'</button>').join('')+'</div>';
 else control='<label for="answer">Sua resposta em inglês</label><input id="answer" lang="en" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(answer)+'" '+(fb?.ok?'disabled':'')+'>';
 const feedback=fb?'<div class="feedback '+(fb.ok?'good':'')+'" role="status"><strong>'+ (fb.ok?(fb.independent?'Correto, sem ajuda!':'Correto após apoio ou tentativa.'): 'Vamos comparar e corrigir.')+'</strong><p>'+esc(fb.explain)+'</p></div>':'';
 const actions='<div class="actions">'+(p.mode==='example'||fb?'<button class="primary" type="button" data-action="next">'+(p.mode==='delayed'?'Concluir revisão':'Continuar')+'</button>':'')+ (p.mode!=='example'&&!fb?.ok&&p.mode!=='delayed'||p.mode==='delayed'&&!fb?'<button class="'+(fb?'secondary':'primary')+'" type="submit" '+(!answer.trim()?'disabled':'')+'>'+ (fb?'Tentar novamente':'Verificar')+'</button>':'')+(p.hint&&!state.usedHint&&!fb?.ok?'<button type="button" class="secondary" data-action="hint">Ver dica</button>':'')+'</div>';
 root.innerHTML=progress+hero+'<form class="exercise"><span class="eyebrow">'+esc(labels[p.mode])+'</span><h2>'+esc(p.prompt)+'</h2>'+control+(state.usedHint&&p.hint?'<p class="hint">'+esc(p.hint)+'</p>':'')+feedback+actions+'</form>';
 const key=p.id+':'+state.attempts;if(animationKey!==key&&!matchMedia('(prefers-reduced-motion: reduce)').matches){root.querySelector(fb?'.feedback':'.exercise')?.animate([{opacity:.7,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:fb?240:200,easing:'ease-out'});}animationKey=key;
 if(focus)root.querySelector('h2')?.setAttribute('tabindex','-1');if(focus)root.querySelector('h2')?.focus({preventScroll:true});
}
root.addEventListener('input',e=>{if(e.target.id==='answer'){answer=e.target.value;const b=root.querySelector('[type=submit]');if(b)b.disabled=!answer.trim();}});
root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const p=current(state);if(!p)return;
 if(b.dataset.choice!==undefined){answer=b.dataset.choice;render();return;}
 if(b.dataset.word!==undefined){const n=Number(b.dataset.word);if(!words.includes(n))words.push(n);answer=words.map(i=>p.words[i]).join(' ');render();return;}
 if(b.dataset.remove!==undefined){words.splice(Number(b.dataset.remove),1);answer=words.map(i=>p.words[i]).join(' ');render();return;}
 if(b.dataset.action==='hint'){useHint(state);save();render();}
 if(b.dataset.action==='next'&&advance(state)){answer='';words=[];save();render(true);}
});
root.addEventListener('submit',e=>{e.preventDefault();if(submit(state,answer)){save();render();}});
window.addEventListener('pageshow',()=>render());render();
