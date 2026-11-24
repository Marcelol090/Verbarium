import {normal} from '../engine.js';
import {STEPS,REVIEWS,REVIEW_DAYS} from './mission-content.js';
export const KEY='verbarium.cognitive.mission.v1';
const DAY=86400000;
export const initial=()=>({version:1,index:0,usedHint:false,attempts:0,feedback:null,events:[],completedAt:null,dueAt:null,reviewIndex:0,reviewStage:0});
export function hydrate(raw){try{const s=typeof raw==='string'?JSON.parse(raw):raw;if(!s||s.version!==1||!Array.isArray(s.events)||!Number.isInteger(s.index)||s.index<0||s.index>STEPS.length||!Number.isInteger(s.reviewIndex)||s.reviewIndex<0||s.reviewIndex>REVIEWS.length||!Number.isInteger(s.reviewStage)||s.reviewStage<0||s.reviewStage>REVIEW_DAYS.length)return initial();return {...initial(),...s};}catch{return initial();}}
export function current(s,now=Date.now()){
 if(s.index<STEPS.length)return STEPS[s.index];
 if(s.reviewStage===REVIEW_DAYS.length)return null;
 if(s.reviewIndex>=REVIEWS.length)return null;
 if(s.dueAt!==null&&now>=s.dueAt)return REVIEWS[s.reviewIndex];
 return null;
}
export function grade(item,answer){return !!item?.answers?.some(a=>normal(a)===normal(answer));}
export function useHint(s,now=Date.now()){const p=current(s,now);if(!p?.hint||s.feedback?.ok)return false;s.usedHint=true;return true;}
export function submit(s,answer,now=Date.now()){
 const item=current(s,now);if(!item||item.mode==='example'||!String(answer).trim()||s.feedback?.ok)return null;
 const first=s.attempts===0&&!s.events.some(e=>e.id===item.id),ok=grade(item,answer),independent=ok&&first&&!s.usedHint;
 const e={id:item.id,mode:item.mode,ok,first,hinted:s.usedHint,independent,at:now};
 s.events.push(e);s.attempts++;s.feedback={ok,independent,explain:item.explain};return e;
}
export function advance(s,now=Date.now()){
 const p=current(s,now);if(!p)return false;
 if(p.mode!=='example'&&!s.feedback)return false;
 if(p.mode==='delayed'){
  // First, unassisted delayed success advances the stage; a failure waits a day.
  if(s.feedback.independent)s.reviewStage++;
  s.reviewIndex++;
  s.dueAt=s.reviewStage>=REVIEW_DAYS.length||s.reviewIndex>=REVIEWS.length?null:now+(s.feedback.independent?REVIEW_DAYS[s.reviewStage]:1)*DAY;
 }else{
  s.index++;
  if(s.index===STEPS.length){s.completedAt=now;s.dueAt=now+REVIEW_DAYS[0]*DAY;}
 }
 s.attempts=0;s.usedHint=false;s.feedback=null;return true;
}
export function summary(s){
 const events=s.events||[],first=events.filter(e=>e.first),independent=mode=>first.some(e=>e.mode===mode&&e.independent);
 return {recognition:independent('recognition'),production:independent('production'),transfer:independent('transfer'),firstAttempts:first.length,firstCorrect:first.filter(e=>e.ok).length,assisted:events.filter(e=>e.ok&&!e.independent).length,delayed:events.filter(e=>e.mode==='delayed'&&e.independent).length,retentionStages:s.reviewStage,complete:s.index===STEPS.length,exhausted:s.reviewIndex===REVIEWS.length&&s.reviewStage<REVIEW_DAYS.length,dueAt:s.dueAt};
}
