// Original pilot. All prompts authored for Verbarium; not a CEFR assessment.
export const CONCEPT={id:'present',name:'Rotinas no presente',goal:'Diferenciar I/you/we/they e he/she/it no presente simples.'};
export const STEPS=Object.freeze([
 {id:'model',mode:'example',prompt:'Pip conhece duas pessoas no mercado.',example:['I drink milk.','She drinks milk.'],explain:'Com I, usamos drink. Com she, acrescentamos -s: drinks.'},
 {id:'recognize',mode:'recognition',prompt:'Complete: She ___ coffee.',choices:['drink','drinks','drinking'],answers:['drinks'],hint:'She é terceira pessoa do singular.',explain:'Com she, drink ganha -s.'},
 {id:'contrast',mode:'recognition',prompt:'Complete: They ___ tea.',choices:['drinks','drinking','drink'],answers:['drink'],hint:'They não é he, she ou it.',explain:'Com they, use o verbo na forma base.'},
 {id:'build',mode:'guided',prompt:'Monte: Ela lê livros.',words:['books','reads','She'],answers:['She reads books'],hint:'Sujeito + verbo + complemento.',explain:'She reads books. Reads recebe -s.'},
 {id:'produce',mode:'production',prompt:'Escreva em inglês: Eu trabalho aqui.',answers:['I work here'],hint:'Comece com I. O verbo é work.',explain:'I work here. Com I, não acrescente -s.'},
 {id:'transfer',mode:'transfer',prompt:'Em uma conversa sobre um amigo, diga: Ele joga futebol.',answers:['He plays soccer','He plays football'],hint:'Comece com He. Pense na forma de play.',explain:'He plays soccer. A regra de terceira pessoa se aplica a um verbo novo.'}
]);
export const REVIEWS=Object.freeze([
 {id:'r1',mode:'delayed',prompt:'Ela abre a porta.',answers:['She opens the door'],explain:'She opens the door. Com she, open ganha -s.'},
 {id:'r2',mode:'delayed',prompt:'Nós visitamos amigos.',answers:['We visit friends','We visit our friends'],explain:'We visit friends. Com we, use visit.'},
 {id:'r3',mode:'delayed',prompt:'Ele cozinha arroz.',answers:['He cooks rice'],explain:'He cooks rice. Cook ganha -s com he.'},
 {id:'r4',mode:'delayed',prompt:'Eles gostam de música.',answers:['They like music'],explain:'They like music. Com they, use like.'},
 {id:'r5',mode:'delayed',prompt:'Ela ensina inglês.',answers:['She teaches English'],explain:'Teach termina em -ch: com she, use teaches.'},
 {id:'r6',mode:'delayed',prompt:'Eu moro perto daqui.',answers:['I live near here','I live nearby'],explain:'I live nearby. Com I, use live.'}
]);
export const REVIEW_DAYS=Object.freeze([1,3,7]);
