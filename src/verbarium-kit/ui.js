const artBase="/verbarium-assets/";
const artPaths=Object.freeze({
 book:"brand/book_open_isolated.png",
 clipboard:"mission/clipboard_pending.png",
 flame:"streak/flame_standalone.png",
 medal:"achievement/badge_unlocked.png",
 "medal-locked":"achievement/badge_locked.png",
 gift:"reward/gift_large.png",
 chart:"controls/chart_bars_standalone.png",
 check:"controls/check_green_large.png",
 star:"controls/stars_gold_solid.png",
 mascot:"mascot/mascot_explorer_waving.png",
 sparkles:"decoration/sparkles_three.png",
 island:"decoration/hero_island_illustration.png",
 "mascot-reward":"mascot/mascot_reward_celebration.png",
 "clipboard-done":"mission/clipboard_completed.png",
 logo:"brand/app_logo_icon.png"
});
export function assetUrl(path){return /^[-a-z0-9_]+\/[-a-z0-9_.]+\.(png|svg)$/.test(path)?artBase+path:artBase+artPaths.book;}
const clamp=(n)=>Math.max(0,Math.min(100,Number.isFinite(Number(n))?Number(n):0));
const textSafe=(value)=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function art(kind,extra=""){
  const path=artPaths[kind]||artPaths.book;
  return `<img src="${artBase+path}" class="vb-art ${extra}" alt="" loading="lazy" decoding="async" aria-hidden="true">`;
}
export function renderProgressBar(value,key="bar",tone="blue"){
 const p=clamp(value);
 return `<span class="vb-meter vb-meter--${tone}" role="progressbar" aria-label="Progresso" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><i data-vb-fill="${p}" data-vb-key="${textSafe(key)}" data-vb-type="bar"></i></span>`;
}
export function renderProgressRing(value,label="Seu progresso",key="ring",small=false){
 const p=clamp(value);
 return `<div class="vb-progress-ring ${small?"vb-progress-ring--small":""}" role="progressbar" aria-label="${textSafe(label)}" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100">
 <svg class="vb-ring-svg" viewBox="0 0 220 220" aria-hidden="true"><image href="${artBase}svg_components/ring_track.svg" width="220" height="220"/><circle class="vb-ring-arc" cx="110" cy="110" r="72" data-vb-fill="${p}" data-vb-key="${textSafe(key)}" data-vb-type="ring"/></svg>
 <div class="vb-ring-center">${art("book")}<strong>${Math.round(p)}%</strong></div></div>`;
}
export function renderStreakWeek(days,streak=0){
 const cells=(Array.isArray(days)?days:[]).slice(0,7);
 const active=cells.filter(d=>d.active).length;
 return `<section class="vb-streak" aria-label="Sequência e atividade da semana">
 <div class="vb-streak-heading">${art("flame")}<div><small>Minha sequência</small><strong>${Math.max(0,Math.floor(Number(streak)||0))} ${streak===1?"dia":"dias"}</strong></div><span class="vb-streak-weekcount">${active}/7 na semana</span></div>
 <div class="vb-streak-days">${cells.map(d=>`<div class="vb-streak-day ${d.active?"is-complete":""}" title="${textSafe(d.date||"")}" aria-label="${d.active?"Estudo registrado em":"Sem atividade em"} ${textSafe(d.date||"")}"><span aria-hidden="true"></span><small>${textSafe(d.label||"")}</small></div>`).join("")}</div></section>`;
}
export function renderProgressOverview({completion=0,completed=0,total=0,accuracy=0,attempts=0,streak=0,days=[]}={}){
 return `<section class="vb-overview" aria-label="Seu progresso de aprendizagem">
 <div class="vb-overview-card vb-overview-card--ring"><div class="vb-overview-copy"><span class="vb-overline">PROGRESSO DAS LIÇÕES</span><h2>Um passo por vez.</h2><p>${completed} de ${total} aulas concluídas</p></div>${renderProgressRing(completion,"Aulas concluídas","overall-completion")}</div>
 <div class="vb-overview-card vb-overview-card--score"><span class="vb-overline">${art("chart")} APROVEITAMENTO</span><strong class="vb-overview-number">${attempts?Math.round(accuracy)+"%":"—"}</strong><p>${attempts?`${attempts} respostas registradas`:"Responda uma questão para começar"}</p>${renderProgressBar(attempts?accuracy:0,"overall-accuracy")}</div>
 ${renderStreakWeek(days,streak)}</section>`;
}
export function renderLessonMeter(current,total){
 const p=total?Math.round(100*current/total):0;
 return `<div class="vb-lesson-meter" aria-label="Progresso desta aula">${renderProgressRing(p,"Progresso da aula","lesson-current",true)}<div><strong>${Math.min(current,total)} de ${total} questões</strong><small>Progresso da aula</small></div></div>`;
}
export function renderHeroMascot(){
 return `<div class="vb-mascot-hero">${art("mascot","vb-mascot-hero-image")}${art("sparkles","vb-mascot-spark vb-mascot-spark--one")}${art("sparkles","vb-mascot-spark vb-mascot-spark--two")}</div>`;
}
export function renderJourneyFlow(){
 const steps=[
  ["Meta","Conclua uma missão"],
  ["Lição","Avance na trilha"],
  ["Sequência","Pratique em dias diferentes"],
  ["Conquista","Desbloqueie um marco real"],
  ["Resultado","Veja seus números"],
  ["Celebração","Receba um feedback"]
 ];
 return `<section class="vb-sequence-flow" aria-label="Como seu progresso se transforma em conquistas">
 <header><span class="vb-overline">SEU CICLO DE APRENDIZADO</span><h2>Da missão à conquista</h2><p>As etapas abaixo explicam o sistema; resultados e desbloqueios só aparecem depois de atividades registradas.</p></header>
 <ol>${steps.map(([title,description],i)=>`<li><img src="${artBase}flow/step_marker_${i+1}.png" alt="" aria-hidden="true" loading="lazy"><strong>${title}</strong><small>${description}</small></li>`).join("")}</ol></section>`;
}

