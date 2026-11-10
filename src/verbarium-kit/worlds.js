/** Original backgrounds and milestone badges. Learning state is read-only input. */
const WORLD_IDS=Object.freeze({first:'first',time:'time',talk:'talk',mastery:'mastery'});
const LESSON_WORLDS=Object.freeze({
 be:'first',present:'time',questions:'talk',articles:'mastery',
 continuous:'time',past:'time',prepositions:'time',future:'time',
 modals:'talk',perfect:'talk',connectors:'talk',conditional:'talk'
});
const LESSON_CAPTIONS=Object.freeze({
 be:'A floresta das primeiras frases',
 present:'O vale dos hábitos e rotinas',
 questions:'A enseada das perguntas',
 articles:'A academia das palavras',
 continuous:'O vale das ações em movimento',
 past:'A trilha das histórias de ontem',
 prepositions:'Os caminhos de tempo e lugar',
 future:'O horizonte dos próximos planos',
 modals:'O vale das possibilidades',
 perfect:'A jornada das experiências',
 connectors:'A ponte entre as ideias',
 conditional:'O caminho das escolhas'
});
export const RANK_MILESTONES=Object.freeze([
 {need:1,name:'Primeiro Passo'},{need:2,name:'Explorador de Palavras'},
 {need:3,name:'Construtor de Frases'},{need:4,name:'Aprendiz Dedicado'},
 {need:6,name:'Fluência Inicial'},{need:8,name:'Mensageiro'},
 {need:10,name:'Mestre das Estruturas'},{need:12,name:'Guardião do Verbarium'}
]);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
export function chapterWorldImage(chapterId){return '/verbarium-worlds/'+(WORLD_IDS[chapterId]||'first')+'.webp';}
export function renderLessonWorld(lessonId){
 const which=LESSON_WORLDS[lessonId];if(!which)return '';
 const image=chapterWorldImage(which);
 const caption=LESSON_CAPTIONS[lessonId];
 return '<figure class="vb-world-lesson-banner"><img src="'+image+'" alt="" aria-hidden="true" decoding="async" loading="lazy"><figcaption><span>SEU CENÁRIO DE APRENDIZAGEM</span><strong>'+esc(caption)+'</strong></figcaption></figure>';
}
export function renderRankGallery(completedCount=0){
 const done=Math.max(0,Math.floor(Number(completedCount)||0));
 const unlocked=RANK_MILESTONES.filter(r=>done>=r.need).length;
 return '<section class="vb-world-ranks" aria-label="Insígnias por aulas concluídas"><header><div><span class="v2-kicker">INSÍGNIAS DA JORNADA</span><h2>Cada aula conta.</h2><p>Desbloqueie insígnias ao concluir aulas. Nenhum XP fictício.</p></div><span class="vb-world-rank-count">'+unlocked+' de 8</span></header><div class="vb-world-rank-grid">'+
 RANK_MILESTONES.map((r,i)=>{
  const earned=done>=r.need;
  return '<div class="vb-world-rank '+(earned?'is-unlocked':'is-locked')+'" aria-label="Nível '+(i+1)+': '+esc(r.name)+', '+(earned?'desbloqueado':'bloqueado')+'"><img src="/verbarium-worlds/badges/rank-'+(i+1)+'.webp" alt="" aria-hidden="true" loading="lazy" decoding="async"><strong>'+esc(r.name)+'</strong><small>'+(earned?'Conquistado':r.need+' aula'+(r.need>1?'s':'')+' para desbloquear')+'</small></div>';
 }).join('')+'</div></section>';
}
