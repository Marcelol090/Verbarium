/** Reusable transparent art, real CEFR lesson progress, and contextual character reactions. */
export const V6_CATALOG=Object.freeze({
  "characters": ["explorer_neutral", "explorer_wave", "explorer_joy", "explorer_proud", "explorer_surprised", "explorer_thinking", "explorer_reading", "explorer_writing", "explorer_listening", "explorer_speaking", "explorer_matching", "explorer_celebrating", "grandfather_neutral", "grandfather_wave", "grandfather_approve", "grandfather_explain", "grandfather_reading", "grandfather_idea", "grandfather_thinking", "grandfather_surprised", "grandfather_proud", "grandfather_wrong", "grandfather_correct", "grandfather_celebrating", "hijab_student_neutral", "hijab_student_wave", "hijab_student_excited", "hijab_student_listening", "hijab_student_speaking", "hijab_student_reading", "hijab_student_writing", "hijab_student_thinking", "hijab_student_surprised", "hijab_student_proud", "hijab_student_matching", "hijab_student_celebrating", "blonde_student_neutral", "blonde_student_wave", "blonde_student_clap", "blonde_student_reading", "blonde_student_writing", "blonde_student_listening", "blonde_student_speaking", "blonde_student_thinking", "blonde_student_surprised", "blonde_student_proud", "blonde_student_approve", "blonde_student_celebrating", "glasses_student_neutral", "glasses_student_wave", "glasses_student_joy", "glasses_student_reading", "glasses_student_writing", "glasses_student_laptop", "glasses_student_speaking", "glasses_student_thinking", "glasses_student_surprised", "glasses_student_proud", "glasses_student_approve", "glasses_student_celebrating", "fox_neutral", "fox_joy", "fox_excited", "fox_reading", "fox_writing", "fox_listening", "fox_speaking", "fox_thinking", "fox_surprised", "fox_sad", "fox_sleeping", "fox_celebrating", "fox_laptop", "fox_matching", "fox_correct", "fox_wrong", "fox_magnify", "fox_megaphone", "fox_idea", "fox_graduate", "fox_campfire", "fox_star"],
  "progress": ["node_locked", "node_current", "node_completed", "node_perfect", "node_review", "node_challenge", "node_treasure", "node_crown", "ring_locked", "ring_current", "ring_completed", "ring_perfect", "ring_special", "ring_mastery", "rating_one", "rating_two", "rating_three", "path_straight", "path_arc", "path_wave", "path_u", "path_fork", "path_cross", "lesson_card_blue", "lesson_card_purple", "unit_card_yellow", "unit_card_pink", "gate_checkpoint", "badge_blue", "badge_purple", "streak_steps", "bar_empty", "bar_low", "bar_medium", "bar_high", "bar_full", "burst_level_up", "unit_complete", "mastery_badge"],
  "pairs": ["matching_board", "image_example", "choice_idle", "choice_selected", "choice_correct", "choice_wrong", "pair_idle", "pair_selected", "pair_correct", "pair_wrong", "word_idle", "word_selected", "word_focused", "word_correct", "word_wrong", "handle_idle", "handle_active", "word_drop", "audio_prompt", "picture_prompt", "link_icon", "match_medal", "pair_challenge", "sentence_slots", "sentence_target", "drop_idle", "drop_selected", "drop_correct"],
  "buttons": ["verify", "continue", "start", "review", "retry", "next", "back", "close", "hint", "shuffle", "audio_idle", "audio_active", "mic", "skip", "disabled", "secondary", "correct", "wrong", "tab_active", "tab_idle", "toggle_on", "toggle_off", "star", "heart", "gem", "flame", "pill_blank"],
  "panels": ["lesson_header", "mini_lesson", "unit_challenge", "daily_goal", "lesson_summary", "streak_card", "reward_modal", "mission_tall", "phrase_challenge", "pair_challenge", "progress_tile", "mastery_tile", "listening_panel", "speaking_panel", "chip_info", "chip_hint", "chip_study", "chip_trophy", "medal_empty", "medal_blue", "medal_pink"]
});
const COUNT=Object.values(V6_CATALOG).reduce((n,ids)=>n+ids.length,0);
export const V6_ASSET_COUNT=COUNT;
const GROUP_LABELS={characters:'Expressões',progress:'Fases e níveis',pairs:'Combinar pares',buttons:'Botões',panels:'Componentes'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const all=Object.entries(V6_CATALOG).flatMap(([category,ids])=>ids.map(id=>({category,id,key:category+'/'+id})));
const byKey=new Map(all.map(item=>[item.key,item]));
export function v6Art(key,extra=''){
 const item=byKey.get(key);if(!item)return '';
 const emoji={characters:'🎭',progress:'⭐',pairs:'🧩',buttons:'🔘',panels:'📖'}[item.category];
 return `<span class="vb6-art ${esc(extra)}" data-vb6-key="${esc(key)}"><span class="vb6-emoji" aria-hidden="true">${emoji}</span><img src="/verbarium-v6/assets/${esc(key)}.webp" alt="" loading="lazy" decoding="async" aria-hidden="true"></span>`;
}
export function hydrateV6Art(root){
 root?.querySelectorAll('.vb6-art:not([data-vb6-ready])').forEach(el=>{
  el.dataset.vb6Ready='true';const img=el.querySelector('img');if(!img)return;
  const toggle=()=>el.classList.toggle('is-loaded',img.naturalWidth>0);
  if(img.complete)toggle();else{img.addEventListener('load',toggle,{once:true});img.addEventListener('error',toggle,{once:true});}
 });
}
let filter='all',selected='';
export function handleV6GalleryAction(action,value){
 if(action==='v6-filter'&&(value==='all'||Object.hasOwn(V6_CATALOG,value))){filter=value;selected='';return true;}
 if(action==='v6-select'&&byKey.has(value)){selected=value;return true;}
 return false;
}
export function renderV6Gallery(){
 const visible=all.filter(x=>filter==='all'||x.category===filter),chosen=byKey.get(selected);
 return `<section class="vb6-gallery"><header class="vb6-gallery-head">${v6Art('characters/explorer_celebrating')}<div><span class="v2-kicker">BIBLIOTECA DE COMPONENTES · V6</span><h1>${COUNT} itens independentes.</h1><p>Personagens, reações, progressão, desafios de pares e controles reutilizáveis. As respostas e os valores permanecem em HTML.</p><button type="button" class="button bright" data-route="pairs">Testar desafio de pares →</button></div></header>
 <nav class="vb6-gallery-tabs" aria-label="Categorias dos assets">${Object.entries({all:'Todos',...GROUP_LABELS}).map(([id,label])=>`<button data-action="v6-filter" data-value="${id}" aria-pressed="${id===filter}" class="vb6-gallery-tab ${filter===id?'is-active':''}">${label}</button>`).join('')}</nav>
 <p class="vb6-gallery-count">${visible.length} de ${COUNT} assets</p><div class="vb6-gallery-grid">${visible.map(x=>`<button type="button" class="vb6-gallery-cell ${chosen?.key===x.key?'selected':''}" data-action="v6-select" data-value="${esc(x.key)}" aria-pressed="${chosen?.key===x.key}">${v6Art(x.key)}<span>${esc(x.id.replaceAll('_',' '))}</span></button>`).join('')}</div>
 ${chosen?`<div class="vb6-gallery-selected" role="status">${v6Art(chosen.key)}<div><strong>${esc(chosen.id.replaceAll('_',' '))}</strong><p>${esc(GROUP_LABELS[chosen.category])}</p><code>/verbarium-v6/assets/${esc(chosen.key)}.webp</code></div></div>`:''}</section>`;
}
export function renderV6FoodReaction(q,answer){
 const classFor={image:'hijab_student_thinking',audio:'explorer_listening',match:'grandfather_explain',verb:'glasses_student_reading',arrange:'fox_reading'};
 const correctFor={image:'explorer_celebrating',audio:'hijab_student_celebrating',match:'grandfather_correct',verb:'glasses_student_celebrating',arrange:'fox_correct'};
 const wrongFor={image:'explorer_surprised',audio:'hijab_student_thinking',match:'grandfather_wrong',verb:'glasses_student_thinking',arrange:'fox_wrong'};
 const character=answer?(answer.ok?correctFor[q?.type]:wrongFor[q?.type]):classFor[q?.type];
 return `<div class="vb6-food-actor ${answer?.ok?'is-celebrating':answer?'is-thinking':'is-idle'}" aria-hidden="true">${v6Art('characters/'+(character||'explorer_neutral'))}</div>`;
}
export function renderV6SkillPath({lessons=[],completed=[],foodProgress={index:0,total:10},pairProgress={stage:0,total:4}}={}){
 const done=new Set(completed),levels=['A1','A2','B1'];
 return `<section class="vb6-skillpath" aria-label="Progressão real dos níveis de inglês"><header><div><span class="v2-kicker">SUA EVOLUÇÃO</span><h2>Níveis e habilidades</h2><p>As conquistas acompanham aulas realmente concluídas. Você pode escolher qualquer lição.</p></div>${v6Art('progress/mastery_badge')}</header>
 ${levels.map(level=>{
 const course=lessons.filter(x=>x.level===level),finished=course.filter(x=>done.has(x.id)).length;
 const percent=course.length?Math.round(finished/course.length*100):0;
 return `<section class="vb6-skill-level" aria-label="Nível ${level}"><div class="vb6-level-title"><strong>${level}</strong><span>${finished} de ${course.length} aulas concluídas</span><span>${percent}%</span></div><div class="vb6-level-track" role="progressbar" aria-label="Progresso do nível ${level}" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><i style="width:${percent}%"></i></div><div class="vb6-level-nodes">${course.map(x=>{
 const complete=done.has(x.id);const art=complete?'progress/node_completed':'progress/node_current';
 return `<button type="button" data-action="open-lesson" data-id="${esc(x.id)}" class="vb6-level-node ${complete?'is-complete':'is-available'}" aria-label="${esc(x.title)}, ${complete?'concluída':'disponível'}">${v6Art(art)}<span>${esc(x.title)}</span></button>`;
 }).join('')}</div></section>`;
 }).join('')}
 <footer class="vb6-level-extra"><div>${v6Art('progress/node_treasure')}<span><b>Mercado de palavras</b><small>${Number(foodProgress.index)||0}/${Number(foodProgress.total)||10} atividades</small></span><button class="button outline small" data-route="food">Explorar</button></div><div>${v6Art('progress/node_review')}<span><b>Combinar pares</b><small>${Number(pairProgress.stage)||0}/${Number(pairProgress.total)||4} níveis</small></span><button class="button outline small" data-route="pairs">Praticar</button></div></footer></section>`;
}
export function renderV6PairsTeaser(progress={stage:0,total:4,finished:false}){
 const stage=Math.min(4,Math.max(0,Number(progress.stage)||0));
 return `<section class="vb6-teaser" aria-label="Desafio combinar pares">${v6Art('panels/pair_challenge','vb6-teaser-card')}${v6Art('characters/fox_matching','vb6-teaser-fox')}<div><span class="v2-kicker">NOVA TAREFA INTERATIVA</span><h2>Combine pares, monte frases.</h2><p>Imagens, verbos e palavras se conectam em quatro etapas. Progresso: ${stage} de 4 níveis.</p></div><button type="button" class="button bright" data-route="pairs">${progress.finished?'Revisitar desafios':'Começar desafios'} →</button></section>`;
}
