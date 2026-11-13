/** Original sentence-production curriculum. All examples are authored for Verbarium.
 * These are sentence-level retrieval prompts, not CEFR certification tests.
 */
import {PHRASES,dueReviews,gradeSentence,sentence} from './lesson-core.js';

export const PRODUCTION_PHRASES=Object.freeze([
 {id:'orange-she',subject:'She',verb:'eats',object:'an orange',pt:'Ela come uma laranja.',image:'orange',speaker:'emma',rule:'Com she, eat se torna eats. Use an antes do som vocálico de orange.'},
 {id:'milk-we',subject:'We',verb:'drink',object:'milk',pt:'Nós bebemos leite.',image:'milk',speaker:'ben',rule:'Com we, use drink sem -s. Milk, neste exemplo, não recebe a ou an.'},
 {id:'banana-he',subject:'He',verb:'eats',object:'a banana',pt:'Ele come uma banana.',image:'banana',speaker:'oliver',rule:'Com he, use eats. Banana começa com som consonantal, então usamos a.'},
 {id:'strawberry-i',subject:'I',verb:'eat',object:'a strawberry',pt:'Eu como um morango.',image:'strawberry',speaker:'luna',rule:'Com I, use eat. Strawberry usa a neste contexto.'},
 {id:'apple-you',subject:'You',verb:'eat',object:'an apple',pt:'Você come uma maçã.',image:'apple_red',speaker:'alex',rule:'Com you, use eat sem -s. Apple começa com som vocálico, então usamos an.'},
 {id:'bread-we',subject:'We',verb:'eat',object:'bread',pt:'Nós comemos pão.',image:'loaf',speaker:'mia',rule:'Com we, use eat sem -s. Bread geralmente é incontável e não pede a/an.'},
 {id:'orange-i',subject:'I',verb:'eat',object:'an orange',pt:'Eu como uma laranja.',image:'orange',speaker:'ben',rule:'I eat, e não I eats. Use an orange.'},
 {id:'milk-she',subject:'She',verb:'drinks',object:'milk',pt:'Ela bebe leite.',image:'milk',speaker:'emma',rule:'Com she, o verbo drink ganha -s: drinks.'}
]);
export const ALL_SENTENCES=Object.freeze([...PHRASES,...PRODUCTION_PHRASES]);
const byId=new Map(ALL_SENTENCES.map(p=>[p.id,p]));

export function practiceQueue(reviews,{mode='daily',now=new Date(),limit=5}={}){
 const safeLimit=Math.max(1,Math.min(12,Number(limit)||5));
 const due=dueReviews(reviews,now).filter(id=>byId.has(id));
 if(mode==='review')return due.slice(0,safeLimit).map(id=>byId.get(id));
 const candidates=mode==='free'?[...PRODUCTION_PHRASES.map(p=>p.id),...PHRASES.map(p=>p.id)]:
  [...due,...PRODUCTION_PHRASES.map(p=>p.id),...PHRASES.map(p=>p.id)];
 return [...new Set(candidates)].slice(0,safeLimit).map(id=>byId.get(id));
}
export function evaluateProduction(input,prompt){
 if(!prompt||!byId.has(prompt.id))throw new Error('Frase desconhecida.');
 return gradeSentence(input,sentence(prompt));
}
export function scaffoldHint(prompt,level=1){
 if(!prompt)return '';
 if(level===1)return 'Organize a ideia: primeiro QUEM faz a ação, depois a AÇÃO e, por último, o COMPLEMENTO.';
 if(level===2)return 'O sujeito desta frase é “'+prompt.subject+'”. Comece por ele e pense se o verbo precisa de -s.';
 return prompt.rule;
}
export function accuracyFromResults(results){
 const first=results.filter(x=>x.firstAttempt).length;
 return {firstAttempts:first,firstCorrect:results.filter(x=>x.firstAttempt&&x.ok).length,
  percentage:first?Math.round(100*results.filter(x=>x.firstAttempt&&x.ok).length/first):0};
}
