/** V15: deterministic recommendation, spaced retrieval and motion event contracts.
 * No ML claim: this is an inspectable local policy; learning outcomes require evaluation.
 */
import {getUnits,isUnlocked,isGraded,dayKey,addDays} from './academy-model.js';
export const MOTION=Object.freeze({tap:140,feedback:240,step:200,celebrate:480,parallaxMax:20});
const DAYS=['domingo','segunda','terca','quarta','quinta','sexta','sabado'];
const LABELS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
export function weekActivity(state,today=dayKey()){
 const weekday=new Date(today+'T12:00:00').getDay(),monday=addDays(today,-((weekday+6)%7));
 return Array.from({length:7},(_,i)=>{const date=addDays(monday,i),d=(i+1)%7,done=date<=today&&(Number(state.activity?.[date]?.xp)>0);return {date,day:DAYS[d],label:LABELS[d],done,today:date===today,future:date>today};});
}
export function adaptivePracticeQueue(state,skill,today=dayKey(),limit=10){
 const pool=getUnits(state).filter(u=>isUnlocked(state,u.id)).flatMap(u=>u.tasks.filter(t=>t.skill===skill&&t.type!=='intro').map(t=>{const key=u.id+':'+t.id,r=state.reviews?.[key];const rank=r?.due&&r.due<=today?0:!r?1:2;return {key,rank,due:r?.due||'',errors:Number(r?.errors)||0,last:r?.last||''};}));
 return pool.sort((a,b)=>a.rank-b.rank||a.due.localeCompare(b.due)||b.errors-a.errors||a.last.localeCompare(b.last)||a.key.localeCompare(b.key)).slice(0,Math.max(0,Math.min(12,Number(limit)||0))).map(x=>x.key);
}
export function parallaxOffset(progress,amplitude=MOTION.parallaxMax){return Math.round(Math.max(-1,Math.min(1,Number(progress)||0))*Math.max(0,Math.min(MOTION.parallaxMax,Number(amplitude)||0)));}
export function motionEvent(route,session,result){
 if(route==='session'&&session){const step=[session.startedAt,session.unitId,session.phase,session.index].join(':');return {key:step+(session.feedback?':'+(session.feedback.ok?'correct':'retry'):':question'),kind:session.feedback?(session.feedback.ok?'correct':'retry'):'question'};}
 if(route==='finished'&&result)return {key:'finished:'+String(result.motionId??'unknown'),kind:result.passed&&!result.practice?'celebrate':'finish'};
 return {key:route,kind:'route'};
}
