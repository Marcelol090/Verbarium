/* Verbarium Mobile Studio. The iframe is the actual app, not an image mockup.
   A CSS viewport of 390px stays 390 CSS px. No transform:scale(). */
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const iframe=$('#app-frame');
const device=$('#device-select');
const deviceShell=$('#phone-device');
const viewportLabel=$('#viewport-label');
const status=$('#frame-status');
const screenHeading=$('#screen-heading');
const openDirect=$('#open-direct');
const openApp=$('#open-app');
const sizes={320:[320,720],360:[360,800],390:[390,844],430:[430,932]};
const screens={home:{url:'/',label:'Início'},academy:{url:'/academy/',label:'Academy'},lesson:{url:'/academy/',label:'Aula'},onboarding:{url:'/onboarding/',label:'Onboarding'}};
let selectedScreen='home';
let selectedMode='preview';
let catalogLoaded=false;
let frameCount=0;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const url=new URL(window.location.href);
function updateAddress(){
 const q=new URLSearchParams();
 if(selectedScreen!=='home')q.set('screen',selectedScreen);
 if(device.value!=='390')q.set('device',device.value);
 if(selectedMode!=='preview')q.set('mode',selectedMode);
 const postfix=q.toString();
 window.history.replaceState(null,'',window.location.pathname+(postfix?'?'+postfix:''));
}
function changeDevice(next){
 if(!Object.hasOwn(sizes,String(next)))next='390';
 const [width,height]=sizes[next];
 device.value=next;
 deviceShell.style.setProperty('--device-w',width+'px');
 deviceShell.style.setProperty('--device-h',height+'px');
 viewportLabel.textContent=width+' × '+height+' CSS px';
 updateAddress();
 // CSS sizes the iframe. Its document receives a genuine resize event; no zoom.
}
function updateRouteControls(){
 $$('[data-screen], [data-mobile-screen]').forEach(button=>{
  const id=button.dataset.screen||button.dataset.mobileScreen;
  const active=id===selectedScreen;
  button.classList.toggle('active',active);
  button.setAttribute('aria-pressed',String(active));
 });
 screenHeading.textContent=screens[selectedScreen].label;
 openDirect.href=screens[selectedScreen].url;
 openApp.href=screens[selectedScreen].url;
}
function activateLesson(){
 let attempts=0;
 function tryOpening(){
  try{
   const doc=iframe.contentDocument;
   const button=doc?.querySelector('.welcome-card button[data-unit], .path-step.current button[data-unit], button[data-unit]:not([disabled])');
   if(button && !button.disabled){button.click();status.textContent=' Aula real aberta dentro do simulador';return}
   if(attempts<15){attempts++;window.requestAnimationFrame(tryOpening);return}
   status.textContent=' Escolha uma lição na Academy para experimentar os exercícios.';
  }catch{
   status.textContent=' Escolha uma lição na Academy para experimentar os exercícios.';
  }
 }
 window.requestAnimationFrame(tryOpening);
}
function changeScreen(next,{reload=false}={}){
 if(!Object.hasOwn(screens,next))next='home';
 const old=selectedScreen;
 selectedScreen=next;
 updateRouteControls();
 updateAddress();
 const pathname=iframe.getAttribute('src')?.split('?')[0]||'/';
 const expected=screens[next].url;
 if(!reload&&next===old&&pathname===expected)return;
 status.textContent=' Carregando '+screens[next].label+'…';
 // Home/Academy/Onboarding use the existing routes in this deployment.
 // Lesson opens the Academy and activates its live lesson button after load.
 iframe.src=expected+(reload?'?simRefresh='+ ++frameCount:'');
}
iframe.addEventListener('load',()=>{
 let width='real';
 try{width=String(Math.round(iframe.contentWindow.innerWidth))+' px'}catch{}
 status.textContent=' Viewport '+width+' · aplicativo interativo';
 if(selectedScreen==='lesson')activateLesson();
});
device.addEventListener('change',()=>changeDevice(device.value));
$$('[data-screen]').forEach(b=>b.addEventListener('click',()=>changeScreen(b.dataset.screen)));
$$('[data-mobile-screen]').forEach(b=>b.addEventListener('click',()=>changeScreen(b.dataset.mobileScreen)));
$('#reload').addEventListener('click',()=>changeScreen(selectedScreen,{reload:true}));
function setMode(next){
 if(!['preview','assets','rules'].includes(next))next='preview';
 selectedMode=next;
 document.body.dataset.mode=next;
 $('#library-pane').hidden=next!=='assets';
 $('#rules-pane').hidden=next!=='rules';
 $('[data-mode-btn]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.modeBtn===next)));
 const switcher=$('#asset-switch');switcher.setAttribute('aria-pressed',String(next!=='preview'));switcher.setAttribute('aria-label',next==='preview'?'Abrir catálogo de assets':'Voltar ao simulador');
 updateAddress();
 if(next==='assets')loadCatalog();
}
$('[data-mode-btn]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.modeBtn)));
$('#asset-switch').addEventListener('click',()=>setMode(selectedMode==='preview'?'assets':'preview'));
function label(text){return text.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}
const categoryLabels={todos:'Todos',mascot:'Pip',mascots:'Pip',buttons:'Botões',cards:'Cards',grids:'Grids',backgrounds:'Fundos',labels:'Labels',rewards:'Recompensas'};
let manifestData=null;
function showAssets(category='todos'){
 if(!manifestData)return;
 const entries=Object.entries(manifestData.assets||{}).filter(([,a])=>category==='todos'||a.category===category);
 const grid=$('#assets');
 grid.replaceChildren();
 for(const [key,asset] of entries){
  const article=document.createElement('article');article.className='asset-card';
  const container=document.createElement('div');container.className='asset-image';
  const image=document.createElement('img');image.loading='lazy';image.decoding='async';
  image.src='/verbarium-visual-kit/'+asset.path;
  image.alt='Ilustração '+label(key);
  image.onerror=()=>{container.textContent='Imagem indisponível';article.dataset.missing='true'};
  const name=document.createElement('strong');name.textContent=label(key);
  const metadata=document.createElement('small');metadata.textContent=(categoryLabels[asset.category]||asset.category)+' · '+asset.width+' × '+asset.height;
  container.append(image);article.append(container,name,metadata);grid.append(article);
 }
 $('#status').textContent=entries.length+' arquivos · independentes e sem distorção';
}
async function loadCatalog(){
 if(catalogLoaded)return;
 catalogLoaded=true;
 try{
  const response=await fetch('/verbarium-visual-kit/manifest.json',{cache:'no-cache'});
  if(!response.ok)throw new Error('HTTP '+response.status);
  manifestData=await response.json();
  const keys=Object.keys(manifestData.assets||{});
  if(keys.length!==48)throw Error('Catálogo incompleto: '+keys.length);
  const categories=['todos',...new Set(Object.values(manifestData.assets).map(a=>a.category))];
  const filters=$('#filters');
  for(const category of categories){
   const button=document.createElement('button');
   button.type='button';button.className='asset-filter';button.textContent=categoryLabels[category]||label(category);
   button.setAttribute('aria-pressed',String(category==='todos'));
   button.addEventListener('click',()=>{
    $$('.asset-filter').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    showAssets(category);
   });
   filters.append(button);
  }
  showAssets();
 }catch(error){
  $('#status').textContent='Não foi possível carregar o catálogo de imagens: '+error.message;
  catalogLoaded=false;
 }
}
const initialScreen=url.searchParams.get('screen')||'home';
const initialDevice=url.searchParams.get('device')||'390';
const initialMode=url.searchParams.get('mode')||'preview';
changeDevice(initialDevice);
changeScreen(initialScreen);
setMode(initialMode);
