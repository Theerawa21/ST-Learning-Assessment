/* Reproducible editor bundle. Never inserts deployment identifiers. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),src=path.join(root,'src'),out=path.join(root,'release/editor-bundle');fs.mkdirSync(out,{recursive:true});
const scripts=fs.readdirSync(src).filter(n=>n.endsWith('.gs')).sort();const code=scripts.map(n=>'\n// ===== '+n+' =====\n'+fs.readFileSync(path.join(src,n),'utf8')).join('\n');new vm.Script(code);
function expand(name,stack=[]){if(stack.includes(name))throw Error('recursive include '+name);return fs.readFileSync(path.join(src,name+'.html'),'utf8').replace(/<\?!=\s*include_\('([A-Za-z]+)'\);?\s*\?>/g,(_,part)=>expand(part,[...stack,name]));}
const html=expand('Index');if(html.includes('<?'))throw Error('unresolved Apps Script template');for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
fs.writeFileSync(path.join(out,'Code.gs'),code);fs.writeFileSync(path.join(out,'Index.html'),html);fs.copyFileSync(path.join(src,'appsscript.json'),path.join(out,'appsscript.json'));console.log('Editor bundle verified: Code.gs, Index.html, StaticBridge.html, appsscript.json.');

fs.copyFileSync(path.join(src,'StaticBridge.html'),path.join(out,'StaticBridge.html'));
