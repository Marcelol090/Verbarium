/** Restore the original 102 V5 WebP assets from tracked UTF-8 transfer packs. */
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const packed=path.join(root,'assets','packed');
const output=path.join(root,'public','verbarium-v5');
let files=[];
try{files=(await readdir(packed)).filter(n=>/^verbarium-v5-(?:\d{2}|override-\d{2})\.txt$/.test(n)).sort();}catch{}
if(files.length===0){console.warn('[v5] No transfer files yet; retaining existing art and HTML fallback.');}
else{
 const full=(await Promise.all(files.map(n=>readFile(path.join(packed,n),'utf8')))).join('\n');
 const rows=full.split(/\r?\n/);const allowed=new Set(['characters','worlds','navigation','exercises','rewards','panels']);
 const assets=[],seen=new Set();let current='',base64=[],overrides=false;
 for(const line of rows){
  if(line==='VERBARIUM_V5_OVERRIDE_V1'){overrides=true;continue;}
  if(line.startsWith('FILE ')){
   if(current)throw Error('Nested V5 asset: '+current);
   current=line.slice(5).trim();
   if(!/^[a-z]+\/[a-z0-9_]+\.webp$/.test(current)||!allowed.has(current.split('/')[0]))throw Error('Unsafe V5 path: '+current);
   base64=[];
  }else if(line==='END_FILE'){
   if(!current||(seen.has(current)&&!overrides))throw Error('Invalid or repeated V5 asset '+current);
   const raw=base64.join('');if(!/^[A-Za-z0-9+/]+={0,2}$/.test(raw))throw Error('Invalid base64: '+current);
   const data=Buffer.from(raw,'base64');
   if(data.toString('ascii',0,4)!=='RIFF'||data.toString('ascii',8,12)!=='WEBP')throw Error('Invalid WebP: '+current);
   const target=path.join(output,'assets',current);
   await mkdir(path.dirname(target),{recursive:true});await writeFile(target,data);
   const record={id:path.basename(current,'.webp'),category:current.split('/')[0],path:'/verbarium-v5/assets/'+current,bytes:data.length};
   if(seen.has(current))assets.splice(assets.findIndex(a=>a.path===record.path),1,record);else{seen.add(current);assets.push(record);}
   current='';base64=[];
  }else if(current&&line.trim())base64.push(line.trim());
 }
 if(current)throw Error('Unfinished V5 transfer record: '+current);
 if(assets.length!==102)throw Error(`V5 incomplete: ${assets.length}/102 assets`);
 await mkdir(output,{recursive:true});
 await writeFile(path.join(output,'manifest.json'),JSON.stringify({project:'Verbarium',version:'V5',count:assets.length,assets},null,2));
 console.log('[v5] Restored '+assets.length+' individual WebP assets');
}