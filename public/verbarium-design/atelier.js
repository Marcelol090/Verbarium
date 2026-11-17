const assetRoot='/verbarium-visual-kit/';
const typeLabels={buttons:'Botões',cards:'Cards',grids:'Grids',backgrounds:'Fundos',labels:'Labels',mascot:'Pip',rewards:'Recompensas'};
const grid=document.querySelector('#asset-grid'),filters=document.querySelector('#filters');
const size=document.querySelector('#asset-size'),sizeLabel=document.querySelector('#size-label');
const inspector={title:document.querySelector('#inspector-title'),description:document.querySelector('#inspector-description'),path:document.querySelector('#inspector-path'),copy:document.querySelector('#copy-path')};
let catalog=[];let active='all';let selected=null;
const nice=id=>id.replaceAll('_',' ').replace(/^\w/,c=>c.toUpperCase());
const selectAsset=(id,asset)=>{
 selected=assetRoot+asset.path;
 inspector.title.textContent=nice(id);
 inspector.description.textContent=`${typeLabels[asset.category]} · ${asset.width} × ${asset.height} px · WebP com transparência`;
 inspector.path.textContent=selected;
 inspector.copy.disabled=false;
 for(const el of grid.querySelectorAll('.asset-item'))el.setAttribute('aria-pressed',String(el.dataset.id===id));
};
function render(){
 grid.replaceChildren();
 const data=catalog.filter(([id,item])=>active==='all'||item.category===active);
 for(const [id,item] of data){
  const button=document.createElement('button');button.type='button';button.className='asset-item';button.dataset.id=id;button.setAttribute('aria-pressed',String(item.path===selected?.slice(assetRoot.length)));
  button.setAttribute('aria-label',`${nice(id)}, ${item.width} por ${item.height} pixels. Inspecionar asset.`);
  const plate=document.createElement('div');plate.className='asset-preview';
  const image=document.createElement('img');image.loading='lazy';image.decoding='async';image.src=assetRoot+item.path;image.alt='';image.width=item.width;image.height=item.height;
  image.onerror=()=>{image.alt='Imagem indisponível';button.dataset.error='true'};
  plate.append(image);
  const title=document.createElement('strong');title.textContent=nice(id);
  const sub=document.createElement('small');sub.textContent=`${item.width} × ${item.height} · ${typeLabels[item.category]}`;
  button.append(plate,title,sub);button.addEventListener('click',()=>selectAsset(id,item));grid.append(button);
 }
 if(!data.length)grid.textContent='Nenhum asset nesta categoria.';
}
function makeFilters(){
 const groups=[['all','Tudo'],...Object.entries(typeLabels)];
 for(const [key,label] of groups){const button=document.createElement('button');button.type='button';button.textContent=label;
  button.setAttribute('aria-pressed',String(key===active));button.addEventListener('click',()=>{
  active=key;for(const b of filters.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b===button));render();});filters.append(button)}
}
async function init(){
 try{
  const response=await fetch(assetRoot+'manifest.json',{cache:'no-cache'});if(!response.ok)throw Error('Manifest HTTP '+response.status);
  const m=await response.json();catalog=Object.entries(m.assets);document.querySelector('#asset-total').textContent=String(catalog.length);
  if(catalog.length!==48)throw Error('Esperados 48 assets, encontrados '+catalog.length);
  makeFilters();render();
 }catch(e){grid.textContent='A biblioteca não foi extraída pelo build: '+e.message}
}
size.addEventListener('input',()=>{sizeLabel.value=size.value+' px';grid.style.setProperty('--preview-size',size.value+'px')});
document.querySelector('#surface-toggle').addEventListener('click',e=>{const b=e.currentTarget;const dark=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(dark));grid.dataset.dark=String(dark);b.textContent=dark?'Fundo claro':'Fundo escuro'});
inspector.copy.addEventListener('click',async()=>{if(!selected)return;try{await navigator.clipboard.writeText(selected);inspector.copy.textContent='Copiado';setTimeout(()=>inspector.copy.textContent='Copiar caminho',1400)}catch{inspector.copy.textContent='Selecione o texto acima'}});
const say=msg=>document.querySelector('#live-status').textContent=msg;
document.querySelector('#state-demo').addEventListener('click',()=>say('Primário: toque confirmado. O aplicativo controla texto e estado sem esticar imagens.'));
document.querySelector('#secondary-demo').addEventListener('click',()=>say('Secundário: borda de 1 px, contraste semântico e alvo de 52 px.'));
document.querySelector('#icon-demo').addEventListener('click',()=>say('Ícone: 24 × 24, traço de 2 px, botão com alvo de 52 px.'));
init();
