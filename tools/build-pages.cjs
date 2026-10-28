const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),src=path.join(root,'src'),out=path.join(root,'public');
function expand(name){return fs.readFileSync(path.join(src,name+'.html'),'utf8').replace(/<\?!=\s*include_\('([A-Za-z]+)'\);?\s*\?>/g,(_,part)=>expand(part));}
let html=expand('Index').replace('<base target="_top">','<base target="_self"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer">');
const version=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'web/pages-client.js'))).update(fs.readFileSync(path.join(root,'web/config.js'))).digest('hex').slice(0,12);
html=html.replace('<body>',`<body><script src="config.js?v=${version}"></script><script src="pages-client.js?v=${version}"></script>`);
if(html.includes('<?'))throw Error('Unexpanded server template');
for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'index.html'),html);
for(const name of ['config.js','pages-client.js']){const code=fs.readFileSync(path.join(root,'web',name),'utf8');new vm.Script(code);fs.writeFileSync(path.join(out,name),code);}
fs.writeFileSync(path.join(out,'.nojekyll'),'');console.log('GitHub Pages build verified: public/');
