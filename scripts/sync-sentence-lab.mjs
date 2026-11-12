/** Rebuild independent GIFs from tracked transport packs before development/build. */
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const packed=path.join(root,'assets','packed');
const output=path.join(root,'public','academy','sentence-lab');
const files=(await readdir(packed).catch(()=>[])).filter(f=>/^verbarium-sentence-\d{2}\.txt$/.test(f)).sort();
const catalog=JSON.parse(await readFile(path.join(output,'manifest.json'),'utf8'));
const expected=new Map(catalog.assets.map(item=>[item.id,item.sha256]));
const seen=new Set();
for(const file of files){
 const rows=(await readFile(path.join(packed,file),'utf8')).split(/\r?\n/);let name=null,chunks=[];
 if(rows[0]!=='VB_SENTENCE_PACK_V1')throw Error('Invalid animation pack header: '+file);
 for(const line of rows.slice(1)){
  if(line.startsWith('FILE ')){
   if(name)throw Error('Unfinished asset in '+file);
   name=line.slice(5).trim();chunks=[];
   if(!/^(faces|progress|exercises|rewards|characters|food|scenes)\/[a-z0-9_-]+\.gif$/.test(name)||!expected.has(name))throw Error('Unexpected animation: '+name);
  }else if(line==='END_FILE'){
   if(!name||seen.has(name))throw Error('Missing or duplicate animation '+name);
   const bytes=Buffer.from(chunks.join(''),'base64');
   if(bytes.toString('ascii',0,3)!=='GIF'||createHash('sha256').update(bytes).digest('hex')!==expected.get(name))throw Error('Corrupt animation: '+name);
   const target=path.join(output,'assets',name);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,bytes);
   seen.add(name);name=null;chunks=[];
  }else if(name&&line.trim())chunks.push(line.trim());
 }
 if(name)throw Error('Truncated animation pack: '+file);
}
if(seen.size===0)console.warn('[sentence-lab] No animation packs found, existing V6 fallback used');
else if(seen.size!==catalog.count)console.warn('[sentence-lab] '+seen.size+'/'+catalog.count+' GIFs restored; existing assets used as fallback for pending animations');
else console.log('[sentence-lab] All '+catalog.count+' GIFs restored and verified');
