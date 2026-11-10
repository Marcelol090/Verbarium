/** Materializes the 2026 generated transparent visual kit from portable text assets. */
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const packed=path.join(root,'assets','packed');
const output=path.join(root,'public','verbarium-2026-kit');
const categoryGroups={
 core:'node_book node_star_active node_locked treasure_chest star_rating unit_banner lesson_progress_header continue_green',
 fruit:'apple apple_half banana orange strawberry grapes watermelon pear pineapple blueberries',
 food:'milk orange_juice bread cheese egg carrot broccoli rice sandwich cupcake',
 exercise:'chip_idle chip_correct chip_wrong audio_wave answer_slot chip_selected image_choice_apple check_button continue_blue feedback_great',
 reward:'gem_count heart_count streak_count coin_count gold_medal silver_medal chest_closed chest_open blue_ribbon level_up',
 character:'explorer grandfather student_desk student_duo campfire_pet',
 navigation:'home map trophy friends more scroll_down curved_path checkpoint_ring cloud sparkle',
 panel:'mission_banner lesson_result level_stats activity_divider tip_card answer_area full_progress'
};
const categories=new Map(Object.entries(categoryGroups).flatMap(([group,ids])=>ids.split(' ').map(id=>[id,group])));
let parts=[];
try{parts=(await readdir(packed)).filter(f=>/^visual-kit-2026-\d+\.txt$/.test(f)).sort();}catch{}
if(!parts.length){
 console.log('[visual-kit] No new transfer packs found, preserving existing artwork.');
}else{
 await mkdir(path.join(output,'items'),{recursive:true});
 const seen=new Set(),assets=[];
 for(const part of parts){
  const lines=(await readFile(path.join(packed,part),'utf8')).split(/\r?\n/);
  let filename='',chunks=[];
  for(const line of lines){
   if(line.startsWith('FILE ')){
    if(filename)throw Error('Nested asset record in '+part);
    filename=line.slice(5).trim();chunks=[];
    if(!/^[a-z0-9_]+\.webp$/.test(filename))throw Error('Unsafe asset filename '+filename);
   }else if(line==='END_FILE'){
    if(!filename)throw Error('Unexpected END_FILE in '+part);
    if(seen.has(filename))throw Error('Duplicate asset '+filename);
    const raw=chunks.join('');
    if(!/^[A-Za-z0-9+/]+={0,2}$/.test(raw))throw Error('Invalid base64 '+filename);
    const bytes=Buffer.from(raw,'base64');
    if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw Error('Invalid WEBP '+filename);
    await writeFile(path.join(output,'items',filename),bytes);
    seen.add(filename);const id=filename.slice(0,-5);
    assets.push({id,category:categories.get(id)||'misc',path:'/verbarium-2026-kit/items/'+filename,size_bytes:bytes.length});
    filename='';chunks=[];
   }else if(filename&&line.trim())chunks.push(line.trim());
  }
  if(filename)throw Error('Unclosed asset record in '+part);
 }
 if(assets.length!==70)throw Error('Visual kit incomplete: '+assets.length+' of 70 expected assets');
 assets.sort((a,b)=>a.id.localeCompare(b.id));
 await writeFile(path.join(output,'manifest.json'),JSON.stringify({project:'Verbarium',pack:'Visual Food and Progress Kit',version:'2026-11-10',count:assets.length,assets},null,2));
 console.log('[visual-kit] Materialized '+assets.length+' independent WebP assets');
}
