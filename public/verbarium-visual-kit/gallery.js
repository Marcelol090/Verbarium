/* Verbarium Visual Kit, generated assets gallery.
   Visual only: routing, saved student data, answers and XP are untouched. */
const ROOT='/verbarium-visual-kit/assets';
const groups=[
 ['mascot','Pip, o mascote',['fox_welcome','fox_waving','fox_reading','fox_teacher']],
 ['rewards','Recompensas e feedback',['reward_streak_flame','reward_chest','reward_xp_gem','reward_medal','dialog_bubble','lesson_book']],
 ['buttons','Botões ilustrados',['button_primary','button_fox','button_ghost','button_round','button_fab','button_segmented','button_play','button_disabled']],
 ['cards','Cartões ilustrados',['card_lesson','card_progress','card_streak','card_reward','card_profile','card_mission']],
 ['grids','Tiles e opções de exercícios',['tile_lesson','tile_image_choice','tile_audio_choice','tile_reward','tile_mission','tile_avatar','tile_exercise','tile_grid_2x2']],
 ['backgrounds','Fundos de seção',['background_onboarding','background_journey','background_dashboard','background_reward','background_study','background_pattern']],
 ['labels','Labels, tags e medalhas',['label_standard','label_lesson','label_notification','label_premium','label_level','label_xp','label_streak','label_success','label_alert','label_ribbon']]
];
const label=id=>id.replace(/_/g,' ').replace(/^./,c=>c.toUpperCase());
export function generatedAsset(id,group){
 const cat=group||groups.find(([, ,items])=>items.includes(id))?.[0];
 return cat?ROOT+'/'+cat+'/'+id+'.webp':null;
}
export function renderGeneratedKitGallery(){
 const filters='<button type="button" class="vbkit-gallery-filter" data-vbkit-filter="all" aria-pressed="true">Todos · 48</button>'+
 groups.map(([cat,desc,ids])=>'<button type="button" class="vbkit-gallery-filter" data-vbkit-filter="'+cat+'" aria-pressed="false">'+desc+' · '+ids.length+'</button>').join('');
 const tiles=groups.map(([cat,title,ids])=>ids.map(id=>
  '<article class="vbkit-gallery-tile" data-vbkit-category="'+cat+'">'+
  '<div class="vbkit-gallery-tile-media"><img src="'+generatedAsset(id,cat)+'" alt="" loading="lazy" decoding="async"></div>'+
  '<strong>'+label(id)+'</strong><small>'+title+'</small></article>').join('')).join('');
 return '<section class="vbkit-gallery" aria-label="Biblioteca de assets gerados do Verbarium">'+
  '<header class="vbkit-gallery-header"><div><span>VISUAL SYSTEM · KIT V1</span><h1>Peças que se encaixam.</h1>'+
  '<p>48 assets reais, transparentes e independentes. As imagens decoram componentes; textos, estados e interações continuam responsivos e acessíveis.</p></div>'+
  '<img src="'+generatedAsset('fox_teacher','mascot')+'" alt="" width="120" height="130" decoding="async"></header>'+
  '<div class="vbkit-gallery-tools" role="group" aria-label="Filtrar assets">'+filters+'</div>'+
  '<div class="vbkit-gallery-grid" id="vbkit-asset-grid">'+tiles+'</div>'+
  '<p class="vbkit-gallery-notice">Os botões, cards e labels ilustrados são referências visuais. As versões interativas utilizam HTML, CSS e elementos separados para evitar estiramento da arte.</p></section>';
}
export function hydrateGeneratedKit(root,route){
 if(!root||route!=='kitv7')return;
 const buttons=[...root.querySelectorAll('[data-vbkit-filter]')];
 const cards=[...root.querySelectorAll('[data-vbkit-category]')];
 buttons.forEach(button=>button.addEventListener('click',()=>{
  const selected=button.dataset.vbkitFilter;
  for(const btn of buttons)btn.setAttribute('aria-pressed',String(btn===button));
  for(const card of cards)card.hidden=selected!=='all'&&card.dataset.vbkitCategory!==selected;
 }));
}
