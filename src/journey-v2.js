/* Verbarium v2 - original journey UI, derived from actual local activity, not an external leaderboard. */
import {art,assetUrl} from './verbarium-kit/ui.js';
import {staticJourneyNode} from './verbarium-kit/motion-assets.js';
import {lessonNodeArt} from './verbarium-kit/lesson-kit.js';
import {phaseRing,phaseState,savedLessonPercent} from './verbarium-kit/phase-progress.js';
import {chapterWorldImage,renderRankGallery} from './verbarium-kit/worlds.js';
export const chapters=[
  {
    "id": "first",
    "num": "01",
    "title": "Primeiras palavras",
    "subtitle": "Você já consegue se apresentar.",
    "overline": "A floresta das primeiras frases",
    "level": "A1",
    "theme": "meadow",
    "emoji": "✦",
    "lessonIds": [
      "be",
      "present",
      "questions",
      "articles"
    ],
    "context": "Comece a falar de você, conhecer alguém e fazer perguntas simples."
  },
  {
    "id": "time",
    "num": "02",
    "title": "Tempo em movimento",
    "subtitle": "Coloque suas histórias no tempo.",
    "overline": "O vale dos dias e planos",
    "level": "A1–A2",
    "theme": "sunrise",
    "emoji": "✳",
    "lessonIds": [
      "continuous",
      "past",
      "prepositions",
      "future"
    ],
    "context": "Conte o que está acontecendo, relembre ontem e planeje amanhã."
  },
  {
    "id": "talk",
    "num": "03",
    "title": "Conversas que fluem",
    "subtitle": "Da frase à troca de ideias.",
    "overline": "A enseada das conversas",
    "level": "A2–B1",
    "theme": "lagoon",
    "emoji": "❖",
    "lessonIds": [
      "modals",
      "perfect",
      "connectors",
      "conditional"
    ],
    "context": "Peça ajuda, compartilhe experiências, dê opiniões e converse com naturalidade."
  }
];
export function findJourneyChapter(lessonId) {return chapters.find(c=>c.lessonIds.includes(lessonId)) || chapters[0];}

export function missionState({activity=[],completedAt={},sessions=[],today}) {
 const answersToday=activity.filter(x=>x.date===today).length;
 const lessonsToday=Object.values(completedAt||{}).filter(x=>x===today).length;
 const sessionsToday=(sessions||[]).filter(x=>x.date===today).length;
 return [
  {id:"questions",title:"Responda 3 questões",subtitle:"Treine a memória, não só a leitura.",now:Math.min(3,answersToday),goal:3,route:"practice",icon:"✎"},
  {id:"lesson",title:"Conclua 1 aula",subtitle:"Aprenda uma regra e coloque em prática.",now:Math.min(1,lessonsToday),goal:1,route:"learn",icon:"◇"},
  {id:"speaking",title:"Finalize 1 diálogo",subtitle:"Fale em situações do cotidiano.",now:Math.min(1,sessionsToday),goal:1,route:"speak",icon:"◉"}
 ];
}

export function renderMissionBoard(missions) {
 const completed=missions.filter(m=>m.now>=m.goal).length;
 return `<section class="v2-mission-board" aria-label="Missões de hoje">
 <div class="v2-board-heading"><div><span class="v2-kicker">✦ SEU RITMO</span><h2>Missões de hoje</h2><p>Pequenas ações para construir conversas maiores.</p></div><span class="v2-mission-total">${completed}/${missions.length} concluídas</span></div>
 <div class="v2-missions">${missions.map(m=>`<button class="v2-mission ${m.now>=m.goal?"complete":""}" type="button" data-vb-mission-id="${m.id}" data-route="${m.route}" aria-label="${m.title}: ${m.now} de ${m.goal}"><span class="v2-mission-symbol" aria-hidden="true"><img class="vb-native-mission-icon" src="/verbarium-v3/assets/${m.now>=m.goal?'missions/mission_completed':m.id==='lesson'?'journey/book_standalone':m.id==='speaking'?'speaking/mic_idle':'missions/target_dart'}.png" alt="" aria-hidden="true" loading="lazy" decoding="async"></span><span class="v2-mission-text"><strong>${m.title}</strong><small>${m.subtitle}</small><span class="v2-mission-bar"><i style="width:${100*m.now/m.goal}%"></i></span></span><span class="v2-mission-count">${m.now}/${m.goal}</span></button>`).join("")}</div>
 </section>`;
}

