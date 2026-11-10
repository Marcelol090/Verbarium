/** Original Verbarium weekly-streak v4 kit: 7 independent animated sprites. */
export const DAY_IDS=Object.freeze(['segunda','terca','quarta','quinta','sexta','sabado','domingo']);
const SHORT=['SEG','TER','QUA','QUI','SEX','SÁB','DOM'];
const FULL=['segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado','domingo'];
const ROOT='/verbarium-weekly-v4/';
const DURATION=1445;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function localDateKey(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
export function calendarWeek(today=new Date(),activityDates=[]){
 const d=new Date(today.getFullYear(),today.getMonth(),today.getDate(),12);
 d.setDate(d.getDate()-((d.getDay()+6)%7));
 const active=new Set(activityDates.filter(x=>typeof x==='string'));
 const todayKey=localDateKey(today);
 return DAY_IDS.map((id,i)=>{const x=new Date(d);x.setDate(d.getDate()+i);const date=localDateKey(x);
  return {date,id,label:SHORT[i],fullLabel:FULL[i],active:active.has(date),isToday:date===todayKey,isFuture:date>todayKey};});
}
export function imageForDay(id,kind='pending'){
 const day=DAY_IDS.includes(id)?id:DAY_IDS[0];
 return kind==='animated'?ROOT+'animated/webp/'+day+'_complete.webp':ROOT+'static/'+(kind==='completed'?'completed':'pending')+'/'+day+'.png';
}
function dayId(day){if(DAY_IDS.includes(day.id))return day.id;
 if(/^\d{4}-\d{2}-\d{2}$/.test(day.date||'')){const d=new Date(day.date+'T12:00:00');return DAY_IDS[(d.getDay()+6)%7];}
 return DAY_IDS[0];}
export function renderWeekTokens(days,opts={}){
 const visible=(Array.isArray(days)?days:[]).slice(0,7);
 return '<div class="vb4-week-grid '+(opts.variant==='compact'?'is-compact':'is-normal')+'" role="list" aria-label="Atividades de segunda a domingo">'+
 visible.map(d=>{const id=dayId(d),i=DAY_IDS.indexOf(id),active=!!d.active,date=escape(d.date||'');
  return '<div class="vb4-week-day '+(active?'is-complete':'is-pending')+(d.isToday?' is-today':'')+'" role="listitem"'+
  ' aria-label="'+escape(FULL[i]+' ('+(d.date||'')+'): '+(active?'atividade registrada':'sem atividade registrada'))+'"'+
  ' data-vb4-week-date="'+date+'" data-vb4-week-id="'+id+'" data-vb4-week-active="'+(active?'1':'0')+'">'+
  '<img class="vb4-week-art" src="'+imageForDay(id,active?'completed':'pending')+'" alt="" aria-hidden="true" decoding="async" width="256" height="284">'+
  '<span class="vb4-week-fallback" aria-hidden="true">'+(active?'✓':'·')+'<small>'+escape(d.label||SHORT[i])+'</small></span></div>';
 }).join('')+'</div>';
}
let started=false;
const knownDates=new Set();
export function seedWeekActivity(dates=[]){if(started)return;for(const d of dates)if(typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d))knownDates.add(d);started=true;}
/** New activity today triggers once; pre-existing completions remain static on reload. */
export function hydrateWeekTokens(root){
 if(!root||typeof root.querySelectorAll!=='function')return;
 const items=[...root.querySelectorAll('.vb4-week-day[data-vb4-week-id]')];
 if(!items.length)return;
 const today=localDateKey(new Date());
 const reduce=typeof window!=='undefined'&&typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const fresh=new Set(items.filter(el=>el.dataset.vb4WeekActive==='1'&&el.dataset.vb4WeekDate===today&&!knownDates.has(today)).map(el=>el.dataset.vb4WeekDate));
 for(const el of items){
  const img=el.querySelector('.vb4-week-art');if(!img)continue;
  const active=el.dataset.vb4WeekActive==='1',id=el.dataset.vb4WeekId;
  const ending=imageForDay(id,active?'completed':'pending');
  img.addEventListener('error',()=>{if(img.dataset.animating==='1'){img.dataset.animating='0';img.src=ending;}else{img.hidden=true;el.classList.add('is-fallback');}});
  if(!active||reduce||!fresh.has(el.dataset.vb4WeekDate))continue;
  img.dataset.animating='1';el.classList.add('is-completing');img.src=imageForDay(id,'animated');
  window.setTimeout(()=>{if(!img.isConnected)return;img.dataset.animating='0';img.src=ending;el.classList.remove('is-completing');},DURATION);
 }
 for(const el of items)if(el.dataset.vb4WeekActive==='1')knownDates.add(el.dataset.vb4WeekDate);
}
