/** Restore V6 independent image assets from tracked text packs before dev/build/test. */
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const packed=path.join(root,'assets','packed');
const output=path.join(root,'public','verbarium-v6');
const files=(await readdir(packed).catch(()=>[])).filter(f=>/^verbarium-v6-(?:\d{2}|override-\d{2})\.txt$/.test(f)).sort();
if(!files.length){console.warn('[v6] No packed image data. Keep the existing V6 art files if present.');}
else{
 const seen=new Set(),assets=[];
 for(const file of files){
  const lines=(await readFile(path.join(packed,file),'utf8')).split(/\r?\n/);
  let name='',chunks=[];
  for(const line of lines){
   if(line.startsWith('FILE ')){
    if(name)throw Error('Nested file in '+file);
    name=line.slice(5).trim();chunks=[];
    if(!/^(characters|progress|pairs|buttons|panels)\/[a-z0-9_]+\.webp$/.test(name))throw Error('Unsafe V6 asset: '+name);
   }else if(line==='END_FILE'){
    if(!name||(seen.has(name)&&!file.includes('override')))throw Error('Duplicate or missing V6 asset: '+name);
    const raw=chunks.join('');
    if(!/^[A-Za-z0-9+/]+={0,2}$/.test(raw))throw Error('Invalid base64 in '+name);
    const bytes=Buffer.from(raw,'base64');
    if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw Error('Invalid WebP in '+name);
    const dest=path.join(output,'assets',name);
    await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,bytes);
    const record={id:path.basename(name,'.webp'),category:name.split('/')[0],path:'/verbarium-v6/assets/'+name,bytes:bytes.length};
    if(seen.has(name))assets.splice(assets.findIndex(a=>a.path===record.path),1,record);else{seen.add(name);assets.push(record);}
    name='';chunks=[];
   }else if(name&&line.trim())chunks.push(line.trim());
  }
  if(name)throw Error('Unfinished asset in '+file);
 }
 if(assets.length!==197)throw Error(`V6 incomplete: ${assets.length}/197`);
 await mkdir(output,{recursive:true});
 await writeFile(path.join(output,'manifest.json'),JSON.stringify({project:'Verbarium',version:'V6',count:assets.length,assets},null,2));
 console.log(`[v6] Restored ${assets.length} individual WebP assets`);
}
