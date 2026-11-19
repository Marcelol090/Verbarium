import fs from 'node:fs';
import path from 'node:path';
import {defineConfig} from 'vite';

function servePublicRuntimeModules(){
  return {
    name:'serve-public-runtime-modules',
    configureServer(server){
      server.middlewares.use((req,res,next)=>{
        const rawUrl=req.url||'/';
        const qIndex=rawUrl.indexOf('?');
        const reqPath=qIndex>=0?rawUrl.slice(0,qIndex):rawUrl;
        const query=qIndex>=0?rawUrl.slice(qIndex):'';
        if(reqPath.startsWith('/verbarium-v3/runtime/')&&reqPath.endsWith('.mjs')){
          const filePath=path.resolve(process.cwd(),'public',reqPath.slice(1));
          if(fs.existsSync(filePath)){
            res.statusCode=200;
            res.setHeader('Content-Type','application/javascript; charset=utf-8');
            res.end(fs.readFileSync(filePath,'utf8'));
            return;
          }
        }
        if(req.method==='GET'&&reqPath!=='/'&&!path.extname(reqPath)){
          const cleanPath=reqPath.replace(/^\/+|\/+$/g,'');
          const subIndex=path.resolve(process.cwd(),'public',cleanPath,'index.html');
          if(cleanPath&&subIndex.startsWith(path.resolve(process.cwd(),'public')+path.sep)&&fs.existsSync(subIndex)){
            if(!reqPath.endsWith('/')){
              res.statusCode=302;
              res.setHeader('Location',`/${cleanPath}/${query}`);
              res.end();
              return;
            }
            res.statusCode=200;
            res.setHeader('Content-Type','text/html; charset=utf-8');
            res.end(fs.readFileSync(subIndex,'utf8'));
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  base:'/',
  plugins:[servePublicRuntimeModules()],
  server:{host:'0.0.0.0',port:5173,allowedHosts:true},
  preview:{host:'0.0.0.0',port:4173,allowedHosts:true},
  build:{target:'es2022',outDir:'dist'}
});
