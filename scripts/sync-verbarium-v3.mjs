/** Extract the exact, SHA-256 verified, eight-sheet Verbarium v3 asset kit. */
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const packed=path.join(root,'assets','packed');
const COUNT=23;
const SHA='d80aabe4b317b34884c8740df29ae9b1f53c235ed05e5dbf9d5920d644a8ecbd';
const parts=await Promise.all(Array.from({length:COUNT},(_,i)=>readFile(path.join(packed,`v3_${String(i).padStart(2,'0')}.b64`),'utf8')));
const binary=Buffer.from(parts.join(''),'base64');
if(createHash('sha256').update(binary).digest('hex')!==SHA)throw Error('Verbarium v3: archive digest mismatch');
const tar=gunzipSync(binary);
let cursor=0, pax={}, longName=null, installed=0;
const field=(buffer,a,b)=>buffer.toString('utf8',a,b).replace(/\0.*$/s,'').trim();
const records=(raw)=>{const data={};let at=0;while(at<raw.length){const space=raw.indexOf(' ',at);if(space<0)break;const count=Number(raw.slice(at,space));if(!Number.isSafeInteger(count)||count<=0)break;const record=raw.slice(space+1,at+count).trimEnd();const ix=record.indexOf('=');if(ix>0)data[record.slice(0,ix)]=record.slice(ix+1);at+=count;}return data;};
while(cursor+512<=tar.length){
 const head=tar.subarray(cursor,cursor+512);
 if(head.every(b=>b===0))break;
 const name=field(head,0,100),prefix=field(head,345,500),size=parseInt(field(head,124,136)||'0',8);
 if(!Number.isSafeInteger(size)||size<0||cursor+512+size>tar.length)throw Error('Corrupted v3 tar size');
 const type=String.fromCharCode(head[156]);const body=tar.subarray(cursor+512,cursor+512+size);
 cursor+=512+Math.ceil(size/512)*512;
 if(type==='x'){pax=records(body.toString('utf8'));continue;}
 if(type==='L'){longName=body.toString('utf8').replace(/\0.*$/s,'');continue;}
 const entry=(pax.path||longName||(prefix?prefix+'/':'')+name).replace(/\\/g,'/');pax={};longName=null;
 if(type!=='0'&&type!=='\0'&&type!=='5')continue;
 if(!entry.startsWith('public/verbarium-v3/')||entry.split('/').includes('..')||entry.includes('//'))throw Error('Unsafe v3 asset name '+entry);
 const dest=path.resolve(root,entry),target=path.join(root,'public','verbarium-v3');
 if(!dest.startsWith(target+path.sep)&&dest!==target)throw Error('Asset path outside destination');
 if(type==='5'){await mkdir(dest,{recursive:true});continue;}
 await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,body);installed++;
}
const manifest=JSON.parse(await readFile(path.join(root,'public','verbarium-v3','manifest.json'),'utf8'));
if(manifest.asset_count!==151||manifest.motion_count!==142||installed<297)throw Error(`Verbarium v3 incomplete: ${installed} files`);
console.info(`Verbarium v3: extracted ${installed} files (${manifest.asset_count} sprites, ${manifest.motion_count} motions)`);
