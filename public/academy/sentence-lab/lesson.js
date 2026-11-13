
/* sentence-lab-asset-fallback: permanent V5/V6 fallback while independent GIF packs are integrated. */
document.addEventListener('error',event=>{
 const img=event.target;
 if(!(img instanceof HTMLImageElement)||img.dataset.fallbackStage==='done')return;
 const src=img.getAttribute('src')||'';
 if(img.dataset.fallbackStage==='first'){img.dataset.fallbackStage='done';img.style.visibility='hidden';return;}
 img.dataset.fallbackStage='first';
 if(src.includes('/characters/')){
  const id=src.split('/').pop().replace('.gif','');
  const who=id.split('_')[0],gesture=id.slice(who.length+1);
  const actor={alex:'explorer',luna:'hijab_student',ben:'glasses_student',emma:'blonde_student',oliver:'grandfather',mia:'hijab_student'}[who]||'explorer';
  const state={speaking:'speaking',listening:'listening',thinking:'thinking',correct:'proud',retry:'thinking',celebrate:'celebrating'}[gesture]||'neutral';
  img.src='/verbarium-v6/assets/characters/'+actor+'_'+state+'.webp';
 }else if(src.includes('/food/')){
  const id=src.split('/').pop().replace('.gif','');
  const item={apple_red:'apple',loaf:'bread'}[id]||id;
  img.src='/verbarium-2026-kit/items/'+item+'.webp';
 }else if(src.includes('/rewards/')){
  img.src='/verbarium-v6/assets/progress/node_treasure.webp';
 }else if(src.includes('/exercises/')){
  img.style.visibility='hidden';img.dataset.fallbackStage='done';
 }else{img.style.visibility='hidden';img.dataset.fallbackStage='done';}
},true);

