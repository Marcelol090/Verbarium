/* A tiny dependency-free profile bridge shared by onboarding and Academy. */
export const ONBOARDING_KEY='verbarium.onboarding.v1';
export const GOALS=Object.freeze([
 Object.freeze({id:'travel',title:'Viajar',detail:'Pedir informações e explorar novos lugares',icon:'globe',sentence:'I need a ticket',translation:'Eu preciso de uma passagem',words:['I','need','a','ticket']}),
 Object.freeze({id:'work',title:'Trabalho',detail:'Participar de reuniões e conversar com colegas',icon:'briefcase',sentence:'I have a meeting',translation:'Eu tenho uma reunião',words:['I','have','a','meeting']}),
 Object.freeze({id:'conversation',title:'Conversar',detail:'Conhecer pessoas e ganhar confiança',icon:'chat',sentence:'Nice to meet you',translation:'Prazer em conhecer você',words:['Nice','to','meet','you']}),
 Object.freeze({id:'study',title:'Estudos',detail:'Entender a estrutura das frases em inglês',icon:'book',sentence:'I want to learn',translation:'Eu quero aprender',words:['I','want','to','learn']})
]);
const LEVELS=['beginner','basic','intermediate'];
export const DEFAULT_CHOICES=Object.freeze({goal:'travel',level:'beginner',minutes:10});
export const getGoal=id=>GOALS.find(x=>x.id===id)||GOALS[0];
export function normalizeChoices(raw={}){const x=raw&&typeof raw==='object'?raw:{};return {goal:GOALS.some(g=>g.id===x.goal)?x.goal:DEFAULT_CHOICES.goal,level:LEVELS.includes(x.level)?x.level:DEFAULT_CHOICES.level,minutes:[5,10,15].includes(Number(x.minutes))?Number(x.minutes):DEFAULT_CHOICES.minutes};}
export function getShuffledWords(goalId){const a=[...getGoal(goalId).words];return [...a.slice(1),a[0]];}
export function gradeSentence(goalId,words){if(!Array.isArray(words))return false;const clean=s=>String(s||'').replace(/[.,!?]/g,'').toLowerCase().trim().replace(/\s+/g,' ');return clean(words.join(' '))===clean(getGoal(goalId).sentence);}
export function parseProfile(raw){try{const x=typeof raw==='string'?JSON.parse(raw):raw;if(!x||x.version!==1||x.completed!==true)return null;const choices=normalizeChoices(x);return {...choices,version:1,completed:true,completedAt:typeof x.completedAt==='string'?x.completedAt:null};}catch{return null}}
export function makeProfile(choices,completedAt=new Date().toISOString()){return {version:1,...normalizeChoices(choices),completed:true,completedAt};}
export function readProfile(storage=typeof localStorage==='undefined'?null:localStorage){try{return parseProfile(storage?.getItem(ONBOARDING_KEY))}catch{return null}}
export function saveProfile(storage,choices,now){const profile=makeProfile(choices,now);try{storage?.setItem(ONBOARDING_KEY,JSON.stringify(profile));return profile}catch{return null}}
