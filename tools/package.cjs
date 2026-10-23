const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),src=path.join(root,'src'),release=path.join(root,'release');fs.mkdirSync(release,{recursive:true});
const names=fs.readdirSync(src).filter(n=>/\.(gs|html|json)$/.test(n)).sort();const files=names.map(n=>({name:n.replace(/\.(gs|html|json)$/,''),type:n.endsWith('.gs')?'SERVER_JS':n.endsWith('.html')?'HTML':'JSON',source:fs.readFileSync(path.join(src,n),'utf8')}));
fs.writeFileSync(path.join(release,'appsscript-project.json'),JSON.stringify({files},null,2));
fs.writeFileSync(path.join(release,'SHA256SUMS.txt'),names.map(n=>crypto.createHash('sha256').update(fs.readFileSync(path.join(src,n))).digest('hex')+'  src/'+n).join('\n')+'\n');
console.log('Packaged '+files.length+' Apps Script project files in release/appsscript-project.json; hashes in release/SHA256SUMS.txt.');
