/** Fox mobile coach. Progressive enhancement around the real Academy state machine.
 * Does not change answers, XP, order, approved audio or persisted progress. */
const root=document.querySelector('#content');
const hints={
 'CONHEÇA O CONTEXTO':'Observe a situação antes de responder. Entender o contexto ajuda a formar frases sozinho.',
 'ESCOLHA A IMAGEM':'Associe a palavra à imagem antes de olhar as alternativas.',
 'ESCUTE E RESPONDA':'Ouça primeiro a frase inteira. Depois identifique as palavras-chave.',
 'COMBINE PARES':'Encontre as relações de significado, não apenas a posição dos cartões.',
 'COMPLETE A FRASE':'Procure o sujeito e o tempo verbal antes de escolher a palavra.',
 'MONTE A FRASE':'Comece pelo sujeito, encontre o verbo e complete a ideia.',
 'HISTÓRIA INTERATIVA':'Acompanhe quem fala e quando a ação acontece.',
 'RESPOSTA NO DIÁLOGO':'Responda levando em conta a intenção da outra pessoa.',
 'FALA GUIADA':'Ouça, repita e compare o ritmo. A transcrição não é uma nota de pronúncia.'
};
function applyFoxCoach(){
 if(!root)return;
 const screen=document.body.dataset.route;
 if(screen==='session'){
  const lesson=root.querySelector('.lesson-wrap');
  if(!lesson||lesson.querySelector('.fox-lesson-guide'))return;
  const key=lesson.querySelector('.exercise-box .eyebrow')?.textContent?.trim()||'';
  const fb=lesson.querySelector('.feedback');
  const pose=fb?(fb.classList.contains('good')?'fox_correct':'fox_thinking'):'fox_neutral';
  const message=fb?'Você praticou um padrão importante. Leia a explicação antes de continuar.':(hints[key]||'Observe o exemplo, tente sozinho e confira a explicação.');
  const guide=document.createElement('aside');guide.className='fox-lesson-guide';
  guide.setAttribute('aria-label','Dica do Pip');
  const art=document.createElement('img');art.src='/verbarium-v6/assets/characters/'+pose+'.webp';art.alt='';art.width=49;art.height=52;art.loading='lazy';
  const wrap=document.createElement('div'),title=document.createElement('strong');title.textContent=fb?'Pip diz':'Dica do Pip';
  const description=document.createElement('p');description.textContent=message;
  wrap.append(title,description);guide.append(art,wrap);
  const after=lesson.querySelector('.lesson-kicker');if(after)after.insertAdjacentElement('afterend',guide);
 }else if(screen==='finished'){
  const finish=root.querySelector('.finish-page');if(!finish||finish.querySelector('.fox-finish-mark'))return;
  const art=document.createElement('img');art.className='fox-finish-mark';art.src='/verbarium-v6/assets/characters/fox_celebrating.webp';art.alt='Pip comemorando a conclusão da aula';art.width=86;art.height=86;art.loading='lazy';
  finish.prepend(art);
 }
}
if(root){new MutationObserver(applyFoxCoach).observe(root,{childList:true,subtree:false});applyFoxCoach()}
