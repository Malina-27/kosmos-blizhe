import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.mp4':'video/mp4','.vtt':'text/vtt; charset=utf-8','.md':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
  try{
    let route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(route==='/')route='/index.html';
    let file=path.resolve(root,'.'+route);if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    let info;try{info=await stat(file);}catch{if(!path.extname(file)){file+='.html';info=await stat(file);}else throw new Error('missing');}
    if(!info.isFile())throw new Error('missing');
    const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Страница не найдена');}
}).listen(4173,'127.0.0.1',()=>process.stdout.write('Local: http://127.0.0.1:4173\n'));
