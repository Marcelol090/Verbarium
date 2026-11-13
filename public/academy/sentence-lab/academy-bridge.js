/** Report sentence-lab attempts to the shared Academy dashboard.
 * Sentence-level spaced reviews remain in the lab's independent storage.
 */
import {STORAGE_KEY as ACADEMY_KEY,loadProgress,recordDailyAnswer,earnXp,dayKey} from '../academy-model.js';
export function applyAcademyPracticeResult(academy,ok,{today=dayKey(),xp=5}={}){
 academy.attempts=(Number(academy.attempts)||0)+1;
 if(ok)academy.correct=(Number(academy.correct)||0)+1;
 recordDailyAnswer(academy,today);
 if(ok)earnXp(academy,xp,today);
 return academy;
}
export function mirrorSentenceAttempt(ok){
 try{
  const current=loadProgress(localStorage.getItem(ACADEMY_KEY));
  applyAcademyPracticeResult(current,ok);
  localStorage.setItem(ACADEMY_KEY,JSON.stringify(current));
  return true;
 }catch{return false}
}
