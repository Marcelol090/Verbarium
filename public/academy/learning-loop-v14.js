/** Original Verbarium learning loop: recommendations are derived from actual progress. */
import {getUnits,isUnlocked,dueReviews,sessionTasks,dayKey} from './academy-model.js';

export function nextLearningAction(state,today=dayKey()){
 const s=state.session;
 if(s&&s.phase!=='done'&&sessionTasks(state,s)[s.index])return {kind:'resume'};
 const units=getUnits(state).filter(u=>u.source!=='teacher'&&isUnlocked(state,u.id));
 const next=units.find(u=>!state.completed[u.id]);
 const due=dueReviews(state,today,10000).filter(x=>isUnlocked(state,x.unit.id)).length;
 if(due>0)return {kind:'review',due,next};
 if(next)return {kind:'lesson',unit:next};
 return {kind:'practice'};
}
