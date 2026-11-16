/**
 * Verbarium composable visual primitives, v7.
 * Only the pictograms are bitmap assets; all copy, shells, state and actions are
 * independent HTML. The design-board screenshots are never used as UI textures.
 */
export const ICONS=Object.freeze({
  layers:'/ui-kit/icons/brain.svg',
  play:'/ui-kit/icons/play.svg',
  checklist:'/ui-kit/icons/check.svg',
  book:'/ui-kit/icons/book.svg',
  question:'/ui-kit/icons/target.svg',
  dialog:'/ui-kit/icons/chat.svg',
  lessons:'/ui-kit/icons/book.svg',
  sparkle:'/ui-kit/icons/sparkle.svg',
  arrow:'/ui-kit/icons/next.svg',
  clock:'/ui-kit/icons/clock.svg',
  flame:'/ui-kit/icons/flame.svg'
});
const escapeHtml=(value)=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const getIcon=(key)=>ICONS[key]||ICONS.book;
const pictogram=(key,cls='')=>'<img class="vb7-art '+cls+'" src="'+getIcon(key)+'" alt="" aria-hidden="true" loading="lazy" decoding="async">';
const clamp=(n)=>Math.min(100,Math.max(0,Number.isFinite(Number(n))?Number(n):0));
const escapeAttr=escapeHtml;
const allowedRoutes=new Set(['lab','speak','practice','learn','food','home','progress','profile','review','pairs']);
const safeRoute=x=>allowedRoutes.has(x)?x:'learn';
const safeLessonId=x=>/^[a-z0-9-]{1,45}$/i.test(String(x))?String(x):'be';
export const FEATURES=Object.freeze([
  Object.freeze({key:'lab',icon:'layers',tone:'violet',metric:'7 tempos',title:'Laboratório verbal',description:'Entenda quando usar cada tempo e descubra a lógica dos verbos.',cta:'Explore as formas'}),
  Object.freeze({key:'speak',icon:'play',tone:'orange',metric:'4 cenários',title:'Conversação do dia a dia',description:'Treine no café, em viagens, no trabalho e em apresentações.',cta:'Vamos conversar'}),
  Object.freeze({key:'practice',icon:'checklist',tone:'blue',metric:'Prática',title:'Hora de praticar',description:'Construa frases e receba explicações para cada resposta.',cta:'Testar o inglês'}),
  Object.freeze({key:'learn',icon:'book',tone:'mint',metric:'A1 a B1',title:'Minha trilha de aulas',description:'Aprenda do básico às estruturas para conversar melhor.',cta:'Ver todas as aulas'})
]);
export function renderHeading({kicker='',title='',accent='',subtitle='',level=2}={}){
  const tag=level===1?'h1':'h2';
  const titleHtml=escapeHtml(title)+(accent?' <em>'+escapeHtml(accent)+'</em>':'');
  return '<header class="vb7-heading" data-vb7-component="heading"><span class="vb7-heading__kicker"><span class="vb7-kicker-spark" aria-hidden="true">✦</span> '+escapeHtml(kicker)+'</span><'+tag+'>'+titleHtml+'</'+tag+'>'+(subtitle?'<p>'+escapeHtml(subtitle)+'</p>':'')+'</header>';
}
export function renderPill({icon='',label='',tone='neutral'}={}){
  const safeTone=['neutral','violet','orange','blue','mint'].includes(tone)?tone:'neutral';
  return '<span class="vb7-pill" data-tone="'+safeTone+'" data-vb7-component="pill">'+(icon?pictogram(icon,'vb7-pill__art'):'')+'<span>'+escapeHtml(label)+'</span></span>';
}
export function renderProgress({value=0,max=100,label='Progresso',tone='violet',showValue=true}={}){
  const total=Math.max(1,Number(max)||100),now=Math.min(total,Math.max(0,Number(value)||0));
  const percent=clamp(now/total*100);
  const safeTone=['violet','orange','blue','mint'].includes(tone)?tone:'violet';
  return '<div class="vb7-progress" data-vb7-component="progress" data-tone="'+safeTone+'"><div class="vb7-progress__track" role="progressbar" aria-label="'+escapeAttr(label)+'" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+now+'"><span style="width:'+percent+'%"></span></div>'+(showValue?'<strong>'+Math.round(percent)+'%</strong>':'')+'</div>';
}
export function renderCta({label='',meta='',variant='primary',lessonId=null,route=null}={}){
  const safeVariant=variant==='secondary'?'secondary':'primary';
  const action=lessonId?'data-action="open-lesson" data-id="'+safeLessonId(lessonId)+'"':'data-route="'+safeRoute(route)+'"';
  return '<button type="button" class="vb7-cta vb7-cta--'+safeVariant+'" data-vb7-component="cta" '+action+'><span class="vb7-cta__glyph" aria-hidden="true">'+pictogram(safeVariant==='primary'?'play':'arrow')+'</span><span class="vb7-cta__copy"><strong>'+escapeHtml(label)+'</strong>'+(meta?'<small>'+escapeHtml(meta)+'</small>':'')+'</span></button>';
}
export function renderLessonHero({lessonId='be',title='O verbo to be',description='',level='A1',minutes=6,completed=0,total=1,mascot='',buttonLabel='Continuar aprendendo'}={}){
  const percent=Math.round(clamp((Number(completed)||0)/Math.max(1,Number(total)||1)*100));
  return '<section class="vb7-hero" aria-label="Próxima aula" data-vb7-component="lesson-hero">'+
    '<span class="vb7-hero__badge"><span class="vb7-hero__pulse" aria-hidden="true"></span> CONTINUE DE ONDE PAROU</span>'+
    '<h2 class="vb7-hero__title">Sua próxima aventura:<br><em>'+escapeHtml(title)+'</em></h2>'+
    '<p class="vb7-hero__description">'+escapeHtml(description)+'</p>'+
    '<div class="vb7-hero__mascot" aria-hidden="true">'+mascot+'</div>'+
    '<div class="vb7-hero__progress"><div class="vb7-hero__progress-caption"><span>Sua trilha de aprendizado</span><strong>'+percent+'%</strong></div>'+renderProgress({value:percent,label:'Progresso na trilha de aulas',showValue:false})+'</div>'+
    '<div class="vb7-hero__actions">'+renderCta({label:buttonLabel,meta:escapeHtml(level)+' · cerca de '+Number(minutes)+' min',lessonId})+'</div>'+
    '</section>';
}
export function renderFeatureCard(feature,{compact=false}={}){
  const t=['violet','orange','blue','mint'].includes(feature?.tone)?feature.tone:'violet';
  const route=safeRoute(feature?.key);
  const ico=['layers','play','checklist','book'].includes(feature?.icon)?feature.icon:'book';
  return '<button type="button" class="vb7-feature'+(compact?' vb7-feature--compact':'')+'" data-vb7-component="feature" data-tone="'+t+'" data-route="'+route+'">'+
    '<span class="vb7-feature__top"><span class="vb7-feature__icon">'+pictogram(ico)+'</span><span class="vb7-feature__badge">'+escapeHtml(feature?.metric)+'</span></span>'+
    '<span class="vb7-feature__body"><strong class="vb7-feature__title">'+escapeHtml(feature?.title)+'</strong><small class="vb7-feature__subtitle">'+escapeHtml(feature?.description)+'</small></span>'+
    '<span class="vb7-feature__bottom"><span>'+escapeHtml(feature?.cta)+'</span><span class="vb7-feature__arrow" aria-hidden="true">'+pictogram('arrow')+'</span></span>'+
    '</button>';
}
export function renderFeatureGrid(features=FEATURES){
  return '<section class="vb7-feature-grid" data-vb7-component="feature-grid" aria-label="Explorar atividades">'+features.map(f=>renderFeatureCard(f)).join('')+'</section>';
}
const missionIcons={questions:'question',lesson:'lessons',speaking:'dialog'};
export function renderMissionCard(mission){
  const goal=Math.max(1,Number(mission?.goal)||1),now=Math.min(goal,Math.max(0,Number(mission?.now)||0));
  const done=now>=goal,percent=clamp(now/goal*100),id=String(mission?.id||'questions');
  const icon=missionIcons[id]||'question';
  return '<button type="button" class="vb7-mission-card vb5-mission'+(done?' complete':'')+'" data-vb7-component="mission" data-route="'+safeRoute(mission?.route)+'" data-vb5-mission="'+escapeAttr(id)+'" data-vb5-date="'+escapeAttr(mission?.date)+'" data-vb5-now="'+now+'" data-vb5-goal="'+goal+'" aria-label="'+escapeAttr(mission?.title)+'. '+now+' de '+goal+'. Abrir atividade">'+
   '<span class="vb7-mission-card__icon">'+pictogram(icon)+'</span>'+
   '<span class="vb7-mission-card__content"><span class="vb7-mission-card__top"><strong>'+escapeHtml(mission?.title)+'</strong><span class="vb7-mission-card__counter">'+now+'/'+goal+'</span></span>'+
   '<small>'+escapeHtml(mission?.subtitle)+'</small>'+
   '<span class="vb7-mission-card__track vb5-mission-bar" role="progressbar" aria-label="'+escapeAttr(mission?.title)+'" aria-valuemin="0" aria-valuemax="'+goal+'" aria-valuenow="'+now+'"><i style="width:'+percent+'%"></i></span></span>'+
   (done?'<span class="vb7-mission-card__complete" aria-hidden="true">✓</span>':'')+
   '</button>';
}
export function renderMissions(missions=[]){
 const list=Array.isArray(missions)?missions:[],done=list.filter(m=>Number(m.now)>=Number(m.goal)).length;
 return '<section class="vb7-missions" data-vb7-component="mission-board" aria-label="Missões de hoje">'+
  '<div class="vb7-missions__header">'+renderHeading({kicker:'SEU RITMO',title:'Missões de hoje',subtitle:'Pequenas ações para construir conversas maiores.'})+
  '<span class="vb7-missions__total">'+done+'/'+list.length+' concluídas</span></div>'+
  '<div class="vb7-missions__grid">'+list.map(renderMissionCard).join('')+'</div></section>';
}
export function renderPromo({kicker='',title='',subtitle='',image='',href='/academy/',action='Explorar Academy'}={}){
  const safeHref=['/academy/','/learning/','/onboarding/'].includes(href)?href:'/academy/';
  const src=image&&/^\/(?:verbarium-assets\/|verbarium-v6\/|ui-kit\/)/.test(image)?image:getIcon('book');
  return '<section class="vb7-promo" data-vb7-component="promo" aria-label="'+escapeAttr(title)+'"><div class="vb7-promo__art" aria-hidden="true"><img src="'+escapeAttr(src)+'" alt="" loading="lazy" decoding="async"></div>'+
   '<div class="vb7-promo__content"><span class="vb7-promo__kicker">'+escapeHtml(kicker)+'</span><h2>'+escapeHtml(title)+'</h2><p>'+escapeHtml(subtitle)+'</p></div>'+
   '<a class="vb7-promo__link" href="'+safeHref+'">'+escapeHtml(action)+' <span aria-hidden="true">→</span></a></section>';
}
