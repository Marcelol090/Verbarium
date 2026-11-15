/* Verbarium original curriculum sample. No third-party teaching data is embedded. */
export const TOPICS=Object.freeze([
 {id:'pronouns',name:'Quem realiza a ação',level:'A1',requires:[],helpful:[],objective:'Identificar o sujeito e escolher o pronome correto.',icon:'brain',activities:[
  {id:'identify',mode:'recognition',prompt:'Qual pronome substitui Maria nesta frase: “Maria works here”?',choices:['He','She','They'],answer:'She',hint:'Maria é uma pessoa no singular. Escolha o pronome correspondente.'},
  {id:'build',mode:'production',prompt:'Escreva em inglês: “Ela mora aqui.”',answer:'She lives here',hint:'Comece com She, depois use lives e termine com here.'},
  {id:'transfer',mode:'transfer',prompt:'Agora outra pessoa: escreva “Ele trabalha aqui.” em inglês.',answer:'He works here',hint:'Troque o sujeito para He e mantenha o verbo no singular.'}
 ]},
 {id:'be',name:'Ser e estar com to be',level:'A1',requires:['pronouns'],helpful:[],objective:'Produzir frases simples com am, is e are.',icon:'book',activities:[
  {id:'identify',mode:'recognition',prompt:'Complete: “My friends ___ ready.”',choices:['is','are','am'],answer:'are',hint:'My friends corresponde a they.'},
  {id:'build',mode:'production',prompt:'Escreva em inglês: “Eu estou pronto.”',answer:'I am ready',hint:'Com I usamos am.'},
  {id:'transfer',mode:'transfer',prompt:'Em uma apresentação, escreva “Nós estamos felizes.”',answer:'We are happy',hint:'Com we usamos are.'}
 ]},
 {id:'be-question',name:'Perguntas com to be',level:'A1',requires:['be'],helpful:['pronouns'],objective:'Transformar afirmações em perguntas sem memorizar frases inteiras.',icon:'chat',activities:[
  {id:'identify',mode:'recognition',prompt:'Qual pergunta está correta?',choices:['You are ready?','Are you ready?','Do you are ready?'],answer:'Are you ready?',hint:'Em perguntas com to be, o verbo vem antes do sujeito.'},
  {id:'build',mode:'production',prompt:'Escreva: “Você está bem?”',answer:'Are you okay',alternatives:['Are you OK'],hint:'Coloque Are antes de you.'},
  {id:'transfer',mode:'transfer',prompt:'Em um café, pergunte: “Está aberto?”',answer:'Is it open',hint:'Use Is + it + open.'}
 ]},
 {id:'present',name:'Rotinas no presente',level:'A1',requires:['pronouns'],helpful:['be'],objective:'Falar sobre hábitos usando o presente simples.',icon:'clock',activities:[
  {id:'identify',mode:'recognition',prompt:'Complete: “She ___ English every day.”',choices:['study','studies','studying'],answer:'studies',hint:'Com she, o verbo study muda para studies.'},
  {id:'build',mode:'production',prompt:'Escreva: “Eu estudo à noite.”',answer:'I study at night',hint:'Comece com I study e acrescente at night.'},
  {id:'transfer',mode:'transfer',prompt:'Seu amigo tem uma rotina: “Ele caminha de manhã.”',answer:'He walks in the morning',hint:'Use He walks e termine com in the morning.'}
 ]},
 {id:'present-negative',name:'Negar hábitos',level:'A1',requires:['present'],helpful:[],objective:'Usar do not e does not em frases negativas.',icon:'close',activities:[
  {id:'identify',mode:'recognition',prompt:'Complete: “She ___ drink coffee.”',choices:['do not','does not','is not'],answer:'does not',hint:'Com she usamos does not antes do verbo na forma base.'},
  {id:'build',mode:'production',prompt:'Escreva: “Eu não trabalho aos domingos.”',answer:'I do not work on Sundays',alternatives:["I don't work on Sundays"],hint:'Use I do not + work.'},
  {id:'transfer',mode:'transfer',prompt:'Diga que seu amigo não dirige: “Ele não dirige.”',answer:'He does not drive',alternatives:["He doesn't drive"],hint:'Depois de does not, use drive sem s.'}
 ]},
 {id:'present-question',name:'Perguntas sobre rotinas',level:'A1',requires:['present'],helpful:['be-question'],objective:'Perguntar sobre hábitos usando do e does.',icon:'target',activities:[
  {id:'identify',mode:'recognition',prompt:'Complete: “___ she work here?”',choices:['Does','Do','Is'],answer:'Does',hint:'Com she usamos Does no início.'},
  {id:'build',mode:'production',prompt:'Pergunte: “Você fala inglês?”',answer:'Do you speak English',hint:'Comece com Do you, depois speak English.'},
  {id:'transfer',mode:'transfer',prompt:'Pergunte a um colega: “Ele mora perto?”',answer:'Does he live nearby',alternatives:['Does he live near here'],hint:'Use Does he live. Não acrescente s em live.'}
 ]},
 {id:'requests',name:'Pedir ajuda com can',level:'A1',requires:['be-question'],helpful:['present-question'],objective:'Formar pedidos e perguntas simples em situações reais.',icon:'volume',activities:[
  {id:'identify',mode:'recognition',prompt:'Qual frase é um pedido de ajuda?',choices:['Can you help me?','You can me help?','Help can you me?'],answer:'Can you help me?',hint:'Can vem antes de you.'},
  {id:'build',mode:'production',prompt:'Em uma viagem, pergunte: “Você pode me ajudar?”',answer:'Can you help me',hint:'Can + you + help + me.'},
  {id:'transfer',mode:'transfer',prompt:'No hotel, pergunte: “Posso entrar?”',answer:'Can I come in',hint:'Troque you por I e use come in.'}
 ]},
 {id:'past',name:'Contar o que aconteceu',level:'A2',requires:['present'],helpful:['present-negative'],objective:'Contar ações concluídas usando o passado simples.',icon:'clock',activities:[
  {id:'identify',mode:'recognition',prompt:'Complete: “Yesterday I ___ my friend.”',choices:['visit','visited','visiting'],answer:'visited',hint:'Yesterday indica uma ação passada. Visit é regular.'},
  {id:'build',mode:'production',prompt:'Escreva: “Eu visitei minha avó ontem.”',answer:'I visited my grandmother yesterday',alternatives:['I visited my grandma yesterday'],hint:'Use visited para passado e yesterday no final.'},
  {id:'transfer',mode:'transfer',prompt:'Conte sobre o último fim de semana: “Nós jogamos futebol.”',answer:'We played soccer',alternatives:['We played football'],hint:'Play é regular: played.'}
 ]}
]);
export const byId=id=>TOPICS.find(t=>t.id===id)||null;
