/** Independent visual kit catalog. Assets are decorative; UI values remain live HTML. */
import {foodArt,FOOD_VISUALS} from './food-quest.js';
const CATEGORIES=Object.freeze({
 all:'Todos',core:'Progressão',fruit:'Frutas',food:'Alimentos',exercise:'Exercícios',reward:'Recompensas',character:'Personagens',navigation:'Navegação',panel:'Painéis'
});
const INVENTORY=Object.freeze({
 core:'node_book node_star_active node_locked treasure_chest star_rating unit_banner lesson_progress_header continue_green',
 fruit:'apple apple_half banana orange strawberry grapes watermelon pear pineapple blueberries',
 food:'milk orange_juice bread cheese egg carrot broccoli rice sandwich cupcake',
 exercise:'chip_idle chip_correct chip_wrong audio_wave answer_slot chip_selected image_choice_apple check_button continue_blue feedback_great',
 reward:'gem_count heart_count streak_count coin_count gold_medal silver_medal chest_closed chest_open blue_ribbon level_up',
 character:'explorer grandfather student_desk student_duo campfire_pet',
 navigation:'home map trophy friends more scroll_down curved_path checkpoint_ring cloud sparkle',
 panel:'mission_banner lesson_result level_stats activity_divider tip_card answer_area full_progress'
});
const ICONS=Object.freeze({
 node_book:'📖',node_star_active:'⭐',node_locked:'🔒',treasure_chest:'🎁',star_rating:'🌟',unit_banner:'📚',
 lesson_progress_header:'📊',continue_green:'▶',gem_count:'💎',heart_count:'💗',streak_count:'🔥',
 coin_count:'🪙',gold_medal:'🏅',silver_medal:'🥈',chest_closed:'🎁',chest_open:'🎁',blue_ribbon:'🎖️',
 level_up:'⬆️',explorer:'📚',grandfather:'👴',student_desk:'✍️',student_duo:'👥',campfire_pet:'🦊',
 home:'🏠',map:'🗺️',trophy:'🏆',friends:'👥',more:'•••',scroll_down:'⬇️',
 curved_path:'〰️',checkpoint_ring:'⭕',cloud:'☁️',sparkle:'✨'
});
export const VISUAL_KIT_ITEMS=Object.freeze(Object.entries(INVENTORY).flatMap(([category,ids])=>ids.split(' ').map(id=>({category,id}))));
let currentCategory='all',highlightId='';
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nice=id=>id.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
export function visualKitSelection(action,value){
 if(action==='visual-filter'&&Object.hasOwn(CATEGORIES,value)){currentCategory=value;highlightId='';return true;}
 if(action==='visual-select'&&VISUAL_KIT_ITEMS.some(x=>x.id===value)){highlightId=value;return true;}
 return false;
}
export function renderVisualKitGallery(){
 const items=VISUAL_KIT_ITEMS.filter(x=>currentCategory==='all'||x.category===currentCategory);
 const selected=VISUAL_KIT_ITEMS.find(x=>x.id===highlightId);
 return '<div class="vb-visual-gallery"><header class="vb-visual-header"><span class="v2-kicker">BIBLIOTECA VISUAL · 2026</span><h1>Peças independentes. <em>Aprendizado conectado.</em></h1><p>70 ilustrações geradas para o Verbarium: cada item pode ser reaproveitado em exercícios, trilhas, cartões, desafios e recompensas.</p><div class="vb-visual-summary"><strong>70</strong><span>arquivos WebP transparentes</span><button class="button bright" data-route="food">Experimentar em uma missão →</button></div></header><div class="vb-visual-filters" role="group" aria-label="Filtrar categorias dos assets">'+Object.entries(CATEGORIES).map(([key,label])=>'<button type="button" class="vb-visual-filter '+(key===currentCategory?'is-active':'')+'" data-action="visual-filter" data-value="'+key+'" aria-pressed="'+(key===currentCategory)+'">'+safe(label)+'</button>').join('')+'</div><p class="vb-visual-count">'+items.length+' ilustrações nesta seleção</p><div class="vb-visual-grid">'+items.map(({category,id})=>'<button type="button" data-action="visual-select" data-value="'+safe(id)+'" class="vb-visual-cell '+(highlightId===id?'is-chosen':'')+'" aria-pressed="'+(highlightId===id)+'" aria-label="Visualizar '+safe(nice(id))+'">'+foodArt(id,FOOD_VISUALS[id]?.emoji||ICONS[id]||'✦')+'<strong>'+safe(nice(id))+'</strong><span>'+safe(CATEGORIES[category])+'</span></button>').join('')+'</div>'+(selected?'<section class="vb-visual-detail" aria-label="Visualização do asset selecionado">'+foodArt(selected.id,FOOD_VISUALS[selected.id]?.emoji||ICONS[selected.id]||'✦')+'<div><span class="v2-kicker">'+safe(CATEGORIES[selected.category])+'</span><h2>'+safe(nice(selected.id))+'</h2><p>Arquivo individual sem dados de progresso incorporados.</p><code>/verbarium-2026-kit/items/'+safe(selected.id)+'.webp</code></div></section>':'')+'</div>';
}
export function hydrateVisualGallery(root){
 root?.querySelectorAll('.vb-visual-gallery img[data-vb-food-image]').forEach(img=>{
  const fn=()=>img.parentElement?.classList.toggle('is-loaded',img.naturalWidth>0);
  if(img.complete)fn();else{img.addEventListener('load',fn,{once:true});img.addEventListener('error',fn,{once:true});}
 });
}
