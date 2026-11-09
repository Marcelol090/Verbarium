/* Inspect every original Verbarium asset without rasterizing functional UI. */
const ASSETS_BASE='/verbarium-assets/';
const LABELS={all:'Todos',mascot:'Mascotes',brand:'Marca',decoration:'Cenários',icons:'Ícones',controls:'Controles',mission:'Missões',lesson:'Lições',streak:'Sequência',achievement:'Conquistas',score:'Pontuação',reward:'Recompensas',flow:'Fluxos',panels:'Painéis',svg_components:'SVGs dinâmicos',journey_nodes:'Nós da jornada',primitives:'Primitivos',cta:'Botões CTA',lesson_chips:'Chips de aula',trophy:'Troféus',profile:'Perfil',navigation:'Navegação',missions:'Missões novas',speech:'Conversação',transitions:'Transições',mascot_states:'Expressões',effects:'Efeitos'};
const galleryState={category:'all',query:'',surface:'checker'};
let manifestPromise;
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const categoryLabels=Object.freeze({...LABELS});
export function assetGalleryPage(){
 return `<section class="vb-library" id="vb-asset-gallery" aria-labelledby="vb-library-title">
 <div class="vb-library-heading"><div><span class="vb-kicker">VERBARIUM / ASSET SYSTEM</span><h1 id="vb-library-title">Biblioteca de <em>assets.</em></h1><p>192 elementos individuais com canal alpha, todos hospedados no próprio Verbarium. Esta é uma área de inspeção dos elementos utilizados no aplicativo; os valores das lições continuam em HTML e SVG dinâmicos.</p></div><img src="${ASSETS_BASE}brand/app_logo_icon.png" width="86" height="86" alt="" loading="lazy"></div>
 <div class="vb-library-toolbar"><label class="vb-library-search"><span>Buscar asset</span><input type="search" id="vb-library-search" placeholder="Mascote, ring, streak, gift…" autocomplete="off" value="${safe(galleryState.query)}"></label><div class="vb-library-surfaces" role="group" aria-label="Superfície de prévia"><button type="button" data-asset-surface="checker" aria-pressed="${galleryState.surface==='checker'}">Transparência</button><button type="button" data-asset-surface="light" aria-pressed="${galleryState.surface==='light'}">Claro</button><button type="button" data-asset-surface="dark" aria-pressed="${galleryState.surface==='dark'}">Escuro</button></div></div>
 <nav class="vb-library-categories" aria-label="Categorias de assets" id="vb-asset-categories"></nav>
 <div class="vb-library-count" id="vb-library-count" role="status">Carregando os 192 arquivos...</div>
 <div class="vb-library-grid" data-surface="${galleryState.surface}" id="vb-asset-grid" aria-live="off"></div>
 <div class="vb-library-notice"><strong>Componentes dinâmicos:</strong> anéis, barras e contadores são renderizados pelo aplicativo com dados reais. PNGs com números impressos são apenas referências de composição e ficam nesta biblioteca para consulta.</div></section>`;
}
function getManifest(){
 if(!manifestPromise){
  const read=async url=>{const res=await fetch(url);if(!res.ok)throw new Error(`HTTP ${res.status}`);return res.json()};
  manifestPromise=Promise.all([read(`${ASSETS_BASE}manifest.json`),read(`${ASSETS_BASE}extra-80/manifest.json`)]).then(([oldPack,newPack])=>({
   assets:[...(oldPack.assets||[]),...(newPack.assets||[]).map(a=>({
    id:a.id,category:a.category,description:a.description,
    file:'extra-80/'+a.png,svg:'extra-80/'+a.svg,
    w:a.png_size?.[0]||null,h:a.png_size?.[1]||null
   }))]
  })).catch(error=>{manifestPromise=undefined;throw error});
 }
 return manifestPromise;
}
export async function hydrateAssetGallery(root){
 const frame=root?.querySelector('#vb-asset-gallery');if(!frame)return;
 const grid=frame.querySelector('#vb-asset-grid'),categories=frame.querySelector('#vb-asset-categories'),counter=frame.querySelector('#vb-library-count');
 let entries;
 try{
  const manifest=await getManifest();
  if(!frame.isConnected)return;
  entries=(manifest.assets||[]).filter(a=>/^(?:[a-z0-9_-]+\/){1,3}[a-z0-9_.-]+\.(png|svg)$/.test(a.file));
 }catch(error){
  counter.textContent='Não foi possível carregar o manifesto dos assets.';
  grid.textContent='Verifique a publicação de /verbarium-assets/manifest.json.';
  return;
 }
 const found=new Set(entries.map(a=>a.category));
 categories.innerHTML=Object.entries(LABELS).filter(([id])=>id==='all'||found.has(id)).map(([id,label])=>`<button type="button" data-asset-category="${id}" aria-pressed="${galleryState.category===id}">${safe(label)}</button>`).join('');
 const draw=()=>{
  if(!frame.isConnected)return;
  const q=galleryState.query.toLocaleLowerCase('pt-BR').trim();
  const filtered=entries.filter(a=>(galleryState.category==='all'||a.category===galleryState.category)&&(!q||`${a.id} ${a.category} ${a.description}`.toLocaleLowerCase('pt-BR').includes(q)));
  counter.textContent=`Exibindo ${filtered.length} de ${entries.length} assets · ${entries.filter(x=>x.file.endsWith('.png')).length} PNG · ${entries.filter(x=>x.file.endsWith('.svg')).length} SVG`;
  grid.dataset.surface=galleryState.surface;
  categories.querySelectorAll('[data-asset-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.assetCategory===galleryState.category)));
  frame.querySelectorAll('[data-asset-surface]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.assetSurface===galleryState.surface)));
  grid.innerHTML=filtered.length?filtered.map(a=>{
   const url=ASSETS_BASE+a.file;
   return `<article class="vb-library-asset"><div class="vb-library-stage"><img src="${url}" loading="lazy" decoding="async" alt="${safe(a.description||a.id)}"></div><div class="vb-library-asset-info"><small>${safe(LABELS[a.category]||a.category)} / ${safe(a.file.endsWith('.svg')?'SVG':'PNG')}</small><h2>${safe(a.description||a.id)}</h2><code>${safe(a.file)}</code><div class="vb-library-asset-foot"><span>${a.w&&a.h?`${a.w} × ${a.h} px`:'Vetorial'}</span><a href="${url}" download aria-label="Baixar ${safe(a.id)}">PNG ↓</a>${a.svg?`<a href="${ASSETS_BASE+a.svg}" download aria-label="Baixar SVG ${safe(a.id)}">SVG ↓</a>`:""}</div></div></article>`;
  }).join(''):'<p class="vb-library-empty">Nenhum asset corresponde aos filtros. Experimente outra busca.</p>';
 };
 frame.addEventListener('click',event=>{
  const cat=event.target.closest('[data-asset-category]');
  if(cat){galleryState.category=cat.dataset.assetCategory;draw();return;}
  const bg=event.target.closest('[data-asset-surface]');if(bg){galleryState.surface=bg.dataset.assetSurface;draw();}
 });
 frame.querySelector('#vb-library-search').addEventListener('input',event=>{galleryState.query=event.target.value;draw();});
 draw();
}