export function scenicSVG(id){
 // The winding path remains vector-sharp, but generic polygon trees/flat
 // ellipses were removed: foreground decoration comes from the original 3D kit.
 return `<svg class="v2-landscape vb3-road" viewBox="0 0 400 540" preserveAspectRatio="none" aria-hidden="true" focusable="false">
 <path d="M145 -15 C190 34 304 65 274 143 S70 229 106 292 S304 360 269 424 S100 495 157 557" fill="none" stroke="#bb8d57" stroke-width="89" stroke-linecap="round"/>
 <path d="M145 -15 C190 34 304 65 274 143 S70 229 106 292 S304 360 269 424 S100 495 157 557" fill="none" stroke="#ffe5b7" stroke-width="80" stroke-linecap="round"/>
 <path d="M145 -15 C190 34 304 65 274 143 S70 229 106 292 S304 360 269 424 S100 495 157 557" fill="none" stroke="#fff2d6" stroke-opacity=".65" stroke-width="2" stroke-dasharray="3 25"/>
 </svg>`;
}

export function renderQuestMap({lessons,completed=[],currentId,lessonSessions={},compact=false,chapterId=null}){
 const visible=chapterId?chapters.filter(c=>c.id===chapterId):compact?[findJourneyChapter(currentId)]:chapters;
 const lessonById=new Map(lessons.map(l=>[l.id,l]));
 return `<div class="v2-chapter-stack ${compact?"is-compact":""}">${visible.map(c=>{
 const group=c.lessonIds.map(id=>lessonById.get(id)).filter(Boolean),done=group.filter(l=>completed.includes(l.id)).length;
 return `<section class="v2-world v2-world--${c.theme}" aria-label="Capítulo ${c.num}: ${c.title}">
 <header class="v2-world-header"><div><span class="v2-world-overline">${c.overline}</span><h2><span class="v2-world-no">${c.num}</span> ${c.title}</h2><p>${c.subtitle}</p></div><button class="v2-world-open" type="button" data-action="open-chapter" data-id="${c.id}" aria-label="Explorar capítulo ${c.title}">Explorar ↗</button></header>
 <div class="v2-world-scene vb-world-with-bg" style="--vb-world-image:url('${chapterWorldImage(c.id)}')">
 <div class="vb3-map-decor" aria-hidden="true">
  <img class="vb3-map-plant vb3-map-plant--1" src="/verbarium-v3/assets/environment/bush.png" alt="" loading="lazy">
  <img class="vb3-map-plant vb3-map-plant--2" src="/verbarium-v3/assets/environment/grass.png" alt="" loading="lazy">
  <img class="vb3-map-plant vb3-map-plant--3" src="/verbarium-v3/assets/environment/bush.png" alt="" loading="lazy">
  <img class="vb3-map-plant vb3-map-plant--4" src="/verbarium-v3/assets/environment/grass.png" alt="" loading="lazy">
  <img class="vb3-map-cloud vb3-map-cloud--1" src="/verbarium-v3/assets/environment/cloud_large.png" alt="" loading="lazy">
  <img class="vb3-map-cloud vb3-map-cloud--2" src="/verbarium-v3/assets/environment/cloud_small.png" alt="" loading="lazy">
  <img class="vb3-map-bridge" src="/verbarium-v3/assets/environment/bridge.png" alt="" loading="lazy">
 </div>
 ${scenicSVG(c.id)}
 <div class="v2-world-stops">${group.map((l,i)=>{
  const done=completed.includes(l.id),current=l.id===currentId;
  const state=done?"done":current?"current":"ahead";
  const percent=done?100:savedLessonPercent(l.id,lessonSessions,l.qs?.length||0);
  const phase=phaseState({completed:done,isCurrent:current,percent});
  // Use a clean 3D node and layer the true progress ring on top.
  // Baked-in sample ring percentages would not reflect the student's activity.
  return `<div class="v2-stop v2-stop--${i}">
   <button class="v2-stop-btn ${state}" data-vb-node-state="${state}" data-vb3-state="${phase}" data-vb-phase="${phase}" data-vb-phase-percent="${percent}" data-action="open-lesson" data-id="${l.id}" type="button" aria-label="${l.title}, ${done?"concluída":percent?percent+"% concluída":current?"próxima etapa":"disponível"}">
    <span class="v2-stop-icon" aria-hidden="true">${lessonNodeArt(l.id,done?"completed":"unlocked")}</span>${phaseRing(percent)}
    ${current?'<span class="v2-you-are-here">Você está aqui</span>':""}
   </button>
   <div class="v2-stop-info"><strong>${l.title}</strong><span>${l.level} · ${done?"Concluída":current?"Próxima atividade":"Disponível"}</span></div>
  </div>`;}).join("")}</div>
 <div class="v2-scene-decoration v2-scene-decoration--one" aria-hidden="true">✿</div>
 <div class="v2-scene-decoration v2-scene-decoration--two" aria-hidden="true">✦</div>
 </div>
 <footer class="v2-world-footer"><span>${done} de ${group.length} lições concluídas</span><div class="v2-world-meter"><i style="width:${100*done/(group.length||1)}%"></i></div><span>${Math.round(100*done/(group.length||1))}%</span></footer>
 </section>`;
 }).join("")}</div>`;
}

