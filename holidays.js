import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { estimateDelivery, ORIGIN } from './shipping.js';

const port = Number(process.env.PORT || 3000);
const host = '0.0.0.0';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

const mime = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon' };

function commonHeaders(res){res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');}
function json(res,status,payload){commonHeaders(res);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(payload));}
async function bodyJson(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>50000)throw new Error('Payload muito grande.');}return raw?JSON.parse(raw):{};}
async function serveStatic(urlPath,res){let relative=urlPath==='/'?'index.html':urlPath.replace(/^\//,'');relative=relative.split('?')[0];const filePath=path.resolve(publicDir,relative);if(!filePath.startsWith(publicDir+path.sep)&&filePath!==path.join(publicDir,'index.html'))return false;try{const data=await readFile(filePath);commonHeaders(res);res.writeHead(200,{'Content-Type':mime[path.extname(filePath)]||'application/octet-stream','Cache-Control':path.extname(filePath)==='.html'?'no-cache':'public, max-age=3600'});res.end(data);return true;}catch{return false;}}

const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);
  if(req.method==='GET'&&url.pathname==='/health')return json(res,200,{ok:true,product:'MINOVITE',originCep:ORIGIN.cep});

  const cepMatch=req.method==='GET'&&url.pathname.match(/^\/api\/cep\/(\d{8})$/);
  if(cepMatch){
    const cep=cepMatch[1],controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),6500);
    try{
      const response=await fetch(`https://viacep.com.br/ws/${cep}/json/`,{signal:controller.signal,headers:{'User-Agent':'MINOVITE-Operacao/1.0'}});
      if(!response.ok)return json(res,502,{error:'O serviço de CEP não respondeu corretamente. Tente novamente.'});
      const data=await response.json();if(data.erro)return json(res,404,{error:'CEP não encontrado. Confira os números ou preencha o endereço manualmente.'});
      const estimate=estimateDelivery({uf:data.uf,city:data.localidade,orderDate:url.searchParams.get('orderDate')});
      return json(res,200,{address:{cep:data.cep,street:data.logradouro||'',neighborhood:data.bairro||'',city:data.localidade||'',uf:data.uf||'',state:data.estado||'',region:data.regiao||estimate.region},estimate});
    }catch(error){return json(res,503,{error:error?.name==='AbortError'?'A consulta de CEP demorou além do esperado. Tente novamente ou use o preenchimento manual.':'Não foi possível consultar o CEP agora. Use o preenchimento manual e tente novamente depois.'});}finally{clearTimeout(timeout);}
  }

  if(req.method==='GET'&&url.pathname.startsWith('/api/cep/'))return json(res,400,{error:'Informe um CEP válido com 8 dígitos.'});
  if(req.method==='POST'&&url.pathname==='/api/shipping/estimate'){
    try{const {uf,city,orderDate}=await bodyJson(req);if(!uf||!city)return json(res,400,{error:'Informe cidade e UF para calcular o prazo.'});return json(res,200,{estimate:estimateDelivery({uf,city,orderDate})});}
    catch(error){return json(res,400,{error:error.message||'Não foi possível calcular o prazo.'});}
  }
  if(url.pathname.startsWith('/api/'))return json(res,404,{error:'Rota de API não encontrada.'});
  if(req.method==='GET'&&await serveStatic(url.pathname,res))return;
  commonHeaders(res);res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Não encontrado');
});

server.listen(port,host,()=>console.log(`MINOVITE rodando em ${host}:${port}`));
