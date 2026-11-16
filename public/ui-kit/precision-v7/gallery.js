const catalog='/verbarium-visual-kit/manifest.json';
const grid=document.getElementById('assets');
const status=document.getElementById('status');
const filters=document.getElementById('filters');
const theme=document.getElementById('theme');
const output=document.getElementById('feedback');
document.getElementById('action').addEventListener('click',()=>{output.textContent='Aula iniciada: controle ativo. No app real, a rota de ensino permanece vinculada à ação original.'});
document.getElementById('review').addEventListener('click',()=>{output.textContent='Estado de revisão selecionado.'});
theme.addEventListener('click',()=>{const dark=document.body.dataset.theme!=='dark';document.body.dataset.theme=dark?'dark':'light';theme.setAttribute('aria-pressed',String(dark))});
function label(name){return name.replaceAll('_',' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function render(manifest,category){
 const items=Object.entries(manifest.assets).filter(([,a])=>category==='todos'||a.category===category);
 grid.replaceChildren();
 for(const [name,a] of items){
  const card=document.createElement('article');card.className='asset';
  const art=document.createElement('div');art.className='asset-art';
  const image=document.createElement('img');image.src='/verbarium-visual-kit/'+a.path;image.alt='Arte: '+label(name);image.loading='lazy';image.decoding='async';
  image.onerror=()=>{card.dataset.missing='true';image.remove();art.textContent='Arquivo ausente';art.style.color='#a82f4c'};
  art.append(image);
  const title=document.createElement('strong');title.textContent=label(name);
  const sub=document.createElement('small');sub.textContent=a.category+' · '+a.width+' × '+a.height+' px';
  card.append(art,title,sub);grid.append(card);
 }
}
async function init(){
 try{
  const response=await fetch(catalog,{cache:'no-cache'});
  if(!response.ok)throw Error('manifest não encontrado');
  const data=await response.json();
  const keys=Object.keys(data.assets||{});
  if(keys.length!==48)throw Error('esperados 48 arquivos, recebidos '+keys.length);
  status.textContent='48 WebP publicados · PNG originais no ZIP · use contain, sem stretch';
  const options=['todos',...new Set(Object.values(data.assets).map(a=>a.category))];
  let selected='todos';
  for(const c of options){
   const b=document.createElement('button');b.type='button';b.className='pill';b.textContent=label(c);b.setAttribute('aria-pressed',String(c===selected));
   b.addEventListener('click',()=>{selected=c;for(const x of filters.children)x.setAttribute('aria-pressed',String(x===b));render(data,c)});
   filters.append(b);
  }
  render(data,'todos');
 }catch(e){
  status.textContent='Os 48 arquivos gráficos ainda não estão publicados nesta implantação.';
  const text=document.createElement('p');
  text.textContent='Instale o arquivo verbarium-visual-kit-v1.zip em public/verbarium-visual-kit/ para habilitar o catálogo. A interface permanece funcional com as ilustrações anteriores enquanto isso.';
  grid.replaceChildren(text);
 }
}
init();
