/** Verbarium Academy · curriculum starter pack.
 * CEFR labels describe content intent, not learner certification.
 * Original examples; none are copied from another application's course.
 */
const intro=(id,prompt,speech,speaker='explorer',scene='fruit_shop')=>({id,type:'intro',skill:'reading',prompt,speech,speaker,scene});
const choice=(id,type,skill,prompt,speech,options,answer,explain,speaker='explorer',extra={})=>({id,type,skill,prompt,speech,options,answer,explain,speaker,...extra});
const arrange=(id,prompt,speech,words,answer,explain,speaker='blonde')=>({id,type:'arrange',skill:'writing',prompt,speech,words,answer,explain,speaker});
const pairs=(id,prompt,speech,values,explain,speaker='grandfather')=>({id,type:'pairs',skill:'vocabulary',prompt,speech,pairs:values,explain,speaker});
const speakingTask=(id,prompt,speech,speaker='hijab')=>({id,type:'speaking',skill:'speaking',prompt,speech,speaker});

export const DEFAULT_UNITS=Object.freeze([
 {id:'market-01',world:'O Mercado das Palavras',level:'A1',section:'Fundamentos',color:'blue',icon:'fruit_shop',title:'Primeiras palavras',subtitle:'Reconheça, escute e compreenda alimentos.',objective:'Identificar alimentos comuns e compreender frases simples.',duration:5,tasks:[
  intro('warmup','Vamos visitar a quitanda!','Hello! Welcome to the market. We are learning English today.','explorer','fruit_shop'),
  choice('apple','visual','vocabulary','Qual imagem representa “apple”?','This is an apple.',['banana','apple','milk','bread'],'apple','Apple significa maçã. Observe a palavra e a imagem.','hijab'),
  choice('milk','listening','listening','Escute e escolha a palavra correspondente.','I drink milk.',['I drink water.','I drink milk.','I buy bread.'],'I drink milk.','Milk é leite. Drink significa beber.','glasses'),
  pairs('food-pairs','Relacione os alimentos aos nomes em inglês.','Apple. Milk. Bread.',[['Maçã','Apple'],['Leite','Milk'],['Pão','Bread']],'Associe cada palavra ao seu significado.','grandfather'),
  choice('eat','cloze','grammar','Complete: She ___ an apple.','She eats an apple.',['eat','eats','eating'],'eats','No Present Simple, he/she/it usa normalmente o verbo com -s.','grandfather'),
  arrange('order-apple','Monte a frase: “Eu como uma maçã”.','I eat an apple.',['apple','I','an','eat'],'I eat an apple','A ordem básica é sujeito + verbo + complemento.','blonde'),
  choice('dialog','dialogue','speaking','A atendente pergunta: “What would you like?”','What would you like?',['An apple, please.','I am ten years old.','It is Monday.'],'An apple, please.','A resposta deve indicar o pedido de modo educado.','hijab'),
  speakingTask('repeat','Pratique o pedido completo.','I would like an apple, please.','explorer')
 ]},
 {id:'market-02',world:'O Mercado das Palavras',level:'A1',section:'Fundamentos',color:'pink',icon:'market_stall',title:'Conversas na cafeteria',subtitle:'Forme pedidos e participe de diálogos.',objective:'Construir um pedido educado e entender respostas curtas.',duration:7,tasks:[
  intro('welcome','A cafeteria abriu!','Good morning! Can I take your order?','blonde','cafe_counter'),
  choice('tea','listening','listening','O que a pessoa quer beber?','I would like orange juice, please.',['Milk','Orange juice','Water'],'Orange juice','Orange juice é suco de laranja.','glasses'),
  choice('polite','cloze','grammar','Complete: I would ___ a sandwich, please.','I would like a sandwich, please.',['likes','like','liked'],'like','Depois de would, use o verbo em sua forma básica.','grandfather'),
  arrange('order-milk','Monte um pedido educado.','Could I have some milk, please?',['milk','Could','please','I','have','some'],'Could I have some milk please','“Could I have...” é uma forma educada de pedir.','hijab'),
  pairs('sentence-halves','Combine as partes de cada frase.','I would like tea. She drinks milk.',[['I would like','some tea.'],['She drinks','cold milk.'],['They eat','fresh bread.']],'Os pronomes e verbos determinam o complemento.','blonde'),
  choice('story','story','reading','No diálogo, a cliente recebe o quê?','Customer: Can I have some bread? Seller: Yes! Here is your bread.',['Bread','A book','A ticket'],'Bread','A cliente pede bread, ou seja, pão.','fox',{scene:'cafe_counter'}),
  speakingTask('ordering','Pratique um pedido completo.','Could I have an apple and some juice, please?','hijab')
 ]},
 {id:'routine-01',world:'Minha Rotina',level:'A1',section:'Rotina',color:'yellow',icon:'kitchen_counter',title:'Hábitos do dia a dia',subtitle:'Presente simples e horários.',objective:'Falar sobre hábitos e diferenciar I de he/she.',duration:6,tasks:[
  intro('welcome','Um novo dia começou.','Every day I wake up, have breakfast, and study English.','explorer','kitchen_counter'),
  choice('breakfast','visual','vocabulary','Qual alimento é uma banana?','I eat a banana for breakfast.',['apple','banana','orange','bread'],'banana','Banana é a mesma palavra em inglês, mas com pronúncia diferente.','blonde'),
  choice('studies','cloze','grammar','Complete: He ___ English every morning.','He studies English every morning.',['study','studies','studying'],'studies','Com he e verbos terminados em consoante + y, trocamos y por ies.','grandfather'),
  arrange('everyday','Monte: “Eu estudo inglês todos os dias”.','I study English every day.',['English','every','I','day','study'],'I study English every day','Every day indica rotina.','glasses'),
  pairs('routines','Associe o verbo à ação.','Eat. Drink. Study.',[['Comer','Eat'],['Beber','Drink'],['Estudar','Study']],'Os verbos de ação descrevem hábitos.','grandfather'),
  choice('question','listening','listening','Qual é a pergunta feita?','Do you work on Mondays?',['Do you work on Mondays?','Where is my bag?','Are you thirsty?'],'Do you work on Mondays?','Do you ...? forma perguntas no Present Simple.','hijab'),
  speakingTask('habit','Fale sobre a sua rotina.','I study English every day.','explorer')
 ]},
 {id:'travel-01',world:'Pelo Mundo',level:'A2',section:'Situações reais',color:'purple',icon:'wood_signpost',title:'Pergunte e encontre',subtitle:'Direções, situações e perguntas.',objective:'Pedir informações e reagir a respostas do cotidiano.',duration:7,tasks:[
  intro('welcome','Vamos perguntar o caminho.','Excuse me, where is the train station?','hijab','market_stall'),
  choice('station','listening','listening','Qual lugar a pessoa procura?','Excuse me, where is the train station?',['The station','The restaurant','The museum'],'The station','Train station significa estação de trem.','glasses'),
  choice('where','cloze','grammar','Complete: ___ is the nearest bus stop?','Where is the nearest bus stop?',['Who','Where','When'],'Where','Where pergunta sobre localização.','grandfather'),
  arrange('ask-way','Monte a pergunta: “Onde fica a estação?”.','Where is the station?',['the','Where','station','is'],'Where is the station','Em perguntas com be, o verbo vem antes do sujeito.','blonde'),
  choice('turn','story','reading','Qual direção a pessoa deve tomar?','Tourist: Where is the museum? Local: Go straight and turn left at the park.',['Turn left','Turn right','Go back'],'Turn left','Turn left significa virar à esquerda.','fox',{scene:'market_stall'}),
  pairs('directions','Relacione as expressões.','Turn left. Turn right. Go straight.',[['Vire à esquerda','Turn left'],['Vire à direita','Turn right'],['Siga reto','Go straight']],'Use as expressões para indicar direção.','grandfather'),
  speakingTask('ask','Treine uma pergunta em voz alta.','Excuse me, could you help me find the station?','hijab')
 ]},
 {id:'opinions-01',world:'Conversas com Propósito',level:'B1',section:'Comunicação',color:'green',icon:'cafe_counter',title:'Explique sua opinião',subtitle:'Preferências, motivos e argumentos.',objective:'Expressar opiniões com exemplos e conectores.',duration:8,tasks:[
  intro('welcome','Vamos conversar com mais detalhes.','I think learning languages is useful because it connects people.','grandfather','cafe_counter'),
  choice('reason','listening','listening','Por que a personagem gosta de estudar inglês?','I enjoy studying English because I want to meet people from different countries.',['To meet people','To buy a car','To sleep longer'],'To meet people','Because introduz o motivo de uma opinião.','blonde'),
  choice('because','cloze','grammar','Complete: I prefer tea ___ it helps me relax.','I prefer tea because it helps me relax.',['although','because','unless'],'because','Because apresenta uma causa ou justificativa.','grandfather'),
  arrange('opinion','Monte uma opinião completa.','I think reading improves my vocabulary.',['my','I','reading','vocabulary','think','improves'],'I think reading improves my vocabulary','I think ... é uma estrutura útil para expressar opinião.','glasses'),
  pairs('connectors','Combine o conector com sua função.','Because. However. For example.',[['Dar um motivo','Because'],['Mostrar contraste','However'],['Dar um exemplo','For example']],'Conectores organizam ideias e tornam as explicações mais claras.','hijab'),
  choice('story','story','reading','Qual é a opinião do aluno?','Teacher: Do you prefer learning alone? Student: I prefer studying with friends because we can help each other.',['He likes group study','He dislikes studying','He prefers no homework'],'He likes group study','O aluno prefere estudar com amigos porque podem se ajudar.','fox',{scene:'cafe_counter'}),
  speakingTask('express','Expresse uma opinião com justificativa.','I enjoy learning English because I can talk to new people.','glasses')
 ]}
]);

