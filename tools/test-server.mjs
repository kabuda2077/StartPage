import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
http.createServer((req,res)=>{
  try {
    const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
    if(!file.startsWith(root+path.sep))throw Error('path');
    const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ico':'image/x-icon','.svg':'image/svg+xml','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream';
    res.setHeader('Content-Type',type);res.end(fs.readFileSync(file));
  }catch{res.statusCode=404;res.end();}
}).listen(4173,'127.0.0.1');
