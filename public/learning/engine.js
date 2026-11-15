import {TOPICS,byId} from './curriculum.js';
export const LEARNING_KEY='verbarium.learning.evidence.v1';
export const normal=x=>String(x??'').normalize('NFKC').toLocaleLowerCase('en-US').replace(/\bdoesn't\b/g,'does not').replace(/\bdon't\b/g,'do not').replace(/[.,!?;:’']/g,'').replace(/\s+/g,' ').trim();
export function validateGraph(topics=TOPICS){
 const ids=new Set(),nodes=new Map(),problems=[];
 for(const t of topics){if(ids.has(t.id))problems.push('duplicated:'+t.id);ids.add(t.id);nodes.set(t.id,t)}
 for(const t of topics)for(const dep of t.requires||[])if(!nodes.has(dep))problems.push('unknown:'+dep+'->'+t.id);
 const visiting=new Set(),done=new Set();
 const dfs=id=>{if(done.has(id))return;if(visiting.has(id)){problems.push('cycle:'+id);return}visiting.add(id);for(const dep of nodes.get(id)?.requires||[])if(nodes.has(dep))dfs(dep);visiting.delete(id);done.add(id)};
 for(const id of ids)dfs(id);
 return problems;
}
export function orderedTopics(topics=TOPICS){const errors=validateGraph(topics);if(errors.length)throw Error(errors.join(', '));const sorted=[],map=new Map(topics.map(t=>[t.id,t])),done=new Set();const visit=t=>{if(done.has(t.id))return;for(const dep of t.requires||[])visit(map.get(dep));done.add(t.id);sorted.push(t)};topics.forEach(visit);return sorted}
export function emptyLedger(){return {version:1,events:[]}}
export function loadLedger(raw){
 try{const x=typeof raw==='string'?JSON.parse(raw):raw;if(!x||x.version!==1||!Array.isArray(x.events))return emptyLedger();const validModes=new Set(['recognition','production','transfer']);return {version:1,events:x.events.filter(e=>e&&byId(e.topicId)?.activities.some(a=>a.id===e.activityId&&a.mode===e.mode)&&validModes.has(e.mode)&&typeof e.correct==='boolean'&&typeof e.first==='boolean'&&typeof e.hinted==='boolean').slice(-2500).map(e=>({topicId:e.topicId,activityId:e.activityId,mode:e.mode,correct:e.correct,first:e.first,hinted:e.hinted,at:typeof e.at==='string'?e.at:''}))}}catch{return emptyLedger()}
}
export function grade(topicId,activityId,answer){const a=byId(topicId)?.activities.find(x=>x.id===activityId);if(!a)throw Error('Unknown activity');return [a.answer,...(a.alternatives||[])].some(v=>normal(v)===normal(answer));}
export function recordAttempt(ledger,{topicId,activityId,answer,first=true,usedHint=false,at=new Date().toISOString()}){
 const t=byId(topicId),a=t?.activities.find(x=>x.id===activityId);if(!a)throw Error('Unknown activity');
 const correct=grade(topicId,activityId,answer);
 const item={topicId,activityId,mode:a.mode,correct,first:!!first,hinted:!!usedHint,at:String(at)};
 const events=Array.isArray(ledger?.events)?ledger.events:[];
 events.push(item);
 if(events.length>2500)events.splice(0,events.length-2500);
 return item;
}
export function evidenceFor(ledger,topicId){
 const events=(ledger?.events||[]).filter(e=>e.topicId===topicId);
 const firstIndependent=events.filter(e=>e.correct&&e.first&&!e.hinted);
 const unique=new Set(firstIndependent.map(e=>e.activityId));
 const kinds=new Set(firstIndependent.map(e=>e.mode));
 const transfer=firstIndependent.some(e=>e.mode==='transfer');
 const hinted=events.filter(e=>e.correct&&e.hinted).length;
 const mistakes=events.filter(e=>!e.correct).length;
 // The evidence badge is deliberately not a CEFR proficiency certificate.
 const status=unique.size>=2&&kinds.has('production')&&transfer?'supported':events.length?'developing':'new';
 return {status,firstIndependent:unique.size,independentTransfer:transfer,hintedCorrect:hinted,mistakes,attempts:events.length,kinds:[...kinds]};
}
export function isReady(ledger,topic,topics=TOPICS){return (topic.requires||[]).every(dep=>topics.some(t=>t.id===dep)&&evidenceFor(ledger,dep).status==='supported');}
export function nextTopic(ledger,topics=TOPICS){return orderedTopics(topics).find(t=>isReady(ledger,t,topics)&&evidenceFor(ledger,t.id).status!=='supported')||null}
export function progressSummary(ledger,topics=TOPICS){const solved=topics.filter(t=>evidenceFor(ledger,t.id).status==='supported');return {supported:solved.length,total:topics.length,independent:topics.reduce((n,t)=>n+evidenceFor(ledger,t.id).firstIndependent,0),hinted:topics.reduce((n,t)=>n+evidenceFor(ledger,t.id).hintedCorrect,0)}}
