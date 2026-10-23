const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
function harness(){
 const tables={},props={},files={},folders={},books={};let email='admin@school.test',failTable=null;
 class Sheet{
  constructor(name){this.name=name;this.rows=[];this.maxRows=1000;}
  getMaxRows(){return this.maxRows;}insertRowsAfter(index,count){this.maxRows+=count;return this;}
  getLastRow(){return this.rows.length;}getLastColumn(){return this.rows[0]?.length||0;}
  getDataRange(){return this.getRange(1,1,Math.max(1,this.rows.length),Math.max(1,this.getLastColumn()));}
  getRange(r,c,n=1,m=1){if(r+n-1>this.maxRows)throw Error('range exceeds grid');const self=this;return {getValues(){return Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>self.rows[r+i-1]?.[c+j-1]??''));},setValues(values){if(failTable===self.name){failTable=null;throw Error('simulated write failure');}values.forEach((row,i)=>{self.rows[r+i-1]??=[];row.forEach((v,j)=>self.rows[r+i-1][c+j-1]=v);});return this;},clearContent(){for(let i=0;i<n;i++)for(let j=0;j<m;j++)if(self.rows[r+i-1])self.rows[r+i-1][c+j-1]='';return this;},setNumberFormat(){return this;},setFontFamily(){return this;},setWrap(){return this;}};}
  setFrozenRows(){}clearContents(){this.rows=[];}getName(){return this.name;}
 }
 function book(id){if(books[id])return books[id];const sheets=id==='db'?tables:{};return books[id]={getId:()=>id,getUrl:()=>`https://docs.google.com/spreadsheets/d/${id}`,getSheetByName:n=>sheets[n]||null,insertSheet(n){return sheets[n]=new Sheet(n);},getSheets:()=>Object.values(sheets),deleteSheet(){}};}
 function file(name,content=''){const id=crypto.randomUUID();return files[id]={id,name,content,trashed:false,viewers:[],getId(){return id;},getName(){return name;},getUrl(){return `https://drive.google.com/file/d/${id}/view`;},getBlob(){return {getDataAsString:()=>content,setName(){return this;}};},setTrashed(v){this.trashed=v;},addViewer(e){this.viewers.push(e);},moveTo(){return this;},getDateCreated(){return new Date();},makeCopy(n){return file(n,content);}};}
 function folder(name){const id=crypto.randomUUID();return folders[id]={getId:()=>id,createFile:(a,b)=>file(typeof a==='string'?a:a.name||'file',b||a.content||''),getFiles(){const list=Object.values(files).filter(f=>!f.trashed);let i=0;return {hasNext:()=>i<list.length,next:()=>list[i++]};}};}
 const ctx={console,Date,JSON,Math,Object,Array,Set,Map,String,Number,Boolean,RegExp,Error,isFinite,encodeURIComponent,
  PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]??null,setProperty(k,v){props[k]=String(v);return this;},setProperties(v){Object.assign(props,v);return this;},getProperties:()=>({...props})})},
  Session:{getActiveUser:()=>({getEmail:()=>email})},Utilities:{getUuid:()=>crypto.randomUUID(),DigestAlgorithm:{SHA_256:'sha'},Charset:{UTF_8:'utf8'},computeDigest:(a,s)=>Array.from(crypto.createHash('sha256').update(s).digest()),base64EncodeWebSafe:b=>Buffer.from(b).toString('base64url'),newBlob:(content,mime,name)=>({content,mime,name}),parseCsv(text){const out=[];let row=[],cell='',quote=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quote&&text[i+1]==='"'){cell+='"';i++;}else quote=!quote;}else if(c===','&&!quote){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quote){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);out.push(row);row=[];cell='';}else cell+=c;}if(cell||row.length){row.push(cell);out.push(row);}return out;}},
  LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
  SpreadsheetApp:{create:n=>book(Object.keys(books).length?'copy-'+crypto.randomUUID():'db'),openById:id=>book(id),flush(){}},
  DriveApp:{createFolder:folder,getFolderById:id=>{if(!folders[id])throw Error('folder missing');return folders[id];},getFileById:id=>{if(!files[id])throw Error('file missing');return files[id];}},
  UrlFetchApp:{fetch(){throw Error('network not configured in test');}},ScriptApp:{getOAuthToken:()=>'',getProjectTriggers:()=>[],newTrigger:()=>({timeBased(){return this;},everyDays(){return this;},atHour(){return this;},create(){return {};}})},MailApp:{sendEmail(){throw Error('email must stay disabled');},getRemainingDailyQuota:()=>0}
 };
 vm.createContext(ctx);const src=path.join(__dirname,'../src');if(fs.existsSync(src))for(const name of fs.readdirSync(src).filter(n=>n.endsWith('.gs')))vm.runInContext(fs.readFileSync(path.join(src,name),'utf8'),ctx,{filename:name});
 return {ctx,props,tables,files,setEmail:e=>email=e,failWrite:n=>failTable=n,reset:()=>{ctx.DB_TX_=null;},seed(table,records){ctx.writeRecords_(table,records);},all:table=>JSON.parse(JSON.stringify(ctx.readRecords_(table))),plain:x=>JSON.parse(JSON.stringify(x))};
}
module.exports={harness};
