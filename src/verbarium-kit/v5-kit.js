/** Verbarium V5: composed illustrations and controls. Never hard-code learner progress into art. */
const GROUPS=Object.freeze({
 characters:'explorer_wave explorer_point_apple explorer_listening explorer_celebrating explorer_thinking grandfather_talking grandfather_approving student_at_desk student_holding_apple student_drinking_milk student_duo_talking campfire_pet_idle campfire_pet_happy campfire_pet_sad',
 worlds:'market_stall fruit_shop grocery_shelf cafe_counter kitchen_counter picnic_table wood_signpost treasure_pedestal small_tree flower_bush fruit_crate bread_basket milk_crate speech_bubble_blank quest_ribbon_blank stage_platform hanging_flags floor_shadow',
 navigation:'home_icon map_icon trophy_icon friends_icon more_icon path_curve_long path_curve_short path_fork checkpoint_inactive checkpoint_active node_locked node_current node_book_completed scroll_down cloud_puff sparkles next_arrow dotted_path',
 exercises:'image_card_idle image_card_selected image_card_correct image_card_wrong answer_chip_idle answer_chip_selected answer_chip_correct answer_chip_wrong audio_idle audio_listening word_chip_idle word_chip_disabled sentence_slot_empty sentence_slot_filled verify_button continue_button feedback_success feedback_retry',
 rewards:'chest_closed chest_ajar chest_open gold_medal silver_medal blue_ribbon counter_heart counter_gem counter_streak counter_coin star_inactive star_active badge_check confetti sparkle_burst level_up crown rosette',
 panels:'unit_banner lesson_result_panel mission_card stats_panel tip_card answer_area progress_header_full lesson_progress_header cta_green top_stat_pill overline_pill progress_ring progress_track section_tab quest_summary badge_pill'
});
const FALLBACK=Object.freeze({
 explorer_wave:'🧑‍🎓',explorer_point_apple:'🧑‍🎓',explorer_listening:'🧑‍🎓',explorer_celebrating:'🎉',explorer_thinking:'🤔',grandfather_talking:'👴',grandfather_approving:'👴',student_at_desk:'✍️',student_holding_apple:'🍎',student_drinking_milk:'🥛',student_duo_talking:'👥',campfire_pet_idle:'🦊',campfire_pet_happy:'🦊',campfire_pet_sad:'🦊',
 fruit_shop:'🍎',market_stall:'🏪',grocery_shelf:'🥖',cafe_counter:'☕',kitchen_counter:'🍳',picnic_table:'🥪',treasure_pedestal:'🏆',small_tree:'🌳',flower_bush:'🌿',fruit_crate:'🍇',bread_basket:'🥖',milk_crate:'🥛',wood_signpost:'🪧',
 node_locked:'🔒',node_current:'⭐',node_book_completed:'📖',chest_closed:'🎁',chest_ajar:'🎁',chest_open:'🎁',gold_medal:'🏅',silver_medal:'🥈',star_active:'⭐',star_inactive:'☆',counter_heart:'💗',counter_gem:'💎',counter_streak:'🔥',counter_coin:'🪙'
});
const LABELS=Object.freeze({characters:'Personagens',worlds:'Cenários',navigation:'Navegação',exercises:'Exercícios',rewards:'Recompensas',panels:'Componentes'});
export const V5_ASSETS=Object.freeze(Object.entries(GROUPS).flatMap(([category,ids])=>ids.split(' ').map(id=>({category,id,path:`/verbarium-v5/assets/${category}/${id}.webp`}))));
const byId=new Map(V5_ASSETS.map(asset=>[asset.id,asset]));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
export function v5Art(id,css=''){
 const item=byId.get(id);if(!item)return '';
 const fallback=FALLBACK[id]||'✦';
 return `<span class="vb5-art ${esc(css)}" data-vb5-item="${item.id}"><span class="vb5-emoji" aria-hidden="true">${fallback}</span><img src="${item.path}" alt="" loading="lazy" decoding="async" aria-hidden="true"></span>`;
}
export function hydrateV5Art(root){
 root?.querySelectorAll('.vb5-art:not([data-vb5-ready])').forEach(el=>{
  el.dataset.vb5Ready='true';const img=el.querySelector('img');if(!img)return;
  const apply=()=>el.classList.toggle('is-loaded',img.naturalWidth>0);
  if(img.complete)apply();else{img.addEventListener('load',apply,{once:true});img.addEventListener('error',apply,{once:true});}
 });
}
export function renderV5WorldExplorer({compact=false,progress={index:0,total:10,finished:false}}={}){
 const total=Number(progress.total)||10,done=Math.min(total,Math.max(0,Number(progress.index)||0));
 const phases=[{name:'Quitanda',id:'fruit_shop',route:'food',label:'Vocabulário visual'},{name:'Mercado',id:'market_stall',route:'food',label:'Alimentos e áudio'},{name:'Cafeteria',id:'cafe_counter',route:'speak',label:'Diálogos cotidianos'}];
 return `<section class="vb5-world ${compact?'is-compact':''}" aria-label="Exploração do mundo de alimentos"><header><div><span class="v2-kicker">EXPLORE O VERBARIUM · MUNDO 01</span><h2>Uma cidade para aprender.</h2><p>Entre em cada ambiente, descubra palavras e use verbos para conversar.</p></div><span class="vb5-world-count" aria-live="polite">${done}/${total} atividades</span></header><div class="vb5-world-scene">${v5Art('hanging_flags','vb5-flags')}${v5Art('cloud_puff','vb5-cloud')}${v5Art('small_tree','vb5-tree')}${v5Art('flower_bush','vb5-bush')}<div class="vb5-world-buildings">${phases.map((stage,i)=>`<button type="button" class="vb5-building" data-route="${stage.route}" aria-label="Abrir ${esc(stage.name)}: ${esc(stage.label)}">${v5Art(stage.id,'vb5-building-art')}<span><strong>${esc(stage.name)}</strong><small>${esc(stage.label)}</small></span></button>`).join('')}</div>${v5Art('explorer_wave','vb5-explorer')}${v5Art('floor_shadow','vb5-floor')}<div class="vb5-path-items" aria-hidden="true">${v5Art('path_curve_short')}${v5Art(done>0?'node_book_completed':'node_current')}${v5Art(done>=total?'chest_open':'chest_closed')}</div></div><div class="vb5-world-footer"><span>Missão visual: ${done} de ${total} exercícios</span><button class="button bright" data-route="food">${progress.finished?'Revisitar missão':'Explorar alimentos'} →</button></div></section>`;
}
const SCENE=Object.freeze({image:['explorer_point_apple','fruit_shop'],audio:['explorer_listening','market_stall'],match:['grandfather_talking','grocery_shelf'],verb:['student_holding_apple','picnic_table'],arrange:['student_drinking_milk','cafe_counter']});
export function renderV5FoodScene(q,answer){
 const [character,location]=SCENE[q?.type]||SCENE.image;
 const reaction=answer?(answer.ok?'explorer_celebrating':'explorer_thinking'):character;
 return `<div class="vb5-food-scene" aria-label="Cenário ilustrado da atividade">${v5Art(location,'vb5-food-location')}${v5Art(reaction,'vb5-food-character')}${v5Art('floor_shadow','vb5-food-shadow')}${answer?.ok?v5Art('sparkles','vb5-food-sparkle'):''}</div>`;
}
export function renderV5Reward(score=0,total=10){
 const good=Math.max(0,Number(score)||0),count=Math.max(1,Number(total)||10);const stars=good===count?3:good>=count*.7?2:good>0?1:0;
 return `<div class="vb5-reward" aria-label="Recompensa com ${stars} estrelas">${v5Art('confetti','vb5-confetti')}${v5Art('chest_ajar','vb5-chest-middle')}${v5Art('chest_open','vb5-chest-open')}<div class="vb5-stars" aria-label="${stars} de 3 estrelas">${[0,1,2].map(i=>v5Art(i<stars?'star_active':'star_inactive')).join('')}</div><span class="vb5-reward-stats">${good} de ${count} respostas corretas</span></div>`;
}
let filter='all',selected='';
export function handleV5GalleryAction(action,value){
 if(action==='v5-filter'&&(value==='all'||Object.hasOwn(GROUPS,value))){filter=value;selected='';return true;}
 if(action==='v5-select'&&byId.has(value)){selected=value;return true;}
 return false;
}
export function renderV5Gallery(){
 const visible=V5_ASSETS.filter(x=>filter==='all'||x.category===filter),active=byId.get(selected);
 return `<section class="vb5-gallery"><header class="vb5-gallery-head"><span class="v2-kicker">BIBLIOTECA DE COMPONENTES · V5</span><h1>102 peças para aprender e explorar.</h1><p>Personagens, cenários, navegação, estados de exercícios, recompensas e superfícies sem dados embutidos.</p><button class="button bright" data-route="food">Experimentar missão visual →</button></header><div class="vb5-gallery-filters" role="group" aria-label="Categorias do kit v5">${Object.entries({all:'Todos',...LABELS}).map(([id,name])=>`<button class="chip ${filter===id?'active':''}" type="button" aria-pressed="${filter===id}" data-action="v5-filter" data-value="${id}">${name}</button>`).join('')}</div><p class="vb5-gallery-count">${visible.length} de ${V5_ASSETS.length} componentes</p><div class="vb5-gallery-grid">${visible.map(item=>`<button type="button" class="vb5-gallery-cell ${selected===item.id?'active':''}" aria-pressed="${selected===item.id}" data-action="v5-select" data-value="${item.id}">${v5Art(item.id)}<strong>${esc(item.id.replaceAll('_',' '))}</strong></button>`).join('')}</div>${active?`<div class="vb5-gallery-preview" role="status">${v5Art(active.id)}<div><strong>${esc(active.id.replaceAll('_',' '))}</strong><small>${esc(LABELS[active.category])}</small><code>${esc(active.path)}</code></div></div>`:''}</section>`;
}