import {STORAGE_KEY,PHRASES,TARGET_STEPS,MATCH_PAIRS,hydrateState,recordAttempt,gradeSentence,gradePair,normalize,mastery,sentence} from './lesson-core.js';
const $ = sel=>document.querySelector(sel);
const esc = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CHARS=['alex','luna','ben','emma','oliver','mia'];
const CHAR_NAMES={alex:'Alex',luna:'Luna',ben:'Ben',emma:'Emma',oliver:'Oliver',mia:'Mia'};
const STEP_TITLES=['Observar o padrão','Montar com pistas','Conectar significados','Entender pelo ouvido','Criar sem ajuda','Conquista de aprendizagem'];
const TIPS=[
 'Quando você entende quem faz a ação, qual é a ação e sobre o quê ela acontece, montar frases deixa de ser uma adivinhação.',
 'Agora removemos parte do exemplo: você escolhe cada bloco. Com she, he e it, observe a terminação do verbo.',
 'Conectar partes exige reconhecer sentido e gramática ao mesmo tempo, sem decorar apenas a posição.',
 'Escute antes de ler. Recuperar a informação pelo som reforça uma memória diferente da leitura.',
 'Sem banco de palavras: escreva do zero. Recuperar a estrutura sozinho é mais importante que repetir sem pensar.',
 'A aprendizagem continua após a aula: as frases reaparecem para revisão em intervalos crescentes.'
];
let state;try{state=hydrateState(JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'))}catch{state=hydrateState(null)}
let guideIndex=0,selectedWords=[],selectedMatch=null,matched=new Set(),chosenAudio='',typed='',status=null,finishedStep=false,playing=false,wordPosition=-1,speech=null;
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}}
function path(group,key){return `./assets/${group}/${key}.gif`}
function setGuideMood(mood='listening'){
 const who=CHARS[guideIndex];const img=$('#coach-image');
 img.src=path('characters',`${who}_${mood}`);
 img.alt=`${CHAR_NAMES[who]} ${mood==='celebrate'?'comemorando':mood==='speaking'?'falando':mood==='retry'?'incentivando uma nova tentativa':'ajudando a aprender'}`;
 const face=$('#coach-speaking-face');if(face){face.src=path('faces',`${who}_speaking`);$('#actor-stage').classList.toggle('is-speaking',mood==='speaking');}
 $('#coach-mood').textContent={speaking:'Praticando a pronúncia',listening:'Acompanhando sua resposta',thinking:'Pensando na estrutura',correct:'Mandou bem!',retry:'Vamos entender o erro',celebrate:'Você conseguiu!'}[mood]||'Aprendendo';
}
function feedback(text,ok=true){status={text,ok};const box=$('#feedback');box.hidden=false;box.textContent=text;box.className='feedback'+(ok?'':' is-error');setGuideMood(ok?'correct':'retry')}
function clearFeedback(){status=null;$('#feedback').hidden=true;$('#feedback').textContent='';}
function resetStepUi(){selectedWords=[];selectedMatch=null;matched=new Set();chosenAudio='';typed='';finishedStep=false;clearFeedback();}
function currentSpeech(){
 if(state.step===0)return sentence(PHRASES[0]);
 if(state.step===1)return sentence(PHRASES[1]);
 if(state.step===2)return 'I eat an apple. He drinks milk. She eats a banana.';
 if(state.step===3)return sentence(PHRASES[2]);
 if(state.step===4)return sentence(PHRASES[3]);
 return 'You can build sentences in English.';
}
function speak(text=currentSpeech()){
 if(!('speechSynthesis' in window)){ $('#speaking-status').textContent='A voz não está disponível neste navegador.';return;}
 window.speechSynthesis.cancel();playing=true;setGuideMood('speaking');$('#speaking-status').textContent='Escutando uma frase em inglês…';
 const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.87;u.pitch=1.04;
 const voices=window.speechSynthesis.getVoices();const pref=voices.find(v=>v.lang==='en-US'&&v.localService)||voices.find(v=>v.lang?.startsWith('en-'));
 if(pref)u.voice=pref;
 u.onboundary=e=>{
  if(e.name==='word'){
    const before=text.slice(0,e.charIndex).trim();wordPosition=before?before.split(/\s+/).length:0;syncWordHighlight();
  }
 };
 u.onend=u.onerror=()=>{playing=false;wordPosition=-1;syncWordHighlight();setGuideMood('listening');$('#speaking-status').textContent='Você pode ouvir novamente quando quiser.';};
 speech=u;window.speechSynthesis.speak(u);
}
function syncWordHighlight(){document.querySelectorAll('.sentence-example .word').forEach((el,i)=>el.classList.toggle('is-current',playing&&i===wordPosition))}
function cardIntro(){const p=PHRASES[0];return `<div class="lesson-kicker">01 · EXEMPLO GUIADO</div><h2>Como nasce uma frase?</h2><p class="intro-copy">No inglês, comece por <b>quem</b>, depois diga <b>o que faz</b> e termine com <b>o quê</b>.</p><div class="scene-intro"><img src="${path('food',p.image)}" alt="Uma maçã"/><div><strong>Uma ideia simples</strong><p>“${esc(p.pt)}” pode ser dita com três blocos. Repare na ordem.</p></div></div><div class="sentence-example">${sentence(p).split(' ').map((w,i)=>`<span class="word" data-index="${i}">${esc(w)}</span>`).join(' ')}</div><div class="roles"><div class="role subject"><strong>1 · QUEM?</strong><span>I</span></div><div class="role verb"><strong>2 · AÇÃO?</strong><span>eat</span></div><div class="role object"><strong>3 · O QUÊ?</strong><span>an apple</span></div></div><div class="micro-explanation">Memorize o <b>esqueleto</b>, não só a frase: sujeito + verbo + complemento. Você poderá trocar as palavras e formar novas ideias.</div>`;}
const BANK=[{id:'banana',text:'a banana',group:'object'},{id:'eat',text:'eat',group:'verb'},{id:'she',text:'She',group:'subject'},{id:'eats',text:'eats',group:'verb'}];
function cardBuild(){const p=PHRASES[1];return `<div class="lesson-kicker">02 · PRÁTICA COM PISTAS</div><h2>Agora monte a frase.</h2><p class="intro-copy">Como dizer “${esc(p.pt)}”? Toque nos blocos na ordem: quem, ação, complemento.</p><div class="slots">${['Quem?','O que faz?','O quê?'].map((label,i)=>`<button class="slot ${selectedWords[i]?'filled':''}" data-action="remove-word" data-index="${i}" type="button" aria-label="${esc(label)} ${selectedWords[i]?esc(selectedWords[i].text):'vazio'}"><small>${esc(label)}</small><b>${selectedWords[i]?esc(selectedWords[i].text):'• • •'}</b></button>`).join('')}</div><div class="wordbank">${BANK.map(w=>`<button type="button" data-action="pick-word" data-id="${w.id}" ${selectedWords.some(x=>x.id===w.id)?'disabled':''}>${esc(w.text)}</button>`).join('')}</div><div class="micro-explanation">Pista: com <b>she</b>, o verbo geralmente termina com <b>-s</b>. Compare <b>I eat</b> e <b>She eats</b>.</div>`;}
function cardMatch(){const right=[MATCH_PAIRS[2],MATCH_PAIRS[0],MATCH_PAIRS[1]];const cell=(side,p)=>`<button type="button" class="pair-tile ${selectedMatch?.side===side&&selectedMatch?.id===p.id?'selected':''} ${matched.has(p.id)?'matched':''}" data-action="match" data-side="${side}" data-id="${p.id}" ${matched.has(p.id)?'disabled':''} aria-pressed="${selectedMatch?.side===side&&selectedMatch?.id===p.id}">${esc(p[side])}</button>`;return `<div class="lesson-kicker">03 · ASSOCIAÇÃO DE IDEIAS</div><h2>Quais partes se encaixam?</h2><p class="intro-copy">Toque no início da frase e depois na continuação correta. Complete os três pares.</p><div class="pair-layout"><div class="pair-col">${MATCH_PAIRS.map(p=>cell('left',p)).join('')}</div><div class="pair-col">${right.map(p=>cell('right',p)).join('')}</div></div><div class="micro-explanation">Não basta lembrar a tradução: cada combinação precisa fazer sentido gramatical e no contexto.</div>`;}
function cardListen(){const opts=['They drink milk.','He drink milk.','He drinks milk.','He drinks an milk.'];return `<div class="lesson-kicker">04 · COMPREENSÃO AUDITIVA</div><h2>O que você ouviu?</h2><p class="intro-copy">Ouça o personagem e escolha a frase correta. Observe o sujeito e a forma do verbo.</p><div class="scene-intro"><img src="${path('food','milk')}" alt="Leite"/><div><strong>Ouça primeiro</strong><p>Use o botão “Ouvir a frase” à direita. Pode repetir quantas vezes precisar.</p></div></div><div class="choices">${opts.map((s,i)=>`<button type="button" class="choice ${chosenAudio===s?'selected':''}" data-action="choose-audio" data-answer="${esc(s)}">${esc(s)}</button>`).join('')}</div>`;}
function cardWrite(){const p=PHRASES[3];return `<div class="lesson-kicker">05 · CONSTRUÇÃO AUTÔNOMA</div><h2>Agora sem banco de palavras.</h2><p class="intro-copy">Escreva em inglês: <b>“${esc(p.pt)}”</b>. Pense: quem + ação + complemento.</p><img class="scenario-image" src="${path('food',p.image)}" alt="Pão"/><label for="text-answer" style="font-size:12px;font-weight:900;color:#667896">SUA FRASE</label><input id="text-answer" class="text-answer" type="text" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Digite sua frase em inglês…" value="${esc(typed)}"><div class="micro-explanation">O exemplo desapareceu. Você está recuperando a estrutura da memória. Se errar, receberá uma dica sobre o ponto que precisa ajustar.</div>`;}
function cardFinish(){const m=mastery(state);return `<div class="lesson-kicker">06 · RECUPERAÇÃO E CONSOLIDAÇÃO</div><h2>Você formou frases sozinho!</h2><p class="intro-copy">A aula não termina na última resposta. Você já tem uma base para criar outras combinações.</p><div class="milestone"><img src="${path('rewards','chest_open')}" alt="Baú de conquista animado"/><div><strong>Uma nova habilidade</strong><p>Identificar sujeito, ação e complemento. Agora praticar com novos contextos ajuda a consolidar esse padrão.</p></div></div><div class="metric-row"><div class="metric"><b>${m.accuracy}%</b><span>Precisão real</span></div><div class="metric"><b>${m.practices}</b><span>Tentativas</span></div><div class="metric"><b>${state.xp}</b><span>XP conquistado</span></div></div><div class="micro-explanation">${m.independent?'Você acertou uma produção escrita sem alternativas.':'Para desenvolver autonomia, repita a etapa de escrita sem usar as pistas.'} <b>Revisões futuras:</b> os conteúdos reaparecem nos próximos dias, conforme seu desempenho.</div><a class="practice-cta" href="./practice.html">Construir novas frases sozinho →</a><a class="practice-cta" href="./practice.html?mode=review">Revisar frases pendentes</a><button type="button" class="reset" data-action="restart">Revisitar os exercícios desde o início ↻</button>`;}
const cards=[cardIntro,cardBuild,cardMatch,cardListen,cardWrite,cardFinish];
function render(){
 const step=state.step;
 $('#exercise-region').innerHTML=cards[step]();$('#phase-label').textContent=step===5?'CONCLUSÃO':`ETAPA ${step+1} DE 5`;$('#progress-copy').textContent=STEP_TITLES[step];$('#progress-fill').style.width=`${step===5?100:step*20}%`;$('#progress-track').setAttribute('aria-valuenow',String(Math.min(5,step)));
 $('#xp-head').textContent=`${state.xp} XP`;$('#coach-name').textContent=CHAR_NAMES[CHARS[guideIndex]];$('#tip-copy').textContent=TIPS[step];$('#due-pill').textContent=`${mastery(state).due.length} pendentes`;
 const back=$('#back-step'),primary=$('#primary-action');back.disabled=step===0;back.style.opacity=step===0?'.4':'1';primary.innerHTML=step===0?'Começar prática →':step===5?'Voltar à Academy →':finishedStep?'Próxima etapa →':'Verificar resposta ✓';
 primary.disabled=(step===1&&!finishedStep&&selectedWords.length!==3)||(step===2&&!finishedStep&&matched.size!==3)||(step===3&&!finishedStep&&!chosenAudio)||(step===4&&!finishedStep&&!typed.trim());
 setGuideMood(step===5?'celebrate':step===4?'thinking':'listening');
}
function go(step){window.speechSynthesis?.cancel();state.step=Math.max(0,Math.min(5,step));save();resetStepUi();render();if(step===5){state.completed=true;save();}}
function checkAnswer(){
 if(finishedStep){go(state.step+1);return;}
 const step=state.step;let result,phraseId;
 if(step===1){result=gradeSentence(selectedWords.map(x=>x.text),sentence(PHRASES[1]));phraseId='banana';}
 if(step===2){result={ok:matched.size===3,reason:matched.size===3?'Os pares têm sujeito, verbo e complemento coerentes.':'Conecte os três pares corretamente.'};phraseId='pairs';}
 if(step===3){result=gradeSentence(chosenAudio,sentence(PHRASES[2]));phraseId='milk';}
 if(step===4){result=gradeSentence(typed,sentence(PHRASES[3]));phraseId='bread';}
 if(!result)return;
 state=recordAttempt(state,step,phraseId,result.ok);save();feedback(result.reason,result.ok);
 if(result.ok){finishedStep=true;$('#primary-action').innerHTML='Próxima etapa →';$('#primary-action').disabled=false;}
 else if(step===4){$('#text-answer')?.focus();}
 else if(step===1){selectedWords=[];render();feedback(result.reason,false);}
 else if(step===3){chosenAudio='';render();feedback(result.reason,false);}
 else if(step===2){/* pair errors are reported immediately without preventing continuation of correct matches */}
 $('#xp-head').textContent=`${state.xp} XP`;
}
$('#primary-action').addEventListener('click',()=>{
 if(state.step===0){go(1);return;}
 if(state.step===5){location.href='/academy/';return;}
 checkAnswer();
});
$('#back-step').addEventListener('click',()=>{if(state.step>0)go(state.step-1)});
$('#change-guide').addEventListener('click',()=>{guideIndex=(guideIndex+1)%CHARS.length;render();});
$('#speak-btn').addEventListener('click',()=>speak());
$('#exercise-region').addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b)return;
 if(finishedStep)return;
 const action=b.dataset.action;
 if(action==='pick-word'){
  if(selectedWords.length<3){const word=BANK.find(x=>x.id===b.dataset.id);if(word)selectedWords.push(word)}render();
 }else if(action==='remove-word'){
  selectedWords.splice(Number(b.dataset.index),1);render();
 }else if(action==='choose-audio'){
  chosenAudio=b.dataset.answer;render();
 }else if(action==='match'){
  const point={side:b.dataset.side,id:b.dataset.id};if(matched.has(point.id))return;
  if(!selectedMatch){selectedMatch=point;render();return;}
  if(selectedMatch.side===point.side){selectedMatch=point;render();return;}
  if(gradePair(selectedMatch.id,point.id)){matched.add(point.id);selectedMatch=null;render();if(matched.size===3){feedback('Ótimo! Você associou os três inícios às continuações corretas.');}}
  else{state=recordAttempt(state,2,'pairs',false);save();selectedMatch=null;render();feedback('Essas partes não combinam. Observe quem pratica a ação e como o verbo muda.',false)}
 }else if(action==='restart'){
  state.step=0;state.completed=false;save();resetStepUi();render();
 }
});
$('#exercise-region').addEventListener('input',e=>{if(e.target.id==='text-answer'){typed=e.target.value;$('#primary-action').disabled=!typed.trim()&&!finishedStep;}});
$('#exercise-region').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='text-answer'&&typed.trim())checkAnswer()});
window.addEventListener('pagehide',()=>window.speechSynthesis?.cancel());
render();