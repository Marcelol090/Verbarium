/* Verbarium v2 - original journey UI, derived from actual local activity, not an external leaderboard. */
import {art,assetUrl} from './verbarium-kit/ui.js';
import {staticJourneyNode} from './verbarium-kit/motion-assets.js';
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
 <div class="v2-missions">${missions.map(m=>`<button class="v2-mission ${m.now>=m.goal?"complete":""}" type="button" data-vb-mission-id="${m.id}" data-route="${m.route}" aria-label="${m.title}: ${m.now} de ${m.goal}"><span class="v2-mission-symbol" aria-hidden="true"><img class="vb-native-mission-icon" src="${m.now>=m.goal?'/verbarium-assets/extra-80/primitives/check_mint.png':m.id==='lesson'?'/verbarium-motion/journey/assets/book.png':m.id==='speaking'?'/verbarium-assets/extra-80/speech/mic_idle.png':'/verbarium-assets/extra-80/missions/target_dart.png'}" alt="" aria-hidden="true" loading="lazy" decoding="async"></span><span class="v2-mission-text"><strong>${m.title}</strong><small>${m.subtitle}</small><span class="v2-mission-bar"><i style="width:${100*m.now/m.goal}%"></i></span></span><span class="v2-mission-count">${m.now}/${m.goal}</span></button>`).join("")}</div>
 </section>`;
}

export function scenicSVG(id){
 return `<svg class="v2-landscape" viewBox="0 0 400 540" preserveAspectRatio="none" aria-hidden="true" focusable="false">
 <defs><linearGradient id="sky-${id}" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#fff" stop-opacity=".48"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
 <rect width="400" height="540" fill="url(#sky-${id})"/>
 <path d="M-20 0Q65 56 94 125T35 252Q0 337-25 377Z" fill="#fff" opacity=".20"/>
 <path d="M424 82Q318 90 332 195T433 353Z" fill="#fff" opacity=".22"/>
 <path d="M-3 359Q36 341 82 391T153 551H-10Z" fill="#fff" opacity=".16"/>
 <path class="v2-road-outline" d="M145 -15 C190 34 304 65 274 143 S70 229 106 292 S304 360 269 424 S100 495 157 557" fill="none" stroke="#bd8c55" stroke-width="88" stroke-linecap="round"/>
 <path class="v2-road-inner" d="M145 -15 C190 34 304 65 274 143 S70 229 106 292 S304 360 269 424 S100 495 157 557" fill="none" stroke="#ffe4b1" stroke-width="79" stroke-linecap="round"/>
 <path d="M145 -15 C190 34 304 65 274 143 S70 229 106 292 S304 360 269 424 S100 495 157 557" fill="none" stroke="#fff1cb" stroke-opacity=".75" stroke-width="2" stroke-dasharray="3 24"/>
 <g class="v2-plants" fill="#318856" opacity=".9"><ellipse cx="39" cy="112" rx="26" ry="16"/><ellipse cx="360" cy="171" rx="21" ry="13"/><ellipse cx="34" cy="424" rx="25" ry="14"/><ellipse cx="354" cy="497" rx="27" ry="15"/></g>
 <g fill="#306941" stroke="#1d5838" stroke-width="2"><path d="M60 78l18-32 18 32H83l16 25H57l15-25z"/><path d="M331 69l17-27 17 27h-12l14 25h-38l13-25z"/><path d="M347 282l15-25 15 25h-10l13 24h-36l10-24z"/><path d="M22 295l16-26 15 26H43l12 23H20l10-23z"/><path d="M325 447l17-29 17 29h-12l15 25h-40l14-25z"/></g>
 <g fill="#f9f9e9"><circle cx="21" cy="174" r="4"/><circle cx="30" cy="178" r="3"/><circle cx="379" cy="365" r="4"/><circle cx="371" cy="372" r="3"/><circle cx="43" cy="511" r="3"/></g>
 <g fill="#f8bb75"><circle cx="45" cy="168" r="2"/><circle cx="377" cy="378" r="2"/><circle cx="63" cy="514" r="3"/></g>
 <g fill="#96ad78" opacity=".9"><ellipse cx="325" cy="190" rx="8" ry="3"/><ellipse cx="35" cy="344" rx="6" ry="3"/><ellipse cx="350" cy="537" rx="7" ry="3"/></g>
 </svg>`;
}

export function renderQuestMap({lessons,completed=[],currentId,compact=false,chapterId=null}){
 const visible=chapterId?chapters.filter(c=>c.id===chapterId):compact?[findJourneyChapter(currentId)]:chapters;
 const lessonById=new Map(lessons.map(l=>[l.id,l]));
 return `<div class="v2-chapter-stack ${compact?"is-compact":""}">${visible.map(c=>{
 const group=c.lessonIds.map(id=>lessonById.get(id)).filter(Boolean),done=group.filter(l=>completed.includes(l.id)).length;
 return `<section class="v2-world v2-world--${c.theme}" aria-label="Capítulo ${c.num}: ${c.title}">
 <header class="v2-world-header"><div><span class="v2-world-overline">${c.overline}</span><h2><span class="v2-world-no">${c.num}</span> ${c.title}</h2><p>${c.subtitle}</p></div><button class="v2-world-open" type="button" data-action="open-chapter" data-id="${c.id}" aria-label="Explorar capítulo ${c.title}">Explorar ↗</button></header>
 <div class="v2-world-scene">
 <img class="vb-world-island" src="${assetUrl('decoration/hero_island_illustration.png')}" alt="" aria-hidden="true" loading="lazy">
 ${scenicSVG(c.id)}
 <div class="v2-world-stops">${group.map((l,i)=>{
  const done=completed.includes(l.id),current=l.id===currentId;
  const state=done?"done":current?"current":"ahead";
  return `<div class="v2-stop v2-stop--${i}">
   <button class="v2-stop-btn ${state}" data-vb-node-state="${state}" data-action="open-lesson" data-id="${l.id}" type="button" aria-label="${l.title}, ${done?"concluída":current?"próxima etapa":"disponível"}">
    <span class="v2-stop-icon" aria-hidden="true"><img class="vb-journey-art" src="${staticJourneyNode(done?"node_completed":current?"node_progress":"node_unlocked")}" alt="" aria-hidden="true"></span>
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
 <section class="v2-chapter-hero v2-chapter-hero--${c.theme}"><div><span>${done}/${ls.length} lições completas</span><h2>${c.subtitle}</h2><p>Entenda, aplique e avance no seu ritmo. Todas as atividades permanecem acessíveis.</p><button type="button" class="v2-action-primary" data-action="open-lesson" data-id="${next.id}">${done===ls.length?"Revisitar capítulo":"Continuar capítulo"} →</button></div><img class="vb-chapter-illustration" src="${assetUrl('decoration/hero_island_illustration.png')}" alt="" aria-hidden="true" loading="lazy"></section>
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
 <section class="v2-profile-card"><div class="v2-profile-avatar vb-native-avatar" aria-hidden="true"><img src="/verbarium-motion/rewards/assets/profile_avatar.png" alt="" loading="lazy" decoding="async"></div><div class="v2-profile-ident"><span>ESTUDANTE DE INGLÊS</span><h2>${clean.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}</h2><p>Seu progresso fica salvo somente neste navegador.</p></div><div class="v2-profile-level"><strong>${earned}/${badges.length}</strong><span>conquistas</span></div></section>
 <form id="v2-profile-name-form" class="v2-profile-edit"><label for="v2-nickname">Nome de exibição neste dispositivo</label><div><input id="v2-nickname" name="nickname" maxlength="24" autocomplete="nickname" value="${clean.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}" placeholder="Como prefere ser chamado?"><button type="submit">Salvar</button></div></form>
 <div class="v2-profile-stats"><div><strong>${completed.length}</strong><small>Aulas concluídas</small></div><div><strong>${accuracy}</strong><small>Aproveitamento</small></div><div><strong>${streak}</strong><small>Dias em sequência</small></div><div><strong>${sessions.length}</strong><small>Diálogos finalizados</small></div></div>
 <div class="v2-section-bar"><h2>Suas conquistas</h2><span>${earned} desbloqueadas</span></div>
 <div class="v2-badges">${badges.map((b,i)=>`<div class="v2-badge ${b.earned?"earned":"locked"}"><span aria-hidden="true"><img class="vb-native-badge" src="${b.earned?'/verbarium-motion/rewards/assets/achievement_medal.png':'/verbarium-assets/achievement/badge_locked.png'}" alt="" aria-hidden="true" loading="lazy" decoding="async"></span><strong>${b.label}</strong><small>${b.desc}</small><i>${b.earned?"Conquistado":"Ainda não"}</i></div>`).join("")}</div>
 <div class="v2-profile-links"><button data-route="progress" type="button">Ver painel de progresso <span>↗</span></button><button data-route="review" type="button">Revisar ${due} questões <span>↗</span></button><button data-route="learn" type="button">Voltar à jornada <span>↗</span></button></div>
 <p class="v2-privacy-note">Sem conta ou ranking público. O apelido, as aulas e as conquistas permanecem neste navegador.</p>`;
}
