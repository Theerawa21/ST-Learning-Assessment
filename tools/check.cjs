const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=path.join(__dirname,'../src');let checked=0;
for(const name of fs.readdirSync(src)){const code=fs.readFileSync(path.join(src,name),'utf8');if(name.endsWith('.gs')){new vm.Script(code,{filename:name});checked++;}if(name.endsWith('.html'))for(const match of code.matchAll(/<script>([\s\S]*?)<\/script>/g)){new vm.Script(match[1],{filename:name});checked++;}if(name.endsWith('.json'))JSON.parse(code);}
console.log('Syntax OK: '+checked+' Apps Script / browser script units; manifest JSON valid.');
