const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('OAuth callback rejects unsolicited state and nonce before sending token to API',async()=>{
 for(const pair of [{saved:null,state:'attacker',nonce:'attacker'},{saved:'expected',state:'wrong',nonce:'expected'},{saved:'expected',state:'expected',nonce:'wrong'}]){
  let start,requests=0,cleared=false;const content={innerHTML:''};
  const token='header.'+Buffer.from(JSON.stringify({nonce:pair.nonce})).toString('base64url')+'.signature';
  const context={window:{},document:{addEventListener:(name,fn)=>{if(name==='DOMContentLoaded')start=fn;},getElementById:()=>content},console,URLSearchParams,atob,crypto:require('node:crypto').webcrypto,sessionStorage:{getItem:()=>pair.saved,removeItem:()=>{}},google:{script:{url:{getLocation:fn=>fn({hash:new URLSearchParams({id_token:token,state:pair.state}).toString()})},history:{replace:()=>{cleared=true;}}}},setTimeout,clearTimeout};
  vm.createContext(context);vm.runInContext(fs.readFileSync('src/Scripts.html','utf8').replace(/^<script>/,'').replace(/<\/script>\s*$/,''),context);
  context.window.ST.setTransport(()=>{requests++;});await start();assert.equal(requests,0);assert.equal(cleared,true);assert.match(content.innerHTML,/ไม่สามารถยืนยัน/);
 }
});

