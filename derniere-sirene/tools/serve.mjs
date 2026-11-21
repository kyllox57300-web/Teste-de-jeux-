import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname,resolve,sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';

const root=fileURLToPath(new URL('../../',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
export async function serve(port=0) {
  const server=http.createServer(async(req,res)=>{
    try {
      const {pathname}=new URL(req.url,'http://localhost');
      const path=resolve(root,'.'+decodeURIComponent(pathname)+(pathname.endsWith('/')?'index.html':''));
      if(!path.toLowerCase().startsWith(resolve(root).toLowerCase()+sep)) throw Error();
      const data=await readFile(path);
      res.setHeader('content-type',types[extname(path)]||'application/octet-stream');
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  server.listen(port,'127.0.0.1');
  await once(server,'listening');
  return {server,url:`http://127.0.0.1:${server.address().port}/derniere-sirene/`};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const {url}=await serve(Number(process.argv[2]||4173));
  console.log(url);
}