export const ACTIVITY_TYPES=Object.freeze(['intro','visual','listening','pairs','cloze','arrange','dialogue','story','speaking']);
export const CHARACTERS=Object.freeze({
 explorer:{name:'Leo',base:'explorer',neutral:'explorer_neutral',talk:'explorer_speaking',good:'explorer_celebrating',wrong:'explorer_thinking',listen:'explorer_listening'},
 grandfather:{name:'Arthur',base:'grandfather',neutral:'grandfather_neutral',talk:'grandfather_explain',good:'grandfather_correct',wrong:'grandfather_wrong',listen:'grandfather_reading'},
 hijab:{name:'Maya',base:'hijab_student',neutral:'hijab_student_neutral',talk:'hijab_student_speaking',good:'hijab_student_celebrating',wrong:'hijab_student_thinking',listen:'hijab_student_listening'},
 blonde:{name:'Lily',base:'blonde_student',neutral:'blonde_student_neutral',talk:'blonde_student_speaking',good:'blonde_student_celebrating',wrong:'blonde_student_thinking',listen:'blonde_student_listening'},
 glasses:{name:'Noah',base:'glasses_student',neutral:'glasses_student_neutral',talk:'glasses_student_speaking',good:'glasses_student_celebrating',wrong:'glasses_student_thinking',listen:'glasses_student_reading'},
 fox:{name:'Pip',base:'fox',neutral:'fox_neutral',talk:'fox_speaking',good:'fox_correct',wrong:'fox_wrong',listen:'fox_listening'}
});

export const foodEmoji=Object.freeze({apple:'🍎',banana:'🍌',milk:'🥛',bread:'🍞',orange:'🍊',strawberry:'🍓',cheese:'🧀',egg:'🥚',grapes:'🍇',watermelon:'🍉',sandwich:'🥪',blueberries:'🫐'});