const displayedValues=new Map();
export function hydrateVerbariumUI(root){
 if(!root)return;
 const reduce=typeof window!=="undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 root.querySelectorAll("[data-vb-fill]").forEach(el=>{
  const value=clamp(el.dataset.vbFill),key=el.dataset.vbKey||"default",type=el.dataset.vbType;
  const previous=displayedValues.has(key)?displayedValues.get(key):0;
  displayedValues.set(key,value);
  const set=(p)=>{if(type==="ring"){el.style.strokeDashoffset=String(452.389*(1-clamp(p)/100));}else{el.style.width=clamp(p)+"%";}};
  set(reduce?value:previous);
  if(!reduce && previous!==value)requestAnimationFrame(()=>set(value));
 });
}
export function showVerbariumToast({title="Conquista desbloqueada",description=""}={}){
 if(typeof document==="undefined")return;
 const old=document.getElementById("vb-reward-toast");
 if(old)old.remove();
 const toast=document.createElement("aside");
 toast.id="vb-reward-toast";toast.className="vb-reward-toast";toast.setAttribute("role","status");toast.setAttribute("aria-live","polite");
 const picture=document.createElement("img");picture.src=window.matchMedia("(prefers-reduced-motion: reduce)").matches?artBase+artPaths.gift:"/verbarium-motion/rewards/animated/star_coin.webp";picture.alt="";picture.setAttribute("aria-hidden","true");
 const text=document.createElement("div");const heading=document.createElement("strong");heading.textContent=title;
 const desc=document.createElement("span");desc.textContent=description;text.append(heading,desc);
 const button=document.createElement("button");button.type="button";button.textContent="×";button.setAttribute("aria-label","Fechar aviso");button.addEventListener("click",()=>toast.remove());
 const mascot=document.createElement('img');mascot.src=artBase+artPaths['mascot-reward'];mascot.alt='';mascot.className='vb-reward-mascot';mascot.setAttribute('aria-hidden','true');
 toast.append(picture,text,mascot,button);document.body.append(toast);
 const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 if(!reduce){requestAnimationFrame(()=>toast.classList.add("is-visible"))}else toast.classList.add("is-visible");
 window.setTimeout(()=>{if(toast.isConnected)toast.remove()},4600);
}
