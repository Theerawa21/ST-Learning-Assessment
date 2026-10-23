/* Local QA only. Never upload this file or tests/ to Apps Script. */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),{harness}=require('../tests/harness.cjs'),{fixture}=require('../tests/fixtures.cjs');
let env=harness();env.props.SETUP_OWNER_EMAIL='admin@school.test';env.ctx.setupSystem();let identity='admin@school.test';
const port=Number(process.env.ST_PREVIEW_PORT)||4187,src=path.join(__dirname,'../src'),origin='http://127.0.0.1:'+port;
function html(name){if(!/^[A-Za-z]+$/.test(name))throw Error('invalid include');return fs.readFileSync(path.join(src,name+'.html'),'utf8').replace(/<\?!= include_\('([A-Za-z]+)'\); \?>/g,(_,n)=>html(n));}
const server=http.createServer(async(req,res)=>{res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');try{
 if(req.method==='GET'&&(req.url==='/'||req.url==='/index.html')){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html('Index').replace('</head>','<script>window.ST_PREVIEW=true;</script></head>'));return;}
 if(req.url==='/favicon.ico'){res.writeHead(204);res.end();return;}
 if(req.method!=='POST'||(req.headers.origin&&req.headers.origin!==origin)){res.writeHead(403);res.end('Forbidden');return;}
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>120000){res.writeHead(413);res.end();return;}}const data=raw?JSON.parse(raw):{};res.setHeader('Content-Type','application/json; charset=utf-8');
 if(req.url==='/preview/seed'){env=fixture();env.setEmail(identity);res.end('{"ok":true}');return;}
 if(req.url==='/preview/identity'){if(!['admin@school.test','teacher@school.test','head@school.test','assessment@school.test','academic@school.test'].includes(data.email))throw Error('unknown test identity');identity=data.email;env.setEmail(identity);res.end('{"ok":true}');return;}
 if(req.url==='/api'){if(['exportReport','backup','installTriggers','restore','recoverOperation'].includes(data.action)){res.end(JSON.stringify({ok:false,error:{code:'PREVIEW',message:'โหมดทดสอบไม่เรียกบริการ Google จริง กรุณาทดสอบหลังติดตั้ง Apps Script'}}));return;}res.end(JSON.stringify(env.ctx.api(data)));return;}
 res.writeHead(404);res.end('{}');
 }catch(e){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:{message:e.message}}));}});
server.listen(port,'127.0.0.1',()=>console.log('Local QA preview: '+origin+' — test data in memory only.'));