export function renderChapterDetail({id,lessons,completed=[],currentId}){
 const c=chapters.find(x=>x.id===id)||chapters[0];
 const ls=c.lessonIds.map(id=>lessons.find(l=>l.id===id)).filter(Boolean);
 const next=ls.find(l=>!completed.includes(l.id))||ls[0];
 const done=ls.filter(l=>completed.includes(l.id)).length;
 return `<div class="v2-page-heading"><button type="button" data-route="learn" class="v2-back">← Toda a jornada</button><span class="v2-kicker">CAPÍTULO ${c.num} · ${c.level}</span><h1>${c.title}<span class="v2-orange-dot">.</span></h1><p>${c.context}</p></div>
 <section class="v2-chapter-hero v2-chapter-hero--${c.theme}"><div><span>${done}/${ls.length} lições completas</span><h2>${c.subtitle}</h2><p>Entenda, aplique e avance no seu ritmo. Todas as atividades permanecem acessíveis.</p><button type="button" class="v2-action-primary" data-action="open-lesson" data-id="${next.id}">${done===ls.length?"Revisitar capítulo":"Continuar capítulo"} →</button></div><img class="vb-world-hero-img" src="${chapterWorldImage(c.id)}" alt="" aria-hidden="true" loading="lazy"></section>
 ${renderQuestMap({lessons,completed,currentId,chapterId:c.id})}
 <div class="v2-section-bar"><h2>Aulas do capítulo</h2><span>${ls.length} etapas</span></div>
 <div class="v2-chapter-lessons">${ls.map((l,i)=>`<button type="button" class="v2-chapter-lesson" data-action="open-lesson" data-id="${l.id}"><span class="v2-chapter-lesson-number">${String(i+1).padStart(2,"0")}</span><span class="v2-chapter-lesson-copy"><strong>${l.title}</strong><small>${l.subtitle}</small></span><span class="v2-chapter-lesson-state">${completed.includes(l.id)?"✓ Concluída":l.id===currentId?"Iniciar":"Abrir"}</span></button>`).join("")}</div>`;
}

