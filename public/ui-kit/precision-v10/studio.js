const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const announce={
 primary:'Ação principal: começar a próxima aula. Em produção, abre a atividade real.',
 secondary:'Ação secundária: revisar respostas e aprender com os erros.',
 ghost:'Ação de apoio: mostrar a lista de lições sem competir com o objetivo principal.'
};
$$('[data-try]').forEach(button=>button.addEventListener('click',()=>{
 $('#button-feedback').textContent=announce[button.dataset.try]||'Ação selecionada.';
}));
let selected=null,checked=false;
const choices=$$('.quiz-choice'),verify=$('#check-answer'),feedback=$('#quiz-feedback');
function select(value){
 if(checked)return;
 selected=value;
 choices.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.answer===value)));
 verify.disabled=false;
 feedback.textContent='Resposta selecionada. Verifique para entender por quê.';
 feedback.removeAttribute('data-result');
}
choices.forEach(button=>button.addEventListener('click',()=>select(button.dataset.answer)));
verify.addEventListener('click',()=>{
 if(!selected||checked)return;
 checked=true;
 const correct=selected==='is';
 choices.forEach(button=>{
  const value=button.dataset.answer;
  button.disabled=true;
  button.dataset.result=value==='is'?'correct':value===selected?'wrong':'idle';
  button.querySelector('b').textContent=value==='is'?'✓':value===selected?'×':'';
 });
 feedback.textContent=correct?'Correto! Com “she”, usamos “is”.':'Quase! Com “she”, a forma correta do verbo to be é “is”.';
 feedback.dataset.result=correct?'correct':'wrong';
 verify.disabled=true;
});
$('#reset-quiz').addEventListener('click',()=>{
 selected=null;checked=false;verify.disabled=true;
 choices.forEach(button=>{
  button.disabled=false;
  button.removeAttribute('data-result');
  button.setAttribute('aria-pressed','false');
  button.querySelector('b').textContent='';
 });
 feedback.textContent='Escolha uma resposta.';
 feedback.removeAttribute('data-result');
});