export function deriveAchievements({completed=[],correct=0,streak=0,sessions=[],reviews={}}){
 return [
 {icon:"✦",label:"Primeiro passo",desc:"Conclua sua primeira aula",earned:completed.length>=1},
 {icon:"◈",label:"Caderno cheio",desc:"Conclua 4 aulas",earned:completed.length>=4},
 {icon:"✳",label:"Boa memória",desc:"Acerte 12 questões",earned:correct>=12},
 {icon:"☼",label:"Foco em sequência",desc:"Pratique em 3 dias seguidos",earned:streak>=3},
 {icon:"◉",label:"Primeiro diálogo",desc:"Finalize uma conversa guiada",earned:sessions.length>=1},
 {icon:"❖",label:"Voltar e melhorar",desc:"Acerte uma revisão",earned:Object.values(reviews).some(r=>(r?.level||0)>=1)}
 ];
}

export function renderProfile({nickname="Explorador",completed=[],correct=0,attempts=0,streak=0,sessions=[],reviews={},due=0}){
 const clean=String(nickname).trim().slice(0,24) || "Explorador";
 const badges=deriveAchievements({completed,correct,streak,sessions,reviews});
 const earned=badges.filter(b=>b.earned).length;
 const accuracy=attempts?Math.round(100*correct/attempts)+"%":"—";
 return `<div class="v2-page-heading"><span class="v2-kicker">ESPAÇO PESSOAL</span><h1>Seu jeito de <em>aprender.</em></h1><p>Uma coleção de conquistas reais, sem competir com ninguém.</p></div>
 <section class="v2-profile-card"><div class="v2-profile-avatar vb-native-avatar" aria-hidden="true"><img src="/verbarium-v3/assets/profile/avatar_girl.png" alt="" loading="lazy" decoding="async"></div><div class="v2-profile-ident"><span>ESTUDANTE DE INGLÊS</span><h2>${clean.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}</h2><p>Seu progresso fica salvo somente neste navegador.</p></div><div class="v2-profile-level"><strong>${earned}/${badges.length}</strong><span>conquistas</span></div></section>
 <form id="v2-profile-name-form" class="v2-profile-edit"><label for="v2-nickname">Nome de exibição neste dispositivo</label><div><input id="v2-nickname" name="nickname" maxlength="24" autocomplete="nickname" value="${clean.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}" placeholder="Como prefere ser chamado?"><button type="submit">Salvar</button></div></form>
 <div class="v2-profile-stats"><div><strong>${completed.length}</strong><small>Aulas concluídas</small></div><div><strong>${accuracy}</strong><small>Aproveitamento</small></div><div><strong>${streak}</strong><small>Dias em sequência</small></div><div><strong>${sessions.length}</strong><small>Diálogos finalizados</small></div></div>
 <div class="v2-section-bar"><h2>Suas conquistas</h2><span>${earned} desbloqueadas</span></div>
 <div class="v2-badges">${badges.map((b,i)=>`<div class="v2-badge ${b.earned?"earned":"locked"}"><span aria-hidden="true"><img class="vb-native-badge" src="${b.earned?'/verbarium-v3/assets/rewards/achievement_medal.png':'/verbarium-assets/achievement/badge_locked.png'}" alt="" aria-hidden="true" loading="lazy" decoding="async"></span><strong>${b.label}</strong><small>${b.desc}</small><i>${b.earned?"Conquistado":"Ainda não"}</i></div>`).join("")}</div>
 ${renderRankGallery(completed.length)}
 <div class="v2-profile-links"><button data-route="progress" type="button">Ver painel de progresso <span>↗</span></button><button data-route="review" type="button">Revisar ${due} questões <span>↗</span></button><button data-route="learn" type="button">Voltar à jornada <span>↗</span></button></div>
 <p class="v2-privacy-note">Sem conta ou ranking público. O apelido, as aulas e as conquistas permanecem neste navegador.</p>`;
}
